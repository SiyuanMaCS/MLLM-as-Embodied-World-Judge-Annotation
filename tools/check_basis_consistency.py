#!/usr/bin/env python3
"""Pre-deploy gate: does leaderboard.md's stated basis agree with its own numbers?

Why this exists, and why checking the header is not enough
----------------------------------------------------------
refresh_leaderboard.py derives the header line from whichever bootstrap_ci.* file
it read (:125 _basis_line), but computes every cell against a HARDCODED
GOLD = bench/gold_875.jsonl (:18, passed to eval_metrics at :54). Nothing
reconciles the two. So a regeneration can emit a table whose header claims 855
while every number is 875 -- found by Ham 2026-07-30, verified by Yu from source
and by me against the live file.

That bug has been "fixed" once before in the wrong place: the docstring at
:128-131 records an earlier round where the header was hardcoded and the numbers
came from the CI file. The fix made the header follow the CI file. That inverted
which half lies; it did not make both halves share a source. So the header is
precisely the field one must not trust -- it is the half that was made agreeable.

Hence this gate does not read the header and stop. It cross-checks the header's
claimed basis against DISCRIMINATING VALUES -- judges whose PA-Pearson differs
between bases by far more than rounding:

    wbench_visual_plausibility   855 -> 0.354    875 -> 0.341
    phyjudge                     855 -> 0.355

A discriminating value is only useful while it discriminates. Rather than rely on
someone remembering to prune, the gate SELF-CHECKS that (Yu, 2026-07-30): each
judge's basis values must be at least MIN_SEP apart, or it is disqualified. An
entry with only one known basis value can CONFIRM but never DISCRIMINATE -- if
the table showed the other basis we would simply skip it -- so confirmers cannot
produce a pass on their own. If nothing discriminating survives, exit 4.

Otherwise this gate would quietly degrade into an always-true check while still
reporting green: the exact shape of the 19.5h dead page and of the 7-21 stale
board. DISCRIMINATORS records each value's provenance so a reader can re-derive
it instead of trusting this file.

Exit codes
    0  header and numbers agree, cross-checked by >=1 genuinely discriminating value
    2  MISMATCH: header claims one basis, numbers are from the other -> do not deploy
    3  the file or its header line could not be read
    4  UNVERIFIED: nothing with discriminating power was usable -> NOT a pass
    5  SKIPPED: the board declares itself SUPERSEDED -- deliberately not checked

Why 5 exists (Isabella, 2026-07-30): leaderboard.test_clean.md is a self-declaring
historical freeze ("SUPERSEDED (2026-07-27) ... Kept for history; do not cite").
It legitimately names two bases -- its own 856 and, as a pointer, the current
855 board -- so the ambiguity guard would flag it forever. **A permanently red
check is not a signal**, and worse, it would mask the bare-name 875 board, which
is the one that actually needs a decision (claims 875, its CI has no
_meta.n_gold_actual so it cannot be verified, carries no SUPERSEDED marker, and
is still being published). So a self-declared freeze is reported and skipped,
not failed -- while deploying one must still be refused, which predeploy.sh
enforces by treating 5 as a failure.
"""
import os
import re
import sys

# value_by_basis: basis label -> the PA-Pearson this judge shows on that basis.
# Provenance so these can be re-derived instead of trusted:
#   855: bench/results/leaderboard.test_clean_v2.md (Isabella b029b47, isolated-tree run)
#   875: eval_metrics.py --gold gold_875.jsonl, run by Ham 2026-07-30 (n=875, PA 0.3414)
DISCRIMINATORS = {
    "wbench_visual_plausibility": {"855": 0.354, "875": 0.341},
    "phyjudge": {"855": 0.355},
}

TOL = 0.0015      # half a unit of the 3-decimal precision the table prints
MIN_SEP = 0.005   # a pair of basis values must differ by at least this to discriminate at all

# The rule this gate uses to find the PA-Pearson column. stats.html's renderTable1
# binds the same column with /^pa[-·\s]*pearson$/i -- so this is a SECOND COPY of the
# page's rule, and a second copy of the thing under test is exactly what today's
# other findings were about. It cannot be shared (that side is JS), so instead the
# copy is made falsifiable: PAGE_RULE_RE below reads the page's own literal at check
# time and refuses to run if the two have drifted apart. Without that, this gate can
# validate a column the page no longer reads, and stay green while doing it.
PA_RULE = r"pa[-·\s]*pearson"
PAGE_RULE_RE = re.compile(r"colIdx\(/\^(.*?)\$/i\)")


def separation(by_basis):
    """Smallest gap between any two basis values, or None if fewer than two."""
    vals = sorted(by_basis.values())
    if len(vals) < 2:
        return None
    return min(b - a for a, b in zip(vals, vals[1:]))


SUPERSEDED_RE = re.compile(r"SUPERSEDED\s*\(?\s*(\d{4}-\d{2}-\d{2})?", re.I)


def header_text(text):
    """Everything before the first table row -- the header, by STRUCTURE not line count.

    Was `text.split("\n")[:8]`, a magic number. Ham hit the same shape from the
    other side on 2026-07-30: a window too NARROW reports "this file has no X",
    which reads as a fact rather than a conclusion and so gets believed and
    relayed without checking (his "that header has no basis declaration" was
    wrong, and Yu repeated it). A window too WIDE over-reports and gets audited;
    a window too narrow under-reports and gets cited.

    The header's boundary is not "some number of lines" -- it is where the table
    starts. Same principle as taking a threshold from a gap in the data rather
    than picking a round number: **let the boundary come from the structure of
    the thing measured, not from a guess.** The deployed board's basis line sits
    at line 2 with the first table row at line 12, so the old window had five
    lines of margin -- it worked, and would have failed silently on any longer
    preamble.
    """
    lines = text.split("\n")
    for i, line in enumerate(lines):
        if line.strip().startswith("|"):
            return "\n".join(lines[:i])
    return text


def superseded_marker(text):
    """Return the date string if the board declares itself superseded, else None."""
    head = header_text(text)
    m = SUPERSEDED_RE.search(head)
    if not m:
        return None
    return m.group(1) or "date not stated"


def basis_from_header(text):
    """Return the item count the header claims for THIS file, or None if not determinable.

    Fails closed on ambiguity. The first version searched for the string
    "test_clean_v2" as a fallback and so read leaderboard.test_clean.md -- whose
    header says "This is the 856-row test_clean basis. Current file:
    leaderboard.test_clean_v2.md (855 rows ...)" -- as basis 855. It matched a
    CROSS-REFERENCE TO ANOTHER FILE and reported it as this file's basis: the same
    mention-vs-instance confusion this tool exists to catch. So: collect every
    count the header states, and if they do not agree, refuse rather than pick one.
    """
    head = header_text(text)
    counts = set()
    counts.update(re.findall(r"\((\d{3,4})\s+in-domain items\)", head))
    counts.update(re.findall(r"(\d{3,4})[- ]row", head))
    counts.update(re.findall(r"\((\d{3,4})\s+rows", head))
    if len(counts) == 1:
        return counts.pop()
    if len(counts) > 1:
        print(f"FATAL: header states more than one item count {sorted(counts)} -- cannot tell "
              f"which is this file's basis (a cross-reference to another board?)")
        return None
    return None


def pa_column(text):
    """Map model name -> PA-Pearson float, binding the column BY HEADER NAME."""
    sec0 = text.split("\n## ")[0]
    rows = [l for l in sec0.split("\n") if l.strip().startswith("|")]
    if len(rows) < 2:
        return {}

    # Locate the header BY CONTENT and the data rows BY SHAPE, not by index.
    # This was rows[0] for the header and rows[2:] for the data -- i.e. "the first
    # pipe line is the header and exactly one separator follows it". A table with
    # no separator row would have silently dropped its first judge, which is the
    # under-reporting failure mode: a quiet wrong answer rather than a loud one.
    # Found by enumerating window/slice patterns across my own tools after Ham and
    # Isabella each did the same to theirs.
    def cells_of(line):
        return [c.strip() for c in line.strip("|").split("|")]

    def is_separator(line):
        return re.fullmatch(r"[\s|:-]+", line.strip()) is not None

    hdr_i = None
    for i, line in enumerate(rows):
        cells = cells_of(line)
        if any(c.lower() == "model" for c in cells):
            hdr_i = i
            break
    if hdr_i is None:
        return {}
    hdr = cells_of(rows[hdr_i])
    try:
        ix_model = next(i for i, h in enumerate(hdr) if h.lower() == "model")
        ix_pa = next(i for i, h in enumerate(hdr) if re.fullmatch(PA_RULE, h, re.I))
    except StopIteration:
        return {}

    out = {}
    for line in rows[hdr_i + 1:]:
        if is_separator(line):
            continue
        cells = cells_of(line)
        if len(cells) <= max(ix_model, ix_pa):
            continue
        name = cells[ix_model]
        raw = cells[ix_pa].replace("*", "").replace("−", "-").strip()
        try:
            out[name] = float(raw)
        except ValueError:
            continue
    return out


def page_coupling(md_path):
    """Is this gate still reading the same column stats.html reads?

    Returns (ok, detail). Not-ok is FATAL, never a pass: if the page's binding has
    moved, a green here means "the column I picked is consistent" about a column
    nobody sees. Absence of stats.html is also not-ok -- this gate only ever runs
    inside the frontend repo, so "not found" is a broken invocation, not a
    permissible skip.
    """
    d = os.path.abspath(os.path.dirname(md_path) or ".")
    page = None
    while True:
        cand = os.path.join(d, "stats.html")
        if os.path.isfile(cand):
            page = cand
            break
        parent = os.path.dirname(d)
        if parent == d:
            break
        d = parent
    if page is None:
        return False, "stats.html not found above %s -- cannot confirm this gate reads the page's column" % md_path
    try:
        html = open(page, encoding="utf-8").read()
    except OSError as exc:
        return False, "cannot read %s: %s" % (page, exc)

    rules = PAGE_RULE_RE.findall(html)
    if not rules:
        return False, "no colIdx(/^...$/i) bindings found in %s -- renderTable1 changed shape?" % page
    if PA_RULE in rules:
        print("READS: %s" % os.path.abspath(page))
        return True, "%s binds PA-Pearson with the same rule (%d bindings seen)" % (os.path.basename(page), len(rules))
    # Report what the page actually has, so the next person fixes the right half.
    near = [r for r in rules if "pearson" in r.lower()]
    return False, (
        "PA-Pearson rule drifted: this gate uses %r, %s has %s"
        % (PA_RULE, os.path.basename(page), near or rules)
    )


def main(path):
    # Declare what this gate opens, from the gate itself. predeploy.sh used to
    # infer this from its own argv, which named only the .md and so UNDERSTATED
    # the real dependency set once the coupling check started reading stats.html.
    # A self-report that is smaller than the truth is the quiet half of the fault
    # we spent the day on: overstating gets audited because it promises more,
    # understating just creates a blind spot nobody thinks to question.
    print("READS: %s" % os.path.abspath(path))

    ok, detail = page_coupling(path)
    print(("       coupling: " if ok else "FATAL: ") + detail)
    if not ok:
        return 3

    try:
        text = open(path, encoding="utf-8").read()
    except OSError as exc:
        print(f"FATAL: cannot read {path}: {exc}")
        return 3

    sup = superseded_marker(text)
    if sup is not None:
        print(f"SKIPPED: this board declares itself SUPERSEDED ({sup}).")
        print("Not checked: a historical freeze names both its own basis and, as a pointer, the")
        print("current board's -- so the ambiguity guard would flag it permanently, and a")
        print("permanently red check is not a signal. Do not deploy this file.")
        return 5

    claimed = basis_from_header(text)
    if claimed is None:
        print(f"FATAL: no basis statement found in the header of {path}")
        return 3
    print(f"header claims basis: {claimed}")

    values = pa_column(text)
    if not values:
        print("FATAL: could not parse the PA-Pearson column (header names changed?)")
        return 3

    # Self-check FIRST (Yu, 2026-07-30): a discriminating gate silently becomes an
    # always-true check the moment its values stop discriminating -- and stays green.
    # A judge with only one known basis value can CONFIRM but never DISCRIMINATE: if the
    # table showed the other basis we would just skip it. So confirmers must not be able
    # to produce a pass on their own.
    discriminating, mismatches, unusable = 0, [], []
    for judge, by_basis in DISCRIMINATORS.items():
        sep = separation(by_basis)
        if sep is None:
            unusable.append(f"{judge} (only one known basis value -- confirms, cannot discriminate)")
            continue
        if sep < MIN_SEP:
            unusable.append(
                f"{judge} (basis values {sorted(by_basis.values())} differ by {sep:.4f} "
                f"< MIN_SEP {MIN_SEP} -- no longer discriminating, DISQUALIFIED)")
            continue
        if judge not in values:
            unusable.append(f"{judge} (absent from table)")
            continue
        if claimed not in by_basis:
            unusable.append(f"{judge} (no reference value for basis {claimed})")
            continue
        got = values[judge]
        want = by_basis[claimed]
        discriminating += 1
        if abs(got - want) <= TOL:
            print(f"  OK   {judge}: {got} matches basis {claimed} ({want}); separation {sep:.4f}")
            continue
        other = [b for b, v in by_basis.items() if b != claimed and abs(got - v) <= TOL]
        hint = f" -- this is the basis-{other[0]} value" if other else ""
        mismatches.append(f"{judge}: table shows {got}, basis {claimed} expects {want}{hint}")

    for u in unusable:
        print(f"  skip {u}")

    if mismatches:
        print()
        print("MISMATCH -- header and numbers disagree about the basis. DO NOT DEPLOY:")
        for m in mismatches:
            print(f"  {m}")
        print()
        print("Likely cause: refresh_leaderboard.py derives the header from bootstrap_ci.*")
        print("but computes cells against a hardcoded GOLD=gold_875.jsonl. Regenerate via")
        print("the basis_plan.py isolated-tree flow, or make GOLD follow the resolved basis.")
        return 2

    if discriminating == 0:
        print()
        print("UNVERIFIED: no judge with genuine discriminating power was usable, so the basis")
        print("claim was NOT cross-checked. This is not a pass -- a check that cannot")
        print("distinguish the two bases would report green no matter which one produced the")
        print("numbers. Add a judge whose values differ across bases by >= MIN_SEP.")
        return 4

    print()
    print(f"basis consistent: header says {claimed}, cross-checked by {discriminating} "
          f"discriminating value(s)")
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1] if len(sys.argv) > 1 else "bench/leaderboard.md"))

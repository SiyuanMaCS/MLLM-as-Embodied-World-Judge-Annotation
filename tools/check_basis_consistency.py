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
"""
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


def separation(by_basis):
    """Smallest gap between any two basis values, or None if fewer than two."""
    vals = sorted(by_basis.values())
    if len(vals) < 2:
        return None
    return min(b - a for a, b in zip(vals, vals[1:]))


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
    head = "\n".join(text.split("\n")[:8])
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
    if len(rows) < 3:
        return {}
    hdr = [c.strip() for c in rows[0].strip("|").split("|")]
    try:
        ix_model = next(i for i, h in enumerate(hdr) if h.lower() == "model")
        ix_pa = next(i for i, h in enumerate(hdr) if re.fullmatch(r"pa[-·\s]*pearson", h, re.I))
    except StopIteration:
        return {}
    out = {}
    for line in rows[2:]:
        cells = [c.strip() for c in line.strip("|").split("|")]
        if len(cells) <= max(ix_model, ix_pa):
            continue
        name = cells[ix_model]
        raw = cells[ix_pa].replace("*", "").replace("−", "-").strip()
        try:
            out[name] = float(raw)
        except ValueError:
            continue
    return out


def main(path):
    try:
        text = open(path, encoding="utf-8").read()
    except OSError as exc:
        print(f"FATAL: cannot read {path}: {exc}")
        return 3

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

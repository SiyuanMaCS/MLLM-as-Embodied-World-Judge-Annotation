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

A discriminating value is only useful while it discriminates; DISCRIMINATORS
below records the source of each pair so a future reader can re-derive them
rather than trusting this file. If a judge's two-basis values ever converge,
it must be dropped from the table, not silently kept.

Exit codes
    0  header and numbers agree (or no discriminator present -- reported, not passed silently)
    2  MISMATCH: header claims one basis, numbers are from the other -> do not deploy
    3  the file or its header line could not be read
    4  no discriminator found in the table -> gate could not run, treat as unverified
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

TOL = 0.0015  # half a unit of the 3-decimal precision the table prints


def basis_from_header(text):
    """Return the item count the header claims, as a string, or None."""
    head = "\n".join(text.split("\n")[:8])
    m = re.search(r"\((\d+)\s+in-domain items\)", head)
    if m:
        return m.group(1)
    m = re.search(r"test_clean_v2", head)
    if m:
        return "855"
    m = re.search(r"gold_875", head)
    if m:
        return "875"
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

    checked, mismatches, unusable = 0, [], []
    for judge, by_basis in DISCRIMINATORS.items():
        if judge not in values:
            unusable.append(f"{judge} (absent from table)")
            continue
        if claimed not in by_basis:
            unusable.append(f"{judge} (no reference value for basis {claimed})")
            continue
        got = values[judge]
        want = by_basis[claimed]
        checked += 1
        if abs(got - want) <= TOL:
            print(f"  OK   {judge}: {got} matches basis {claimed} ({want})")
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

    if checked == 0:
        print()
        print("UNVERIFIED: no discriminating judge was usable, so the basis claim was not")
        print("cross-checked. Treat as not-verified rather than as a pass.")
        return 4

    print()
    print(f"basis consistent: header says {claimed} and {checked} discriminating value(s) agree")
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1] if len(sys.argv) > 1 else "bench/leaderboard.md"))

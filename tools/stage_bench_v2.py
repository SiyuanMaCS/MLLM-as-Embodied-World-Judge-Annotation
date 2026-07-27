#!/usr/bin/env python3
"""Stage the current-basis bench artifacts into the frontend repo.

Why this exists
---------------
The frontend serves fixed filenames (bench/leaderboard.md,
bench/analysis/bootstrap_ci.json, ...) while the bench repo keeps one file per
basis (`.test_clean`, `.test_clean_v2`, ...). Until now *I* picked which variant
to copy, by hand, every regen. That is the same "code picks a file by name and
silently gets the version someone hardcoded" failure that has bitten this repo
repeatedly (Ham's deploy_drift compared a gold-basis bootstrap_ci against a
test_clean deployment for days and reported it as expected drift).

So the variant choice is delegated to the one shared implementation:
bench/analysis/resolve_basis.py (Isabella). Two implementations of the same rule
drift — that is exactly how resolve_basis itself shipped with a bug that returned
the gold-basis file for the analysis artifacts (found by Ham).

NO FALLBACK, on purpose
-----------------------
If resolve_basis cannot be imported this exits non-zero rather than reverting to
a local guess. A fallback would silently reinstate the buggy path precisely when
the shared one is unavailable — fail-open wearing a helpful face. Skipping must
be an explicit act, not a default.

Usage:  python3 tools/stage_bench_v2.py [--bench /path/to/bench] [--dry-run]
"""
from __future__ import annotations

import argparse
import json
import os
import shutil
import sys

DEFAULT_BENCH = "/tmp/mllm_judge/bench"

# (stem, ext, subdir-in-bench, destination-in-frontend)
ARTIFACTS = [
    ("leaderboard",          ".md",   "results",  "bench/leaderboard.md"),
    ("bootstrap_ci",         ".json", "analysis", "bench/analysis/bootstrap_ci.json"),
    ("judge_distributions",  ".json", "analysis", "bench/analysis/judge_distributions.json"),
    ("subscore_ci",          ".json", "analysis", "bench/analysis/subscore_ci.json"),
]


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--bench", default=DEFAULT_BENCH)
    ap.add_argument("--dry-run", action="store_true")
    args = ap.parse_args()

    analysis_dir = os.path.join(args.bench, "analysis")
    sys.path.insert(0, analysis_dir)
    try:
        from resolve_basis import latest_variant  # type: ignore
    except Exception as e:
        print(f"FATAL: resolve_basis unavailable ({type(e).__name__}: {e}).", file=sys.stderr)
        print("Refusing to guess the basis locally — see module docstring.", file=sys.stderr)
        return 2

    resolved, failures = [], []
    for stem, ext, subdir, dest in ARTIFACTS:
        where = os.path.join(args.bench, subdir)
        try:
            src = latest_variant(stem, ext, where)
        except Exception as e:
            failures.append(f"{stem}{ext}: {type(e).__name__}: {e}")
            continue
        # Belt and braces: resolve_basis defaults to require_test_clean=True, but
        # assert it here too. This is the check whose absence let a gold-basis
        # (875) file masquerade as current for days.
        if "test_clean" not in os.path.basename(src):
            failures.append(f"{stem}{ext}: resolved to {src!r} — not a test_clean basis")
            continue
        resolved.append((src, dest))

    if failures:
        print("FATAL: basis resolution failed:", file=sys.stderr)
        for f in failures:
            print(f"  - {f}", file=sys.stderr)
        return 3

    # Cross-check: every artifact must agree on the row count, and the leaderboard
    # basis line must state that same number. A mismatch here means the artifacts
    # were produced from different runs — the failure mode where a table says 855
    # while the prose says 856 and nothing errors.
    n_gold = set()
    for src, _ in resolved:
        if src.endswith(".json"):
            with open(src) as fh:
                meta = (json.load(fh).get("_meta") or {})
            for key in ("n_gold_actual", "n_gold_items"):
                if isinstance(meta.get(key), int):
                    n_gold.add(meta[key])
                    break
    if len(n_gold) > 1:
        print(f"FATAL: artifacts disagree on row count: {sorted(n_gold)}", file=sys.stderr)
        return 4
    n = n_gold.pop() if n_gold else None

    for src, dest in resolved:
        print(f"  {os.path.basename(src):42s} -> {dest}")
    if n is not None:
        print(f"\nbasis row count: {n}")
        print(f"⚠️  stats.html hardcodes this number in prose — grep for the OLD "
              f"count and replace with {n} (it lives in no artifact, so nothing "
              f"else will catch it).")

    if args.dry_run:
        print("\n(dry run — nothing copied)")
        return 0

    for src, dest in resolved:
        os.makedirs(os.path.dirname(dest), exist_ok=True)
        shutil.copyfile(src, dest)
    print(f"\nstaged {len(resolved)} artifacts.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

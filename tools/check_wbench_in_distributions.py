#!/usr/bin/env python3
"""Acceptance gate for (A) — the judge_distributions recompute.

Passes only if wbench actually lands in the panel the page renders.
Two ways this fails, both real:
  * the recompute skipped the *judge* (not just the empty ia axis) -> wbench absent
  * wbench is present but without a usable pa.histogram -> page drops it silently

The filter is not re-implemented from memory: it is READ OUT of stats.html at run
time, so if the page's rule ever changes this gate reports drift instead of
quietly checking the wrong thing.

exit 0 = pass · 2 = wbench missing/unusable · 3 = page filter drifted · 4 = bad input
"""
import json, re, sys, pathlib

ROOT = pathlib.Path(__file__).resolve().parent.parent
HTML = ROOT / "stats.html"
DIST = ROOT / "bench/analysis/judge_distributions.json"
TARGET = "wbench_visual_plausibility"
EXPECT = 43

def main():
    if not HTML.exists() or not DIST.exists():
        print(f"FAIL(4): missing {HTML if not HTML.exists() else DIST}"); return 4
    html = HTML.read_text(errors="replace")

    # the page's own admission rule, lifted verbatim
    m = re.search(r"k\s*!==\s*'_meta'.*?d\[k\]\.pa\s*&&\s*d\[k\]\.pa\.histogram", html, re.S)
    if not m:
        print("FAIL(3): stats.html no longer filters on d[k].pa && d[k].pa.histogram")
        print("         -> the page's rule drifted; re-read it before trusting this gate")
        return 3
    print(f"READS: {HTML}  (filter found, {len(m.group(0))} chars)")
    print(f"READS: {DIST}")

    d = json.loads(DIST.read_text())
    admitted = [k for k in d
                if k not in ("_meta", "human_gold")
                and isinstance(d.get(k), dict)
                and isinstance(d[k].get("pa"), dict)
                and d[k]["pa"].get("histogram")]

    print(f"  admitted by the page's filter: {len(admitted)}  (expect {EXPECT})")
    print(f"  {TARGET} present: {TARGET in d}")
    if TARGET in d:
        pa = d[TARGET].get("pa") or {}
        print(f"  {TARGET}.pa.histogram non-empty: {bool(pa.get('histogram'))}")

    if TARGET not in admitted:
        why = "absent from the file" if TARGET not in d else "present but has no usable pa.histogram"
        print(f"FAIL(2): {TARGET} would NOT render — {why}")
        return 2

    # The page's filter only tests truthiness, and hist() on an empty axis returns
    # {'1':None,...,'5':None} -- a NON-empty dict. So an all-null pa histogram would
    # satisfy both the page and the check above, then render as an empty chart.
    # Admission is not the same as having something to draw.
    hist = d[TARGET]["pa"]["histogram"]
    if not any(v is not None for v in hist.values()):
        print(f"FAIL(5): {TARGET}.pa.histogram is all-null {hist}")
        print("         -> passes the page's truthiness filter but has nothing to plot")
        return 5

    # Structure present and non-null is still not enough. hist() bins on the integer
    # grid 1..5; a continuous-score judge (wbench: 666 distinct PA values, 0 of them
    # integers) yields {'1':0.0,...,'5':0.0} -- every value non-None, sums to 0.
    # A real distribution sums to 1. Isabella's dry run is the negative control.
    tot = sum(v for v in hist.values() if v is not None)
    if abs(tot - 1.0) > 0.01:
        print(f"FAIL(6): {TARGET}.pa.histogram sums to {tot:.4f}, expected ~1.0")
        print(f"         {hist}")
        print("         -> bars would render but carry no distribution "
              "(continuous scores fall off the integer 1..5 grid)")
        return 6
    if len(admitted) != EXPECT:
        print(f"FAIL(2): filter admits {len(admitted)}, expected {EXPECT}")
        return 2
    print("PASS: wbench renders and the panel shows 43")
    return 0

sys.exit(main())

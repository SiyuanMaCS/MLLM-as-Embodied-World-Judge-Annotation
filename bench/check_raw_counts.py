#!/usr/bin/env python3
"""Fail if NEW raw item counts appear in the surfaces siyuan ruled on (2026-07-21).

siyuan: "表格里 n 的这一条 什么 875 874 的 全给我删了".  That was carried out, and
then BOTH Isabella and I reintroduced such a number ~2h later while writing
unrelated text -- not by forgetting the instruction, but by not thinking of it
during the next action.  A note saying "re-scan next time" depends on the same
recall that already failed twice (Yu, msg 5704c33e), so this is a count-based
only-increases check meant to be run by an existing patrol, not by whoever
remembers.

SCOPE = the decided policy, deliberately no wider:
  - bench/leaderboard.md          (canonical copy served to readers)
  - the Table-1 footnote text hardcoded in stats.html
NOT the whole page.  ~82 further occurrences live in other stats.html panels
(confusion matrices, sub-score, CI, intro prose); they predate the instruction
and siyuan has not ruled on them.  Whitelisting those would launder "undecided"
into "approved", so they are simply out of scope and stay visible as undecided.

Counting, not diffing: the baseline is what is already there.  Only an INCREASE
fails, so pre-existing text is never flagged and never needs an exemption entry.
"""
import json, pathlib, re, sys

ROOT = pathlib.Path(__file__).resolve().parent.parent
PAT = re.compile(r'\b(875|874|873|871|870|776|762)\b')
# Exact line, not "contains gold_875.jsonl": an exemption must not be wider than
# its reason, so adding another number to this line stops matching and trips.
ALLOWED_LINES = {
    "Computed against `bench/gold_875.jsonl` (875 in-domain items).",
}
BASELINE = ROOT / "bench" / "raw_count_baseline.json"

def strip_comments(text):
    """Source comments are not reader-visible, so they must not count.

    The first version of this script flagged 3 of its own explanatory comments --
    the very defect (a matcher whose layer is wider than the claim) that CC and I
    had just spent an hour on.  What siyuan asked about is what a READER sees.
    """
    text = re.sub(r"/\*[\s\S]*?\*/", "", text)
    return "\n".join(re.sub(r"(?<!:)//.*$", "", ln) for ln in text.split("\n"))

def count(path, only_between=None):
    hits = []
    inside = only_between is None
    body = path.read_text(encoding="utf-8")
    if path.suffix in (".html", ".js"):
        body = strip_comments(body)
    for i, line in enumerate(body.split("\n"), 1):
        if only_between:
            if only_between[0] in line: inside = True
            elif only_between[1] in line: inside = False
        if not inside: continue
        if line.strip() in ALLOWED_LINES: continue
        for m in PAT.finditer(line):
            hits.append((path.name, i, m.group(1), " ".join(line.split())[:90]))
    return hits

def main():
    hits  = count(ROOT / "bench" / "leaderboard.md")
    hits += count(ROOT / "stats.html", only_between=("Table 1c", "renderJudgeDist"))
    cur = len(hits)
    base = json.loads(BASELINE.read_text())["count"] if BASELINE.exists() else 0
    if "--update-baseline" in sys.argv:
        BASELINE.write_text(json.dumps({"count": cur, "note":
            "raw item counts in the decided scope; only-increases guard"}, indent=2) + "\n")
        print(f"baseline set to {cur}"); return 0
    print(f"raw item counts in scope: {cur} (baseline {base})")
    if cur > base:
        print(f"FAIL: {cur - base} raw item count(s) newly introduced.")
        print("siyuan asked for these to be removed on 2026-07-21; this fires when they come back.")
        for h in hits: print(f"  {h[0]}:{h[1]}  '{h[2]}'  {h[3]}")
        return 1
    return 0

if __name__ == "__main__":
    sys.exit(main())

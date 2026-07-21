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
import datetime, hashlib, json, pathlib, re, sys

ROOT = pathlib.Path(__file__).resolve().parent.parent
NUMS = r"875|874|873|871|870|776|762"

# NARROW -- the shape siyuan actually removed: a PER-JUDGE / PER-ITEM denominator.
# Both real reintroductions match it ("vjepa n=776", "875 条里 270 条").
PAT = re.compile(rf"(?:\bn\s*(?:=|＝|\s+of\s+)\s*(?:{NUMS})\b)"
                 rf"|(?:(?:{NUMS})\s*(?:条里|条中|of\s+(?:{NUMS})))")

# WIDE -- any bare occurrence. Informational only, never a verdict: matching bare
# digits cannot tell "benchmark scale / methodology" (legitimate, e.g. "over 875
# in-domain items") from "per-judge denominator" (banned). Ham showed the wide
# form fires on a legitimate REWORD of a correct sentence (msg 53dfbb9b), and I
# edit these files constantly -- an alarm that cries wolf on correct text is the
# one that gets switched off, which is the outcome we spent all day avoiding.
WIDE = re.compile(rf"\b({NUMS})\b")
# Exact line, not "contains gold_875.jsonl": an exemption must not be wider than
# its reason, so adding another number to this line stops matching and trips.
ALLOWED_LINES = {
    "Computed against `bench/gold_875.jsonl` (875 in-domain items).",
}
BASELINE = ROOT / "bench" / "raw_count_baseline.json"

def strip_comments(text):
    """Source comments are not reader-visible, so they must not count.

    The first version flagged 3 of its own explanatory comments -- the very
    defect (a matcher whose layer is wider than the claim) that CC and I had
    just spent an hour on.  What siyuan asked about is what a READER sees.
    """
    text = re.sub(r"/\*[\s\S]*?\*/", "", text)
    return "\n".join(re.sub(r"(?<!:)//.*$", "", ln) for ln in text.split("\n"))

def scan(path, only_between=None):
    """Return a MULTISET {sha1(line): [count, sample_text]} of offending lines.

    Multiset, not a count and not a set -- Alice and Yu showed both weaker forms
    are blind (msgs e0ad31fc / 8aa77928):
      count : delete one + add one  -> total unchanged  -> silent pass
      set   : duplicate a line that already offends -> set unchanged -> silent pass
              ("copy an existing line" is the *easiest* way to reintroduce these,
               with ~82 of them sitting in other panels to copy from)
    Keyed on line CONTENT, never on line number -- line numbers drift (Yu used
    one two hours after arguing references must not drift).
    """
    hits = {}
    inside = only_between is None
    body = path.read_text(encoding="utf-8")
    if path.suffix in (".html", ".js"):
        body = strip_comments(body)
    for line in body.split("\n"):
        if only_between:
            if only_between[0] in line: inside = True
            elif only_between[1] in line: inside = False
        if not inside: continue
        stripped = line.strip()
        if stripped in ALLOWED_LINES: continue
        if not PAT.search(stripped): continue   # narrow: banned shape only
        h = hashlib.sha1(stripped.encode("utf-8")).hexdigest()[:16]
        if h in hits: hits[h][0] += 1
        else: hits[h] = [1, " ".join(stripped.split())[:100]]
    return hits

SCANNED = []

def provenance(path):
    """Record WHAT was scanned, so '0 matches' can never be read without also
    seeing which file produced it (Yu, msg 0388b96a).

    Isabella nearly reported '0 matches' from a three-week-old stale copy in
    /tmp, and caught it only by happening to glance at `ls -la`.  Same shape as
    my own '82' -- a number taken from an artifact whose provenance was never
    established.  Printing path + mtime + digest puts the count and its source
    on the same line, so nobody has to remember to ask.
    """
    st = path.stat()
    digest = hashlib.sha256(path.read_bytes()).hexdigest()[:12]
    mtime = datetime.datetime.fromtimestamp(st.st_mtime).strftime("%Y-%m-%d %H:%M")
    SCANNED.append(f"  scanned: {path}  mtime {mtime}  sha256 {digest}")

def collect():
    lb = ROOT / "bench" / "leaderboard.md"
    sh = ROOT / "stats.html"
    provenance(lb); provenance(sh)
    hits = scan(lb)
    for h, v in scan(sh, ("Table 1c", "renderJudgeDist")).items():
        if h in hits: hits[h][0] += v[0]
        else: hits[h] = v
    return hits

def wide_scan():
    """Informational only -- lines mentioning these numbers in any form."""
    out = []
    for path, between in ((ROOT / "bench" / "leaderboard.md", None),
                          (ROOT / "stats.html", ("Table 1c", "renderJudgeDist"))):
        body = path.read_text(encoding="utf-8")
        if path.suffix in (".html", ".js"): body = strip_comments(body)
        inside = between is None
        for line in body.split("\n"):
            if between:
                if between[0] in line: inside = True
                elif between[1] in line: inside = False
            if inside and WIDE.search(line) and line.strip() not in ALLOWED_LINES:
                out.append(" ".join(line.split())[:90])
    return out

def main():
    cur = collect()
    if "--update-baseline" in sys.argv:
        BASELINE.write_text(json.dumps(
            {"note": "multiset of reader-visible lines carrying raw item counts; "
                     "only ADDITIONS fail (siyuan 2026-07-21)",
             "hits": {h: v[0] for h, v in cur.items()},
             "samples": {h: v[1] for h, v in cur.items()}}, indent=2,
            ensure_ascii=False) + "\n")
        print("\n".join(SCANNED))
        print(f"baseline set: {sum(v[0] for v in cur.values())} occurrence(s), "
              f"{len(cur)} distinct line(s)")
        return 0
    base = json.loads(BASELINE.read_text())["hits"] if BASELINE.exists() else {}
    added = {h: v[0] - base.get(h, 0) for h, v in cur.items() if v[0] > base.get(h, 0)}
    total = sum(v[0] for v in cur.values())
    print("\n".join(SCANNED))
    print(f"raw item counts in scope: {total} occurrence(s), {len(cur)} distinct "
          f"(baseline {sum(base.values())}/{len(base)})")
    info = wide_scan()
    if info:
        print(f"informational: {len(info)} line(s) mention these numbers in some form "
              f"(NOT a verdict -- benchmark scale / methodology is legitimate):")
        for x in info[:5]: print(f"    {x}")
    if added:
        print(f"FAIL: {sum(added.values())} newly introduced occurrence(s).")
        print("siyuan asked for these to be removed on 2026-07-21; this fires when they come back.")
        for h, n in added.items():
            print(f"  +{n}x  {cur[h][1]}")
        return 1
    return 0

if __name__ == "__main__":
    sys.exit(main())

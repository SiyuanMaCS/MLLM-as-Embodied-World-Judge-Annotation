#!/usr/bin/env python3
"""Pre-deploy gate: the page's inline JavaScript must actually parse.

Why this exists
---------------
`stats.html:750` contained, inside a single-quoted JS string, the words
"the judge's own coverage". The apostrophe closed the string, the whole third
<script> block (~160k chars, holding nearly every render function) failed to
parse, and not one line of the page's JavaScript ran. Every panel sat at
"loading…" for 19.5 hours, across two further deploys that I signed off as
"verified live".

Nothing upstream caught it, because everything upstream asks a question the
failure does not answer:
    page fetch          -> HTTP 200        (skeleton serves fine)
    data files          -> HTTP 200        (data was never the problem)
    grep the served HTML -> text is there   (source text != executed script)
    byte-diff vs canonical -> identical     (identical to a broken file)
All four are green while the page is 100% dead.

Usage:
    python3 tools/check_inline_js.py stats.html
    python3 tools/check_inline_js.py --url https://…/stats.html
Exit non-zero on a parse failure, on a missing checker, or on an implausibly
small extraction.

Diagnostic order when the page is reported broken (@Yu): page 200 -> data files
200 -> live matches HEAD byte-for-byte. If all three pass and it is still dead,
run this. Today all three passed.

⚠️ Calling this through a pipe hides its exit code -- `… | tail` reports tail's
status, which is ~always 0, so a FATAL result reads as a pass. Verified:
naive pipe on the broken page gives 0; `set -o pipefail` gives 2; and
`${PIPESTATUS[0]}` gives 2. In CI use one of the latter two.
"""
from __future__ import annotations

import argparse
import re
import shutil
import subprocess
import sys
import tempfile
import urllib.request

SCRIPT_RE = re.compile(r"<script[^>]*>(.*?)</script>", re.S)

# A page that has lost its scripts entirely would extract to nothing and, with a
# naive gate, PASS -- the same "healthy and broken look identical" hole this
# file was written to close. So assert the extraction is plausible. stats.html
# carries ~160k chars across 3 blocks; anything near zero means the extraction
# broke (tag form changed, page truncated), not that the JS is fine.
MIN_BLOCKS = 1
MIN_CHARS = 1000


def load(src: str, is_url: bool) -> str:
    if is_url:
        req = urllib.request.Request(src, headers={"User-Agent": "check/1"})
        return urllib.request.urlopen(req, timeout=60).read().decode("utf-8", "replace")
    with open(src, encoding="utf-8", errors="replace") as fh:
        return fh.read()


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("target")
    ap.add_argument("--url", action="store_true", help="treat target as a URL")
    args = ap.parse_args()

    if not shutil.which("node"):
        print("FATAL: node not found — cannot verify the page parses. This is a "
              "failure, not a pass: an unchecked deploy is how the 19.5h outage "
              "shipped.", file=sys.stderr)
        return 3

    html = load(args.target, args.url)
    blocks = SCRIPT_RE.findall(html)
    total = sum(len(b) for b in blocks)
    print(f"inline <script> blocks: {len(blocks)}   chars: {total:,}")

    if len(blocks) < MIN_BLOCKS or total < MIN_CHARS:
        print(f"FATAL: extracted {len(blocks)} block(s) / {total} chars — below the "
              f"plausibility floor ({MIN_BLOCKS} / {MIN_CHARS}). Either the page "
              f"lost its scripts or this extractor is broken. Both must fail loudly: "
              f"an empty extraction otherwise parses clean and reads GREEN.",
              file=sys.stderr)
        return 4

    with tempfile.NamedTemporaryFile("w", suffix=".js", delete=False,
                                     encoding="utf-8") as fh:
        fh.write("\n;\n".join(blocks))
        path = fh.name

    try:
        proc = subprocess.run(["node", "--check", path], capture_output=True, text=True)
    except OSError as exc:
        print(f"FATAL: could not execute node ({exc}). The page was NOT checked; "
              f"this is a failure, not a pass.", file=sys.stderr)
        return 3

    if proc.returncode != 0:
        # Distinguish "the JavaScript is bad" from "the checker could not run".
        # shutil.which() above only catches node being ABSENT. A node that exists
        # but cannot execute -- a broken shim, a missing shared library, a wrong
        # architecture, no exec permission -- comes back non-zero with no parse
        # diagnostic, and the old code reported that as "inline JavaScript does not
        # parse". It failed safe (no false green) but MISDIAGNOSED: it sends the
        # reader to hunt a syntax error in a file that is fine. Found by testing
        # environment preconditions rather than logic, after Yu pointed out that
        # today's ledgers all measured old code and none measured the newly written.
        stderr = proc.stderr.strip()
        looks_like_parse_error = bool(
            re.search(r"SyntaxError|Unexpected (token|identifier|end of input)", stderr))
        if proc.returncode in (126, 127) or not looks_like_parse_error:
            print(f"FATAL: node exited {proc.returncode} without a parse diagnostic — the "
                  f"checker could not run, so the page was NOT verified. This is a "
                  f"failure, not a pass, and it is NOT evidence that the JavaScript is "
                  f"broken.", file=sys.stderr)
            if stderr:
                print(stderr[:600], file=sys.stderr)
            return 3

        print("FATAL: inline JavaScript does not parse. The page will serve with "
              "HTTP 200 and render nothing.\n", file=sys.stderr)
        print(stderr[:1200], file=sys.stderr)
        return 2

    print("inline JavaScript parses ✅")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

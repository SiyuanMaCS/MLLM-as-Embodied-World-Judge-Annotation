#!/usr/bin/env bash
# Run every pre-deploy gate and report each gate's TRUE exit code.
#
# Why this exists: I have hand-composed the gate runs three times and got the
# exit code wrong three times, always the same way --
#
#     python3 tools/check_x.py | head -4; echo "exit=$?"     # <-- reports head's status
#
# which printed a clean row of zeros while the real answers were 4/3/0. The
# lesson was already written in my notes each time, and being written down did
# not stop it. So the fix is not a fourth note: the pipeline is captured here
# once, correctly, and every gate run goes through it.
#
# Rules encoded, so no caller has to remember them:
#   * rc is captured on the line immediately after the command, never after a pipe
#   * output is written to a file and shown afterwards, so nothing needs piping
#   * a gate that cannot run (exit 3/4) is NOT a pass -- it fails this script
#   * exit codes are reported per gate, not collapsed into one boolean
#
# Usage:  tools/predeploy.sh [leaderboard_path]
# Exit :  0 = every gate passed, 1 = at least one gate failed or could not run

set -u
cd "$(dirname "$0")/.." || exit 1

LB="${1:-bench/leaderboard.md}"
tmp="$(mktemp -d)"
trap 'rm -rf "$tmp"' EXIT
failed=0

run_gate() {           # run_gate <label> <script> [args...]
    local label="$1"; shift
    # A gate that cannot be LAUNCHED must not be reported in the gate's own
    # vocabulary. Without this, deleting check_basis_consistency.py printed
    #     FAIL (2)  basis: header agrees with numbers
    # and 2 is that gate's code for "MISMATCH: header claims one basis, numbers
    # are from the other" -- a correct verdict (do not deploy) carrying a false
    # reason, which sends the reader to inspect a leaderboard that is fine.
    # Yu, 2026-07-30: a wrong diagnosis costs more than a wrong verdict, because
    # a correct verdict vouches for the wrong explanation and nobody re-checks it.
    # Found by breaking what this script depends on rather than what it reads.
    local script="$2"
    if [ ! -r "$script" ]; then
        printf '  CANNOT RUN  %s\n' "$label"
        printf '          gate script missing or unreadable: %s\n' "$script"
        printf '          This is NOT a finding about the page -- the check never ran.\n'
        failed=1
        return
    fi
    "$@" > "$tmp/out.txt" 2>&1
    local rc=$?         # immediately after the command; no pipe in between
    if [ "$rc" -eq 0 ]; then
        printf '  PASS  (%d)  %s\n' "$rc" "$label"
    else
        printf '  FAIL  (%d)  %s\n' "$rc" "$label"
        sed 's/^/          /' "$tmp/out.txt"
        failed=1
    fi
}

# What this script covers, stated by PATH rather than by FILE (Yu, 2026-07-30).
# Described by file -- "Isabella's assertions check leaderboard.md, this checks
# leaderboard.md" -- the two look redundant and somebody eventually deletes one.
# Described by path they are plainly complementary, and the seam between them is
# visible:
#   generator path   Isabella's prose-asserts run AT GENERATION: prose numbers vs the
#                    table they were generated with. Blind to a file edited by hand or
#                    carried in by a PR -- it simply never runs on those.
#   delivery path    this script runs AT DEPLOY: whatever the file is and wherever it
#                    came from, does its stated basis match its own numbers, and does
#                    the JS still parse. Blind to a generator that writes a consistent
#                    but wrong pair -- both sides agree and nothing looks off.
# HF PR #65 was the live case for the second: it shipped a .md directly, so the
# generation-time asserts could never have seen it, and this gate refused it (exit 4).
# => Report coverage by PATH. Reporting by FILE makes complementary checks read as
#    duplicates, and duplicates get "simplified" away -- after which the seam is
#    discovered the hard way.

echo "pre-deploy gates  (leaderboard: $LB)"
run_gate "inline JS parses"                 python3 tools/check_inline_js.py stats.html
run_gate "basis: header agrees with numbers" python3 tools/check_basis_consistency.py "$LB"

echo
if [ "$failed" -ne 0 ]; then
    echo "DO NOT DEPLOY -- at least one gate failed or could not run."
    echo "Note: exit 3 (cannot read), 4 (cannot verify) and 5 (superseded board) all count as"
    echo "failures here -- 5 is informational when auditing all boards, but deploying a"
    echo "self-declared historical freeze must never succeed."
    echo "A check that did not run must not be reported as a pass."
    exit 1
fi
echo "all gates passed -- safe to bump the data token and deploy"
echo
echo "AFTER DEPLOYING, two checks that are not optional:"
echo "  1. fetch twice: with a cache-buster (did I push?) and without (has the CDN turned over?)"
echo "  2. compare the sha of the file THIS SCRIPT VALIDATED against the file actually SERVED:"
echo "       sha256sum $LB"
echo "       curl -s <site>/$LB | sha256sum"
echo "     They must match. If they diverge, this gate is validating a file that no longer"
echo "     reaches users -- it will keep reporting green while checking the wrong artifact."
echo "     (Isabella/Ham, 2026-07-30: reading a function, knowing it is called, and knowing"
echo "      what it consumes are three independent facts. Five guards passed the first two and"
echo "      failed the third -- they watched a file nothing writes any more.)"
exit 0

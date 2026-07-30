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

run_gate() {           # run_gate <label> <cmd...>
    local label="$1"; shift
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
echo "after deploying, verify twice: with a cache-buster (did I push) and without (has the CDN turned over)"
exit 0

#!/usr/bin/env bash
# rotate_backend_url.sh — repoint the frontend at a new backend tunnel URL.
#
# WHY THIS EXISTS
# ---------------
# The backend is reached through a cloudflared *quick tunnel*
# (`cloudflared tunnel --url http://localhost:<port> --no-autoupdate`).
# A quick tunnel gets a NEW RANDOM subdomain every time it is restarted, and that
# URL is hard-coded inline in EVERY page:
#
#     <script>window.__APPS_SCRIPT_URL__ = "https://<random>.trycloudflare.com";</script>
#
# As of 2026-07-22 that line appears in 16 of 17 HTML files. So "restart the tunnel"
# is NOT a backend-only operation: without this rotation the whole site silently
# talks to a dead host — every fetch fails, and the pages render as if the user
# simply has no data. Nothing logs an error that a human would see.
#
# Recovery order after a tunnel restart / machine reboot:
#   1. backend up   (see the backend launch record — EWJ_* env vars are NOT on disk
#                    anywhere except the 600-perm capture files on the nvme disk)
#   2. cloudflared up, note the new https://...trycloudflare.com URL it prints
#   3. this script  ./rotate_backend_url.sh <new-url> --apply
#   4. push, then wait for GitHub Pages to rebuild
#
# NOTE the binary itself lives at /tmp/cloudflared, and /usr/lib/tmpfiles.d/tmp.conf
# declares `D /tmp` — systemd empties /tmp on boot. After a reboot the binary is gone
# too and must be re-downloaded before step 2.
#
# Dry run by default. Pass --apply to actually rewrite the files.

set -euo pipefail
cd "$(dirname "$0")"

NEW_URL="${1:-}"
APPLY="${2:-}"

if [[ -z "$NEW_URL" ]]; then
  echo "usage: $0 https://<new-subdomain>.trycloudflare.com [--apply]" >&2
  exit 2
fi
if [[ ! "$NEW_URL" =~ ^https://[A-Za-z0-9.-]+$ ]]; then
  echo "refusing: '$NEW_URL' is not a bare https origin (no trailing slash, no path)" >&2
  exit 2
fi

# Discover the current URL from the files rather than hard-coding it, so this script
# keeps working after the next rotation.
CUR="$(grep -ho 'window.__APPS_SCRIPT_URL__ = "[^"]*"' ./*.html \
       | sed 's/.*= "//; s/"$//' | sort -u)"
n_cur="$(printf '%s\n' "$CUR" | grep -c . || true)"

if [[ "$n_cur" -ne 1 ]]; then
  echo "refusing: expected exactly one distinct current URL, found $n_cur:" >&2
  printf '  %s\n' $CUR >&2
  exit 1
fi
if [[ "$CUR" == "$NEW_URL" ]]; then
  echo "no-op: all pages already point at $NEW_URL"; exit 0
fi

files=( $(grep -l '__APPS_SCRIPT_URL__' ./*.html) )
echo "current : $CUR"
echo "new     : $NEW_URL"
echo "files   : ${#files[@]}"

if [[ "$APPLY" != "--apply" ]]; then
  echo
  echo "(dry run — nothing written; re-run with --apply)"
  printf '  %s\n' "${files[@]}"
  exit 0
fi

sed -i "s|window.__APPS_SCRIPT_URL__ = \"$CUR\"|window.__APPS_SCRIPT_URL__ = \"$NEW_URL\"|" "${files[@]}"

# Verify rather than trust sed's exit status: count the pages that actually carry the
# new URL and assert none still carry the old one.
n_new="$(grep -l "window.__APPS_SCRIPT_URL__ = \"$NEW_URL\"" ./*.html | wc -l)"
n_old="$(grep -l "window.__APPS_SCRIPT_URL__ = \"$CUR\"" ./*.html | wc -l || true)"
echo "rewritten: $n_new pages now on the new URL; $n_old still on the old one"
if [[ "$n_new" -ne "${#files[@]}" || "$n_old" -ne 0 ]]; then
  echo "FAILED — inconsistent state, do NOT push; inspect with:" >&2
  echo "  grep -n '__APPS_SCRIPT_URL__' ./*.html" >&2
  exit 1
fi

cat <<'EOF'

Next:
  git add -A && git commit -m "chore: repoint frontend at new backend tunnel"
  git push
Then confirm the DEPLOYED copy, not this checkout:
  curl -s https://siyuanmacs.github.io/MLLM-as-Embodied-World-Judge-Annotation/task.html \
    | grep -o '__APPS_SCRIPT_URL__ = "[^"]*"'
(GitHub Pages lags a commit by up to a couple of minutes; this checkout matching
 origin/main does NOT prove the served page changed.)
EOF

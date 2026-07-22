# Bringing the annotation service back up

Everything below was verified by inspection of the running system on 2026-07-22.
This file lives in the repo on purpose: the working checkout is under `/tmp`, and
`/usr/lib/tmpfiles.d/tmp.conf` declares `D /tmp`, so **systemd empties `/tmp` on
boot** — a reboot removes the checkout, the `cloudflared` binary, and the running
processes together.

No secrets here. The two backend env *values* are stored on the nvme disk in two
600-perm files (Ham's `backend_launch_recovered.sh`, CC's
`rescue/backend_env_restore_20260722.env`); ask Ham or CC for the paths.

## What the pieces are

| piece | where | notes |
|---|---|---|
| backend | `python3 backend.py`, listens on `localhost:8787` | no `--reload`; code changes need a restart |
| tunnel | `/tmp/cloudflared tunnel --url http://localhost:8787 --no-autoupdate` | **quick tunnel** — new random subdomain on *every* start |
| frontend | GitHub Pages, this repo | the tunnel URL is inlined in **16 of 17** HTML files |

There are normally two `cloudflared` processes in `ps`. **Only the one pointing at
`:8787` is live.** The other (`--url http://localhost:8790`) is an orphan — nothing
listens on 8790. Confirm before you copy a command out of `ps`:

```sh
ss -ltnp | grep -E '8787|8790'      # 8787 -> python3 (the backend); 8790 -> nothing
```

## Order matters — and getting it wrong fails silently

The backend reads the tunnel URL **once**, at import (`backend.py:33`,
`PROXY_BASE = os.environ.get("EWJ_VIDEO_PROXY_BASE", ...)`) and never re-reads it.
So the tunnel must exist *before* the backend starts. Start them the other way round
and the backend pins a dead address, keeps running happily, and Chinese annotators
get no video — the proxy is the *primary* media path (`backend.py:32`, "Becomes
PRIMARY"), not a fallback. **Process health is not function health.**

1. **Get `cloudflared`.** After a reboot the binary is gone with the rest of `/tmp`.
   Re-download it, or keep a copy outside `/tmp`.
2. **Start the tunnel** and note the `https://<random>.trycloudflare.com` URL it prints:
   ```sh
   /tmp/cloudflared tunnel --url http://localhost:8787 --no-autoupdate
   ```
3. **Start the backend with that URL** and the other env vars (values in the two
   600-perm files above):
   ```sh
   EWJ_PREANNOT=1 EWJ_FINALIZERS=... EWJ_VIDEO_PROXY_BASE=https://<new>.trycloudflare.com \
     python3 backend.py
   ```
   `EWJ_PREANNOT` is not cosmetic: with it unset, `next_item` stops serving the 5183
   pre-annotated training items first (`backend.py:3404`), so nothing prefills. That
   was the original cause of "预标注完全没上线" (see the comment at `backend.py:195`).
4. **Repoint the frontend at the same URL** — it is the *same* string as
   `EWJ_VIDEO_PROXY_BASE`, one tunnel serves both:
   ```sh
   ./rotate_backend_url.sh https://<new>.trycloudflare.com --apply
   git commit -am "chore: repoint frontend at new backend tunnel" && git push
   ```
   ⚠️ `git push` with no remote override fails: the `origin` URL embeds an expired
   token which overrides the working `gh` credential. Push explicitly:
   ```sh
   git push https://github.com/SiyuanMaCS/MLLM-as-Embodied-World-Judge-Annotation.git HEAD:main
   ```

## Verify by function, not by process

`ps` showing three live processes proves nothing. Check the deployed page and a real
media fetch:

```sh
curl -s https://siyuanmacs.github.io/MLLM-as-Embodied-World-Judge-Annotation/task.html \
  | grep -o '__APPS_SCRIPT_URL__ = "[^"]*"'          # must be the NEW url
curl -s -o /dev/null -w '%{http_code}\n' "$URL/?action=stats&user=<you>"   # 200
```

For the media proxy, do **not** hand-write the `p=` parameter — the backend builds it
as `quote(url[len(HF_RESOLVE_BASE):], safe="")`, and a hand-made path returns a
perfectly ordinary `404` that looks like an answer rather than a mistake. Take a real
URL from an item instead, e.g. from `video_sources[].url`, and expect `206` with
`content-type: video/mp4`.

⚠️ Use a read-only endpoint to fetch a sample. **`?action=next` claims an item** for
whatever `user=` you pass, and it stays claimed until `CLAIM_TTL` (1800s) expires.

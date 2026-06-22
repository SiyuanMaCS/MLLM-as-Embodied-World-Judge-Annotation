/* Embodied World Judge — Annotation app.js
 * Phase 1: username + manifest-driven sample loop + localStorage cache.
 * Phase 2 (after Supabase creds): replace MANIFEST_URL fetch with /rpc/get_next_item,
 *   and replace submitAnnotation() with /rest/v1/annotations insert.
 */

const CFG = {
  // Filled at deploy by injecting <script>window.__APPS_SCRIPT_URL__="https://...";</script> in HTML.
  APPS_SCRIPT_URL: window.__APPS_SCRIPT_URL__ || null,
  HF_RESOLVE_BASE: "https://huggingface.co/datasets/HuggingFriends/mllm-as-embodied-world-judge/resolve/main",
  LS_USER: "ewj_annotator",
  LS_DONE: "ewj_done",  // optimistic local cache for UI counter
};

/* ---------- index.html: login ---------- */
function initLogin() {
  const form = document.getElementById("login-form");
  if (!form) return;
  const saved = localStorage.getItem(CFG.LS_USER);
  if (saved) document.getElementById("username").value = saved;
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const u = document.getElementById("username").value.trim();
    if (!/^[A-Za-z0-9_\-]{2,32}$/.test(u)) {
      showLoginMsg("Invalid handle — use 2–32 chars, letters/digits/_/-", true);
      return;
    }
    localStorage.setItem(CFG.LS_USER, u);
    window.location.href = "task.html";
  });
}
function showLoginMsg(text, isErr) {
  const el = document.getElementById("login-msg");
  if (!el) return;
  el.textContent = text;
  el.className = "msg " + (isErr ? "err" : "ok");
}

/* ---------- task.html: annotation loop ---------- */
let CURRENT = null;
let DONE_CACHE = new Set();

async function initTask() {
  const username = localStorage.getItem(CFG.LS_USER);
  if (!username) { window.location.href = "index.html"; return; }
  document.getElementById("who").textContent = username;
  DONE_CACHE = new Set(JSON.parse(localStorage.getItem(CFG.LS_DONE) || "[]"));
  document.getElementById("counter").textContent = DONE_CACHE.size;

  document.getElementById("logout-btn").addEventListener("click", () => {
    if (!confirm("Switch user? Local stats stay on this browser.")) return;
    localStorage.removeItem(CFG.LS_USER);
    window.location.href = "index.html";
  });

  for (const id of ["quality", "faithful"]) {
    const input = document.getElementById(id);
    const out = document.getElementById(id + "-out");
    input.addEventListener("input", () => { out.value = input.value; });
  }

  document.getElementById("annotate-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    await onSubmit(false);
  });
  document.getElementById("skip-btn").addEventListener("click", () => onSubmit(true));
  document.getElementById("retry-btn").addEventListener("click", () => loadNext());

  await refreshStats();
  await loadNext();
}

async function refreshStats() {
  if (!CFG.APPS_SCRIPT_URL) return;
  const user = localStorage.getItem(CFG.LS_USER);
  try {
    const url = `${CFG.APPS_SCRIPT_URL}?action=stats&user=${encodeURIComponent(user)}`;
    const res = await fetch(url);
    const data = await res.json();
    if (data && typeof data.done === "number") {
      document.getElementById("counter").textContent = `${data.done} / ${data.total}`;
    }
  } catch (err) {
    console.warn("stats fetch failed", err);
  }
}

async function loadNext() {
  hide("error"); hide("item"); show("loading");
  if (!CFG.APPS_SCRIPT_URL) {
    showError("Backend URL not configured (window.__APPS_SCRIPT_URL__ missing).");
    return;
  }
  const user = localStorage.getItem(CFG.LS_USER);
  try {
    const url = `${CFG.APPS_SCRIPT_URL}?action=next&user=${encodeURIComponent(user)}`;
    const res = await fetch(url);
    const data = await res.json();
    if (data.done) {
      showError("🎉 All done! Thank you — no more items for you.");
      return;
    }
    if (data.error) throw new Error(data.error);
    CURRENT = data;
    renderItem(CURRENT);
    hide("loading"); show("item");
  } catch (err) {
    showError("Failed to load next item: " + err.message);
  }
}

function renderItem(it) {
  document.getElementById("meta-model").textContent = it.model || "?";
  document.getElementById("meta-dataset").textContent = it.dataset || "?";
  document.getElementById("meta-task").textContent = it.task || "?";
  document.getElementById("meta-variant").textContent = it.variant || "?";
  document.getElementById("prompt-text").textContent = "(loading prompt…)";
  const gen = document.getElementById("gen-video");
  gen.src = absUrl(it.video_url);
  gen.load();
  const gtFig = document.getElementById("gt-fig");
  const gt = document.getElementById("gt-video");
  if (it.gt_url) {
    gt.src = absUrl(it.gt_url); gt.load();
    gtFig.hidden = false;
  } else {
    gt.removeAttribute("src");
    gtFig.hidden = true;
  }
  document.getElementById("notes").value = "";
  for (const id of ["quality", "faithful"]) {
    document.getElementById(id).value = 3;
    document.getElementById(id + "-out").value = 3;
  }
  // Fetch prompt.txt — sibling of the mp4 under prompt/prompt.txt
  fetchPrompt(it);
}

async function fetchPrompt(it) {
  let url = it.prompt_url || (it.video_url && it.video_url.replace(/[^\/]+\.mp4$/, "prompt/prompt.txt"));
  if (!url) { document.getElementById("prompt-text").textContent = "(no prompt)"; return; }
  try {
    const res = await fetch(absUrl(url));
    if (!res.ok) throw new Error("HTTP " + res.status);
    const text = await res.text();
    document.getElementById("prompt-text").textContent = text.trim() || "(empty prompt)";
  } catch (err) {
    document.getElementById("prompt-text").textContent = "(prompt load failed: " + err.message + ")";
  }
}

function absUrl(u) {
  if (!u) return "";
  if (/^https?:\/\//.test(u)) return u;
  return CFG.HF_RESOLVE_BASE + "/" + u.replace(/^\/+/, "");
}

async function onSubmit(skip) {
  if (!CURRENT) return;
  const body = {
    user: localStorage.getItem(CFG.LS_USER),
    item_id: CURRENT.id,
    payload: {
      skip,
      quality: skip ? null : Number(document.getElementById("quality").value),
      faithful: skip ? null : Number(document.getElementById("faithful").value),
      notes: skip ? null : document.getElementById("notes").value.trim(),
    },
  };
  try {
    await submitAnnotation(body);
    DONE_CACHE.add(CURRENT.id);
    localStorage.setItem(CFG.LS_DONE, JSON.stringify([...DONE_CACHE]));
    await refreshStats();
    await loadNext();
  } catch (err) {
    showError("Save failed: " + err.message);
  }
}

async function submitAnnotation(body) {
  if (!CFG.APPS_SCRIPT_URL) {
    console.warn("[stub] would save:", body);
    return;
  }
  // text/plain avoids CORS preflight on Apps Script Web App endpoints.
  const res = await fetch(CFG.APPS_SCRIPT_URL, {
    method: "POST",
    headers: { "Content-Type": "text/plain" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error("HTTP " + res.status);
  const data = await res.json();
  if (data && data.ok === false) throw new Error(data.error || "save failed");
}

function show(id) { const el = document.getElementById(id); if (el) el.hidden = false; }
function hide(id) { const el = document.getElementById(id); if (el) el.hidden = true; }
function showError(text) {
  document.getElementById("error-msg").textContent = text;
  hide("loading"); hide("item"); show("error");
}

/* ---------- entry ---------- */
document.addEventListener("DOMContentLoaded", () => {
  if (document.getElementById("login-form")) initLogin();
  if (document.getElementById("annotate-form")) initTask();
});

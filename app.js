/* Embodied World Judge — Annotation app.js
 * Phase 1: username + manifest-driven sample loop + localStorage cache.
 * Phase 2 (after Supabase creds): replace MANIFEST_URL fetch with /rpc/get_next_item,
 *   and replace submitAnnotation() with /rest/v1/annotations insert.
 */

const CFG = {
  // Fallback when Supabase creds missing — serves static manifest + localStorage only.
  MANIFEST_URL: "manifest.json",
  HF_RESOLVE_BASE: "https://huggingface.co/datasets/HuggingFriends/mllm-as-embodied-world-judge/resolve/main",
  // Filled at deploy by injecting <script>window.__SUPABASE_URL__="https://...";</script> in HTML.
  SUPABASE_URL: window.__SUPABASE_URL__ || null,
  SUPABASE_ANON_KEY: window.__SUPABASE_ANON_KEY__ || null,
  ANNOTATIONS_PER_ITEM: 3,  // how many annotators per item (matches RPC p_target default)
  LS_USER: "ewj_annotator",
  LS_DONE: "ewj_done",
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
let MANIFEST = [];
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

  await loadManifest();
  await loadNext();
}

async function loadManifest() {
  // Phase 1: static manifest.json shipped with the site.
  // Phase 2: replace with Supabase RPC get_next_item(user) — server picks for us.
  try {
    const res = await fetch(CFG.MANIFEST_URL, { cache: "no-store" });
    if (!res.ok) throw new Error("manifest fetch " + res.status);
    MANIFEST = await res.json();
  } catch (err) {
    showError("Failed to load manifest: " + err.message);
    throw err;
  }
}

async function loadNext() {
  hide("error"); hide("item"); show("loading");
  // Phase 1 picker — first item not in local done cache + skip already-annotated server-side.
  // Phase 2 — call supabase RPC get_next_item(user).
  CURRENT = pickNext();
  if (!CURRENT) {
    showError("No more items! You're done — thank you.");
    return;
  }
  renderItem(CURRENT);
  hide("loading"); show("item");
}

function pickNext() {
  for (const it of MANIFEST) {
    if (!DONE_CACHE.has(it.id)) return it;
  }
  return null;
}

function renderItem(it) {
  document.getElementById("meta-model").textContent = it.model || "?";
  document.getElementById("meta-dataset").textContent = it.dataset || "?";
  document.getElementById("meta-task").textContent = it.task || "?";
  document.getElementById("meta-variant").textContent = it.variant || "?";
  document.getElementById("prompt-text").textContent = it.prompt || "(no prompt)";
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
}

function absUrl(u) {
  if (!u) return "";
  if (/^https?:\/\//.test(u)) return u;
  return CFG.HF_RESOLVE_BASE + "/" + u.replace(/^\/+/, "");
}

async function onSubmit(skip) {
  if (!CURRENT) return;
  const payload = {
    user: localStorage.getItem(CFG.LS_USER),
    item_id: CURRENT.id,
    skip,
    quality: skip ? null : Number(document.getElementById("quality").value),
    faithful: skip ? null : Number(document.getElementById("faithful").value),
    notes: skip ? null : document.getElementById("notes").value.trim(),
    ts: new Date().toISOString(),
  };
  try {
    await submitAnnotation(payload);
    DONE_CACHE.add(CURRENT.id);
    localStorage.setItem(CFG.LS_DONE, JSON.stringify([...DONE_CACHE]));
    document.getElementById("counter").textContent = DONE_CACHE.size;
    await loadNext();
  } catch (err) {
    showError("Save failed: " + err.message);
  }
}

async function submitAnnotation(payload) {
  // Phase 1: log locally (placeholder).
  // Phase 2: POST to Supabase REST insert.
  if (CFG.SUPABASE_URL && CFG.SUPABASE_ANON_KEY) {
    const url = CFG.SUPABASE_URL + "/rest/v1/annotations";
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "apikey": CFG.SUPABASE_ANON_KEY,
        "Authorization": "Bearer " + CFG.SUPABASE_ANON_KEY,
        "Content-Type": "application/json",
        "Prefer": "return=minimal",
      },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error("HTTP " + res.status + " " + (await res.text()));
    return;
  }
  console.log("[stub] would save annotation:", payload);
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

/* Embodied World Judge — Annotation app.js */

const CFG = {
  APPS_SCRIPT_URL: window.__APPS_SCRIPT_URL__ || null,
  HF_RESOLVE_BASE: "https://huggingface.co/datasets/HuggingFriends/mllm-as-embodied-world-judge/resolve/main",
  LS_USER: "ewj_annotator",
  LS_ROLE: "ewj_role",
  LS_DONE: "ewj_done",
};

/* ---------- index.html: login + role ---------- */
function initLogin() {
  const form = document.getElementById("login-form");
  if (!form) return;

  // If already logged in with a role, fast-forward to task.html.
  const savedUser = localStorage.getItem(CFG.LS_USER);
  const savedRole = localStorage.getItem(CFG.LS_ROLE);
  if (savedUser && savedRole) {
    window.location.href = "task.html";
    return;
  }
  if (savedUser) document.getElementById("username").value = savedUser;

  const usernameInput = document.getElementById("username");
  const roleFieldset = form.querySelector("fieldset.role-row");
  let knownRole = null;  // set if backend confirms existing user

  // On username blur, probe backend for existing role.
  usernameInput.addEventListener("blur", async () => {
    const u = usernameInput.value.trim();
    knownRole = null;
    roleFieldset.classList.remove("known");
    if (!/^[A-Za-z0-9_\-]{2,32}$/.test(u) || !CFG.APPS_SCRIPT_URL) return;
    try {
      const res = await fetch(`${CFG.APPS_SCRIPT_URL}/?action=stats&user=${encodeURIComponent(u)}`);
      const data = await res.json();
      if (data.role) {
        knownRole = data.role;
        const radio = form.querySelector(`input[name="role"][value="${data.role}"]`);
        if (radio) radio.checked = true;
        roleFieldset.classList.add("known");
        showLoginMsg(`Welcome back, ${u} (role: ${data.role})`, false);
      } else {
        showLoginMsg("New annotator — pick a role to register.", false);
      }
    } catch (err) {
      console.warn("user probe failed", err);
    }
  });

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const u = usernameInput.value.trim();
    if (!/^[A-Za-z0-9_\-]{2,32}$/.test(u)) {
      showLoginMsg("Invalid handle — use 2–32 chars, letters/digits/_/-", true);
      return;
    }
    const selected = form.querySelector('input[name="role"]:checked');
    const role = knownRole || (selected && selected.value);
    if (!role) {
      showLoginMsg("Pick a role (Author or Contributor).", true);
      return;
    }
    try {
      if (!knownRole && CFG.APPS_SCRIPT_URL) {
        const res = await fetch(`${CFG.APPS_SCRIPT_URL}/?action=register&user=${encodeURIComponent(u)}&role=${encodeURIComponent(role)}`);
        const data = await res.json();
        if (!data.ok) throw new Error(data.error || "register failed");
      }
      localStorage.setItem(CFG.LS_USER, u);
      localStorage.setItem(CFG.LS_ROLE, role);
      window.location.href = "task.html";
    } catch (err) {
      showLoginMsg("Register failed: " + err.message, true);
    }
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

async function initTask() {
  const username = localStorage.getItem(CFG.LS_USER);
  const role = localStorage.getItem(CFG.LS_ROLE);
  if (!username || !role) { window.location.href = "index.html"; return; }
  document.getElementById("who").textContent = username;
  const roleEl = document.getElementById("role");
  if (roleEl) { roleEl.textContent = role; roleEl.dataset.role = role; }

  document.getElementById("logout-btn").addEventListener("click", () => {
    if (!confirm("Log out? Your handle/role stays registered on the server.")) return;
    localStorage.removeItem(CFG.LS_USER);
    localStorage.removeItem(CFG.LS_ROLE);
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
    const url = `${CFG.APPS_SCRIPT_URL}/?action=stats&user=${encodeURIComponent(user)}`;
    const res = await fetch(url);
    const data = await res.json();
    if (typeof data.today === "number") {
      document.getElementById("today").textContent = data.today;
      const quotaEl = document.getElementById("quota");
      if (quotaEl) quotaEl.textContent = data.quota ?? "—";
      const quotaBlock = quotaEl?.parentElement;
      if (quotaBlock && data.quota) {
        quotaBlock.classList.toggle("met", data.today >= data.quota);
      }
    }
  } catch (err) {
    console.warn("stats fetch failed", err);
  }
}

async function loadNext() {
  hide("error"); hide("item"); show("loading");
  if (!CFG.APPS_SCRIPT_URL) {
    showError("Backend URL not configured.");
    return;
  }
  const user = localStorage.getItem(CFG.LS_USER);
  try {
    const url = `${CFG.APPS_SCRIPT_URL}/?action=next&user=${encodeURIComponent(user)}`;
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
  document.getElementById("meta-dataset").textContent = it.dataset || "?";
  document.getElementById("meta-task").textContent = it.task || "?";
  // model name intentionally NOT shown — annotators should be blind.
  // Variant (prefix/rewrite) still shown so annotator knows what prompt the model received.
  const variant = (it.id || "").includes("_rewrite_") || (it.video_url || "").includes("_rewrite/")
    ? "rewrite"
    : ((it.id || "").includes("_prefix_") || (it.video_url || "").includes("_prefix/") ? "prefix" : "?");
  const variantEl = document.getElementById("meta-variant");
  if (variantEl) variantEl.textContent = "prompt: " + variant;
  document.getElementById("prompt-text").textContent = "(loading task instruction…)";
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
  fetchPrompt(it);
}

async function fetchPrompt(it) {
  // Original task instruction from gt_data — try instruction.txt first, fall back to prompt.txt.
  // generated_data path:  data/<ds>/generated_data/<model>/task_X/episode_X/1/<file>.mp4
  // → gt_data:            data/<ds>/gt_data/task_X/episode_X/prompt/{instruction.txt|prompt.txt}
  const base = it.video_url && it.video_url.replace(
    /generated_data\/[^\/]+\/(task_\d+)\/(episode_\d+)\/1\/[^\/]+\.mp4$/,
    "gt_data/$1/$2/prompt"
  );
  if (!base) { document.getElementById("prompt-text").textContent = "(no prompt)"; return; }
  for (const fname of ["instruction.txt", "prompt.txt"]) {
    try {
      const res = await fetch(`${base}/${fname}`);
      if (!res.ok) continue;
      const text = await res.text();
      document.getElementById("prompt-text").textContent = text.trim() || "(empty)";
      return;
    } catch (err) {
      // try next filename
    }
  }
  document.getElementById("prompt-text").textContent = "(prompt unavailable)";
}

function absUrl(u) {
  if (!u) return "";
  if (/^https?:\/\//.test(u)) return u;
  return CFG.HF_RESOLVE_BASE + "/" + u.replace(/^\/+/, "");
}

async function onSubmit(skip) {
  if (!CURRENT) return;
  const role = localStorage.getItem(CFG.LS_ROLE);
  const body = {
    user: localStorage.getItem(CFG.LS_USER),
    role,
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
  const res = await fetch(CFG.APPS_SCRIPT_URL + "/", {
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

/* ---------- dashboard.html ---------- */
async function initDashboard() {
  const root = document.getElementById("ann-table");
  if (!root) return;
  document.getElementById("refresh-btn").addEventListener("click", () => loadDashboard());
  await loadDashboard();
}

async function loadDashboard() {
  hide("dash-error");
  document.getElementById("ann-loading").hidden = false;
  document.getElementById("ann-table").hidden = true;
  try {
    const res = await fetch(`${CFG.APPS_SCRIPT_URL}/?action=progress`);
    const data = await res.json();
    document.getElementById("date").textContent = data.date || "—";
    document.getElementById("t-annotators").textContent = data.totals?.annotators ?? 0;
    document.getElementById("t-today").textContent = data.totals?.today ?? 0;
    document.getElementById("t-total").textContent = data.totals?.annotations ?? 0;

    const tbody = document.getElementById("ann-tbody");
    tbody.innerHTML = "";
    const anns = (data.annotators || []).slice().sort((a, b) => (b.today || 0) - (a.today || 0));
    for (const a of anns) {
      const tr = document.createElement("tr");
      const pct = a.quota ? Math.min(100, Math.round((a.today / a.quota) * 100)) : 0;
      const met = a.quota && a.today >= a.quota;
      tr.innerHTML = `
        <td><strong>${escapeHtml(a.user)}</strong></td>
        <td>${a.role ? `<span class="role-pill" data-role="${a.role}">${a.role}</span>` : '<span class="muted">—</span>'}</td>
        <td class="${met ? 'ok-text' : 'warn-text'}">${a.today ?? 0} / ${a.quota ?? '—'}</td>
        <td>
          <div class="progress-bar">
            <div class="progress-fill ${met ? 'met' : ''}" style="width:${pct}%"></div>
          </div>
        </td>
        <td>${a.total ?? 0}</td>
      `;
      tbody.appendChild(tr);
    }
    document.getElementById("ann-loading").hidden = true;
    document.getElementById("ann-table").hidden = false;
  } catch (err) {
    document.getElementById("dash-err-msg").textContent = err.message;
    show("dash-error");
  }
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, c => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  }[c]));
}

/* ---------- entry ---------- */
document.addEventListener("DOMContentLoaded", () => {
  if (document.getElementById("login-form")) initLogin();
  if (document.getElementById("annotate-form")) initTask();
  if (document.getElementById("ann-table")) initDashboard();
});

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

/* ---------- dashboard.html (grid view) ---------- */
async function initDashboard() {
  const root = document.getElementById("grid-table");
  if (!root) return;
  await loadDashboard();
  // Auto-refresh every 30s; pause when tab hidden.
  let timer = setInterval(() => {
    if (!document.hidden) loadDashboard();
  }, 30000);
}

async function loadDashboard() {
  hide("dash-error");
  // Only show the full "Loading…" curtain on the first fetch; subsequent
  // auto-refreshes update silently in-place.
  if (document.getElementById("grid-wrap").hidden) {
    document.getElementById("ann-loading").hidden = false;
  }
  try {
    const user = localStorage.getItem(CFG.LS_USER) || "";
    const url = `${CFG.APPS_SCRIPT_URL}/?action=progress${user ? `&user=${encodeURIComponent(user)}` : ""}`;
    const res = await fetch(url);
    const data = await res.json();
    document.getElementById("t-annotators").textContent = data.totals?.annotators ?? 0;
    document.getElementById("t-today").textContent = data.totals?.today ?? 0;
    document.getElementById("t-total").textContent = data.totals?.annotations ?? 0;
    // Show admin-vs-anon banner
    const banner = document.getElementById("view-mode");
    if (banner) {
      if (data.is_admin) {
        banner.textContent = "👁 Admin view — all real names";
        banner.className = "view-mode admin";
      } else if (user) {
        banner.textContent = `🔒 Anonymized view — only "${user}" (you) shown by real name; others labeled "Annotator N".`;
        banner.className = "view-mode anon";
      } else {
        banner.textContent = "🔒 Anonymized view — log in to see your own row by name.";
        banner.className = "view-mode anon";
      }
    }
    renderGrid(data);
    document.getElementById("ann-loading").hidden = true;
    document.getElementById("grid-wrap").hidden = false;
  } catch (err) {
    document.getElementById("dash-err-msg").textContent = err.message;
    show("dash-error");
  }
}

function renderGrid(data) {
  const days = data.days || [];
  const isAdmin = !!data.is_admin;
  const annotators = (data.annotators || []).slice().sort((a, b) => {
    const aNet = a.net ?? 0, bNet = b.net ?? 0;
    if (bNet !== aNet) return bNet - aNet;
    return (b.total ?? 0) - (a.total ?? 0);
  });

  const table = document.getElementById("grid-table");
  const thead = table.querySelector("thead");
  const tbody = table.querySelector("tbody");
  const tfoot = table.querySelector("tfoot");
  thead.innerHTML = "";
  tbody.innerHTML = "";
  tfoot.innerHTML = "";

  // Header row: "..." (sliding window) | day1 | day2 | ... | dayN | Net
  const trHead = document.createElement("tr");
  const thSliding = document.createElement("th");
  thSliding.className = "sliding";
  thSliding.title = "Sliding 7-day window — earlier days off-screen";
  thSliding.textContent = "…";
  trHead.appendChild(thSliding);
  for (let i = 0; i < days.length; i++) {
    const th = document.createElement("th");
    th.className = "day-col-head";
    th.textContent = formatDayLabel(days[i], i === days.length - 1);
    trHead.appendChild(th);
  }
  const thNet = document.createElement("th");
  thNet.className = "net-col-head";
  thNet.textContent = "Net";
  trHead.appendChild(thNet);
  thead.appendChild(trHead);

  // Data rows: one per annotator
  for (const a of annotators) {
    const tr = document.createElement("tr");
    if (a.is_self) tr.classList.add("self-row");
    const tdUser = document.createElement("td");
    tdUser.className = "user-cell";
    // Admin gets a role dropdown; everyone else sees a pill.
    const roleControl = isAdmin
      ? `<select class="role-select" data-target="${escapeHtml(a.user)}">
           <option value="author"${a.role === "author" ? " selected" : ""}>author</option>
           <option value="contributor"${a.role === "contributor" ? " selected" : ""}>contributor</option>
         </select>`
      : (a.role ? `<span class="role-pill" data-role="${a.role}">${a.role}</span>` : "");
    tdUser.innerHTML = `
      <div class="user-head">
        <span class="user-name">${escapeHtml(a.user)}${a.is_self ? ' <span class="you-badge">you</span>' : ''}</span>
        ${roleControl}
        <span class="quota-label">${a.quota ?? "—"}/day</span>
      </div>
    `;
    tr.appendChild(tdUser);
    // Wire change handler after element is in DOM
    if (isAdmin) {
      const sel = tdUser.querySelector(".role-select");
      sel.addEventListener("change", async (ev) => {
        const newRole = ev.target.value;
        const target = ev.target.dataset.target;
        const prevRole = a.role;
        ev.target.disabled = true;
        try {
          await setRoleAdmin(target, newRole);
          await loadDashboard();  // refresh
        } catch (err) {
          alert("Failed to set role: " + err.message);
          ev.target.value = prevRole;
          ev.target.disabled = false;
        }
      });
    }

    for (let i = 0; i < days.length; i++) {
      const cell = (a.week || [])[i];
      const td = document.createElement("td");
      td.className = "grid-cell";
      if (!cell || cell.count === 0) {
        td.classList.add("zero");
        td.textContent = "·";
      } else if (cell.met) {
        td.classList.add("met");
        td.textContent = String(cell.count);
      } else {
        td.classList.add("miss");
        td.textContent = String(cell.count);
      }
      if (cell) td.title = `${cell.date}: ${cell.count}/${a.quota ?? "?"} (delta ${cell.delta >= 0 ? "+" : ""}${cell.delta})`;
      tr.appendChild(td);
    }

    // Net cell at end of row
    const tdNet = document.createElement("td");
    tdNet.className = "net";
    const net = a.net ?? 0;
    if (net > 0) tdNet.innerHTML = `<span class="ok-text">+${net}</span>`;
    else if (net < 0) tdNet.innerHTML = `<span class="warn-text">${net}</span>`;
    else tdNet.innerHTML = `<span class="muted">0</span>`;
    tr.appendChild(tdNet);

    tbody.appendChild(tr);
  }
}

function formatDayLabel(iso, isToday) {
  if (!iso) return "—";
  const md = iso.slice(5);  // MM-DD
  return isToday ? `Today (${md})` : md;
}

async function setRoleAdmin(target, role) {
  const admin = localStorage.getItem(CFG.LS_USER) || "";
  const url = `${CFG.APPS_SCRIPT_URL}/?action=set_role&admin=${encodeURIComponent(admin)}&target=${encodeURIComponent(target)}&role=${encodeURIComponent(role)}`;
  const res = await fetch(url);
  const data = await res.json();
  if (!data.ok) throw new Error(data.error || "set_role failed");
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
  if (document.getElementById("grid-table")) initDashboard();
});

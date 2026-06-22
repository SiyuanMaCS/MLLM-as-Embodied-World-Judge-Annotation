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

  // If already logged in with a role, fast-forward to the right landing.
  const savedUser = localStorage.getItem(CFG.LS_USER);
  const savedRole = localStorage.getItem(CFG.LS_ROLE);
  if (savedUser && savedRole) {
    const isReviewer = savedRole === "reviewer" || savedUser === "masiyuan";
    window.location.href = isReviewer ? "reviewer_home.html" : "task.html";
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
      // Reviewers / admin land on the reviewer hub; regular users go straight to annotation.
      const isReviewer = role === "reviewer" || u === "masiyuan";
      window.location.href = isReviewer ? "reviewer_home.html" : "task.html";
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
  // Show reviewer banner if user is reviewer/admin (so they can jump to review/gold from this page).
  const reviewerBanner = document.getElementById("reviewer-banner");
  if (reviewerBanner && (role === "reviewer" || username === "masiyuan")) {
    reviewerBanner.hidden = false;
  }

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
  const reportBtn = document.getElementById("report-btn");
  if (reportBtn) {
    reportBtn.addEventListener("click", async () => {
      if (!CURRENT) return;
      if (!confirm("Report this item to a reviewer? (will be flagged as self-reported)")) return;
      try {
        await fetch(CFG.APPS_SCRIPT_URL + "/", {
          method: "POST",
          headers: { "Content-Type": "text/plain" },
          body: JSON.stringify({ report: true, user: username, item_id: CURRENT.id })
        });
        alert("Reported. Loading next item.");
        await loadNext();
      } catch (err) {
        alert("Report failed: " + err.message);
      }
    });
  }

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

  // Hide the "met-by-day" auxiliary block when admin; only show for non-admin.
  const metBlock = document.getElementById("met-by-day");
  if (metBlock) {
    if (isAdmin) {
      metBlock.hidden = true;
    } else {
      renderMetByDay(metBlock, days, annotators, data.met_by_date);
      metBlock.hidden = false;
    }
  }

  // Non-admin: render prominent self-summary banner above the grid.
  const selfBlock = document.getElementById("self-summary");
  if (selfBlock) {
    const me = annotators.find(a => a.is_self);
    if (!isAdmin && me) {
      renderSelfSummary(selfBlock, me);
      selfBlock.hidden = false;
    } else {
      selfBlock.hidden = true;
    }
  }

  // Non-admin: filter the main grid to ONLY self.
  const gridUsers = isAdmin ? annotators : annotators.filter(a => a.is_self);

  const table = document.getElementById("grid-table");
  const thead = table.querySelector("thead");
  const tbody = table.querySelector("tbody");
  const tfoot = table.querySelector("tfoot");
  thead.innerHTML = "";
  tbody.innerHTML = "";
  tfoot.innerHTML = "";

  // Header row: "..." (sliding window indicator) | day1 | day2 | ... | Today | Net
  const trHead = document.createElement("tr");
  const thSliding = document.createElement("th");
  thSliding.className = "sliding";
  thSliding.title = "Sliding 7-day window — earlier days off-screen";
  thSliding.textContent = "…";
  trHead.appendChild(thSliding);
  for (let i = 0; i < days.length; i++) {
    const th = document.createElement("th");
    th.className = "day-col-head";
    if (i === days.length - 1) th.classList.add("today-col-head");
    th.textContent = formatDayLabel(days[i], i === days.length - 1);
    trHead.appendChild(th);
  }
  const thNet = document.createElement("th");
  thNet.className = "net-col-head";
  thNet.textContent = "Net";
  trHead.appendChild(thNet);
  thead.appendChild(trHead);

  // Data rows: one per annotator (full list for admin; only self for non-admin)
  for (const a of gridUsers) {
    const tr = document.createElement("tr");
    if (a.is_self) tr.classList.add("self-row");

    // First cell: user info (name, role, quota if admin)
    const tdUser = document.createElement("td");
    tdUser.className = "user-cell";
    const isMaSiyuan = a.user === "masiyuan";
    const roleControl = isAdmin && !isMaSiyuan
      ? `<select class="role-select" data-target="${escapeHtml(a.user)}">
           <option value="author"${a.role === "author" ? " selected" : ""}>author</option>
           <option value="contributor"${a.role === "contributor" ? " selected" : ""}>contributor</option>
           <option value="reviewer"${a.role === "reviewer" ? " selected" : ""}>reviewer</option>
         </select>`
      : (a.role ? `<span class="role-pill" data-role="${a.role}">${a.role}</span>` : "");
    const quotaHTML = isAdmin
      ? `<span class="quota-label">${a.quota ?? "—"}/day</span>`
      : "";
    tdUser.innerHTML = `
      <div class="user-head">
        <span class="user-name">${escapeHtml(a.user)}${a.is_self ? ' <span class="you-badge">you</span>' : ''}</span>
        ${isMaSiyuan ? '<span class="role-pill" data-role="admin">admin</span>' : ''}
        ${roleControl}
        ${quotaHTML}
      </div>
    `;
    tr.appendChild(tdUser);
    if (isAdmin && !isMaSiyuan) {
      const sel = tdUser.querySelector(".role-select");
      sel.addEventListener("change", async (ev) => {
        const newRole = ev.target.value;
        const target = ev.target.dataset.target;
        const prevRole = a.role;
        ev.target.disabled = true;
        try {
          await setRoleAdmin(target, newRole);
          await loadDashboard();
        } catch (err) {
          alert("Failed to set role: " + err.message);
          ev.target.value = prevRole;
          ev.target.disabled = false;
        }
      });
    }

    // Day cells
    for (let i = 0; i < days.length; i++) {
      const cell = (a.week || [])[i];
      const td = document.createElement("td");
      td.className = "grid-cell";
      if (i === days.length - 1) td.classList.add("today-cell");
      const state = cell ? (cell.state || (cell.count === 0 ? "none" : (cell.met ? "met" : "below"))) : "none";
      const showNumbers = (isAdmin || a.is_self) && cell && typeof cell.count === "number";
      if (state === "none") {
        td.classList.add("zero");
        td.textContent = showNumbers && cell.count === 0 ? "·" : "";
      } else if (state === "met") {
        td.classList.add("met");
        if (showNumbers) {
          const sign = cell.delta >= 0 ? "+" : "";
          td.innerHTML = `<span class="cell-count">${cell.count}</span><span class="cell-delta">${sign}${cell.delta}</span>`;
        }
      } else {
        td.classList.add("miss");
        if (showNumbers) {
          const sign = cell.delta >= 0 ? "+" : "";
          td.innerHTML = `<span class="cell-count">${cell.count}</span><span class="cell-delta">${sign}${cell.delta}</span>`;
        }
      }
      if (cell && showNumbers) td.title = `${cell.date}: ${cell.count}/${a.quota ?? "?"} (delta ${cell.delta >= 0 ? "+" : ""}${cell.delta})`;
      tr.appendChild(td);
    }

    // Net cell at end of row
    const tdNet = document.createElement("td");
    tdNet.className = "net";
    const showNet = isAdmin || a.is_self;
    if (!showNet || a.net == null) {
      tdNet.innerHTML = `<span class="muted">·</span>`;
    } else {
      const net = a.net;
      if (net > 0) tdNet.innerHTML = `<span class="ok-text">+${net}</span>`;
      else if (net < 0) tdNet.innerHTML = `<span class="warn-text">−${Math.abs(net)}</span>`;
      else tdNet.innerHTML = `<span class="muted">0</span>`;
    }
    tr.appendChild(tdNet);

    tbody.appendChild(tr);
  }
}

function formatDayLabel(iso, isToday) {
  if (!iso) return "—";
  const md = iso.slice(5);  // MM-DD
  return isToday ? `Today (${md})` : md;
}

function renderSelfSummary(root, me) {
  const today = me.today ?? 0;
  const quota = me.quota ?? 0;
  const net = me.net ?? 0;
  const met = quota > 0 && today >= quota;
  const remaining = Math.max(0, quota - today);
  const netHTML = net > 0
    ? `<span class="ok-text">+${net}</span>`
    : (net < 0 ? `<span class="warn-text">−${Math.abs(net)}</span>` : `<span class="muted">0</span>`);
  root.innerHTML = `
    <div class="self-summary-row">
      <div class="self-stat ${met ? 'ok' : 'warn'}">
        <span class="self-num">${today}<span class="self-of">/${quota}</span></span>
        <span class="self-label">Today (${me.role ?? "—"})</span>
      </div>
      <div class="self-stat">
        <span class="self-num">${me.total ?? 0}</span>
        <span class="self-label">Total annotations</span>
      </div>
      <div class="self-stat">
        <span class="self-num">${netHTML}</span>
        <span class="self-label">Cumulative net</span>
      </div>
      <div class="self-msg">
        ${met
          ? `🎉 You're at ${today}/${quota} today — quota met!`
          : `Keep going — <strong>${remaining}</strong> more annotations to hit today's quota of ${quota}.`}
      </div>
    </div>
  `;
}

function capitalizeLabel(s) {
  // "author 3" → "Author 3", "admin 1" → "Admin 1", "You" → "You"
  if (!s) return s;
  return s.replace(/\b([a-z])/g, c => c.toUpperCase());
}

function renderMetByDay(root, days, annotators, metByDate) {
  // For each day, list anonymized labels of annotators who met quota that day.
  // Prefer server-provided `metByDate` (already anonymized with "You" label);
  // fall back to client-side computation from annotators[].week.
  root.innerHTML = "";
  const title = document.createElement("h3");
  title.textContent = "Who met daily quota";
  title.className = "met-title";
  root.appendChild(title);
  const ul = document.createElement("ul");
  ul.className = "met-list";
  for (let i = 0; i < days.length; i++) {
    const isToday = i === days.length - 1;
    const day = days[i];
    let winners;
    if (metByDate && Array.isArray(metByDate[day])) {
      winners = metByDate[day];
    } else {
      winners = annotators
        .filter(a => (a.week || [])[i]?.state === "met")
        .map(a => a.user);
    }
    const li = document.createElement("li");
    li.className = "met-row" + (isToday ? " today" : "");
    const dayLbl = isToday ? `Today (${day.slice(5)})` : day.slice(5);
    if (winners.length === 0) {
      li.innerHTML = `<span class="met-day">${dayLbl}</span><span class="met-empty">no one met yet</span>`;
    } else {
      const tags = winners.map(u => {
        const cls = (u === "You" || u === "you") ? "met-tag self" : "met-tag";
        return `<span class="${cls}">${escapeHtml(capitalizeLabel(u))}</span>`;
      }).join("");
      li.innerHTML = `<span class="met-day">${dayLbl}</span><span class="met-tags">${tags}</span>`;
    }
    ul.appendChild(li);
  }
  root.appendChild(ul);
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

/* ===================== Gold annotation page ===================== */
let GOLD_CURRENT = null;

async function initGold() {
  const username = localStorage.getItem(CFG.LS_USER);
  const role = localStorage.getItem(CFG.LS_ROLE);
  if (!username) { window.location.href = "index.html"; return; }
  document.getElementById("who").textContent = username;
  const roleEl = document.getElementById("role");
  if (roleEl) roleEl.textContent = role || "—";
  for (const id of ["quality", "faithful"]) {
    const inp = document.getElementById(id);
    const out = document.getElementById(id + "-out");
    inp.addEventListener("input", () => out.value = inp.value);
  }
  document.getElementById("annotate-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    await submitGold(false);
  });
  document.getElementById("skip-btn").addEventListener("click", () => submitGold(true));
  document.getElementById("retry-btn").addEventListener("click", () => loadNextGold());
  await loadNextGold();
}

async function loadNextGold() {
  hide("error"); hide("item"); show("loading");
  const user = localStorage.getItem(CFG.LS_USER);
  try {
    const res = await fetch(`${CFG.APPS_SCRIPT_URL}/?action=gold_next&user=${encodeURIComponent(user)}`);
    const data = await res.json();
    if (data.error) throw new Error(data.error);
    if (data.done) { showError("🎉 Your gold set is fully annotated!"); return; }
    GOLD_CURRENT = data;
    renderItem(data);  // re-use the regular item renderer
    hide("loading"); show("item");
  } catch (err) {
    showError("Failed to load gold item: " + err.message);
  }
}

async function submitGold(skip) {
  if (!GOLD_CURRENT) return;
  const user = localStorage.getItem(CFG.LS_USER);
  const body = {
    gold: true, user, item_id: GOLD_CURRENT.id,
    payload: {
      skip,
      quality: skip ? null : Number(document.getElementById("quality").value),
      faithful: skip ? null : Number(document.getElementById("faithful").value),
      notes: skip ? null : document.getElementById("notes").value.trim(),
    }
  };
  try {
    const res = await fetch(CFG.APPS_SCRIPT_URL + "/", {
      method: "POST",
      headers: { "Content-Type": "text/plain" },
      body: JSON.stringify(body)
    });
    const data = await res.json();
    if (data && data.ok === false) throw new Error(data.error || "save failed");
    await loadNextGold();
  } catch (err) {
    showError("Save failed: " + err.message);
  }
}

/* ===================== Review queue page ===================== */
let REVIEW_CURRENT = null;

async function initReview() {
  const username = localStorage.getItem(CFG.LS_USER);
  const role = localStorage.getItem(CFG.LS_ROLE);
  if (!username) { window.location.href = "index.html"; return; }
  document.getElementById("who").textContent = username;
  document.getElementById("role").textContent = role || "—";
  for (const id of ["m-quality", "m-faithful"]) {
    const inp = document.getElementById(id);
    const out = document.getElementById(id + "-out");
    inp.addEventListener("input", () => out.value = inp.value);
  }
  document.getElementById("approve-btn").addEventListener("click", () => submitReview("approve"));
  document.getElementById("modify-btn").addEventListener("click", () => {
    const fields = document.getElementById("modify-fields");
    if (fields.hidden) {
      const orig = REVIEW_CURRENT?.annotation || REVIEW_CURRENT?.annotation_payload || {};
      document.getElementById("m-quality").value = orig.quality ?? 3;
      document.getElementById("m-quality-out").value = orig.quality ?? 3;
      document.getElementById("m-faithful").value = orig.faithful ?? 3;
      document.getElementById("m-faithful-out").value = orig.faithful ?? 3;
      document.getElementById("m-notes").value = "";
      fields.hidden = false;
      document.getElementById("modify-btn").textContent = "Submit modify";
    } else {
      submitReview("modify");
    }
  });
  document.getElementById("skip-btn").addEventListener("click", () => loadNextReview());
  document.getElementById("retry-btn").addEventListener("click", () => loadNextReview());
  await loadNextReview();
}

async function loadNextReview() {
  hide("error"); hide("item"); show("loading");
  const user = localStorage.getItem(CFG.LS_USER);
  try {
    const res = await fetch(`${CFG.APPS_SCRIPT_URL}/?action=review_next&user=${encodeURIComponent(user)}`);
    const data = await res.json();
    if (data.error) throw new Error(data.error);
    if (data.done) { showError("🎉 No more review tasks in your queue."); return; }
    REVIEW_CURRENT = data;
    renderReviewItem(data);
    hide("loading"); show("item");
    // Reset modify panel
    document.getElementById("modify-fields").hidden = true;
    document.getElementById("modify-btn").textContent = "✏ Modify";
  } catch (err) {
    showError("Failed to load review task: " + err.message);
  }
}

function renderReviewItem(it) {
  document.getElementById("meta-kind").textContent = it.is_report ? "SELF-REPORTED" : "DAILY";
  document.getElementById("meta-dataset").textContent = it.dataset || "?";
  document.getElementById("meta-task").textContent = it.task || "?";
  document.getElementById("meta-self-report").hidden = !it.is_report;
  document.getElementById("gen-video").src = absUrl(it.video_url);
  document.getElementById("gen-video").load();
  document.getElementById("prompt-text").textContent = "(loading instruction…)";
  // Original annotator submission (annotator anon).
  // Backend field: `annotation` (was `annotation_payload` in my earlier draft).
  const payload = it.annotation || it.annotation_payload || {};
  document.getElementById("orig-quality").textContent = payload.quality ?? "—";
  document.getElementById("orig-faithful").textContent = payload.faithful ?? "—";
  document.getElementById("orig-notes").textContent = payload.notes || "(no notes)";
  fetchPrompt(it);
}

async function submitReview(decision) {
  if (!REVIEW_CURRENT) return;
  const reviewer = localStorage.getItem(CFG.LS_USER);
  // Backend uses `target` for the annotator being reviewed; `item_id` for item.
  const target = REVIEW_CURRENT.target || REVIEW_CURRENT.annotator;
  const item_id = REVIEW_CURRENT.item_id || REVIEW_CURRENT.id;
  const is_report = !!REVIEW_CURRENT.is_report;
  let payload = REVIEW_CURRENT.annotation || REVIEW_CURRENT.annotation_payload || {};
  if (decision === "modify") {
    payload = {
      quality: Number(document.getElementById("m-quality").value),
      faithful: Number(document.getElementById("m-faithful").value),
      notes: document.getElementById("m-notes").value.trim(),
    };
  }
  const body = { review_submit: true, reviewer, item_id, target, decision, payload, is_report };
  try {
    const res = await fetch(CFG.APPS_SCRIPT_URL + "/", {
      method: "POST",
      headers: { "Content-Type": "text/plain" },
      body: JSON.stringify(body)
    });
    const data = await res.json();
    if (data && data.ok === false) throw new Error(data.error || "submit failed");
    await loadNextReview();
  } catch (err) {
    showError("Review submit failed: " + err.message);
  }
}

/* ===================== My reviews page ===================== */
async function initMyReviews() {
  const user = localStorage.getItem(CFG.LS_USER);
  if (!user) { window.location.href = "index.html"; return; }
  document.getElementById("who").textContent = user;
  try {
    const [revRes, statsRes] = await Promise.all([
      fetch(`${CFG.APPS_SCRIPT_URL}/?action=my_reviews&user=${encodeURIComponent(user)}`),
      fetch(`${CFG.APPS_SCRIPT_URL}/?action=review_stats&user=${encodeURIComponent(user)}`),
    ]);
    const data = await revRes.json();
    const stats = await statsRes.json();
    document.getElementById("my-loading").hidden = true;
    // Summary
    const reviewed = stats?.reviewed ?? (data.reviews ?? []).length;
    const approved = stats?.approved ?? (data.reviews ?? []).filter(r => r.decision === "approve").length;
    const modified = stats?.modified ?? (data.reviews ?? []).filter(r => r.decision === "modify").length;
    const rate = stats?.approval_rate;
    document.getElementById("t-reviewed").textContent = reviewed;
    document.getElementById("t-approved").textContent = approved;
    document.getElementById("t-modified").textContent = modified;
    document.getElementById("t-rate").textContent = rate != null ? `${Math.round(rate * 100)}%` : "—";
    document.getElementById("my-summary").hidden = false;

    const list = data.reviews || [];
    if (list.length === 0) {
      document.getElementById("my-empty").hidden = false;
    } else {
      const ul = document.getElementById("my-list");
      ul.innerHTML = "";
      for (const r of list) {
        const li = document.createElement("li");
        li.className = "my-row " + (r.decision === "approve" ? "approved" : "modified");
        if (r.is_report) li.classList.add("self-reported");
        const reviewer = "Reviewer";  // anonymized
        const decision = r.decision === "approve" ? "✅ Approved" : "✏ Modified";
        const flag = r.is_report ? '<span class="self-flag">⚠ self-reported</span>' : '';
        const payloadHTML = (() => {
          const p = r.review_payload || r.payload || {};
          return `Q: ${p.quality ?? "—"} · F: ${p.faithful ?? "—"}${p.notes ? ` · ${escapeHtml(p.notes)}` : ""}`;
        })();
        const origHTML = (() => {
          const p = r.original_payload || {};
          if (r.decision !== "modify") return "";
          return `<div class="orig-line">Original — Q: ${p.quality ?? "—"} · F: ${p.faithful ?? "—"}${p.notes ? ` · ${escapeHtml(p.notes)}` : ""}</div>`;
        })();
        li.innerHTML = `
          <div class="my-line1">${decision} ${flag} <span class="muted">by ${reviewer} · ${r.created_at || ""}</span></div>
          <div class="my-line2">Item: <code>${escapeHtml(r.item_id || "")}</code></div>
          ${origHTML}
          <div class="my-line3">Reviewer payload — ${payloadHTML}</div>
        `;
        ul.appendChild(li);
      }
      ul.hidden = false;
    }
  } catch (err) {
    document.getElementById("my-loading").hidden = true;
    document.getElementById("my-err-msg").textContent = err.message;
    document.getElementById("my-error").hidden = false;
  }
}

/* ===================== Admin gold-review queue ===================== */
async function initAdminReview() {
  const admin = localStorage.getItem(CFG.LS_USER);
  if (!admin) { window.location.href = "index.html"; return; }
  document.getElementById("who").textContent = admin;
  try {
    const res = await fetch(`${CFG.APPS_SCRIPT_URL}/?action=gold_review_queue&admin=${encodeURIComponent(admin)}`);
    const data = await res.json();
    document.getElementById("adm-loading").hidden = true;
    if (data.error) throw new Error(data.error);
    const list = data.queue || [];
    if (list.length === 0) {
      document.getElementById("adm-empty").hidden = false;
      return;
    }
    const root = document.getElementById("adm-list");
    for (const r of list) {
      const card = document.createElement("section");
      card.className = "card adm-card";
      const p = r.payload || {};
      card.innerHTML = `
        <div class="meta"><span class="tag gold-tag">GOLD</span><span class="tag">${escapeHtml(r.dataset || "?")}</span><span class="tag">${escapeHtml(r.task || "?")}</span><span class="tag">by ${escapeHtml(r.reviewer || "?")}</span></div>
        <div class="video-row"><figure><figcaption>Generated</figcaption><video controls preload="metadata" muted playsinline src="${absUrl(r.video_url || "")}"></video></figure></div>
        <div class="prompt-box"><label>Reviewer payload</label><p>Q: <strong>${p.quality ?? "—"}</strong> · F: <strong>${p.faithful ?? "—"}</strong> · ${escapeHtml(p.notes || "(no notes)")}</p></div>
        <div class="form-row actions">
          <button type="button" class="approve-btn">✅ Approve as gold</button>
          <button type="button" class="modify-btn ghost">✏ Modify before confirming</button>
        </div>
        <div class="modify-panel" hidden>
          <label>Quality <input type="range" class="m-q" min="1" max="5" value="${p.quality ?? 3}"> <output class="m-q-out">${p.quality ?? 3}</output></label>
          <label>Faithful <input type="range" class="m-f" min="1" max="5" value="${p.faithful ?? 3}"> <output class="m-f-out">${p.faithful ?? 3}</output></label>
          <label>Notes <textarea class="m-n" rows="2">${escapeHtml(p.notes || "")}</textarea></label>
          <button type="button" class="m-submit">Confirm modified</button>
        </div>
      `;
      const mq = card.querySelector(".m-q"), mqo = card.querySelector(".m-q-out");
      mq.addEventListener("input", () => mqo.value = mq.value);
      const mf = card.querySelector(".m-f"), mfo = card.querySelector(".m-f-out");
      mf.addEventListener("input", () => mfo.value = mf.value);
      card.querySelector(".approve-btn").addEventListener("click", async () => {
        await adminGoldDecision(admin, r, "approve", null, card);
      });
      card.querySelector(".modify-btn").addEventListener("click", () => {
        card.querySelector(".modify-panel").hidden = false;
      });
      card.querySelector(".m-submit").addEventListener("click", async () => {
        await adminGoldDecision(admin, r, "modify", {
          quality: Number(mq.value), faithful: Number(mf.value), notes: card.querySelector(".m-n").value.trim()
        }, card);
      });
      root.appendChild(card);
    }
  } catch (err) {
    document.getElementById("adm-loading").hidden = true;
    document.getElementById("adm-err-msg").textContent = err.message;
    document.getElementById("adm-error").hidden = false;
  }
}

async function adminGoldDecision(admin, r, decision, payload, card) {
  try {
    const body = { gold_review: true, admin, item_id: r.item_id, target: r.reviewer, decision };
    if (payload) body.payload = payload;
    const res = await fetch(CFG.APPS_SCRIPT_URL + "/", {
      method: "POST", headers: { "Content-Type": "text/plain" }, body: JSON.stringify(body)
    });
    const data = await res.json();
    if (data && data.ok === false) throw new Error(data.error || "submit failed");
    card.style.opacity = "0.3";
    card.querySelector(".form-row.actions").innerHTML = `<p class="ok-text">✅ ${decision === "approve" ? "Approved" : "Modified"} & in gold library</p>`;
  } catch (err) {
    alert("Failed: " + err.message);
  }
}

/* ===================== Gold library (public) ===================== */
async function initGoldLibrary() {
  const form = document.getElementById("gl-filter");
  if (!form) return;
  form.addEventListener("submit", (e) => { e.preventDefault(); loadGoldLibrary(); });
  await loadGoldLibrary();
}

async function loadGoldLibrary() {
  hide("gl-empty"); hide("gl-error");
  document.getElementById("gl-loading").hidden = false;
  document.getElementById("gl-list").innerHTML = "";
  const qMin = document.getElementById("q-min").value;
  const fMin = document.getElementById("f-min").value;
  const qMax = document.getElementById("q-max").value;
  const fMax = document.getElementById("f-max").value;
  const qs = new URLSearchParams();
  qs.set("action", "gold_library");
  if (qMin) qs.set("quality_min", qMin);
  if (fMin) qs.set("faithful_min", fMin);
  if (qMax) qs.set("quality_max", qMax);
  if (fMax) qs.set("faithful_max", fMax);
  try {
    const res = await fetch(`${CFG.APPS_SCRIPT_URL}/?${qs.toString()}`);
    const data = await res.json();
    document.getElementById("gl-loading").hidden = true;
    if (data.error) throw new Error(data.error);
    const items = data.items || [];
    document.getElementById("gl-count").textContent = `${items.length} item(s)`;
    if (items.length === 0) { document.getElementById("gl-empty").hidden = false; return; }
    const root = document.getElementById("gl-list");
    for (const it of items) {
      const card = document.createElement("section");
      card.className = "card gl-card";
      const p = it.payload || {};
      card.innerHTML = `
        <div class="meta"><span class="tag gold-tag">GOLD</span><span class="tag">${escapeHtml(it.dataset || "?")}</span><span class="tag">${escapeHtml(it.task || "?")}</span></div>
        <div class="video-row"><figure><figcaption>Generated</figcaption><video controls preload="metadata" muted playsinline src="${absUrl(it.video_url || "")}"></video></figure></div>
        <p class="gl-scores">Quality: <strong>${p.quality ?? "—"}</strong> · Faithful: <strong>${p.faithful ?? "—"}</strong></p>
        <p class="muted">${escapeHtml(p.notes || "")}</p>
      `;
      root.appendChild(card);
    }
  } catch (err) {
    document.getElementById("gl-loading").hidden = true;
    document.getElementById("gl-err-msg").textContent = err.message;
    document.getElementById("gl-error").hidden = false;
  }
}

/* ---------- entry ---------- */
document.addEventListener("DOMContentLoaded", () => {
  if (document.getElementById("login-form")) initLogin();
  if (document.getElementById("annotate-form") && document.getElementById("report-btn")) initTask();
  else if (document.getElementById("annotate-form")) initGold();
  if (document.getElementById("review-form")) initReview();
  if (document.getElementById("my-list")) initMyReviews();
  if (document.getElementById("adm-list")) initAdminReview();
  if (document.getElementById("gl-filter")) initGoldLibrary();
  if (document.getElementById("grid-table")) initDashboard();
  if (document.getElementById("admin-review-card")) initReviewerHub();
});

function initReviewerHub() {
  const user = localStorage.getItem(CFG.LS_USER);
  const role = localStorage.getItem(CFG.LS_ROLE);
  if (!user) { window.location.href = "index.html"; return; }
  document.getElementById("who").textContent = user;
  document.getElementById("role").textContent = role || "—";
  // Show admin-only card if masiyuan.
  if (user === "masiyuan") {
    document.getElementById("admin-review-card").hidden = false;
  }
  document.getElementById("logout-btn").addEventListener("click", () => {
    if (!confirm("Log out?")) return;
    localStorage.removeItem(CFG.LS_USER);
    localStorage.removeItem(CFG.LS_ROLE);
    window.location.href = "index.html";
  });
}

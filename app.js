/* Embodied World Judge — Annotation app.js */

const CFG = {
  APPS_SCRIPT_URL: window.__APPS_SCRIPT_URL__ || null,
  HF_RESOLVE_BASE: "https://huggingface.co/datasets/HuggingFriends/mllm-as-embodied-world-judge/resolve/main",
  LS_USER: "ewj_annotator",
  LS_ROLE: "ewj_role",
  LS_DONE: "ewj_done",
};

/* ---------- index.html: login + role ---------- */
const CAMPAIGN_TARGET = 5000;

async function loadPublicProgress() {
  const root = document.getElementById("public-progress");
  if (!root || !CFG.APPS_SCRIPT_URL) return;
  try {
    const r = await fetch(`${CFG.APPS_SCRIPT_URL}/?action=progress`);
    const d = await r.json();
    const total = d?.totals?.annotations ?? 0;
    document.getElementById("pub-annotators").textContent = d?.totals?.annotators ?? 0;
    document.getElementById("pub-today").textContent = d?.totals?.today ?? 0;
    document.getElementById("pub-total").textContent = total;
    document.getElementById("pub-done").textContent = total;
    const pct = Math.min(100, Math.round(100 * total / CAMPAIGN_TARGET));
    document.getElementById("pub-pct").textContent = `(${pct}%)`;
    document.getElementById("pub-fill").style.width = pct + "%";
    root.hidden = false;
  } catch (err) { console.warn("public progress fetch failed", err); }
}

function initLogin() {
  const form = document.getElementById("login-form");
  if (!form) return;
  loadPublicProgress();

  // If already logged in with a role, refresh role from backend (admin may have changed it),
  // then fast-forward to the right landing.
  const savedUser = localStorage.getItem(CFG.LS_USER);
  const savedRole = localStorage.getItem(CFG.LS_ROLE);
  if (savedUser && savedRole) {
    fetch(`${CFG.APPS_SCRIPT_URL}/?action=stats&user=${encodeURIComponent(savedUser)}`)
      .then(r => r.json())
      .then(d => {
        const realRole = d?.role || savedRole;
        if (realRole !== savedRole) {
          console.log("role updated from server", savedRole, "→", realRole);
          localStorage.setItem(CFG.LS_ROLE, realRole);
        }
        window.location.href = "dashboard.html";
      })
      .catch(() => { window.location.href = "dashboard.html"; });
    return;
  }
  if (savedUser) document.getElementById("username").value = savedUser;

  const usernameInput = document.getElementById("username");

  // On username blur, probe backend; show a "welcome back" or "new user → contributor" hint.
  usernameInput.addEventListener("blur", async () => {
    const u = usernameInput.value.trim();
    if (!/^[A-Za-z0-9_\-]{2,32}$/.test(u) || !CFG.APPS_SCRIPT_URL) return;
    try {
      const res = await fetch(`${CFG.APPS_SCRIPT_URL}/?action=stats&user=${encodeURIComponent(u)}`);
      const data = await res.json();
      if (data.role) {
        showLoginMsg(`Welcome back, ${u} (role: ${data.role})`, false);
      } else {
        showLoginMsg("New annotator — you'll be registered as Contributor.", false);
      }
    } catch (err) { console.warn("user probe failed", err); }
  });

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const u = usernameInput.value.trim();
    if (!/^[A-Za-z0-9_\-]{2,32}$/.test(u)) {
      showLoginMsg("Invalid handle — use 2–32 chars, letters/digits/_/-", true);
      return;
    }
    try {
      // Probe server for existing role; new users default to contributor.
      let role = "contributor";
      if (CFG.APPS_SCRIPT_URL) {
        const probe = await fetch(`${CFG.APPS_SCRIPT_URL}/?action=stats&user=${encodeURIComponent(u)}`);
        const probeData = await probe.json();
        if (probeData?.role) {
          role = probeData.role;
        } else {
          // Register as default contributor.
          const reg = await fetch(`${CFG.APPS_SCRIPT_URL}/?action=register&user=${encodeURIComponent(u)}&role=contributor`);
          const regData = await reg.json();
          if (!regData.ok) throw new Error(regData.error || "register failed");
        }
      }
      localStorage.setItem(CFG.LS_USER, u);
      localStorage.setItem(CFG.LS_ROLE, role);
      window.location.href = "dashboard.html";
    } catch (err) {
      showLoginMsg("Login failed: " + err.message, true);
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
  let role = localStorage.getItem(CFG.LS_ROLE);
  if (!username || !role) { window.location.href = "index.html"; return; }
  // Refresh role from server (admin may have changed it).
  try {
    const r = await fetch(`${CFG.APPS_SCRIPT_URL}/?action=stats&user=${encodeURIComponent(username)}`);
    const d = await r.json();
    if (d?.role && d.role !== role) {
      localStorage.setItem(CFG.LS_ROLE, d.role);
      role = d.role;
    }
  } catch (err) { /* offline — fall through with cached role */ }
  document.getElementById("who").textContent = username;
  const roleEl = document.getElementById("role");
  if (roleEl) {
    const shown = displayRole(username, role);
    roleEl.textContent = shown;
    roleEl.dataset.role = shown;
  }
  // logout wired by wireGlobalChrome.

  for (const id of ["physical_adherence", "instruction_alignment"]) {
    const input = document.getElementById(id);
    const out = document.getElementById(id + "-out");
    if (input && out) input.addEventListener("input", () => { out.value = input.value; });
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
  for (const id of ["physical_adherence", "instruction_alignment"]) {
    const inp = document.getElementById(id);
    const out = document.getElementById(id + "-out");
    if (inp) inp.value = 3;
    if (out) out.value = 3;
  }
  for (const id of ["agent_consistency", "scene_consistency", "interaction_realism", "agent_match", "object_correct", "goal_completed"]) {
    const cb = document.getElementById(id);
    if (cb) cb.checked = false;
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
  const payload = { skip };
  if (!skip) {
    const notes = document.getElementById("notes").value.trim();
    if (!notes) { alert("Notes are required — please explain your reasoning."); return; }
    payload.physical_adherence = Number(document.getElementById("physical_adherence").value);
    payload.instruction_alignment = Number(document.getElementById("instruction_alignment").value);
    for (const id of ["agent_consistency", "scene_consistency", "interaction_realism", "agent_match", "object_correct", "goal_completed"]) {
      payload[id] = document.getElementById(id).checked ? 1 : 0;
    }
    payload.notes = notes;
  }
  const body = {
    user: localStorage.getItem(CFG.LS_USER),
    role,
    item_id: CURRENT.id,
    payload,
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
  // Top user-chip + role + logout (regular page top bar).
  const user = localStorage.getItem(CFG.LS_USER);
  let role = localStorage.getItem(CFG.LS_ROLE);
  // Refresh role from server (admin may have changed).
  try {
    const r = await fetch(`${CFG.APPS_SCRIPT_URL}/?action=stats&user=${encodeURIComponent(user || "")}`);
    const d = await r.json();
    if (d?.role && d.role !== role) { localStorage.setItem(CFG.LS_ROLE, d.role); role = d.role; }
  } catch (_) { /* fall through */ }
  // user-chip + logout wired by wireGlobalChrome on DOMContentLoaded; just set role pill here.
  const roleEl = document.getElementById("role");
  if (roleEl) {
    const shown = displayRole(user, role);
    roleEl.textContent = shown;
    roleEl.dataset.role = shown;
  }
  const isAdmin = user === "masiyuan";
  const isReviewer = role === "reviewer" && !isAdmin;
  // Reveal only the row matching this user's role; others stay hidden.
  const rowKey = isAdmin ? "admin" : (isReviewer ? "reviewer" : "annotator");
  document.querySelectorAll(".home-actions .action-row").forEach(r => {
    r.hidden = r.dataset.row !== rowKey;
  });
  document.querySelectorAll(".page-nav .reviewer-only").forEach(a => {
    if (rowKey !== "reviewer") a.style.display = "none";
  });
  document.querySelectorAll(".page-nav .admin-only").forEach(a => {
    if (!isAdmin) a.style.display = "none";
  });
  await loadDashboard();
  await loadBadges();
  let timer = setInterval(() => {
    if (!document.hidden) { loadDashboard(); loadBadges(); }
  }, 30000);
}

async function loadBadges() {
  const user = localStorage.getItem(CFG.LS_USER);
  if (!user || !CFG.APPS_SCRIPT_URL) return;
  let data, alignData;
  try {
    const [bRes, aRes] = await Promise.all([
      fetch(`${CFG.APPS_SCRIPT_URL}/?action=badges&user=${encodeURIComponent(user)}`),
      fetch(`${CFG.APPS_SCRIPT_URL}/?action=align_status&user=${encodeURIComponent(user)}`),
    ]);
    data = await bRes.json();
    alignData = await aRes.json();
  } catch (err) { console.warn("badges fetch failed", err); return; }
  if (!data || data.error) return;

  // Seen-diff counters: total minus last-seen total (stored per user in localStorage).
  const seenMy = Number(localStorage.getItem(`ewj_seen_myreviewed_${user}`) || 0);
  const seenGold = Number(localStorage.getItem(`ewj_seen_goldreviewed_${user}`) || 0);
  const myreviewedNew = Math.max(0, (data.myreviewed_total || 0) - seenMy);
  const goldreviewedNew = Math.max(0, (data.goldreviewed_total || 0) - seenGold);

  // Align badge: for reviewer/admin, show remaining items to annotate;
  // for admin only, show items still needing finalize after own annotations done.
  let alignBadge = 0;
  if (alignData && alignData.active) {
    const total = alignData.total ?? 50;
    const myRemain = Math.max(0, total - (alignData.my_done ?? 0));
    if (alignData.is_admin) {
      const adminFinalRemain = Math.max(0, total - (alignData.n_finalized ?? 0));
      alignBadge = Math.max(myRemain, adminFinalRemain);
    } else {
      alignBadge = myRemain;
    }
  }
  const map = {
    annotate:     data.annotate_remaining,
    myreviewed:   myreviewedNew,
    review:       data.review_pending,
    gold:         data.gold_remaining,
    goldreviewed: goldreviewedNew,
    goldreview:   data.goldreview_pending,
    align:        alignBadge,
  };
  document.querySelectorAll("[data-badge]").forEach(card => {
    const badge = card.querySelector(".ac-badge");
    if (!badge) return;
    const n = Number(map[card.dataset.badge] || 0);
    if (n <= 0) { badge.hidden = true; return; }
    badge.hidden = false;
    badge.textContent = n > 99 ? "99+" : String(n);
  });
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
    const aPct = a.total_pct ?? -1, bPct = b.total_pct ?? -1;
    if (bPct !== aPct) return bPct - aPct;
    return (b.total_done ?? b.total ?? 0) - (a.total_done ?? a.total ?? 0);
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

  // Header row: "..." (sliding window) | day1 ... today | Progress
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
  const thProgress = document.createElement("th");
  thProgress.className = "progress-col-head";
  thProgress.textContent = "Progress";
  trHead.appendChild(thProgress);
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
    const streakHTML = (isAdmin || a.is_self) && (a.streak ?? 0) > 0
      ? `<span class="streak-mini" title="连续打卡 ${a.streak} 天">连续 ${a.streak} 天</span>`
      : "";
    tdUser.innerHTML = `
      <div class="user-head">
        <span class="user-name">${escapeHtml(a.user)}</span>
        ${isMaSiyuan ? '<span class="role-pill" data-role="admin">admin</span>' : ''}
        ${roleControl}
        ${quotaHTML}
        ${streakHTML}
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

    // Day cells: count + deficit (BaiCiZhan-style "差 N" on miss days, ✓ on met)
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
        if (showNumbers) td.innerHTML = `<span class="cell-count">${cell.count}</span><span class="cell-flag">✓</span>`;
      } else {
        td.classList.add("miss");
        if (showNumbers) {
          const shortBy = Math.max(0, (a.quota ?? 0) - (cell.count || 0));
          td.innerHTML = `<span class="cell-count">${cell.count}</span><span class="cell-deficit">−${shortBy}</span>`;
        }
      }
      if (cell && showNumbers) td.title = `${cell.date}: ${cell.count}/${a.quota ?? "?"}`;
      tr.appendChild(td);
    }

    // Progress cell at end of row: done/target (pct%)
    const tdProgress = document.createElement("td");
    tdProgress.className = "progress-cell";
    const showProgress = isAdmin || a.is_self;
    const done = a.total_done, target = a.total_target, pct = a.total_pct;
    if (!showProgress || done == null || target == null) {
      tdProgress.innerHTML = `<span class="muted">·</span>`;
    } else {
      tdProgress.innerHTML = `
        <div class="progress-cell-wrap">
          <div class="progress-bar"><div class="progress-fill" style="width:${Math.min(100, pct ?? 0)}%"></div></div>
          <span class="progress-text">${done}/${target}<span class="muted"> (${pct ?? 0}%)</span></span>
        </div>`;
    }
    tr.appendChild(tdProgress);

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
  const met = quota > 0 && today >= quota;
  const remaining = Math.max(0, quota - today);
  const todayPct = quota > 0 ? Math.min(100, Math.round(100 * today / quota)) : 0;
  const done = me.total_done ?? me.total ?? 0;
  const target = me.total_target ?? 0;
  const pct = me.total_pct ?? (target > 0 ? Math.round(100 * done / target) : 0);
  const streak = me.streak ?? 0;
  const streakHTML = streak > 0
    ? `<span class="streak">连续打卡 <strong>${streak}</strong> 天</span>`
    : `<span class="streak streak-zero">今天开始连续打卡</span>`;
  root.innerHTML = `
    <div class="today-hero ${met ? 'met' : 'below'}">
      <div class="today-head">
        <span class="today-label">今日 (${me.role ?? "—"})</span>
        ${streakHTML}
      </div>
      <div class="today-num"><strong>${today}</strong><span class="today-of">/ ${quota}</span></div>
      <div class="progress-bar today-bar"><div class="progress-fill" style="width:${todayPct}%"></div></div>
      <div class="today-msg">
        ${met
          ? `<span class="ok-text">✓ 今日已达标</span>`
          : `<span class="warn-text">还差 <strong>${remaining}</strong> 条</span>`}
      </div>
    </div>
    <div class="total-progress">
      <div class="total-progress-head">
        <span class="total-label">总进度 (14 天目标)</span>
        <span class="total-num">${done}<span class="muted">/${target}</span> <span class="self-pct">(${pct}%)</span></span>
      </div>
      <div class="progress-bar total-bar"><div class="progress-fill" style="width:${Math.min(100, pct)}%"></div></div>
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
  if (roleEl) {
    const shown = displayRole(username, role);
    roleEl.textContent = shown;
    roleEl.dataset.role = shown;
  }
  // Role gate: only reviewer / admin can use gold annotation page.
  if (role !== "reviewer" && username !== "masiyuan") {
    renderRoleGate("审核员 (reviewer) / 管理员");
    return;
  }
  for (const id of ["physical_adherence", "instruction_alignment"]) {
    const inp = document.getElementById(id);
    const out = document.getElementById(id + "-out");
    if (inp && out) inp.addEventListener("input", () => out.value = inp.value);
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
  const payload = { skip };
  if (!skip) {
    const notes = document.getElementById("notes").value.trim();
    if (!notes) { alert("Notes are required — please explain your reasoning."); return; }
    payload.physical_adherence = Number(document.getElementById("physical_adherence").value);
    payload.instruction_alignment = Number(document.getElementById("instruction_alignment").value);
    for (const id of ["agent_consistency", "scene_consistency", "interaction_realism", "agent_match", "object_correct", "goal_completed"]) {
      payload[id] = document.getElementById(id).checked ? 1 : 0;
    }
    payload.notes = notes;
  }
  const body = { gold: true, user, item_id: GOLD_CURRENT.id, payload };
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
  const roleEl = document.getElementById("role");
  if (roleEl) {
    const shown = displayRole(username, role);
    roleEl.textContent = shown;
    roleEl.dataset.role = shown;
  }
  // Role gate: only reviewer / admin can use the review queue.
  if (role !== "reviewer" && username !== "masiyuan") {
    renderRoleGate("审核员 (reviewer) / 管理员");
    return;
  }
  for (const id of ["m-physical_adherence", "m-instruction_alignment"]) {
    const inp = document.getElementById(id);
    const out = document.getElementById(id + "-out");
    if (inp && out) inp.addEventListener("input", () => out.value = inp.value);
  }
  document.getElementById("approve-btn").addEventListener("click", () => submitReview("approve"));
  document.getElementById("modify-btn").addEventListener("click", () => {
    const fields = document.getElementById("modify-fields");
    if (fields.hidden) {
      const orig = REVIEW_CURRENT?.annotation || REVIEW_CURRENT?.annotation_payload || {};
      for (const id of ["physical_adherence", "instruction_alignment"]) {
        const v = orig[id] ?? 3;
        document.getElementById("m-" + id).value = v;
        document.getElementById("m-" + id + "-out").value = v;
      }
      for (const id of ["agent_consistency", "scene_consistency", "interaction_realism", "agent_match", "object_correct", "goal_completed"]) {
        document.getElementById("m-" + id).checked = !!orig[id];
      }
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
  document.getElementById("orig-physical_adherence").textContent = payload.physical_adherence ?? payload.quality ?? "—";
  document.getElementById("orig-instruction_alignment").textContent = payload.instruction_alignment ?? payload.faithful ?? "—";
  const psubs = ["agent_consistency","scene_consistency","interaction_realism"].map(k => `${k.split("_")[0]}=${payload[k] ?? "—"}`).join(", ");
  const isubs = ["agent_match","object_correct","goal_completed"].map(k => `${k.split("_")[0]}=${payload[k] ?? "—"}`).join(", ");
  document.getElementById("orig-psubs").textContent = psubs;
  document.getElementById("orig-isubs").textContent = isubs;
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
    const notes = document.getElementById("m-notes").value.trim();
    if (!notes) { alert("Modification note is required."); return; }
    payload = {
      physical_adherence: Number(document.getElementById("m-physical_adherence").value),
      instruction_alignment: Number(document.getElementById("m-instruction_alignment").value),
      notes,
    };
    for (const id of ["agent_consistency","scene_consistency","interaction_realism","agent_match","object_correct","goal_completed"]) {
      payload[id] = document.getElementById("m-" + id).checked ? 1 : 0;
    }
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
  // Optional ?kind=gold filter — shows only gold-meta-reviewed entries.
  const kindFilter = new URLSearchParams(window.location.search).get("kind");
  if (kindFilter === "gold") {
    const h1 = document.querySelector("header.bar h1");
    if (h1) h1.textContent = "Gold reviewed";
  }
  try {
    const [revRes, statsRes] = await Promise.all([
      fetch(`${CFG.APPS_SCRIPT_URL}/?action=my_reviews&user=${encodeURIComponent(user)}${kindFilter ? `&kind=${encodeURIComponent(kindFilter)}` : ""}`),
      fetch(`${CFG.APPS_SCRIPT_URL}/?action=review_stats&user=${encodeURIComponent(user)}${kindFilter ? `&kind=${encodeURIComponent(kindFilter)}` : ""}`),
    ]);
    const data = await revRes.json();
    const stats = await statsRes.json();
    // Client-side fallback filter when backend doesn't honor &kind.
    if (kindFilter === "gold" && Array.isArray(data.reviews)) {
      data.reviews = data.reviews.filter(r => r.kind === "gold");
    }
    // Mark current total as seen so the home-card badge clears.
    try {
      const total = (data.reviews || []).length;
      const key = kindFilter === "gold"
        ? `ewj_seen_goldreviewed_${user}`
        : `ewj_seen_myreviewed_${user}`;
      localStorage.setItem(key, String(total));
    } catch (_) {}
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
        ul.appendChild(renderReviewRow(r));
      }
      ul.hidden = false;
    }
  } catch (err) {
    document.getElementById("my-loading").hidden = true;
    document.getElementById("my-err-msg").textContent = err.message;
    document.getElementById("my-error").hidden = false;
  }
}

/* Build one review-history row with a click-to-expand detail panel. */
function renderReviewRow(r) {
  const li = document.createElement("li");
  const isApprove = r.decision === "approve";
  li.className = "my-row " + (isApprove ? "approved" : "modified");
  if (r.is_report) li.classList.add("self-reported");
  const reviewer = r.reviewer_label || "Reviewer";
  const decisionLbl = isApprove ? "✅ Approved" : "✏ Modified";
  const kindBadge = r.kind === "gold" ? '<span class="row-badge gold">GOLD</span>' : "";
  const reportBadge = r.is_report ? '<span class="row-badge report">⚠ self-reported</span>' : "";
  const ts = r.ts || r.created_at || "";
  const fin = r.final || r.review_payload || r.payload || {};
  const orig = r.original || r.original_payload || {};
  // Field-level diff helpers across new 8-field schema (fallback to legacy quality/faithful).
  const physChanged = !isApprove && (fin.physical_adherence ?? fin.quality) !== (orig.physical_adherence ?? orig.quality);
  const instChanged = !isApprove && (fin.instruction_alignment ?? fin.faithful) !== (orig.instruction_alignment ?? orig.faithful);
  const nChanged = !isApprove && (orig.notes || "") !== (fin.notes || "");
  const subsP = ["agent_consistency","scene_consistency","interaction_realism"];
  const subsI = ["agent_match","object_correct","goal_completed"];
  function subBadges(p, keys) {
    return keys.map(k => {
      const v = p[k];
      if (v === undefined || v === null) return "";
      return `<span class="sub-badge ${v ? "yes" : "no"}" title="${k}">${v ? "✓" : "✗"} ${k.replace(/_/g," ")}</span>`;
    }).join("");
  }

  li.innerHTML = `
    <header class="row-head">
      <span class="row-decision">${decisionLbl}</span>
      ${kindBadge}${reportBadge}
      <span class="row-meta">${escapeHtml(r.dataset || "?")} · ${escapeHtml(r.task || "?")}</span>
      <span class="row-spacer"></span>
      <span class="row-by muted">by ${escapeHtml(reviewer)}</span>
      <time class="row-ts muted">${escapeHtml(ts)}</time>
      <span class="row-chev" aria-hidden="true">▾</span>
    </header>
    <div class="row-detail" hidden>
      <div class="detail-grid">
        <div class="detail-card detail-orig">
          <h4>Your submission</h4>
          <p>Physical: <strong>${orig.physical_adherence ?? orig.quality ?? "—"}</strong> · Instruction: <strong>${orig.instruction_alignment ?? orig.faithful ?? "—"}</strong></p>
          <p class="sub-line">${subBadges(orig, subsP)}${subBadges(orig, subsI)}</p>
          ${orig.notes ? `<p class="notes">${escapeHtml(orig.notes)}</p>` : '<p class="notes muted">(no notes)</p>'}
        </div>
        <div class="detail-arrow">→</div>
        <div class="detail-card detail-final ${isApprove ? "unchanged" : ""}">
          <h4>${isApprove ? "Reviewer (approved as-is)" : "Reviewer (modified)"}</h4>
          <p>Physical: <strong class="${physChanged ? "diff" : ""}">${fin.physical_adherence ?? fin.quality ?? "—"}</strong> · Instruction: <strong class="${instChanged ? "diff" : ""}">${fin.instruction_alignment ?? fin.faithful ?? "—"}</strong></p>
          <p class="sub-line">${subBadges(fin, subsP)}${subBadges(fin, subsI)}</p>
          ${fin.notes ? `<p class="notes ${nChanged ? "diff" : ""}">${escapeHtml(fin.notes)}</p>` : '<p class="notes muted">(no notes)</p>'}
        </div>
      </div>
      ${r.video_url ? `
        <figure class="detail-video">
          <figcaption>Generated video</figcaption>
          <video controls preload="none" muted playsinline src="${absUrl(r.video_url)}"></video>
        </figure>` : ""}
      <p class="detail-id muted">Item: <code>${escapeHtml(r.item_id || "")}</code></p>
    </div>
  `;
  li.querySelector(".row-head").addEventListener("click", () => {
    const detail = li.querySelector(".row-detail");
    const open = detail.hasAttribute("hidden");
    if (open) detail.removeAttribute("hidden"); else detail.setAttribute("hidden", "");
    li.classList.toggle("expanded", open);
  });
  return li;
}

/* ===================== Admin gold-review queue ===================== */
async function initAdminReview() {
  const admin = localStorage.getItem(CFG.LS_USER);
  if (!admin) { window.location.href = "index.html"; return; }
  document.getElementById("who").textContent = admin;
  // Role gate: only admin (masiyuan) can use admin gold-review.
  if (admin !== "masiyuan") {
    renderRoleGate("管理员 (admin)");
    return;
  }
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
  const debouncedSearch = debounce(loadGoldLibrary, 250);
  setupDualThumb("q-min", "q-max", "q-min-val", "q-max-val", "q-fill", debouncedSearch);
  setupDualThumb("f-min", "f-max", "f-min-val", "f-max-val", "f-fill", debouncedSearch);
  // Submit form (Enter key) still works as a manual trigger.
  form.addEventListener("submit", (e) => { e.preventDefault(); loadGoldLibrary(); });
  await loadGoldLibrary();
}

function debounce(fn, ms) {
  let t = null;
  return function (...args) {
    clearTimeout(t);
    t = setTimeout(() => fn.apply(this, args), ms);
  };
}

/* Single-axis dual-thumb range. min on top by default; whichever is grabbed
   gets top z-index so neither thumb can permanently hide the other.
   Calls onChange after clamp + paint. */
function setupDualThumb(minId, maxId, minOutId, maxOutId, fillId, onChange) {
  const minEl = document.getElementById(minId);
  const maxEl = document.getElementById(maxId);
  const minOut = document.getElementById(minOutId);
  const maxOut = document.getElementById(maxOutId);
  const fill = document.getElementById(fillId);
  const lo = Number(minEl.min), hi = Number(minEl.max);
  const pct = v => ((Number(v) - lo) / (hi - lo)) * 100;
  function paint() {
    const mn = Number(minEl.value), mx = Number(maxEl.value);
    if (minOut) minOut.textContent = mn;
    if (maxOut) maxOut.textContent = mx;
    if (fill) {
      fill.style.left = pct(mn) + "%";
      fill.style.right = (100 - pct(mx)) + "%";
    }
  }
  minEl.addEventListener("input", () => {
    if (Number(minEl.value) > Number(maxEl.value)) maxEl.value = minEl.value;
    paint();
    if (onChange) onChange();
  });
  maxEl.addEventListener("input", () => {
    if (Number(maxEl.value) < Number(minEl.value)) minEl.value = maxEl.value;
    paint();
    if (onChange) onChange();
  });
  const grab = (top, bottom) => () => {
    top.style.zIndex = 4;
    bottom.style.zIndex = 3;
  };
  ["mousedown", "touchstart", "pointerdown"].forEach(ev => {
    minEl.addEventListener(ev, grab(minEl, maxEl), { passive: true });
    maxEl.addEventListener(ev, grab(maxEl, minEl), { passive: true });
  });
  paint();
}

async function loadGoldLibrary() {
  hide("gl-empty"); hide("gl-error");
  document.getElementById("gl-loading").hidden = false;
  document.getElementById("gl-list").innerHTML = "";
  const qMin = Number(document.getElementById("q-min").value);
  const fMin = Number(document.getElementById("f-min").value);
  const qMax = Number(document.getElementById("q-max").value);
  const fMax = Number(document.getElementById("f-max").value);
  const qs = new URLSearchParams();
  qs.set("action", "gold_library");
  // Pass viewer so backend can gate finalizer/reviewer fields by role.
  const viewer = localStorage.getItem(CFG.LS_USER);
  if (viewer) qs.set("user", viewer);
  // Only send filter params when narrower than the full 1–5 range (to keep URLs clean).
  if (qMin > 1) qs.set("quality_min", qMin);
  if (qMax < 5) qs.set("quality_max", qMax);
  if (fMin > 1) qs.set("faithful_min", fMin);
  if (fMax < 5) qs.set("faithful_max", fMax);
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
      // Backend returns final scores at `item.final` (not `item.payload`).
      const p = it.final || it.payload || {};
      // confirmed_by / reviewer only returned to reviewer/admin viewers (backend gated).
      const finalizerTag = it.confirmed_by
        ? `<span class="tag" title="Finalized by">✓ ${escapeHtml(it.confirmed_by)}</span>`
        : "";
      const reviewerTag = it.reviewer && it.reviewer !== it.confirmed_by
        ? `<span class="tag" title="Original annotator">✎ ${escapeHtml(it.reviewer)}</span>`
        : "";
      // Source tag (admin_direct / admin_reviewed / alignment) gated to reviewer/admin viewer.
      const sourceLabel = { admin_direct: "Admin direct", admin_reviewed: "Admin reviewed", alignment: "Reviewer alignment" }[it.source] || "";
      const sourceTag = sourceLabel ? `<span class="tag source-${it.source}">${escapeHtml(sourceLabel)}</span>` : "";
      const phys = p.physical_adherence ?? p.quality;
      const inst = p.instruction_alignment ?? p.faithful;
      card.innerHTML = `
        <div class="meta"><span class="tag gold-tag">GOLD</span>${sourceTag}<span class="tag">${escapeHtml(it.dataset || "?")}</span><span class="tag">${escapeHtml(it.task || "?")}</span>${finalizerTag}${reviewerTag}</div>
        <div class="video-row"><figure><figcaption>Generated</figcaption><video controls preload="metadata" muted playsinline src="${absUrl(it.video_url || "")}"></video></figure></div>
        <p class="gl-scores">Physical: <strong>${phys ?? "—"}</strong> · Instruction: <strong>${inst ?? "—"}</strong></p>
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

/* Always display admin pill for masiyuan, regardless of stored role. */
function displayRole(user, role) {
  if (user === "masiyuan") return "admin";
  return role || "—";
}

/* Friendly role-gate panel for users without permission on a given page.
   Hides all main sections and shows a single explanatory card with a Home link. */
function renderRoleGate(requirement) {
  const main = document.querySelector("main");
  if (!main) return;
  main.querySelectorAll(":scope > section").forEach(s => { s.hidden = true; });
  const card = document.createElement("section");
  card.className = "card role-gate";
  card.innerHTML = `
    <div class="gate-icon">🔒</div>
    <h3 class="gate-title">此页面仅限${escapeHtml(requirement)}</h3>
    <p class="gate-sub">如需此权限,请联系管理员升级你的角色。</p>
    <a class="gate-home" href="dashboard.html">← 返回 Home</a>
  `;
  main.appendChild(card);
}

/* Generic wiring: any page with #who + #logout-btn gets user-chip + logout behavior. */
function wireGlobalChrome() {
  const user = localStorage.getItem(CFG.LS_USER);
  const role = localStorage.getItem(CFG.LS_ROLE);
  const whoEl = document.getElementById("who");
  if (whoEl && (!whoEl.textContent.trim() || whoEl.textContent.trim() === "—")) {
    whoEl.textContent = user || "—";
  }
  const roleEl = document.getElementById("role");
  if (roleEl && (!roleEl.textContent.trim() || roleEl.textContent.trim() === "—")) {
    const shown = displayRole(user, role);
    roleEl.textContent = shown;
    roleEl.dataset.role = shown;
  }
  const lo = document.getElementById("logout-btn");
  if (lo) lo.addEventListener("click", () => {
    if (!confirm("Log out?")) return;
    localStorage.removeItem(CFG.LS_USER);
    localStorage.removeItem(CFG.LS_ROLE);
    window.location.href = "index.html";
  });
}

/* ---------- entry ---------- */
document.addEventListener("DOMContentLoaded", () => {
  wireGlobalChrome();
  if (document.getElementById("login-form")) initLogin();
  if (document.getElementById("annotate-form") && document.getElementById("report-btn")) initTask();
  else if (document.getElementById("annotate-form")) initGold();
  if (document.getElementById("review-form")) initReview();
  if (document.getElementById("my-list")) initMyReviews();
  if (document.getElementById("adm-list")) initAdminReview();
  if (document.getElementById("gl-filter")) initGoldLibrary();
  if (document.getElementById("grid-table")) initDashboard();
  if (document.getElementById("reviewer-section")) initReviewerHub();
  if (document.getElementById("al-form")) initAlign();
});

/* ===================== Reviewer Alignment (admin-initiated 50-item shared task) ===================== */
let ALIGN_CURRENT = null;
let ALIGN_IS_ADMIN = false;

async function initAlign() {
  const user = localStorage.getItem(CFG.LS_USER);
  const role = localStorage.getItem(CFG.LS_ROLE);
  if (!user) { window.location.href = "index.html"; return; }
  if (role !== "reviewer" && user !== "masiyuan") {
    renderRoleGate("审核员 (reviewer) / 管理员");
    return;
  }
  ALIGN_IS_ADMIN = user === "masiyuan";

  // Wire range outputs
  for (const id of ["al-physical_adherence", "al-instruction_alignment"]) {
    const inp = document.getElementById(id);
    const out = document.getElementById(id + "-out");
    if (inp && out) inp.addEventListener("input", () => out.value = inp.value);
  }
  document.getElementById("al-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    await submitAlign();
  });
  document.getElementById("al-retry").addEventListener("click", () => loadAlignStatus());
  document.getElementById("al-start-btn").addEventListener("click", async () => {
    if (!confirm("Start a new alignment campaign? Will randomly sample 50 items shared by all reviewers + admin.")) return;
    try {
      const r = await fetch(CFG.APPS_SCRIPT_URL + "/", {
        method: "POST", headers: { "Content-Type": "text/plain" },
        body: JSON.stringify({ align_start: true, admin: user }),
      });
      const d = await r.json();
      if (d?.ok === false) throw new Error(d.error || "start failed");
      await loadAlignStatus();
    } catch (err) { alert("Failed to start: " + err.message); }
  });
  document.getElementById("al-end-btn").addEventListener("click", async () => {
    if (!confirm("End the current alignment campaign? All finalized items already in gold remain.")) return;
    try {
      const r = await fetch(CFG.APPS_SCRIPT_URL + "/", {
        method: "POST", headers: { "Content-Type": "text/plain" },
        body: JSON.stringify({ align_end: true, admin: user }),
      });
      const d = await r.json();
      if (d?.ok === false) throw new Error(d.error || "end failed");
      await loadAlignStatus();
    } catch (err) { alert("Failed to end: " + err.message); }
  });

  await loadAlignStatus();
}

async function loadAlignStatus() {
  hideAlignSections();
  document.getElementById("al-loading").hidden = false;
  const user = localStorage.getItem(CFG.LS_USER);
  try {
    const r = await fetch(`${CFG.APPS_SCRIPT_URL}/?action=align_status&user=${encodeURIComponent(user)}`);
    const d = await r.json();
    document.getElementById("al-loading").hidden = true;
    if (!d.active) {
      document.getElementById("al-nocampaign").hidden = false;
      if (ALIGN_IS_ADMIN) document.getElementById("al-start-block").hidden = false;
      return;
    }
    document.getElementById("al-done").textContent = d.my_done ?? 0;
    document.getElementById("al-total").textContent = d.total ?? 50;
    if (d.by) {
      document.getElementById("al-byline").hidden = false;
      document.getElementById("al-by").textContent = d.by;
    }
    if (ALIGN_IS_ADMIN) {
      document.getElementById("al-final-count").textContent = `${d.n_finalized ?? 0} finalized / ${d.total ?? 50}`;
      renderAdminOverview(d.items || []);
      document.getElementById("al-admin-overview").hidden = false;
    }
    // Always load next item for the current user (regardless of admin)
    await loadAlignNext();
  } catch (err) {
    document.getElementById("al-loading").hidden = true;
    document.getElementById("al-err-msg").textContent = err.message;
    document.getElementById("al-error").hidden = false;
  }
}

function hideAlignSections() {
  for (const id of ["al-nocampaign", "al-done-msg", "al-item", "al-others", "al-admin-overview", "al-error"]) {
    const el = document.getElementById(id); if (el) el.hidden = true;
  }
}

async function loadAlignNext() {
  const user = localStorage.getItem(CFG.LS_USER);
  try {
    const r = await fetch(`${CFG.APPS_SCRIPT_URL}/?action=align_next&user=${encodeURIComponent(user)}`);
    const d = await r.json();
    if (d.done) {
      document.getElementById("al-item").hidden = true;
      document.getElementById("al-done-msg").hidden = false;
      return;
    }
    ALIGN_CURRENT = d;
    document.getElementById("al-dataset").textContent = d.dataset || "?";
    document.getElementById("al-task").textContent = d.task || "?";
    const vid = document.getElementById("al-video");
    vid.src = absUrl(d.video_url || "");
    vid.load();
    document.getElementById("al-prompt").textContent = d.prompt || "(no instruction)";
    // Reset form
    for (const id of ["al-physical_adherence", "al-instruction_alignment"]) {
      const inp = document.getElementById(id);
      const out = document.getElementById(id + "-out");
      if (inp) inp.value = 3; if (out) out.value = 3;
    }
    for (const id of ["al-agent_consistency", "al-scene_consistency", "al-interaction_realism", "al-agent_match", "al-object_correct", "al-goal_completed"]) {
      document.getElementById(id).checked = false;
    }
    document.getElementById("al-notes").value = "";
    document.getElementById("al-item").hidden = false;
    document.getElementById("al-others").hidden = true;
  } catch (err) {
    document.getElementById("al-err-msg").textContent = err.message;
    document.getElementById("al-error").hidden = false;
  }
}

async function submitAlign() {
  if (!ALIGN_CURRENT) return;
  const user = localStorage.getItem(CFG.LS_USER);
  const notes = document.getElementById("al-notes").value.trim();
  if (!notes) { alert("Notes are required."); return; }
  const payload = {
    physical_adherence: Number(document.getElementById("al-physical_adherence").value),
    instruction_alignment: Number(document.getElementById("al-instruction_alignment").value),
    notes,
  };
  for (const id of ["agent_consistency", "scene_consistency", "interaction_realism", "agent_match", "object_correct", "goal_completed"]) {
    payload[id] = document.getElementById("al-" + id).checked ? 1 : 0;
  }
  try {
    const r = await fetch(CFG.APPS_SCRIPT_URL + "/", {
      method: "POST", headers: { "Content-Type": "text/plain" },
      body: JSON.stringify({ align_submit: true, user, item_id: ALIGN_CURRENT.id, payload }),
    });
    const d = await r.json();
    if (d?.ok === false) throw new Error(d.error || "submit failed");
    // Reload item with others' annotations now unlocked
    await showAlignOthers(ALIGN_CURRENT.id);
    // Refresh status (my_done++ / admin overview refresh)
    await refreshAlignStatusOnly();
  } catch (err) {
    alert("Submit failed: " + err.message);
  }
}

async function refreshAlignStatusOnly() {
  const user = localStorage.getItem(CFG.LS_USER);
  try {
    const r = await fetch(`${CFG.APPS_SCRIPT_URL}/?action=align_status&user=${encodeURIComponent(user)}`);
    const d = await r.json();
    if (d.active) {
      document.getElementById("al-done").textContent = d.my_done ?? 0;
      document.getElementById("al-total").textContent = d.total ?? 50;
      if (ALIGN_IS_ADMIN) {
        document.getElementById("al-final-count").textContent = `${d.n_finalized ?? 0} finalized / ${d.total ?? 50}`;
        renderAdminOverview(d.items || []);
      }
    }
  } catch (_) { /* silent */ }
}

async function showAlignOthers(item_id) {
  const user = localStorage.getItem(CFG.LS_USER);
  try {
    const r = await fetch(`${CFG.APPS_SCRIPT_URL}/?action=align_item&user=${encodeURIComponent(user)}&item_id=${encodeURIComponent(item_id)}`);
    const d = await r.json();
    if (d.locked) {
      alert("This item is still locked — submit yours first to unlock.");
      return;
    }
    document.getElementById("al-item").hidden = true;
    document.getElementById("al-others").hidden = false;
    renderAlignOthers(d);
  } catch (err) {
    alert("Failed to load others' annotations: " + err.message);
  }
}

function renderAlignOthers(d) {
  const root = document.getElementById("al-others-grid");
  root.innerHTML = "";
  const subsP = ["agent_consistency","scene_consistency","interaction_realism"];
  const subsI = ["agent_match","object_correct","goal_completed"];
  const subBadges = (p, keys) => keys.map(k => {
    const v = p[k]; if (v == null) return "";
    return `<span class="sub-badge ${v ? "yes" : "no"}" title="${k}">${v ? "✓" : "✗"} ${k.replace(/_/g," ")}</span>`;
  }).join("");
  for (const a of (d.annotations || [])) {
    const p = a.payload || {};
    const isSelf = a.is_self;
    const isAdminA = a.is_admin_author;
    const card = document.createElement("div");
    card.className = "align-other-card" + (isSelf ? " self" : "") + (isAdminA ? " admin-author" : "");
    card.innerHTML = `
      <div class="aoc-head">
        <strong>${escapeHtml(a.reviewer)}</strong>
        ${isSelf ? '<span class="row-badge gold">YOU</span>' : ''}
        ${isAdminA ? '<span class="row-badge report">ADMIN</span>' : ''}
      </div>
      <p class="aoc-scores">Physical: <strong>${p.physical_adherence ?? "—"}</strong> · Instruction: <strong>${p.instruction_alignment ?? "—"}</strong></p>
      <p class="sub-line">${subBadges(p, subsP)}${subBadges(p, subsI)}</p>
      ${p.notes ? `<p class="aoc-notes">${escapeHtml(p.notes)}</p>` : ""}
    `;
    root.appendChild(card);
  }
  // Admin finalize panel
  const finalizeWrap = document.getElementById("al-admin-finalize");
  if (ALIGN_IS_ADMIN) {
    finalizeWrap.hidden = false;
    renderFinalizeForm(d);
  } else {
    finalizeWrap.hidden = true;
  }

  // Next button
  let nextBtn = document.getElementById("al-next-btn");
  if (!nextBtn) {
    nextBtn = document.createElement("button");
    nextBtn.id = "al-next-btn";
    nextBtn.type = "button";
    nextBtn.className = "primary";
    nextBtn.textContent = "Next item →";
    nextBtn.style.marginTop = "12px";
    nextBtn.addEventListener("click", () => {
      document.getElementById("al-others").hidden = true;
      loadAlignNext();
    });
    document.getElementById("al-others").appendChild(nextBtn);
  }
}

function renderFinalizeForm(d) {
  const wrap = document.getElementById("al-finalize-form-wrap");
  // Pre-fill with admin's own annotation if present, else first non-self
  const myA = (d.annotations || []).find(a => a.is_self) || (d.annotations || [])[0];
  const p = (myA && myA.payload) || {};
  const checked = (k) => p[k] ? "checked" : "";
  wrap.innerHTML = `
    <form id="al-finalize-form">
      <fieldset class="dim-block">
        <legend class="dim-block-title">Physical Adherence (final)</legend>
        <div class="form-row">
          <label for="f-physical_adherence">Score (1–5) <output for="f-physical_adherence" id="f-physical_adherence-out">${p.physical_adherence ?? 3}</output></label>
          <input type="range" id="f-physical_adherence" min="1" max="5" step="1" value="${p.physical_adherence ?? 3}">
        </div>
        <div class="sub-row">
          <label class="sub-check"><input type="checkbox" id="f-agent_consistency" ${checked("agent_consistency")}> <span>Agent consistency</span></label>
          <label class="sub-check"><input type="checkbox" id="f-scene_consistency" ${checked("scene_consistency")}> <span>Scene & object consistency</span></label>
          <label class="sub-check"><input type="checkbox" id="f-interaction_realism" ${checked("interaction_realism")}> <span>Interaction realism</span></label>
        </div>
      </fieldset>
      <fieldset class="dim-block">
        <legend class="dim-block-title">Instruction Alignment (final)</legend>
        <div class="form-row">
          <label for="f-instruction_alignment">Score (1–5) <output for="f-instruction_alignment" id="f-instruction_alignment-out">${p.instruction_alignment ?? 3}</output></label>
          <input type="range" id="f-instruction_alignment" min="1" max="5" step="1" value="${p.instruction_alignment ?? 3}">
        </div>
        <div class="sub-row">
          <label class="sub-check"><input type="checkbox" id="f-agent_match" ${checked("agent_match")}> <span>Agent match</span></label>
          <label class="sub-check"><input type="checkbox" id="f-object_correct" ${checked("object_correct")}> <span>Object correct</span></label>
          <label class="sub-check"><input type="checkbox" id="f-goal_completed" ${checked("goal_completed")}> <span>Goal completed</span></label>
        </div>
      </fieldset>
      <div class="form-row">
        <label for="f-notes">Finalize note <span class="required-tag">*</span></label>
        <textarea id="f-notes" rows="2" maxlength="500" required placeholder="Required — synthesize the consensus / explain final values">${escapeHtml(p.notes || "")}</textarea>
      </div>
      <div class="form-row actions">
        <button type="submit">Write to gold (source=alignment)</button>
      </div>
    </form>
  `;
  for (const id of ["f-physical_adherence", "f-instruction_alignment"]) {
    const inp = document.getElementById(id);
    const out = document.getElementById(id + "-out");
    if (inp && out) inp.addEventListener("input", () => out.value = inp.value);
  }
  document.getElementById("al-finalize-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    await submitAlignFinalize(d.item_id || ALIGN_CURRENT.id);
  });
}

async function submitAlignFinalize(item_id) {
  const admin = localStorage.getItem(CFG.LS_USER);
  const notes = document.getElementById("f-notes").value.trim();
  if (!notes) { alert("Finalize note is required."); return; }
  const payload = {
    physical_adherence: Number(document.getElementById("f-physical_adherence").value),
    instruction_alignment: Number(document.getElementById("f-instruction_alignment").value),
    notes,
  };
  for (const id of ["agent_consistency","scene_consistency","interaction_realism","agent_match","object_correct","goal_completed"]) {
    payload[id] = document.getElementById("f-" + id).checked ? 1 : 0;
  }
  try {
    const r = await fetch(CFG.APPS_SCRIPT_URL + "/", {
      method: "POST", headers: { "Content-Type": "text/plain" },
      body: JSON.stringify({ align_finalize: true, admin, item_id, payload }),
    });
    const d = await r.json();
    if (d?.ok === false) throw new Error(d.error || "finalize failed");
    alert("Finalized → gold (source=alignment).");
    await refreshAlignStatusOnly();
  } catch (err) {
    alert("Finalize failed: " + err.message);
  }
}

function renderAdminOverview(items) {
  const root = document.getElementById("al-admin-list");
  root.innerHTML = "";
  for (const it of items) {
    const li = document.createElement("li");
    li.className = "al-admin-row" + (it.finalized ? " finalized" : "");
    li.innerHTML = `
      <span class="row-meta">${escapeHtml(it.dataset || "?")} · ${escapeHtml(it.task || "?")}</span>
      <span class="muted">${it.n_annotations ?? 0} annotation(s)</span>
      <span class="row-spacer"></span>
      ${it.finalized ? '<span class="row-badge gold">FINALIZED</span>' : ''}
      <button type="button" class="link al-view-btn" data-id="${escapeHtml(it.item_id)}">${it.finalized ? "Re-view" : "View / finalize"}</button>
    `;
    li.querySelector(".al-view-btn").addEventListener("click", () => showAlignOthers(it.item_id));
    root.appendChild(li);
  }
}

async function initReviewerHub() {
  const user = localStorage.getItem(CFG.LS_USER);
  let role = localStorage.getItem(CFG.LS_ROLE);
  if (!user) { window.location.href = "index.html"; return; }
  // Refresh role from server (admin may have demoted/promoted).
  try {
    const r = await fetch(`${CFG.APPS_SCRIPT_URL}/?action=stats&user=${encodeURIComponent(user)}`);
    const d = await r.json();
    if (d?.role && d.role !== role) {
      localStorage.setItem(CFG.LS_ROLE, d.role);
      role = d.role;
    }
    // If user is no longer reviewer/admin, redirect to regular task page.
    if (role !== "reviewer" && user !== "masiyuan") {
      window.location.href = "task.html";
      return;
    }
  } catch (err) { /* offline — fall through */ }
  document.getElementById("who").textContent = user;
  document.getElementById("role").textContent = role || "—";
  const adm = document.getElementById("admin-section");
  if (adm && user === "masiyuan") adm.hidden = false;
  // Hide reviewer section if user is admin only (masiyuan is auto-reviewer too, so keep visible).
  // For non-reviewer/non-admin we'd never get here (redirected above).
  document.getElementById("logout-btn").addEventListener("click", () => {
    if (!confirm("Log out?")) return;
    localStorage.removeItem(CFG.LS_USER);
    localStorage.removeItem(CFG.LS_ROLE);
    window.location.href = "index.html";
  });
}

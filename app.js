/* Embodied World Judge — Annotation app.js */

const CFG = {
  APPS_SCRIPT_URL: window.__APPS_SCRIPT_URL__ || null,
  HF_RESOLVE_BASE: "https://huggingface.co/datasets/HuggingFriends/mllm-as-embodied-world-judge/resolve/main",
  LS_USER: "ewj_annotator",
  LS_ROLE: "ewj_role",
  LS_DONE: "ewj_done",
  LS_LANG: "ewj_lang",
};

/* ===================== i18n ===================== */
const LANG = {
  en: {
    "nav.back": "← Back",
    "chip.logout": "logout",
    "lang.toggle_to": "中",
    "role.author": "AUTHOR",
    "role.contributor": "CONTRIBUTOR",
    "role.reviewer": "REVIEWER",
    "role.admin": "ADMIN",
    "home.card.annotate.title": "Annotate",
    "home.card.annotate.sub": "Score generated videos",
    "home.card.my_reviewed.title": "My reviewed",
    "home.card.my_reviewed.sub": "Audit feedback on your work",
    "home.card.gold_library.title": "Gold library",
    "home.card.gold_library.sub": "Finalized references",
    "home.card.docs.title": "Docs",
    "home.card.docs.sub": "Annotation guide",
    "home.card.review.title": "Review",
    "home.card.review.sub": "Audit annotator queue",
    "home.card.gold_annotation.title": "Gold annotation",
    "home.card.gold_annotation.sub": "Your 50-item set",
    "home.card.gold_reviewed.title": "Gold reviewed",
    "home.card.gold_reviewed.sub": "Admin audits of you",
    "home.card.alignment.title": "Alignment",
    "home.card.alignment.sub": "Shared 50-item alignment task",
    "home.card.alignment_admin.sub": "Start / manage reviewer alignment",
    "home.card.gold_review.title": "Gold review",
    "home.card.gold_review.sub": "Approve reviewer gold",
    "home.card.gold_direct.title": "Gold (direct)",
    "home.card.gold_direct.sub": "No-audit fast path",
    "common.retry": "Retry",
    "common.notice": "Notice",
    "common.failed": "Failed",
    "common.something_wrong": "Something went wrong",
    "common.failed_to_load": "Failed to load",
    "common.loading": "Loading…",
    "common.progress": "Progress",
    "task.loading_next": "Loading next sample…",
    "gold.loading_next": "Loading next gold item…",
    "review.loading_next": "Loading next review task…",
    "review.modify_note_placeholder": "Required — why you changed it",
    "review.subs_meta_p": "P-subs",
    "review.subs_meta_i": "I-subs",
    "review.notes_label": "Notes",
    "align.loading_status": "Loading alignment status…",
    "align.queue_empty": "Queue empty — no pending reviewer gold annotations 🎉",
    "align.your_campaigns": "Your alignment campaigns",
    "align.no_campaigns_mine": "You are not currently enrolled in any active alignment campaign.",
    "align.start_form_title": "Start a new alignment campaign",
    "align.name_label": "Campaign name",
    "align.audience_label": "Participants",
    "align.aud_reviewers": "Reviewers + Admin",
    "align.aud_all": "All users",
    "align.aud_custom": "Custom selection",
    "align.custom_label": "Select users (admin always included)",
    "align.start_submit": "Start campaign",
    "align.start_cancel": "Cancel",
    "align.back_to_picker": "↩ Back to campaigns",
    "align.select_btn": "Enter",
    "align.audience_tag.reviewers": "Reviewers + Admin",
    "align.audience_tag.all": "All users",
    "align.audience_tag.custom": "Custom",
    "align.toast.campaign_created": "Campaign created.",
    "align.toast.campaign_ended": "Campaign ended.",
    "align.toast.name_required": "Please give the campaign a name.",
    "align.toast.no_participants": "Please select at least one participant.",
    "align.toast.not_a_participant": "You are not a participant in this campaign.",
    "align.iaa_btn": "📊 Agreement",
    "align.export_btn": "⬇ Export JSONL",
    "align.history_title": "Ended campaigns (history)",
    "align.iaa.dim": "Dimension",
    "align.iaa.alpha": "Krippendorff α",
    "align.iaa.exact": "Exact agree",
    "align.iaa.mean_diff": "Mean pairwise diff",
    "align.iaa.n_items": "Items",
    "align.iaa.title": "Inter-annotator agreement",
    "align.iaa.no_data": "Not enough multi-rater items to compute agreement yet.",
    "align.iaa.top_items": "Top divergent items",
    "align.toast.export_failed": "Export failed",
    "my_reviews.history": "Reviewed history",
    "my_reviews.empty": "No reviews yet for you. Submit some annotations and they'll be sampled or self-reportable.",
    "my_reviews.stats.reviewed": "reviewed",
    "my_reviews.stats.approved": "approved",
    "my_reviews.stats.modified": "modified",
    "my_reviews.stats.rate": "approval rate",
    "gold_library.search": "Search",
    "gold_library.no_match": "No matching items.",
    "docs.intro_title": "Embodied World-Model Video Evaluation",
    "toast.notes_required": "Notes are required — please explain your reasoning.",
    "toast.modify_note_required": "Modification note is required.",
    "toast.finalize_note_required": "Finalize note is required.",
    "toast.save_failed": "Save failed",
    "toast.submit_failed": "Submit failed",
    "toast.finalize_success": "Finalized — written to gold (source=alignment).",
    "toast.finalize_failed": "Finalize failed",
    "toast.align_start_failed": "Failed to start alignment",
    "toast.align_end_failed": "Failed to end alignment",
    "toast.align_locked": "This item is still locked — submit yours first to unlock.",
    "page.home": "Home",
    "page.annotate": "Annotate",
    "page.gold_annotate": "Gold annotation",
    "page.review": "Review queue",
    "page.admin_review": "Admin gold review",
    "page.my_reviews": "My reviews",
    "page.gold_library": "Gold library",
    "page.docs": "Annotation Standard",
    "page.align": "Reviewer alignment",
    "task.instruction": "Task instruction",
    "task.notes": "Notes",
    "task.notes_placeholder": "Required — explain your reasoning (what you saw, key violations, key successes)…",
    "task.save_next": "Save & next →",
    "task.skip": "Skip",
    "task.report": "⚠ Report (uncertain)",
    "task.required": "*",
    "task.today": "today",
    "axis.physical": "Physical Adherence",
    "axis.physical_help": "only judge what you see in the video",
    "sub.violation_notice": "⚠ Check a box to flag a VIOLATION (red ✗). Default unchecked = passes. Only check when you spot a problem.",
    "axis.pa.level.1": "Gross physics violations throughout",
    "axis.pa.level.2": "Physics frequently broken, ≥1 criterion clearly fails",
    "axis.pa.level.3": "Mostly plausible, noticeable local issues",
    "axis.pa.level.4": "Largely physical, minor overlookable issues",
    "axis.pa.level.5": "Consistently physical, no visible violations",
    "axis.ia.level.1": "Wrong / unrelated action or agent absent",
    "axis.ia.level.2": "Correct agent, wrong object / action",
    "axis.ia.level.3": "Right agent & object, goal partially achieved",
    "axis.ia.level.4": "Task correct, minor issues only",
    "axis.ia.level.5": "Correct agent & object, goal fully completed",
    "axis.instruction": "Instruction Alignment",
    "axis.instruction_help": "judge with task instruction + init frame",
    "axis.score": "Score (1–5)",
    "sub.agent_consistency": "Agent consistency",
    "sub.agent_consistency_hint": "manipulator stays structurally complete; no melting/warping",
    "sub.scene_consistency": "Scene & object consistency",
    "sub.scene_consistency_hint": "background & objects stay coherent; no flicker / teleport / morphing",
    "sub.interaction_realism": "Interaction realism",
    "sub.interaction_realism_hint": "real grasp & contact; no penetration; obeys gravity/inertia",
    "sub.agent_match": "Agent match",
    "sub.agent_match_hint": "the manipulator doing the task is the one from the init frame",
    "sub.object_correct": "Object correct",
    "sub.object_correct_hint": "the manipulated object is the instruction's target",
    "sub.goal_completed": "Goal completed",
    "sub.goal_completed_hint": "the instructed goal state is fully reached",
    "review.your_decision": "Your decision",
    "review.approve": "✅ Approve as-is",
    "review.modify": "✏ Modify",
    "review.modify_note": "Modification note",
    "review.annotator_submission": "Annotator submission (annotator hidden)",
    "align.title": "Reviewer alignment",
    "align.progress": "progress",
    "align.no_campaign": "No active alignment campaign",
    "align.no_campaign_hint": "An admin must start an alignment task before reviewers can begin.",
    "align.start_btn": "Start alignment (admin)",
    "align.start_hint": "Randomly samples 50 items shared across all reviewers + admin.",
    "align.done_title": "You're done with all 50 ✨",
    "align.done_hint": "All items annotated. Review others' annotations below or wait for admin finalize.",
    "align.others_title": "All annotations for this item",
    "align.finalize_title": "Admin finalize (write to gold)",
    "align.next_btn": "Next item →",
    "align.overview_title": "Campaign overview",
    "align.end_btn": "End campaign",
    "docs.title": "Annotation Standard",
    "home.section_home": "Home",
  },
  cn: {
    "nav.back": "← 返回",
    "chip.logout": "退出",
    "lang.toggle_to": "EN",
    "role.author": "作者",
    "role.contributor": "标注员",
    "role.reviewer": "审核员",
    "role.admin": "管理员",
    "home.card.annotate.title": "标注",
    "home.card.annotate.sub": "对生成视频打分",
    "home.card.my_reviewed.title": "我的被审核",
    "home.card.my_reviewed.sub": "查看审核员对你工作的反馈",
    "home.card.gold_library.title": "金标库",
    "home.card.gold_library.sub": "已定稿的金标参考",
    "home.card.docs.title": "标注文档",
    "home.card.docs.sub": "标注指南",
    "home.card.review.title": "审核",
    "home.card.review.sub": "审核标注员队列",
    "home.card.gold_annotation.title": "金标标注",
    "home.card.gold_annotation.sub": "你的 50 条金标集",
    "home.card.gold_reviewed.title": "金标被审核",
    "home.card.gold_reviewed.sub": "管理员对你金标的审核",
    "home.card.alignment.title": "对齐任务",
    "home.card.alignment.sub": "全员共享的 50 条对齐任务",
    "home.card.alignment_admin.sub": "发起 / 管理审核员对齐",
    "home.card.gold_review.title": "金标审核",
    "home.card.gold_review.sub": "审核审核员金标",
    "home.card.gold_direct.title": "金标(直接)",
    "home.card.gold_direct.sub": "免审快路径",
    "common.retry": "重试",
    "common.notice": "提示",
    "common.failed": "失败",
    "common.something_wrong": "出错了",
    "common.failed_to_load": "加载失败",
    "common.loading": "加载中…",
    "common.progress": "进度",
    "task.loading_next": "加载下一条样本…",
    "gold.loading_next": "加载下一条金标…",
    "review.loading_next": "加载下一个审核任务…",
    "review.modify_note_placeholder": "必填 — 说明你为什么修改",
    "review.subs_meta_p": "物理小分",
    "review.subs_meta_i": "指令小分",
    "review.notes_label": "备注",
    "align.loading_status": "加载对齐状态…",
    "align.queue_empty": "队列为空 — 暂无待审核员金标 🎉",
    "align.your_campaigns": "你的对齐任务",
    "align.no_campaigns_mine": "你目前没有参与任何活动的对齐任务。",
    "align.start_form_title": "发起新的对齐任务",
    "align.name_label": "任务名称",
    "align.audience_label": "参与者",
    "align.aud_reviewers": "审核员 + 管理员",
    "align.aud_all": "所有用户",
    "align.aud_custom": "自定义选择",
    "align.custom_label": "选择用户(管理员始终包含)",
    "align.start_submit": "发起任务",
    "align.start_cancel": "取消",
    "align.back_to_picker": "↩ 返回任务列表",
    "align.select_btn": "进入",
    "align.audience_tag.reviewers": "审核员 + 管理员",
    "align.audience_tag.all": "所有用户",
    "align.audience_tag.custom": "自定义",
    "align.toast.campaign_created": "对齐任务已创建。",
    "align.toast.campaign_ended": "对齐任务已结束。",
    "align.toast.name_required": "请填写任务名称。",
    "align.toast.no_participants": "请至少选择一位参与者。",
    "align.toast.not_a_participant": "你不在该对齐任务的参与者列表中。",
    "align.iaa_btn": "📊 一致性",
    "align.export_btn": "⬇ 导出 JSONL",
    "align.history_title": "已结束的对齐任务(历史)",
    "align.iaa.dim": "维度",
    "align.iaa.alpha": "Krippendorff α",
    "align.iaa.exact": "完全一致率",
    "align.iaa.mean_diff": "平均两两差",
    "align.iaa.n_items": "样本数",
    "align.iaa.title": "标注者间一致性",
    "align.iaa.no_data": "尚无足够多人标的样本计算一致性。",
    "align.iaa.top_items": "分歧最大的样本",
    "align.toast.export_failed": "导出失败",
    "my_reviews.history": "审核历史",
    "my_reviews.empty": "你还没有审核记录。提交一些标注,会被抽样或自报告。",
    "my_reviews.stats.reviewed": "已审核",
    "my_reviews.stats.approved": "通过",
    "my_reviews.stats.modified": "修改",
    "my_reviews.stats.rate": "通过率",
    "gold_library.search": "搜索",
    "gold_library.no_match": "没有匹配的金标。",
    "docs.intro_title": "具身世界模型视频评测",
    "toast.notes_required": "备注必填 — 请说明你的判断依据。",
    "toast.modify_note_required": "修改备注必填。",
    "toast.finalize_note_required": "定稿备注必填。",
    "toast.save_failed": "保存失败",
    "toast.submit_failed": "提交失败",
    "toast.finalize_success": "已定稿 — 写入金标(source=alignment)。",
    "toast.finalize_failed": "定稿失败",
    "toast.align_start_failed": "发起对齐失败",
    "toast.align_end_failed": "结束对齐失败",
    "toast.align_locked": "本条仍处于锁定 — 先标完自己的再查看他人。",
    "page.home": "首页",
    "page.annotate": "标注",
    "page.gold_annotate": "金标标注",
    "page.review": "审核队列",
    "page.admin_review": "管理员金标审核",
    "page.my_reviews": "我的审核记录",
    "page.gold_library": "金标库",
    "page.docs": "标注标准",
    "page.align": "审核员对齐",
    "task.instruction": "任务指令",
    "task.notes": "备注",
    "task.notes_placeholder": "必填 — 简述你的判断依据(看到了什么、关键违反、关键成功)…",
    "task.save_next": "保存并下一条 →",
    "task.skip": "跳过",
    "task.report": "⚠ 上报(不确定)",
    "task.required": "*",
    "task.today": "今日",
    "axis.physical": "物理真实度",
    "axis.physical_help": "只看视频判断",
    "sub.violation_notice": "⚠ 勾选 = 标记该项【被违背】(红 ✗);默认不勾 = 通过。只在发现问题时勾选。",
    "axis.pa.level.1": "整体崩坏 — 普遍物理违反",
    "axis.pa.level.2": "重大违反(漂浮 / 穿模)",
    "axis.pa.level.3": "明显不一致(短暂形变 / 闪烁)",
    "axis.pa.level.4": "轻微瑕疵",
    "axis.pa.level.5": "完美无违反",
    "axis.ia.level.1": "错 agent 或 agent 不动",
    "axis.ia.level.2": "错动作或错物体",
    "axis.ia.level.3": "部分完成,未达终态",
    "axis.ia.level.4": "基本达成,轻微欠缺",
    "axis.ia.level.5": "完整准确达成",
    "axis.instruction": "指令对齐",
    "axis.instruction_help": "用 instruction + 首帧 判断",
    "axis.score": "评分(1–5)",
    "sub.agent_consistency": "机械手/人手完整性",
    "sub.agent_consistency_hint": "结构完整、不融化/扭曲",
    "sub.scene_consistency": "背景与物体一致性",
    "sub.scene_consistency_hint": "背景与物体时序一致、不闪烁/瞬移/形变",
    "sub.interaction_realism": "交互真实性",
    "sub.interaction_realism_hint": "抓取真实闭合、无穿模、遵守重力惯性",
    "sub.agent_match": "机械手匹配",
    "sub.agent_match_hint": "完成任务的就是首帧那个机械手/人手",
    "sub.object_correct": "物体正确",
    "sub.object_correct_hint": "操纵的 object 是指令指定的",
    "sub.goal_completed": "目标达成",
    "sub.goal_completed_hint": "指令的目标已完整达成",
    "review.your_decision": "你的决定",
    "review.approve": "✅ 通过原样",
    "review.modify": "✏ 修改",
    "review.modify_note": "修改备注",
    "review.annotator_submission": "标注者提交(隐名)",
    "align.title": "审核员对齐",
    "align.progress": "进度",
    "align.no_campaign": "暂无活动的对齐任务",
    "align.no_campaign_hint": "管理员需先发起对齐任务,审核员才能开始。",
    "align.start_btn": "发起对齐(管理员)",
    "align.start_hint": "随机抽 50 条,所有审核员 + 管理员共标。",
    "align.done_title": "你已标完全部 50 条 ✨",
    "align.done_hint": "全部标完。可在下方查看其他人对各条的标注,等管理员定稿。",
    "align.others_title": "本条所有标注",
    "align.finalize_title": "管理员定稿(写入金标)",
    "align.next_btn": "下一条 →",
    "align.overview_title": "对齐任务总览",
    "align.end_btn": "结束对齐",
    "docs.title": "标注标准",
    "home.section_home": "首页",
  },
};

function getLang() {
  return localStorage.getItem(CFG.LS_LANG) || "en";
}

function tr(key) {
  const lang = getLang();
  return (LANG[lang] && LANG[lang][key]) || (LANG.en && LANG.en[key]) || key;
}

function applyI18n(root) {
  const scope = root || document;
  scope.querySelectorAll("[data-i18n]").forEach(el => {
    const key = el.getAttribute("data-i18n");
    el.textContent = tr(key);
  });
  scope.querySelectorAll("[data-i18n-placeholder]").forEach(el => {
    const key = el.getAttribute("data-i18n-placeholder");
    el.setAttribute("placeholder", tr(key));
  });
  scope.querySelectorAll("[data-i18n-title]").forEach(el => {
    const key = el.getAttribute("data-i18n-title");
    el.setAttribute("title", tr(key));
  });
  // Re-translate any role pill whose data-role attribute is set.
  scope.querySelectorAll(".role-pill[data-role]").forEach(el => {
    const role = el.dataset.role;
    if (!role || role === "—") return;
    el.textContent = tr("role." + role);
  });
  document.documentElement.lang = getLang();
  document.body && document.body.classList.toggle("lang-cn", getLang() === "cn");
}

function setLang(lang) {
  localStorage.setItem(CFG.LS_LANG, lang);
  applyI18n();
  const btn = document.getElementById("lang-btn");
  if (btn) btn.textContent = tr("lang.toggle_to");
}

/* Toast — non-blocking notification (replaces noisy alert()). */
function toast(msg, type) {
  let host = document.getElementById("toast-host");
  if (!host) {
    host = document.createElement("div");
    host.id = "toast-host";
    document.body.appendChild(host);
  }
  const t = document.createElement("div");
  t.className = "toast toast-" + (type || "info");
  t.textContent = msg;
  host.appendChild(t);
  requestAnimationFrame(() => t.classList.add("show"));
  const ms = (type === "err") ? 5000 : 3500;
  setTimeout(() => {
    t.classList.remove("show");
    setTimeout(() => t.remove(), 280);
  }, ms);
}

/* Video load fallback — retry with cache-buster, then show inline placeholder
   with Retry / Skip buttons so users aren't stuck on a 403/CORS dead frame. */
function wireVideoFallback(videoEl, opts) {
  if (!videoEl || videoEl.dataset.fallbackWired === "1") return;
  videoEl.dataset.fallbackWired = "1";
  const maxRetries = (opts && opts.maxRetries) || 2;
  const onSkip = opts && opts.onSkip;
  let retries = 0;
  videoEl.addEventListener("error", () => {
    if (retries < maxRetries) {
      retries++;
      const base = videoEl.src.split(/[?&]_cb=/)[0].replace(/[?&]$/, "");
      const sep = base.includes("?") ? "&" : "?";
      const newSrc = base + sep + "_cb=" + (Date.now() % 100000);
      console.warn(`video load failed (try ${retries}/${maxRetries}):`, videoEl.src);
      videoEl.src = newSrc;
      videoEl.load();
      return;
    }
    // Final: render inline placeholder.
    if (videoEl.parentElement?.querySelector(".video-failed")) return;
    const msgFail = getLang() === "cn" ? "视频加载失败" : "Video failed to load";
    const lblRetry = getLang() === "cn" ? "重试" : "Retry";
    const lblSkip = getLang() === "cn" ? "跳过" : "Skip";
    const ph = document.createElement("div");
    ph.className = "video-failed";
    ph.innerHTML = `
      <div class="video-failed-icon">⚠</div>
      <div class="video-failed-msg">${msgFail}</div>
      <div class="video-failed-actions">
        <button type="button" class="ghost video-retry-btn">${lblRetry}</button>
        ${onSkip ? `<button type="button" class="ghost video-skip-btn">${lblSkip}</button>` : ""}
      </div>`;
    ph.querySelector(".video-retry-btn").addEventListener("click", () => {
      retries = 0;
      ph.remove();
      videoEl.style.display = "";
      videoEl.src = videoEl.src.split(/[?&]_cb=/)[0];
      videoEl.load();
    });
    if (onSkip) ph.querySelector(".video-skip-btn").addEventListener("click", onSkip);
    videoEl.style.display = "none";
    videoEl.parentElement.appendChild(ph);
  });
}

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
    roleEl.dataset.role = shown;
    roleEl.textContent = tr("role." + shown);
  }
  // logout wired by wireGlobalChrome.

  for (const id of ["physical_adherence", "instruction_alignment"]) {
    const input = document.getElementById(id);
    const out = document.getElementById(id + "-out");
    if (input && out) input.addEventListener("input", () => { out.value = input.value; });
  }
  wireScoreHint("physical_adherence", "physical_adherence-hint", "pa");
  wireScoreHint("instruction_alignment", "instruction_alignment-hint", "ia");

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

  // Video fallback: retry on HF/CDN errors, then show inline placeholder w/ Skip.
  wireVideoFallback(document.getElementById("gen-video"), { onSkip: () => onSubmit(true) });
  wireVideoFallback(document.getElementById("gt-video"));

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

/* Fetch the canonical task instruction (instruction.txt; instruction_cn.txt in CN mode)
   from the HF gt_data prompt directory derived from the generated video URL.
   Never falls back to prompt.txt — that's the generator rewrite, not the canonical task. */
async function fetchInstructionInto(video_url, targetElId) {
  const target = document.getElementById(targetElId);
  if (!target) return;
  const base = video_url && video_url.replace(
    /generated_data\/[^\/]+\/(task_\d+)\/(episode_\d+)\/1\/[^\/]+\.mp4$/,
    "gt_data/$1/$2/prompt"
  );
  if (!base) { target.textContent = "(no prompt)"; return; }
  const filenames = getLang() === "cn"
    ? ["instruction_cn.txt", "instruction.txt"]
    : ["instruction.txt"];
  for (const fname of filenames) {
    try {
      const res = await fetch(`${base}/${fname}`);
      if (!res.ok) continue;
      const text = await res.text();
      target.textContent = text.trim() || "(empty)";
      return;
    } catch (err) { /* try next */ }
  }
  target.textContent = "(prompt unavailable)";
}

async function fetchPrompt(it) {
  return fetchInstructionInto(it.video_url, "prompt-text");
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
    if (!notes) { toast(tr("toast.notes_required"), "err"); return; }
    payload.physical_adherence = Number(document.getElementById("physical_adherence").value);
    payload.instruction_alignment = Number(document.getElementById("instruction_alignment").value);
    for (const id of ["agent_consistency", "scene_consistency", "interaction_realism", "agent_match", "object_correct", "goal_completed"]) {
      payload[id] = document.getElementById(id).checked ? 0 : 1;
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
    roleEl.dataset.role = shown;
    roleEl.textContent = tr("role." + shown);
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
  let data, alignListData;
  try {
    const [bRes, aRes] = await Promise.all([
      fetch(`${CFG.APPS_SCRIPT_URL}/?action=badges&user=${encodeURIComponent(user)}`),
      fetch(`${CFG.APPS_SCRIPT_URL}/?action=align_list&user=${encodeURIComponent(user)}`),
    ]);
    data = await bRes.json();
    alignListData = await aRes.json();
  } catch (err) { console.warn("badges fetch failed", err); return; }
  if (!data || data.error) return;

  // Seen-diff counters: total minus last-seen total (stored per user in localStorage).
  const seenMy = Number(localStorage.getItem(`ewj_seen_myreviewed_${user}`) || 0);
  const seenGold = Number(localStorage.getItem(`ewj_seen_goldreviewed_${user}`) || 0);
  const myreviewedNew = Math.max(0, (data.myreviewed_total || 0) - seenMy);
  const goldreviewedNew = Math.max(0, (data.goldreviewed_total || 0) - seenGold);

  // Align badge: sum across all active campaigns the user is enrolled in.
  // Admin: take max(myRemain, adminFinalRemain) per campaign, then sum.
  let alignBadge = 0;
  const isAdminBadge = !!(alignListData && alignListData.is_admin);
  if (alignListData && Array.isArray(alignListData.campaigns)) {
    for (const c of alignListData.campaigns) {
      if (!c.is_participant && !isAdminBadge) continue;
      const total = c.total ?? 50;
      const myRemain = (c.is_participant) ? Math.max(0, total - (c.my_done ?? 0)) : 0;
      if (isAdminBadge) {
        const adminFinalRemain = Math.max(0, total - (c.n_finalized ?? 0));
        alignBadge += Math.max(myRemain, adminFinalRemain);
      } else {
        alignBadge += myRemain;
      }
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
  // Sort by role rank (admin → reviewer → author → contributor), then total_pct desc, then done desc.
  const roleRank = { admin: 0, reviewer: 1, contributor: 2, author: 3 };
  const annotators = (data.annotators || []).slice().sort((a, b) => {
    const aRole = (a.user === "masiyuan") ? "admin" : (a.role || "contributor");
    const bRole = (b.user === "masiyuan") ? "admin" : (b.role || "contributor");
    const rDiff = (roleRank[aRole] ?? 99) - (roleRank[bRole] ?? 99);
    if (rDiff !== 0) return rDiff;
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
  thProgress.textContent = tr("common.progress");
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
      ? `<select class="role-select" data-role="${escapeHtml(a.role || '')}" data-target="${escapeHtml(a.user)}">
           <option value="author"${a.role === "author" ? " selected" : ""}>Author</option>
           <option value="contributor"${a.role === "contributor" ? " selected" : ""}>Contributor</option>
           <option value="reviewer"${a.role === "reviewer" ? " selected" : ""}>Reviewer</option>
         </select>`
      : (a.role ? `<span class="role-pill" data-role="${a.role}">${capitalizeFirst(a.role)}</span>` : "");
    const quotaHTML = isAdmin
      ? `<span class="quota-label">${a.quota ?? "—"}/day</span>`
      : "";
    const streakHTML = (isAdmin || a.is_self) && (a.streak ?? 0) > 0
      ? `<span class="streak-mini" title="连续打卡 ${a.streak} 天">连续 ${a.streak} 天</span>`
      : "";
    tdUser.innerHTML = `
      <div class="user-head">
        <span class="user-name">${escapeHtml(a.user)}</span>
        ${isMaSiyuan ? '<span class="role-pill" data-role="admin">Admin</span>' : ''}
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
    roleEl.dataset.role = shown;
    roleEl.textContent = tr("role." + shown);
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
  wireScoreHint("physical_adherence", "physical_adherence-hint", "pa");
  wireScoreHint("instruction_alignment", "instruction_alignment-hint", "ia");
  document.getElementById("annotate-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    await submitGold(false);
  });
  document.getElementById("skip-btn").addEventListener("click", () => submitGold(true));
  document.getElementById("retry-btn").addEventListener("click", () => loadNextGold());
  wireVideoFallback(document.getElementById("gen-video"), { onSkip: () => submitGold(true) });
  wireVideoFallback(document.getElementById("gt-video"));
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
    if (!notes) { toast(tr("toast.notes_required"), "err"); return; }
    payload.physical_adherence = Number(document.getElementById("physical_adherence").value);
    payload.instruction_alignment = Number(document.getElementById("instruction_alignment").value);
    for (const id of ["agent_consistency", "scene_consistency", "interaction_realism", "agent_match", "object_correct", "goal_completed"]) {
      payload[id] = document.getElementById(id).checked ? 0 : 1;
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
    roleEl.dataset.role = shown;
    roleEl.textContent = tr("role." + shown);
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
  wireScoreHint("m-physical_adherence", "m-physical_adherence-hint", "pa");
  wireScoreHint("m-instruction_alignment", "m-instruction_alignment-hint", "ia");
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
        // Inverted: stored 0 (violated) → checkbox checked (red ✗); stored 1 (pass) → unchecked.
        document.getElementById("m-" + id).checked = orig[id] === 0;
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
  wireVideoFallback(document.getElementById("gen-video"), { onSkip: () => loadNextReview() });
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
    if (!notes) { toast(tr("toast.modify_note_required"), "err"); return; }
    payload = {
      physical_adherence: Number(document.getElementById("m-physical_adherence").value),
      instruction_alignment: Number(document.getElementById("m-instruction_alignment").value),
      notes,
    };
    for (const id of ["agent_consistency","scene_consistency","interaction_realism","agent_match","object_correct","goal_completed"]) {
      payload[id] = document.getElementById("m-" + id).checked ? 0 : 1;
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
    if (open) {
      // Wire fallback on first expand so retry/skip works if video 403s.
      const v = detail.querySelector("video");
      if (v) wireVideoFallback(v);
    }
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
      const cardVideoCb = () => {
        const v = card.querySelector("video");
        if (v) wireVideoFallback(v);
      };
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
      cardVideoCb();
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
  setupDualThumb("pa-min", "pa-max", "pa-min-val", "pa-max-val", "pa-fill", debouncedSearch);
  setupDualThumb("ia-min", "ia-max", "ia-min-val", "ia-max-val", "ia-fill", debouncedSearch);
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
  const paMin = Number(document.getElementById("pa-min").value);
  const paMax = Number(document.getElementById("pa-max").value);
  const iaMin = Number(document.getElementById("ia-min").value);
  const iaMax = Number(document.getElementById("ia-max").value);
  const qs = new URLSearchParams();
  qs.set("action", "gold_library");
  // Pass viewer so backend can gate finalizer/reviewer fields by role.
  const viewer = localStorage.getItem(CFG.LS_USER);
  if (viewer) qs.set("user", viewer);
  // Send filter params for the new 8-field schema (backend DIM_ALIAS maps pa→physical_adherence, ia→instruction_alignment).
  if (paMin > 1) qs.set("pa_min", paMin);
  if (paMax < 5) qs.set("pa_max", paMax);
  if (iaMin > 1) qs.set("ia_min", iaMin);
  if (iaMax < 5) qs.set("ia_max", iaMax);
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
      // Alignment gold also carries campaign_name (multi-campaign provenance).
      const sourceBase = { admin_direct: "Admin direct", admin_reviewed: "Admin reviewed", alignment: "Alignment" }[it.source] || "";
      const sourceFull = (it.source === "alignment" && it.campaign_name)
        ? `${sourceBase} · ${it.campaign_name}`
        : sourceBase;
      const sourceTag = sourceFull ? `<span class="tag source-${it.source}" title="${escapeHtml(it.campaign_id || it.source)}">${escapeHtml(sourceFull)}</span>` : "";
      const phys = p.physical_adherence ?? p.quality;
      const inst = p.instruction_alignment ?? p.faithful;
      card.innerHTML = `
        <div class="meta"><span class="tag gold-tag">GOLD</span>${sourceTag}<span class="tag">${escapeHtml(it.dataset || "?")}</span><span class="tag">${escapeHtml(it.task || "?")}</span>${finalizerTag}${reviewerTag}</div>
        <div class="video-row"><figure><figcaption>Generated</figcaption><video controls preload="metadata" muted playsinline src="${absUrl(it.video_url || "")}"></video></figure></div>
        <p class="gl-scores">Physical: <strong>${phys ?? "—"}</strong> · Instruction: <strong>${inst ?? "—"}</strong></p>
        <p class="muted">${escapeHtml(p.notes || "")}</p>
      `;
      root.appendChild(card);
      const v = card.querySelector("video");
      if (v) wireVideoFallback(v);
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

function capitalizeFirst(s) {
  if (!s) return s;
  return s.charAt(0).toUpperCase() + s.slice(1);
}

/* Wire a score hint chip below a slider — updates per-level text + color class as user drags.
   axisKey = "pa" | "ia"; sliderId = the <input type=range> id; hintId = the chip element id. */
function wireScoreHint(sliderId, hintId, axisKey) {
  const slider = document.getElementById(sliderId);
  const hint = document.getElementById(hintId);
  if (!slider || !hint) return;
  function update() {
    const v = Number(slider.value) || 0;
    hint.textContent = tr(`axis.${axisKey}.level.${v}`);
    hint.className = "score-hint level-" + v;
  }
  slider.addEventListener("input", update);
  update();
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

/* Generic wiring: any page with #who + #logout-btn gets user-chip + logout behavior + lang toggle. */
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
    roleEl.dataset.role = shown;
    roleEl.textContent = tr("role." + shown);
  }
  // Inject lang toggle next to logout if missing.
  const chip = document.querySelector(".user-chip");
  if (chip && !document.getElementById("lang-btn")) {
    const btn = document.createElement("button");
    btn.id = "lang-btn";
    btn.className = "link lang-btn";
    btn.title = "切换语言 / Toggle language";
    btn.textContent = tr("lang.toggle_to");
    btn.addEventListener("click", () => {
      const next = getLang() === "en" ? "cn" : "en";
      setLang(next);
    });
    const lo = chip.querySelector("#logout-btn");
    if (lo) chip.insertBefore(btn, lo); else chip.appendChild(btn);
  }
  const lo = document.getElementById("logout-btn");
  if (lo) {
    lo.addEventListener("click", () => {
      if (!confirm(getLang() === "cn" ? "退出登录?" : "Log out?")) return;
      localStorage.removeItem(CFG.LS_USER);
      localStorage.removeItem(CFG.LS_ROLE);
      window.location.href = "index.html";
    });
    // i18n logout text if it's currently the default "logout".
    if (lo.textContent.trim() === "logout") lo.textContent = tr("chip.logout");
  }
  applyI18n();
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

/* ===================== Reviewer Alignment v2 (multi-campaign concurrent) ===================== */
let ALIGN_CURRENT = null;       // currently-rendered item
let ALIGN_CAMPAIGN_ID = null;   // currently-selected campaign id
let ALIGN_CAMPAIGN_NAME = "";   // currently-selected campaign name
let ALIGN_IS_ADMIN = false;
let ALIGN_USER_LIST = [];       // for custom-audience multi-select

async function initAlign() {
  const user = localStorage.getItem(CFG.LS_USER);
  if (!user) { window.location.href = "index.html"; return; }
  ALIGN_IS_ADMIN = user === "masiyuan";
  // No upfront role gate — anyone can land here; participant-gate runs per-campaign.

  // Wire range outputs
  for (const id of ["al-physical_adherence", "al-instruction_alignment"]) {
    const inp = document.getElementById(id);
    const out = document.getElementById(id + "-out");
    if (inp && out) inp.addEventListener("input", () => out.value = inp.value);
  }
  wireScoreHint("al-physical_adherence", "al-physical_adherence-hint", "pa");
  wireScoreHint("al-instruction_alignment", "al-instruction_alignment-hint", "ia");
  document.getElementById("al-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    await submitAlign();
  });
  document.getElementById("al-retry").addEventListener("click", () => loadAlignList());
  document.getElementById("al-back-picker").addEventListener("click", () => {
    ALIGN_CAMPAIGN_ID = null; ALIGN_CAMPAIGN_NAME = ""; ALIGN_CURRENT = null;
    loadAlignList();
  });
  document.getElementById("al-end-btn").addEventListener("click", async () => {
    if (!ALIGN_CAMPAIGN_ID) return;
    if (!confirm("End this alignment campaign? Already-finalized gold remains.")) return;
    try {
      const r = await fetch(CFG.APPS_SCRIPT_URL + "/", {
        method: "POST", headers: { "Content-Type": "text/plain" },
        body: JSON.stringify({ align_end: true, admin: user, campaign_id: ALIGN_CAMPAIGN_ID }),
      });
      const d = await r.json();
      if (d?.ok === false) throw new Error(d.error || "end failed");
      toast(tr("align.toast.campaign_ended"), "ok");
      ALIGN_CAMPAIGN_ID = null; ALIGN_CAMPAIGN_NAME = "";
      await loadAlignList();
    } catch (err) { toast(tr("toast.align_end_failed") + ": " + err.message, "err"); }
  });

  // Admin extras: IAA toggle + export + history
  if (ALIGN_IS_ADMIN) {
    const iaaBtn = document.getElementById("al-iaa-btn");
    if (iaaBtn) iaaBtn.addEventListener("click", () => toggleIAAPanel());
    const exportBtn = document.getElementById("al-export-btn");
    if (exportBtn) exportBtn.addEventListener("click", () => exportCampaign());
  }
  // Admin: Start new campaign form
  if (ALIGN_IS_ADMIN) {
    document.getElementById("al-start-toggle").hidden = false;
    document.getElementById("al-start-toggle").addEventListener("click", () => {
      const form = document.getElementById("al-start-form");
      form.hidden = !form.hidden;
      if (!form.hidden) loadAlignUsersForCustom();
    });
    document.getElementById("al-start-cancel").addEventListener("click", () => {
      document.getElementById("al-start-form").hidden = true;
    });
    document.getElementsByName("al-audience").forEach(r => {
      r.addEventListener("change", () => {
        document.getElementById("al-custom-wrap").hidden = (r.value !== "custom" || !r.checked);
        // show only when "custom" radio is currently checked
        const chosen = document.querySelector('input[name="al-audience"]:checked');
        document.getElementById("al-custom-wrap").hidden = (chosen?.value !== "custom");
      });
    });
    document.getElementById("al-start-submit").addEventListener("click", submitAlignStart);
  }

  await loadAlignList();
}

async function loadAlignUsersForCustom() {
  const admin = localStorage.getItem(CFG.LS_USER);
  if (ALIGN_USER_LIST.length > 0) { renderCustomUserList(); return; }
  try {
    const r = await fetch(`${CFG.APPS_SCRIPT_URL}/?action=align_users&admin=${encodeURIComponent(admin)}`);
    const d = await r.json();
    ALIGN_USER_LIST = d.users || [];
    renderCustomUserList();
  } catch (err) {
    toast("Failed to load user list: " + err.message, "err");
  }
}

function renderCustomUserList() {
  const root = document.getElementById("al-custom-list");
  root.innerHTML = "";
  for (const u of ALIGN_USER_LIST) {
    if (u.user === "masiyuan") continue;  // admin always included
    const li = document.createElement("li");
    li.className = "custom-user-row";
    li.innerHTML = `
      <label>
        <input type="checkbox" class="al-custom-cb" value="${escapeHtml(u.user)}" data-role="${escapeHtml(u.role || '')}">
        <strong>${escapeHtml(u.user)}</strong>
        <span class="role-pill" data-role="${escapeHtml(u.role || '')}">${escapeHtml(capitalizeFirst(u.role) || '—')}</span>
      </label>`;
    root.appendChild(li);
  }
}

async function submitAlignStart() {
  const admin = localStorage.getItem(CFG.LS_USER);
  const name = document.getElementById("al-new-name").value.trim();
  if (!name) { toast(tr("align.toast.name_required"), "err"); return; }
  const audienceEl = document.querySelector('input[name="al-audience"]:checked');
  const audience = audienceEl ? audienceEl.value : "reviewers";
  let participants;
  if (audience === "custom") {
    participants = Array.from(document.querySelectorAll(".al-custom-cb:checked")).map(cb => cb.value);
    if (participants.length === 0) { toast(tr("align.toast.no_participants"), "err"); return; }
  }
  try {
    const body = { align_start: true, admin, name, audience };
    if (participants) body.participants = participants;
    const r = await fetch(CFG.APPS_SCRIPT_URL + "/", {
      method: "POST", headers: { "Content-Type": "text/plain" }, body: JSON.stringify(body),
    });
    const d = await r.json();
    if (d?.ok === false) throw new Error(d.error || "start failed");
    toast(tr("align.toast.campaign_created"), "ok");
    document.getElementById("al-start-form").hidden = true;
    document.getElementById("al-new-name").value = "";
    document.querySelectorAll(".al-custom-cb").forEach(cb => cb.checked = false);
    await loadAlignList();
  } catch (err) {
    toast(tr("toast.align_start_failed") + ": " + err.message, "err");
  }
}

async function loadAlignList() {
  hideAlignSections();
  document.getElementById("al-list-loading").hidden = false;
  document.getElementById("al-progress-stat").hidden = true;
  document.getElementById("al-current-name").hidden = true;
  const user = localStorage.getItem(CFG.LS_USER);
  try {
    const r = await fetch(`${CFG.APPS_SCRIPT_URL}/?action=align_list&user=${encodeURIComponent(user)}`);
    const d = await r.json();
    document.getElementById("al-list-loading").hidden = true;
    renderCampaignList(d.campaigns || []);
    document.getElementById("al-picker").hidden = false;
    if (ALIGN_IS_ADMIN) await loadAlignHistory();
  } catch (err) {
    document.getElementById("al-list-loading").hidden = true;
    document.getElementById("al-err-msg").textContent = err.message;
    document.getElementById("al-error").hidden = false;
  }
}

async function loadAlignHistory() {
  const admin = localStorage.getItem(CFG.LS_USER);
  try {
    const r = await fetch(`${CFG.APPS_SCRIPT_URL}/?action=align_history&admin=${encodeURIComponent(admin)}`);
    const d = await r.json();
    const ended = (d.campaigns || d || []).filter(c => c.status === "ended" || c.ended);
    const section = document.getElementById("al-history");
    const list = document.getElementById("al-history-list");
    list.innerHTML = "";
    if (!ended.length) { section.hidden = true; return; }
    for (const c of ended) {
      const li = document.createElement("li");
      li.className = "campaign-row aud-" + (c.audience || "custom") + " ended";
      const audIcon = { reviewers: "🛡", all: "🌐", custom: "🎯" }[c.audience] || "🎯";
      li.innerHTML = `
        <div class="campaign-head">
          <span class="campaign-icon">${audIcon}</span>
          <div class="campaign-meta">
            <div class="campaign-name-row">
              <strong>${escapeHtml(c.name || ("Campaign #" + (c.campaign_id || "").slice(0,6)))}</strong>
              <span class="tag aud-tag tag-${escapeHtml(c.audience || 'custom')}">${tr("align.audience_tag." + (c.audience || "custom"))}</span>
              <span class="tag ended-tag">ENDED</span>
            </div>
            <div class="campaign-sub muted">by ${escapeHtml(c.by || "—")} · ${c.n_finalized ?? 0}/${c.total ?? 50} finalized</div>
          </div>
          <div class="campaign-progress"></div>
          <button type="button" class="al-enter-btn ghost" data-cid="${escapeHtml(c.campaign_id)}" data-cname="${escapeHtml(c.name || '')}">View</button>
        </div>`;
      li.querySelector(".al-enter-btn").addEventListener("click", (e) => {
        const cid = e.currentTarget.dataset.cid;
        const cname = e.currentTarget.dataset.cname;
        selectCampaign(cid, cname);
      });
      list.appendChild(li);
    }
    section.hidden = false;
  } catch (_) { /* silent — endpoint may be optional */ }
}

async function toggleIAAPanel() {
  const panel = document.getElementById("al-iaa-panel");
  if (!panel.hidden) { panel.hidden = true; return; }
  if (!ALIGN_CAMPAIGN_ID) return;
  panel.hidden = false;
  panel.innerHTML = `<p class="muted">${tr("common.loading")}</p>`;
  try {
    const r = await fetch(`${CFG.APPS_SCRIPT_URL}/?action=align_agreement&campaign_id=${encodeURIComponent(ALIGN_CAMPAIGN_ID)}`);
    const d = await r.json();
    renderIAAPanel(panel, d);
  } catch (err) {
    panel.innerHTML = `<p class="warn-text">Failed to load agreement: ${escapeHtml(err.message)}</p>`;
  }
}

function renderIAAPanel(panel, d) {
  const perDim = d.per_dim || {};
  const items = d.items || [];
  const nMulti = d.n_items_multi ?? 0;
  if (nMulti === 0) {
    panel.innerHTML = `<p class="muted">${tr("align.iaa.no_data")}</p>`;
    return;
  }
  const dimOrder = ["physical_adherence", "instruction_alignment", "agent_consistency", "scene_consistency", "interaction_realism", "agent_match", "object_correct", "goal_completed"];
  const dimLabel = {
    physical_adherence: tr("axis.physical"),
    instruction_alignment: tr("axis.instruction"),
    agent_consistency: tr("sub.agent_consistency"),
    scene_consistency: tr("sub.scene_consistency"),
    interaction_realism: tr("sub.interaction_realism"),
    agent_match: tr("sub.agent_match"),
    object_correct: tr("sub.object_correct"),
    goal_completed: tr("sub.goal_completed"),
  };
  function alphaCell(a) {
    if (a == null) return `<td class="muted">—</td>`;
    const cls = a >= 0.8 ? "ok-text" : (a >= 0.4 ? "" : "warn-text");
    return `<td class="${cls}"><strong>${a.toFixed(3)}</strong></td>`;
  }
  let rows = "";
  for (const k of dimOrder) {
    const dim = perDim[k] || {};
    rows += `<tr>
      <td>${escapeHtml(dimLabel[k] || k)}</td>
      ${alphaCell(dim.krippendorff_alpha)}
      <td>${dim.exact_agree_rate != null ? (dim.exact_agree_rate * 100).toFixed(1) + "%" : "—"}</td>
      <td>${dim.mean_pairwise_diff != null ? dim.mean_pairwise_diff.toFixed(2) : "—"}</td>
      <td class="muted">${dim.n_items ?? "—"}</td>
    </tr>`;
  }
  const topItems = items.slice(0, 5).map(it => {
    const pa = it.physical_adherence_spread ?? 0;
    const ia = it.instruction_alignment_spread ?? 0;
    const total = pa + ia;
    return `<li><span class="muted">${escapeHtml(it.dataset || "?")} · ${escapeHtml(it.task || "?")}</span>
              <span class="muted small">PA Δ${pa} · IA Δ${ia}${total >= 6 ? ' <span class="conflict-tag">⚠ 高分歧</span>' : ''}</span></li>`;
  }).join("");
  panel.innerHTML = `
    <h4 class="iaa-title">${tr("align.iaa.title")} <span class="muted small">· ${d.n_raters || "?"} raters · ${nMulti} multi-rater items</span></h4>
    <table class="iaa-table">
      <thead><tr>
        <th>${tr("align.iaa.dim")}</th>
        <th>${tr("align.iaa.alpha")}</th>
        <th>${tr("align.iaa.exact")}</th>
        <th>${tr("align.iaa.mean_diff")}</th>
        <th>${tr("align.iaa.n_items")}</th>
      </tr></thead>
      <tbody>${rows}</tbody>
    </table>
    ${topItems ? `<h5 class="iaa-subtitle">${tr("align.iaa.top_items")}</h5><ul class="iaa-top-list">${topItems}</ul>` : ""}
  `;
}

async function exportCampaign() {
  if (!ALIGN_CAMPAIGN_ID) return;
  const admin = localStorage.getItem(CFG.LS_USER);
  try {
    const r = await fetch(`${CFG.APPS_SCRIPT_URL}/?action=align_export&admin=${encodeURIComponent(admin)}&campaign_id=${encodeURIComponent(ALIGN_CAMPAIGN_ID)}`);
    if (!r.ok) throw new Error("HTTP " + r.status);
    const d = await r.json();
    // Convert items[] to JSONL (one item per line).
    const lines = (d.items || []).map(x => JSON.stringify(x)).join("\n");
    const blob = new Blob([lines], { type: "application/x-ndjson" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    const safeName = (ALIGN_CAMPAIGN_NAME || ALIGN_CAMPAIGN_ID).replace(/[^a-zA-Z0-9._-]/g, "_");
    a.download = `alignment_${safeName}.jsonl`;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => { URL.revokeObjectURL(url); a.remove(); }, 100);
  } catch (err) {
    toast(tr("align.toast.export_failed") + ": " + err.message, "err");
  }
}

function renderCampaignList(campaigns) {
  const ul = document.getElementById("al-campaign-list");
  ul.innerHTML = "";
  const noMsg = document.getElementById("al-no-campaigns");
  // Filter: participant only (admin sees all)
  const visible = campaigns.filter(c => ALIGN_IS_ADMIN || c.is_participant);
  if (visible.length === 0) {
    noMsg.hidden = false;
    return;
  }
  noMsg.hidden = true;
  for (const c of visible) {
    const li = document.createElement("li");
    li.className = "campaign-row" + (c.audience ? " aud-" + c.audience : "");
    const audKey = "align.audience_tag." + (c.audience || "custom");
    const audIcon = { reviewers: "🛡", all: "🌐", custom: "🎯" }[c.audience] || "🎯";
    const total = c.total ?? 50;
    const myDone = c.my_done ?? 0;
    const myPct = total ? Math.round(100 * myDone / total) : 0;
    const nFin = c.n_finalized ?? 0;
    const finPct = total ? Math.round(100 * nFin / total) : 0;
    li.innerHTML = `
      <div class="campaign-head">
        <span class="campaign-icon">${audIcon}</span>
        <div class="campaign-meta">
          <div class="campaign-name-row">
            <strong>${escapeHtml(c.name || ("Campaign #" + (c.campaign_id || "").slice(0,6)))}</strong>
            <span class="tag aud-tag tag-${escapeHtml(c.audience || 'custom')}">${tr(audKey)}</span>
          </div>
          <div class="campaign-sub muted">by ${escapeHtml(c.by || "—")}</div>
        </div>
        <div class="campaign-progress">
          ${(c.is_participant || ALIGN_IS_ADMIN) ? `
            <div class="mini-progress" title="Your progress">
              <span class="mini-label">me</span>
              <div class="mini-bar"><div class="mini-fill" style="width:${myPct}%"></div></div>
              <span class="mini-num">${myDone}/${total}</span>
            </div>
          ` : ""}
          ${ALIGN_IS_ADMIN ? `
            <div class="mini-progress" title="Finalized by admin">
              <span class="mini-label">final</span>
              <div class="mini-bar"><div class="mini-fill fin" style="width:${finPct}%"></div></div>
              <span class="mini-num">${nFin}/${total}</span>
            </div>
          ` : ""}
        </div>
        <button type="button" class="al-enter-btn" data-cid="${escapeHtml(c.campaign_id)}" data-cname="${escapeHtml(c.name || '')}">${tr("align.select_btn")} →</button>
      </div>
    `;
    li.querySelector(".al-enter-btn").addEventListener("click", (e) => {
      const cid = e.currentTarget.dataset.cid;
      const cname = e.currentTarget.dataset.cname;
      selectCampaign(cid, cname);
    });
    ul.appendChild(li);
  }
}

async function selectCampaign(campaign_id, name) {
  ALIGN_CAMPAIGN_ID = campaign_id;
  ALIGN_CAMPAIGN_NAME = name;
  document.getElementById("al-name").textContent = name || campaign_id.slice(0, 6);
  document.getElementById("al-current-name").hidden = false;
  document.getElementById("al-picker").hidden = true;
  document.getElementById("al-start-form").hidden = true;
  await loadAlignStatus();
}

async function loadAlignStatus() {
  hideAlignSections();
  document.getElementById("al-progress-stat").hidden = true;
  const user = localStorage.getItem(CFG.LS_USER);
  if (!ALIGN_CAMPAIGN_ID) return;
  try {
    const r = await fetch(`${CFG.APPS_SCRIPT_URL}/?action=align_status&user=${encodeURIComponent(user)}&campaign_id=${encodeURIComponent(ALIGN_CAMPAIGN_ID)}`);
    const d = await r.json();
    if (d.error === "not a participant" || d.error === "not_a_participant") {
      toast(tr("align.toast.not_a_participant"), "err");
      ALIGN_CAMPAIGN_ID = null;
      await loadAlignList();
      return;
    }
    document.getElementById("al-done").textContent = d.my_done ?? 0;
    document.getElementById("al-total").textContent = d.total ?? 50;
    document.getElementById("al-progress-stat").hidden = false;
    if (ALIGN_IS_ADMIN) {
      document.getElementById("al-final-count").textContent = `${d.n_finalized ?? 0} finalized / ${d.total ?? 50}`;
      renderAdminOverview(d.items || []);
      document.getElementById("al-admin-overview").hidden = false;
    }
    await loadAlignNext();
  } catch (err) {
    document.getElementById("al-err-msg").textContent = err.message;
    document.getElementById("al-error").hidden = false;
  }
}

function hideAlignSections() {
  for (const id of ["al-picker", "al-done-msg", "al-item", "al-others", "al-admin-overview", "al-error", "al-start-form"]) {
    const el = document.getElementById(id); if (el) el.hidden = true;
  }
}

async function loadAlignNext() {
  const user = localStorage.getItem(CFG.LS_USER);
  if (!ALIGN_CAMPAIGN_ID) return;
  try {
    const r = await fetch(`${CFG.APPS_SCRIPT_URL}/?action=align_next&user=${encodeURIComponent(user)}&campaign_id=${encodeURIComponent(ALIGN_CAMPAIGN_ID)}`);
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
    wireVideoFallback(vid, { onSkip: () => loadAlignNext() });
    vid.src = absUrl(d.video_url || "");
    vid.load();
    // Ignore d.prompt (may be prefix/rewrite version) — always fetch canonical instruction.txt from HF.
    fetchInstructionInto(d.video_url, "al-prompt");
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
  if (!notes) { toast(tr("toast.notes_required"), "err"); return; }
  const payload = {
    physical_adherence: Number(document.getElementById("al-physical_adherence").value),
    instruction_alignment: Number(document.getElementById("al-instruction_alignment").value),
    notes,
  };
  for (const id of ["agent_consistency", "scene_consistency", "interaction_realism", "agent_match", "object_correct", "goal_completed"]) {
    payload[id] = document.getElementById("al-" + id).checked ? 0 : 1;
  }
  try {
    const r = await fetch(CFG.APPS_SCRIPT_URL + "/", {
      method: "POST", headers: { "Content-Type": "text/plain" },
      body: JSON.stringify({ align_submit: true, user, campaign_id: ALIGN_CAMPAIGN_ID, item_id: ALIGN_CURRENT.id, payload }),
    });
    const d = await r.json();
    if (d?.ok === false) throw new Error(d.error || "submit failed");
    // Reload item with others' annotations now unlocked
    await showAlignOthers(ALIGN_CURRENT.id);
    // Refresh status (my_done++ / admin overview refresh)
    await refreshAlignStatusOnly();
  } catch (err) {
    toast(tr("toast.submit_failed") + ": " + err.message, "err");
  }
}

async function refreshAlignStatusOnly() {
  const user = localStorage.getItem(CFG.LS_USER);
  if (!ALIGN_CAMPAIGN_ID) return;
  try {
    const r = await fetch(`${CFG.APPS_SCRIPT_URL}/?action=align_status&user=${encodeURIComponent(user)}&campaign_id=${encodeURIComponent(ALIGN_CAMPAIGN_ID)}`);
    const d = await r.json();
    if (d && !d.error) {
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
  if (!ALIGN_CAMPAIGN_ID) return;
  try {
    const r = await fetch(`${CFG.APPS_SCRIPT_URL}/?action=align_item&user=${encodeURIComponent(user)}&campaign_id=${encodeURIComponent(ALIGN_CAMPAIGN_ID)}&item_id=${encodeURIComponent(item_id)}`);
    const d = await r.json();
    if (d.locked) {
      toast(tr("toast.align_locked"), "err");
      return;
    }
    document.getElementById("al-item").hidden = true;
    document.getElementById("al-others").hidden = false;
    renderAlignOthers(d);
  } catch (err) {
    toast("Failed to load others' annotations: " + err.message, "err");
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
  // Conflict detection: max-min spread on each main score across all annotators.
  const annots = d.annotations || [];
  const paVals = annots.map(a => a.payload?.physical_adherence).filter(v => v != null);
  const iaVals = annots.map(a => a.payload?.instruction_alignment).filter(v => v != null);
  const paSpread = paVals.length >= 2 ? Math.max(...paVals) - Math.min(...paVals) : 0;
  const iaSpread = iaVals.length >= 2 ? Math.max(...iaVals) - Math.min(...iaVals) : 0;
  const paConflict = paSpread >= 3;
  const iaConflict = iaSpread >= 3;
  if (paConflict || iaConflict) {
    const banner = document.createElement("div");
    banner.className = "conflict-banner";
    const parts = [];
    if (paConflict) parts.push(`<span class="conflict-tag">⚠ Physical 分歧 Δ=${paSpread}</span>`);
    if (iaConflict) parts.push(`<span class="conflict-tag">⚠ Instruction 分歧 Δ=${iaSpread}</span>`);
    banner.innerHTML = `<strong>大幅分歧</strong> · ${parts.join(" · ")} <span class="muted small">— 请重点讨论</span>`;
    root.appendChild(banner);
  }
  for (const a of annots) {
    const p = a.payload || {};
    const isSelf = a.is_self;
    const isAdminA = a.is_admin_author;
    const card = document.createElement("div");
    card.className = "align-other-card" + (isSelf ? " self" : "") + (isAdminA ? " admin-author" : "");
    // Per-card outlier marker if this annotator's score is the max or min of a conflicting axis.
    const isOutlierPA = paConflict && (p.physical_adherence === Math.max(...paVals) || p.physical_adherence === Math.min(...paVals));
    const isOutlierIA = iaConflict && (p.instruction_alignment === Math.max(...iaVals) || p.instruction_alignment === Math.min(...iaVals));
    card.innerHTML = `
      <div class="aoc-head">
        <strong>${escapeHtml(a.reviewer)}</strong>
        ${isSelf ? '<span class="row-badge gold">YOU</span>' : ''}
        ${isAdminA ? '<span class="row-badge report">ADMIN</span>' : ''}
      </div>
      <p class="aoc-scores">Physical: <strong class="${isOutlierPA ? 'conflict-score' : ''}">${p.physical_adherence ?? "—"}</strong> · Instruction: <strong class="${isOutlierIA ? 'conflict-score' : ''}">${p.instruction_alignment ?? "—"}</strong></p>
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
  // Inverted: stored 0 = violated = checkbox checked (red ✗); stored 1 = pass = unchecked.
  const checked = (k) => p[k] === 0 ? "checked" : "";
  wrap.innerHTML = `
    <form id="al-finalize-form">
      <p class="violation-notice">${tr("sub.violation_notice")}</p>
      <fieldset class="dim-block">
        <legend class="dim-block-title">Physical Adherence (final)</legend>
        <div class="form-row">
          <label for="f-physical_adherence">Score (1–5) <output for="f-physical_adherence" id="f-physical_adherence-out">${p.physical_adherence ?? 3}</output></label>
          <input type="range" id="f-physical_adherence" min="1" max="5" step="1" value="${p.physical_adherence ?? 3}">
          <p class="score-hint level-${p.physical_adherence ?? 3}" id="f-physical_adherence-hint">—</p>
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
          <p class="score-hint level-${p.instruction_alignment ?? 3}" id="f-instruction_alignment-hint">—</p>
        </div>
        <div class="sub-row">
          <label class="sub-check"><input type="checkbox" id="f-agent_match" ${checked("agent_match")}> <span>Agent match</span></label>
          <label class="sub-check"><input type="checkbox" id="f-object_correct" ${checked("object_correct")}> <span>Object correct</span></label>
          <label class="sub-check"><input type="checkbox" id="f-goal_completed" ${checked("goal_completed")}> <span>Goal completed</span></label>
        </div>
      </fieldset>
      <div class="form-row">
        <label for="f-notes">Finalize note <span class="required-tag">*</span></label>
        <textarea id="f-notes" rows="2" maxlength="500" placeholder="Required — synthesize the consensus / explain final values">${escapeHtml(p.notes || "")}</textarea>
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
  wireScoreHint("f-physical_adherence", "f-physical_adherence-hint", "pa");
  wireScoreHint("f-instruction_alignment", "f-instruction_alignment-hint", "ia");
  document.getElementById("al-finalize-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    await submitAlignFinalize(d.item_id || ALIGN_CURRENT.id);
  });
}

async function submitAlignFinalize(item_id) {
  const admin = localStorage.getItem(CFG.LS_USER);
  const notes = document.getElementById("f-notes").value.trim();
  if (!notes) { toast(tr("toast.finalize_note_required"), "err"); return; }
  const payload = {
    physical_adherence: Number(document.getElementById("f-physical_adherence").value),
    instruction_alignment: Number(document.getElementById("f-instruction_alignment").value),
    notes,
  };
  for (const id of ["agent_consistency","scene_consistency","interaction_realism","agent_match","object_correct","goal_completed"]) {
    payload[id] = document.getElementById("f-" + id).checked ? 0 : 1;
  }
  try {
    const r = await fetch(CFG.APPS_SCRIPT_URL + "/", {
      method: "POST", headers: { "Content-Type": "text/plain" },
      body: JSON.stringify({ align_finalize: true, admin, campaign_id: ALIGN_CAMPAIGN_ID, item_id, payload }),
    });
    const d = await r.json();
    if (d?.ok === false) throw new Error(d.error || "finalize failed");
    toast(tr("toast.finalize_success"), "ok");
    await refreshAlignStatusOnly();
  } catch (err) {
    toast(tr("toast.finalize_failed") + ": " + err.message, "err");
  }
}

function renderAdminOverview(items) {
  const root = document.getElementById("al-admin-list");
  root.innerHTML = "";
  // Sort: unfinalized first (admin needs to act); within each group, more annotations first (ready to finalize).
  const sorted = items.slice().sort((a, b) => {
    const fa = a.finalized ? 1 : 0, fb = b.finalized ? 1 : 0;
    if (fa !== fb) return fa - fb;
    return (b.n_annotations ?? 0) - (a.n_annotations ?? 0);
  });
  for (const it of sorted) {
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

/* Embodied World Judge — Annotation app.js */

const CFG = {
  APPS_SCRIPT_URL: window.__APPS_SCRIPT_URL__ || null,
  HF_RESOLVE_BASE: "https://huggingface.co/datasets/HuggingFriends/mllm-as-embodied-world-judge/resolve/main",
  LS_USER: "ewj_annotator",
  LS_ROLE: "ewj_role",
  LS_DONE: "ewj_done",
  LS_LANG: "ewj_lang",
  LS_VIDEO_HOST: "ewj_video_host",
  // Only list hosts that ACTUALLY proxy bytes. hf-mirror.com is a 308-redirector
  // for /datasets/ paths (bounces to huggingface.co → same blocked Xet CDN), so
  // including it gives users a misleading "I switched sources" placebo. Removed
  // until a real China-reachable host (reverse proxy or OSS) is provisioned;
  // architecture preserved so the chip + onerror cycle re-engage automatically
  // when a second host is added here (or supplied via it.video_sources in v58).
  VIDEO_HOSTS: [
    { key: "huggingface.co", label: "HF", title: "HuggingFace (默认)" },
  ],
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
    "align.iaa.within1": "Within ±1",
    "align.iaa.std_dev": "Std-dev (pts)",
    "align.iaa.n_items": "Items",
    "align.iaa.title": "Inter-annotator agreement",
    "align.iaa.no_data": "Not enough multi-rater items to compute agreement yet.",
    "align.iaa.top_items": "Top divergent items",
    "align.iaa.main_scores": "Main scores (1–5)",
    "align.iaa.sub_scores": "Sub-items (0/1/2 ordinal)",
    "align.iaa.open_item": "open item",
    "align.iaa.alpha_tip": "Krippendorff α: chance-corrected inter-rater agreement. 1.0 = perfect agreement; 0 = chance-level; <0 = worse than chance. Conventional bands: >0.8 high, 0.67–0.8 acceptable, <0.67 weak. Computed with interval distance (squared) on main scores 1–5 and ordinal on sub-items 0/1/2.",
    "align.iaa.exact_tip": "Fraction of items where ALL raters gave the same exact score. On a 5-point scale, random chance is only ~4%, so this number is usually low even with strong agreement — replaced by ±1 and std-dev below in v76.",
    "align.iaa.mean_diff_tip": "Average |scoreA − scoreB| across every pair of raters on each item, then averaged across items. Units match the scale (so 0.78 on the 1–5 main scale means raters typically differ by ~0.78 points). Lower = more agreement.",
    "align.iaa.within1_tip": "Fraction of rater-pairs whose scores differ by at most 1 on each item, averaged across items. On a 1–5 scale this is the most readable signal — 76% means most pairs are 'basically agreeing'.",
    "align.iaa.std_dev_tip": "Per-item standard deviation of rater scores, averaged across items. Units = points (e.g. 0.78 means a typical item's raters spread by ~0.78 points around their mean). Lower = more agreement; 0 = unanimous.",
    "align.iaa.n_items_tip": "Number of items with at least 2 raters — only those contribute to the agreement metrics.",
    "align.disclose.confirm": "Submitted ✓\n\nSee how others scored this? You will permanently lock this item — re-edit no longer allowed.\n\nOK = see + lock\nCancel = continue annotating, this item stays editable",
    "align.disclose.locked_toast": "Item disclosed and locked.",
    "align.disclose.label": "🔒 disclosed:",
    "align.browse_mine_btn": "📋 Browse my items",
    "align.my_items_title": "My items in this campaign",
    "align.my_items_hint": "Mixed states: submitted-editable items can still be re-scored; disclosed items are locked. Click 「👁 See others」 to disclose + lock an item.",
    "align.my_back_btn": "← Back",
    "align.state.todo": "TODO",
    "align.state.editable": "EDITABLE",
    "align.state.disclosed": "DISCLOSED",
    "align.state.finalized": "FINALIZED",
    "align.row.annotate": "📝 Annotate",
    "align.row.edit": "✏ Edit",
    "align.row.disclose": "👁 See others (locks)",
    "align.row.view_disclosed": "👁 View",
    "align.row.view_finalized": "✓ View finalized",
    "align.disclose_all_btn": "✅ See everyone (lock all my items)",
    "align.disclose_all.confirm": "This will permanently LOCK all your submitted items in this campaign — you cannot re-edit any of them after this.\n\nIn return, you'll see all annotators' scores (real names) + IAA + Export — same view as admin (minus finalize).\n\nProceed?",
    "align.disclose_all.done_toast": "All items disclosed. Opening results panel…",
    "sub.tri.violated": "0 — Clear violation",
    "sub.tri.partial": "1 — Partial / minor issue",
    "sub.tri.passes": "2 — Holds / passes",
    "align.overview.end_of_list": "End of the list. Use the overview to pick another item.",
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
    "task.init_frame": "Init frame",
    "task.notes": "Notes",
    "task.notes_placeholder": "Required — explain your reasoning (what you saw, key violations, key successes)…",
    "task.physical_notes": "Physical evidence",
    "task.physical_notes_placeholder": "Required — visual evidence for the physical score (any violation observed)",
    "task.instruction_notes": "Instruction-alignment evidence",
    "task.instruction_notes_placeholder": "Required — visual evidence for the instruction score (what was / wasn't done)",
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
    "review.approve": "✅ Approve",
    "review.modify": "✏ Adjust",
    "review.minor": "✏ Adjust",
    "review.major": "🛑 Reject",
    "review.decision.approve": "✅ Approved",
    "review.decision.minor": "✏ Adjusted",
    "review.decision.major": "🛑 Rejected",
    "quality.no_reviews_yet": "No reviews yet — start annotating and your quality stats will appear here.",
    "quality.this_week": "This week",
    "quality.reviewed_unit": "reviewed",
    "quality.pass_rate": "pass rate",
    "quality.full_pass_rate": "full-pass rate",
    "quality.earned_this_week": "Earned this week",
    "quality.tier.bonus": "Bonus tier",
    "quality.tier.base": "Base tier",
    "quality.tier.low": "Reduced tier",
    "quality.tier.interim": "Interim (need ≥10 reviews)",
    "quality.tier.paused": "PAUSED",
    "quality.pause.normal": "",
    "quality.pause.reannotate_required": "⚠ Your pass rate fell below 60%. New tasks paused — clear the re-annotate queue to resume.",
    "quality.pause.admin_review": "🛑 Account in admin review (consecutive low quality). Admin will decide next step.",
    "quality.rework.pending": "Quality is below 60%. You have {N} unreviewed items to redo (priority-sorted in My Annotations). You can still take new tasks while clearing them.",
    "quality.rework.admin_review": "🛑 Re-do queue cleared but pass rate is still below 60%. Admin will review and decide next step.",
    "my_annotations.rework_badge": "❗ Redo",
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
    "align.view_results_btn": "📊 View alignment results (read-only)",
    "align.view_results_short": "📊 View results (read-only)",
    "align.read_only_badge": "read-only",
    "page.my_annotations": "My annotations",
    "home.card.my_annotations.title": "My annotations",
    "home.card.my_annotations.sub": "Edit unreviewed entries",
    "my_annotations.tab.all": "All",
    "my_annotations.tab.task": "Task",
    "my_annotations.tab.gold": "Gold",
    "my_annotations.hint": "Unreviewed entries can be edited. Once a reviewer/admin acts on them, they are locked.",
    "my_annotations.empty": "No annotations yet.",
    "my_annotations.reviewed_badge": "reviewed",
    "my_annotations.editable_badge": "editable",
    "my_annotations.locked": "locked",
    "my_annotations.edit_btn": "Edit",
    "my_annotations.update_btn": "Update",
    "my_annotations.not_found": "Annotation not found or already reviewed.",
    "my_annotations.already_reviewed": "This annotation has been reviewed and can no longer be edited.",
    "my_annotations.updated_toast": "Updated.",
    "my_annotations.diff.your_submission": "Your submission",
    "my_annotations.diff.reviewer_final": "Reviewer (final)",
    "gold_library.edit_gold": "Edit gold",
    "gold_library.audit_tip": "Override history",
    "gold_library.override_btn": "Save override",
    "gold_library.override_done_toast": "Gold overridden + audit logged.",
    "gold_library.reason_label": "Reason for override",
    "gold_library.reason_placeholder": "Required — why you're changing this gold (e.g. corrects misjudged interaction physics)",
    "gold_library.reason_required": "Override reason is required.",
    "gold_library.not_found": "Gold item not found.",
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
    "align.iaa.within1": "±1 内一致率",
    "align.iaa.std_dev": "标准差(分)",
    "align.iaa.n_items": "样本数",
    "align.iaa.title": "标注者间一致性",
    "align.iaa.no_data": "尚无足够多人标的样本计算一致性。",
    "align.iaa.top_items": "分歧最大的样本",
    "align.iaa.main_scores": "主分(1–5)",
    "align.iaa.sub_scores": "子项(0/1/2 三档有序)",
    "align.iaa.open_item": "打开",
    "align.iaa.alpha_tip": "Krippendorff α:扣除随机一致后的标注者间一致性指标。1.0=完全一致;0=随机水平;<0=比随机还差。常用区间:>0.8 优秀、0.67–0.8 可接受、<0.67 偏弱。主分按 interval(平方距离)算,子项 0/1/2 按 ordinal 算。",
    "align.iaa.exact_tip": "所有标注者打出**完全一样**的分数的样本比例。1-5 尺度下随机概率只有 ~4%,所以这个数即使一致性很强也偏低 — 已被下方的 ±1 和标准差替代(v76)。",
    "align.iaa.mean_diff_tip": "任意两位标注者对同一 item 的 |分差| 平均(先 per item 再跨 item 平均)。单位跟尺度一致(主分 0.78 = 平均相差 0.78 分)。越小越一致。",
    "align.iaa.within1_tip": "标注者两两打分**差≤1分**的比例(逐 item 算后跨 item 平均)。1-5 尺度上最直观 — 76% 就是「大多数人基本一致」。",
    "align.iaa.std_dev_tip": "每条样本上各标注者打分的标准差(逐 item 算后跨 item 平均),单位是**分**(主分 0.78 = 每条样本上标注者打分平均散布 ~0.78 分)。越小越一致,0 = 完全一致。",
    "align.iaa.n_items_tip": "至少有 2 位标注者打过分的样本数 — 只有这些才参与一致性计算。",
    "align.disclose.confirm": "已提交 ✓\n\n要现在看大家怎么标吗?**看了这条就永久锁定**,不能再改。\n\n确定 = 看 + 锁\n取消 = 继续标下一条,这条仍可改",
    "align.disclose.locked_toast": "已锁定该条。",
    "align.disclose.label": "🔒 已锁:",
    "align.browse_mine_btn": "📋 浏览我标的条目",
    "align.my_items_title": "我在这个 campaign 的条目",
    "align.my_items_hint": "混合态:提交但未 disclose 的条目可改;disclose 后锁定。点「👁 看大家(会锁)」可 disclose + 锁定。",
    "align.my_back_btn": "← 返回",
    "align.state.todo": "未标",
    "align.state.editable": "可改",
    "align.state.disclosed": "已锁",
    "align.state.finalized": "已 final",
    "align.row.annotate": "📝 标注",
    "align.row.edit": "✏ 编辑",
    "align.row.disclose": "👁 看大家(会锁)",
    "align.row.view_disclosed": "👁 查看",
    "align.row.view_finalized": "✓ 查看金标",
    "align.disclose_all_btn": "✅ 看所有人(锁我全部条目)",
    "align.disclose_all.confirm": "此操作会永久锁定你在这个 campaign 里所有已提交的条目 — 之后**任何一条都不能再改**。\n\n作为交换,你会看到所有标注者的分数(真名)+ IAA + Export — 跟 admin 同款视图(只是不能 finalize)。\n\n继续吗?",
    "align.disclose_all.done_toast": "全部已锁定,打开结果面板…",
    "sub.tri.violated": "0 严重违背",
    "sub.tri.partial": "1 部分·轻微",
    "sub.tri.passes": "2 完全通过",
    "align.overview.end_of_list": "列表到底了。回 overview 选另一条。",
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
    "task.init_frame": "起始帧",
    "task.notes": "备注",
    "task.notes_placeholder": "必填 — 简述你的判断依据(看到了什么、关键违反、关键成功)…",
    "task.physical_notes": "物理证据",
    "task.physical_notes_placeholder": "必填 — 物理评分的视觉证据(观察到的任何违反)",
    "task.instruction_notes": "指令对齐证据",
    "task.instruction_notes_placeholder": "必填 — 指令评分的视觉证据(做了 / 没做什么)",
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
    "review.approve": "✅ 通过",
    "review.modify": "✏ 调整",
    "review.minor": "✏ 调整",
    "review.major": "🛑 不通过",
    "review.decision.approve": "✅ 通过",
    "review.decision.minor": "✏ 调整",
    "review.decision.major": "🛑 不通过",
    "quality.no_reviews_yet": "暂无审核记录 — 开始标注后这里会显示你的质量统计。",
    "quality.this_week": "本周",
    "quality.reviewed_unit": "条已审",
    "quality.pass_rate": "通过率",
    "quality.full_pass_rate": "完全通过率",
    "quality.earned_this_week": "本周已挣",
    "quality.tier.bonus": "奖励档",
    "quality.tier.base": "正常档",
    "quality.tier.low": "减扣档",
    "quality.tier.interim": "暂结(需 ≥10 条)",
    "quality.tier.paused": "已暂停",
    "quality.pause.normal": "",
    "quality.pause.reannotate_required": "⚠ 通过率跌破 60% — 新任务已暂停,清空重标队列后恢复。",
    "quality.pause.admin_review": "🛑 账号进入 admin 复审(连续低质),admin 将决定下一步。",
    "quality.rework.pending": "通过率低于 60%。你有 {N} 条未审条目待重做(已在「我的标注」里红❗优先排)。可以同时继续接新任务。",
    "quality.rework.admin_review": "🛑 重做池已清空但通过率仍 <60%,admin 将审核决定下一步。",
    "my_annotations.rework_badge": "❗ 重做",
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
    "align.view_results_btn": "📊 查看 alignment 结果(只读)",
    "align.view_results_short": "📊 查看结果(只读)",
    "align.read_only_badge": "只读",
    "page.my_annotations": "我的标注",
    "home.card.my_annotations.title": "我的标注",
    "home.card.my_annotations.sub": "编辑未被审核的条目",
    "my_annotations.tab.all": "全部",
    "my_annotations.tab.task": "Task",
    "my_annotations.tab.gold": "Gold",
    "my_annotations.hint": "未被审核的条目可编辑;一旦 reviewer/admin 介入(approve/modify/finalize)就锁定。",
    "my_annotations.empty": "暂无标注。",
    "my_annotations.reviewed_badge": "已审核",
    "my_annotations.editable_badge": "可编辑",
    "my_annotations.locked": "已锁",
    "my_annotations.edit_btn": "编辑",
    "my_annotations.update_btn": "更新",
    "my_annotations.not_found": "标注不存在或已被审核。",
    "my_annotations.already_reviewed": "此标注已被审核,不能再修改。",
    "my_annotations.updated_toast": "已更新。",
    "my_annotations.diff.your_submission": "你的提交",
    "my_annotations.diff.reviewer_final": "Reviewer 终值",
    "gold_library.edit_gold": "编辑金标",
    "gold_library.audit_tip": "编辑历史",
    "gold_library.override_btn": "保存覆盖",
    "gold_library.override_done_toast": "金标已覆盖, audit 已记录。",
    "gold_library.reason_label": "覆盖原因",
    "gold_library.reason_placeholder": "必填 — 为什么改这条金标(例:原 interaction 物理判断有误)",
    "gold_library.reason_required": "覆盖原因必填。",
    "gold_library.not_found": "金标条目未找到。",
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
  // Immediately swap the currently-displayed instruction to the new language.
  applyCurrentInstruction();
}

// Track the currently-displayed instruction (both languages cached) so language toggle is instant.
let CURRENT_INSTRUCTION = null;

/* Render the cached instruction into its target element according to current lang.
   Prefers backend-provided `instruction`/`instruction_cn` (no HTTP); only falls back
   to HF file fetch if neither was supplied. */
function applyCurrentInstruction() {
  const ci = CURRENT_INSTRUCTION;
  if (!ci) return;
  const target = document.getElementById(ci.targetId);
  if (!target) return;
  const lang = getLang();
  if (lang === "cn" && ci.cn) { target.textContent = ci.cn; return; }
  if (lang === "en" && ci.en) { target.textContent = ci.en; return; }
  if (ci.en) { target.textContent = ci.en; return; }
  if (ci.cn) { target.textContent = ci.cn; return; }
  // No cached text → fall back to fetching from HF.
  if (ci.video_url) fetchInstructionInto(ci.video_url, ci.targetId);
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
  const onSkip = opts && opts.onSkip;
  let retries = 0;
  let srcCursor = -1;  // initialized lazily
  videoEl.addEventListener("error", () => {
    // Prefer per-element stored sources (correct for OSS + HF + any future host).
    let sources = null;
    if (videoEl.dataset.sourcesJson) {
      try { sources = JSON.parse(videoEl.dataset.sourcesJson); } catch {}
    }
    if (sources && sources.length) {
      const maxRetries = (opts && opts.maxRetries) || sources.length;
      if (srcCursor < 0) {
        const curBase = (videoEl.src || "").split(/[?&]_cb=/)[0];
        srcCursor = Math.max(0, sources.findIndex(s => s && s.url && s.url.split(/[?&]_cb=/)[0] === curBase));
      }
      if (retries < maxRetries) {
        retries++;
        srcCursor = (srcCursor + 1) % sources.length;
        const next = sources[srcCursor];
        if (next && next.url) {
          const sep = next.url.includes("?") ? "&" : "?";
          const newSrc = next.url + sep + "_cb=" + (Date.now() % 100000);
          console.warn(`video load failed (try ${retries}/${maxRetries}) — auto-swap to ${next.label || next.host}:`, videoEl.src);
          videoEl.src = newSrc;
          videoEl.load();
          return;
        }
      }
    } else {
      // Legacy host-swap path for elements without per-element sources.
      const HOST_KEYS = getVideoHosts().map(h => h.key);
      const maxRetries = (opts && opts.maxRetries) || HOST_KEYS.length;
      if (srcCursor < 0) srcCursor = Math.max(0, HOST_KEYS.indexOf(getVideoHost()));
      if (retries < maxRetries) {
        retries++;
        const base = videoEl.src.split(/[?&]_cb=/)[0].replace(/[?&]$/, "");
        srcCursor = (srcCursor + 1) % HOST_KEYS.length;
        const swapped = base.replace(/^https?:\/\/[^\/]+\//i, `https://${HOST_KEYS[srcCursor]}/`);
        const sep = swapped.includes("?") ? "&" : "?";
        const newSrc = swapped + sep + "_cb=" + (Date.now() % 100000);
        console.warn(`video load failed (try ${retries}/${maxRetries}) — auto-swap to ${HOST_KEYS[srcCursor]}:`, videoEl.src);
        videoEl.src = newSrc;
        videoEl.load();
        return;
      }
    }
    // Final: render inline placeholder.
    if (videoEl.parentElement?.querySelector(".video-failed")) return;
    const cn = getLang() === "cn";
    const msgFail = cn ? "视频加载失败" : "Video failed to load";
    const lblRetry = cn ? "重试" : "Retry";
    const lblSkip = cn ? "跳过" : "Skip";
    // Only show swap button if there's another real host to swap to.
    const hosts = getVideoHosts();
    const otherHost = hosts.length >= 2
      ? hosts.find(h => h.key !== getVideoHost())
      : null;
    const lblSwap = otherHost
      ? (cn ? `换 ${otherHost.label} 源` : `Switch to ${otherHost.label}`)
      : null;
    const ph = document.createElement("div");
    ph.className = "video-failed";
    ph.innerHTML = `
      <div class="video-failed-icon">⚠</div>
      <div class="video-failed-msg">${msgFail}</div>
      <div class="video-failed-actions">
        <button type="button" class="ghost video-retry-btn">${lblRetry}</button>
        ${otherHost ? `<button type="button" class="ghost video-swap-btn" title="${escapeHtml(otherHost.title)}">${lblSwap}</button>` : ""}
        ${onSkip ? `<button type="button" class="ghost video-skip-btn">${lblSkip}</button>` : ""}
      </div>`;
    ph.querySelector(".video-retry-btn").addEventListener("click", () => {
      retries = 0;
      srcCursor = -1;  // will reinit on next error
      ph.remove();
      videoEl.style.display = "";
      // Reset to current selection's URL (prefer per-element sources, else legacy host-swap).
      let sources = null;
      try { sources = videoEl.dataset.sourcesJson ? JSON.parse(videoEl.dataset.sourcesJson) : null; } catch {}
      const original = videoEl.dataset.originalSrc || videoEl.src.split(/[?&]_cb=/)[0];
      videoEl.src = (sources && sources.length)
        ? pickVideoUrl(sources, original)
        : applyVideoHost(original);
      videoEl.load();
    });
    if (otherHost) {
      ph.querySelector(".video-swap-btn").addEventListener("click", () => {
        setVideoHost(otherHost.key);  // swaps all videos page-wide
        retries = 0;
        ph.remove();
        videoEl.style.display = "";
        videoEl.load();
        toast(cn ? `已切换到 ${otherHost.label} 源` : `Switched to ${otherHost.label}`, "ok");
      });
    }
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
  wireSubTriButtons();  // 6 sub-tri groups in task form

  await refreshStats();
  // Edit mode: ?edit=<item_id> loads the existing annotation and prefills the form.
  const editId = new URLSearchParams(window.location.search).get("edit");
  if (editId) {
    await loadForEdit(editId, "task");
  } else {
    await loadNext();
  }
}

/* Currently-being-edited annotation (task or gold). When set, submit goes back to my_annotations.html
   instead of advancing to the next item. */
let EDIT_MODE = null;  // { kind: "task"|"gold", item_id }

async function loadForEdit(item_id, kind) {
  hide("error"); hide("item"); show("loading");
  const user = localStorage.getItem(CFG.LS_USER);
  try {
    const url = `${CFG.APPS_SCRIPT_URL}/?action=my_annotations&user=${encodeURIComponent(user)}&kind=${encodeURIComponent(kind)}`;
    const res = await fetch(url);
    const data = await res.json();
    if (data?.ok === false) throw new Error(data.error || "fetch failed");
    const it = (data.items || []).find(x => x.item_id === item_id);
    if (!it) { showError(tr("my_annotations.not_found")); return; }
    if (it.reviewed) { showError(tr("my_annotations.already_reviewed")); return; }
    EDIT_MODE = { kind, item_id };
    CURRENT = { id: it.item_id, video_url: it.video_url, dataset: it.dataset, task: it.task,
                video_sources: it.video_sources, instruction: it.instruction, instruction_cn: it.instruction_cn,
                gt_url: it.gt_url };
    renderItem(CURRENT);
    prefillAnnotateForm(it.payload || {});
    // Re-label submit button + show an "edit mode" banner.
    const submitBtn = document.querySelector('#annotate-form button[type="submit"]');
    if (submitBtn) submitBtn.textContent = tr("my_annotations.update_btn");
    // Skip button doesn't make sense in edit mode — hide it.
    const skipBtn = document.getElementById("skip-btn");
    if (skipBtn) skipBtn.hidden = true;
    hide("loading"); show("item");
  } catch (err) {
    showError("Failed to load for edit: " + err.message);
  }
}

/* Prefill the task/gold annotate form from an existing payload (used in edit mode). */
function prefillAnnotateForm(p) {
  const set = (id, val) => {
    const el = document.getElementById(id);
    if (el != null && val != null) {
      el.value = val;
      const out = document.getElementById(id + "-out");
      if (out) out.value = val;
    }
  };
  if (p.physical_adherence != null) set("physical_adherence", p.physical_adherence);
  if (p.instruction_alignment != null) set("instruction_alignment", p.instruction_alignment);
  // Sub-tri (3-class): stored 0=violated / 1=partial / 2=passes. Default fresh = 2.
  for (const id of ["agent_consistency", "scene_consistency", "interaction_realism", "agent_match", "object_correct", "goal_completed"]) {
    setSubTri(id, p[id] ?? 2);
  }
  const pn = document.getElementById("physical_notes"); if (pn) pn.value = p.physical_notes || "";
  const ins = document.getElementById("instruction_notes"); if (ins) ins.value = p.instruction_notes || "";
  // Trigger hint updates by firing input on each slider.
  for (const id of ["physical_adherence", "instruction_alignment"]) {
    const slider = document.getElementById(id);
    if (slider) slider.dispatchEvent(new Event("input"));
  }
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
  setVideoSourcesFromItem(it);
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
  gen.src = pickVideoUrl(it.video_sources, it.video_url);
  bindVideoSources(gen, it.video_sources);
  gen.load();
  setInitFrame(it.init_frame_url, "");
  const gtFig = document.getElementById("gt-fig");
  const gt = document.getElementById("gt-video");
  if (it.gt_url) {
    // GT-side sources may be a separate field; fall back to host-swap on the gt_url.
    gt.src = pickVideoUrl(it.gt_video_sources, it.gt_url);
    bindVideoSources(gt, it.gt_video_sources);
    gt.load();
    gtFig.hidden = false;
  } else {
    gt.removeAttribute("src");
    gtFig.hidden = true;
  }
  document.getElementById("physical_notes").value = "";
  document.getElementById("instruction_notes").value = "";
  for (const id of ["physical_adherence", "instruction_alignment"]) {
    const inp = document.getElementById(id);
    const out = document.getElementById(id + "-out");
    if (inp) inp.value = 3;
    if (out) out.value = 3;
  }
  // Reset fresh item to all "passes" (2) by default.
  for (const id of ["agent_consistency", "scene_consistency", "interaction_realism", "agent_match", "object_correct", "goal_completed"]) {
    setSubTri(id, 2);
  }
  fetchPrompt(it);
}

/* Fetch the canonical task instruction (instruction.txt; instruction_cn.txt in CN mode)
   from the HF gt_data prompt directory derived from the generated video URL.
   Never falls back to prompt.txt — that's the generator rewrite, not the canonical task. */
async function fetchInstructionInto(video_url, targetElId) {
  const target = document.getElementById(targetElId);
  if (!target) return;
  if (!video_url) { target.textContent = "(no prompt)"; return; }
  // Step 1: extract the canonical rel_path. Two cases:
  //   (a) plain HF/mirror URL: `https://host/datasets/.../resolve/main/data/.../X.mp4`
  //   (b) Ham's tunnel proxy:  `https://tunnel/?action=vid&p=data/.../X.mp4` (rel_path is in `?p=`)
  // The instruction.txt lives next to the video under gt_data/ (not generated_data/), and is
  // text — the proxy only serves mp4 bytes — so always fetch instruction from HF directly.
  let relPath = "";
  try {
    const u = new URL(video_url, window.location.href);
    const p = u.searchParams.get("p");
    if (p) {
      relPath = p;  // proxy URL
    } else {
      // resolve URL: strip the `/datasets/<owner>/<repo>/resolve/<rev>/` prefix.
      const m = u.pathname.match(/\/datasets\/[^/]+\/[^/]+\/resolve\/[^/]+\/(.+)$/);
      if (m) relPath = m[1];
    }
  } catch { /* not a URL — fall through */ }
  if (!relPath) { target.textContent = "(no prompt)"; return; }
  // Step 2: derive the prompt directory: replace generated_data/<model>/<task>/<ep>/1/<file>.mp4
  // → gt_data/<task>/<ep>/prompt
  const baseRaw = relPath.replace(
    /^(.+?)\/generated_data\/[^/]+\/(task_\d+)\/(episode_\d+)\/1\/[^/]+\.mp4$/,
    "$1/gt_data/$2/$3/prompt"
  );
  if (baseRaw === relPath) { target.textContent = "(no prompt)"; return; }
  // Always fetch from HF (text files; the proxy isn't a generic file server). Apply user-host
  // preference for parity with video — though hf-mirror.com 308-redirects this back to HF.
  const base = applyVideoHost(CFG.HF_RESOLVE_BASE + "/" + baseRaw.replace(/^\/+/, ""));
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
  // Cache both languages from backend payload (no extra HTTP) so lang toggle is instant.
  CURRENT_INSTRUCTION = {
    video_url: it.video_url,
    targetId: "prompt-text",
    en: it.instruction || "",
    cn: it.instruction_cn || "",
  };
  // If backend already supplied the text, render from cache; else HF fetch.
  if (CURRENT_INSTRUCTION.en || CURRENT_INSTRUCTION.cn) {
    applyCurrentInstruction();
    return;
  }
  return fetchInstructionInto(it.video_url, "prompt-text");
}

function absUrl(u) {
  if (!u) return "";
  if (/^https?:\/\//.test(u)) return applyVideoHost(u);
  return applyVideoHost(CFG.HF_RESOLVE_BASE + "/" + u.replace(/^\/+/, ""));
}

/* Per-user video host preference. Lets a user behind a slow/blocked HF route
   switch all video + instruction fetches to a mirror without backend changes. */
function getVideoHost() {
  return localStorage.getItem(CFG.LS_VIDEO_HOST) || "huggingface.co";
}
function setVideoHost(host) {
  localStorage.setItem(CFG.LS_VIDEO_HOST, host);
  refreshAllVideoSources();
  // Re-fetch instruction in case cache is empty and fall-through hit HF.
  applyCurrentInstruction();
}
function applyVideoHost(url) {
  if (!url) return "";
  const host = getVideoHost();
  if (host === "huggingface.co") return url;
  return url.replace(/^https?:\/\/(?:www\.)?huggingface\.co\//i, `https://${host}/`);
}
/* Swap source on every <video> on the page (preserves currentTime when possible).
   Prefers each element's stored video_sources (data-sources-json) so OSS / mirror /
   HF URLs with different path structures all work. Falls back to legacy host-swap
   on the originalSrc when no per-element sources are stored. */
function refreshAllVideoSources() {
  document.querySelectorAll("video[src]").forEach(v => {
    const original = v.dataset.originalSrc || v.getAttribute("src");
    v.dataset.originalSrc = original;
    let sources = null;
    if (v.dataset.sourcesJson) {
      try { sources = JSON.parse(v.dataset.sourcesJson); } catch {}
    }
    const swapped = (sources && sources.length) ? pickVideoUrl(sources, original) : applyVideoHost(original);
    if (v.src !== swapped) {
      const t = v.currentTime;
      v.src = swapped;
      try { v.load(); v.currentTime = t; } catch {}
    }
  });
}

/* Bind an item's video_sources to a <video> element so refresh/cycle can find them.
   Pass after setting src — paired use is the rule. */
function bindVideoSources(videoEl, sources) {
  if (!videoEl) return;
  videoEl.dataset.sourcesJson = JSON.stringify(Array.isArray(sources) ? sources : []);
  videoEl.dataset.originalSrc = videoEl.getAttribute("src") || "";
}

/* Show/hide the init-frame thumbnail next to a video. Pass the figure ID prefix
   (default empty = '#init-frame-fig'+'#init-frame-img'; 'al-' for align form,
   'al-others-' for the review panel). Click → lightbox via openImageLightbox.
   Ham confirms init_frame_url is on every backend item payload + proxied (China-reachable). */
function setInitFrame(url, prefix) {
  const p = prefix || "";
  const fig = document.getElementById(p + "init-frame-fig");
  const img = document.getElementById(p + "init-frame-img");
  if (!fig || !img) return;
  if (url) {
    img.src = applyVideoHost(url);
    fig.hidden = false;
    img.onclick = () => openImageLightbox(img.src);
    img.style.cursor = "zoom-in";
  } else {
    fig.hidden = true;
    img.removeAttribute("src");
  }
}

/* Simple lightbox: dim the page, show the image full-size, click to close. */
function openImageLightbox(src) {
  let box = document.getElementById("img-lightbox");
  if (!box) {
    box = document.createElement("div");
    box.id = "img-lightbox";
    box.className = "img-lightbox";
    box.innerHTML = `<img class="img-lightbox-img" alt="">`;
    box.addEventListener("click", () => { box.hidden = true; });
    document.body.appendChild(box);
  }
  box.querySelector("img").src = src;
  box.hidden = false;
}

/* Backend-driven source list. Item payloads carry `video_sources = [{label, url, ...}]`
   (Ham's backend on 8787 / 8790 returns this; OSS-rebased URLs have different path
   structure than HF, so we can't just swap host — we use each source's own `url`).
   When present, used as the live list so adding/changing sources is backend-only.
   Falls back to CFG.VIDEO_HOSTS for legacy payloads. */
let VIDEO_HOSTS_RUNTIME = null;
function getVideoHosts() {
  return (VIDEO_HOSTS_RUNTIME && VIDEO_HOSTS_RUNTIME.length) ? VIDEO_HOSTS_RUNTIME : CFG.VIDEO_HOSTS;
}
function setVideoSourcesFromItem(it) {
  if (!it || !Array.isArray(it.video_sources) || !it.video_sources.length) return;
  VIDEO_HOSTS_RUNTIME = it.video_sources
    .filter(s => s && (s.url || s.host))
    .map((s, i) => {
      // Key on label primarily (user-facing, stable across items). Fall back to host or index.
      let host = s.host;
      if (!host && s.url) { try { host = new URL(s.url).host; } catch {} }
      const key = s.label || host || `src${i}`;
      return {
        key,
        label: s.label || host || `src${i}`,
        title: s.label ? `${s.label} (${host || s.url || ""})` : (host || s.url || key),
      };
    });
  const cur = getVideoHost();
  const hosts = getVideoHosts();
  if (!hosts.find(h => h.key === cur)) {
    localStorage.setItem(CFG.LS_VIDEO_HOST, hosts[0].key);
  }
  refreshVsrcChip();
}

/* Resolve the URL to use for a video, given current host selection + an item's video_sources.
   - sources: array of {label, url, host?} from backend (per-item); when empty/absent, falls back
     to applyVideoHost(fallbackUrl) which handles legacy host-swap on HF URLs.
   - The selected source is matched by label (the key stored in LS_VIDEO_HOST), then by host.
   - If selection isn't present in this item's sources, picks primary (sources[0]). */
function pickVideoUrl(sources, fallbackUrl) {
  if (!Array.isArray(sources) || !sources.length) return applyVideoHost(fallbackUrl || "");
  const want = getVideoHost();
  const hit = sources.find(s => s && (s.label === want || s.host === want));
  const chosen = hit || sources[0];
  return (chosen && chosen.url) || applyVideoHost(fallbackUrl || "");
}
/* Refresh the header video-source chip in place (label + visibility). Called whenever
   the runtime host list changes — show when >=2 hosts, hide when only 1. */
function refreshVsrcChip() {
  const chip = document.querySelector(".user-chip");
  if (!chip) return;
  const hosts = getVideoHosts();
  const btn = document.getElementById("vsrc-btn");
  if (hosts.length < 2) { if (btn) btn.remove(); return; }
  if (btn) {
    const cur = hosts.find(h => h.key === getVideoHost()) || hosts[0];
    btn.textContent = `🌐 ${cur.label}`;
    btn.title = `视频源: ${cur.title} — 点击切换 / Video source: click to switch`;
    return;
  }
  // Chip not yet rendered (e.g. backend just expanded sources) → trigger the same
  // idempotent injection path used at page bootstrap.
  if (typeof wireGlobalChrome === "function") wireGlobalChrome();
}

async function onSubmit(skip) {
  if (!CURRENT) return;
  const role = localStorage.getItem(CFG.LS_ROLE);
  const payload = { skip };
  if (!skip) {
    const physical_notes = document.getElementById("physical_notes").value.trim();
    const instruction_notes = document.getElementById("instruction_notes").value.trim();
    if (!physical_notes || !instruction_notes) { toast(tr("toast.notes_required"), "err"); return; }
    payload.physical_adherence = Number(document.getElementById("physical_adherence").value);
    payload.instruction_alignment = Number(document.getElementById("instruction_alignment").value);
    for (const id of ["agent_consistency", "scene_consistency", "interaction_realism", "agent_match", "object_correct", "goal_completed"]) {
      payload[id] = getSubTri(id);  // 3-class 0|1|2 (was binary 0|1)
    }
    payload.subs_v = 2;  // schema marker: migration script skips records already at v2
    payload.physical_notes = physical_notes;
    payload.instruction_notes = instruction_notes;
  }
  const body = {
    user: localStorage.getItem(CFG.LS_USER),
    role,
    item_id: CURRENT.id,
    payload,
  };
  // Edit-mode flag: backend uses it to disambiguate update vs append on re-submit of same item_id.
  if (EDIT_MODE && EDIT_MODE.item_id === CURRENT.id) body.edit = true;
  try {
    await submitAnnotation(body);
    if (EDIT_MODE) {
      toast(tr("my_annotations.updated_toast"), "ok");
      window.location.href = "my_annotations.html";
      return;
    }
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
      // Async-fetch quality stats and slot the card in (doesn't block summary render).
      loadAndRenderQualityCard();
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
    ${renderEarningsCard(me)}
    <div id="quality-card-slot"></div>
    <div class="total-progress">
      <div class="total-progress-head">
        <span class="total-label">总进度 (21 天目标)</span>
        <span class="total-num">${done}<span class="muted">/${target}</span> <span class="self-pct">(${pct}%)</span></span>
      </div>
      <div class="progress-bar total-bar"><div class="progress-fill" style="width:${Math.min(100, pct)}%"></div></div>
    </div>
  `;
}

/* Contributor earnings card (only renders if pay_rate set — i.e. contributor role).
   Shows 💰 大字累计金额 + 今日新增 + 上限进度条 (warm gold/green). */
function renderEarningsCard(me) {
  if (!me || me.pay_rate == null) return "";
  const earned = Number(me.earned ?? 0);
  const earnTarget = Number(me.earn_target ?? 0);
  const earnedToday = Number(me.earned_today ?? 0);
  const pct = earnTarget > 0 ? Math.min(100, Math.round(100 * earned / earnTarget)) : 0;
  const rate = Number(me.pay_rate ?? 1);
  const fmt = (n) => "¥" + (Number.isInteger(n) ? n.toString() : n.toFixed(2));
  return `
    <div class="earnings-card">
      <div class="earnings-head">
        <span class="earnings-icon">💰</span>
        <div class="earnings-meta">
          <div class="earnings-label">已挣(本期累计 · ¥${rate}/条)</div>
          <div class="earnings-amount"><strong>${fmt(earned)}</strong><span class="earnings-of"> / ${fmt(earnTarget)}</span></div>
        </div>
        ${earnedToday > 0 ? `<div class="earnings-today">+${fmt(earnedToday)} 今日</div>` : ""}
      </div>
      <div class="progress-bar earnings-bar"><div class="progress-fill" style="width:${pct}%"></div></div>
    </div>
  `;
}

function capitalizeLabel(s) {
  // "author 3" → "Author 3", "admin 1" → "Admin 1", "You" → "You"
  if (!s) return s;
  return s.replace(/\b([a-z])/g, c => c.toUpperCase());
}

/* Fetch Ham's my_quality and render into #quality-card-slot.
   Surface: this week's 通过率 / 完全通过率 + current pay tier + this week's earned + pause state. */
async function loadAndRenderQualityCard() {
  if (!CFG.APPS_SCRIPT_URL) return;
  const user = localStorage.getItem(CFG.LS_USER);
  if (!user) return;
  try {
    const r = await fetch(`${CFG.APPS_SCRIPT_URL}/?action=my_quality&user=${encodeURIComponent(user)}`);
    const d = await r.json();
    if (d?.ok === false) return;
    const slot = document.getElementById("quality-card-slot");
    if (!slot) return;
    slot.innerHTML = renderQualityCard(d);
  } catch (err) {
    console.warn("my_quality fetch failed", err);
  }
}

function renderQualityCard(d) {
  const week = d.week || d.rolling || {};
  const reviewed = week.reviewed ?? 0;
  if (reviewed === 0) {
    return `<div class="quality-card empty"><span class="muted">${tr("quality.no_reviews_yet")}</span></div>`;
  }
  const passRate = week.pass_rate ?? 0;
  const fullRate = week.full_pass_rate ?? 0;
  const pct = (x) => (x * 100).toFixed(1) + "%";
  const tier = d.tier || "interim";
  const tierLabel = tr("quality.tier." + tier);
  const tierColor = { bonus: "#16a34a", base: "#2563eb", low: "#d39c00", interim: "var(--muted)", paused: "#dc2626" }[tier] || "var(--muted)";
  const unitPrice = d.unit_price != null ? `¥${Number(d.unit_price).toFixed(2)}/条` : "—";
  // Ham's contract: week_earned = ISO-week earnings (label-accurate); earned_estimate = cumulative.
  const weekEarned = d.week_earned != null ? `¥${Number(d.week_earned).toFixed(2)}` : "—";
  const weekPayable = d.week_payable != null ? ` (${d.week_payable} 条)` : "";
  // v80: rework_state replaces the old pause_state. Three states: normal / rework_pending (soft,
   // pool has items, NO new-task lock) / admin_review (pool cleared but rate still <60%).
  const reworkState = d.rework_state || d.pause_state || "normal";
  const poolCount = d.rework_pool ?? 0;
  let banner = "";
  if (reworkState === "rework_pending" && poolCount > 0) {
    banner = `<div class="quality-pause-banner pause-rework_pending">⚠ ${tr("quality.rework.pending").replace("{N}", poolCount)}</div>`;
  } else if (reworkState === "admin_review") {
    banner = `<div class="quality-pause-banner pause-admin_review">${escapeHtml(tr("quality.rework.admin_review"))}</div>`;
  }
  const pauseBanner = banner;
  return `
    <div class="quality-card">
      <div class="quality-head">
        <span class="quality-icon">📊</span>
        <div class="quality-meta">
          <div class="quality-label">${tr("quality.this_week")} · ${reviewed} ${tr("quality.reviewed_unit")}</div>
          <div class="quality-rates">
            <span class="quality-rate"><strong>${pct(passRate)}</strong> ${tr("quality.pass_rate")}</span>
            <span class="quality-rate-sep">·</span>
            <span class="quality-rate muted"><strong>${pct(fullRate)}</strong> ${tr("quality.full_pass_rate")}</span>
          </div>
        </div>
        <div class="quality-tier" style="color:${tierColor};border-color:${tierColor}">
          ${escapeHtml(tierLabel)} · ${unitPrice}
        </div>
      </div>
      <div class="quality-foot">
        <span class="muted">${tr("quality.earned_this_week")}:</span> <strong>${weekEarned}</strong><span class="muted small">${weekPayable}</span>
      </div>
      ${pauseBanner}
    </div>
  `;
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

/* === 3-class sub-item button group helpers (replaces old binary checkbox) === */

/* Wire any .sub-tri inside `root` (defaults to document) so clicking a button updates the
   hidden input value + .active state on its siblings. Idempotent (uses dataset flag). */
function wireSubTriButtons(root) {
  (root || document).querySelectorAll(".sub-tri").forEach(tri => {
    if (tri.dataset.wired === "1") return;
    tri.dataset.wired = "1";
    const input = tri.querySelector('input[type="hidden"]');
    const btns = tri.querySelectorAll(".sub-tri-btn");
    btns.forEach(b => {
      b.addEventListener("click", () => {
        const v = b.dataset.val;
        if (input) input.value = v;
        btns.forEach(x => x.classList.toggle("active", x === b));
      });
    });
  });
}

/* Set a sub-tri value programmatically (used by prefill + reset). Value: 0|1|2. */
function setSubTri(id, val) {
  const input = document.getElementById(id);
  if (!input) return;
  const v = Number(val);
  input.value = String(v);
  const wrapper = input.closest(".sub-tri");
  if (!wrapper) return;
  wrapper.querySelectorAll(".sub-tri-btn").forEach(b => {
    b.classList.toggle("active", Number(b.dataset.val) === v);
  });
}

/* Read sub-tri value as Number (0/1/2). */
function getSubTri(id) {
  const input = document.getElementById(id);
  if (!input) return 2;
  const v = Number(input.value);
  return Number.isFinite(v) ? v : 2;
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
  wireSubTriButtons();  // 6 sub-tri groups in gold form
  // Edit mode: ?edit=<item_id> loads the existing gold annotation and prefills the form.
  // Override mode: ?override=<item_id> admin-only path that loads a finalized gold from
  // gold_library and lets admin rewrite it (writes audit log on submit).
  const params = new URLSearchParams(window.location.search);
  const editId = params.get("edit");
  const overrideId = params.get("override");
  if (overrideId) {
    if (username !== "masiyuan") { renderRoleGate("管理员 (admin)"); return; }
    await loadForOverrideGold(overrideId);
  } else if (editId) {
    await loadForEditGold(editId);
  } else {
    await loadNextGold();
  }
}

async function loadForOverrideGold(item_id) {
  hide("error"); hide("item"); show("loading");
  const user = localStorage.getItem(CFG.LS_USER);
  try {
    const url = `${CFG.APPS_SCRIPT_URL}/?action=gold_library&user=${encodeURIComponent(user)}`;
    const res = await fetch(url);
    const data = await res.json();
    if (data?.ok === false) throw new Error(data.error || "fetch failed");
    const it = (data.items || []).find(x => x.item_id === item_id);
    if (!it) { showError(tr("gold_library.not_found")); return; }
    EDIT_MODE = { kind: "override", item_id };
    GOLD_CURRENT = { id: it.item_id, video_url: it.video_url, dataset: it.dataset, task: it.task,
                     video_sources: it.video_sources, instruction: it.instruction, instruction_cn: it.instruction_cn,
                     gt_url: it.gt_url };
    renderItem(GOLD_CURRENT);
    prefillAnnotateForm(it.final || it.payload || {});
    const submitBtn = document.querySelector('#annotate-form button[type="submit"]');
    if (submitBtn) submitBtn.textContent = tr("gold_library.override_btn");
    const skipBtn = document.getElementById("skip-btn");
    if (skipBtn) skipBtn.hidden = true;
    // Inject reason field above submit (audit log requires it).
    injectOverrideReasonField();
    hide("loading"); show("item");
  } catch (err) {
    showError("Failed to load gold for override: " + err.message);
  }
}

function injectOverrideReasonField() {
  if (document.getElementById("override-reason-wrap")) return;
  const form = document.getElementById("annotate-form");
  if (!form) return;
  const submitRow = form.querySelector(".form-row.actions");
  const wrap = document.createElement("div");
  wrap.id = "override-reason-wrap";
  wrap.className = "form-row";
  wrap.innerHTML = `
    <label for="override-reason"><span>${tr("gold_library.reason_label")}</span> <span class="required-tag">*</span></label>
    <textarea id="override-reason" rows="2" maxlength="300" placeholder="${tr("gold_library.reason_placeholder")}"></textarea>
  `;
  if (submitRow) form.insertBefore(wrap, submitRow);
}

async function loadForEditGold(item_id) {
  hide("error"); hide("item"); show("loading");
  const user = localStorage.getItem(CFG.LS_USER);
  try {
    const url = `${CFG.APPS_SCRIPT_URL}/?action=my_annotations&user=${encodeURIComponent(user)}&kind=gold`;
    const res = await fetch(url);
    const data = await res.json();
    if (data?.ok === false) throw new Error(data.error || "fetch failed");
    const it = (data.items || []).find(x => x.item_id === item_id);
    if (!it) { showError(tr("my_annotations.not_found")); return; }
    if (it.reviewed) { showError(tr("my_annotations.already_reviewed")); return; }
    EDIT_MODE = { kind: "gold", item_id };
    GOLD_CURRENT = { id: it.item_id, video_url: it.video_url, dataset: it.dataset, task: it.task,
                     video_sources: it.video_sources, instruction: it.instruction, instruction_cn: it.instruction_cn,
                     gt_url: it.gt_url };
    renderItem(GOLD_CURRENT);
    prefillAnnotateForm(it.payload || {});
    const submitBtn = document.querySelector('#annotate-form button[type="submit"]');
    if (submitBtn) submitBtn.textContent = tr("my_annotations.update_btn");
    const skipBtn = document.getElementById("skip-btn");
    if (skipBtn) skipBtn.hidden = true;
    hide("loading"); show("item");
  } catch (err) {
    showError("Failed to load gold for edit: " + err.message);
  }
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
    const physical_notes = document.getElementById("physical_notes").value.trim();
    const instruction_notes = document.getElementById("instruction_notes").value.trim();
    if (!physical_notes || !instruction_notes) { toast(tr("toast.notes_required"), "err"); return; }
    payload.physical_adherence = Number(document.getElementById("physical_adherence").value);
    payload.instruction_alignment = Number(document.getElementById("instruction_alignment").value);
    for (const id of ["agent_consistency", "scene_consistency", "interaction_realism", "agent_match", "object_correct", "goal_completed"]) {
      payload[id] = getSubTri(id);  // 3-class 0|1|2
    }
    payload.subs_v = 2;
    payload.physical_notes = physical_notes;
    payload.instruction_notes = instruction_notes;
  }
  // Override mode (admin rewriting a gold_library entry) uses a different endpoint + payload shape.
  const isOverride = EDIT_MODE && EDIT_MODE.kind === "override" && EDIT_MODE.item_id === GOLD_CURRENT.id;
  let body, endpoint;
  if (isOverride) {
    const reason = (document.getElementById("override-reason")?.value || "").trim();
    if (!reason) { toast(tr("gold_library.reason_required"), "err"); return; }
    body = { gold_override: true, admin: user, item_id: GOLD_CURRENT.id, payload, reason };
    endpoint = CFG.APPS_SCRIPT_URL + "/";
  } else {
    body = { gold: true, user, item_id: GOLD_CURRENT.id, payload };
    if (EDIT_MODE && EDIT_MODE.kind === "gold" && EDIT_MODE.item_id === GOLD_CURRENT.id) body.edit = true;
    endpoint = CFG.APPS_SCRIPT_URL + "/";
  }
  try {
    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "text/plain" },
      body: JSON.stringify(body)
    });
    const data = await res.json();
    if (data && data.ok === false) throw new Error(data.error || "save failed");
    if (isOverride) {
      toast(tr("gold_library.override_done_toast"), "ok");
      window.location.href = "gold_library.html";
      return;
    }
    if (EDIT_MODE) {
      toast(tr("my_annotations.updated_toast"), "ok");
      window.location.href = "my_annotations.html";
      return;
    }
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
  // Reviewer 3-decision UX (siyuan v78): 通过 / 小修改 / 大修改(打回).
  // 通过 = approve as-is; 小修改 = reviewer 改后 final, 算"通过"; 大修改 = 打回标注员重标, 不付钱.
  document.getElementById("approve-btn").addEventListener("click", () => submitReview("approve"));
  const openModifyForm = (asDecision) => {
    const fields = document.getElementById("modify-fields");
    if (fields.hidden) {
      // First click → open prefilled form, button label becomes "submit <decision>".
      const orig = REVIEW_CURRENT?.annotation || REVIEW_CURRENT?.annotation_payload || {};
      for (const id of ["physical_adherence", "instruction_alignment"]) {
        const v = orig[id] ?? 3;
        document.getElementById("m-" + id).value = v;
        document.getElementById("m-" + id + "-out").value = v;
      }
      for (const id of ["agent_consistency", "scene_consistency", "interaction_realism", "agent_match", "object_correct", "goal_completed"]) {
        setSubTri("m-" + id, orig[id] ?? 2);  // 3-class (v72), default fresh=2
      }
      document.getElementById("m-physical_notes").value = "";
      document.getElementById("m-instruction_notes").value = "";
      fields.hidden = false;
      // Highlight which decision the open form is for; clicking same button again submits.
      REVIEW_PENDING_DECISION = asDecision;
      const minorBtn = document.getElementById("minor-btn");
      const majorBtn = document.getElementById("major-btn");
      if (asDecision === "minor") {
        minorBtn.textContent = "📤 提交小修改 Submit Minor";
        majorBtn.textContent = "🛑 大修改(打回) Major";  // reset other
      } else {
        majorBtn.textContent = "📤 提交大修改(打回) Submit Major";
        minorBtn.textContent = "✏ 小修改 Minor";
      }
    } else {
      submitReview(REVIEW_PENDING_DECISION || asDecision);
    }
  };
  document.getElementById("minor-btn").addEventListener("click", () => openModifyForm("minor"));
  document.getElementById("major-btn").addEventListener("click", () => openModifyForm("major"));
  document.getElementById("skip-btn").addEventListener("click", () => loadNextReview());
  document.getElementById("retry-btn").addEventListener("click", () => loadNextReview());
  wireVideoFallback(document.getElementById("gen-video"), { onSkip: () => loadNextReview() });
  wireSubTriButtons();  // 6 sub-tri groups in review modify form
  await loadNextReview();
}

let REVIEW_PENDING_DECISION = null;  // tracks which button opened the modify form

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
  setVideoSourcesFromItem(it);
  document.getElementById("meta-kind").textContent = it.is_report ? "SELF-REPORTED" : "DAILY";
  document.getElementById("meta-dataset").textContent = it.dataset || "?";
  document.getElementById("meta-task").textContent = it.task || "?";
  document.getElementById("meta-self-report").hidden = !it.is_report;
  const reviewGen = document.getElementById("gen-video");
  reviewGen.src = pickVideoUrl(it.video_sources, it.video_url);
  bindVideoSources(reviewGen, it.video_sources);
  reviewGen.load();
  setInitFrame(it.init_frame_url, "");
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
  // Split per-axis notes with fallback to legacy single `notes` field.
  const pNote = payload.physical_notes || payload.notes || "";
  const iNote = payload.instruction_notes || (payload.physical_notes ? "" : payload.notes) || "";
  document.getElementById("orig-notes").innerHTML = (pNote || iNote)
    ? `<strong>Physical:</strong> ${escapeHtml(pNote || "—")}<br><strong>Instruction:</strong> ${escapeHtml(iNote || "—")}`
    : "(no notes)";
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
  // 3-decision flow (v78): approve = no edit; minor = reviewer's edit, counts as pass for annotator;
  // major = reviewer's edit + flag for re-annotation (annotator gets it back, doesn't get paid until
  // a subsequent review passes). Both minor and major require the modify form to be filled.
  if (decision === "minor" || decision === "major" || decision === "modify") {
    const physical_notes = document.getElementById("m-physical_notes").value.trim();
    const instruction_notes = document.getElementById("m-instruction_notes").value.trim();
    if (!physical_notes || !instruction_notes) { toast(tr("toast.modify_note_required"), "err"); return; }
    payload = {
      physical_adherence: Number(document.getElementById("m-physical_adherence").value),
      instruction_alignment: Number(document.getElementById("m-instruction_alignment").value),
      physical_notes,
      instruction_notes,
    };
    for (const id of ["agent_consistency","scene_consistency","interaction_realism","agent_match","object_correct","goal_completed"]) {
      payload[id] = getSubTri("m-" + id);  // 3-class
    }
    payload.subs_v = 2;
  }
  REVIEW_PENDING_DECISION = null;
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
      if (list[0]) setVideoSourcesFromItem(list[0]);
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
  // 3 decisions (v78): approve / minor (= adjust, counts as pass) / major (= reject, counts as fail).
  // Legacy "modify" maps to "minor" for back-compat — Ham's backend also accepts both.
  const dec = r.decision === "modify" ? "minor" : (r.decision || "approve");
  const isApprove = dec === "approve";
  const isMajor = dec === "major";
  li.className = "my-row " + (isApprove ? "approved" : (isMajor ? "rejected" : "modified"));
  if (r.is_report) li.classList.add("self-reported");
  const reviewer = r.reviewer_label || "Reviewer";
  const decisionLbl = tr("review.decision." + dec);
  const kindBadge = r.kind === "gold" ? '<span class="row-badge gold">GOLD</span>' : "";
  const reportBadge = r.is_report ? '<span class="row-badge report">⚠ self-reported</span>' : "";
  const ts = r.ts || r.created_at || "";
  const fin = r.final || r.review_payload || r.payload || {};
  const orig = r.original || r.original_payload || {};
  // Field-level diff helpers across new 8-field schema (fallback to legacy quality/faithful).
  const physChanged = !isApprove && (fin.physical_adherence ?? fin.quality) !== (orig.physical_adherence ?? orig.quality);
  const instChanged = !isApprove && (fin.instruction_alignment ?? fin.faithful) !== (orig.instruction_alignment ?? orig.faithful);
  const nChanged = !isApprove && (
    (orig.physical_notes || orig.notes || "") !== (fin.physical_notes || fin.notes || "") ||
    (orig.instruction_notes || "") !== (fin.instruction_notes || "")
  );
  const subsP = ["agent_consistency","scene_consistency","interaction_realism"];
  const subsI = ["agent_match","object_correct","goal_completed"];
  function subBadges(p, keys) {
    return keys.map(k => {
      const v = p[k];
      if (v === undefined || v === null) return "";
      // 3-class: 0=✗ violated / 1=⚠ partial / 2=✓ passes. Legacy 0/1 already migrated to 0/2.
      const glyph = v === 0 ? "✗" : (v === 1 ? "⚠" : "✓");
      const cls = v === 0 ? "no" : (v === 1 ? "partial" : "yes");
      return `<span class="sub-badge ${cls}" title="${k}">${glyph} ${k.replace(/_/g," ")}</span>`;
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
          ${renderNotesBlock(orig)}
        </div>
        <div class="detail-arrow">→</div>
        <div class="detail-card detail-final ${isApprove ? "unchanged" : ""}">
          <h4>${isApprove ? "Reviewer (approved as-is)" : "Reviewer (modified)"}</h4>
          <p>Physical: <strong class="${physChanged ? "diff" : ""}">${fin.physical_adherence ?? fin.quality ?? "—"}</strong> · Instruction: <strong class="${instChanged ? "diff" : ""}">${fin.instruction_alignment ?? fin.faithful ?? "—"}</strong></p>
          <p class="sub-line">${subBadges(fin, subsP)}${subBadges(fin, subsI)}</p>
          ${renderNotesBlock(fin, nChanged)}
        </div>
      </div>
      ${r.video_url ? `
        <figure class="detail-video">
          <figcaption>Generated video</figcaption>
          <video controls preload="none" muted playsinline webkit-playsinline="true" x5-playsinline="true" src="${pickVideoUrl(r.video_sources, r.video_url)}" data-sources-json='${escapeHtml(JSON.stringify(r.video_sources || []))}'></video>
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

/* ===================== My annotations (edit-if-unreviewed) ===================== */
let MA_CURRENT_KIND = "all";

async function initMyAnnotations() {
  const user = localStorage.getItem(CFG.LS_USER);
  if (!user) { window.location.href = "index.html"; return; }
  document.getElementById("who").textContent = user;
  const role = localStorage.getItem(CFG.LS_ROLE) || "—";
  const roleEl = document.getElementById("role");
  if (roleEl) { roleEl.textContent = tr("role." + role); roleEl.dataset.role = role; }

  // Tab wiring
  document.querySelectorAll("#ma-tabs .tab-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll("#ma-tabs .tab-btn").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      MA_CURRENT_KIND = btn.dataset.kind;
      loadMyAnnotations();
    });
  });
  await loadMyAnnotations();
}

async function loadMyAnnotations() {
  const user = localStorage.getItem(CFG.LS_USER);
  const loading = document.getElementById("ma-loading");
  const empty = document.getElementById("ma-empty");
  const list = document.getElementById("ma-list");
  const err = document.getElementById("ma-error");
  loading.hidden = false; empty.hidden = true; list.hidden = true; err.hidden = true;
  list.innerHTML = "";
  try {
    // Fetch items + quality state in parallel. quality gives us the redo pool (rework_items) +
    // state — used for the priority sort and the red ❗ badge.
    const url = `${CFG.APPS_SCRIPT_URL}/?action=my_annotations&user=${encodeURIComponent(user)}&kind=${encodeURIComponent(MA_CURRENT_KIND)}`;
    const qUrl = `${CFG.APPS_SCRIPT_URL}/?action=my_quality&user=${encodeURIComponent(user)}`;
    const [r, qr] = await Promise.all([fetch(url), fetch(qUrl).catch(() => null)]);
    const d = await r.json();
    let reworkSet = new Set();
    if (qr) {
      try {
        const qd = await qr.json();
        if (qd && Array.isArray(qd.rework_items)) reworkSet = new Set(qd.rework_items);
      } catch {}
    }
    loading.hidden = true;
    if (d?.ok === false) throw new Error(d.error || "fetch failed");
    const items = d.items || [];
    if (items.length === 0) { empty.hidden = false; return; }
    if (items[0]) setVideoSourcesFromItem(items[0]);
    // Annotate rework membership so renderMyAnnotationCard can show the ❗ badge + priority sort.
    for (const it of items) it._in_rework = reworkSet.has(it.item_id);
    // Sort: rework items first (priority), then newest submitted_ts.
    items.sort((a, b) => {
      if (a._in_rework !== b._in_rework) return a._in_rework ? -1 : 1;
      return (b.submitted_ts || 0) - (a.submitted_ts || 0);
    });
    for (const it of items) list.appendChild(renderMyAnnotationCard(it));
    list.hidden = false;
  } catch (e) {
    loading.hidden = true;
    err.hidden = false;
    document.getElementById("ma-err-msg").textContent = e.message;
  }
}

function renderMyAnnotationCard(it) {
  const li = document.createElement("li");
  // Ham's contract on my_annotations adds review_decision / review_passed / review_original /
  // review_final on every reviewed task row. Branch the card style on decision so the user
  // can see at a glance whether their submission was approved, adjusted, or rejected.
  const dec = it.review_decision === "modify" ? "minor" : it.review_decision;  // legacy compat
  const isReviewed = !!it.reviewed;
  let stateCls = "editable";
  if (isReviewed) {
    stateCls = dec === "approve" ? "approved" : (dec === "major" ? "rejected" : (dec === "minor" ? "adjusted" : "reviewed"));
  }
  li.className = "my-annot-card " + stateCls;
  const orig = it.review_original || it.payload || {};
  const fin = it.review_final || it.payload || {};
  const kindTag = it.kind === "gold"
    ? `<span class="tag gold-tag">GOLD</span>`
    : `<span class="tag">TASK</span>`;
  // Decision badge (when reviewed) — explicit '通过 / 调整 / 不通过'.
  // Rework badge (when item is in the redo pool — un-reviewed item flagged by backend's
  // quality state because the annotator's pass rate dropped below 60%).
  const reworkBadge = it._in_rework
    ? `<span class="row-badge rework-badge" title="${escapeHtml(tr("quality.rework.pending").replace("{N}", "—"))}">${tr("my_annotations.rework_badge")}</span>`
    : "";
  const decisionBadge = isReviewed && dec
    ? `<span class="row-badge decision-${dec}">${tr("review.decision." + dec)}</span>`
    : (isReviewed
        ? `<span class="tag" title="${escapeHtml(it.reviewed_by || "")} · ${escapeHtml(String(it.reviewed_ts || ""))}">✓ ${tr("my_annotations.reviewed_badge")}</span>`
        : `<span class="tag aud-tag tag-custom">${tr("my_annotations.editable_badge")}</span>`);
  if (it._in_rework) li.classList.add("rework-priority");
  const editHref = it.kind === "gold"
    ? `gold_annotate.html?edit=${encodeURIComponent(it.item_id)}`
    : `task.html?edit=${encodeURIComponent(it.item_id)}`;
  const actionBtn = isReviewed
    ? `<span class="muted small">${tr("my_annotations.locked")}</span>`
    : `<a class="link ma-edit-btn" href="${editHref}">✏ ${tr("my_annotations.edit_btn")}</a>`;
  // Sub-line: legacy 0/1/2 → glyphs (mirrors subBadges in my_reviews).
  const subKeys = ["agent_consistency","scene_consistency","interaction_realism","agent_match","object_correct","goal_completed"];
  function subLine(p) {
    return subKeys.map(k => {
      const v = p?.[k]; if (v == null) return "";
      const glyph = v === 0 ? "✗" : (v === 1 ? "⚠" : "✓");
      const cls = v === 0 ? "no" : (v === 1 ? "partial" : "yes");
      return `<span class="sub-badge ${cls}" title="${k}">${glyph} ${k.replace(/_/g," ")}</span>`;
    }).join("");
  }
  // Diff display: only show "原值 → 改后" when reviewer actually changed something (adjust or reject).
  const changed = (dec === "minor" || dec === "major") && it.review_original && it.review_final;
  const physChanged = changed && orig.physical_adherence !== fin.physical_adherence;
  const instChanged = changed && orig.instruction_alignment !== fin.instruction_alignment;
  const notesChanged = changed && (
    (orig.physical_notes || "") !== (fin.physical_notes || "") ||
    (orig.instruction_notes || "") !== (fin.instruction_notes || "")
  );
  const diffBlock = changed ? `
    <div class="ma-diff">
      <div class="ma-diff-side ma-diff-orig">
        <div class="ma-diff-head">${tr("my_annotations.diff.your_submission")}</div>
        <p>Physical: <strong>${orig.physical_adherence ?? "—"}</strong> · Instruction: <strong>${orig.instruction_alignment ?? "—"}</strong></p>
        <p class="sub-line">${subLine(orig)}</p>
        ${(orig.physical_notes || orig.instruction_notes)
          ? `<p class="muted small"><strong>P:</strong> ${escapeHtml(orig.physical_notes || "—")}<br><strong>I:</strong> ${escapeHtml(orig.instruction_notes || "—")}</p>`
          : ""}
      </div>
      <div class="ma-diff-arrow">→</div>
      <div class="ma-diff-side ma-diff-final">
        <div class="ma-diff-head">${tr("my_annotations.diff.reviewer_final")}</div>
        <p>Physical: <strong class="${physChanged ? "diff" : ""}">${fin.physical_adherence ?? "—"}</strong> · Instruction: <strong class="${instChanged ? "diff" : ""}">${fin.instruction_alignment ?? "—"}</strong></p>
        <p class="sub-line">${subLine(fin)}</p>
        ${(fin.physical_notes || fin.instruction_notes)
          ? `<p class="muted small ${notesChanged ? "diff" : ""}"><strong>P:</strong> ${escapeHtml(fin.physical_notes || "—")}<br><strong>I:</strong> ${escapeHtml(fin.instruction_notes || "—")}</p>`
          : ""}
      </div>
    </div>` : `
    <p class="ma-scores">Physical: <strong>${fin.physical_adherence ?? "—"}</strong> · Instruction: <strong>${fin.instruction_alignment ?? "—"}</strong></p>
    ${(fin.physical_notes || fin.instruction_notes)
      ? `<p class="muted small"><strong>P:</strong> ${escapeHtml(fin.physical_notes || "—")}<br><strong>I:</strong> ${escapeHtml(fin.instruction_notes || "—")}</p>`
      : ""}`;
  li.innerHTML = `
    <div class="meta">${kindTag}<span class="tag">${escapeHtml(it.dataset || "?")}</span><span class="tag">${escapeHtml(it.task || "?")}</span>${decisionBadge}</div>
    ${it.video_url ? `<video class="ma-thumb" controls preload="none" muted playsinline webkit-playsinline="true" x5-playsinline="true" src="${pickVideoUrl(it.video_sources, it.video_url)}" data-sources-json='${escapeHtml(JSON.stringify(it.video_sources || []))}'></video>` : ""}
    ${diffBlock}
    <div class="ma-foot">${actionBtn}</div>
  `;
  const v = li.querySelector("video");
  if (v) wireVideoFallback(v);
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
    if (list[0]) setVideoSourcesFromItem(list[0]);
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
        <div class="video-row"><figure><figcaption>Generated</figcaption><video controls preload="metadata" muted playsinline webkit-playsinline="true" x5-playsinline="true" src="${pickVideoUrl(r.video_sources, r.video_url || "")}" data-sources-json='${escapeHtml(JSON.stringify(r.video_sources || []))}'></video></figure></div>
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
    if (items[0]) setVideoSourcesFromItem(items[0]);
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
      // Admin-only override entry; audit count badge if backend supplies it.
      const isAdmin = localStorage.getItem(CFG.LS_USER) === "masiyuan";
      const auditCount = Array.isArray(it.audit) ? it.audit.length : (it.audit_count || 0);
      const overrideBtn = isAdmin
        ? `<a class="link gl-override-btn" href="gold_annotate.html?override=${encodeURIComponent(it.item_id)}">✏ ${tr("gold_library.edit_gold")}</a>`
        : "";
      const auditTag = (isAdmin && auditCount > 0)
        ? `<span class="tag" title="${tr("gold_library.audit_tip")}">📜 ${auditCount}</span>`
        : "";
      card.innerHTML = `
        <div class="meta"><span class="tag gold-tag">GOLD</span>${sourceTag}<span class="tag">${escapeHtml(it.dataset || "?")}</span><span class="tag">${escapeHtml(it.task || "?")}</span>${finalizerTag}${reviewerTag}${auditTag}</div>
        <div class="video-row"><figure><figcaption>Generated</figcaption><video controls preload="metadata" muted playsinline webkit-playsinline="true" x5-playsinline="true" src="${pickVideoUrl(it.video_sources, it.video_url || "")}" data-sources-json='${escapeHtml(JSON.stringify(it.video_sources || []))}'></video></figure></div>
        <p class="gl-scores">Physical: <strong>${phys ?? "—"}</strong> · Instruction: <strong>${inst ?? "—"}</strong></p>
        ${(p.physical_notes || p.instruction_notes)
          ? `<p class="muted"><strong>P:</strong> ${escapeHtml(p.physical_notes || "—")} <strong>· I:</strong> ${escapeHtml(p.instruction_notes || "—")}</p>`
          : `<p class="muted">${escapeHtml(p.notes || "")}</p>`}
        ${overrideBtn ? `<div class="gl-foot">${overrideBtn}</div>` : ""}
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

/* Render split per-axis notes block (physical_notes + instruction_notes) with
   fallback to legacy single `notes` field if either modern field is missing. */
function renderNotesBlock(p, diff) {
  if (!p) return '<p class="notes muted">(no notes)</p>';
  const pn = p.physical_notes || "";
  const inote = p.instruction_notes || "";
  if (pn || inote) {
    return `<p class="notes ${diff ? "diff" : ""}"><strong>P:</strong> ${escapeHtml(pn || "—")}<br><strong>I:</strong> ${escapeHtml(inote || "—")}</p>`;
  }
  if (p.notes) return `<p class="notes ${diff ? "diff" : ""}">${escapeHtml(p.notes)}</p>`;
  return '<p class="notes muted">(no notes)</p>';
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
  // Inject video-source toggle next to lang button if missing.
  // Only render when there's something to switch to (>=2 hosts in runtime list).
  if (chip && !document.getElementById("vsrc-btn") && getVideoHosts().length >= 2) {
    const btn = document.createElement("button");
    btn.id = "vsrc-btn";
    btn.className = "link vsrc-btn";
    const refresh = () => {
      const hosts = getVideoHosts();
      const cur = hosts.find(h => h.key === getVideoHost()) || hosts[0];
      btn.textContent = `🌐 ${cur.label}`;
      btn.title = `视频源: ${cur.title} — 点击切换 / Video source: click to switch`;
    };
    refresh();
    btn.addEventListener("click", () => {
      const hosts = getVideoHosts();
      const cur = getVideoHost();
      // Cycle to next host in the runtime list.
      const idx = Math.max(0, hosts.findIndex(h => h.key === cur));
      const next = hosts[(idx + 1) % hosts.length];
      setVideoHost(next.key);
      refresh();
      const cn = getLang() === "cn";
      toast(cn ? `视频源已切换到 ${next.label}` : `Video source: ${next.label}`, "ok");
    });
    const langBtn = chip.querySelector("#lang-btn");
    if (langBtn) chip.insertBefore(btn, langBtn); else chip.appendChild(btn);
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
  if (document.getElementById("ma-list")) initMyAnnotations();
});

/* ===================== Reviewer Alignment v2 (multi-campaign concurrent) ===================== */
let ALIGN_CURRENT = null;       // currently-rendered item
let ALIGN_CAMPAIGN_ID = null;   // currently-selected campaign id
let ALIGN_CAMPAIGN_NAME = "";   // currently-selected campaign name
let ALIGN_IS_ADMIN = false;
let ALIGN_READ_ONLY = false;    // set when backend returns read_only:true for a completed non-admin participant
let ALIGN_USER_LIST = [];       // for custom-audience multi-select
let ALIGN_OVERVIEW_ITEMS = [];  // ordered item_ids from current admin/read-only overview, used to advance "Next" within the review-list

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

  // IAA + Export are useful for completed participants too (read-only mode).
  // Backend gates the actual data (align_agreement 403s for non-completed non-admin).
  const iaaBtn = document.getElementById("al-iaa-btn");
  if (iaaBtn) iaaBtn.addEventListener("click", () => toggleIAAPanel());
  const exportBtn = document.getElementById("al-export-btn");
  if (exportBtn) exportBtn.addEventListener("click", () => exportCampaign());
  // Wire "View results (read-only)" button on done page — re-renders the overview.
  const viewResultsBtn = document.getElementById("al-view-results-btn");
  if (viewResultsBtn) viewResultsBtn.addEventListener("click", () => loadAlignStatus());
  // Wire "Browse my items" — opens the my_alignment grid (mixed-state per-item view).
  const browseMineBtn = document.getElementById("al-browse-mine-btn");
  if (browseMineBtn) browseMineBtn.addEventListener("click", () => loadMyAlignment());
  // Wire bulk-disclose-all (one-click "see everyone, lock all my items") — task 1 core.
  const discloseAllBtn = document.getElementById("al-disclose-all-btn");
  if (discloseAllBtn) discloseAllBtn.addEventListener("click", () => discloseAllAndOpenResults());
  const myBackBtn = document.getElementById("al-my-back-btn");
  if (myBackBtn) myBackBtn.addEventListener("click", () => {
    document.getElementById("al-my-alignment").hidden = true;
    document.getElementById("al-done-msg").hidden = false;
  });
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
  wireSubTriButtons();  // 6 sub-tri groups in the align form
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
    // Ham's completed-only gate (Alice's IAA-validity guard #1) is keyed on `user` — pass it
    // explicitly so admin AND completed participants both get 200 (regression caught by v63 QA).
    const user = localStorage.getItem(CFG.LS_USER) || "";
    const r = await fetch(`${CFG.APPS_SCRIPT_URL}/?action=align_agreement&campaign_id=${encodeURIComponent(ALIGN_CAMPAIGN_ID)}&user=${encodeURIComponent(user)}`);
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
  // Split dimensions: main scores (1-5 scale) vs sub-items (0/1 violation flags) — siyuan
  // pointed out mixing them in one table mislabels the "mean diff" semantic (a Δ of 0.78
  // on a 5-point scale is very different from a Δ of 0.27 on a binary).
  const mainDims = ["physical_adherence", "instruction_alignment"];
  const subDims = ["agent_consistency", "scene_consistency", "interaction_realism", "agent_match", "object_correct", "goal_completed"];
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
  function rowFor(k) {
    const dim = perDim[k] || {};
    return `<tr>
      <td>${escapeHtml(dimLabel[k] || k)}</td>
      ${alphaCell(dim.krippendorff_alpha)}
      <td>${dim.within1_rate != null ? (dim.within1_rate * 100).toFixed(1) + "%" : "—"}</td>
      <td>${dim.std_dev != null ? dim.std_dev.toFixed(2) : "—"}</td>
      <td class="muted">${dim.n_items ?? "—"}</td>
    </tr>`;
  }
  const mainRows = mainDims.map(rowFor).join("");
  const subRows = subDims.map(rowFor).join("");
  // Tooltip helper: small (?) icon with hover-to-explain via title attribute.
  const help = (key) => `<span class="iaa-help" title="${escapeHtml(tr(key))}">ⓘ</span>`;
  const tableHead = `<thead><tr>
        <th>${tr("align.iaa.dim")}</th>
        <th>${tr("align.iaa.alpha")} ${help("align.iaa.alpha_tip")}</th>
        <th>${tr("align.iaa.within1")} ${help("align.iaa.within1_tip")}</th>
        <th>${tr("align.iaa.std_dev")} ${help("align.iaa.std_dev_tip")}</th>
        <th>${tr("align.iaa.n_items")} ${help("align.iaa.n_items_tip")}</th>
      </tr></thead>`;
  // Top divergent items — each row is a clickable link that calls showAlignOthers(item_id)
  // to jump directly to the side-by-side view of that item.
  const topItems = items.slice(0, 5).map(it => {
    const pa = it.physical_adherence_spread ?? 0;
    const ia = it.instruction_alignment_spread ?? 0;
    const total = pa + ia;
    const itemId = it.item_id || "";
    const conflictTag = total >= 6 ? ' <span class="conflict-tag">⚠ 高分歧</span>' : '';
    return `<li>
      <a href="#" class="iaa-top-link" data-item-id="${escapeHtml(itemId)}">
        <span class="iaa-top-name">${escapeHtml(it.dataset || "?")} · ${escapeHtml(it.task || "?")}</span>
        <span class="muted small">PA Δ${pa} · IA Δ${ia}${conflictTag}</span>
        <span class="iaa-top-open">${tr("align.iaa.open_item")} →</span>
      </a>
    </li>`;
  }).join("");
  panel.innerHTML = `
    <h4 class="iaa-title">${tr("align.iaa.title")} <span class="muted small">· ${d.n_raters || "?"} raters · ${nMulti} multi-rater items</span></h4>
    <h5 class="iaa-subtitle">${tr("align.iaa.main_scores")}</h5>
    <table class="iaa-table iaa-table-main">${tableHead}<tbody>${mainRows}</tbody></table>
    <h5 class="iaa-subtitle">${tr("align.iaa.sub_scores")}</h5>
    <table class="iaa-table iaa-table-sub">${tableHead}<tbody>${subRows}</tbody></table>
    ${topItems ? `<h5 class="iaa-subtitle">${tr("align.iaa.top_items")}</h5><ul class="iaa-top-list">${topItems}</ul>` : ""}
  `;
  // Wire click handlers on top-divergent rows → jump to side-by-side for that item.
  panel.querySelectorAll(".iaa-top-link").forEach(a => {
    a.addEventListener("click", e => {
      e.preventDefault();
      const id = a.dataset.itemId;
      if (!id) { toast(tr("align.iaa.open_item") + ": item_id missing in backend response", "err"); return; }
      // Collapse the IAA panel and jump to the item's side-by-side view.
      const ip = document.getElementById("al-iaa-panel");
      if (ip) ip.hidden = true;
      showAlignOthers(id);
    });
  });
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
      ${(c.can_view_results && !ALIGN_IS_ADMIN) ? `
        <div class="campaign-readonly-row">
          <button type="button" class="link al-view-readonly-btn" data-cid="${escapeHtml(c.campaign_id)}" data-cname="${escapeHtml(c.name || '')}">${tr("align.view_results_short")}</button>
        </div>
      ` : ""}
    `;
    li.querySelector(".al-enter-btn").addEventListener("click", (e) => {
      const cid = e.currentTarget.dataset.cid;
      const cname = e.currentTarget.dataset.cname;
      selectCampaign(cid, cname);
    });
    const roBtn = li.querySelector(".al-view-readonly-btn");
    if (roBtn) roBtn.addEventListener("click", (e) => {
      const cid = e.currentTarget.dataset.cid;
      const cname = e.currentTarget.dataset.cname;
      selectCampaign(cid, cname);  // selectCampaign → loadAlignStatus, which detects read_only from backend
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
    // Render the disclosed count next to submitted count for participants — IAA closure
    // (Alice's guard) requires all-disclosed before aggregate views unlock.
    renderDiscloseProgress(d);
    // Backend marks completed non-admin participants with read_only:true and returns the same
    // items[] payload that admins see. read_only now reflects all_disclosed (not all_submitted).
    ALIGN_READ_ONLY = !!(d.read_only && !ALIGN_IS_ADMIN);
    if (ALIGN_IS_ADMIN || ALIGN_READ_ONLY) {
      document.getElementById("al-final-count").textContent = ALIGN_IS_ADMIN
        ? `${d.n_finalized ?? 0} finalized / ${d.total ?? 50}`
        : `${d.n_finalized ?? 0} finalized · ${tr("align.read_only_badge")}`;
      renderAdminOverview(d.items || []);
      document.getElementById("al-admin-overview").hidden = false;
      // End-campaign button is admin-only.
      const endBtn = document.getElementById("al-end-btn");
      if (endBtn) endBtn.hidden = !ALIGN_IS_ADMIN;
      // Export JSONL is now available to all_disclosed completed participants too
      // (Ham opened it after de-anonymization — they already see all real names via align_item,
      // exporting the same data adds no new leak; siyuan's task 1 = "admin-equivalent view").
      // Backend gates by role + all_disclosed; frontend just shows the button to anyone
      // viewing the admin/read-only panel.
      const exportBtn = document.getElementById("al-export-btn");
      if (exportBtn) exportBtn.hidden = false;
    }
    if (ALIGN_READ_ONLY) {
      // Read-only viewer: no more annotation form, no loadAlignNext.
      document.getElementById("al-done-msg").hidden = false;
      document.getElementById("al-item").hidden = true;
      return;
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
      // Just finished: refresh status so backend's read_only:true engages → admin-overview panel renders.
      if (!ALIGN_IS_ADMIN && !ALIGN_READ_ONLY) await loadAlignStatus();
      return;
    }
    setVideoSourcesFromItem(d);
    ALIGN_CURRENT = d;
    document.getElementById("al-dataset").textContent = d.dataset || "?";
    document.getElementById("al-task").textContent = d.task || "?";
    const vid = document.getElementById("al-video");
    wireVideoFallback(vid, { onSkip: () => loadAlignNext() });
    vid.src = pickVideoUrl(d.video_sources, d.video_url || "");
    bindVideoSources(vid, d.video_sources);
    vid.load();
    setInitFrame(d.init_frame_url, "al-");
    // Ignore d.prompt (may be prefix/rewrite version) — always use canonical instruction.
    CURRENT_INSTRUCTION = {
      video_url: d.video_url,
      targetId: "al-prompt",
      en: d.instruction || "",
      cn: d.instruction_cn || "",
    };
    if (CURRENT_INSTRUCTION.en || CURRENT_INSTRUCTION.cn) applyCurrentInstruction();
    else fetchInstructionInto(d.video_url, "al-prompt");
    // Reset form
    for (const id of ["al-physical_adherence", "al-instruction_alignment"]) {
      const inp = document.getElementById(id);
      const out = document.getElementById(id + "-out");
      if (inp) inp.value = 3; if (out) out.value = 3;
    }
    for (const id of ["al-agent_consistency", "al-scene_consistency", "al-interaction_realism", "al-agent_match", "al-object_correct", "al-goal_completed"]) {
      setSubTri(id, 2);  // fresh item → all "passes"
    }
    document.getElementById("al-physical_notes").value = "";
    document.getElementById("al-instruction_notes").value = "";
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
  const physical_notes = document.getElementById("al-physical_notes").value.trim();
  const instruction_notes = document.getElementById("al-instruction_notes").value.trim();
  if (!physical_notes || !instruction_notes) { toast(tr("toast.notes_required"), "err"); return; }
  const payload = {
    physical_adherence: Number(document.getElementById("al-physical_adherence").value),
    instruction_alignment: Number(document.getElementById("al-instruction_alignment").value),
    physical_notes,
    instruction_notes,
  };
  for (const id of ["agent_consistency", "scene_consistency", "interaction_realism", "agent_match", "object_correct", "goal_completed"]) {
    payload[id] = getSubTri("al-" + id);  // 3-class
  }
  payload.subs_v = 2;
  const submittedItemId = ALIGN_CURRENT.id;
  try {
    const r = await fetch(CFG.APPS_SCRIPT_URL + "/", {
      method: "POST", headers: { "Content-Type": "text/plain" },
      body: JSON.stringify({ align_submit: true, user, campaign_id: ALIGN_CAMPAIGN_ID, item_id: submittedItemId, payload }),
    });
    const d = await r.json();
    if (d?.ok === false) throw new Error(d.error || "submit failed");
    await refreshAlignStatusOnly();
    // IAA-independence rule (Alice's guard): seeing others requires explicit "disclose" action,
    // which permanently LOCKS this item — re-edit no longer allowed. Default = advance to next.
    if (ALIGN_IS_ADMIN) {
      // Admin doesn't need the disclose lock (independence rule applies to participants only).
      // Keep the existing "see others immediately" UX for admin.
      await showAlignOthers(submittedItemId);
      return;
    }
    const wantSee = confirm(tr("align.disclose.confirm"));
    if (wantSee) {
      await discloseAndShowOthers(submittedItemId);
    } else {
      // Advance to next un-annotated item; this one remains submitted-but-editable until later disclose.
      await loadAlignNext();
    }
  } catch (err) {
    toast(tr("toast.submit_failed") + ": " + err.message, "err");
  }
}

/* Render an inline progress chip showing submitted vs disclosed counts under the main
   "X/Y annotated" stat, and gate the "View results (read-only)" button on all_disclosed.
   Alice's guard: aggregate views unlock only when every item the user submitted has been
   explicitly disclosed (no IAA-contamination path via "submit all then peek at panel"). */
function renderDiscloseProgress(d) {
  const stat = document.getElementById("al-progress-stat");
  if (!stat) return;
  let chip = document.getElementById("al-disclose-chip");
  const myDisclosed = d.my_disclosed ?? 0;
  const total = d.total ?? 50;
  const allDisclosed = !!d.all_disclosed;
  if (!chip) {
    chip = document.createElement("span");
    chip.id = "al-disclose-chip";
    chip.className = "nav-stat";
    chip.style.marginLeft = "10px";
    stat.parentNode.insertBefore(chip, stat.nextSibling);
  }
  chip.innerHTML = `<span class="muted">${tr("align.disclose.label")}</span> <strong>${myDisclosed}</strong>/<strong>${total}</strong>` +
    (allDisclosed ? ` <span class="ok-text">✓</span>` : "");
  // Gate the "View results (read-only)" button on al-done-msg: only visible when all_disclosed.
  const viewBtn = document.getElementById("al-view-results-btn");
  if (viewBtn) viewBtn.hidden = !allDisclosed && !ALIGN_IS_ADMIN;
  // Gate the bulk-disclose-all button: useful only when user has submitted but not all-disclosed.
  // (admin doesn't need it — they see everything regardless.)
  const myDone = d.my_done ?? 0;
  const discloseAllBtn = document.getElementById("al-disclose-all-btn");
  if (discloseAllBtn) discloseAllBtn.hidden = ALIGN_IS_ADMIN || allDisclosed || myDone === 0;
}

/* Load the mixed-state grid of all my items in this campaign (Ham's my_alignment endpoint).
   Each row has annotated/disclosed/finalized/editable flags + payload + media — we render
   one card per item with the appropriate action button. */
async function loadMyAlignment() {
  if (!ALIGN_CAMPAIGN_ID) return;
  const user = localStorage.getItem(CFG.LS_USER);
  hideAlignSections();
  document.getElementById("al-my-alignment").hidden = false;
  const list = document.getElementById("al-my-list");
  list.innerHTML = `<li class="muted">${tr("common.loading")}</li>`;
  try {
    const r = await fetch(`${CFG.APPS_SCRIPT_URL}/?action=my_alignment&user=${encodeURIComponent(user)}&campaign_id=${encodeURIComponent(ALIGN_CAMPAIGN_ID)}`);
    const d = await r.json();
    if (d?.ok === false) throw new Error(d.error || "fetch failed");
    const items = d.items || [];
    if (items.length === 0) { list.innerHTML = `<li class="muted">${tr("my_annotations.empty")}</li>`; return; }
    if (items[0]) setVideoSourcesFromItem(items[0]);
    list.innerHTML = "";
    for (const it of items) list.appendChild(renderMyAlignmentCard(it));
  } catch (err) {
    list.innerHTML = `<li class="warn-text">${escapeHtml(err.message)}</li>`;
  }
}

function renderMyAlignmentCard(it) {
  const li = document.createElement("li");
  // State: not_started / editable / disclosed / finalized
  let state, badgeClass, action;
  if (it.finalized) {
    state = "finalized"; badgeClass = "gold-tag";
    action = `<button type="button" class="link al-row-view" data-id="${escapeHtml(it.item_id)}">${tr("align.row.view_finalized")}</button>`;
  } else if (it.disclosed) {
    state = "disclosed"; badgeClass = "tag";
    action = `<button type="button" class="link al-row-view" data-id="${escapeHtml(it.item_id)}">${tr("align.row.view_disclosed")}</button>`;
  } else if (it.annotated) {
    state = "editable"; badgeClass = "tag aud-tag tag-custom";
    action = `<button type="button" class="link al-row-edit" data-id="${escapeHtml(it.item_id)}">${tr("align.row.edit")}</button>
              <button type="button" class="link al-row-disclose" data-id="${escapeHtml(it.item_id)}">${tr("align.row.disclose")}</button>`;
  } else {
    state = "todo"; badgeClass = "tag";
    action = `<button type="button" class="link al-row-annotate" data-id="${escapeHtml(it.item_id)}">${tr("align.row.annotate")}</button>`;
  }
  li.className = `my-annot-card ma-state-${state}`;
  const p = it.payload || {};
  const phys = p.physical_adherence ?? "—";
  const inst = p.instruction_alignment ?? "—";
  const scoresLine = it.annotated
    ? `<p class="ma-scores">Physical: <strong>${phys}</strong> · Instruction: <strong>${inst}</strong></p>`
    : "";
  li.innerHTML = `
    <div class="meta"><span class="${badgeClass}">${tr("align.state." + state)}</span><span class="tag">${escapeHtml(it.dataset || "?")}</span><span class="tag">${escapeHtml(it.task || "?")}</span></div>
    ${it.video_url ? `<video class="ma-thumb" controls preload="none" muted playsinline webkit-playsinline="true" x5-playsinline="true" src="${pickVideoUrl(it.video_sources, it.video_url)}" data-sources-json='${escapeHtml(JSON.stringify(it.video_sources || []))}'></video>` : ""}
    ${scoresLine}
    <div class="ma-foot">${action}</div>
  `;
  const v = li.querySelector("video"); if (v) wireVideoFallback(v);
  // Wire row actions
  const editBtn = li.querySelector(".al-row-edit");
  if (editBtn) editBtn.addEventListener("click", () => loadAlignItemForEdit(it));
  const discloseBtn = li.querySelector(".al-row-disclose");
  if (discloseBtn) discloseBtn.addEventListener("click", () => {
    if (!confirm(tr("align.disclose.confirm"))) return;
    discloseAndShowOthers(it.item_id);
  });
  const viewBtn = li.querySelector(".al-row-view");
  if (viewBtn) viewBtn.addEventListener("click", () => showAlignOthers(it.item_id));
  const annBtn = li.querySelector(".al-row-annotate");
  if (annBtn) annBtn.addEventListener("click", () => loadAlignItemForAnnotate(it));
  return li;
}

/* Load an editable (submitted-but-undisclosed) item back into al-form for re-scoring. */
function loadAlignItemForEdit(it) {
  hideAlignSections();
  setVideoSourcesFromItem(it);
  ALIGN_CURRENT = { id: it.item_id, video_url: it.video_url, dataset: it.dataset, task: it.task,
                    video_sources: it.video_sources, instruction: it.instruction, instruction_cn: it.instruction_cn };
  document.getElementById("al-dataset").textContent = it.dataset || "?";
  document.getElementById("al-task").textContent = it.task || "?";
  const vid = document.getElementById("al-video");
  wireVideoFallback(vid, { onSkip: () => loadAlignNext() });
  vid.src = pickVideoUrl(it.video_sources, it.video_url || "");
  bindVideoSources(vid, it.video_sources);
  vid.load();
  setInitFrame(it.init_frame_url, "al-");
  CURRENT_INSTRUCTION = {
    video_url: it.video_url, targetId: "al-prompt",
    en: it.instruction || "", cn: it.instruction_cn || "",
  };
  if (CURRENT_INSTRUCTION.en || CURRENT_INSTRUCTION.cn) applyCurrentInstruction();
  else fetchInstructionInto(it.video_url, "al-prompt");
  // Prefill form values
  const p = it.payload || {};
  for (const id of ["al-physical_adherence", "al-instruction_alignment"]) {
    const k = id.replace("al-", "");
    const v = p[k];
    const inp = document.getElementById(id);
    const out = document.getElementById(id + "-out");
    if (inp && v != null) inp.value = v;
    if (out && v != null) out.value = v;
    if (inp) inp.dispatchEvent(new Event("input"));
  }
  for (const id of ["agent_consistency", "scene_consistency", "interaction_realism", "agent_match", "object_correct", "goal_completed"]) {
    setSubTri("al-" + id, p[id] ?? 2);
  }
  document.getElementById("al-physical_notes").value = p.physical_notes || "";
  document.getElementById("al-instruction_notes").value = p.instruction_notes || "";
  document.getElementById("al-item").hidden = false;
  document.getElementById("al-others").hidden = true;
}

/* Load a not-yet-annotated item directly (skip the loadAlignNext queue ordering). */
function loadAlignItemForAnnotate(it) {
  hideAlignSections();
  setVideoSourcesFromItem(it);
  ALIGN_CURRENT = { id: it.item_id, video_url: it.video_url, dataset: it.dataset, task: it.task,
                    video_sources: it.video_sources, instruction: it.instruction, instruction_cn: it.instruction_cn };
  document.getElementById("al-dataset").textContent = it.dataset || "?";
  document.getElementById("al-task").textContent = it.task || "?";
  const vid = document.getElementById("al-video");
  wireVideoFallback(vid, { onSkip: () => loadAlignNext() });
  vid.src = pickVideoUrl(it.video_sources, it.video_url || "");
  bindVideoSources(vid, it.video_sources);
  vid.load();
  setInitFrame(it.init_frame_url, "al-");
  CURRENT_INSTRUCTION = {
    video_url: it.video_url, targetId: "al-prompt",
    en: it.instruction || "", cn: it.instruction_cn || "",
  };
  if (CURRENT_INSTRUCTION.en || CURRENT_INSTRUCTION.cn) applyCurrentInstruction();
  else fetchInstructionInto(it.video_url, "al-prompt");
  // Reset form (fresh item)
  for (const id of ["al-physical_adherence", "al-instruction_alignment"]) {
    const inp = document.getElementById(id);
    const out = document.getElementById(id + "-out");
    if (inp) inp.value = 3; if (out) out.value = 3;
  }
  for (const id of ["al-agent_consistency", "al-scene_consistency", "al-interaction_realism", "al-agent_match", "al-object_correct", "al-goal_completed"]) {
    setSubTri(id, 2);  // fresh item → all "passes"
  }
  document.getElementById("al-physical_notes").value = "";
  document.getElementById("al-instruction_notes").value = "";
  document.getElementById("al-item").hidden = false;
  document.getElementById("al-others").hidden = true;
}

/* Bulk-disclose all of the user's submitted items in this campaign, then immediately
   open the read-only aggregate panel. Solves task 1: "completed users should see everyone
   just like admin, without 50 clicks". Permanent lock — confirm dialog warns. */
async function discloseAllAndOpenResults() {
  if (!ALIGN_CAMPAIGN_ID) return;
  const user = localStorage.getItem(CFG.LS_USER);
  if (!confirm(tr("align.disclose_all.confirm"))) return;
  try {
    const r = await fetch(CFG.APPS_SCRIPT_URL + "/", {
      method: "POST", headers: { "Content-Type": "text/plain" },
      body: JSON.stringify({ align_disclose_all: true, user, campaign_id: ALIGN_CAMPAIGN_ID }),
    });
    const d = await r.json();
    if (d?.ok === false) throw new Error(d.error || "bulk disclose failed");
    toast(tr("align.disclose_all.done_toast"), "ok");
    // Reload status — backend now flags all_disclosed=true → read-only panel auto-renders
    // with admin-equivalent visibility (real names, participants, IAA, Export per Ham's #1).
    await loadAlignStatus();
  } catch (err) {
    toast("Bulk disclose failed: " + err.message, "err");
  }
}

/* Explicitly disclose an item (locking re-edit) then show the side-by-side view.
   Backend enforces the lock: subsequent align_submit on this item returns 409. */
async function discloseAndShowOthers(item_id) {
  const user = localStorage.getItem(CFG.LS_USER);
  try {
    const r = await fetch(CFG.APPS_SCRIPT_URL + "/", {
      method: "POST", headers: { "Content-Type": "text/plain" },
      body: JSON.stringify({ align_disclose_item: true, user, campaign_id: ALIGN_CAMPAIGN_ID, item_id }),
    });
    const d = await r.json();
    if (d?.ok === false) throw new Error(d.error || "disclose failed");
    toast(tr("align.disclose.locked_toast"), "ok");
    await showAlignOthers(item_id);
    await refreshAlignStatusOnly();
  } catch (err) {
    toast("Disclose failed: " + err.message, "err");
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
    // Show video + meta + instruction inline so the user can rewatch while reviewing
    // others' scores (siyuan flagged the video was missing in this view, 2026-06-28).
    document.getElementById("al-others-dataset").textContent = d.dataset || "?";
    document.getElementById("al-others-task").textContent = d.task || "?";
    setVideoSourcesFromItem(d);
    const ov = document.getElementById("al-others-video");
    if (ov) {
      wireVideoFallback(ov);
      ov.src = pickVideoUrl(d.video_sources, d.video_url || "");
      bindVideoSources(ov, d.video_sources);
      ov.load();
    }
    setInitFrame(d.init_frame_url, "al-others-");
    // Instruction (same path as the annotate form — prefer backend-supplied text, fallback HF fetch).
    CURRENT_INSTRUCTION = {
      video_url: d.video_url,
      targetId: "al-others-prompt",
      en: d.instruction || "",
      cn: d.instruction_cn || "",
    };
    if (CURRENT_INSTRUCTION.en || CURRENT_INSTRUCTION.cn) applyCurrentInstruction();
    else if (d.video_url) fetchInstructionInto(d.video_url, "al-others-prompt");
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
    // 3-class: 0=✗ / 1=⚠ / 2=✓
    const glyph = v === 0 ? "✗" : (v === 1 ? "⚠" : "✓");
    const cls = v === 0 ? "no" : (v === 1 ? "partial" : "yes");
    return `<span class="sub-badge ${cls}" title="${k}">${glyph} ${k.replace(/_/g," ")}</span>`;
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
      ${(p.physical_notes || p.instruction_notes)
        ? `<p class="aoc-notes"><strong>P:</strong> ${escapeHtml(p.physical_notes || "—")}<br><strong>I:</strong> ${escapeHtml(p.instruction_notes || "—")}</p>`
        : (p.notes ? `<p class="aoc-notes">${escapeHtml(p.notes)}</p>` : "")}
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

  // Next button: prefer next item in current admin/read-only overview (so siyuan can step
  // through finalized items for review). Falls back to loadAlignNext for the regular
  // annotate flow (un-annotated → next un-annotated).
  let nextBtn = document.getElementById("al-next-btn");
  if (!nextBtn) {
    nextBtn = document.createElement("button");
    nextBtn.id = "al-next-btn";
    nextBtn.type = "button";
    nextBtn.className = "primary";
    nextBtn.textContent = "Next item →";
    nextBtn.style.marginTop = "12px";
    document.getElementById("al-others").appendChild(nextBtn);
  }
  // Re-wire handler per render so we know the *current* item id (closure captures d.item_id).
  const curId = d.item_id;
  nextBtn.onclick = () => {
    document.getElementById("al-others").hidden = true;
    // If we're stepping through the admin/read-only overview, advance to the next item there.
    if (ALIGN_OVERVIEW_ITEMS && ALIGN_OVERVIEW_ITEMS.length) {
      const idx = ALIGN_OVERVIEW_ITEMS.indexOf(curId);
      if (idx >= 0 && idx < ALIGN_OVERVIEW_ITEMS.length - 1) {
        showAlignOthers(ALIGN_OVERVIEW_ITEMS[idx + 1]);
        return;
      }
      // End of overview list — show overview panel again.
      const ov = document.getElementById("al-admin-overview");
      if (ov && !ov.hidden) { toast(tr("align.overview.end_of_list"), "ok"); return; }
    }
    // Default: regular annotate flow (un-annotated → next un-annotated).
    loadAlignNext();
  };
}

function renderFinalizeForm(d) {
  const wrap = document.getElementById("al-finalize-form-wrap");
  // Pre-fill with admin's own annotation if present, else first non-self
  const myA = (d.annotations || []).find(a => a.is_self) || (d.annotations || [])[0];
  const p = (myA && myA.payload) || {};
  // 3-class semantic: stored 0=violated/1=partial/2=passes. Legacy 0/1 already migrated by Ham.
  function subTriHtml(prefix, key, label) {
    const v = p[key] ?? 2;
    const btn = (val, glyph, title) =>
      `<button type="button" class="sub-tri-btn val-${val}${v === val ? " active" : ""}" data-val="${val}" title="${title}">${glyph}</button>`;
    return `<div class="sub-tri" data-key="${prefix}${key}">
      <div class="sub-tri-head"><span class="sub-tri-label">${escapeHtml(label)}</span></div>
      <div class="sub-tri-buttons" role="radiogroup">${btn(0,"✗","violated")}${btn(1,"⚠","partial")}${btn(2,"✓","passes")}</div>
      <input type="hidden" id="${prefix}${key}" value="${v}">
    </div>`;
  }
  wrap.innerHTML = `
    <form id="al-finalize-form">
      <fieldset class="dim-block">
        <legend class="dim-block-title">Physical Adherence (final)</legend>
        <div class="form-row">
          <label for="f-physical_adherence">Score (1–5) <output for="f-physical_adherence" id="f-physical_adherence-out">${p.physical_adherence ?? 3}</output></label>
          <input type="range" id="f-physical_adherence" min="1" max="5" step="1" value="${p.physical_adherence ?? 3}">
          <p class="score-hint level-${p.physical_adherence ?? 3}" id="f-physical_adherence-hint">—</p>
        </div>
        <div class="sub-row">
          ${subTriHtml("f-", "agent_consistency", "Agent consistency")}
          ${subTriHtml("f-", "scene_consistency", "Scene & object consistency")}
          ${subTriHtml("f-", "interaction_realism", "Interaction realism")}
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
          ${subTriHtml("f-", "agent_match", "Agent match")}
          ${subTriHtml("f-", "object_correct", "Object correct")}
          ${subTriHtml("f-", "goal_completed", "Goal completed")}
        </div>
      </fieldset>
      <div class="form-row">
        <label for="f-physical_notes">Physical evidence (final) <span class="required-tag">*</span></label>
        <textarea id="f-physical_notes" rows="2" maxlength="500" placeholder="Required — synthesize consensus on physical score">${escapeHtml(p.physical_notes || p.notes || "")}</textarea>
      </div>
      <div class="form-row">
        <label for="f-instruction_notes">Instruction-alignment evidence (final) <span class="required-tag">*</span></label>
        <textarea id="f-instruction_notes" rows="2" maxlength="500" placeholder="Required — synthesize consensus on instruction score">${escapeHtml(p.instruction_notes || "")}</textarea>
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
  wireSubTriButtons(wrap);  // 6 sub-tri groups in the freshly-injected finalize form
  document.getElementById("al-finalize-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    await submitAlignFinalize(d.item_id || ALIGN_CURRENT.id);
  });
}

async function submitAlignFinalize(item_id) {
  const admin = localStorage.getItem(CFG.LS_USER);
  const physical_notes = document.getElementById("f-physical_notes").value.trim();
  const instruction_notes = document.getElementById("f-instruction_notes").value.trim();
  if (!physical_notes || !instruction_notes) { toast(tr("toast.finalize_note_required"), "err"); return; }
  const payload = {
    physical_adherence: Number(document.getElementById("f-physical_adherence").value),
    instruction_alignment: Number(document.getElementById("f-instruction_alignment").value),
    physical_notes,
    instruction_notes,
  };
  for (const id of ["agent_consistency","scene_consistency","interaction_realism","agent_match","object_correct","goal_completed"]) {
    payload[id] = getSubTri("f-" + id);  // 3-class
  }
  payload.subs_v = 2;
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
  // Remember the ordered list so the "Next" button in al-others can step through it
  // (fixes siyuan's "next button doesn't go to next" — was calling loadAlignNext which only
  // returns un-annotated items, so for an admin reviewing finalized items "Next" did nothing).
  ALIGN_OVERVIEW_ITEMS = sorted.map(x => x.item_id);
  for (const it of sorted) {
    const li = document.createElement("li");
    li.className = "al-admin-row" + (it.finalized ? " finalized" : "");
    // Read-only viewer: button is "View" (admin actions like finalize live behind 403).
    const btnLabel = ALIGN_READ_ONLY
      ? "View"
      : (it.finalized ? "Re-view" : "View / finalize");
    li.innerHTML = `
      <span class="row-meta">${escapeHtml(it.dataset || "?")} · ${escapeHtml(it.task || "?")}</span>
      <span class="muted">${it.n_annotations ?? 0} annotation(s)</span>
      <span class="row-spacer"></span>
      ${it.finalized ? '<span class="row-badge gold">FINALIZED</span>' : ''}
      <button type="button" class="link al-view-btn" data-id="${escapeHtml(it.item_id)}">${btnLabel}</button>
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

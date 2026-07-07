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
    "home.card.review.sub_reviewer": "Audit yesterday's annotations",
    "review.kpi_gate.title": "⏳ Yesterday's annotation KPI not met",
    "review.kpi_gate.body": "Finish yesterday's annotation quota first — review assignments are gated on the previous day's KPI.",
    "review.kpi_gate.detail": "Yesterday completed",
    "review.kpi_gate.dashboard": "Yesterday's KPI not met — review locked until you catch up.",
    "review.edit_not_found": "Couldn't find that past review in your history.",
    "review.today": "today",
    "review.edit_required": "Both 调整 / Reject require you to change the scores or notes before submitting.",
    "review.remaining": "queue",
    "review.queue_empty": "🎉 No more review tasks in your queue.",
    "review.cap_reached": "🎉 You've finished your 5 reviews for today — come back tomorrow.",
    "home.card.my_reviews.title": "My reviews",
    "home.card.my_reviews.sub": "Decisions you've made",
    "home.card.review_results.title": "Review results",
    "home.card.review_results.sub": "Read-only — admin doesn't get review tasks",
    "home.card.arbitration.title": "Arbitration",
    "home.card.arbitration.sub": "Final-say on rejections",
    "page.arbitration": "Arbitration",
    "arbitration.queue": "queue",
    "arbitration.loading": "Loading next arbitration…",
    "arbitration.tag": "ARBITRATION",
    "arbitration.annotator": "Annotator",
    "arbitration.reviewer": "Reviewer",
    "arbitration.your_decision": "Your decision",
    "arbitration.note_label": "Arbitration note (optional)",
    "arbitration.uphold": "✅ 维持不通过 / Uphold",
    "arbitration.overturn": "↩ 推翻不通过 / Overturn",
    "arbitration.modify": "✏ 修改判定 / Modify",
    "arbitration.modify_submit": "📤 提交修改 / Submit Modify",
    "arbitration.queue_empty": "🎉 No arbitrations pending.",
    "arbitration.role_required": "仲裁员 (meta-reviewer)",
    "arbitration.badge.uphold": "⚖ Upheld",
    "arbitration.badge.overturn": "⚖ Overturned",
    "arbitration.badge.modify": "⚖ Modified",
    "arbitration.badge.pending": "⚖ Pending arbitration",
    "arbitration.tab.dispute": "Disputes",
    "arbitration.tab.allreviews": "All reviews",
    "arbitration.only_flagged": "Flagged only",
    "arbitration.allreviews_empty": "No reviews match.",
    "arbitration.flagged_count": "flagged",
    "arbitration.total_count": "total",
    "review.ai_flag.high": "AI ⚠ HIGH",
    "review.ai_flag.mid": "AI ⚠",
    "review.coverage": "test coverage",
    "stats.model_leaderboard.title": "🏁 Model average scores",
    "stats.model_leaderboard.hint": "Ranked by overall mean = (PA + IA) / 2 · daily refresh",
    "stats.score_dist.title": "📈 Score distribution",
    "stats.score_dist.hint": "PA / IA histograms 1-5 · all vs mine · quarantine / skip excluded · daily",
    "stats.score_dist.all": "All annotators",
    "stats.score_dist.mine": "Mine",
    "home.card.stats.title": "Stats",
    "home.card.stats.sub": "Model + score distribution",
    "page.stats": "📊 Stats",
    "stats.updated_daily": "refreshed daily",
    "review.accuracy": "Reviewer accuracy (vs meta arbitration)",
    "review.accuracy.correct": "✓ Reject upheld",
    "review.accuracy.over_reject": "✗ Over-rejected",
    "review.accuracy.adjusted": "≈ Adjusted by meta",
    "home.card.gold_annotation.title": "Gold annotation",
    "home.card.gold_annotation.sub": "Your 50-item set",
    "home.card.gold_reviewed.title": "Gold reviewed",
    "home.card.gold_reviewed.sub": "Admin audits of you",
    "home.card.alignment.title": "Alignment",
    "home.card.alignment.sub": "Shared 50-item alignment task",
    "home.card.alignment_admin.title": "Manage alignment",
    "home.card.alignment_admin.sub": "Create campaigns · Alice finalizes",
    "home.card.gold_review.title": "Gold review",
    "home.card.gold_review.sub": "Approve reviewer gold",
    "home.card.gold_direct.title": "Gold (direct)",
    "home.card.gold_direct.sub": "No-audit fast path",
    "common.retry": "Refresh",
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
    "align.n_items_label": "Items per campaign (default 10)",
    "admin.delete_user_tip": "Delete user (blocklists the name, history kept)",
    "admin.delete_user_confirm": "Delete {U}? Their annotation history stays attributed to them, but the name is blocklisted and cannot re-register. This is reversible via admin tools.",
    "admin.delete_reviewer_warn": "⚠ {U} is a REVIEWER. Deleting them shrinks the review pool (admin still backs up review queue). Continue?",
    "admin.delete_user_done": "Deleted {U}.",
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
    "my_reviews.work_title": "My review decisions",
    "my_reviews.work_empty": "You haven't reviewed any items yet.",
    "my_reviews.edit_btn": "Re-decide",
    "my_reviews.stats.reviewed": "reviewed",
    "my_reviews.stats.approved": "approved",
    "my_reviews.stats.modified": "modified",
    "my_reviews.stats.rate": "approval rate",
    "alignment_metrics.title": "🎯 Annotator alignment vs consensus",
    "alignment_metrics.sub": "Per-annotator PA/IA vs leave-one-out consensus (Alice-computed), with reference judge rows on the same items for scale (when available).",
    "alignment_metrics.title_v2": "🎯 Per-annotator alignment vs consensus",
    "alignment_metrics.floor": "Human-IAA floor",
    "alignment_metrics.col.who": "Who",
    "alignment_metrics.default_ref": "leave-one-out consensus",
    "alignment_metrics.ref_prefix": "Reference:",
    "alignment_metrics.no_model_yet": "⏳ Reference judge rows pending — Alice will add fair-comparison model rows once flash finishes on this campaign's items.",
    "alignment_metrics.no_model_short": "model rows pending",
    "alignment_metrics.outlier_tip": "Alice flagged: annotator's scores diverge notably from the group consensus.",
    "alignment_metrics.low_conf": "Small campaign (n_items < 20) — CI is wide, treat single-annotator outliers as tentative.",
    "alignment_metrics.low_conf_short": "n<20 (wide CI)",
    "alignment_metrics.fail_tip": "Below the human-IAA floor — this annotator should retake the next alignment round.",
    "alignment_metrics.retake": "retake",
    "my_alignment_card.title": "🎯 Alignment scores (all annotators)",
    "my_alignment_card.sub": "Latest alignment campaign — every annotator's PA/IA vs group consensus, with reference judge scores from the 875-item leaderboard for scale.",
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
    "toast.align_finalized_locked": "This item was just finalized by an admin — your re-submit was blocked. Refreshing.",
    "toast.main_sub_conflict_phys": "Physical adherence score conflict — a sub-item is marked ⚠/✗, so the main score can't stay at 5. Lower the main slider.",
    "toast.main_sub_conflict_instr": "Instruction alignment score conflict — a sub-item is marked ⚠/✗, so the main score can't stay at 5. Lower the main slider.",
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
    "task.physical_notes_placeholder": "Required — cover the three sub-axes: agent integrity / scene & object / interaction realism. Cite specific visual evidence per axis.",
    "task.instruction_notes": "Instruction-alignment evidence",
    "task.instruction_notes_placeholder": "Required — cover the three sub-axes: agent match / object correct / goal completed. Cite specific evidence per axis.",
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
    "review.submit_decision": "📤 Submit",
    "review.action.approve": "✅ Approve",
    "review.action.modify": "✏ Modify",
    "review.action.reject": "🛑 Reject",
    "review.decision.approve": "✅ Approved",
    "review.decision.minor": "✏ Adjusted",
    "review.decision.major": "🛑 Rejected",
    "quality.no_reviews_yet": "No reviews yet.",
    "quality.this_week": "This week",
    "quality.reviewed_unit": "reviewed",
    "quality.pass_rate": "pass",
    "quality.full_pass_rate": "full-pass",
    "quality.earned_this_week": "Earned this week",
    "quality.tier.bonus": "Bonus",
    "quality.tier.base": "Base",
    "quality.tier.low": "Reduced",
    "quality.tier.interim": "Interim (need ≥10)",
    "quality.tier.paused": "PAUSED",
    "quality.pause.normal": "",
    "quality.pause.reannotate_required": "⚠ Below 60% — clear redo queue to resume.",
    "quality.pause.admin_review": "🛑 Admin review.",
    "quality.rework.pending": "⚠ {N} items awaiting full audit — pass rate updates as reviewer finishes.",
    "quality.rework.admin_review": "🛑 Queue cleared but rate still <60% — admin review.",
    "my_annotations.rework_badge": "❗ Auditing",
    "review.modify_note": "Modification note",
    "review.annotator_submission": "Annotator submission (annotator hidden)",
    "review.annotator_submission_by": "Annotator submission by",
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
    "my_annotations.tab.all": "All",
    "my_annotations.tab.pending": "Pending review",
    "my_annotations.tab.reviewed": "Reviewed",
    "my_annotations.tab.rejected": "Rejected",
    "my_annotations.reject_rate": "Rejection rate",
    "my_annotations.sample_low": "(sample too small)",
    "my_annotations.unread": "Unread rejection — click to mark as read",
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
    "align.mine_link": "📋 My items",
    "docs.title": "Annotation Standard",
    "home.section_home": "Home",
    "milestone.title": "Milestone progress",
    "milestone.note": "Items auto-routed across the pool — your contributions count toward the shared milestone.",
    "milestone.counts": "Yours {mine} · everyone {all} / {total}",
    "milestone.done_toast": "🎉 Milestone complete — thank you!",
    "earnings.settle_time": "Settles daily at 13:00 Beijing time.",
    "countdown.title": "Next settle in",
    "countdown.now": "Settling now…",
    "task.report_data": "🚨 Report",
    "task.edit_prev": "↺ Edit previous",
    "task.edit_prev_confirm": "Discard current draft and edit the previously submitted item?",
    "reports.title": "🚨 Data issue reports",
    "reports.page_title": "🚨 Data issue reports",
    "reports.empty": "No reports.",
    "reports.show_video": "▶ Show video",
    "reports.quarantine_btn": "Quarantine whole task",
    "reports.quarantine_title": "Hold back ALL sibling videos (every model × prompt) of this GT task",
    "reports.quarantine_confirm": "Quarantine this entire task? All sibling videos across all models will be held out of annotate + review until you restore.",
    "reports.quarantine_done": "Quarantined — {n} sibling videos held back.",
    "reports.quarantine_auto_resolved": "{r} open report(s) auto-resolved.",
    "quarantine.title": "🚧 Quarantined tasks",
    "quarantine.hint": "These GT tasks are held out of annotate + review across all sibling models.",
    "quarantine.empty": "No tasks quarantined.",
    "quarantine.tag": "QUARANTINED",
    "quarantine.affected": "{n} sibling videos",
    "quarantine.restore": "Restore",
    "quarantine.restore_confirm": "Restore this GT task back to the annotate + review pools?",
    "quarantine.restored": "Restored.",
    "reports.hide_video": "▾ Hide video",
    "home.card.reports.title": "Data reports",
    "home.card.reports.sub": "Reported items queue",
    "readonly.title": "Read-only admin",
    "readonly.body": "You're a read-only admin — you can see admin views but cannot take write actions (delete user, change role, resolve reports, finalize alignments). Ask masiyuan if you need write access.",
    "readonly.ok": "Got it",
    "leaderboard.title": "📊 Team today",
    "leaderboard.admin": "Admin",
    "leaderboard.ranked": "Today (sorted)",
    "leaderboard.top3": "Top 3 today",
    "leaderboard.done": "Quota met today",
    "leaderboard.none": "—",
    "leaderboard.team_today_summary": "Team today: {n} annotations",
    "report.title": "Report a data issue",
    "report.type_label": "Issue type",
    "report.type.instruction_init_mismatch": "Instruction doesn't match init frame",
    "report.type.init_no_agent": "No agent in init frame",
    "report.type.video_unplayable": "Video unplayable",
    "report.type.video_static_black": "Video static / black",
    "report.type.other": "Other",
    "report.note_label": "Note (optional)",
    "report.note_placeholder": "Optional detail — Admin will review.",
    "report.submit": "Submit report",
    "report.submitted_toast": "Reported — Admin will review.",
    "report.failed_toast": "Report failed",
    "common.cancel": "Cancel",
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
    "home.card.review.sub_reviewer": "审核前一日的标注",
    "review.kpi_gate.title": "⏳ 昨日标注 KPI 未完成",
    "review.kpi_gate.body": "必须先完成昨日的标注任务,今天才能领取审核任务。",
    "review.kpi_gate.detail": "昨日已完成",
    "review.kpi_gate.dashboard": "昨日 KPI 未完成 — 完成后才能审核。",
    "review.edit_not_found": "在历史里找不到这条审核记录。",
    "review.today": "今日审核",
    "review.edit_required": "调整 / Reject 都需要先改分或备注后再提交。",
    "review.remaining": "队列",
    "review.queue_empty": "🎉 审核队列已清空。",
    "review.cap_reached": "🎉 今日 5 条审核已完成,明天继续。",
    "home.card.my_reviews.title": "我的审核",
    "home.card.my_reviews.sub": "你做过的审核决定",
    "home.card.review_results.title": "审核结果",
    "home.card.review_results.sub": "只读视图 — 管理员不被分配审核任务",
    "home.card.arbitration.title": "审核仲裁",
    "home.card.arbitration.sub": "对不通过审核做最终裁决",
    "page.arbitration": "审核仲裁",
    "arbitration.queue": "队列",
    "arbitration.loading": "加载下一条仲裁中…",
    "arbitration.tag": "仲裁",
    "arbitration.annotator": "标注者",
    "arbitration.reviewer": "审核员",
    "arbitration.your_decision": "你的裁决",
    "arbitration.note_label": "裁决备注(可选)",
    "arbitration.uphold": "✅ 维持不通过",
    "arbitration.overturn": "↩ 推翻不通过",
    "arbitration.modify": "✏ 修改判定",
    "arbitration.modify_submit": "📤 提交修改",
    "arbitration.queue_empty": "🎉 暂无待裁决审核。",
    "arbitration.role_required": "仲裁员(meta-reviewer)",
    "arbitration.badge.uphold": "⚖ 维持不通过",
    "arbitration.badge.overturn": "⚖ 推翻不通过",
    "arbitration.badge.modify": "⚖ 仲裁修改",
    "arbitration.badge.pending": "⚖ 待仲裁",
    "arbitration.tab.dispute": "仲裁队列",
    "arbitration.tab.allreviews": "全览",
    "arbitration.only_flagged": "只看异常",
    "arbitration.allreviews_empty": "没有匹配的审核。",
    "arbitration.flagged_count": "条异常",
    "arbitration.total_count": "条",
    "review.ai_flag.high": "AI ⚠ 高",
    "review.ai_flag.mid": "AI ⚠",
    "review.coverage": "test 覆盖",
    "stats.model_leaderboard.title": "🏁 Model 均分榜",
    "stats.model_leaderboard.hint": "按整体均分(=(PA+IA)/2)降序 · 每天更新",
    "stats.score_dist.title": "📈 分数分布",
    "stats.score_dist.hint": "PA / IA 1-5 直方 · 全员 vs 自己 · 排除隔离/skip · 每天更新",
    "stats.score_dist.all": "全员",
    "stats.score_dist.mine": "自己",
    "home.card.stats.title": "统计",
    "home.card.stats.sub": "Model 均分 + 分数分布",
    "page.stats": "📊 统计",
    "stats.updated_daily": "每天更新",
    "review.accuracy": "审核准确率(对比仲裁结果)",
    "review.accuracy.correct": "✓ 反对成立",
    "review.accuracy.over_reject": "✗ 误拒",
    "review.accuracy.adjusted": "≈ 仲裁调整",
    "home.card.gold_annotation.title": "金标标注",
    "home.card.gold_annotation.sub": "你的 50 条金标集",
    "home.card.gold_reviewed.title": "金标被审核",
    "home.card.gold_reviewed.sub": "管理员对你金标的审核",
    "home.card.alignment.title": "对齐任务",
    "home.card.alignment.sub": "全员共享的 50 条对齐任务",
    "home.card.alignment_admin.title": "管理对齐",
    "home.card.alignment_admin.sub": "发起 campaign · Alice 负责 finalize",
    "home.card.gold_review.title": "金标审核",
    "home.card.gold_review.sub": "审核审核员金标",
    "home.card.gold_direct.title": "金标(直接)",
    "home.card.gold_direct.sub": "免审快路径",
    "common.retry": "刷新",
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
    "align.n_items_label": "条目数(默认 10)",
    "admin.delete_user_tip": "删除用户(账号封禁,历史保留)",
    "admin.delete_user_confirm": "删除用户 {U}? 该用户的标注历史仍归属于他,但账号名将被封禁,不能再注册。Admin 工具可恢复。",
    "admin.delete_reviewer_warn": "⚠ {U} 是 reviewer。删除会缩小审核池(admin 仍能兜底)。确定继续吗?",
    "admin.delete_user_done": "已删除 {U}。",
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
    "my_reviews.work_title": "我的审核决定",
    "my_reviews.work_empty": "你还没有审核过任何任务。",
    "my_reviews.edit_btn": "重新审核",
    "my_reviews.stats.reviewed": "已审核",
    "my_reviews.stats.approved": "通过",
    "my_reviews.stats.modified": "修改",
    "my_reviews.stats.rate": "通过率",
    "alignment_metrics.title": "🎯 标注员对齐指标 vs 群体共识",
    "alignment_metrics.sub": "每位标注员在留一共识(leave-one-out,Alice 计算)上的 PA/IA,同表可附 judge 模型公平对照行。",
    "alignment_metrics.title_v2": "🎯 各标注员相对群体共识的对齐度",
    "alignment_metrics.floor": "人-人 IAA 门槛",
    "alignment_metrics.col.who": "标注员/模型",
    "alignment_metrics.default_ref": "留一共识 (leave-one-out)",
    "alignment_metrics.ref_prefix": "参考:",
    "alignment_metrics.no_model_yet": "⏳ 模型公平对照行待补 — Alice 会在 flash 跑完本 campaign 后加。",
    "alignment_metrics.no_model_short": "模型行待补",
    "alignment_metrics.outlier_tip": "Alice 标记:该标注员分数明显偏离群体共识。",
    "alignment_metrics.low_conf": "样本量小 (n_items < 20) — 置信区间宽,单个 outlier 建议保守判读。",
    "alignment_metrics.low_conf_short": "n<20 CI 宽",
    "alignment_metrics.fail_tip": "低于人-人 IAA 门槛 — 该标注员应参加下一轮 alignment。",
    "alignment_metrics.retake": "需重考",
    "my_alignment_card.title": "🎯 对齐分(全体标注员)",
    "my_alignment_card.sub": "最近一次 alignment campaign — 全体标注员对齐群体共识的 PA/IA,附 875 leaderboard 上的 judge 参考行作为尺度。",
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
    "toast.align_finalized_locked": "本条已被管理员定稿,无法再修改。正在刷新列表。",
    "toast.main_sub_conflict_phys": "物理真实度评分冲突 — 子项被标为 ⚠/✗,总评分不能停在 5。请下调主滑块。",
    "toast.main_sub_conflict_instr": "指令对齐度评分冲突 — 子项被标为 ⚠/✗,总评分不能停在 5。请下调主滑块。",
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
    "task.physical_notes_placeholder": "必填 — 覆盖三轴:机械手完整 / 场景物体一致 / 交互真实。每轴引具体视觉证据。",
    "task.instruction_notes": "指令对齐证据",
    "task.instruction_notes_placeholder": "必填 — 覆盖三轴:机械手匹配 / 物体正确 / 目标达成。每轴引具体证据。",
    "task.save_next": "保存并下一条 →",
    "task.skip": "跳过",
    "task.report": "⚠ 上报(不确定)",
    "task.required": "*",
    "task.today": "今日",
    "axis.physical": "物理真实度",
    "axis.physical_help": "只看视频判断",
    "sub.violation_notice": "⚠ 勾选 = 标记该项【被违背】(红 ✗);默认不勾 = 通过。只在发现问题时勾选。",
    "axis.pa.level.1": "整体崩坏 — 普遍物理违反",
    "axis.pa.level.2": "重大违反",
    "axis.pa.level.3": "明显不一致",
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
    "review.action.approve": "✅ 通过 / Approve",
    "review.action.modify": "✏ 修改 / Modify",
    "review.action.reject": "🛑 打回 / Reject",
    "review.approve": "✅ 通过",
    "review.modify": "✏ 调整",
    "review.minor": "✏ 调整",
    "review.major": "🛑 Reject",
    "review.submit_decision": "📤 提交",
    "review.decision.approve": "✅ 通过",
    "review.decision.minor": "✏ 调整",
    "review.decision.major": "🛑 不通过",
    "quality.no_reviews_yet": "暂无审核记录。",
    "quality.this_week": "本周",
    "quality.reviewed_unit": "条",
    "quality.pass_rate": "通过",
    "quality.full_pass_rate": "完全通过",
    "quality.earned_this_week": "本周已挣",
    "quality.tier.bonus": "奖励",
    "quality.tier.base": "正常",
    "quality.tier.low": "减扣",
    "quality.tier.interim": "暂结(需 ≥10)",
    "quality.tier.paused": "已暂停",
    "quality.pause.normal": "",
    "quality.pause.reannotate_required": "⚠ 通过率 <60%,清重做队列恢复。",
    "quality.pause.admin_review": "🛑 Admin 复审中。",
    "quality.rework.pending": "⚠ {N} 条 reviewer 全审中 — 等审完通过率会更新。",
    "quality.rework.admin_review": "🛑 池已清但率仍 <60%,Admin 复审。",
    "my_annotations.rework_badge": "❗ 待审",
    "review.modify_note": "修改备注",
    "review.annotator_submission": "标注者提交(隐名)",
    "review.annotator_submission_by": "标注者:",
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
    "my_annotations.tab.all": "全部",
    "my_annotations.tab.pending": "未审核",
    "my_annotations.tab.reviewed": "已审核",
    "my_annotations.tab.rejected": "不通过",
    "my_annotations.reject_rate": "不通过率",
    "my_annotations.sample_low": "(样本不足)",
    "my_annotations.unread": "未读不通过 — 点击标为已读",
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
    "align.mine_link": "📋 我标过的",
    "docs.title": "标注标准",
    "home.section_home": "首页",
    "milestone.title": "里程碑进度",
    "milestone.note": "条目自动派发 — 你的标注贡献到团队 milestone。",
    "milestone.counts": "我 {mine} · 全员 {all} / {total}",
    "milestone.done_toast": "🎉 里程碑达成,感谢!",
    "earnings.settle_time": "每日 13:00（北京时间）结算。",
    "countdown.title": "距离结算",
    "countdown.now": "正在结算…",
    "task.report_data": "🚨 报错",
    "task.edit_prev": "↺ 修改上一条",
    "task.edit_prev_confirm": "丢弃当前草稿,改上一条已提交的?",
    "reports.title": "🚨 数据问题报告",
    "reports.page_title": "🚨 数据问题报告",
    "reports.empty": "暂无报告。",
    "reports.show_video": "▶ 查看视频",
    "reports.quarantine_btn": "隔离整个 task",
    "reports.quarantine_title": "把这个 GT 任务的所有兄弟视频(各 model × prompt)全部从标注/审核池剔除",
    "reports.quarantine_confirm": "确定隔离整个 task?同 GT 的所有兄弟视频会从标注 + 审核池剔除,直到你恢复。",
    "reports.quarantine_done": "已隔离 — 波及 {n} 条兄弟视频。",
    "reports.quarantine_auto_resolved": "{r} 条 open 报告已自动 resolve。",
    "quarantine.title": "🚧 待定区(已隔离 task)",
    "quarantine.hint": "这些 GT 任务被从标注 + 审核池剔除,跨所有兄弟模型的视频都被冻结。",
    "quarantine.empty": "无待定任务。",
    "quarantine.tag": "已隔离",
    "quarantine.affected": "{n} 条兄弟视频",
    "quarantine.restore": "恢复",
    "quarantine.restore_confirm": "把这个 GT 任务恢复到标注 + 审核池?",
    "quarantine.restored": "已恢复。",
    "reports.hide_video": "▾ 收起视频",
    "home.card.reports.title": "数据问题报告",
    "home.card.reports.sub": "查看与处理报告",
    "readonly.title": "只读管理员",
    "readonly.body": "你是只读管理员 — 可查看所有数据,但不能执行写操作(删用户 / 改角色 / 解决报告 / finalize alignment)。如需写权限,请联系 masiyuan。",
    "readonly.ok": "知道了",
    "leaderboard.title": "📊 今日团队",
    "leaderboard.admin": "管理员",
    "leaderboard.ranked": "今日排行",
    "leaderboard.top3": "今日前三",
    "leaderboard.done": "今日已达标",
    "leaderboard.none": "—",
    "leaderboard.team_today_summary": "今日全员共标 {n} 条",
    "report.title": "报告数据问题",
    "report.type_label": "问题类型",
    "report.type.instruction_init_mismatch": "指令与首帧不符",
    "report.type.init_no_agent": "首帧没有机械臂/人手",
    "report.type.video_unplayable": "视频无法播放",
    "report.type.video_static_black": "视频静止/黑屏",
    "report.type.other": "其他",
    "report.note_label": "备注（可选）",
    "report.note_placeholder": "可选细节 — 管理员将处理。",
    "report.submit": "提交报告",
    "report.submitted_toast": "已报告 — 管理员将处理。",
    "report.failed_toast": "报告失败",
    "common.cancel": "取消",
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
  // v85bf: load-stall watchdog. Some videos hang in "loading" without firing `error`
  // (CDN hiccup, slow Xet, transient 5xx). If we don't get `loadeddata`/`canplay`
  // within LOAD_TIMEOUT, force a fake error to trigger the retry path.
  const LOAD_TIMEOUT = 8000;
  let loadTimer = null;
  const armLoadTimer = () => {
    if (loadTimer) clearTimeout(loadTimer);
    loadTimer = setTimeout(() => {
      if (videoEl.readyState < 2) {  // HAVE_CURRENT_DATA = 2
        console.warn(`video load stalled ${LOAD_TIMEOUT}ms — triggering retry:`, videoEl.src);
        videoEl.dispatchEvent(new Event("error"));
      }
    }, LOAD_TIMEOUT);
  };
  videoEl.addEventListener("loadstart", armLoadTimer);
  ["loadeddata", "canplay"].forEach(ev =>
    videoEl.addEventListener(ev, () => { if (loadTimer) { clearTimeout(loadTimer); loadTimer = null; } }));
  videoEl.addEventListener("error", () => {
    // Prefer per-element stored sources (correct for OSS + HF + any future host).
    let sources = null;
    if (videoEl.dataset.sourcesJson) {
      try { sources = JSON.parse(videoEl.dataset.sourcesJson); } catch {}
    }
    if (sources && sources.length) {
      // v85bf: cycle through each source up to 3x before giving up (was 1x). Transient
      // failures often clear within a couple of attempts; we'd rather quietly retry than
      // pop the failed-placeholder + force a manual refresh (siyuan's complaint).
      const maxRetries = (opts && opts.maxRetries) || Math.max(3, sources.length * 3);
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
      const maxRetries = (opts && opts.maxRetries) || Math.max(3, HOST_KEYS.length * 3);
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
  applyRolePill(username, role);
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
  document.getElementById("retry-btn").addEventListener("click", () => loadNext());
  // v85m (siyuan): Skip restored — submits {skip:true} which Ham re-queues to the FRONT
  // so the next annotator picks it up immediately (skipper doesn't get it back).
  document.getElementById("skip-btn").addEventListener("click", () => onSubmit(true));
  // v85v (siyuan): one-click jump back into edit mode on the just-submitted item.
  const editPrevBtn = document.getElementById("edit-prev-btn");
  if (editPrevBtn) {
    editPrevBtn.addEventListener("click", () => {
      const target = editPrevBtn.dataset.target || "";
      if (!target) return;
      if (!confirm(tr("task.edit_prev_confirm"))) return;
      window.location.href = "task.html?edit=" + encodeURIComponent(target);
    });
  }
  // Report: dedicated red button for data issues. Opens inline panel to pick issue_type
  // + optional note, POSTs to Ham's `report` endpoint, then advances to next item.
  const reportBtn = document.getElementById("report-btn");
  const reportModal = document.getElementById("report-modal");
  if (reportBtn && reportModal) {
    reportBtn.addEventListener("click", () => {
      reportModal.hidden = false;
      document.getElementById("report-note").value = "";
    });
    document.getElementById("report-cancel-btn").addEventListener("click", () => {
      reportModal.hidden = true;
    });
    document.getElementById("report-submit-btn").addEventListener("click", async () => {
      if (!CURRENT) return;
      const issue_type = document.getElementById("report-type").value;
      const note = document.getElementById("report-note").value.trim();
      const btn = document.getElementById("report-submit-btn");
      btn.disabled = true;
      try {
        // v85r: in edit mode the user is reviewing an already-submitted annotation;
        // tell the backend to also remove that annotation (the data was bad).
        const wasEdit = !!(EDIT_MODE && EDIT_MODE.item_id === CURRENT.id);
        const res = await fetch(CFG.APPS_SCRIPT_URL + "/", {
          method: "POST",
          headers: { "Content-Type": "text/plain" },
          body: JSON.stringify({
            report: true, user: username, item_id: CURRENT.id,
            issue_type, note, edit: wasEdit
          })
        });
        const data = await res.json().catch(() => ({}));
        if (data && data.ok === false) throw new Error(data.error || "report failed");
        reportModal.hidden = true;
        toast(tr("report.submitted_toast"), "ok");
        if (wasEdit) {
          // Bounce back to my_annotations so user sees the removed item is gone.
          window.location.href = "my_annotations.html";
          return;
        }
        await loadNext();
      } catch (err) {
        toast(tr("report.failed_toast") + ": " + err.message, "err");
      } finally {
        btn.disabled = false;
      }
    });
  }

  // Video fallback: re-queue via skip flow if playback fails (siyuan: skip = push-to-front).
  wireVideoFallback(document.getElementById("gen-video"), { onSkip: () => onSubmit(true) });
  wireVideoFallback(document.getElementById("gt-video"));
  wireSubTriButtons();  // 6 sub-tri groups in task form
  wireAutoNote("");     // v85j note prefill (task form, no prefix)
  // v85al: countdown chip in the top user-chip area (siyuan: same place as logout).
  ensureSettleAnchor().then(() => startSettleCountdown());

  await refreshStats();
  // Edit mode: ?edit=<item_id> loads the existing annotation and prefills the form.
  const editId = new URLSearchParams(window.location.search).get("edit");
  if (editId) {
    await loadForEdit(editId, "task");
  } else {
    await loadNext();
  }
  updateEditPrevBtn();
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
      // v85by: report-KPI bonus "+R" (red small) rendered next to today count.
      const R = Number(data.today_reports || 0);
      const bonusEl = document.getElementById("today-bonus");
      if (bonusEl) {
        bonusEl.textContent = R > 0 ? `+${R}` : "";
        bonusEl.hidden = R === 0;
      }
      const quotaEl = document.getElementById("quota");
      const quotaBlock = quotaEl?.parentElement;
      // v85aw: pure-reviewer (siyuanw) has no annotation KPI → quota=null. Hide the
      // whole today/quota chip instead of showing a misleading "today N / —".
      if (quotaBlock) {
        const hasQuota = typeof data.quota === "number" && data.quota > 0;
        quotaBlock.hidden = !hasQuota;
        if (hasQuota) {
          quotaEl.textContent = data.quota;
          quotaBlock.classList.toggle("met", (data.today + R) >= data.quota);
        }
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
  // v85k: default fresh item to score 5 + all subs ✓ — siyuan: 完美视频可直接保存.
  for (const id of ["physical_adherence", "instruction_alignment"]) {
    const inp = document.getElementById(id);
    const out = document.getElementById(id + "-out");
    if (inp) inp.value = 5;
    if (out) out.value = 5;
  }
  for (const id of ["agent_consistency", "scene_consistency", "interaction_realism", "agent_match", "object_correct", "goal_completed"]) {
    setSubTri(id, 2);
  }
  // Auto-fill the notes with the score-5 default template so user can save without typing.
  buildAutoNote("", "physical");
  buildAutoNote("", "instruction");
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
  // v85df (Alice correction): the GT-level instruction file is
  // `<prefix>/gt_data/<task>/<ep>/prompt/prompt.txt` (NOT instruction.txt at that
  // path). The per-model generated_data path uses instruction.txt as a fallback.
  // Ham's v85bx warning was about the generated_data/.../prompt.txt file being
  // the generator rewrite — the gt_data/prompt.txt file is the GT-level canonical
  // instruction (Alice uses it daily for data-reports).
  const gtBase = relPath.replace(
    /^(.+?)\/generated_data\/[^/]+\/(task_\d+)\/(episode_\d+)\/1\/[^/]+\.mp4$/,
    "$1/gt_data/$2/$3/prompt"
  );
  const perModelBase = relPath.replace(
    /^(.+?)\/generated_data\/([^/]+)\/(task_\d+)\/(episode_\d+)\/1\/[^/]+\.mp4$/,
    "$1/generated_data/$2/$3/$4/1/prompt"
  );
  const attempts = [];
  if (gtBase !== relPath) {
    // gt_data uses prompt.txt (Alice canonical). No cn variant guaranteed there.
    attempts.push({ base: gtBase, fnames: ["prompt.txt"] });
  }
  if (perModelBase !== relPath) {
    // generated_data uses instruction.txt (+optional _cn); this is the tie-breaker.
    const perModelFnames = getLang() === "cn"
      ? ["instruction_cn.txt", "instruction.txt"]
      : ["instruction.txt"];
    attempts.push({ base: perModelBase, fnames: perModelFnames });
  }
  if (!attempts.length) { target.textContent = "(no prompt)"; return; }
  // v85dg (siyuan: 你把换source也应用于prompt不就好了): when HF rate-limits
  // (429), cascade through all available video-source hosts — the same set the
  // 🌐 video-source chip toggles. Try current preferred host first, then any
  // other hosts registered in getVideoHosts() (e.g. hf-mirror.com, Ham's
  // cloudflared tunnel).
  const hosts = getVideoHosts();
  const primary = getVideoHost();
  const orderedHosts = [primary, ...hosts.map(h => h.key).filter(k => k && k !== primary)];
  for (const { base: baseRaw, fnames } of attempts) {
    const canonical = CFG.HF_RESOLVE_BASE + "/" + baseRaw.replace(/^\/+/, "");
    for (const host of orderedHosts) {
      const rewritten = host === "huggingface.co"
        ? canonical
        : canonical.replace(/^https?:\/\/(?:www\.)?huggingface\.co\//i, `https://${host}/`);
      for (const fname of fnames) {
        try {
          const res = await fetch(`${rewritten}/${fname}`);
          if (!res.ok) continue;
          const text = await res.text();
          target.textContent = text.trim() || "(empty)";
          return;
        } catch (err) { /* try next */ }
      }
    }
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
    // v85dg: cascade — try each host + each layout candidate. Same escape hatch
    // as fetchInstructionInto for the HF 429 storm siyuan hit today.
    const alt = derivateInitFrameAlt(url);
    const urlCandidates = alt ? [url, alt] : [url];
    const hosts = getVideoHosts();
    const primary = getVideoHost();
    const orderedHosts = [primary, ...hosts.map(h => h.key).filter(k => k && k !== primary)];
    const queue = [];
    for (const u of urlCandidates) {
      for (const host of orderedHosts) {
        const rewritten = host === "huggingface.co"
          ? u
          : u.replace(/^https?:\/\/(?:www\.)?huggingface\.co\//i, `https://${host}/`);
        queue.push(rewritten);
      }
    }
    let idx = 0;
    const tryNext = () => {
      if (idx >= queue.length) { img.onerror = null; return; }
      img.src = queue[idx++];
    };
    img.onerror = tryNext;
    tryNext();
    fig.hidden = false;
    img.onclick = () => openImageLightbox(img.src);
    img.style.cursor = "zoom-in";
  } else {
    fig.hidden = true;
    img.removeAttribute("src");
  }
}

/* Given an init_frame URL that ends in .../gt_data/<task>/<ep>/prompt/init_frame.png,
   return the sibling .../generated_data/<model>/<task>/<ep>/1/prompt/init_frame.png
   (and vice-versa) — used as the setInitFrame onerror fallback. Extracts <model>
   from a sibling video URL when needed via CURRENT_INSTRUCTION.video_url. */
function derivateInitFrameAlt(url) {
  if (!url) return null;
  const gtMatch = url.match(/^(.*?)\/gt_data\/(task_\d+)\/(episode_\d+)\/prompt\/(init_frame\.png)$/);
  if (gtMatch) {
    const [, prefix, task, ep, file] = gtMatch;
    // Need the model from the video URL to build the per-model path.
    const vidUrl = (window.CURRENT_INSTRUCTION && CURRENT_INSTRUCTION.video_url) || "";
    const vidMatch = vidUrl.match(/\/generated_data\/([^/]+)\//);
    if (vidMatch) return `${prefix}/generated_data/${vidMatch[1]}/${task}/${ep}/1/prompt/${file}`;
  }
  const perModel = url.match(/^(.*?)\/generated_data\/([^/]+)\/(task_\d+)\/(episode_\d+)\/1\/prompt\/(init_frame\.png)$/);
  if (perModel) {
    const [, prefix, , task, ep, file] = perModel;
    return `${prefix}/gt_data/${task}/${ep}/prompt/${file}`;
  }
  return null;
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
    // v85ay: same main/sub guard as align flow (Ham reuses backend _main_sub_conflict).
    // Any sub ⚠/✗ on an axis → that axis main can't be 5. Catch locally to avoid round-trip.
    const physSubs = ["agent_consistency", "scene_consistency", "interaction_realism"];
    const instrSubs = ["agent_match", "object_correct", "goal_completed"];
    if (payload.physical_adherence === 5 && physSubs.some(k => payload[k] < 2)) {
      toast(tr("toast.main_sub_conflict_phys"), "err"); return;
    }
    if (payload.instruction_alignment === 5 && instrSubs.some(k => payload[k] < 2)) {
      toast(tr("toast.main_sub_conflict_instr"), "err"); return;
    }
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
    // v85v: remember the just-submitted item so the next page render can
    // surface a "↺ 修改上一条" shortcut. Per-user keyed in localStorage.
    try { localStorage.setItem("ewj_last_item:" + (localStorage.getItem(CFG.LS_USER) || ""), CURRENT.id); } catch {}
    if (EDIT_MODE) {
      toast(tr("my_annotations.updated_toast"), "ok");
      window.location.href = "my_annotations.html";
      return;
    }
    await refreshStats();
    await loadNext();
    updateEditPrevBtn();
  } catch (err) {
    // v85ay: 400 main_sub_conflict → recoverable validation; toast and let user fix.
    // Anything else → full-screen error (transport / 500 / unknown).
    if (err && err.code === "main_sub_conflict") {
      const dim = err.dim === "instruction_alignment" ? tr("toast.main_sub_conflict_instr") : tr("toast.main_sub_conflict_phys");
      toast(dim, "err");
      return;
    }
    showError("Save failed: " + err.message);
  }
}

// v85ae: friendlier "you're a read-only admin" gate. Returns true if the viewer
// can write; otherwise shows a centered popup explaining why the action is blocked.
function requireWriteOrPopup() {
  if (localStorage.getItem("ewj_can_write") === "1") return true;
  showReadOnlyAdminPopup();
  return false;
}

function showReadOnlyAdminPopup() {
  let host = document.getElementById("readonly-modal");
  if (host) { host.hidden = false; return; }
  host = document.createElement("div");
  host.id = "readonly-modal";
  host.className = "readonly-modal";
  host.innerHTML = `
    <div class="readonly-modal-inner">
      <div class="readonly-modal-icon">🔒</div>
      <h3>${escapeHtml(tr("readonly.title"))}</h3>
      <p>${escapeHtml(tr("readonly.body"))}</p>
      <button type="button" class="primary" id="readonly-modal-close">${escapeHtml(tr("readonly.ok"))}</button>
    </div>`;
  document.body.appendChild(host);
  document.getElementById("readonly-modal-close").addEventListener("click", () => { host.hidden = true; });
  host.addEventListener("click", (e) => { if (e.target === host) host.hidden = true; });
}

// Wrap a fetch call so a 403 / readonly_admin code surfaces the read-only popup
// instead of bubbling raw. Ham's backend now returns
//   { ok:false, code:"readonly_admin", error:"..." }
// for any write attempt by a read-only admin (siyuanw / Yu).
async function fetchWriteOrPopup(url, opts) {
  if (!requireWriteOrPopup()) return null;
  const res = await fetch(url, opts);
  if (res.status === 403) { showReadOnlyAdminPopup(); return null; }
  return res;
}

// Inspect a parsed JSON body for the readonly_admin sentinel; show popup if matched.
function maybeShowReadOnlyFromBody(body) {
  if (body && body.ok === false && body.code === "readonly_admin") {
    showReadOnlyAdminPopup();
    return true;
  }
  return false;
}

function updateEditPrevBtn() {
  const btn = document.getElementById("edit-prev-btn");
  if (!btn) return;
  // Hide in edit mode (you're already editing) or when no previous saved.
  if (typeof EDIT_MODE !== "undefined" && EDIT_MODE) { btn.hidden = true; return; }
  const user = localStorage.getItem(CFG.LS_USER) || "";
  const prev = localStorage.getItem("ewj_last_item:" + user);
  const curId = (typeof CURRENT !== "undefined" && CURRENT) ? CURRENT.id : null;
  btn.hidden = !prev || prev === curId;
  btn.dataset.target = prev || "";
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
  const data = await res.json().catch(() => ({}));
  // v85ay: structured error carries Ham's contract {code, dim} so the caller can
  // toast a friendly per-axis message instead of falling through to showError.
  if (!res.ok || data?.ok === false) {
    const err = new Error(data?.error || "HTTP " + res.status);
    if (data?.code) err.code = data.code;
    if (data?.dim) err.dim = data.dim;
    throw err;
  }
}

function show(id) { const el = document.getElementById(id); if (el) el.hidden = false; }
function hide(id) { const el = document.getElementById(id); if (el) el.hidden = true; }
function showError(text, opts) {
  document.getElementById("error-msg").textContent = text;
  const err = document.getElementById("error");
  // v85bq: opts.success=true re-skins the card green and hides the 提示/Notice header.
  // v85br: keep the Refresh button visible in success state — siyuan wants to poll for
  // new tasks after the queue is cleared, not lose the action.
  if (err) {
    err.classList.toggle("success", !!(opts && opts.success));
    const h3 = err.querySelector("h3");
    if (h3) h3.hidden = !!(opts && opts.success);
    const retry = err.querySelector("#retry-btn");
    if (retry) retry.hidden = false;
  }
  hide("loading"); hide("item"); show("error");
}

/* ---------- dashboard.html (grid view) ---------- */
async function initDashboard() {
  const root = document.getElementById("grid-table");
  if (!root) return;
  // Top user-chip + role + logout (regular page top bar).
  const user = localStorage.getItem(CFG.LS_USER);
  let role = localStorage.getItem(CFG.LS_ROLE);
  // Refresh role + write permission from server (admin set / read-only tier may have changed).
  let canWrite = localStorage.getItem("ewj_can_write") === "1";
  let isReviewer = false;
  try {
    const r = await fetch(`${CFG.APPS_SCRIPT_URL}/?action=stats&user=${encodeURIComponent(user || "")}`);
    const d = await r.json();
    if (d?.role && d.role !== role) { localStorage.setItem(CFG.LS_ROLE, d.role); role = d.role; }
    if (typeof d?.can_write === "boolean") {
      canWrite = d.can_write;
      localStorage.setItem("ewj_can_write", canWrite ? "1" : "0");
    }
    // v85aw: reviewer is a stacked role flag (e.g. author + reviewer), not a separate role.
    // Back-compat: legacy "reviewer" role value also counts.
    isReviewer = (typeof d?.is_reviewer === "boolean") ? d.is_reviewer : (role === "reviewer");
    localStorage.setItem("ewj_is_reviewer", isReviewer ? "1" : "0");
    // v85az: store quota so applyRolePill can detect pure-reviewer (quota null/0).
    localStorage.setItem("ewj_quota", d?.quota == null ? "null" : String(d.quota));
    // v85bb: stash yesterday-KPI status for the Review card gating below.
    if (d?.met_yesterday_kpi === false) localStorage.setItem("ewj_kpi_blocked", "1");
    else localStorage.removeItem("ewj_kpi_blocked");
    // v85bn: stash meta-reviewer flag so the dashboard show-if and arbitration page agree.
    localStorage.setItem("ewj_is_meta_reviewer", d?.is_meta_reviewer ? "1" : "0");
  } catch (_) { /* fall through */ }
  // user-chip + logout wired by wireGlobalChrome on DOMContentLoaded.
  applyRolePill(user, role);
  // v85ad (siyuan): yu + siyuanw are read-only admins — they see the admin view but
  // can't take write actions (delete user, set_role, resolve reports, finalize). The
  // `isAdmin` check below now matches anyone with role==="admin" (or legacy masiyuan
  // fallback); `canWrite` further gates the destructive UI.
  const isAdmin = role === "admin" || user === "masiyuan";
  // Role model (siyuan v85aw): role = primary identity (contributor / author / admin).
  // is_reviewer = stacked flag: gets review tasks in addition to the role's normal work.
  // - linziti / tony / Xinyi_Xu: author + reviewer (annotate with quota + review queue)
  // - siyuanw: pure reviewer (annotate without quota + review queue) — stats.quota is null
  // - admin: never gets review tasks (read-only via "Review results" card)
  let rowKey = "contributor";
  if (isAdmin) rowKey = "admin";
  else if (isReviewer) rowKey = "reviewer";
  else if (role === "author") rowKey = "author";
  document.querySelectorAll(".home-actions .action-row").forEach(r => {
    r.hidden = r.dataset.row !== rowKey;
  });
  // v85ax: admin row has two Review cards (primary if admin+reviewer like masiyuan;
  // read-only 'Review results' for plain admins). Toggle based on isReviewer flag.
  document.querySelectorAll('.home-actions [data-show-if="is_reviewer"]').forEach(el => { el.hidden = !isReviewer; });
  document.querySelectorAll('.home-actions [data-show-if="not_reviewer"]').forEach(el => { el.hidden = isReviewer; });
  // v85bn: meta-reviewer (siyuanw, masiyuan) gets the ⚖ Arbitration card.
  const isMeta = localStorage.getItem("ewj_is_meta_reviewer") === "1";
  document.querySelectorAll('.home-actions [data-show-if="is_meta_reviewer"]').forEach(el => { el.hidden = !isMeta; });
  // v85bb: KPI gate — reviewers who didn't meet yesterday's annotation quota get the
  // Review card grayed out + an inline banner. siyuanw (pure reviewer) is exempt by
  // backend (met_yesterday_kpi === null for non-author reviewers).
  const kpiBlocked = isReviewer && localStorage.getItem("ewj_kpi_blocked") === "1";
  document.querySelectorAll('.home-actions a[href="review.html"][data-badge="review"]').forEach(card => {
    card.classList.toggle("kpi-locked", kpiBlocked);
    if (kpiBlocked) {
      card.title = tr("review.kpi_gate.dashboard");
      card.setAttribute("aria-disabled", "true");
    } else {
      card.removeAttribute("title");
      card.removeAttribute("aria-disabled");
    }
  });
  const dashKpiBanner = document.getElementById("dash-kpi-banner");
  if (dashKpiBanner) dashKpiBanner.hidden = !kpiBlocked;
  // .reviewer-only nav entries (e.g. links to review.html in shared headers) show only for
  // users with review power: anyone with the reviewer stack flag, or admin (admin sees
  // results read-only via the same link).
  document.querySelectorAll(".page-nav .reviewer-only").forEach(a => {
    if (!isReviewer && rowKey !== "admin") a.style.display = "none";
  });
  document.querySelectorAll(".page-nav .admin-only").forEach(a => {
    if (!isAdmin) a.style.display = "none";
  });
  await loadDashboard();
  await loadBadges();
  await loadMilestoneProgress();
  await loadLeaderboard();
  // v85cc: model averages + score distribution moved to dedicated /stats.html page.
  if (isAdmin) await loadDataReports();
  // v85co-alt: per-annotator alignment metrics moved to align.html IAA panel
  // (siyuan: 我这个指标是要每个alignment campaign单算的，改在那个一致性那个界面里).
  // v85cs (siyuan: 每个人都要看到自己的 alignment 分数): compact per-user card.
  await loadMyAlignmentCard();
  let timer = setInterval(() => {
    if (!document.hidden) {
      loadDashboard(); loadBadges(); loadMilestoneProgress(); loadLeaderboard();
      if (isAdmin) loadDataReports();
    }
  }, 30000);
}

/* v85ai/aj — settle-countdown to next 13:00 Beijing.
   Server-anchored (Ham's milestone endpoint returns seconds_to_settlement) so users
   on a skewed clock still see the correct value. Local clock used only to tick
   between fetches. */
let _settleAnchor = null;  // { fetchedAt: ms, secondsAtFetch: number }
function setSettleAnchorFromBody(d) {
  const sec = Number(d?.seconds_to_settlement);
  if (Number.isFinite(sec)) {
    _settleAnchor = { fetchedAt: Date.now(), secondsAtFetch: sec };
  }
}
function secondsToSettleNow() {
  if (_settleAnchor) {
    const elapsed = (Date.now() - _settleAnchor.fetchedAt) / 1000;
    return Math.max(0, _settleAnchor.secondsAtFetch - elapsed);
  }
  // Fallback: compute local. Next 05:00 UTC = 13:00 Beijing.
  const now = new Date();
  const target = new Date(now);
  target.setUTCHours(5, 0, 0, 0);
  if (target.getTime() <= now.getTime()) target.setUTCDate(target.getUTCDate() + 1);
  return (target.getTime() - now.getTime()) / 1000;
}

let _countdownTimer = null;
function startSettleCountdown() {
  const el = document.getElementById("lb-countdown");
  if (!el) return;
  el.hidden = false;
  if (_countdownTimer) clearInterval(_countdownTimer);
  const tick = () => {
    const sec = secondsToSettleNow();
    if (sec <= 0) { el.textContent = tr("countdown.now"); return; }
    const h = Math.floor(sec / 3600);
    const m = Math.floor((sec % 3600) / 60);
    const s = Math.floor(sec % 60);
    const pad = (n) => String(n).padStart(2, "0");
    el.textContent = `⏰ ${tr("countdown.title")} ${pad(h)}:${pad(m)}:${pad(s)}`;
  };
  tick();
  _countdownTimer = setInterval(tick, 1000);
}

// Also fetch milestone to set server anchor (used on pages without the milestone card).
async function ensureSettleAnchor() {
  if (_settleAnchor) return;
  if (!CFG.APPS_SCRIPT_URL) return;
  const user = localStorage.getItem(CFG.LS_USER) || "";
  if (!user) return;
  try {
    const r = await fetch(`${CFG.APPS_SCRIPT_URL}/?action=milestone&user=${encodeURIComponent(user)}`);
    if (!r.ok) return;
    const d = await r.json();
    setSettleAnchorFromBody(d);
  } catch (_) { /* fall back to local time */ }
}

/* v85ac — public team leaderboard, redesigned per siyuan: admin out of the ranking,
   completed-today list sorted by today desc, prettier chip layout. */
async function loadLeaderboard() {
  const card = document.getElementById("leaderboard-card");
  if (!card) return;
  try {
    const r = await fetch(`${CFG.APPS_SCRIPT_URL}/?action=leaderboard`);
    if (!r.ok) { card.hidden = true; return; }
    const d = await r.json();
    if (d?.ok === false) { card.hidden = true; return; }
    card.hidden = false;
    startSettleCountdown();
    // Admin is an array (siyuanw/Yu/masiyuan can all be admin). Show their counts but
    // don't include them in the ranking.
    const admins = Array.isArray(d.admin) ? d.admin : (d.admin ? [d.admin] : []);
    // v85ba: small "审" marker for stacked reviewers (when backend includes is_reviewer).
    const revMark = a => a?.is_reviewer ? ` <span class="lb-rev-mark" title="reviewer / 审核员">审</span>` : "";
    // v85by: report-KPI display "+R" (red small) — same rule as self-summary.
    const bonusMark = a => Number(a?.today_reports || 0) > 0
      ? `<span class="today-bonus lb-bonus">+${Number(a.today_reports)}</span>` : "";
    const adminChips = admins.length
      ? admins.map(a => `<span class="lb-chip lb-admin-chip">${escapeHtml(a.user)}${revMark(a)} <strong>${Number(a.today ?? 0)}</strong>${bonusMark(a)}${a.quota ? `<span class="muted">/${a.quota}</span>` : ""}${a.met ? " ✓" : ""}</span>`).join("")
      : `<span class="muted">${tr("leaderboard.none")}</span>`;
    document.getElementById("lb-admin").innerHTML =
      `<span class="lb-label">${tr("leaderboard.admin")}</span> ${adminChips}`;
    // v85ag (siyuan): only top 3 in leaderboard (not full ranked list).
    const top3 = (d.top3 && d.top3.length)
      ? d.top3
      : (d.ranked || d.completed_today || []).slice(0, 3);
    const rankedChips = top3.length
      ? top3.map((u, i) => {
          const medal = ["🥇","🥈","🥉"][i] || `<span class="lb-rank">${i+1}</span>`;
          return `<span class="lb-chip lb-rank-chip">${medal} ${escapeHtml(u.user)}${revMark(u)} <strong>${Number(u.today ?? 0)}</strong>${bonusMark(u)}${u.quota ? `<span class="muted">/${u.quota}</span>` : ""}${u.met ? " ✓" : ""}</span>`;
        }).join("")
      : `<span class="muted">${tr("leaderboard.none")}</span>`;
    document.getElementById("lb-top3").innerHTML =
      `<span class="lb-label">${tr("leaderboard.top3")}</span> ${rankedChips}`;
    document.getElementById("lb-done").innerHTML = "";
    // siyuan: surface team-total-today on the self-summary total-progress card.
    const teamToday = (d.all || []).reduce((s, u) => s + Number(u.today || 0), 0);
    const teamEl = document.getElementById("total-team-today");
    if (teamEl) teamEl.textContent = tr("leaderboard.team_today_summary").replace("{n}", teamToday);
  } catch (_) {
    card.hidden = true;
  }
}

/* v85co: renders the per-annotator alignment-metrics block inside the alignment
   IAA panel (align.html #al-iaa-panel). Ham endpoint per-campaign:
     ?action=alignment_metrics&campaign_id=<CID>&user=<admin>
   Returns (per current campaign only):
     {n_items, n_annotators, reference_kind, floor, annotators:[{user,n,
       pa_pearson,ia_pearson,pa_qwk,ia_qwk,pa_exact,is_outlier}], reference_models:[]}
   Small-n campaigns (n_items<20) get a low-confidence banner. */
function renderAlignmentMetricsBlock(m) {
  if (!m || !m.annotators || !m.annotators.length) return "";
  const floorPA = m?.floor?.pa_pearson ?? 0.336;
  const floorIA = m?.floor?.ia_pearson ?? 0.354;
  const models = m.reference_models || [];
  const nItems = m.n_items ?? "?";
  const nAnn = m.n_annotators ?? m.annotators.length;
  const refKind = m.reference_kind || tr("alignment_metrics.default_ref");
  const lowConf = typeof nItems === "number" && nItems < 20;
  const rows = [
    ...m.annotators.map(a => ({ kind: "annotator", label: a.user, n: a.n,
      pa: a.pa_pearson, ia: a.ia_pearson, qwk_pa: a.pa_qwk, qwk_ia: a.ia_qwk,
      exact_pa: a.pa_exact, is_outlier: a.is_outlier === true,
      needs_realignment: a.needs_realignment })),
    ...models.map(x => ({ kind: "model", label: x.model, n: x.n ?? nItems,
      pa: x.pa_pearson, ia: x.ia_pearson, qwk_pa: x.pa_qwk, qwk_ia: x.ia_qwk,
      exact_pa: x.pa_exact })),
  ].filter(r => r.pa != null || r.ia != null);
  rows.sort((a, b) => (b.pa ?? -999) - (a.pa ?? -999));
  // v85db (siyuan: 某个指标绿色就显示绿色 不要整行 / user 整行就正常颜色 / 不需要红色):
  // per-metric coloring only. Model bars = blue. Annotator bars: green if ≥ threshold,
  // neutral gray if below (no red). Row backgrounds neutralized for USER rows.
  const bar = (v, threshold, rowKind) => {
    if (v == null) return `<span class="am-bar am-bar-empty">—</span>`;
    const pct = Math.max(0, Math.min(100, v * 100));
    let cls;
    if (rowKind === "model") cls = "am-bar-model";
    else cls = (v >= threshold) ? "am-bar-pass" : "am-bar-neutral";
    return `<span class="am-bar ${cls}">
      <span class="am-bar-fill" style="width:${pct.toFixed(1)}%"></span>
      <span class="am-bar-num">${v.toFixed(3)}</span>
    </span>`;
  };
  const fmt = v => v == null ? "—" : Number(v).toFixed(3);
  // v85da: 3-color regime — model=blue, fail annotator=red, pass annotator=green.
  // No ❗须重考 badge, no ⚠ outlier. Row color alone signals status.
  const consensusPA = m?.annotator_threshold?.pa_pearson ?? m?.floor?.consensus_pa ?? 0.70;
  const consensusIA = m?.annotator_threshold?.ia_pearson ?? m?.floor?.consensus_ia ?? 0.70;
  const rowsHtml = rows.map((r, i) => {
    const failsFloor = r.kind === "annotator" && (
      typeof r.needs_realignment === "boolean"
        ? r.needs_realignment
        : ((r.pa != null && r.pa < consensusPA) || (r.ia != null && r.ia < consensusIA))
    );
    // v85db: user row = neutral (no row tint, no fail tag). Model row stays blue.
    const rowClass = r.kind === "model" ? "am-row am-row-model" : "am-row am-row-annotator";
    const kindTag = r.kind === "model"
      ? `<span class="am-tag am-tag-model">MODEL</span>`
      : `<span class="am-tag am-tag-user">USER</span>`;
    return `<tr class="${rowClass}">
      <td class="am-rank">${i + 1}</td>
      <td class="am-label">${kindTag} <strong>${escapeHtml(r.label)}</strong></td>
      <td class="am-n muted small">${r.n ?? "—"}</td>
      <td class="am-metric am-pa">${bar(r.pa, consensusPA, r.kind)}</td>
      <td class="am-metric am-ia">${bar(r.ia, consensusIA, r.kind)}</td>
      <td class="am-metric muted small">${fmt(r.qwk_pa)}</td>
      <td class="am-metric muted small">${fmt(r.exact_pa)}</td>
    </tr>`;
  }).join("");
  // v85cw (siyuan simplify + Alice methodology fix): drop the 875-scale floor
  // from caption — it comes from vs-single-annotation gold and doesn't match the
  // leave-one-out consensus scale here. One short line only.
  const extras = [];
  if (lowConf) extras.push("小样本仅参考");
  if (models.length === 0) extras.push(tr("alignment_metrics.no_model_short"));
  const caption = `${nItems}题 · ${nAnn}人 · <span class="muted">Pearson vs 共识 (0–1)</span>${extras.length ? " · " + extras.join(" · ") : ""}`;
  return `
    <div class="am-block">
      <h5 class="iaa-subtitle">${tr("alignment_metrics.title_v2")}</h5>
      <table class="am-table">
        <thead>
          <tr>
            <th class="am-rank">#</th>
            <th class="am-label">${tr("alignment_metrics.col.who")}</th>
            <th class="am-n">n</th>
            <th class="am-metric am-pa">PA · Pearson</th>
            <th class="am-metric am-ia">IA · Pearson</th>
            <th class="am-metric" title="Quadratic-weighted Kappa on PA">PA · QWK</th>
            <th class="am-metric" title="Exact-match PA">PA · Exact</th>
          </tr>
        </thead>
        <tbody>${rowsHtml}</tbody>
      </table>
    </div>
  `;
}

/* v85cs: per-user alignment card on the dashboard. Fetch the current user's
   latest alignment metrics (Ham endpoint auto-picks latest completed campaign)
   and render a compact block showing YOUR row + reference judge rows for scale.
   No hardcoded models — reference_models comes from Ham (siyuan: 直接用 gemini
   和 qwen 的 test 分数作为 ref, from the 875-item leaderboard). */
async function loadMyAlignmentCard() {
  const card = document.getElementById("my-alignment-card");
  const body = document.getElementById("my-alignment-body");
  if (!card || !body) return;
  const user = localStorage.getItem(CFG.LS_USER) || "";
  if (!user) { card.hidden = true; return; }
  try {
    // Ham: `campaign=latest` auto-picks the most recent campaign the user completed.
    const r = await fetch(`${CFG.APPS_SCRIPT_URL}/?action=alignment_metrics&campaign=latest&user=${encodeURIComponent(user)}&scope=self`);
    if (!r.ok) { card.hidden = true; return; }
    const d = await r.json();
    if (d?.ok === false || d?.code === "admin_only" || !d.annotators || !d.annotators.length) {
      card.hidden = true; return;
    }
    // Only render the current user's row + reference_models (Ham should already
    // filter to self when scope=self, but double-check client-side).
    const me = d.annotators.find(a => a.user === user);
    if (!me) { card.hidden = true; return; }
    const restricted = { ...d, annotators: [me] };
    body.innerHTML = renderAlignmentMetricsBlock(restricted);
    card.hidden = false;
  } catch (_) { card.hidden = true; }
}

/* v85cs: per-user alignment card on the dashboard. Fetch the current user's
   latest alignment metrics (Ham endpoint auto-picks latest completed campaign
   when campaign=latest) and render a compact block showing YOUR row + reference
   judge rows for scale. Reference models come from Ham (siyuan: 直接用 gemini
   和 qwen 的 test 分数作为 ref, from the 875-item leaderboard). */
async function loadMyAlignmentCard() {
  // siyuan v85cu: 算了 直接让所有人看到所有人的alignment分数吧 / id都露出来.
  // No scope filter — full annotator table + reference models, transparent for
  // everyone on the dashboard. Ham endpoint returns real user IDs (no anon).
  const card = document.getElementById("my-alignment-card");
  const body = document.getElementById("my-alignment-body");
  if (!card || !body) return;
  const user = localStorage.getItem(CFG.LS_USER) || "";
  if (!user) { card.hidden = true; return; }
  try {
    const r = await fetch(`${CFG.APPS_SCRIPT_URL}/?action=alignment_metrics&campaign=latest&user=${encodeURIComponent(user)}`);
    if (!r.ok) { card.hidden = true; return; }
    const d = await r.json();
    if (d?.ok === false || !d.annotators || !d.annotators.length) {
      card.hidden = true; return;
    }
    body.innerHTML = renderAlignmentMetricsBlock(d);
    card.hidden = false;
  } catch (_) { card.hidden = true; }
}

/* v85co: (deprecated dashboard load; kept as no-op for back-compat if a page still calls it) */
async function loadAlignmentMetrics() { /* moved to align.html IAA panel */ }
async function _loadAlignmentMetricsLegacy() {
  const card = document.getElementById("alignment-metrics-card");
  const body = document.getElementById("alignment-metrics-body");
  if (!card || !body) return;
  const user = localStorage.getItem(CFG.LS_USER) || "";
  try {
    const r = await fetch(`${CFG.APPS_SCRIPT_URL}/?action=alignment_metrics&user=${encodeURIComponent(user)}`);
    if (!r.ok) { card.hidden = true; return; }
    const d = await r.json();
    if (d?.ok === false || d?.code === "admin_only") { card.hidden = true; return; }
    const annots = d.annotators || [];
    const models = d.reference_models || [];
    const floorPA = d?.floor?.pa_pearson ?? 0.336;   // Ham-published human-IAA floor
    const floorIA = d?.floor?.ia_pearson ?? 0.354;
    if (!annots.length && !models.length) { card.hidden = true; return; }
    const refKind = d.reference_kind || "gold";
    const refN = d.reference_n_items ?? d.gold_n ?? "?";
    const campaign = d.campaign_id ? ` · campaign ${d.campaign_id.slice(0,8)}` : "";
    // Combine + sort by PA-Pearson desc so annotators vs models mix on one axis.
    const rows = [
      ...annots.map(a => ({
        kind: "annotator", label: a.user, n: a.n,
        pa_p: a.pa_pearson, ia_p: a.ia_pearson, jf1: a.joint_f1,
        exact_pa: a.exact_pa, w1_pa: a.within1_pa, mse_pa: a.mse_pa,
        is_outlier: a.is_outlier === true,
      })),
      ...models.map(m => ({
        kind: "model", label: m.model, n: m.n ?? refN,
        pa_p: m.pa_pearson, ia_p: m.ia_pearson, jf1: m.joint_f1,
        exact_pa: m.exact_pa, w1_pa: m.within1_pa, mse_pa: m.mse_pa,
      })),
    ].filter(r => r.pa_p != null || r.ia_p != null);
    rows.sort((a, b) => (b.pa_p ?? -999) - (a.pa_p ?? -999));
    const fmt = v => v == null ? "—" : Number(v).toFixed(3);
    const badge = (v, floor) => (v != null && v >= floor) ? '<span class="am-pass">✓</span>' : '';
    const rowsHtml = rows.map(r => {
      const kindTag = r.kind === "model"
        ? `<span class="am-tag am-tag-model">MODEL</span>`
        : `<span class="am-tag am-tag-annotator">USER</span>`;
      const outlier = r.is_outlier
        ? `<span class="am-outlier" title="${tr("alignment_metrics.outlier_tip")}">⚠ outlier</span>`
        : "";
      return `<tr class="am-row am-row-${r.kind}${r.is_outlier ? ' am-row-outlier' : ''}">
        <td class="am-label">${kindTag} ${escapeHtml(r.label)} ${outlier}</td>
        <td class="am-n">${r.n ?? "—"}</td>
        <td class="am-metric">${fmt(r.pa_p)} ${badge(r.pa_p, floorPA)}</td>
        <td class="am-metric">${fmt(r.ia_p)} ${badge(r.ia_p, floorIA)}</td>
        <td class="am-metric">${fmt(r.jf1)}</td>
        <td class="am-metric">${fmt(r.exact_pa)}</td>
        <td class="am-metric">${fmt(r.w1_pa)}</td>
        <td class="am-metric">${fmt(r.mse_pa)}</td>
      </tr>`;
    }).join("");
    const modelCaveat = models.length === 0
      ? `<p class="am-caveat muted small">${tr("alignment_metrics.no_model_yet")}</p>`
      : "";
    body.innerHTML = `
      <p class="muted small">Reference: <strong>${escapeHtml(refKind)}</strong>, n=${refN}${campaign}. ${tr("alignment_metrics.floor")}: PA ≥ <strong>${floorPA.toFixed(3)}</strong> · IA ≥ <strong>${floorIA.toFixed(3)}</strong> (human-IAA n=10) — passing = <span class="am-pass">✓</span>.</p>
      ${modelCaveat}
      <table class="am-table">
        <thead>
          <tr>
            <th>${tr("alignment_metrics.col.who")}</th>
            <th>n</th>
            <th title="Pearson PA vs gold">PA-P</th>
            <th title="Pearson IA vs gold">IA-P</th>
            <th title="Joint F1 (PA≥4 & IA≥4)">JF1</th>
            <th title="Exact-match PA">Exact PA</th>
            <th title="±1 agreement PA">±1 PA</th>
            <th title="Mean-squared error PA">MSE PA</th>
          </tr>
        </thead>
        <tbody>${rowsHtml}</tbody>
      </table>`;
    card.hidden = false;
  } catch (_) { card.hidden = true; }
}

/* v85cc: dedicated /stats.html init — loads both charts + auto-refresh every 60s. */
async function initStats() {
  const user = localStorage.getItem(CFG.LS_USER);
  if (!user) { window.location.href = "index.html"; return; }
  document.getElementById("who").textContent = user;
  applyRolePill(user, localStorage.getItem(CFG.LS_ROLE));
  await Promise.all([loadModelAverages(), loadScoreDistribution()]);
  setInterval(() => {
    if (!document.hidden) { loadModelAverages(); loadScoreDistribution(); }
  }, 60000);
}

/* v85cb: model-average horizontal bar chart (admin-only if backend flags it that way).
   Ham returns {models:[{model, n_annotations, pa_mean, pa_std, ia_mean, ia_std, overall_mean}]}.
   Bars are rendered as flex-width divs (no chart library) — one row per model, width
   proportional to overall_mean/5. */
async function loadModelAverages() {
  const card = document.getElementById("model-averages-card");
  const body = document.getElementById("model-averages-body");
  if (!card || !body) return;
  const user = localStorage.getItem(CFG.LS_USER) || "";
  try {
    const r = await fetch(`${CFG.APPS_SCRIPT_URL}/?action=model_averages&user=${encodeURIComponent(user)}`);
    if (!r.ok) { card.hidden = true; return; }
    const d = await r.json();
    if (d?.ok === false || d?.code === "admin_only") { card.hidden = true; return; }
    const models = d.models || [];
    if (!models.length) { card.hidden = true; return; }
    const MAX = 5;
    body.innerHTML = models.map((m, i) => {
      const overall = Number(m.overall_mean || 0);
      const pct = Math.max(0, Math.min(100, (overall / MAX) * 100));
      const pa = Number(m.pa_mean || 0), ia = Number(m.ia_mean || 0);
      const n = Number(m.n_annotations || 0);
      const paStd = m.pa_std != null ? Number(m.pa_std).toFixed(2) : "—";
      const iaStd = m.ia_std != null ? Number(m.ia_std).toFixed(2) : "—";
      return `<div class="ma-row">
        <div class="ma-head">
          <span class="ma-rank">${i + 1}</span>
          <span class="ma-model" title="${escapeHtml(m.model)}">${escapeHtml(m.model)}</span>
          <span class="ma-overall">${overall.toFixed(2)}</span>
        </div>
        <div class="ma-bar-track"><div class="ma-bar-fill" style="width:${pct.toFixed(1)}%"></div></div>
        <p class="ma-detail muted small">PA ${pa.toFixed(2)} <span class="ma-std">±${paStd}</span> · IA ${ia.toFixed(2)} <span class="ma-std">±${iaStd}</span> · n=${n}</p>
      </div>`;
    }).join("");
    card.hidden = false;
  } catch (_) { card.hidden = true; }
}

/* v85cc: redesigned score distribution — one axis per row (PA then IA), each row
   overlays "all" (gray) and "mine" (colored) bars per score bucket so the two
   distributions are easy to compare at a glance. Big μ/σ header per axis. */
async function loadScoreDistribution() {
  const card = document.getElementById("score-dist-card");
  const body = document.getElementById("score-dist-body");
  if (!card) return;
  const user = localStorage.getItem(CFG.LS_USER) || "";
  try {
    const r = await fetch(`${CFG.APPS_SCRIPT_URL}/?action=score_distribution&user=${encodeURIComponent(user)}`);
    if (!r.ok) { card.hidden = true; return; }
    const d = await r.json();
    if (d?.ok === false) { card.hidden = true; return; }
    if (body) {
      body.innerHTML = renderScoreDistV2(d);
    } else {
      // Legacy dashboard placement (removed after v85cc but kept for safety).
      const allBlock = document.getElementById("sd-all");
      const mineBlock = document.getElementById("sd-mine");
      if (allBlock) allBlock.innerHTML = renderScoreDistLegacy(d.all || {}, tr("stats.score_dist.all"));
      if (mineBlock) {
        if (d.mine && d.mine.n > 0) {
          mineBlock.innerHTML = renderScoreDistLegacy(d.mine, tr("stats.score_dist.mine"));
          mineBlock.hidden = false;
        } else mineBlock.hidden = true;
      }
    }
    card.hidden = false;
  } catch (_) { card.hidden = true; }
}

function renderScoreDistV2(d) {
  const all = d.all || {};
  const mine = d.mine || {};
  const hasMine = mine.n > 0;
  const paBars = renderCompareBars(all.pa || [], hasMine ? (mine.pa || []) : null);
  const iaBars = renderCompareBars(all.ia || [], hasMine ? (mine.ia || []) : null);
  const stats = (g, lbl) => g && g.n > 0
    ? `<span class="sd2-stat"><span class="sd2-stat-name">${escapeHtml(lbl)}</span> n=<strong>${g.n}</strong> · μ=<strong>${Number(g.mean ?? 0).toFixed(2)}</strong> · σ=<strong>${Number(g.std ?? 0).toFixed(2)}</strong></span>`
    : "";
  return `
    <div class="sd2-legend">
      <span class="sd2-swatch sd2-swatch-all"></span> <span data-i18n="stats.score_dist.all">全员</span>
      ${hasMine ? `<span class="sd2-swatch sd2-swatch-mine"></span> <span data-i18n="stats.score_dist.mine">自己</span>` : ""}
    </div>
    <div class="sd2-row">
      <h4 class="sd2-axis-label">PA <span class="muted small">Physical Adherence</span></h4>
      <div class="sd2-stats">
        ${stats({n: all.n, mean: all.pa_mean, std: all.pa_std}, tr("stats.score_dist.all"))}
        ${hasMine ? stats({n: mine.n, mean: mine.pa_mean, std: mine.pa_std}, tr("stats.score_dist.mine")) : ""}
      </div>
      ${paBars}
    </div>
    <div class="sd2-row">
      <h4 class="sd2-axis-label">IA <span class="muted small">Instruction Alignment</span></h4>
      <div class="sd2-stats">
        ${stats({n: all.n, mean: all.ia_mean, std: all.ia_std}, tr("stats.score_dist.all"))}
        ${hasMine ? stats({n: mine.n, mean: mine.ia_mean, std: mine.ia_std}, tr("stats.score_dist.mine")) : ""}
      </div>
      ${iaBars}
    </div>`;
}

function renderCompareBars(allCounts, mineCounts) {
  // v85cd: max-in-chart normalization + percentage labels. Bars fill the plot area now
  // (before, %-of-group put max around 30% → tiny bars in a big empty box).
  const allTotal = allCounts.reduce((a, b) => a + (b || 0), 0);
  const mineTotal = mineCounts ? mineCounts.reduce((a, b) => a + (b || 0), 0) : 0;
  const allPct = allTotal ? allCounts.map(c => (c / allTotal) * 100) : allCounts.map(() => 0);
  const minePct = (mineCounts && mineTotal) ? mineCounts.map(c => (c / mineTotal) * 100) : null;
  const maxPct = Math.max(...allPct, ...(minePct || [0]));
  const scale = maxPct > 0 ? (100 / maxPct) : 0;
  return `<div class="sd2-bars-v3">${[1,2,3,4,5].map((score, i) => {
    const aH = Math.max(3, allPct[i] * scale);
    const mH = minePct ? Math.max(3, minePct[i] * scale) : 0;
    const aC = allCounts[i] || 0;
    const mC = mineCounts ? (mineCounts[i] || 0) : null;
    const aP = allPct[i].toFixed(0);
    const mP = minePct ? minePct[i].toFixed(0) : null;
    return `<div class="sd3-slot">
      <div class="sd3-stack">
        <div class="sd3-bar sd3-bar-all" style="height:${aH}%" title="全员 score=${score}: ${aC} (${aP}%)">
          <span class="sd3-count">${aC}</span>
          <span class="sd3-pct">${aP}%</span>
        </div>
        ${minePct ? `<div class="sd3-bar sd3-bar-mine" style="height:${mH}%" title="自己 score=${score}: ${mC} (${mP}%)">
          <span class="sd3-count">${mC}</span>
          <span class="sd3-pct">${mP}%</span>
        </div>` : ""}
      </div>
      <div class="sd3-label">${score}</div>
    </div>`;
  }).join("")}</div>`;
}

/* Legacy dashboard-embedded renderer, kept for graceful fallback. */
function renderScoreDistLegacy(g, title) {
  const pa = g.pa || [0, 0, 0, 0, 0];
  const ia = g.ia || [0, 0, 0, 0, 0];
  const n = Number(g.n ?? 0);
  const paMean = g.pa_mean != null ? Number(g.pa_mean).toFixed(2) : "—";
  const iaMean = g.ia_mean != null ? Number(g.ia_mean).toFixed(2) : "—";
  const paStd = g.pa_std != null ? Number(g.pa_std).toFixed(2) : "—";
  const iaStd = g.ia_std != null ? Number(g.ia_std).toFixed(2) : "—";
  const bars = (counts, cls) => {
    const max = Math.max(1, ...counts);
    return counts.map((c, i) => {
      const h = Math.max(2, Math.round((c / max) * 100));
      return `<div class="sd-bar-slot"><div class="sd-bar-count">${c}</div><div class="sd-bar ${cls}" style="height:${h}%"></div><div class="sd-bar-label">${i + 1}</div></div>`;
    }).join("");
  };
  return `
    <h4 class="sd-title">${escapeHtml(title)} <span class="muted small">n=${n}</span></h4>
    <div class="sd-pair">
      <div class="sd-axis">
        <div class="sd-axis-label">PA <span class="muted">μ=${paMean} σ=${paStd}</span></div>
        <div class="sd-bars">${bars(pa, "pa")}</div>
      </div>
      <div class="sd-axis">
        <div class="sd-axis-label">IA <span class="muted">μ=${iaMean} σ=${iaStd}</span></div>
        <div class="sd-bars">${bars(ia, "ia")}</div>
      </div>
    </div>`;
}

/* v85at — dedicated data_reports.html page. siyuan: 别堆在 home, 专门页 like
   review/my_annotations. Renders each report with init_frame + instruction +
   click-to-watch video. */
async function initDataReports() {
  const user = localStorage.getItem(CFG.LS_USER);
  const role = localStorage.getItem(CFG.LS_ROLE) || "";
  if (!user) { window.location.href = "index.html"; return; }
  document.getElementById("who").textContent = user;
  applyRolePill(user, role);
  if (role !== "admin" && user !== "masiyuan") {
    renderRoleGate("管理员 (admin)");
    return;
  }
  ensureSettleAnchor().then(() => startSettleCountdown());
  await loadDataReportsPage();
  await loadQuarantineList();
  setInterval(() => {
    if (!document.hidden) { loadDataReportsPage(); loadQuarantineList(); }
  }, 30000);
}

/* v85bu: read-only view of (dataset, task, episode) GTs that admin/finalizer has
   quarantined — sibling videos across every model are held out of annotate + review.
   Backend returns `{tasks:[{dataset,task,episode,affected,note,ts,by}]}`. */
async function loadQuarantineList() {
  const card = document.getElementById("quarantine-card");
  const ul = document.getElementById("quarantine-list");
  if (!card || !ul) return;
  const user = localStorage.getItem(CFG.LS_USER) || "";
  const canWrite = localStorage.getItem("ewj_can_write") === "1";
  try {
    const r = await fetch(`${CFG.APPS_SCRIPT_URL}/?action=quarantine_list&user=${encodeURIComponent(user)}`);
    const d = await r.json();
    if (d?.ok === false) throw new Error(d.error || "fetch failed");
    const tasks = d.tasks || d.items || [];
    card.hidden = false;
    if (tasks.length === 0) {
      ul.innerHTML = "";
      document.getElementById("quarantine-empty").hidden = false;
      return;
    }
    document.getElementById("quarantine-empty").hidden = true;
    ul.innerHTML = tasks.map(t => {
      const ts = (t.ts || "").slice(0, 16).replace("T", " ");
      const note = t.note ? `<p class="report-note">${escapeHtml(t.note)}</p>` : "";
      const restoreBtn = canWrite
        ? `<button type="button" class="ghost small" data-unquarantine="1" data-dataset="${escapeHtml(t.dataset)}" data-task="${escapeHtml(t.task)}" data-episode="${escapeHtml(t.episode || "")}">↩ ${escapeHtml(tr("quarantine.restore"))}</button>`
        : "";
      return `<li class="report-row report-bad">
        <div class="report-head">
          <span class="report-type tag">🚧 ${escapeHtml(tr("quarantine.tag"))}</span>
          <span class="report-meta muted">${escapeHtml(t.dataset || "?")} / ${escapeHtml(t.task || "?")} / ${escapeHtml(t.episode || "?")} · ${tr("quarantine.affected").replace("{n}", t.affected ?? "?")}</span>
        </div>
        <p class="muted small">${escapeHtml(ts)}${t.by ? " · " + escapeHtml(t.by) : ""}</p>
        ${note}
        <div class="report-actions">${restoreBtn}</div>
      </li>`;
    }).join("");
    ul.querySelectorAll("[data-unquarantine]").forEach(btn => {
      btn.addEventListener("click", async () => {
        if (!confirm(tr("quarantine.restore_confirm"))) return;
        btn.disabled = true;
        try {
          const res = await fetch(CFG.APPS_SCRIPT_URL + "/", {
            method: "POST", headers: { "Content-Type": "text/plain" },
            body: JSON.stringify({ unquarantine_task: true, agent: user,
              dataset: btn.dataset.dataset, task: btn.dataset.task, episode: btn.dataset.episode || null }),
          });
          const dd = await res.json();
          if (maybeShowReadOnlyFromBody(dd)) { btn.disabled = false; return; }
          if (dd?.ok === false) throw new Error(dd.error || "restore failed");
          toast(tr("quarantine.restored"), "ok");
          await loadQuarantineList();
          await loadDataReportsPage();
        } catch (ee) {
          toast("Restore failed: " + ee.message, "err");
          btn.disabled = false;
        }
      });
    });
  } catch (_) { /* endpoint not yet up — silently leave card hidden */ }
}

async function loadDataReportsPage() {
  const list = document.getElementById("dr-list");
  const loading = document.getElementById("dr-loading");
  const empty = document.getElementById("dr-empty");
  const err = document.getElementById("dr-error");
  const cntEl = document.getElementById("dr-count");
  if (!list) return;
  err.hidden = true;
  const user = localStorage.getItem(CFG.LS_USER) || "";
  const canWrite = localStorage.getItem("ewj_can_write") === "1";
  try {
    const r = await fetch(`${CFG.APPS_SCRIPT_URL}/?action=data_reports&user=${encodeURIComponent(user)}`);
    const d = await r.json();
    if (d?.ok === false) throw new Error(d.error || "fetch failed");
    const reports = (d.reports || []).slice();
    reports.sort((a, b) => {
      const ao = a.status === "open" ? 0 : 1;
      const bo = b.status === "open" ? 0 : 1;
      if (ao !== bo) return ao - bo;
      return (b.first_ts || "").localeCompare(a.first_ts || "");
    });
    const openCount = reports.filter(rr => rr.status === "open").length;
    cntEl.textContent = `${openCount} open · ${reports.length} total`;
    loading.hidden = true;
    if (!reports.length) { empty.hidden = false; list.hidden = true; return; }
    empty.hidden = true; list.hidden = false;
    list.innerHTML = reports.map(rr => renderReportCard(rr, canWrite)).join("");
    list.querySelectorAll("[data-resolve]").forEach(btn => {
      btn.addEventListener("click", async () => {
        const resolution = btn.dataset.resolve;
        const item_id = btn.dataset.item;
        if (!item_id) return;
        btn.disabled = true;
        try {
          const res = await fetch(CFG.APPS_SCRIPT_URL + "/", {
            method: "POST", headers: { "Content-Type": "text/plain" },
            body: JSON.stringify({ resolve_data_report: true, agent: user, item_id, resolution }),
          });
          const dd = await res.json();
          if (maybeShowReadOnlyFromBody(dd)) { btn.disabled = false; return; }
          if (dd?.ok === false) throw new Error(dd.error || "resolve failed");
          toast(`已 ${resolution}`, "ok");
          await loadDataReportsPage();
        } catch (ee) {
          toast("Resolve failed: " + ee.message, "err");
          btn.disabled = false;
        }
      });
    });
    // v85bu: 🚧 "Quarantine the whole task" — calls Ham's quarantine_task which removes
    // every (model × prompt) sibling of this GT (dataset|task|episode) from the annotate
    // + review pools. Use when an admin/finalizer determines the GT itself is broken.
    list.querySelectorAll("[data-quarantine]").forEach(btn => {
      btn.addEventListener("click", async () => {
        const item_id = btn.dataset.item;
        if (!item_id) return;
        if (!confirm(tr("reports.quarantine_confirm"))) return;
        btn.disabled = true;
        try {
          const res = await fetch(CFG.APPS_SCRIPT_URL + "/", {
            method: "POST", headers: { "Content-Type": "text/plain" },
            body: JSON.stringify({ quarantine_task: true, agent: user, item_id }),
          });
          const dd = await res.json();
          if (maybeShowReadOnlyFromBody(dd)) { btn.disabled = false; return; }
          if (dd?.ok === false) throw new Error(dd.error || "quarantine failed");
          // v85bv: Ham added reports_auto_resolved — surface it in the toast so the admin
          // sees that the open report(s) for this GT were cleared automatically.
          const n = dd.affected ?? dd.count ?? "?";
          const r = Number(dd.reports_auto_resolved || 0);
          const base = tr("reports.quarantine_done").replace("{n}", n);
          toast(r > 0 ? `${base} ${tr("reports.quarantine_auto_resolved").replace("{r}", r)}` : base, "ok");
          await loadDataReportsPage();
          await loadQuarantineList();
        } catch (ee) {
          toast("Quarantine failed: " + ee.message, "err");
          btn.disabled = false;
        }
      });
    });
    list.querySelectorAll(".dr-toggle-video").forEach(btn => {
      btn.addEventListener("click", () => {
        const panel = btn.nextElementSibling;
        if (!panel) return;
        const showing = !panel.hidden;
        panel.hidden = showing;
        btn.textContent = showing ? tr("reports.show_video") : tr("reports.hide_video");
        if (!showing) {
          const v = panel.querySelector("video");
          if (v && !v.src && v.dataset.src) { v.src = v.dataset.src; v.load(); }
        }
      });
    });
  } catch (e) {
    loading.hidden = true;
    err.hidden = false;
    document.getElementById("dr-err-msg").textContent = e.message;
  }
}

function renderReportCard(rr, canWrite) {
  const open = rr.status === "open";
  const statusCls = rr.status === "confirmed_bad" ? "bad"
                   : rr.status === "invalid" ? "ok"
                   : "open";
  const reporters = (rr.reporters || []).join(", ");
  const notes = (rr.notes || []).filter(Boolean).join(" · ");
  const ts = (rr.first_ts || "").slice(0, 16).replace("T", " ");
  const idShort = (rr.item_id || "").slice(-50);
  const instruction = escapeHtml(rr.instruction_cn || rr.instruction || "");
  const initFrameUrl = rr.init_frame_url ? escapeHtml(rr.init_frame_url) : "";
  const videoUrl = rr.video_url ? escapeHtml(rr.video_url) : "";
  return `<li class="report-row report-${statusCls}">
    <div class="report-head">
      <span class="report-type tag">${escapeHtml(rr.issue_type || "?")}</span>
      <span class="report-meta muted">${escapeHtml(rr.dataset || "?")} / ${escapeHtml(rr.task || "?")} · ${escapeHtml(rr.model || "?")}</span>
      <span class="report-status tag tag-${statusCls}">${escapeHtml(rr.status || "?")}</span>
    </div>
    <p class="muted small">${escapeHtml(ts)} · 报告人: ${escapeHtml(reporters)} ${rr.resolved_by ? "· 处理: " + escapeHtml(rr.resolved_by) : ""}</p>
    ${notes ? `<p class="report-note">${escapeHtml(notes)}</p>` : ""}
    <div class="dr-context">
      ${initFrameUrl ? `<img class="dr-init" src="${initFrameUrl}" alt="init frame" loading="lazy">` : ""}
      ${instruction ? `<p class="dr-instr"><strong>${escapeHtml(tr("task.instruction"))}:</strong> ${instruction}</p>` : ""}
    </div>
    ${videoUrl ? `
      <button type="button" class="ghost small dr-toggle-video">${escapeHtml(tr("reports.show_video"))}</button>
      <div class="dr-video-panel" hidden>
        <video controls preload="none" muted playsinline webkit-playsinline="true" x5-playsinline="true" data-src="${videoUrl}"></video>
      </div>
    ` : ""}
    <p class="muted xsmall" title="${escapeHtml(rr.item_id || "")}">…${escapeHtml(idShort)}</p>
    ${open && canWrite ? `<div class="report-actions">
      <button type="button" class="danger small" data-resolve="confirmed_bad" data-item="${escapeHtml(rr.item_id || "")}">确认坏</button>
      <button type="button" class="ghost small" data-resolve="invalid" data-item="${escapeHtml(rr.item_id || "")}">无效(恢复)</button>
      <button type="button" class="warn small" data-quarantine="1" data-item="${escapeHtml(rr.item_id || "")}" title="${escapeHtml(tr("reports.quarantine_title"))}">🚧 ${escapeHtml(tr("reports.quarantine_btn"))}</button>
    </div>` : ""}
  </li>`;
}

/* v85y — legacy dashboard panel (kept as no-op since v85at moved it to data_reports.html). */
async function loadDataReports() {
  const card = document.getElementById("reports-card");
  if (!card) return;
  const user = localStorage.getItem(CFG.LS_USER) || "";
  const role = localStorage.getItem(CFG.LS_ROLE) || "";
  // v85ad: any admin (full or read-only) can see the reports queue; only canWrite
  // gets the resolve buttons rendered below.
  if (role !== "admin" && user !== "masiyuan") { card.hidden = true; return; }
  const canWrite = localStorage.getItem("ewj_can_write") === "1";
  try {
    const r = await fetch(`${CFG.APPS_SCRIPT_URL}/?action=data_reports&user=${encodeURIComponent(user)}`);
    const d = await r.json();
    if (d?.ok === false) { card.hidden = true; return; }
    const reports = d.reports || [];
    card.hidden = false;
    const openCount = reports.filter(rr => rr.status === "open").length;
    const cnt = document.getElementById("reports-count");
    if (cnt) cnt.textContent = `${reports.length} total · ${openCount} open`;
    const empty = document.getElementById("reports-empty");
    const list = document.getElementById("reports-list");
    if (!reports.length) { empty.hidden = false; list.innerHTML = ""; return; }
    empty.hidden = true;
    list.innerHTML = reports.map(rr => {
      const open = rr.status === "open";
      const status_cls = rr.status === "confirmed_bad" ? "bad" : (rr.status === "invalid" ? "ok" : "open");
      const reporters = (rr.reporters || []).join(", ");
      const notes = (rr.notes || []).filter(Boolean).join(" · ");
      const ts = (rr.first_ts || "").slice(0, 16).replace("T", " ");
      const idShort = (rr.item_id || "").slice(-60);
      return `<li class="report-row report-${status_cls}">
        <div class="report-head">
          <span class="report-type tag">${escapeHtml(rr.issue_type || "?")}</span>
          <span class="report-meta muted">${escapeHtml(rr.dataset || "?")} / ${escapeHtml(rr.task || "?")} · ${escapeHtml(rr.model || "?")}</span>
          <span class="report-status tag tag-${status_cls}">${escapeHtml(rr.status || "?")}</span>
        </div>
        <p class="muted small">${escapeHtml(ts)} · 报告人: ${escapeHtml(reporters)} ${rr.resolved_by ? "· 处理: " + escapeHtml(rr.resolved_by) : ""}</p>
        ${notes ? `<p class="report-note">${escapeHtml(notes)}</p>` : ""}
        <p class="muted xsmall" title="${escapeHtml(rr.item_id || "")}">…${escapeHtml(idShort)}</p>
        ${open && canWrite ? `<div class="report-actions">
          <button type="button" class="danger small" data-resolve="confirmed_bad" data-item="${escapeHtml(rr.item_id || "")}">确认坏</button>
          <button type="button" class="ghost small" data-resolve="invalid" data-item="${escapeHtml(rr.item_id || "")}">无效(恢复)</button>
        </div>` : ""}
      </li>`;
    }).join("");
    list.querySelectorAll("[data-resolve]").forEach(btn => {
      btn.addEventListener("click", async () => {
        const resolution = btn.dataset.resolve;
        const item_id = btn.dataset.item;
        if (!item_id) return;
        btn.disabled = true;
        try {
          const res = await fetch(CFG.APPS_SCRIPT_URL + "/", {
            method: "POST", headers: { "Content-Type": "text/plain" },
            body: JSON.stringify({ resolve_data_report: true, agent: user, item_id, resolution }),
          });
          const dd = await res.json();
          if (maybeShowReadOnlyFromBody(dd)) { btn.disabled = false; return; }
          if (dd?.ok === false) throw new Error(dd.error || "resolve failed");
          toast(`已 ${resolution}`, "ok");
          await loadDataReports();
        } catch (err) {
          toast("Resolve failed: " + err.message, "err");
          btn.disabled = false;
        }
      });
    });
  } catch (err) {
    console.warn("data_reports fetch failed", err);
    card.hidden = true;
  }
}

// v85b milestone (siyuan): single neutral bar showing test-set priority pool progress.
// Personal + global counts. Backend contract: `?action=priority_progress&user=<u>` →
// `{total, mine, all}`. Hides itself when total is 0/missing (graceful pre-deploy state).
let _milestoneDoneFired = false;
async function loadMilestoneProgress() {
  const card = document.getElementById("milestone-card");
  if (!card) return;
  const user = localStorage.getItem(CFG.LS_USER);
  if (!user || !CFG.APPS_SCRIPT_URL) { card.hidden = true; return; }
  try {
    const res = await fetch(`${CFG.APPS_SCRIPT_URL}/?action=milestone&user=${encodeURIComponent(user)}`);
    if (!res.ok) { card.hidden = true; return; }
    const d = await res.json();
    const total = Number(d?.total || 0);
    const mine = Number(d?.mine || 0);
    const all = Number(d?.all ?? d?.all_done ?? 0);
    if (!total) { card.hidden = true; return; }
    card.hidden = false;
    const pctAll = Math.max(0, Math.min(100, (all / total) * 100));
    const pctMine = Math.max(0, Math.min(100, (mine / total) * 100));
    document.getElementById("ms-bar-all").style.width = pctAll.toFixed(1) + "%";
    document.getElementById("ms-bar-mine").style.width = pctMine.toFixed(1) + "%";
    const txt = tr("milestone.counts").replace("{mine}", mine).replace("{all}", all).replace("{total}", total);
    document.getElementById("ms-counts").textContent = txt;
    if (all >= total && !_milestoneDoneFired) {
      _milestoneDoneFired = true;
      toast(tr("milestone.done_toast"), "ok");
    }
    // siyuan: surface team_today on the total progress line under selfSummary.
    const teamToday = Number(d?.team_today ?? 0);
    const teamEl = document.getElementById("total-team-today");
    if (teamEl && teamToday > 0) teamEl.textContent = tr("leaderboard.team_today_summary").replace("{n}", teamToday);
    // Re-anchor settle countdown to Ham's server time (avoids browser clock skew).
    setSettleAnchorFromBody(d);
  } catch (_) {
    card.hidden = true;
  }
}

async function loadBadges() {
  const user = localStorage.getItem(CFG.LS_USER);
  if (!user || !CFG.APPS_SCRIPT_URL) return;
  let data, alignListData, statsData;
  try {
    const [bRes, aRes, sRes] = await Promise.all([
      fetch(`${CFG.APPS_SCRIPT_URL}/?action=badges&user=${encodeURIComponent(user)}`),
      fetch(`${CFG.APPS_SCRIPT_URL}/?action=align_list&user=${encodeURIComponent(user)}`),
      fetch(`${CFG.APPS_SCRIPT_URL}/?action=stats&user=${encodeURIComponent(user)}`),
    ]);
    data = await bRes.json();
    alignListData = await aRes.json();
    statsData = await sRes.json();
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
  // v85i (siyuan): Annotate card badge = today's remaining daily quota (WeChat-style
  // unread count). Falls back to backend `annotate_remaining` when stats lacks quota.
  const todayDone = Number(statsData?.today ?? 0);
  const dailyQuota = Number(statsData?.quota ?? 0);
  const todayRemaining = dailyQuota > 0 ? Math.max(0, dailyQuota - todayDone) : Number(data.annotate_remaining || 0);
  const map = {
    annotate:     todayRemaining,
    myreviewed:   myreviewedNew,
    review:       data.review_pending,
    gold:         data.gold_remaining,
    goldreviewed: goldreviewedNew,
    goldreview:   data.goldreview_pending,
    align:        alignBadge,
    // v85bb: WeChat-style red badge for my own annotations that were rejected by a
    // reviewer and not yet acknowledged. Cleared by mark_rejected_seen when the user
    // opens my_annotations.html and sees the items.
    rejected:     Number(statsData?.n_my_rejected_unseen ?? 0),
    // v85bn: meta-reviewer pending arbitration queue size (siyuanw / masiyuan only).
    arbitration:  Number(statsData?.n_pending_arbitration ?? 0),
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
  // Whether the viewer (this user) can take write actions (delete, role change).
  // Read-only admins like siyuanw/Yu set can_write=false in stats.
  const viewerCanWrite = localStorage.getItem("ewj_can_write") === "1";
  // Sort by role rank (admin → author → reviewer → contributor) per siyuan v85ar —
  // authors above contributors. Then total_pct desc, then done desc.
  const roleRank = { admin: 0, author: 1, reviewer: 2, contributor: 3 };
  const annotators = (data.annotators || []).slice().sort((a, b) => {
    const aRole = a.role || ((a.user === "masiyuan") ? "admin" : "contributor");
    const bRole = b.role || ((b.user === "masiyuan") ? "admin" : "contributor");
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

  // Self-summary banner: shows today's count vs daily quota + total progress.
  // siyuan v85h: admin now annotates like an author (30/day quota) so admin also gets
  // this card — they need to see their own annotation progress, not just the team grid.
  const selfBlock = document.getElementById("self-summary");
  if (selfBlock) {
    const me = annotators.find(a => a.is_self);
    if (me) {
      renderSelfSummary(selfBlock, me);
      selfBlock.hidden = false;
      // Quality card still gated to contributor only (v85f).
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
    const row = document.createElement("tr");
    if (a.is_self) row.classList.add("self-row");

    // First cell: user info (name, role, quota if admin)
    const tdUser = document.createElement("td");
    tdUser.className = "user-cell";
    // v85ad: admins are no longer just masiyuan — also siyuanw / Yu (role=admin).
    // We render an explicit Admin pill for admin rows and skip the role-select dropdown
    // (admins can't be downgraded via UI). Delete + role-change controls are only shown
    // when the viewer is a full admin (viewerCanWrite) AND the target is not an admin.
    const isAdminRow = a.role === "admin" || a.user === "masiyuan";
    const roleControl = isAdminRow
      ? ""
      : (isAdmin && viewerCanWrite
          ? `<select class="role-select" data-role="${escapeHtml(a.role || '')}" data-target="${escapeHtml(a.user)}">
               <option value="author"${a.role === "author" ? " selected" : ""}>Author</option>
               <option value="contributor"${a.role === "contributor" ? " selected" : ""}>Contributor</option>
             </select>`
          : (a.role ? `<span class="role-pill" data-role="${a.role}">${capitalizeFirst(a.role)}</span>` : ""));
    // v85ba: per-row reviewer stack badge (siyuan 面板里要标审核员)
    const reviewerPill = a.is_reviewer ? `<span class="role-pill" data-role="reviewer">${tr("role.reviewer")}</span>` : "";
    const quotaHTML = isAdmin
      ? `<span class="quota-label">${a.quota ?? "—"}/day</span>`
      : "";
    const streakHTML = (isAdmin || a.is_self) && (a.streak ?? 0) > 0
      ? `<span class="streak-mini" title="连续打卡 ${a.streak} 天">连续 ${a.streak} 天</span>`
      : "";
    // Delete: full-admin viewer only; admin rows never deletable.
    const deleteBtn = (isAdmin && viewerCanWrite && !isAdminRow)
      ? `<button type="button" class="link delete-user-btn" data-target="${escapeHtml(a.user)}" data-role="${escapeHtml(a.role || '')}" title="${tr("admin.delete_user_tip")}">🗑</button>`
      : "";
    tdUser.innerHTML = `
      <div class="user-head">
        <span class="user-name">${escapeHtml(a.user)}</span>
        ${isAdminRow ? '<span class="role-pill" data-role="admin">Admin</span>' : ''}
        ${roleControl}
        ${reviewerPill}
        ${quotaHTML}
        ${streakHTML}
        ${deleteBtn}
      </div>
    `;
    row.appendChild(tdUser);
    if (isAdmin && viewerCanWrite && !isAdminRow) {
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
      const delBtn = tdUser.querySelector(".delete-user-btn");
      if (delBtn) delBtn.addEventListener("click", () => deleteUserHandler(a.user, a.role));
    }

    // Day cells: count + deficit (BaiCiZhan-style "差 N" on miss days, ✓ on met)
    for (let i = 0; i < days.length; i++) {
      const cell = (a.week || [])[i];
      const td = document.createElement("td");
      td.className = "grid-cell";
      if (i === days.length - 1) td.classList.add("today-cell");
      // v85ca: Ham added cell.total = count + reports and cell.delta = total - quota.
      // siyuan: 周格直接显示合并总数(11+2 就写 13), 不拆开。
      const displayCount = typeof cell?.total === "number" ? cell.total : (cell?.count ?? 0);
      const state = cell ? (cell.state || (displayCount === 0 ? "none" : (cell.met ? "met" : "below"))) : "none";
      const showNumbers = (isAdmin || a.is_self) && cell && typeof cell.count === "number";
      if (state === "none") {
        td.classList.add("zero");
        td.textContent = showNumbers && displayCount === 0 ? "·" : "";
      } else if (state === "met") {
        td.classList.add("met");
        if (showNumbers) td.innerHTML = `<span class="cell-count">${displayCount}</span><span class="cell-flag">✓</span>`;
      } else {
        td.classList.add("miss");
        if (showNumbers) {
          const shortBy = typeof cell.delta === "number" ? Math.max(0, -cell.delta) : Math.max(0, (a.quota ?? 0) - displayCount);
          td.innerHTML = `<span class="cell-count">${displayCount}</span><span class="cell-deficit">−${shortBy}</span>`;
        }
      }
      if (cell && showNumbers) {
        const rp = Number(cell.reports || 0);
        const rpNote = rp > 0 ? ` (含 ${rp} 报错)` : "";
        td.title = `${cell.date}: ${displayCount}/${a.quota ?? "?"}${rpNote}`;
      }
      row.appendChild(td);
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
    row.appendChild(tdProgress);

    tbody.appendChild(row);
  }
}

function formatDayLabel(iso, isToday) {
  if (!iso) return "—";
  const md = iso.slice(5);  // MM-DD
  return isToday ? `Today (${md})` : md;
}

function renderSelfSummary(root, me) {
  const today = me.today ?? 0;
  // v85by: report-KPI. today = pure annotations; today_reports = today's
  // report count that counts toward the daily KPI. Display N + R / quota with
  // +R in red small; met/remaining/pct all use N+R.
  const todayReports = me.today_reports ?? 0;
  const effectiveToday = today + todayReports;
  const quota = me.quota ?? 0;
  const met = quota > 0 && effectiveToday >= quota;
  const remaining = Math.max(0, quota - effectiveToday);
  const todayPct = quota > 0 ? Math.min(100, Math.round(100 * effectiveToday / quota)) : 0;
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
      <div class="today-num"><strong>${today}</strong>${todayReports > 0 ? `<span class="today-bonus">+${todayReports}</span>` : ""}<span class="today-of">/ ${quota}</span></div>
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
      <p class="muted small total-team-today" id="total-team-today"></p>
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
      <p class="muted small earnings-settle">${tr("earnings.settle_time")}</p>
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
  // v85g: pass-rate / quality only applies to contributor (siyuan: author 不算通过率).
  const role = localStorage.getItem(CFG.LS_ROLE);
  if (role !== "contributor") return;
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
  // Author role: tier name still shows (quality signal) but hide ¥ unit price + earnings
  // since author isn't paid per-item (Alice's catch from B QA).
  const role = (localStorage.getItem(CFG.LS_ROLE) || "").toLowerCase();
  const isContributor = role === "contributor";
  const unitPrice = isContributor && d.unit_price != null ? `¥${Number(d.unit_price).toFixed(2)}/条` : "";
  // Ham's contract: week_earned = ISO-week earnings (label-accurate); earned_estimate = cumulative.
  const weekEarned = d.week_earned != null ? `¥${Number(d.week_earned).toFixed(2)}` : "—";
  const weekPayable = d.week_payable != null ? ` (${d.week_payable} 条)` : "";
  // v80: rework_state replaces the old pause_state. Three states: normal / rework_pending (soft,
   // pool has items, NO new-task lock) / admin_review (pool cleared but rate still <60%).
  const reworkState = d.rework_state || d.pause_state || "normal";
  const poolCount = d.rework_pool ?? 0;
  let banner = "";
  if (reworkState === "rework_pending" && poolCount > 0) {
    // i18n string already starts with ⚠ — don't prefix another one (Alice's catch).
    banner = `<div class="quality-pause-banner pause-rework_pending">${tr("quality.rework.pending").replace("{N}", poolCount)}</div>`;
  } else if (reworkState === "admin_review") {
    banner = `<div class="quality-pause-banner pause-admin_review">${escapeHtml(tr("quality.rework.admin_review"))}</div>`;
  }
  const pauseBanner = banner;
  return `
    <div class="quality-card">
      <div class="quality-head">
        <span class="quality-icon">📊</span>
        <div class="quality-meta">
          <div class="quality-rates">
            <span class="muted">${tr("quality.this_week")} ${reviewed} ${tr("quality.reviewed_unit")}</span>
            <span class="quality-rate-sep">·</span>
            <span class="quality-rate"><strong>${pct(passRate)}</strong> ${tr("quality.pass_rate")}</span>
            <span class="quality-rate-sep">·</span>
            <span class="quality-rate muted"><strong>${pct(fullRate)}</strong> ${tr("quality.full_pass_rate")}</span>
          </div>
        </div>
        <div class="quality-tier" style="color:${tierColor};border-color:${tierColor}">
          ${escapeHtml(tierLabel)}${unitPrice ? " " + unitPrice : ""}
        </div>
      </div>
      ${isContributor ? `<div class="quality-foot"><span class="muted">${tr("quality.earned_this_week")}:</span> <strong>${weekEarned}</strong><span class="muted small">${weekPayable}</span></div>` : ""}
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

/* Admin: delete a user (soft-blocklist on backend — name can't re-register).
   Two confirm dialogs: standard one + extra warning when target is a reviewer
   (deleting a reviewer affects the 30%-sample distribution + review pool capacity). */
async function deleteUserHandler(target, role) {
  const isReviewer = role === "reviewer";
  const standardMsg = (tr("admin.delete_user_confirm") || "Delete {U}? Their history stays, but the name is blocklisted and cannot re-register.").replace("{U}", target);
  if (!confirm(standardMsg)) return;
  if (isReviewer) {
    const reviewerMsg = (tr("admin.delete_reviewer_warn") || "{U} is a REVIEWER. Deleting them shrinks the review pool. Continue?").replace("{U}", target);
    if (!confirm(reviewerMsg)) return;
  }
  const admin = localStorage.getItem(CFG.LS_USER);
  try {
    const r = await fetch(CFG.APPS_SCRIPT_URL + "/", {
      method: "POST", headers: { "Content-Type": "text/plain" },
      body: JSON.stringify({ delete_user: true, admin, target }),
    });
    const d = await r.json();
    if (d?.ok === false) throw new Error(d.error || "delete failed");
    toast((tr("admin.delete_user_done") || "Deleted {U}.").replace("{U}", target), "ok");
    await loadDashboard();
  } catch (err) {
    alert("Delete failed: " + err.message);
  }
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
        // v85j: rebuild auto-note when a sub-tri changes (one of the 6 inputs that
        // contribute to the per-axis notes). The dispatched event lets all wired
        // forms recompute without us caring which form contains the button.
        document.dispatchEvent(new CustomEvent("autonote:refresh", { detail: { source: "subtri", input: input?.id } }));
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

/* ===================== Note auto-prefill (v85j) =====================
   siyuan: when annotator picks a main score / sub-tri, the note textarea
   auto-fills a scaffold (score-tier header + per-sub bullet) so the
   annotator only writes the trailing detail after each colon. Subs at 2
   (passes) get no bullet. User text after ": " is preserved across
   rebuilds — we parse each rebuild and re-slot the trailing text. */
// Templates per Ham's v85j design: per-sub phrasing differs by status (0=severe,
// 1=partial). Sub at 2 (passes) emits no bullet. Header line varies by main score.
// v85ao (siyuan): predicate phrases were too specific and pre-judged the issue.
// Switched to neutral sub-axis labels — annotator writes the actual observation
// after the colon. Overall header also kept short + neutral (no trailing colon
// since it's now a summary line, not a fill-in).
const AUTO_NOTE = {
  physical: {
    score_lines: {
      1: "物理完全崩坏",
      2: "物理严重违反",
      3: "物理明显不一致",
      4: "物理大致真实",
      5: "物理高度真实",
    },
    subs: [
      ["agent_consistency", "机械手/人手完整性", { 0: "机械手/人手完整性 严重违反", 1: "机械手/人手完整性 存在问题" }],
      ["scene_consistency", "背景与物体一致性", { 0: "背景与物体一致性 严重违反", 1: "背景与物体一致性 存在问题" }],
      ["interaction_realism", "交互真实性", { 0: "交互真实性 严重违反", 1: "交互真实性 存在问题" }],
    ],
    note_id: "physical_notes",
    main_id: "physical_adherence",
  },
  instruction: {
    score_lines: {
      1: "指令完全不符",
      2: "指令明显不符",
      3: "指令部分偏离",
      4: "指令基本符合",
      5: "指令完全符合",
    },
    subs: [
      ["agent_match", "动作与主体匹配", { 0: "动作与主体匹配 严重不符", 1: "动作与主体匹配 存在问题" }],
      ["object_correct", "目标物正确", { 0: "目标物正确 严重不符", 1: "目标物正确 存在问题" }],
      ["goal_completed", "目标完成度", { 0: "目标完成度 未完成", 1: "目标完成度 部分完成" }],
    ],
    note_id: "instruction_notes",
    main_id: "instruction_alignment",
  },
};

/* Per-form registry of which (prefix, axis) pairs to rebuild. Forms call
   registerAutoNote("", "physical") etc. at wire-time; the global
   `autonote:refresh` event then iterates and calls buildAutoNote(prefix, axis). */
const _AUTO_NOTE_REGISTRY = new Set();
function registerAutoNote(prefix, axis) {
  _AUTO_NOTE_REGISTRY.add(prefix + "|" + axis);
}

/* v85cj (siyuan): surgical rebuild — only replace the prefill segments that changed.
   Old behavior rebuilt the whole note from scratch, which nuked any freeform
   paragraphs the user wrote and re-shuffled sub bullet order. Now we walk each
   existing line, keep unknown lines verbatim, replace the header line if it
   matches an old score_line, and replace the phrase prefix on each sub bullet
   while keeping the user's tail after the colon. Sub bullets that don't already
   exist for the current sub value get appended. Sub value=2 (passes) drops that
   sub's bullet if it exists. */
function buildAutoNote(prefix, axis) {
  // Note pre-fill disabled globally. Existing notes on already-saved items
  // are preserved (backend never mutates them); new items get empty textareas
  // so users write freeform. Function body below kept as dead code for easy
  // restore, but never executes.
  return;
  const cfg = AUTO_NOTE[axis];
  if (!cfg) return;
  const mainEl = document.getElementById(prefix + cfg.main_id);
  const noteEl = document.getElementById(prefix + cfg.note_id);
  if (!mainEl || !noteEl) return;
  const current = noteEl.value || "";
  const allHeaders = Object.values(cfg.score_lines);
  const allStatusPhrases = cfg.subs.flatMap(([_k, _l, statusMap]) => Object.values(statusMap));
  // Fresh textareas that don't yet look like our format get the full scaffold.
  const matchesOurFormat = current === "" ||
    allHeaders.some(h => current.startsWith(h)) ||
    allStatusPhrases.some(p => current.includes(p));
  if (!matchesOurFormat) return;
  const mainScore = Math.min(5, Math.max(1, Number(mainEl.value) || 3));
  const newHeader = cfg.score_lines[mainScore] || "";

  // Empty textarea → emit full scaffold with empty tails.
  if (current === "") {
    const lines = [newHeader];
    for (const [subKey, _subLabel, statusMap] of cfg.subs) {
      const v = getSubTri(prefix + subKey);
      const phrase = statusMap[v];
      if (phrase) lines.push(`\t${phrase}：`);
    }
    noteEl.value = lines.join("\n");
    return;
  }

  // Existing content: walk lines, mutate matching ones, leave the rest alone.
  const oldLines = current.split("\n");
  const seenSubKeys = new Set();
  const outLines = [];
  let headerReplaced = false;
  for (const line of oldLines) {
    // Header replacement: only on the FIRST occurrence of a score_line, so a
    // later paragraph that happens to start with "物理明显不一致" stays untouched.
    if (!headerReplaced && allHeaders.some(h => line === h || line.startsWith(h))) {
      const suffix = allHeaders.reduce((acc, h) => {
        if (acc !== null) return acc;
        if (line === h) return "";
        if (line.startsWith(h)) return line.slice(h.length);
        return null;
      }, null);
      outLines.push(newHeader + (suffix ?? ""));
      headerReplaced = true;
      continue;
    }
    // Sub-bullet replacement: identify which sub this line describes by matching
    // any of that sub's possible phrases; then swap the phrase for the current
    // value's phrase (or drop the bullet if the sub is now 2/passes).
    let handled = false;
    for (const [subKey, _subLabel, statusMap] of cfg.subs) {
      for (const oldPhrase of Object.values(statusMap)) {
        const m = line.match(new RegExp("^(\\s*)" + escapeRegex(oldPhrase) + "([：:]\\s*)(.*)$"));
        if (m) {
          const [, indent, sep, tail] = m;
          const v = getSubTri(prefix + subKey);
          const newPhrase = statusMap[v];
          if (newPhrase) outLines.push(`${indent}${newPhrase}${sep}${tail}`);
          // else v === 2 → drop this bullet (passes doesn't emit)
          seenSubKeys.add(subKey);
          handled = true;
          break;
        }
      }
      if (handled) break;
    }
    if (!handled) outLines.push(line);
  }
  // Append bullets for subs that need one but weren't present in the existing note
  // (e.g. user just moved a sub from 2 → 0/1). Preserve stable order from AUTO_NOTE.
  for (const [subKey, _subLabel, statusMap] of cfg.subs) {
    if (seenSubKeys.has(subKey)) continue;
    const v = getSubTri(prefix + subKey);
    const phrase = statusMap[v];
    if (phrase) outLines.push(`\t${phrase}：`);
  }
  // If the note never had a header line (unusual), prepend the new one.
  if (!headerReplaced && newHeader) outLines.unshift(newHeader);
  noteEl.value = outLines.join("\n");
}

function escapeRegex(s) { return String(s).replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); }

function wireAutoNote(prefix) {
  for (const axis of Object.keys(AUTO_NOTE)) {
    const cfg = AUTO_NOTE[axis];
    const mainEl = document.getElementById(prefix + cfg.main_id);
    const noteEl = document.getElementById(prefix + cfg.note_id);
    if (!mainEl || !noteEl) continue;
    registerAutoNote(prefix, axis);
    mainEl.addEventListener("input", () => buildAutoNote(prefix, axis));
  }
}

// Single global listener: any sub-tri change triggers rebuild for every registered form.
document.addEventListener("autonote:refresh", () => {
  for (const key of _AUTO_NOTE_REGISTRY) {
    const [prefix, axis] = key.split("|");
    buildAutoNote(prefix, axis);
  }
});

/* ===================== Gold annotation page ===================== */
let GOLD_CURRENT = null;

async function initGold() {
  const username = localStorage.getItem(CFG.LS_USER);
  const role = localStorage.getItem(CFG.LS_ROLE);
  if (!username) { window.location.href = "index.html"; return; }
  document.getElementById("who").textContent = username;
  applyRolePill(username, role);
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
  wireAutoNote("");     // v85j note prefill (gold form shares annotate-form ids)
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
  applyRolePill(username, role);
  // Role gate (v85aw): is_reviewer flag + admin. Authors without the reviewer stack don't
  // get a review queue; if they navigate here directly we surface a clear role gate.
  const isReviewer = localStorage.getItem("ewj_is_reviewer") === "1" || role === "reviewer";
  const allowedReview = isReviewer || role === "admin" || username === "masiyuan";
  if (!allowedReview) {
    renderRoleGate("审核员 / 管理员");
    return;
  }
  for (const id of ["m-physical_adherence", "m-instruction_alignment"]) {
    const inp = document.getElementById(id);
    const out = document.getElementById(id + "-out");
    if (inp && out) inp.addEventListener("input", () => out.value = inp.value);
  }
  wireScoreHint("m-physical_adherence", "m-physical_adherence-hint", "pa");
  wireScoreHint("m-instruction_alignment", "m-instruction_alignment-hint", "ia");
  // v85cm: single adaptive action button. Modify fields are always visible + pre-filled
  // with annotator's originals. Reviewer edits scores/subs freely; button label auto-updates
  // to reflect the decision the backend (`_auto_decision`) will assign:
  //   no changes                                 → 通过 / Approve
  //   any change AND |ΔPA|+|ΔIA| < 2             → 修改 / Modify (minor)
  //   |ΔPA|+|ΔIA| >= 2                           → 打回 / Reject (major)
  // Backend is authoritative (Ham `_auto_decision`); this is display-only preview.
  const actionBtn = document.getElementById("action-btn");
  const recomputeActionLabel = () => reviewActionLabel(actionBtn);
  // Live listeners: main sliders, sub-tri hidden inputs, notes textareas.
  for (const id of ["m-physical_adherence", "m-instruction_alignment"]) {
    document.getElementById(id)?.addEventListener("input", recomputeActionLabel);
  }
  for (const id of ["m-agent_consistency","m-scene_consistency","m-interaction_realism",
                    "m-agent_match","m-object_correct","m-goal_completed"]) {
    // sub-tri change fires on button click via setSubTri → attach to the hidden input's parent tri buttons.
    const wrap = document.querySelector(`.sub-tri[data-key="${id}"]`);
    if (wrap) {
      wrap.querySelectorAll(".sub-tri-btn").forEach(b => b.addEventListener("click", () => {
        // setSubTri handles the value update; run label refresh on next tick so read is stable.
        setTimeout(recomputeActionLabel, 0);
      }));
    }
  }
  actionBtn?.addEventListener("click", () => {
    const decision = actionBtn.dataset.decision || "approve";
    submitReview(decision);
  });
  document.getElementById("retry-btn").addEventListener("click", () => loadNextReview());
  wireVideoFallback(document.getElementById("gen-video"), { onSkip: () => loadNextReview() });
  // v85be: report-data-issue flow mirrored from task.html (skip removed per siyuan).
  const reportBtn = document.getElementById("report-btn");
  if (reportBtn) reportBtn.addEventListener("click", () => {
    document.getElementById("report-modal").hidden = false;
  });
  const reportCancel = document.getElementById("report-cancel-btn");
  if (reportCancel) reportCancel.addEventListener("click", () => {
    document.getElementById("report-modal").hidden = true;
  });
  const reportSubmit = document.getElementById("report-submit-btn");
  if (reportSubmit) reportSubmit.addEventListener("click", async () => {
    if (!REVIEW_CURRENT) return;
    const issue_type = document.getElementById("report-type").value;
    const note = document.getElementById("report-note").value.trim();
    const btn = document.getElementById("report-submit-btn");
    btn.disabled = true;
    try {
      // v85bp: align field names with task.html report (issue_type, not 'issue').
      // Wrong key caused backend validation to drop the report → no advance.
      // Also use the `report:true` action key task.html uses — same route on Ham's side.
      const r = await fetch(CFG.APPS_SCRIPT_URL + "/", {
        method: "POST", headers: { "Content-Type": "text/plain" },
        body: JSON.stringify({ report: true, user: localStorage.getItem(CFG.LS_USER),
          item_id: REVIEW_CURRENT.item_id || REVIEW_CURRENT.id, issue_type, note, source: "review" }),
      });
      const d = await r.json().catch(() => ({}));
      if (!r.ok || d?.ok === false) throw new Error(d?.error || "HTTP " + r.status);
      toast(tr("report.submitted_toast"), "ok");
      document.getElementById("report-modal").hidden = true;
      document.getElementById("report-note").value = "";
      await loadNextReview();   // advance to next review item
    } catch (err) {
      toast("Report failed: " + err.message, "err");
    } finally {
      btn.disabled = false;
    }
  });
  wireSubTriButtons();  // 6 sub-tri groups in review modify form
  wireAutoNote("m-");   // v85j note prefill (review modify panel uses m- prefix)
  refreshReviewProgress();   // v85bd: per-user review_quota chip (only siyuanw today)
  // v85bc: my_reviews?as=reviewer "Re-decide" deep-link lands here with edit_review=ITEM.
  // Load that specific past decision for the reviewer to re-submit.
  const editId = new URLSearchParams(window.location.search).get("edit_review");
  if (editId) {
    await loadReviewForEdit(editId);
  } else {
    await loadNextReview();
  }
}

/* v85bd → v85ck: per-user review KPI progress.
   Ham's review-week fields: stats.review_target_today (20 for 6 regular reviewers,
   5 for siyuanw, null for non-reviewers), stats.review_done_today, stats.testset_review_coverage
   = {reviewed, remaining, total}. */
async function refreshReviewProgress() {
  const user = localStorage.getItem(CFG.LS_USER);
  if (!user) return;
  try {
    const r = await fetch(`${CFG.APPS_SCRIPT_URL}/?action=stats&user=${encodeURIComponent(user)}`);
    const d = await r.json();
    const wrap = document.getElementById("review-progress");
    if (!wrap) return;
    const quota = d?.review_target_today ?? d?.review_quota;
    if (quota == null) { wrap.hidden = true; } else {
      const today = Number(d?.review_done_today ?? d?.review_today ?? 0);
      document.getElementById("review-today").textContent = today;
      document.getElementById("review-quota").textContent = quota;
      wrap.hidden = false;
      wrap.classList.toggle("met", today >= quota);
    }
    // v85ck: test-set coverage progress bar (visible to reviewer + admin).
    const cov = d?.testset_review_coverage;
    const covEl = document.getElementById("review-coverage");
    if (covEl) {
      if (cov && typeof cov.total === "number" && cov.total > 0) {
        const done = Number(cov.reviewed ?? 0);
        const total = Number(cov.total);
        const pct = Math.round((done / total) * 100);
        covEl.innerHTML = `<span data-i18n="review.coverage">test 覆盖</span> <strong>${done}</strong>/<strong>${total}</strong> (${pct}%)`;
        covEl.hidden = false;
      } else {
        covEl.hidden = true;
      }
    }
  } catch (_) { /* silent */ }
}

/* v85bh: queue-remaining chip — fed by Ham's review_next.remaining (per-reviewer total). */
function setReviewRemaining(n) {
  const wrap = document.getElementById("review-remaining");
  if (!wrap) return;
  if (n == null) { wrap.hidden = true; return; }
  document.getElementById("review-pending").textContent = n;
  wrap.hidden = false;
}

async function loadReviewForEdit(itemId) {
  hide("error"); hide("item"); show("loading");
  const user = localStorage.getItem(CFG.LS_USER);
  try {
    const r = await fetch(`${CFG.APPS_SCRIPT_URL}/?action=my_review_work&user=${encodeURIComponent(user)}`);
    const d = await r.json();
    const list = d.reviews || d.items || [];
    const it = list.find(x => x.item_id === itemId);
    if (!it) { showError(tr("review.edit_not_found")); return; }
    // Backend my_review_work shape → REVIEW_CURRENT shape used by renderReviewItem.
    REVIEW_CURRENT = {
      item_id: it.item_id,
      target: it.target,
      kind: it.kind,
      is_report: !!it.is_report,
      dataset: it.dataset, task: it.task, episode: it.episode,
      instruction: it.instruction, instruction_cn: it.instruction_cn,
      video_url: it.video_url, video_sources: it.video_sources,
      init_frame_url: it.init_frame_url,
      annotation: it.original,
      _prev_final: it.final,
      _prev_decision: it.decision,
    };
    renderReviewItem(REVIEW_CURRENT);
    hide("loading"); show("item");
    document.getElementById("modify-fields").hidden = true;
  } catch (err) {
    showError("Failed to load review item: " + err.message);
  }
}

let REVIEW_PENDING_DECISION = null;  // tracks which button opened the modify form

async function loadNextReview() {
  hide("error"); hide("item"); show("loading");
  const user = localStorage.getItem(CFG.LS_USER);
  try {
    const res = await fetch(`${CFG.APPS_SCRIPT_URL}/?action=review_next&user=${encodeURIComponent(user)}`);
    const data = await res.json().catch(() => ({}));
    // v85bb: KPI gate. Ham returns {ok:false, code:"yesterday_kpi_not_met", count, quota}
    // when the reviewer hasn't met yesterday's annotation KPI. Show the banner, hide everything else.
    if (data?.code === "yesterday_kpi_not_met") {
      hide("loading"); hide("item");
      const banner = document.getElementById("kpi-banner");
      if (banner) {
        document.getElementById("kpi-count").textContent = data.count ?? 0;
        document.getElementById("kpi-quota").textContent = data.quota ?? "—";
        banner.hidden = false;
      }
      return;
    }
    if (data.error) throw new Error(data.error);
    if (data.done) {
      // v85bi: differentiate "you hit your daily cap" (siyuanw 5/day) from "queue empty".
      // v85bq: render as the green success card, not the red error card.
      showError(data.review_cap_reached ? tr("review.cap_reached") : tr("review.queue_empty"), {success: true});
      return;
    }
    REVIEW_CURRENT = data;
    renderReviewItem(data);
    hide("loading"); show("item");
    document.getElementById("modify-fields").hidden = true;
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
  // v85ck: AI anomaly flag ⚠ — Ham's System-A. red = solid ⚠ (high severity), yellow = outline.
  const flagEl = document.getElementById("ai-flag-badge");
  if (flagEl) {
    if (it.ai_flag) {
      const sev = it.ai_severity === "red" ? "high" : "mid";
      const glyph = sev === "high" ? "⚠" : "⚠";
      flagEl.className = `ai-flag ai-flag-${sev}`;
      flagEl.textContent = `${glyph} ${sev === "high" ? tr("review.ai_flag.high") : tr("review.ai_flag.mid")}`;
      flagEl.title = it.ai_reason || "";
      flagEl.hidden = false;
    } else {
      flagEl.hidden = true;
    }
  }
  // v85be: show annotator id (siyuan: 把标注者 id 给显示出来) — previously anonymized.
  const annEl = document.getElementById("orig-annotator");
  if (annEl) annEl.textContent = it.target || it.annotator || "—";
  // v85bh: queue-remaining chip from Ham's review_next.remaining.
  if (typeof it.remaining === "number") setReviewRemaining(it.remaining);
  const reviewGen = document.getElementById("gen-video");
  reviewGen.src = pickVideoUrl(it.video_sources, it.video_url);
  bindVideoSources(reviewGen, it.video_sources);
  reviewGen.load();
  setInitFrame(it.init_frame_url, "");
  // v85aa: Ham added init_frame_url + instruction + instruction_cn to review_next,
  // so reuse the standard fetchPrompt path (handles inline + HF fallback + lang toggle).
  document.getElementById("prompt-text").textContent = "(loading instruction…)";
  fetchPrompt(it);
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
  // v85be: preserve newlines from the prefilled multi-line notes — escapeHtml drops them
  // visually otherwise. Tabs come through via CSS white-space:pre-wrap on .notes.
  const nl2br = s => escapeHtml(s).replace(/\n/g, "<br>");
  document.getElementById("orig-notes").innerHTML = (pNote || iNote)
    ? `<strong>Physical:</strong> ${nl2br(pNote || "—")}<br><strong>Instruction:</strong> ${nl2br(iNote || "—")}`
    : "(no notes)";
  fetchPrompt(it);
  // v85cm: pre-fill modify-fields with annotator's originals so the single adaptive
  // action-btn starts as "通过" (no delta). Reviewer edits → button switches to 修改/Reject.
  for (const id of ["physical_adherence", "instruction_alignment"]) {
    const v = payload[id] ?? 3;
    const inp = document.getElementById("m-" + id);
    const out = document.getElementById("m-" + id + "-out");
    if (inp) inp.value = v;
    if (out) out.value = v;
    // Refresh score-hint level class.
    const hint = document.getElementById("m-" + id + "-hint");
    if (hint) { hint.className = `score-hint level-${v}`; }
  }
  for (const id of ["agent_consistency","scene_consistency","interaction_realism",
                    "agent_match","object_correct","goal_completed"]) {
    setSubTri("m-" + id, payload[id] ?? 2);
  }
  document.getElementById("m-physical_notes").value = "";
  document.getElementById("m-instruction_notes").value = "";
  // Reset button to 通过 (no delta at initial state).
  reviewActionLabel(document.getElementById("action-btn"));
}

// v85cm: derive display decision from current form state vs original annotation.
// Must mirror Ham's `_auto_decision` (backend authoritative). Rule B:
//   no scoresChanged → approve; L1 <  2 → minor; L1 >= 2 → major.
// Notes-only changes do NOT count as scoresChanged (per siyuan).
function reviewCurrentDelta() {
  const orig = REVIEW_CURRENT?.annotation || REVIEW_CURRENT?.annotation_payload || {};
  const cur = {};
  for (const id of ["physical_adherence", "instruction_alignment"]) {
    cur[id] = Number(document.getElementById("m-" + id)?.value);
  }
  for (const id of ["agent_consistency","scene_consistency","interaction_realism",
                    "agent_match","object_correct","goal_completed"]) {
    cur[id] = getSubTri("m-" + id);
  }
  const dPA = Math.abs((cur.physical_adherence ?? 0) - (Number(orig.physical_adherence) || 0));
  const dIA = Math.abs((cur.instruction_alignment ?? 0) - (Number(orig.instruction_alignment) || 0));
  let subChanged = false;
  for (const id of ["agent_consistency","scene_consistency","interaction_realism",
                    "agent_match","object_correct","goal_completed"]) {
    if ((cur[id] ?? 2) !== (orig[id] ?? 2)) subChanged = true;
  }
  return { dPA, dIA, subChanged, cur };
}

function reviewActionLabel(btn) {
  if (!btn) return;
  const { dPA, dIA, subChanged } = reviewCurrentDelta();
  const scoresChanged = dPA > 0 || dIA > 0 || subChanged;
  const l1 = dPA + dIA;
  let decision, key;
  if (!scoresChanged) { decision = "approve"; key = "review.action.approve"; }
  else if (l1 >= 2)   { decision = "major";   key = "review.action.reject";  }
  else                { decision = "minor";   key = "review.action.modify";  }
  btn.dataset.decision = decision;
  btn.classList.remove("warn", "danger");
  if (decision === "minor") btn.classList.add("warn");
  if (decision === "major") btn.classList.add("danger");
  btn.textContent = tr(key);
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
  // v85cm: always send the current final_payload from the modify-fields (which are always
  // visible + prefilled with originals). Backend `_auto_decision` derives decision from
  // (orig vs final) regardless of what we send in `decision`. Notes required only when
  // scores actually changed vs originals (approve = no note required).
  {
    const physical_notes = document.getElementById("m-physical_notes").value.trim();
    const instruction_notes = document.getElementById("m-instruction_notes").value.trim();
    if (decision !== "approve" && (!physical_notes || !instruction_notes)) {
      toast(tr("toast.modify_note_required"), "err");
      return;
    }
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
    const data = await res.json().catch(() => ({}));
    if (!res.ok || (data && data.ok === false)) {
      // v85bg: Ham's 400 code:edit_required when reviewer submits minor/major without
      // actually changing the scores. Recoverable — toast and keep the form open.
      if (data?.code === "edit_required") {
        toast(tr("review.edit_required"), "err");
        return;
      }
      throw new Error(data?.error || "HTTP " + res.status);
    }
    refreshReviewProgress();  // v85bd: bump today/quota chip after each decision
    await loadNextReview();
  } catch (err) {
    showError("Review submit failed: " + err.message);
  }
}

/* ===================== Arbitration (meta-reviewer) page =====================
   v85bn: siyuanw + masiyuan only — final-say on reviewer rejections.
   Backend (Ham): arbitration_queue → list of rejected reviews pending meta call;
   arbitration_submit → POST {meta_reviewer, item_id, reviewer, decision:uphold|overturn|modify, final_payload?, note?}.
   Three decisions:
     - uphold:   reviewer's reject stays final
     - overturn: cancel reject → annotator's original is accepted
     - modify:   meta writes own final_payload (overrides both)
*/
let ARB_CURRENT = null;

async function initArbitration() {
  const user = localStorage.getItem(CFG.LS_USER);
  const role = localStorage.getItem(CFG.LS_ROLE);
  if (!user) { window.location.href = "index.html"; return; }
  document.getElementById("who").textContent = user;
  applyRolePill(user, role);
  // Role gate — Ham's is_meta_reviewer flag (siyuanw, masiyuan). Anyone else gets bounced.
  let isMeta = false;
  try {
    const r = await fetch(`${CFG.APPS_SCRIPT_URL}/?action=stats&user=${encodeURIComponent(user)}`);
    const d = await r.json();
    isMeta = !!d?.is_meta_reviewer;
  } catch (_) {}
  if (!isMeta) {
    renderRoleGate(tr("arbitration.role_required"));
    return;
  }
  for (const id of ["mr-physical_adherence", "mr-instruction_alignment"]) {
    const inp = document.getElementById(id);
    const out = document.getElementById(id + "-out");
    if (inp && out) inp.addEventListener("input", () => out.value = inp.value);
  }
  wireScoreHint("mr-physical_adherence", "mr-physical_adherence-hint", "pa");
  wireScoreHint("mr-instruction_alignment", "mr-instruction_alignment-hint", "ia");
  wireSubTriButtons();
  // v85ck: tab switcher — 仲裁队列 (existing) vs 全览 (all reviews for meta).
  document.querySelectorAll(".arb-tab").forEach(btn => btn.addEventListener("click", () => {
    document.querySelectorAll(".arb-tab").forEach(b => b.classList.toggle("active", b === btn));
    switchArbTab(btn.dataset.tab);
  }));
  const onlyFlaggedEl = document.getElementById("ar-only-flagged");
  if (onlyFlaggedEl) onlyFlaggedEl.addEventListener("change", () => loadAllReviews());
  document.getElementById("uphold-btn").addEventListener("click", () => submitArbitration("uphold"));
  document.getElementById("overturn-btn").addEventListener("click", () => submitArbitration("overturn"));
  // Modify opens the meta-reviewer's own scoring form, prefilled with reviewer's final values;
  // second click submits. Mirrors the two-step pattern from review.html minor/major.
  document.getElementById("modify-btn").addEventListener("click", () => openMetaModifyForm());
  document.getElementById("retry-btn").addEventListener("click", () => loadNextArbitration());
  wireVideoFallback(document.getElementById("gen-video"), { onSkip: () => loadNextArbitration() });
  await loadNextArbitration();
}

let ARB_MODIFY_OPEN = false;
function openMetaModifyForm() {
  const fields = document.getElementById("modify-fields");
  if (fields.hidden) {
    // Prefill with reviewer's final (the meta-reviewer is most likely to tweak the reject).
    const rev = ARB_CURRENT?.reviewer_payload || ARB_CURRENT?.reviewer_final || {};
    for (const id of ["physical_adherence", "instruction_alignment"]) {
      const v = rev[id] ?? 3;
      document.getElementById("mr-" + id).value = v;
      document.getElementById("mr-" + id + "-out").value = v;
    }
    for (const id of ["agent_consistency", "scene_consistency", "interaction_realism", "agent_match", "object_correct", "goal_completed"]) {
      setSubTri("mr-" + id, rev[id] ?? 2);
    }
    document.getElementById("mr-physical_notes").value = "";
    document.getElementById("mr-instruction_notes").value = "";
    fields.hidden = false;
    ARB_MODIFY_OPEN = true;
    const btn = document.getElementById("modify-btn");
    btn.textContent = tr("arbitration.modify_submit");
  } else {
    submitArbitration("modify");
  }
}

async function loadNextArbitration() {
  hide("error"); hide("item"); show("loading");
  const user = localStorage.getItem(CFG.LS_USER);
  try {
    const r = await fetch(`${CFG.APPS_SCRIPT_URL}/?action=arbitration_queue&user=${encodeURIComponent(user)}`);
    const d = await r.json();
    if (d?.ok === false) throw new Error(d.error || "fetch failed");
    // v85bt: Ham's contract returns {pending, fallback, count, fallback_count} — not `items`.
    // pending = items assigned to this meta; fallback = both-meta-conflict items finalizer takes.
    const items = d.pending || d.items || [];
    setArbRemaining(typeof d.count === "number" ? d.count : items.length);
    if (items.length === 0) {
      showError(tr("arbitration.queue_empty"), {success: true});
      return;
    }
    ARB_CURRENT = items[0];
    renderArbitrationItem(ARB_CURRENT);
    document.getElementById("modify-fields").hidden = true;
    ARB_MODIFY_OPEN = false;
    document.getElementById("modify-btn").textContent = tr("arbitration.modify");
    hide("loading"); show("item");
  } catch (err) {
    showError("Failed to load arbitration: " + err.message);
  }
}

function setArbRemaining(n) {
  const wrap = document.getElementById("arb-remaining");
  if (!wrap) return;
  document.getElementById("arb-pending").textContent = n;
  wrap.hidden = false;
}

/* v85ck: switch between 仲裁队列 (existing arbitration_queue) and 全览 (meta_all_reviews). */
function switchArbTab(tab) {
  const disputeSections = ["loading","item","error"];
  const allReviewsSection = document.getElementById("all-reviews");
  if (tab === "allreviews") {
    disputeSections.forEach(id => { const el = document.getElementById(id); if (el) el.hidden = true; });
    if (allReviewsSection) allReviewsSection.hidden = false;
    loadAllReviews();
  } else {
    if (allReviewsSection) allReviewsSection.hidden = true;
    loadNextArbitration();
  }
}

async function loadAllReviews() {
  const user = localStorage.getItem(CFG.LS_USER);
  if (!user) return;
  const list = document.getElementById("ar-list");
  const empty = document.getElementById("ar-empty");
  const countEl = document.getElementById("ar-count");
  const onlyFlagged = document.getElementById("ar-only-flagged")?.checked ? 1 : 0;
  list.innerHTML = "";
  try {
    const r = await fetch(`${CFG.APPS_SCRIPT_URL}/?action=meta_all_reviews&user=${encodeURIComponent(user)}&only_flagged=${onlyFlagged}`);
    const d = await r.json();
    if (d?.ok === false) throw new Error(d.error || "fetch failed");
    const reviews = d.reviews || d.items || [];
    countEl.textContent = onlyFlagged
      ? `${reviews.length} ${tr("arbitration.flagged_count")}`
      : `${reviews.length} ${tr("arbitration.total_count")}`;
    if (reviews.length === 0) { empty.hidden = false; return; }
    empty.hidden = true;
    for (const rr of reviews) list.appendChild(renderAllReviewsRow(rr));
  } catch (err) {
    countEl.textContent = err.message;
  }
}

function renderAllReviewsRow(rr) {
  const li = document.createElement("li");
  const dec = rr.decision === "modify" ? "minor" : (rr.decision || "approve");
  const flag = rr.ai_flag ? `<span class="ai-flag ai-flag-${rr.ai_severity === "red" ? "high" : "mid"}" title="${escapeHtml(rr.ai_reason || "")}">⚠ ${rr.ai_severity === "red" ? tr("review.ai_flag.high") : tr("review.ai_flag.mid")}</span>` : "";
  const target = rr.target || "—";
  const reviewer = rr.reviewer || "—";
  const ts = String(rr.ts || "").slice(0, 16).replace("T", " ");
  li.className = `ar-row ${rr.ai_flag ? "ar-flagged" : ""} ar-${dec}`;
  li.innerHTML = `
    <div class="meta">
      <span class="row-badge decision-${dec}">${tr("review.decision." + dec)}</span>
      ${flag}
      <span class="tag">${escapeHtml(rr.dataset || "?")}</span>
      <span class="tag">${escapeHtml(rr.task || "?")}</span>
      <span class="muted small">annotator: <strong>${escapeHtml(target)}</strong> · reviewer: <strong>${escapeHtml(reviewer)}</strong> · ${escapeHtml(ts)}</span>
    </div>
    <p class="muted small">PA ${rr.final?.physical_adherence ?? "—"} · IA ${rr.final?.instruction_alignment ?? "—"}</p>
  `;
  return li;
}

function renderArbitrationItem(it) {
  setVideoSourcesFromItem(it);
  document.getElementById("meta-dataset").textContent = it.dataset || "?";
  document.getElementById("meta-task").textContent = it.task || "?";
  // Ham: reject_ts on arbitration_queue items.
  document.getElementById("meta-ts").textContent = String(it.reject_ts || it.rejection_ts || it.ts || "").slice(0, 16).replace("T", " ");
  // v85bo: Ham's actual field is `target` for the annotator on arbitration_queue.
  document.getElementById("arb-annotator").textContent = it.target || it.annotator || "—";
  document.getElementById("arb-reviewer").textContent = it.reviewer || "—";
  const v = document.getElementById("gen-video");
  v.src = pickVideoUrl(it.video_sources, it.video_url || "");
  bindVideoSources(v, it.video_sources);
  v.load();
  setInitFrame(it.init_frame_url, "");
  CURRENT_INSTRUCTION = {
    video_url: it.video_url, targetId: "prompt-text",
    en: it.instruction || "", cn: it.instruction_cn || "",
  };
  if (CURRENT_INSTRUCTION.en || CURRENT_INSTRUCTION.cn) applyCurrentInstruction();
  else fetchInstructionInto(it.video_url, "prompt-text");
  // Ham contract: annotator_payload (annotator's submitted scores) + reviewer_payload (reviewer's final, post-reject).
  const ann = it.annotator_payload || it.annotation_original || it.annotation || {};
  const rev = it.reviewer_payload || it.reviewer_final || {};
  const subKeys = ["agent_consistency", "scene_consistency", "interaction_realism", "agent_match", "object_correct", "goal_completed"];
  const subLine = (p, keys) => keys.map(k => `${k.split("_")[0]}=${p?.[k] ?? "—"}`).join(", ");
  const physKeys = ["agent_consistency", "scene_consistency", "interaction_realism"];
  const instrKeys = ["agent_match", "object_correct", "goal_completed"];
  document.getElementById("ann-physical_adherence").textContent = ann.physical_adherence ?? "—";
  document.getElementById("ann-instruction_alignment").textContent = ann.instruction_alignment ?? "—";
  document.getElementById("ann-psubs").textContent = subLine(ann, physKeys);
  document.getElementById("ann-isubs").textContent = subLine(ann, instrKeys);
  const nl2br = s => escapeHtml(s).replace(/\n/g, "<br>");
  document.getElementById("ann-notes").innerHTML = (ann.physical_notes || ann.instruction_notes)
    ? `<strong>P:</strong> ${nl2br(ann.physical_notes || "—")}<br><strong>I:</strong> ${nl2br(ann.instruction_notes || "—")}`
    : "(no notes)";
  document.getElementById("rev-physical_adherence").textContent = rev.physical_adherence ?? "—";
  document.getElementById("rev-instruction_alignment").textContent = rev.instruction_alignment ?? "—";
  document.getElementById("rev-psubs").textContent = subLine(rev, physKeys);
  document.getElementById("rev-isubs").textContent = subLine(rev, instrKeys);
  document.getElementById("rev-notes").innerHTML = (rev.physical_notes || rev.instruction_notes)
    ? `<strong>P:</strong> ${nl2br(rev.physical_notes || "—")}<br><strong>I:</strong> ${nl2br(rev.instruction_notes || "—")}`
    : "(no notes)";
}

async function submitArbitration(decision) {
  if (!ARB_CURRENT) return;
  // Modify requires the form to be open + filled.
  if (decision === "modify" && !ARB_MODIFY_OPEN) { openMetaModifyForm(); return; }
  const meta_reviewer = localStorage.getItem(CFG.LS_USER);
  const note = document.getElementById("arb-note").value.trim();
  const body = {
    arbitration_submit: true,
    meta_reviewer,
    item_id: ARB_CURRENT.item_id,
    // Ham contract: include target (the annotator being arbitrated about) alongside reviewer.
    target: ARB_CURRENT.target || ARB_CURRENT.annotator,
    reviewer: ARB_CURRENT.reviewer,
    decision,
    note,
  };
  if (decision === "modify") {
    body.final_payload = {
      physical_adherence: Number(document.getElementById("mr-physical_adherence").value),
      instruction_alignment: Number(document.getElementById("mr-instruction_alignment").value),
      physical_notes: document.getElementById("mr-physical_notes").value.trim(),
      instruction_notes: document.getElementById("mr-instruction_notes").value.trim(),
      subs_v: 2,
    };
    for (const k of ["agent_consistency", "scene_consistency", "interaction_realism", "agent_match", "object_correct", "goal_completed"]) {
      body.final_payload[k] = getSubTri("mr-" + k);
    }
  }
  try {
    const r = await fetch(CFG.APPS_SCRIPT_URL + "/", {
      method: "POST", headers: { "Content-Type": "text/plain" },
      body: JSON.stringify(body),
    });
    const d = await r.json().catch(() => ({}));
    if (!r.ok || d?.ok === false) throw new Error(d?.error || "HTTP " + r.status);
    document.getElementById("arb-note").value = "";
    await loadNextArbitration();
  } catch (err) {
    showError("Arbitration submit failed: " + err.message);
  }
}

/* ===================== My reviews page ===================== */
async function initMyReviews() {
  const user = localStorage.getItem(CFG.LS_USER);
  if (!user) { window.location.href = "index.html"; return; }
  document.getElementById("who").textContent = user;
  applyRolePill(user, localStorage.getItem(CFG.LS_ROLE));
  const params = new URLSearchParams(window.location.search);
  const kindFilter = params.get("kind");
  // v85bc: when entered via ?as=reviewer, swap to "reviews I did" mode.
  const asReviewer = params.get("as") === "reviewer";
  if (asReviewer) return initMyReviewWork(user);
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

/* v85bc: reviewer history (my_reviews.html?as=reviewer) — decisions THIS user made,
   not reviews of their annotations. Per siyuan: 可以看到和修改 — edit button takes the
   reviewer back to review.html with the item preloaded for re-decision. */
async function initMyReviewWork(user) {
  const h1 = document.querySelector("header.bar h1");
  if (h1) h1.textContent = tr("my_reviews.work_title");
  // Hide the legacy "reviewed history" stats summary — those numbers are about reviews
  // OF the user (annotator-side), not reviews BY the user.
  const summary = document.getElementById("my-summary");
  if (summary) summary.hidden = true;
  try {
    const r = await fetch(`${CFG.APPS_SCRIPT_URL}/?action=my_review_work&user=${encodeURIComponent(user)}`);
    const d = await r.json();
    if (d?.ok === false) throw new Error(d.error || "fetch failed");
    document.getElementById("my-loading").hidden = true;
    const list = d.reviews || d.items || [];
    if (list.length === 0) {
      document.getElementById("my-empty").hidden = false;
      const empty = document.getElementById("my-empty");
      if (empty) empty.textContent = tr("my_reviews.work_empty");
    } else {
      if (list[0]) setVideoSourcesFromItem(list[0]);
      const ul = document.getElementById("my-list");
      ul.innerHTML = "";
      for (const it of list) ul.appendChild(renderReviewWorkRow(it));
      ul.hidden = false;
    }
  } catch (err) {
    document.getElementById("my-loading").hidden = true;
    document.getElementById("my-err-msg").textContent = err.message;
    document.getElementById("my-error").hidden = false;
  }
}

function renderReviewWorkRow(it) {
  const li = document.createElement("li");
  const dec = it.decision === "modify" ? "minor" : (it.decision || "approve");
  const isApprove = dec === "approve";
  const isMajor = dec === "major";
  li.className = "my-row " + (isApprove ? "approved" : (isMajor ? "rejected" : "modified"));
  const decisionLbl = tr("review.decision." + dec);
  const ts = it.ts || "";
  const fin = it.final || it.review_payload || {};
  const orig = it.original || {};
  const target = it.target || "—";
  const initFrame = it.init_frame_url
    ? `<img src="${escapeHtml(it.init_frame_url)}" alt="init frame" class="ma-thumb" loading="lazy">`
    : "";
  const editBtn = it.editable
    ? `<a class="btn-edit" href="review.html?edit_review=${encodeURIComponent(it.item_id)}">✏ ${tr("my_reviews.edit_btn")}</a>`
    : `<span class="muted small">${tr("my_annotations.locked")}</span>`;
  // v85bn: arbitration outcome on reviewer's past major decisions.
  const arbDec = it.arbitration_decision;
  const arbBadge = arbDec ? `<span class="row-badge arb-${arbDec}" title="${tr("arbitration.tag")}">${tr("arbitration.badge." + arbDec)}</span>` : "";
  // v85bo: reviewer accuracy signal from Ham.
  const accuracy = it.reviewer_accuracy;
  const accBadge = accuracy ? `<span class="row-badge acc-${accuracy}" title="${tr("review.accuracy")}">${tr("review.accuracy." + accuracy)}</span>` : "";
  // v85cn: reuse renderReviewRow's click-to-expand detail so reviewers can inspect their own
  // submission (scores + subs + notes) side-by-side with the annotator's original, and play
  // the video. Previously only the two main scores were shown → siyuan reported "无法显示审核内容".
  const subsP = ["agent_consistency","scene_consistency","interaction_realism"];
  const subsI = ["agent_match","object_correct","goal_completed"];
  function subBadges(p, keys) {
    return keys.map(k => {
      const v = p[k];
      if (v === undefined || v === null) return "";
      const glyph = v === 0 ? "✗" : (v === 1 ? "⚠" : "✓");
      const cls = v === 0 ? "no" : (v === 1 ? "partial" : "yes");
      return `<span class="sub-badge ${cls}" title="${k}">${glyph} ${k.replace(/_/g," ")}</span>`;
    }).join("");
  }
  const physChanged = !isApprove && (fin.physical_adherence ?? fin.quality) !== (orig.physical_adherence ?? orig.quality);
  const instChanged = !isApprove && (fin.instruction_alignment ?? fin.faithful) !== (orig.instruction_alignment ?? orig.faithful);
  const nChanged = !isApprove && (
    (orig.physical_notes || orig.notes || "") !== (fin.physical_notes || fin.notes || "") ||
    (orig.instruction_notes || "") !== (fin.instruction_notes || "")
  );
  li.innerHTML = `
    <header class="row-head">
      <span class="row-decision">${decisionLbl}</span>${arbBadge}${accBadge}
      <span class="row-meta">${escapeHtml(it.dataset || "?")} · ${escapeHtml(it.task || "?")}</span>
      <span class="row-spacer"></span>
      <span class="row-by muted">→ <strong>${escapeHtml(target)}</strong></span>
      <time class="row-ts muted">${escapeHtml(String(ts).slice(0, 16).replace("T", " "))}</time>
      <span class="row-chev" aria-hidden="true">▾</span>
    </header>
    <div class="row-detail" hidden>
      ${initFrame ? `<div class="detail-initframe">${initFrame}</div>` : ""}
      <div class="detail-grid">
        <div class="detail-card detail-orig">
          <h4>Annotator's submission</h4>
          <p>Physical: <strong>${orig.physical_adherence ?? orig.quality ?? "—"}</strong> · Instruction: <strong>${orig.instruction_alignment ?? orig.faithful ?? "—"}</strong></p>
          <p class="sub-line">${subBadges(orig, subsP)}${subBadges(orig, subsI)}</p>
          ${renderNotesBlock(orig)}
        </div>
        <div class="detail-arrow">→</div>
        <div class="detail-card detail-final ${isApprove ? "unchanged" : ""}">
          <h4>${isApprove ? "Your review (approved as-is)" : "Your review (modified)"}</h4>
          <p>Physical: <strong class="${physChanged ? "diff" : ""}">${fin.physical_adherence ?? fin.quality ?? "—"}</strong> · Instruction: <strong class="${instChanged ? "diff" : ""}">${fin.instruction_alignment ?? fin.faithful ?? "—"}</strong></p>
          <p class="sub-line">${subBadges(fin, subsP)}${subBadges(fin, subsI)}</p>
          ${renderNotesBlock(fin, nChanged)}
        </div>
      </div>
      ${it.video_url ? `
        <figure class="detail-video">
          <figcaption>Generated video</figcaption>
          <video controls preload="none" muted playsinline webkit-playsinline="true" x5-playsinline="true" src="${pickVideoUrl(it.video_sources, it.video_url)}" data-sources-json='${escapeHtml(JSON.stringify(it.video_sources || []))}'></video>
        </figure>` : ""}
      <p class="detail-id muted">Item: <code>${escapeHtml(it.item_id || "")}</code></p>
      <div class="ma-foot">${editBtn}</div>
    </div>
  `;
  li.querySelector(".row-head").addEventListener("click", () => {
    const detail = li.querySelector(".row-detail");
    const open = detail.hasAttribute("hidden");
    if (open) detail.removeAttribute("hidden"); else detail.setAttribute("hidden", "");
    li.classList.toggle("expanded", open);
    if (open) {
      const v = detail.querySelector("video");
      if (v) wireVideoFallback(v);
    }
  });
  return li;
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
// v85t: gold mechanism is gone + tabs removed per siyuan → always fetch all kinds.
const MA_CURRENT_KIND = "all";

let MA_CURRENT_TAB = "all";  // v85bk: filter mode — all|pending|reviewed|rejected
let MA_ALL_ITEMS = [];      // cached for tab switching without refetch

async function initMyAnnotations() {
  const user = localStorage.getItem(CFG.LS_USER);
  if (!user) { window.location.href = "index.html"; return; }
  document.getElementById("who").textContent = user;
  const role = localStorage.getItem(CFG.LS_ROLE) || "—";
  applyRolePill(user, role);
  // v85bk: per-item unread mark (not bulk). Each rejected card marks itself when clicked.
  // Wire tab buttons.
  document.querySelectorAll(".ma-tab").forEach(btn => btn.addEventListener("click", () => {
    document.querySelectorAll(".ma-tab").forEach(b => b.classList.toggle("active", b === btn));
    MA_CURRENT_TAB = btn.dataset.tab;
    renderMyAnnotationList();
  }));
  await loadMyAnnotations();
}

function annotationStatus(it) {
  // v85bl: prefer Ham's authoritative review_status (pending|approve|minor|major).
  // Fall back to legacy reviewed + review_decision for back-compat.
  const rs = it.review_status;
  if (rs === "pending") return "pending";
  if (rs === "major") return "rejected";
  if (rs === "approve" || rs === "minor") return "reviewed";
  if (!it.reviewed) return "pending";
  const dec = it.review_decision === "modify" ? "minor" : it.review_decision;
  if (dec === "major") return "rejected";
  return "reviewed";
}

function renderMyAnnotationList() {
  const list = document.getElementById("ma-list");
  const empty = document.getElementById("ma-empty");
  list.innerHTML = "";
  const filtered = MA_CURRENT_TAB === "all"
    ? MA_ALL_ITEMS
    : MA_ALL_ITEMS.filter(it => annotationStatus(it) === MA_CURRENT_TAB);
  if (filtered.length === 0) {
    empty.hidden = false; list.hidden = true; return;
  }
  empty.hidden = true; list.hidden = false;
  for (const it of filtered) list.appendChild(renderMyAnnotationCard(it));
}

/* v85bk: rejected-item click → POST mark_rejected_seen with item_id (Ham per-item endpoint).
   Returns immediately; UI optimistically clears unseen marker locally so the counter and
   home-card badge decrement without waiting for a server refresh. */
async function markRejectedSeen(itemId) {
  const user = localStorage.getItem(CFG.LS_USER);
  if (!user || !itemId) return;
  try {
    await fetch(CFG.APPS_SCRIPT_URL + "/", {
      method: "POST", headers: { "Content-Type": "text/plain" },
      body: JSON.stringify({ mark_rejected_seen: true, user, item_id: itemId }),
    });
  } catch (_) {}
  // Locally drop "unseen" marker on this item so tab counts and the home-card badge
  // (refetched on next dashboard load) reflect the read state.
  const it = MA_ALL_ITEMS.find(x => x.item_id === itemId);
  if (it) it._rejected_seen = true;
  updateTabCounts();
}

function updateTabCounts() {
  const total = MA_ALL_ITEMS.length;
  const pending = MA_ALL_ITEMS.filter(it => annotationStatus(it) === "pending").length;
  const reviewed = MA_ALL_ITEMS.filter(it => annotationStatus(it) === "reviewed").length;
  const rejected = MA_ALL_ITEMS.filter(it => annotationStatus(it) === "rejected").length;
  const rejectedUnseen = MA_ALL_ITEMS.filter(it => annotationStatus(it) === "rejected" && !it._rejected_seen && it._rejected_unseen).length;
  const set = (id, n) => { const el = document.getElementById(id); if (el) el.textContent = n; };
  set("ma-count-all", total);
  set("ma-count-pending", pending);
  set("ma-count-reviewed", reviewed);
  // Tab-button "rejected" count uses TOTAL rejected; the in-button unread dot uses unseen.
  set("ma-count-rejected", rejected);
  const rejTab = document.querySelector('.ma-tab[data-tab="rejected"]');
  if (rejTab) rejTab.classList.toggle("has-unread", rejectedUnseen > 0);
  // v85bl: prefer Ham's authoritative stats.my_reject_rate (null when sample < 10),
  // fall back to client-side calc if stats wasn't fetched.
  const denom = reviewed + rejected;
  const rateEl = document.getElementById("ma-reject-rate");
  if (rateEl) {
    const serverRate = window.MA_SERVER_RATE;  // {my_reject_rate, n_my_reviewed, n_my_rejected}
    if (serverRate && typeof serverRate.my_reject_rate === "number") {
      const pct = Math.round(serverRate.my_reject_rate * 100);
      const r = serverRate.n_my_rejected ?? rejected;
      const d = (serverRate.n_my_reviewed ?? reviewed) + r;
      rateEl.textContent = `${pct}% (${r}/${d})`;
    } else if (serverRate && serverRate.my_reject_rate === null) {
      rateEl.textContent = `${tr("my_annotations.sample_low")} (${serverRate.n_my_rejected ?? rejected}/${(serverRate.n_my_reviewed ?? reviewed) + (serverRate.n_my_rejected ?? rejected)})`;
    } else if (denom === 0) rateEl.textContent = "—";
    else if (denom < 10) rateEl.textContent = `${tr("my_annotations.sample_low")} (${rejected}/${denom})`;
    else {
      const pct = Math.round((rejected / denom) * 100);
      rateEl.textContent = `${pct}% (${rejected}/${denom})`;
    }
  }
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
    const sUrl = `${CFG.APPS_SCRIPT_URL}/?action=stats&user=${encodeURIComponent(user)}`;
    const [r, qr, sr] = await Promise.all([fetch(url), fetch(qUrl).catch(() => null), fetch(sUrl).catch(() => null)]);
    const d = await r.json();
    if (sr) {
      try {
        const sd = await sr.json();
        window.MA_SERVER_RATE = { my_reject_rate: sd?.my_reject_rate, n_my_reviewed: sd?.n_my_reviewed, n_my_rejected: sd?.n_my_rejected };
      } catch {}
    }
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
    for (const it of items) {
      it._in_rework = reworkSet.has(it.item_id);
      // v85bk: backend marks per-item _rejected_unseen=true on items the annotator hasn't viewed
      // since the rejection. Fall back: any rejected item is "unseen" until clicked.
      it._rejected_unseen = it.rejected_unseen ?? (annotationStatus(it) === "rejected");
      it._rejected_seen = it.rejected_seen ?? false;
    }
    items.sort((a, b) => {
      if (a._in_rework !== b._in_rework) return a._in_rework ? -1 : 1;
      return (b.submitted_ts || 0) - (a.submitted_ts || 0);
    });
    MA_ALL_ITEMS = items;
    document.getElementById("ma-tabs").hidden = false;
    updateTabCounts();
    renderMyAnnotationList();
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
    : `<a class="btn-edit ma-edit-btn" href="${editHref}">✏ ${tr("my_annotations.edit_btn")}</a>`;
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
  // v85m (siyuan): my_annotations card drops the video player — only init_frame thumb
  // + instruction. Keeps the page light + signals the row is for review, not playback.
  // v85bk: rejected-unseen cards get an unread dot; clicking the card marks-as-seen.
  const isRejectedUnseen = annotationStatus(it) === "rejected" && it._rejected_unseen && !it._rejected_seen;
  const unreadDot = isRejectedUnseen ? `<span class="ma-unread-dot" title="${tr("my_annotations.unread")}"></span>` : "";
  // v85bn: meta-reviewer arbitration outcome on rejected items (uphold/overturn/modify/pending).
  const arbDec = it.arbitration_decision;
  const arbBadge = arbDec ? `<span class="row-badge arb-${arbDec}" title="${tr("arbitration.tag")}">${tr("arbitration.badge." + arbDec)}</span>` : "";
  li.innerHTML = `
    <div class="meta">${kindTag}${unreadDot}<span class="tag">${escapeHtml(it.dataset || "?")}</span><span class="tag">${escapeHtml(it.task || "?")}</span>${decisionBadge}${arbBadge}</div>
    <div class="ma-context">
      ${it.init_frame_url ? `<img class="ma-init" src="${escapeHtml(it.init_frame_url)}" alt="init frame" loading="lazy">` : ""}
      ${it.instruction || it.instruction_cn ? `<p class="ma-instr"><strong>${tr("task.instruction")}:</strong> ${escapeHtml(it.instruction_cn || it.instruction)}</p>` : ""}
    </div>
    ${diffBlock}
    <div class="ma-foot">${actionBtn}</div>
  `;
  if (isRejectedUnseen) {
    li.addEventListener("click", () => {
      li.querySelector(".ma-unread-dot")?.remove();
      markRejectedSeen(it.item_id);
    }, { once: true });
  }
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

/* v85az: paint the role pill + (when is_reviewer is set) append a secondary "审核员"
   pill so users see their stacked role. Pure reviewer (siyuanw: stats.quota===null +
   is_reviewer) shows ONLY the reviewer pill to match siyuan's framing "降为审核员".
   Callers: every page-init that sets the role pill (dashboard, task, review, etc). */
function applyRolePill(user, role) {
  const roleEl = document.getElementById("role");
  if (!roleEl) return;
  const isReviewer = localStorage.getItem("ewj_is_reviewer") === "1" || role === "reviewer";
  const quotaRaw = localStorage.getItem("ewj_quota");
  const isPureReviewer = isReviewer && (quotaRaw === "null" || quotaRaw === "0");
  // Primary pill: hide entirely for pure reviewer (the secondary pill carries her identity).
  if (isPureReviewer) {
    roleEl.hidden = true;
  } else {
    const shown = displayRole(user, role);
    roleEl.dataset.role = shown;
    roleEl.textContent = tr("role." + shown);
    roleEl.hidden = false;
  }
  // Secondary "审核员" pill — appears for anyone with the reviewer stack.
  let pill = document.getElementById("role-reviewer-pill");
  if (isReviewer) {
    if (!pill) {
      pill = document.createElement("span");
      pill.id = "role-reviewer-pill";
      pill.className = "role-pill";
      pill.dataset.role = "reviewer";
      pill.style.marginLeft = "4px";
      roleEl.insertAdjacentElement("afterend", pill);
    }
    pill.textContent = tr("role.reviewer");
    pill.hidden = false;
  } else if (pill) {
    pill.hidden = true;
  }
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
    applyRolePill(user, role);
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
  // v85bz (siyuan): video-source toggle — visible on ALL pages that have a user-chip,
  // pinned right after the countdown chip so it's easy to reach when the current video
  // hangs. Was previously injected only when >=2 hosts were in the runtime list; keep
  // that guard (nothing to cycle to otherwise) but drop it from the position rule.
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
    // v85bz: pin the 🌐 button right after the countdown chip (siyuan asked for it "挂在
    // 倒计时边上"). Falls back to before lang-btn / end of chip when there's no countdown.
    const countdown = chip.querySelector("#lb-countdown");
    if (countdown) {
      countdown.insertAdjacentElement("afterend", btn);
    } else {
      const langBtn = chip.querySelector("#lang-btn");
      if (langBtn) chip.insertBefore(btn, langBtn); else chip.appendChild(btn);
    }
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
  if (document.getElementById("dr-list")) initDataReports();
  if (document.getElementById("arb-form")) initArbitration();
  if (document.getElementById("score-dist-body")) initStats();  // v85cc
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
  // v85az: any admin (not just masiyuan) gets the create+finalize-overview UI with the
  // participant annotation surface hidden. Yu is also a pure admin and shouldn't see
  // "我标过的" / "你已标完" UI either.
  const role = localStorage.getItem(CFG.LS_ROLE);
  ALIGN_IS_ADMIN = role === "admin" || user === "masiyuan";
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
  const mineLink = document.getElementById("al-mine-link");
  if (mineLink) mineLink.addEventListener("click", () => loadMyAlignment());
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
  wireAutoNote("al-");  // v85j note prefill (align form uses al- prefix)
  // v85dj (siyuan: alignment 也可以 report 了): report-data-issue flow.
  const reportBtn = document.getElementById("al-report-btn");
  const reportModal = document.getElementById("al-report-modal");
  if (reportBtn && reportModal) {
    reportBtn.addEventListener("click", () => { reportModal.hidden = false; });
    document.getElementById("al-report-cancel-btn").addEventListener("click", () => { reportModal.hidden = true; });
    document.getElementById("al-report-submit-btn").addEventListener("click", async () => {
      if (!ALIGN_CURRENT) return;
      const btn = document.getElementById("al-report-submit-btn");
      const issue_type = document.getElementById("al-report-type").value;
      const note = document.getElementById("al-report-note").value.trim();
      btn.disabled = true;
      try {
        const r = await fetch(CFG.APPS_SCRIPT_URL + "/", {
          method: "POST", headers: { "Content-Type": "text/plain" },
          body: JSON.stringify({
            report: true, user: localStorage.getItem(CFG.LS_USER),
            item_id: ALIGN_CURRENT.id, issue_type, note,
            source: "align", campaign_id: ALIGN_CAMPAIGN_ID,
          }),
        });
        const d = await r.json().catch(() => ({}));
        if (!r.ok || d?.ok === false) throw new Error(d?.error || "HTTP " + r.status);
        toast(tr("report.submitted_toast"), "ok");
        reportModal.hidden = true;
        document.getElementById("al-report-note").value = "";
        await loadAlignNext();
      } catch (err) {
        toast(tr("toast.report_failed") + ": " + err.message, "err");
      } finally {
        btn.disabled = false;
      }
    });
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
  // siyuan v82: admin chooses item count (default 10). Backend reads n_items.
  const nItemsInput = document.getElementById("al-new-n-items");
  const n_items = nItemsInput ? Math.max(1, Math.min(500, Number(nItemsInput.value) || 10)) : 10;
  let participants;
  if (audience === "custom") {
    participants = Array.from(document.querySelectorAll(".al-custom-cb:checked")).map(cb => cb.value);
    if (participants.length === 0) { toast(tr("align.toast.no_participants"), "err"); return; }
  }
  try {
    const body = { align_start: true, admin, name, audience, n_items };
    if (participants) body.participants = participants;
    const r = await fetch(CFG.APPS_SCRIPT_URL + "/", {
      method: "POST", headers: { "Content-Type": "text/plain" }, body: JSON.stringify(body),
    });
    const d = await r.json();
    if (d?.ok === false) throw new Error(d.error || "start failed");
    toast(tr("align.toast.campaign_created"), "ok");
    document.getElementById("al-start-form").hidden = true;
    document.getElementById("al-new-name").value = "";
    const nItemsResetEl = document.getElementById("al-new-n-items");
    if (nItemsResetEl) nItemsResetEl.value = 10;
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
    // v85dc: siyuan asked why siyuanw (reviewer) can't see past alignment campaigns.
    // Load history for every user — non-admin will see their own past enrollments
    // (Ham backend to return user-scoped list on ?action=align_history&user=<self>).
    await loadAlignHistory();
  } catch (err) {
    document.getElementById("al-list-loading").hidden = true;
    document.getElementById("al-err-msg").textContent = err.message;
    document.getElementById("al-error").hidden = false;
  }
}

async function loadAlignHistory() {
  const user = localStorage.getItem(CFG.LS_USER);
  try {
    // v85dc: pass both admin= (legacy admin-view) and user= (non-admin self-view).
    // Ham backend may serve either; harmless when both provided.
    const r = await fetch(`${CFG.APPS_SCRIPT_URL}/?action=align_history&admin=${encodeURIComponent(user)}&user=${encodeURIComponent(user)}`);
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

// v85da: auto-load (no button) — same fetch/render path as the old toggle.
async function loadAndRenderIAAPanel() { return toggleIAAPanel(true); }

async function toggleIAAPanel(forceShow) {
  const panel = document.getElementById("al-iaa-panel");
  if (!panel) return;
  if (!forceShow && !panel.hidden) { panel.hidden = true; return; }
  if (!ALIGN_CAMPAIGN_ID) { panel.innerHTML = ""; return; }
  panel.hidden = false;
  panel.innerHTML = `<p class="muted">${tr("common.loading")}</p>`;
  try {
    const user = localStorage.getItem(CFG.LS_USER) || "";
    // v85co: fire agreement + per-annotator alignment metrics in parallel; render together.
    const [agreeRes, metricsRes] = await Promise.all([
      fetch(`${CFG.APPS_SCRIPT_URL}/?action=align_agreement&campaign_id=${encodeURIComponent(ALIGN_CAMPAIGN_ID)}&user=${encodeURIComponent(user)}`),
      fetch(`${CFG.APPS_SCRIPT_URL}/?action=alignment_metrics&campaign=${encodeURIComponent(ALIGN_CAMPAIGN_ID)}&user=${encodeURIComponent(user)}`).catch(() => null),
    ]);
    const d = await agreeRes.json();
    const metrics = metricsRes && metricsRes.ok ? await metricsRes.json().catch(() => null) : null;
    renderIAAPanel(panel, d, metrics);
  } catch (err) {
    panel.innerHTML = `<p class="warn-text">Failed to load agreement: ${escapeHtml(err.message)}</p>`;
  }
}

function renderIAAPanel(panel, d, alignMetrics) {
  // v85ct (siyuan: 之前的一致性分析直接全隐藏吧 先不删除 但是我暂时不要了):
  // suppress the old IAA analysis (Krippendorff alpha / std_dev / top divergent
  // items). Only render the per-annotator alignment metrics block. If neither
  // is available, show empty state. Keeping the old code paths reachable in
  // case siyuan brings it back.
  if (!alignMetrics || !alignMetrics.annotators || !alignMetrics.annotators.length) {
    panel.innerHTML = `<p class="muted">${tr("align.iaa.no_data")}</p>`;
    return;
  }
  panel.innerHTML = renderAlignmentMetricsBlock(alignMetrics);
  return;
  // eslint-disable-next-line no-unreachable
  const perDim = d.per_dim || {};
  const items = d.items || [];
  const nMulti = d.n_items_multi ?? 0;
  if (nMulti === 0 && !alignMetrics) {
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
  const metricsHtml = alignMetrics ? renderAlignmentMetricsBlock(alignMetrics) : "";
  panel.innerHTML = `
    <h4 class="iaa-title">${tr("align.iaa.title")} <span class="muted small">· ${d.n_raters || "?"} raters · ${nMulti} multi-rater items</span></h4>
    <h5 class="iaa-subtitle">${tr("align.iaa.main_scores")}</h5>
    <table class="iaa-table iaa-table-main">${tableHead}<tbody>${mainRows}</tbody></table>
    <h5 class="iaa-subtitle">${tr("align.iaa.sub_scores")}</h5>
    <table class="iaa-table iaa-table-sub">${tableHead}<tbody>${subRows}</tbody></table>
    ${topItems ? `<h5 class="iaa-subtitle">${tr("align.iaa.top_items")}</h5><ul class="iaa-top-list">${topItems}</ul>` : ""}
    ${metricsHtml}
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
    // v85u: always expose "browse my items" once user has any submitted entry
    // (siyuan/Xinyi bug — they couldn't reopen prior cases after cancel/end).
    // v85az: admins have no alignment annotation tasks → no "我标过的" link.
    const mineLink = document.getElementById("al-mine-link");
    if (mineLink) mineLink.hidden = ALIGN_IS_ADMIN || !((d.my_items || []).length > 0);
    // Render the disclosed count next to submitted count for participants — IAA closure
    // (Alice's guard) requires all-disclosed before aggregate views unlock.
    renderDiscloseProgress(d);
    // Backend marks completed non-admin participants with read_only:true and returns the same
    // items[] payload that admins see. read_only now reflects all_disclosed (not all_submitted).
    ALIGN_READ_ONLY = !!(d.read_only && !ALIGN_IS_ADMIN);
    // v85dk (siyuan: msy 标完之后卡住了 应该自动进入一个author的alignment审阅界面):
    // author who submitted all items but hasn't disclosed all yet should ALSO see the
    // admin-like overview (peer-review-style), not a blank screen. Backend read_only is
    // stricter (all_disclosed). Add a client-side trigger on all_submitted.
    const allSubmitted = (typeof d.my_done === "number" && typeof d.total === "number"
      && d.total > 0 && d.my_done >= d.total);
    const showOverview = ALIGN_IS_ADMIN || ALIGN_READ_ONLY || (allSubmitted && !ALIGN_IS_ADMIN);
    if (showOverview) {
      document.getElementById("al-final-count").textContent = ALIGN_IS_ADMIN
        ? `${d.n_finalized ?? 0} finalized / ${d.total ?? 50}`
        : `${d.n_finalized ?? 0} finalized · ${tr("align.read_only_badge")}`;
      renderAdminOverview(d.items || []);
      document.getElementById("al-admin-overview").hidden = false;
      // End-campaign button is admin-only.
      const endBtn = document.getElementById("al-end-btn");
      if (endBtn) endBtn.hidden = !ALIGN_IS_ADMIN;
      const exportBtn = document.getElementById("al-export-btn");
      if (exportBtn) exportBtn.hidden = false;
      // v85da (siyuan: 一致性不要设置一个按钮了 直接显示就好了): auto-load the
      // alignment metrics panel when the admin overview shows.
      loadAndRenderIAAPanel();
    }
    // v85az: admin alignment = create + finalize-overview ONLY. Hide the participant UI:
    // - "progress N/M" stat (annotator counter, not relevant to admin)
    // - "你已标完全部" done panel (admin never annotates the campaign)
    // - "Browse my items" + disclose-all buttons (no items to browse)
    // Keep al-admin-overview visible (handled above).
    if (ALIGN_IS_ADMIN) {
      document.getElementById("al-progress-stat").hidden = true;
      document.getElementById("al-done-msg").hidden = true;
      document.getElementById("al-item").hidden = true;
      const browseBtn = document.getElementById("al-browse-mine-btn");
      if (browseBtn) browseBtn.hidden = true;
      const discloseAllBtn = document.getElementById("al-disclose-all-btn");
      if (discloseAllBtn) discloseAllBtn.hidden = true;
      const viewResultsBtn = document.getElementById("al-view-results-btn");
      if (viewResultsBtn) viewResultsBtn.hidden = true;
      return;
    }
    if (ALIGN_READ_ONLY || (allSubmitted && !ALIGN_IS_ADMIN)) {
      // v85dk: overview shown above; also surface the done banner + hide any residual item form.
      document.getElementById("al-done-msg").hidden = false;
      document.getElementById("al-item").hidden = true;
      // Hide the admin-only end/export buttons for authors.
      const endBtn = document.getElementById("al-end-btn");
      if (endBtn) endBtn.hidden = true;
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
    // v85au: queue items are always editable/un-finalized by definition; normalize the flags
    // so submitAlign's gate has the same shape as items opened via loadAlignItemForEdit.
    ALIGN_CURRENT = Object.assign({}, d, { editable: true, finalized: false, disclosed: false });
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
    // Reset form (v85k: default 5 / all ✓ — perfect-video friendly)
    for (const id of ["al-physical_adherence", "al-instruction_alignment"]) {
      const inp = document.getElementById(id);
      const out = document.getElementById(id + "-out");
      if (inp) inp.value = 5; if (out) out.value = 5;
    }
    for (const id of ["al-agent_consistency", "al-scene_consistency", "al-interaction_realism", "al-agent_match", "al-object_correct", "al-goal_completed"]) {
      setSubTri(id, 2);
    }
    document.getElementById("al-physical_notes").value = "";
    document.getElementById("al-instruction_notes").value = "";
    buildAutoNote("al-", "physical");
    buildAutoNote("al-", "instruction");
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
  // v85au: respect server-side immutability. If this item was already finalized/disclosed by
  // the time the form opened (or in the interim), refuse the submit locally — backend also
  // returns 409 finalized_locked, but blocking here avoids a wasted round trip + tells the
  // user *why*. Triggered the "PA reset to 5" bug when stale grid payloads were re-saved.
  if (ALIGN_CURRENT.editable === false || ALIGN_CURRENT.finalized || ALIGN_CURRENT.disclosed) {
    toast(tr("toast.align_locked"), "err");
    return;
  }
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
  // v85au: Alice's data-guard — any sub ✗/⚠ on an axis ⇒ that axis main can't be 5.
  // Catches the "user dragged sub but forgot main slider" pollution. Mirrors backend 400 main_sub_conflict.
  const physSubs = ["agent_consistency", "scene_consistency", "interaction_realism"];
  const instrSubs = ["agent_match", "object_correct", "goal_completed"];
  if (payload.physical_adherence === 5 && physSubs.some(k => payload[k] < 2)) {
    toast(tr("toast.main_sub_conflict_phys"), "err"); return;
  }
  if (payload.instruction_alignment === 5 && instrSubs.some(k => payload[k] < 2)) {
    toast(tr("toast.main_sub_conflict_instr"), "err"); return;
  }
  const submittedItemId = ALIGN_CURRENT.id;
  try {
    const r = await fetch(CFG.APPS_SCRIPT_URL + "/", {
      method: "POST", headers: { "Content-Type": "text/plain" },
      body: JSON.stringify({ align_submit: true, user, campaign_id: ALIGN_CAMPAIGN_ID, item_id: submittedItemId, payload }),
    });
    const d = await r.json().catch(() => ({}));
    // v85au + v85av: Ham's contract — error body is {code, dim?, error:<中文>}.
    // 409 = finalized_locked, 400 = main_sub_conflict (with dim).
    if (!r.ok || d?.ok === false) {
      const code = String(d?.code || "");
      if (code === "finalized_locked" || r.status === 409) {
        toast(tr("toast.align_finalized_locked"), "err");
        await refreshAlignStatusOnly();
        await loadMyAlignment();
        return;
      }
      if (code === "main_sub_conflict") {
        const dim = d.dim === "instruction_alignment" ? tr("toast.main_sub_conflict_instr") : tr("toast.main_sub_conflict_phys");
        toast(dim, "err");
        return;
      }
      throw new Error(d?.error || ("HTTP " + r.status));
    }
    await refreshAlignStatusOnly();
    // IAA-independence rule (Alice's guard): seeing others requires explicit "disclose" action,
    // which permanently LOCKS this item — re-edit no longer allowed. Default = advance to next.
    if (ALIGN_IS_ADMIN) {
      // Admin doesn't need the disclose lock (independence rule applies to participants only).
      // Keep the existing "see others immediately" UX for admin.
      await showAlignOthers(submittedItemId);
      return;
    }
    // v85di (siyuan: 这个弹窗给我取消掉): drop the see-others confirm dialog on submit.
    // Default is now "advance to next item, this one stays editable" — the user can still
    // disclose later via the "See others (lock)" button on the my-alignment row.
    await loadAlignNext();
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
  // v85dh (siyuan: 这个列表不要直接放视频链接了 我说了多少遍了 所有这种列表 都是补上视频的
  // 可以放 init frame 和 instruction): list rows show init_frame thumbnail + instruction
  // preview only. Video plays only when the user clicks in to annotate/edit.
  const instrText = (it.instruction || it.instruction_cn || "").trim();
  const instrPreview = instrText
    ? `<p class="ma-instr">${escapeHtml(instrText.length > 140 ? instrText.slice(0, 140) + "…" : instrText)}</p>`
    : "";
  const initThumb = it.init_frame_url
    ? `<img class="ma-thumb" src="${escapeHtml(applyVideoHost(it.init_frame_url))}" alt="init frame" loading="lazy" onerror="this.onerror=null;this.style.display='none';">`
    : "";
  li.innerHTML = `
    <div class="meta"><span class="${badgeClass}">${tr("align.state." + state)}</span><span class="tag">${escapeHtml(it.dataset || "?")}</span><span class="tag">${escapeHtml(it.task || "?")}</span></div>
    ${initThumb}
    ${instrPreview}
    ${scoresLine}
    <div class="ma-foot">${action}</div>
  `;
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
  // v85au: hard gate — if grid passed us a finalized/disclosed/non-editable row by mistake,
  // refuse to open the edit form and refresh the grid (lets user see the up-to-date state).
  if (it.finalized || it.disclosed || it.editable === false) {
    toast(tr("toast.align_locked"), "err");
    loadMyAlignment();
    return;
  }
  hideAlignSections();
  setVideoSourcesFromItem(it);
  ALIGN_CURRENT = { id: it.item_id, video_url: it.video_url, dataset: it.dataset, task: it.task,
                    video_sources: it.video_sources, instruction: it.instruction, instruction_cn: it.instruction_cn,
                    editable: it.editable !== false, finalized: !!it.finalized, disclosed: !!it.disclosed };
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
  // v85au: belt-and-suspenders — same gate as loadAlignItemForEdit, in case the grid hands
  // over a stale "not annotated" row that was finalized by an admin between fetch and click.
  if (it.finalized || it.disclosed || it.editable === false) {
    toast(tr("toast.align_locked"), "err");
    loadMyAlignment();
    return;
  }
  hideAlignSections();
  setVideoSourcesFromItem(it);
  ALIGN_CURRENT = { id: it.item_id, video_url: it.video_url, dataset: it.dataset, task: it.task,
                    video_sources: it.video_sources, instruction: it.instruction, instruction_cn: it.instruction_cn,
                    editable: it.editable !== false, finalized: !!it.finalized, disclosed: !!it.disclosed };
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
  // Reset form (v85k: default 5 / all ✓ — perfect-video friendly)
  for (const id of ["al-physical_adherence", "al-instruction_alignment"]) {
    const inp = document.getElementById(id);
    const out = document.getElementById(id + "-out");
    if (inp) inp.value = 5; if (out) out.value = 5;
  }
  for (const id of ["al-agent_consistency", "al-scene_consistency", "al-interaction_realism", "al-agent_match", "al-object_correct", "al-goal_completed"]) {
    setSubTri(id, 2);
  }
  document.getElementById("al-physical_notes").value = "";
  document.getElementById("al-instruction_notes").value = "";
  buildAutoNote("al-", "physical");
  buildAutoNote("al-", "instruction");
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
  wireAutoNote("f-");        // v85j note prefill (finalize form uses f- prefix)
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
  applyRolePill(user, role);
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

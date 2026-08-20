# Pre-annotation Adjustment Spec — v2 → v3

> ⛔ **SUPERSEDED (2026-08-20) by [`EXTERNAL_AGENT_REQUIREMENTS.md`](./EXTERNAL_AGENT_REQUIREMENTS.md).**
> Two sections of this file are now WRONG and would cost real money to follow:
> **§3 (re-run the sub-scores)** and **§4 (backfill the 515 notes)** — sub-scores are not a
> training target, so both are cancelled. The **accept bands in §5 are incomplete**: they band
> only `instruction_alignment` 1 and 2, and cannot see the v3 change to the 4-vs-5 boundary.
> Use the other file.

**Who this is for:** the external agent that produced
`preannotations_train_final_v2.jsonl` (5,796 rows).

**Verdict on v2:** structurally clean. Do **not** re-run everything.

| component | verdict | action |
|---|---|---|
| `physical_adherence` (main) | ✅ matches the previous batch within 1.2 pts | **keep as-is** |
| `pa_reasoning` / `ia_reasoning` | ✅ 0 empty, 0 duplicated, 100% cover all 3 criteria | **keep as-is** |
| `instruction_alignment` (main) | 🔴 too harsh — score-2 share 28.9% → 46.9% | **re-run, §2** |
| 6 sub-scores | 🔴 middle tier ⚠(1) collapsed | **re-run, §3** |
| evidence notes | ⚠️ 515 rows (8.9%) missing a required note | **fix, §4** |

Everything below was measured on the **13 generator models that have ≥100 rows in the new batch,
the old batch and the human-annotated set** — so "the videos were different" is excluded as an
explanation. All 13 moved the same direction on every defect listed.

---

## 1. What is actually wrong

### 1a. IA collapses the human "1" tier into "2"

```
instruction_alignment      1       2       3       4       5     mean
  v2 (new)              2.9%   46.9%   22.6%   15.7%   11.9%    2.87
  previous batch        2.3%   28.9%   31.9%   17.9%   18.9%    3.22
  HUMAN                10.7%   26.9%   29.9%   15.9%   16.6%    3.01
```

Humans put **10.7%** of items at score 1. v2 puts **2.9%**. Those items did not disappear — they
landed in 2, which is why 2 nearly doubled.

> ⚠️ **Do not "fix" this by targeting the mean.** v2's mean (2.87) is already *closer* to the human
> mean (3.01) than the previous batch was (3.22). The mean is not the problem; **the shape is**.
> Judged by mass on the failing end:
> ```
> share at 1+2:   HUMAN 37.6%   ·   v2 49.8% (too harsh)   ·   previous 31.2% (too lenient)
> same cut on PA: HUMAN 37.3%   ·   v2 36.1% (correct)     ·   previous 35.2%
> ```
> PA gets this right. IA does not. **A correction that only moves the average will not fix it and can
> make it worse.**

**Root cause (from reading v2's own reasoning):** the current prompt says
`1 = unrelated or task not performed`. The model is applying "1" only to *unrelated* videos, and
scoring "the instructed task never happened" as 2. Sampled v2 rows say things like *"there is no
visible running water, scrubbing, or completed washing"* — and still score 2. By the human rubric
that is a 1.

### 1b. The sub-score middle tier collapsed

```
middle tier (⚠ = 1) share      v2      previous     HUMAN
  agent_consistency           6.1%      48.1%       29.1%
  scene_consistency          10.5%      40.1%       31.3%
  object_correct             16.3%      39.6%       26.5%
```

v2 is deciding almost every case is either a clean pass or an outright violation. The rubric's
explicit warning is that the middle tier **must** be used.

---

## 2. Fix for `instruction_alignment`

Replace the score-scale line in the IA prompt. **Change only this line.** Leave the system message,
the criteria block and the JSON spec exactly as they are.

**Current:**

```text
Score (integer 1-5): 1 = unrelated or task not performed; 2 = major misalignment;
3 = partial completion; 4 = minor shortfalls only; 5 = full, correct completion.
```

**Replace with:**

```text
Score (integer 1-5):
1 = the instructed task is NOT performed. Use 1 when ANY of these holds: the video is
    unrelated to the instruction; the manipulator never acts on the target; the instructed
    action never occurs; or the goal is never even attempted. "Nothing relevant happened"
    is a 1, NOT a 2.
2 = the task IS attempted and recognisable, but with major errors - e.g. the wrong object is
    manipulated, or the action is clearly the wrong action, or the goal is plainly not reached
    despite a genuine attempt.
3 = partial completion - the right idea on the right object, but the end state is incomplete.
4 = minor shortfalls only.
5 = full, correct completion.

Boundary rule: the 1-vs-2 line is ATTEMPT, not outcome. If a recognisable attempt at the
instructed task is visible, the floor is 2. If no attempt is visible, it is 1.
```

## 3. Fix for the six sub-scores

Append this block to the sub-score prompt, **after** the existing per-axis definitions:

```text
Middle-tier rule (this is the most common scoring error - read it twice):
The value 1 is NOT a fallback for uncertainty. It is the correct answer whenever a defect is
REAL but PARTIAL, BRIEF, or LOCAL. Before returning 0 or 2 for any axis, ask:

  - returning 2: is the axis truly clean for the WHOLE clip? A defect that is visible in only
    a few frames, or affects only part of the object, is 1 - not 2.
  - returning 0: is the axis broken in a way that a human would call major? A gripper that
    warps briefly and recovers is 1, not 0. An object that flickers once is 1, not 0.

Axis-specific 1 (not 0, not 2):
  agent_consistency   1 = brief deformation, jitter, or a short-lived artefact, while the
                          gripper/hand stays recognisable throughout.
  scene_consistency   1 = slight flicker or drift, or ONE object briefly unstable, while the
                          scene as a whole holds together.
  interaction_realism 1 = mild clipping, or contact that looks slightly unnatural, while the
                          action still basically works.
  agent_match         1 = the task IS completed but by a slightly different manipulator than the
                          first frame shows (e.g. the other hand/gripper).
  object_correct      1 = partially correct, ambiguous, or an adjacent object is also touched.
  goal_completed      1 = partially done - e.g. lifted but never placed, or 2 of 3 items done.
```

> ⚠️ **Do not give the model target percentages.** Telling it "use 1 about 30% of the time" makes it
> hit the number by quota rather than by observation, which produces the right histogram attached to
> the wrong items. The rules above are decision boundaries, not rates.

## 4. Fix for the missing evidence notes

515 of 5,796 rows have a sub-score of 0 or 1 with an empty note. Make this a hard post-condition
in your own runner, not a request to the model:

```python
pa_bad = any(rec[k] < 2 for k in ("agent_consistency","scene_consistency","interaction_realism"))
ia_bad = any(rec[k] < 2 for k in ("agent_match","object_correct","goal_completed"))
if (pa_bad and not rec["physical_notes"].strip()) or (ia_bad and not rec["instruction_notes"].strip()):
    retry_once()          # then, if still empty, write the row with "error": "missing_note"
```

Never emit a row that has a 0/1 sub-score and no note without an `error` field saying so.

---

## 5. Calibrate BEFORE re-running (this is the important part)

`calibration_set_v1.json` — **409 items, 22 models**, each carrying a `human_label`.

- Stratified to match the model mix of the 5,796 production queue (seed 20260819).
- Every item is inside `train_manifest_v2` and **outside `test_802`** — calibrating on it cannot
  leak the benchmark.
- The 409 are **disjoint from the production queue** and already labelled, so they are not part of
  any deliverable. Seeing the labels gains you nothing on the actual work.

**Procedure**

1. Apply the §2 and §3 prompt changes.
2. Score all 409 calibration items.
3. Compare your output against `human_label` and check the table below.
4. Only if **every** row is inside its band, run the production re-score.
5. If something is outside, adjust and repeat. Report each attempt — do not silently iterate until
   it passes.

**Accept bands** — Wilson 95% CI of the human rate *on these same 409 items*:

| metric | human | accept band |
|---|---:|---|
| `instruction_alignment` = 1 | 14.2% | **11.1% – 17.9%** |
| `instruction_alignment` = 2 | 31.5% | **27.2% – 36.2%** |
| `physical_adherence` = 1 | 12.0% | **9.2% – 15.5%** |
| `physical_adherence` = 5 | 3.9% | **2.4% – 6.3%** |
| `agent_consistency` = 1 | 34.5% | **30.0% – 39.2%** |
| `scene_consistency` = 1 | 35.0% | **30.5% – 39.7%** |
| `interaction_realism` = 1 | 51.3% | **46.5% – 56.2%** |
| `agent_match` = 1 | 18.8% | **15.3% – 22.9%** |
| `object_correct` = 1 | 27.4% | **23.3% – 31.9%** |
| `goal_completed` = 1 | 30.8% | **26.5% – 35.4%** |

Also report, without a pass/fail threshold attached:

- **mean absolute error** vs `human_label` on both main scores;
- the share of items where your score and the human differ by **≥2** — these are the real
  disagreements and are worth reading by hand.

> ⚠️ **What the bands are and are not.** They check that your *distribution* matches the human one.
> They do **not** check that you are right item-by-item — a scorer can match the histogram perfectly
> and still be wrong on every clip. That is why the per-item MAE and the ≥2 disagreements are
> reported too. And the ground truth is **single-pass** human annotation (only 81 train items were
> ever double-reviewed), so treat it as a calibration reference, not as gold.

---

## 6. What to re-run, and what to deliver

**Re-run:** `instruction_alignment` main score + all 6 sub-scores + notes.
**Keep unchanged from v2:** `physical_adherence`, `pa_reasoning`, `ia_reasoning`.

Because PA and both reasoning fields are being kept, this is **2 calls per item, not 3**
(one IA-main call, one sub-score call) over 5,796 items ≈ **11,600 calls**.

Deliver as `preannotations_train_final_v3.jsonl` with the same schema plus:

```json
{"source": "ensemble_4judge_v3_median",
 "pa_carried_from": "v2",
 "calibration_run": {"n": 409, "passed": true, "ia_1_pct": 13.4, "...": "..."}}
```

Keep `source` distinct from v2's `ensemble_4judge_v2_median` — the two batches must stay
separable after any merge.

**Do not** re-run the 50 items v2 skipped. They are genuinely undecodable: 91 files in the dataset
are truncated (`moov atom not found`; sizes 48 B, 256 KiB+48, 512 KiB+48, all `abot_physworld`).
Refusing to score them was correct, and refusing them again is correct.

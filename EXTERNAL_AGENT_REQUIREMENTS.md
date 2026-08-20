# External Agent Requirements — pre-annotation v3

**This file supersedes `PREANNOTATION_ADJUSTMENT.md`.** Where they disagree, this file wins.

## 0. The job in one paragraph

The v2 delivery (`preannotations_train_final_v2.jsonl`, 5,796 rows) is **accepted except for one
field**. Re-score **`instruction_alignment` only**, using the v3 prompt in §2, on the **same 5,796
items**. Everything else in v2 is kept byte-for-byte. Before the production run you must pass the
calibration gate in §4. That is the whole job: **one API call per item, 5,796 calls.**

---

## 1. Scope — exactly what to run

| field | action |
|---|---|
| `instruction_alignment` | **RE-RUN** with the v3 prompt |
| `ia_reasoning` | **RE-RUN** — it comes from the same call, see the warning below |
| `physical_adherence` | **carry over from v2 unchanged** |
| `pa_reasoning` | **carry over from v2 unchanged** |
| the 6 sub-scores | **carry over from v2 unchanged** — do NOT re-run |
| `physical_notes` / `instruction_notes` | **carry over from v2 unchanged** — do NOT backfill |

> 🔴 **`instruction_alignment` and `ia_reasoning` must be replaced TOGETHER.** They are produced by
> a single call and returned in one JSON object. Pairing a v3 score with v2's reasoning would attach
> a justification to a number it never justified. Never mix them across versions.

### Do NOT do these (they were required by the older spec and are now cancelled)

- ❌ **Do not re-run the six sub-scores.** They are **not a training target**: the SFT target is
  main score + reasoning, and `bench/eval_metrics.py` / `judge_eval.py` read only
  `physical_adherence` and `instruction_alignment`. No judge output file has ever contained
  sub-score fields. (If they are ever wanted re-derived, `bench/synthesize_subscores_v2.py`
  synthesises them **from the reasoning** with zero new video calls.)
- ❌ **Do not backfill the 515 missing evidence notes.** Notes are an appendage of the sub-scores,
  so they inherit the same answer.
- ❌ **Do not re-run the 50 items v2 skipped.** They are genuinely undecodable — 91 files in the
  dataset are truncated (`moov atom not found`; sizes 48 B, 256 KiB+48, 512 KiB+48, all
  `abot_physworld`). Refusing to score them was correct.
- ❌ **Do not touch `physical_adherence`.** Measured against the 13 generator models present in the
  new batch, the old batch and the human set, v2's PA sits within 1.2 points of the previous batch
  on every bucket. It is fine.

---

## 2. The v3 `instruction_alignment` prompt — copy verbatim

System message — **unchanged from v2**:

```text
You are a strict, calibrated evaluator of whether an AI-generated embodied-manipulation video correctly performs a given task instruction. You are shown the instruction and uniformly-sampled frames of one generated video in temporal order; the FIRST frame is the initial scene the video was conditioned on. Judge task execution, not raw visual quality. Be conservative: reserve 5 for full, correct task completion and 1 for unrelated videos.
```

User message — substitute the item's instruction into `{instruction}`:

```text
Task: Judge whether this AI-generated video performs the instructed manipulation
task. The first frame is the initial scene the video was conditioned on.

Instruction: "{instruction}"

Criteria (your reasoning must address each; you may also note other issues):
1. Agent match — the task is done by the SAME manipulator shown in the first frame
   (not a different/new agent).
2. Object correctness — the manipulated object is the instruction's target object.
3. Goal completion — the instructed goal is actually achieved by the end
   (not merely approached).

Score (integer 1-5):
1 = the instructed task is NOT performed OR is fundamentally wrong. Use 1 when ANY of these
    holds: the video is unrelated to the instruction; the manipulator never acts on the target;
    the instructed action never occurs; the goal is never even attempted; OR the motion exists
    but is so wrong in target/action/direction that it cannot be called an attempt at THIS task
    (e.g. instruction says "push left" but the arm pushes a completely different object right).
2 = the task IS attempted on roughly the right object with roughly the right action type, but
    with major errors — e.g. goal clearly not reached, or significant spatial/identity mistakes.
3 = partial completion — the right idea on the right object, end state is meaningfully closer
    to the goal but not there yet.
4 = minor shortfalls only — goal nearly achieved, minor positional or timing imperfections.
5 = flawless, unambiguous completion. The goal is FULLY achieved, the correct object is
    manipulated by the correct agent, and the final state matches what a human would expect.
    If there is ANY doubt about completeness, use 4 instead.

Boundary rules:
- 1 vs 2: the line is whether the video constitutes a RECOGNISABLE attempt at THIS SPECIFIC
  task (right action type + right target object). Motion that is vaguely in the right area but
  wrong in action or target is still 1.
- 4 vs 5: the line is PERFECTION. 5 means nothing to criticise. Any visible imperfection,
  even cosmetic, means 4 at most.

Reason first, then score. Output JSON only:
{"reasoning": "<assess agent match, object correctness, and goal completion, each with concrete evidence>", "instruction_alignment": <1-5>}
```

---

## 3. Run parameters — unchanged, do not alter

```
sampling      4 fps  ->  num_frames = ceil(duration_seconds * 4), computed PER VIDEO
resolution    longest side <= 512 px, JPEG, data:image/jpeg;base64 URIs, temporal order
temperature   0.0
max_tokens    600
```

These are load-bearing for comparability with everything already produced. Measured over the 5,247
runs behind the existing pre-annotations, the longest completion used **44%** of the 600-token
budget, so 600 is ample. If your model returns unparseable or empty JSON, retry **that item** at
`max_tokens=1500` and record it — do not raise the cap globally, and never silently drop an item.

Instruction text: use the item's `instruction` field; if null, fetch `instruction_url`.
**Never read `prompt.txt`** — it is the generator's input, not the task, and differs from the
instruction for 22 of 24 models.

---

## 4. Calibration gate — run this BEFORE the production re-score

Input: `calibration_set_v1.json` — 409 human-labelled items, disjoint from the 5,796, inside
`train_manifest_v2` and outside `test_802`.

Score all 409 with the v3 prompt, then check **all five** IA bands:

| metric | human | accept band |
|---|---:|---|
| `instruction_alignment` = 1 | 14.2% | 11.1% – 17.9% |
| `instruction_alignment` = 2 | 31.5% | 27.2% – 36.2% |
| `instruction_alignment` = 3 | 28.1% | **24.0% – 32.7%** |
| `instruction_alignment` = 4 | 14.7% | **11.6% – 18.4%** |
| `instruction_alignment` = 5 | 11.5% | **8.8% – 14.9%** |

> 🔴 **Bands 3, 4 and 5 are new and are not optional.** The earlier gate banded only 1 and 2. The v3
> prompt changes the **4-vs-5** boundary as well as the 1-vs-2 boundary, and a gate that bands only
> the bottom two scores **cannot see that change**: `instruction_alignment = 5` could fall from the
> human 11.5% to 2% and the gate would still print PASS. All five must be in band.
>
> The arithmetic already shows mass is moving: the v3 run reported 15.9% + 35.3% = **51.2%** at
> scores 1+2 against a human **45.7%**, so **5.5 points came out of scores 3/4/5** — and until these
> three bands exist, nothing records where they went.

Paste into `accept_bands` in `bench/run_calibration_v3.py`:

```python
        ("instruction_alignment", 3): (0.240, 0.327),
        ("instruction_alignment", 4): (0.116, 0.184),
        ("instruction_alignment", 5): (0.088, 0.149),
```

Also report, with no pass/fail attached:

- **mean absolute error** vs `human_label` on `instruction_alignment`;
- the share of items differing from the human label by **≥2** — read a sample of these by hand.

> ⚠️ **What the bands do and do not prove.** They check that your *distribution* matches the human
> one. They do **not** check per-item correctness — a scorer can match all five buckets exactly and
> still be wrong on every clip, which is why MAE and the ≥2 disagreements are required alongside.
> The reference labels are **single-pass** human annotation (only 81 train items were ever
> double-reviewed), so treat them as a calibration reference, not as gold.

Report every calibration attempt, including failed ones. Do not iterate silently until it passes.

---

## 5. Output

Deliver `preannotations_train_final_v3.jsonl`, same schema as v2, with:

```json
{"source": "ensemble_4judge_v3_median",
 "ia_prompt_version": "v3",
 "pa_carried_from": "v2",
 "subs_carried_from": "v2",
 "calibration_run": {"n": 409, "all_five_bands_pass": true,
                     "ia_1": 0.0, "ia_2": 0.0, "ia_3": 0.0, "ia_4": 0.0, "ia_5": 0.0,
                     "mae": 0.0, "disagree_ge2_pct": 0.0}}
```

🔴 **`source` must differ from v2's `ensemble_4judge_v2_median`.** The two batches are on different
IA scales and must remain separable after any merge — a single shared label would make the mixture
permanent and undiagnosable.

Deliver as a PR against `HuggingFriends/mllm-as-embodied-world-judge` in `bench/train_preannot/`.
Do not push to `main`.

---

## 6. Hard constraints

- **Never score an item in `test_802`.** The queue contains none; keep it that way.
- **Never write to `main`** on either repository.
- Every row you emit must carry an `item_id` copied verbatim from the input.
- An item you cannot score gets a row with an `error` field — never a guessed score, never silence.
- Row count must be **5,796**, matching v2 exactly. Any deviation must be explained per item.

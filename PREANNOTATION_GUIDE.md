# Pre-annotation Guide — Embodied World Judge

**Audience: an external agent with an API key. You only need to know how to call an API.**
Everything required is in this file — the exact prompts, sampling settings, and output schema.

**Work item list:** [`preannotation_queue_v1.json`](./preannotation_queue_v1.json) — **5,846 videos.**

> Provenance: prompts and parameters below are copied **verbatim** from the pipeline that produced
> the existing 5,183 pre-annotations (`judge/prompts.py`, `judge/openai_judge.py`,
> `judge/video_utils.py`, `bench/run_bench.py`). Do not paraphrase them — see §7.

---

## 1. TL;DR — the loop

For **each** item in `items[]`:

1. Download `video_url`.
2. Sample frames: **4 fps**, longest side **≤ 512 px**, JPEG, base64 data URIs.
3. Make **TWO separate chat-completion calls** (they are deliberately not combined):
   - **Call A — Physical Adherence**, frames only, **instruction NOT included**.
   - **Call B — Instruction Alignment**, frames **+ the instruction**.
4. Make **Call C** for the six sub-scores (§4).
5. Append one JSON line to your output file.

`temperature = 0.0`, `max_tokens = 600`, JSON-only replies.

---

## 2. Frame sampling — get this exactly right

Frame count is **per video** (durations vary), derived from a fixed 4 fps:

```python
num_frames = max(1, ceil(duration_seconds * 4.0))   # 4 fps — DO NOT CHANGE
```

```python
import cv2, base64
def sample_frames(video_path, num_frames, max_side=512):
    cap = cv2.VideoCapture(video_path)
    if not cap.isOpened(): return []
    total = int(cap.get(cv2.CAP_PROP_FRAME_COUNT)) or 0
    idxs = [int(round(i * (total - 1) / max(1, num_frames - 1))) for i in range(num_frames)]
    out = []
    for i in sorted(set(idxs)):
        cap.set(cv2.CAP_PROP_POS_FRAMES, i)
        ok, frame = cap.read()
        if not ok: continue
        h, w = frame.shape[:2]
        s = min(1.0, max_side / float(max(h, w)))
        if s < 1.0: frame = cv2.resize(frame, (int(w*s), int(h*s)))
        ok, buf = cv2.imencode(".jpg", frame)
        if ok: out.append("data:image/jpeg;base64," + base64.b64encode(buf).decode())
    return out                       # evenly spaced, temporal order
```

**4 fps and 512 px are load-bearing.** The existing 5,183 pre-annotations and the whole test-875
leaderboard were produced at these settings. Change them and your scores cannot be ensembled with
the existing ones.

### Message shape

```python
resp = client.chat.completions.create(
    model=MODEL,
    messages=[
        {"role": "system", "content": SYSTEM},
        {"role": "user", "content":
            [{"type": "text", "text": USER_PROMPT}] +
            [{"type": "image_url", "image_url": {"url": uri}} for uri in frames]},
    ],
    temperature=0.0,
    max_tokens=600,
)
```

---

## 3. The two main prompts — copy verbatim

### Call A — Physical Adherence (video only; **do not pass the instruction**)

System:

```text
You are a strict, calibrated evaluator of the PHYSICAL REALISM of AI-generated embodied / robot-manipulation videos (a robot arm/gripper or a human hand acting on objects). You are shown uniformly-sampled frames of one generated video in temporal order. Judge the physics of the video itself. Be conservative: reserve 5 for clearly flawless physics and 1 for clearly broken physics.
```

User:

```text
Task: Judge the PHYSICAL REALISM of this AI-generated robot / embodied-manipulation
video, from the video alone (ignore any task instruction).

Criteria (your reasoning must address each; you may also note other issues):
1. Agent integrity — the arm/gripper/hand stays structurally complete and consistent
   (no melting, fused/extra fingers, warping).
2. Scene & object consistency — background and objects stay temporally stable
   (no flicker, teleport, morphing, appear/disappear).
3. Interaction realism — contacts obey physics (grasps close and bear weight, no
   interpenetration, motion respects gravity/inertia).

Score (integer 1-5): 1 = gross violations throughout; 2 = major violations;
3 = noticeable local inconsistencies; 4 = minor issues only; 5 = no visible violation.

Reason first, then score. Output JSON only:
{"reasoning": "<assess agent integrity, scene & object consistency, and interaction realism, each with concrete visual evidence>", "physical_adherence": <1-5>}
```

### Call B — Instruction Alignment (frames **+** instruction)

System:

```text
You are a strict, calibrated evaluator of whether an AI-generated embodied-manipulation video correctly performs a given task instruction. You are shown the instruction and uniformly-sampled frames of one generated video in temporal order; the FIRST frame is the initial scene the video was conditioned on. Judge task execution, not raw visual quality. Be conservative: reserve 5 for full, correct task completion and 1 for unrelated videos.
```

User (substitute the item's instruction into `{instruction}`):

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

Score (integer 1-5): 1 = unrelated or task not performed; 2 = major misalignment;
3 = partial completion; 4 = minor shortfalls only; 5 = full, correct completion.

Reason first, then score. Output JSON only:
{"reasoning": "<assess agent match, object correctness, and goal completion, each with concrete evidence>", "instruction_alignment": <1-5>}
```

**Where the instruction comes from:** use the item's `instruction` field. If it is `null`, fetch
`instruction_url` (plain text). **Never read `prompt.txt`** — see §7.

---

## 4. Call C — the six sub-scores

> ⚠️ **Status: this prompt is NEW.** `JUDGES.md` in the HF dataset tells you to use
> `PHYSICAL_ADHERENCE_PROMPT_SUBS` / `INSTRUCTION_ALIGNMENT_PROMPT_SUBS` — **those constants do not
> exist** in `judge/prompts.py` (verified in two independent copies). The shipped prompts emit main
> scores only. The prompt below was written to match the human rubric (`judge/RUBRIC.md`,
> `docs.html`) so all eight fields can be filled. It is **not** the byte-identical original, so
> treat sub-scores as slightly less comparable than PA/IA until the original surfaces.

System: reuse the **Physical Adherence** system message from §3.

User (pass frames **and** the instruction):

```text
Task: Rate SIX fixed sub-criteria for this AI-generated robot / embodied-manipulation video.

Instruction (for the alignment sub-criteria only): "{instruction}"
The first frame is the initial scene the video was conditioned on.

Score EACH sub-criterion as an integer:
  0 = violated (major)   1 = partial / minor   2 = holds

Physical (judge from the video alone, ignore the instruction):
  agent_consistency   — arm/gripper/hand stays structurally complete and consistent
                        (0 = melting, fusing, extra/missing fingers, vanishing)
  scene_consistency   — background AND objects stay temporally stable
                        (0 = objects teleport, appear/disappear from nowhere, severely deform)
  interaction_realism — contact, grasp and forces are plausible
                        (0 = interpenetration, moving an object while grasping nothing,
                         gravity/inertia violated)

Alignment (use the instruction and the first frame):
  agent_match     — the SAME manipulator shown in the first frame does the task
                    (1 = task done but wrong hand/gripper used)
  object_correct  — the manipulated object is the instruction's target object
                    (1 = partially correct, ambiguous, or an adjacent object is touched)
  goal_completed  — the instructed end-state is actually reached
                    (1 = partially done, e.g. lifted but never placed)

Rules:
- Use 1 whenever the failure is real but minor or partial. Do NOT collapse to only 0 and 2.
- scene_consistency covers OBJECTS as well as background. Mass appearing from nowhere,
  teleporting or severe warping is scene_consistency, NOT interaction_realism.
- interaction_realism is about contact / grasp / forces ONLY.
- object_correct is about object IDENTITY ONLY.

Output JSON only:
{"physical_notes": "<one concrete visual observation per physical sub-criterion scored 0 or 1>", "instruction_notes": "<one concrete visual observation per alignment sub-criterion scored 0 or 1>", "agent_consistency": <0-2>, "scene_consistency": <0-2>, "interaction_realism": <0-2>, "agent_match": <0-2>, "object_correct": <0-2>, "goal_completed": <0-2>}
```

---

## 5. Output — where it goes

Write **JSONL**, one object per line, and append as you go so the run is resumable (on restart,
skip `item_id`s already present in your output file).

**Filename:** `judge_<your-model-name>.jsonl` — e.g. `judge_gemini-3.5-flash.jsonl`.

```json
{"item_id": "data__agibot_world__generated_data__abot_physworld_f113_prefix__task_0002__episode_0001__1__task_0002_episode_0001",
 "judge_model": "gemini-3.5-flash",
 "physical_adherence": 4, "instruction_alignment": 3,
 "agent_consistency": 2, "scene_consistency": 1, "interaction_realism": 1,
 "agent_match": 2, "object_correct": 1, "goal_completed": 0,
 "physical_reasoning": "<reasoning string from Call A>",
 "instruction_reasoning": "<reasoning string from Call B>",
 "physical_notes": "<from Call C>", "instruction_notes": "<from Call C>",
 "error": null}
```

Rules:
- `physical_adherence`, `instruction_alignment` ∈ **1–5**; the six sub-scores ∈ **0/1/2**.
- **All eight scores required.** If a call fails, still write the line with the scores you have and
  a non-null `error` — never silently drop an item.
- Never invent scores for a video you could not decode. Write
  `{"item_id": "...", "error": "decode_failed"}`.

**Delivery:** open a pull request against the HF dataset
`HuggingFriends/mllm-as-embodied-world-judge`, putting your file in `bench/train_preannot/`.
Do not push to `main`. If you cannot open a PR, hand the file back to whoever commissioned the run.
**Multiple agents are expected to run different models over the same 5,846 items** — the outputs are
later ensembled, so do not partition the list between yourselves unless told to.

---

## 6. Cost and scale

Per item: **3 API calls**, each with `ceil(duration × 4)` images at ≤512 px, `max_tokens=600`.
Videos are short (mostly ~5–8 s), so expect roughly **20–35 frames per call**.
**5,846 items ⇒ ~17,500 calls.** Run with modest concurrency and expect to resume at least once —
write every line as you get it.

---

## 7. Four traps that will silently corrupt your output

1. **`prompt.txt` is NOT the instruction.** Many directories contain both `instruction.txt` and
   `prompt.txt`. `instruction.txt` is the canonical task; **`prompt.txt` is the generator's input** —
   for `_prefix` models it carries a physics preamble, and for `_rewrite` models **it describes a
   different, narrower action**. Measured: they differ for **22 of 24 models**. Use the `instruction`
   field or `instruction_url` — never `prompt.txt`.
2. **`instruction_from_sibling_model: true` is expected.** That item's own folder has no
   `instruction.txt`, so the URL points into **another model's** folder for the **same
   `dataset|task|episode`**. Instruction is a property of the ground-truth episode; verified
   byte-identical across models on 22 GT keys spanning all 11 datasets.
3. **Do not merge Call A and Call B.** Physical Adherence is judged **without** the instruction on
   purpose — showing it leaks task context into the physics score and breaks comparability with
   every existing score.
4. **Frame 0 IS the declared `init_frame`.** If content visibly departs from `init_frame`, that is
   real drift (`scene_consistency`), not a framing artefact.

Two perception traps seen in this data:
- **A near-static video is not automatically `goal_completed` = 0.** A small tool oscillating fast
  reads as frozen in whole-frame statistics *and* in any every-Nth-frame sample.
- **If an object appears to grow**, measure something known to be fixed **in the same frame**. If the
  invariant is unchanged, the object grew — the camera did not move.

---

## 8. Scope — read the predicate, not the title

```
train_manifest_v2                                 11,617
  ├ has a pre-annotation                           5,183
  ├ has a human annotation                         3,628
  └ THIS QUEUE = no pre-annotation AND no human     5,891
        ├ excluded as unusable                         45
        └ items to label                            5,846
```

`excluded[]` in the JSON lists the **45** unusable items with reasons (**38** are 48-byte stubs with
no `moov` atom; **7** have no `instruction.txt` for their GT episode). They are **not** in `items[]`.

⚠️ **"Needs pre-annotation" has more than one true answer.** Strictly *"lacks a pre-annotation"* is
**6,434**, which includes **543** items that already carry a **human** annotation — deliberately not
queued. Quote the predicate whenever you quote the number.

---

## 9. Ground rules

- Pre-annotations are **not** gold. A human reviews and corrects every one.
- **Never** guess a URL by string-stitching; use the URLs in the JSON.
- Do not carry scores over between items.
- Between two adjacent tiers, prefer the middle one. In the existing data `agent_match` and
  `object_correct` are almost only 0 or 2 — that under-use of 1 is the single most common defect,
  and an honest 1 is worth more than a confident 0.

Human-facing rubric: `docs.html` in this repo. **If this file and `docs.html` ever disagree,
`docs.html` wins.** Reference work: VideoPhy / VideoPhy-2, VideoScore / VideoScore-2,
WorldModelBench, WorldArena, VBench-2.0.

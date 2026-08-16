# Pre-annotation Guide — Embodied World Judge

For external agents producing **pre-annotations** for the training set.
Rubric transcribed from `docs.html` in this repo (the standard human annotators were held to).
**If this file and `docs.html` ever disagree, `docs.html` wins.**

---

## 1. What you are labelling

Each item is a short video of a **robot gripper or human hand doing manipulation**, paired with an
**instruction** and an **`init_frame`** (the first frame = the conditioning frame given to the
generator).

You score **two independent axes**:

| Axis | Meaning | What you may look at |
|---|---|---|
| **PA** — Physical Adherence | Is the video *physically* real? | **The video only. Ignore the instruction.** |
| **IA** — Instruction Alignment | Did the video *do what was asked*? | Instruction **+ `init_frame`** |

The axes are genuinely independent. "Physically perfect but did the wrong thing" (PA high, IA low)
and "completed the task but looks unreal" (IA high, PA low) are both normal and expected.

Each axis = **one 1–5 main score** + **three 0/1/2 sub-scores** + **required notes**.

```
✗ 0 = major / violated      ⚠ 1 = minor / partial      ✓ 2 = holds / passes
```

---

## 2. Axis A — Physical Adherence (judge from the video alone)

| Sub-score | ✓ 2 | ⚠ 1 | ✗ 0 |
|---|---|---|---|
| `agent_consistency`<br>gripper/hand integrity | structure stable throughout | slight brief deformation/jitter, still recognisable as a gripper/hand | clearly **melting, twisting, vanishing, extra/missing limbs** |
| `scene_consistency`<br>background **and objects** | background + objects stable throughout | slight flicker/drift, one object briefly unstable | scene collapse, objects **teleporting, appearing/disappearing from nowhere, severe deformation** |
| `interaction_realism`<br>contact & forces | contact, grasp, forces all plausible | slight clipping / contact a bit unnatural but the action holds | obvious **clipping, moving an object while grasping nothing, violating gravity/inertia** |

**Main score 1–5** (holistic — informed by the sub-scores, **not a mechanical sum**):

| 5 | 4 | 3 | 2 | 1 |
|---|---|---|---|---|
| highly realistic, almost nothing to criticise | broadly realistic, minor flaws only | clearly inconsistent, watchable but obviously flawed | severe violations, scene still recognisable | physics completely broken |

> ⚠️ **`scene_consistency` covers BACKGROUND *and* OBJECTS.** Mass appearing from nowhere, an object
> teleporting, or severe warping is **`scene_consistency`**, *not* `interaction_realism`.
> `interaction_realism` is **contact / grasp / forces only**.

---

## 3. Axis B — Instruction Alignment (use instruction + `init_frame`)

Judge task semantics and completion — **not** image realism.

| Sub-score | ✓ 2 | ⚠ 1 | ✗ 0 |
|---|---|---|---|
| `agent_match` | right agent doing the right action | **action completed but slight agent mismatch** (e.g. asked for right hand, used left) | unrelated action / completely wrong agent |
| `object_correct` | operates on exactly the object named (object + colour) | partially correct / ambiguous / brushes an adjacent object | completely wrong object |
| `goal_completed` | instruction's end-state fully reached | partially done / close but not complete (e.g. lifted but never placed in) | not done / completely off |

**Main score 1–5:**

| 5 | 4 | 3 | 2 | 1 |
|---|---|---|---|---|
| fully compliant — agent, object, goal all correct and complete | broadly compliant, minor shortfall | partially deviating — one sub-score ⚠ or ✗ | clearly non-compliant — wrong action or object, several ✗ | completely non-compliant — wrong agent / no motion |

> ⚠️ **`object_correct` is about IDENTITY only** — is it the object the instruction named?

---

## 4. The rules that get broken most

1. **Sub-scores first, then the main score.** Judge each ✓/⚠/✗ objectively, then set the main score
   holistically. It is **not** a mechanical sum.
2. **🔴 USE THE ⚠ MIDDLE TIER.** This is the single most common failure. In the existing data
   `agent_match` and `object_correct` are almost only ✓ or ✗ — that is wrong. *"Used the wrong hand
   but completed the action"*, *"slight clipping"*, *"basically achieved but not fully"* are all ⚠.
3. **PA ignores the instruction entirely.** A video that flawlessly does the wrong thing is still PA 5.
4. **IA uses `init_frame` as the reference** for what the agent and scene started as.
5. **Notes are mandatory.** Every sub-score marked ⚠ or ✗ needs **one sentence of concrete visual
   evidence** — what you saw, and when.
6. **Default is 5 + all ✓.** Only move off that when you actually observe a problem.

### Worked examples (from the human FAQ)

| Situation | Correct scoring |
|---|---|
| Instruction says right hand, video uses left, everything else correct | `agent_match` = **⚠ 1**, others ✓; **IA main 3–4, not 1** |
| Slight clipping, but the goal is achieved | `interaction_realism` = ⚠; `goal_completed` = ✓; PA main 3–4, IA main 4–5 |
| Right agent, right object, right action, but stops halfway | `goal_completed` = ⚠; IA main = 3 |

---

## 5. Input format

`preannotation_queue_v1.json`:

```jsonc
{
  "_meta": { "predicate": "...", "denominators": {...}, "counts": {...} },
  "items": [
    {
      "item_id": "data__<dataset>__generated_data__<model>__<task>__<episode>__1__<file>",
      "dataset": "agibot_world", "model": "...", "task": "task_0004", "episode": "episode_0001",
      "video_url": "https://huggingface.co/.../resolve/main/....mp4",
      "init_frame_url": "https://huggingface.co/.../prompt/init_frame.png",
      "instruction_url": "https://huggingface.co/.../prompt/instruction.txt",
      "instruction": "Toast the two slices of bread ...",   // may be null -> fetch instruction_url
      "instruction_from_sibling_model": true                // see warning below
    }
  ],
  "excluded": [ { "...": "...", "_excluded_reason": "..." } ]
}
```

### 🔴 Three traps that will silently corrupt your output

1. **`prompt.txt` is NOT the instruction.** Many directories contain both. `instruction.txt` is the
   canonical task; **`prompt.txt` is the generator's input** — for `_prefix` models it has a physics
   preamble bolted on, and for `_rewrite` models **it describes a different, narrower action**.
   Measured: they differ for **22 of 24 models**. **Only ever read `instruction.txt` / the
   `instruction` field.**
2. **`instruction_from_sibling_model: true` is expected, not a bug.** That item's own directory has
   no `instruction.txt`, so the URL points at **another model's** directory for the **same
   `dataset|task|episode`**. The instruction is a property of the ground-truth episode; this was
   verified byte-identical across models on 22 GT keys spanning all 11 datasets.
3. **Video frame 0 IS the declared `init_frame`.** So if the content visibly departs from
   `init_frame`, that is **real drift** (`scene_consistency` ✗), not a framing artefact.

### Two things worth knowing before you trust your eyes

- **A near-static video is not automatically `goal_completed` ✗.** A small tool oscillating quickly
  reads as frozen in whole-frame statistics *and* in any every-Nth-frame sample. Track the object
  **every frame**, and compare path length against net displacement.
- **If an object appears to grow**, measure something you know is fixed **in the same frame**. If
  the invariant is unchanged, the object grew — the camera did not move.

---

## 6. Output format

One JSON object per item, matching the human schema exactly:

```json
{
  "item_id": "<copied verbatim from the input>",
  "payload": {
    "skip": false,
    "physical_adherence": 3,
    "instruction_alignment": 4,
    "agent_consistency": 2,
    "scene_consistency": 1,
    "interaction_realism": 2,
    "agent_match": 1,
    "object_correct": 2,
    "goal_completed": 2,
    "subs_v": 2,
    "physical_notes": "Scene: the silver tray has no clear source before frame 8 — appears mid-clip.",
    "instruction_notes": "Agent: instruction says right gripper, the left is used; task otherwise completed."
  }
}
```

- `physical_adherence` / `instruction_alignment` ∈ **1–5**
- the six sub-scores ∈ **0 / 1 / 2**
- **`subs_v` must be `2`**
- **all eight scores are required** on every item
- notes: required for every ⚠/✗ sub-score, and must cite **what was seen and roughly when**

### If an item is unusable

Do **not** invent scores. Emit:

```json
{ "item_id": "...", "report": true, "reason": "video will not decode | instruction contradicts init_frame | static black frames | other" }
```

`excluded` in the input already lists **45** items known to be unusable
(**38** are 48-byte stubs with no `moov` atom; **7** have no `instruction.txt` for their GT episode).
They are **not** in `items` — you do not need to handle them.

---

## 7. Scope of this queue — read the predicate, not the title

```
train_manifest_v2                                 11,617
  ├ has a pre-annotation                           5,183
  ├ has a human annotation                         3,628
  └ THIS QUEUE = no pre-annotation AND no human     5,891
        ├ excluded as unusable                         45
        └ items to label                            5,846
```

⚠️ **"Needs pre-annotation" has more than one true answer.** Strictly *"lacks a pre-annotation"* is
**6,434** — that includes **543** items which already carry a **human** annotation. Those 543 are
deliberately **not** in this queue. Always quote the predicate together with the number.

---

## 8. Ground rules

- **Never** guess a URL by string-stitching. Use the URLs in the JSON.
- Pre-annotations are **not** gold. They are a first pass to be reviewed by a human.
- Do not copy a previous item's scores forward. Each item is judged on its own.
- If you are unsure between two adjacent tiers, **prefer ⚠** — the middle tier is under-used, and an
  honest ⚠ is worth more than a confident ✗.

Reference work: VideoPhy / VideoPhy2, VideoScore / VideoScore2, WorldModelBench, WorldArena, VBench-2.0.

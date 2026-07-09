# Common Set 50 — Fair Comparison Subset

A **50-task controlled subset** of the 875-item benchmark where **all 11
video-generation models generate on the same prompts**. This eliminates the
prompt-pool confound in the full test set (in `gold_875.jsonl`, every model
covered a different subset of tasks), so per-model gold PA/IA and Kendall
distance to human ranking are directly comparable.

- Task list & fill matrix: `bench/common_set_50.json`
- Inference orchestrator: `bench/run_common_set_50.py`
- Per-model runners: `scripts_inference/run_<model>.sh`

## Models covered (11)

| Bucket | Models | Runner | Where checkpoints live |
|---|---|---|---|
| **API — DashScope** | `kling`, `happyhorse`, `vidu`, `wan26_flash` | `run_<model>.sh` → `run_api_parallel.py` → `DashScopeVideoGenerator` | `DASHSCOPE_API_KEY` env |
| **API — Google** | `veo31_lite` | `run_veo31lite.sh` → `run_api_parallel.py` | Google Cloud API key |
| **Local — open source** | `cogvideo_i2v_f113`, `wan22_ti2v5b_1280x704_f169` | `inference/*_generator.py` classes (bypassing the `run_local_parallel.py` wrapper — see note below) | HuggingFace / local paths |
| **Local — internal** | `gigaworld_gr1_2b_f113`, `abot_physworld_f113`, `wow_wan14b_f105`, `cosmos3` | Same as above | Internal cluster (need path from siyuan) |

> Note: `scripts_inference/run_cogvideo.sh`, `run_wan22.sh`, `run_gigaworld.sh`,
> `run_cosmos.sh` all invoke `run_local_parallel.py`, which is missing from
> this checkout. Ham runs local models by instantiating the generator classes
> directly (they subprocess each model's native `generate.py`), so the wrapper
> chain is bypassed for local generation. API side is unaffected —
> `run_api_parallel.py` is present.

## Numbers (from `common_set_50.json` summary)

| | count |
|---|---:|
| Tasks in fair set | 50 |
| Models | 11 |
| Total cells | 550 |
| Already generated (reused from 875 sweep) | 104 |
| **Need new generation** | **446** |
| … of which API (DashScope + Google) | 191 |
| … of which Ham local (cogvideo + wan22) | 85 |
| … of which internal checkpoint | 170 |
| Estimated API cost | **~$44** |

**Embodiment distribution** (supports fair per-embodiment ranking):

| Category | Datasets | Tasks |
|---|---|---:|
| Human hand | egodex_human, egoscaler_human, epickitchens_human | 16 |
| Dex hand | gr1_inlab | 14 |
| Gripper | agibot_world, droid, open_x_embodiment, robotwin | 20 |

## Task selection algorithm

Encoded in `bench/run_common_set_50.py` and reproduced in the manifest's
`strategy` field:

1. **Restrict to tasks with ≥1 API model already generated.** This keeps
   API top-up minimal. 161 tasks in `gold_875` qualify (up from 61 in an
   earlier draft that only counted veo+kling; expanding to
   veo/happyhorse/kling/wan26 broadened the pool).
2. **Sort ascending by "API topup cost per task"** = sum of prices of API
   models NOT yet covered. So a task where only kling is missing (cheapest
   at $0.20) is preferred over one missing both veo and happyhorse
   ($0.60 combined).
3. **Break ties by non-API coverage descending** — prefer tasks where more
   open-source / internal models already have a video, so their Ham /
   internal top-up is smaller.
4. **Balance embodiments**: 20 gripper + 16 human_hand + 14 dex_hand.
   Dex-hand is bounded by the fact that gr1_inlab is the only dex dataset;
   18 of its tasks qualify under rule #1 and we take 14 for the balanced
   split.

## Workflow

### 0. Prerequisites

```bash
# Repo layout (this file):
#   MLLM-as-Embodied-World-Judge/
#   ├── bench/
#   │   ├── common_set_50.json           # task list + fill matrix
#   │   ├── run_common_set_50.py         # orchestrator
#   │   ├── gold_875.jsonl               # source-of-truth for prompts/init frames
#   │   └── README_common_set_50.md      # this file
#   ├── scripts_inference/
#   │   ├── run_kling.sh                 # dashscope wrapper (new)
#   │   ├── run_happyhorse.sh            # dashscope wrapper (new)
#   │   ├── run_vidu.sh                  # dashscope wrapper (new)
#   │   ├── run_wan26flash.sh            # dashscope wrapper (existing)
#   │   ├── run_veo31lite.sh             # google cloud wrapper (existing)
#   │   └── run_{cogvideo,wan22,gigaworld,cosmos,wow}.sh  # local, currently broken
#   ├── inference/                       # generator classes (used by run_api_parallel + Ham direct)
#   └── run_api_parallel.py              # dashscope dispatcher

export DASHSCOPE_API_KEY="sk-…"          # kling + happyhorse + vidu + wan26_flash
export GOOGLE_API_KEY="…"                # veo31_lite
# optional:
export DASHSCOPE_BASE_URL="https://…"    # only if Vidu is on a workspace-specific MaaS endpoint
```

### 1. Dry-run to check the todo list per model

```bash
python bench/run_common_set_50.py --model kling
# → writes data/common_set_50/summary_kling.json (only the still-missing tasks)
# → prints the exact bash command that will be invoked
```

Skip logic — a `(task, model)` cell is dropped from the todo list if either:
- the manifest's `existing_generated[task]` already lists the model
  (video was generated in the original 875 sweep), OR
- the output path `data/common_set_50/generated_data/<test_name>/<task>/<episode>/1/<task>_<episode>.mp4`
  already exists on disk.

### 2. API batch

```bash
# Run every API model on its remaining tasks:
python bench/run_common_set_50.py --all-api --run
# equivalent to:
#   --model kling --model happyhorse --model vidu --model wan26_flash --model veo31_lite --run
```

Each shell wrapper calls `run_api_parallel.py`, which reads
`data/common_set_50/summary_<model>.json` (already filtered by the
orchestrator) and writes videos to
`data/common_set_50/generated_data/<test_name>/…`.

### 3. Local models (Ham's box)

Ham runs `wan22` and `cogvideo` via direct generator-class calls (not
through the `run_*.sh` wrappers, which invoke the missing
`run_local_parallel.py`). Whatever path he writes to, keep the layout
`<DATA_ROOT>/common_set_50/generated_data/<test_name>_common50/<task>/<episode>/1/<task>_<episode>.mp4`
so the orchestrator's skip-if-exists and Alice's judging can auto-pick
them up.

### 4. Internal-checkpoint models

`gigaworld_gr1_2b_f113`, `abot_physworld_f113`, `wow_wan14b_f105`,
`cosmos3` need checkpoints that live on siyuan's internal cluster.
Once checkpoint paths are known, either set the `CHECKPOINT_ROOT` env or
edit the wrappers' hardcoded paths.

### 5. Judge + rank

Alice's judging pipeline watches the output tree. When a model's 50 cells
are complete she runs flash on the new mp4s (skip-existing), computes
per-model gold PA/IA + K_norm, and once all 11 are done outputs the
fair-comparison ranking table + top-4 pairwise crown attempt.

## Output layout (post-generation)

```
data/common_set_50/
├── summary_kling.json             # filtered todo per model, written by orchestrator
├── summary_veo31_lite.json
├── summary_wan26_flash.json
├── …
└── generated_data/
    ├── kling_common50/
    │   ├── agibot_world/task_0009/episode_0001/1/task_0009_episode_0001.mp4
    │   ├── …
    ├── veo31_lite_common50/
    ├── wan22_ti2v5b_1280x704_f169_common50/
    ├── cogvideo_i2v_f113_common50/
    └── … (11 dirs, one per model)
```

## Extending / resuming

- **Rerun after a partial run**: safe. Both the manifest's
  `existing_generated` list and the on-disk `.mp4` check keep completed
  cells from being redone.
- **Add a new model**: add it to `all_models` in `common_set_50.json`,
  add a runner to `scripts_inference/`, add it to `DEFAULT_RUNNERS` and
  `DEFAULT_TEST_NAMES` in `run_common_set_50.py`.
- **Change task count**: rerun the selection code in the manifest's
  `strategy` field with different embodiment quotas.

## FAQ

- **Why 50 tasks?** Statistical power: with σ≈1.2 per-item, per-model mean
  SE is 0.17 at n=50, versus 0.22 at n=30. Detection threshold at α=0.05,
  power 0.8 is Δmean ≈ 0.48. Top-4 span is 0.23 (within-tier), so **n=50
  is enough to prove the top-4 are statistically tied and jointly beat
  cosmos3** (Δ=0.34), but not enough to crown a single #1 — the pairwise
  flash-judge step targets that.
- **Why `≥1 API` constraint?** Every task in this set already has at
  least one API video from the original 875 sweep. This means API top-up
  is bounded below by `n_tasks` (one clip per task needed for the
  missing API model), giving a hard floor on API cost that's independent
  of task count.
- **Why include vidu when it wasn't in `gold_875`?** siyuan's call —
  vidu is one of the top generative models we want to compare fairly.
  Adding it costs 50 fresh API generations (0 existing coverage) but
  slots it into the 11-way ranking cleanly.

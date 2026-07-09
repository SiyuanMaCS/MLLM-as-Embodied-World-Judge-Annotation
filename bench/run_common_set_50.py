#!/usr/bin/env python3
"""
run_common_set_50.py — Inference orchestrator for the fair 50-task common set.

Reads bench/common_set_50.json + bench/gold_875.jsonl to determine (per model):
  - which tasks still need a video generated
  - which tasks already have one on disk (skip)
For each requested model, emits a filtered summary.json under
  data/common_set_50/summary_<model>.json
and prints the shell command to invoke the model's existing runner.

Usage:
  # dry-run: only compute the per-model todo list, no inference
  python bench/run_common_set_50.py --model kling
  python bench/run_common_set_50.py --model wan26_flash --dry-run

  # generate all missing videos for one model (calls the runner)
  python bench/run_common_set_50.py --model kling --run

  # generate everything for every API model (siyuan: kling + veo + happyhorse + wan26 + vidu)
  python bench/run_common_set_50.py --all-api --run

  # generate everything Ham can pipeline (cogvideo + wan22_5b) on 4090
  python bench/run_common_set_50.py --all-ham --run

Skip logic: a (task, model) cell is skipped if either
  (a) common_set_50.json existing_generated already lists that model for the task
      (video was made in the original 875 sweep), OR
  (b) the expected output path already has an .mp4 file.

Path convention (matches run_api_parallel.py + run_local.py output layout):
  <DATA_ROOT>/common_set_50/generated_data/<TEST_NAME>/<task>/<episode>/1/<task>_<episode>.mp4
"""
from __future__ import annotations

import argparse
import json
import os
import subprocess
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
REPO = HERE.parent  # /tmp/annotate — but when invoked from mllm_judge root it'll be different
DEFAULT_MANIFEST = HERE / "common_set_50.json"
DEFAULT_GOLD = HERE / "gold_875.jsonl"       # if this script lives under mllm_judge/bench
DEFAULT_DATA_ROOT = "./data/common_set_50"
DEFAULT_SCRIPTS_DIR = Path("scripts_inference")

# Test-name convention used by the existing scripts. Keep in lock-step with
# whatever run_XXX.sh's TEST_NAME arg you pass — this is what the on-disk
# "generated_data/<TEST_NAME>/…" directory is called.
DEFAULT_TEST_NAMES = {
    "cogvideo_i2v_f113":        "cogvideo_i2v_f113_common50",
    "wan22_ti2v5b_1280x704_f169": "wan22_ti2v5b_1280x704_f169_common50",
    "wan26_flash":              "wan26_flash_common50",
    "veo31_lite":               "veo31_lite_common50",
    "happyhorse":               "happyhorse_common50",
    "kling":                    "kling_common50",
    "vidu":                     "vidu_common50",
    "gigaworld_gr1_2b_f113":    "gigaworld_gr1_2b_f113_common50",
    "abot_physworld_f113":      "abot_physworld_f113_common50",
    "wow_wan14b_f105":          "wow_wan14b_f105_common50",
    "cosmos3":                  "cosmos3_common50",
}

# Which shell wrapper handles which model. If a model isn't listed here you must
# either add a wrapper or drive it through run_api_parallel.py directly.
DEFAULT_RUNNERS = {
    "cogvideo_i2v_f113":        "scripts_inference/run_cogvideo.sh",
    "wan22_ti2v5b_1280x704_f169": "scripts_inference/run_wan22.sh",
    "wan26_flash":              "scripts_inference/run_wan26flash.sh",
    "veo31_lite":               "scripts_inference/run_veo31lite.sh",
    "happyhorse":               "scripts_inference/run_happyhorse.sh",   # siyuan: dashscope
    "kling":                    "scripts_inference/run_kling.sh",        # siyuan: dashscope
    "vidu":                     "scripts_inference/run_vidu.sh",         # siyuan: dashscope
    "gigaworld_gr1_2b_f113":    "scripts_inference/run_gigaworld.sh",
    "abot_physworld_f113":      "scripts_inference/run_abot.sh",
    "wow_wan14b_f105":          "scripts_inference/run_wow.sh",
    "cosmos3":                  "scripts_inference/run_cosmos.sh",
}

API_MODELS = ["veo31_lite", "happyhorse", "kling", "wan26_flash", "vidu"]
HAM_OPEN = ["cogvideo_i2v_f113", "wan22_ti2v5b_1280x704_f169"]
INTERNAL_CKPT = ["gigaworld_gr1_2b_f113", "abot_physworld_f113",
                 "wow_wan14b_f105", "cosmos3"]


def load_manifest(path: Path) -> dict:
    with open(path) as f:
        return json.load(f)


def load_gold_875(path: Path) -> dict:
    """key = 'dataset::task::episode' → the first gold_875 row for that key."""
    out = {}
    with open(path) as f:
        for line in f:
            d = json.loads(line)
            key = f"{d['dataset']}::{d['task']}::{d['episode']}"
            out.setdefault(key, d)
    return out


def expected_video_path(data_root: Path, test_name: str, task: str, episode: str) -> Path:
    return data_root / "generated_data" / test_name / task / episode / "1" / f"{task}_{episode}.mp4"


def build_summary_for_model(
    manifest: dict,
    gold: dict,
    model: str,
    data_root: Path,
    test_name: str,
) -> list:
    """Return list of task_info dicts that still need video generation for `model`.

    - filters out tasks whose existing_generated already includes `model`
    - filters out tasks whose expected video path already exists on disk
    - carries over dataset/task/episode/prompt fields from gold_875 for
      run_api_parallel.py / run_local.py compatibility
    """
    tasks = []
    for tkey in manifest["tasks"]:
        need = set(manifest["need_generate"].get(tkey, []))
        have = set(manifest["existing_generated"].get(tkey, []))
        # Only include if this model is in the need list AND wasn't already generated.
        if model not in need:
            continue
        if model in have:
            continue
        dataset, task, episode = tkey.split("::")
        # Skip if the video already exists at the expected path
        video = expected_video_path(data_root, test_name, task, episode)
        if video.exists():
            print(f"  [skip existing] {tkey} → {video.name}")
            continue
        # Copy the source task_info from gold_875 if available
        src = gold.get(tkey) or {}
        entry = {
            "dataset": dataset,
            "task_name": task,
            "episode_name": episode,
            "standard_name": src.get("item_id", f"{task}_{episode}"),
            "video_url_gt": src.get("video_url"),
            "init_frame_url": src.get("init_frame_url"),
            # Prompt fields: run_api_parallel.py reads via --prompt_key (e.g.
            # prompt_rewrite / prompt_refined). Keep both keys populated when
            # available so the runner script's default works.
            "prompt": src.get("prompt") or src.get("prompt_refined") or src.get("prompt_rewrite") or "",
            "prompt_rewrite": src.get("prompt_rewrite") or src.get("prompt") or "",
            "prompt_refined": src.get("prompt_refined") or src.get("prompt") or "",
        }
        tasks.append(entry)
    return tasks


def write_summary(tasks: list, data_root: Path, model: str) -> Path:
    out_dir = data_root
    out_dir.mkdir(parents=True, exist_ok=True)
    out = out_dir / f"summary_{model}.json"
    with open(out, "w") as f:
        json.dump(tasks, f, ensure_ascii=False, indent=2)
    return out


def build_command(model: str, data_root: Path, summary_path: Path, test_name: str,
                  runners: dict) -> list[str]:
    """Return the shell command to invoke inference for `model`."""
    script = runners.get(model)
    if not script:
        return ["echo", f"[TODO] no runner registered for {model}. Add a scripts_inference/run_{model}.sh wrapper."]
    dataset = "common_set_50"
    # The wrappers expect DATASET as arg1, TEST_NAME as arg2, etc.
    return ["bash", script, dataset, test_name]


def dispatch(model: str, manifest: dict, gold: dict, data_root: Path,
             runners: dict, test_names: dict, run: bool) -> tuple[str, int, int]:
    test_name = test_names.get(model, f"{model}_common50")
    tasks = build_summary_for_model(manifest, gold, model, data_root, test_name)
    need = manifest["per_model_need"].get(model, 0)
    print(f"\n=== {model} ===  need={need}, still todo after skip-existing={len(tasks)}")
    if not tasks:
        print(f"  ✓ nothing to do")
        return model, 0, 0
    summary_path = write_summary(tasks, data_root, model)
    print(f"  → wrote {summary_path}")
    cmd = build_command(model, data_root, summary_path, test_name, runners)
    print(f"  → command: {' '.join(cmd)}")
    if not run:
        return model, len(tasks), 0
    print(f"  ▶ running…")
    try:
        subprocess.run(cmd, check=True, cwd=Path.cwd())
        return model, len(tasks), len(tasks)
    except subprocess.CalledProcessError as e:
        print(f"  ✗ {model} failed: {e}")
        return model, len(tasks), 0


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--manifest", default=str(DEFAULT_MANIFEST),
                    help=f"path to common_set_50.json (default: {DEFAULT_MANIFEST})")
    ap.add_argument("--gold", default=str(DEFAULT_GOLD),
                    help=f"path to gold_875.jsonl (default: {DEFAULT_GOLD})")
    ap.add_argument("--data-root", default=DEFAULT_DATA_ROOT,
                    help=f"output data root (default: {DEFAULT_DATA_ROOT})")
    ap.add_argument("--model", action="append", default=[],
                    help="model name to run; repeat for multiple")
    ap.add_argument("--all-api", action="store_true",
                    help=f"shortcut for --model on each of: {', '.join(API_MODELS)}")
    ap.add_argument("--all-ham", action="store_true",
                    help=f"shortcut for --model on: {', '.join(HAM_OPEN)}")
    ap.add_argument("--all-internal", action="store_true",
                    help=f"shortcut for --model on: {', '.join(INTERNAL_CKPT)}")
    ap.add_argument("--all", action="store_true", help="every model in the manifest")
    ap.add_argument("--run", action="store_true",
                    help="actually invoke the inference runner (default: dry-run: print command + write summary_<model>.json)")
    args = ap.parse_args()

    manifest = load_manifest(Path(args.manifest))
    gold = load_gold_875(Path(args.gold))
    data_root = Path(args.data_root)

    models = list(args.model)
    if args.all:                models.extend(manifest["all_models"])
    if args.all_api:            models.extend(API_MODELS)
    if args.all_ham:            models.extend(HAM_OPEN)
    if args.all_internal:       models.extend(INTERNAL_CKPT)
    if not models:
        ap.error("choose --model X (repeatable) OR --all-api / --all-ham / --all-internal / --all")
    # dedup preserving order
    seen = set()
    models = [m for m in models if not (m in seen or seen.add(m))]

    print(f"Manifest: {args.manifest}")
    print(f"Data root: {data_root}")
    print(f"Models to process ({len(models)}): {', '.join(models)}")
    print(f"Mode: {'RUN' if args.run else 'DRY-RUN (write summary_<model>.json + print command)'}")

    results = []
    for m in models:
        results.append(dispatch(m, manifest, gold, data_root,
                                DEFAULT_RUNNERS, DEFAULT_TEST_NAMES, args.run))

    print("\n=== Summary ===")
    for model, todo, done in results:
        status = f"{done}/{todo} done" if args.run else f"{todo} pending"
        print(f"  {model}: {status}")


if __name__ == "__main__":
    sys.exit(main() or 0)

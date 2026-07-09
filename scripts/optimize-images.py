#!/usr/bin/env python3
"""
Optimize images for the ELSI website.

Reads source images from raw_images/, resizes/crops them to match
target slot dimensions, and outputs optimized WebP + JPEG files
to public/images/.

Usage:
  pip install Pillow
  python scripts/optimize-images.py
  python scripts/optimize-images.py --dry-run
  python scripts/optimize-images.py --slot story
  python scripts/optimize-images.py --quality 90
"""

import argparse
import json
import os
import sys
from pathlib import Path

try:
    from PIL import Image, ImageOps
except ImportError:
    print("Error: Pillow is required. Install with: pip install Pillow")
    sys.exit(1)


def load_config(path: str) -> dict:
    with open(path) as f:
        return json.load(f)


def format_size(size: int) -> str:
    if size < 1024:
        return f"{size}B"
    elif size < 1024 * 1024:
        return f"{size / 1024:.1f}KB"
    else:
        return f"{size / (1024 * 1024):.1f}MB"


def process_slot(config: dict, slot: dict, quality: int, dry_run: bool) -> dict:
    source_dir = Path(config["source_dir"])
    output_dir = Path(config["output_dir"])
    source_path = source_dir / slot["source"]

    if not source_path.exists():
        return {
            "slot": slot["id"],
            "status": "SKIPPED",
            "reason": f"Source not found: {source_path}",
        }

    original_size = source_path.stat().st_size
    original_img = Image.open(source_path)
    original_dims = f"{original_img.width}x{original_img.height}"

    output_dir.mkdir(parents=True, exist_ok=True)

    target_size = (slot["width"], slot["height"])

    if dry_run:
        return {
            "slot": slot["id"],
            "status": "DRY-RUN",
            "original": original_dims,
            "target": f"{slot['width']}x{slot['height']}",
            "original_size": format_size(original_size),
        }

    img = ImageOps.fit(original_img, target_size, method=Image.LANCZOS)
    original_img.close()

    result = {
        "slot": slot["id"],
        "status": "OK",
        "original": original_dims,
        "target": f"{slot['width']}x{slot['height']}",
        "original_size": format_size(original_size),
        "formats": [],
    }

    webp_path = output_dir / f"{slot['id']}.webp"
    img.save(webp_path, "WEBP", quality=quality)
    webp_size = webp_path.stat().st_size
    result["formats"].append(
        {
            "format": "webp",
            "size": format_size(webp_size),
            "savings": f"{100 - (webp_size * 100 // original_size)}%",
        }
    )

    jpg_path = output_dir / f"{slot['id']}.jpg"
    img.save(jpg_path, "JPEG", quality=quality, optimize=True)
    jpg_size = jpg_path.stat().st_size
    result["formats"].append(
        {
            "format": "jpg",
            "size": format_size(jpg_size),
            "savings": f"{100 - (jpg_size * 100 // original_size)}%",
        }
    )

    img.close()
    return result


def print_report(results: list[dict]):
    print(f"\n{'Slot':<12} {'Status':<10} {'Original':<14} {'Target':<12} {'WebP':<14} {'JPEG':<14} {'Savings':<10}")
    print("-" * 90)
    for r in results:
        if r["status"] in ("SKIPPED",):
            print(f"{r['slot']:<12} {r['status']:<10} {r.get('reason', ''):<70}")
        elif r["status"] == "DRY-RUN":
            print(f"{r['slot']:<12} {'DRY-RUN':<10} {r['original']:<14} {r['target']:<12} {r['original_size']:<30}")
        else:
            webp = r["formats"][0]
            jpg = r["formats"][1]
            print(
                f"{r['slot']:<12} {r['status']:<10} "
                f"{r['original']:>4}  {r['original_size']:<7} "
                f"{r['target']:<12} "
                f"{webp['size']:>6}  {webp['savings']:<5} "
                f"{jpg['size']:>6}  {jpg['savings']:<5}"
            )
    print()


def main():
    parser = argparse.ArgumentParser(description="Optimize images for ELSI website")
    parser.add_argument(
        "--config",
        default=os.path.join(os.path.dirname(__file__), "image-config.json"),
        help="Path to config JSON (default: scripts/image-config.json)",
    )
    parser.add_argument("--dry-run", action="store_true", help="Show what would be done without writing files")
    parser.add_argument("--slot", help="Process only a single slot ID")
    parser.add_argument("--quality", type=int, help="Override quality from config")
    args = parser.parse_args()

    config_path = args.config
    if not os.path.exists(config_path):
        print(f"Config not found: {config_path}")
        sys.exit(1)

    config = load_config(config_path)
    quality = args.quality or config.get("quality", 82)
    slots = config["slots"]

    if args.slot:
        slots = [s for s in slots if s["id"] == args.slot]
        if not slots:
            print(f"Slot '{args.slot}' not found in config")
            sys.exit(1)

    results = []
    for slot in slots:
        result = process_slot(config, slot, quality, args.dry_run)
        results.append(result)

    print_report(results)

    total_original = sum(
        r.get("original_size", 0) if r["status"] == "DRY-RUN" else 0
        for r in results
    )
    ok = sum(1 for r in results if r["status"] == "OK")
    skipped = sum(1 for r in results if r["status"] == "SKIPPED")
    dry = sum(1 for r in results if r["status"] == "DRY-RUN")

    parts = []
    if ok:
        parts.append(f"{ok} processed")
    if skipped:
        parts.append(f"{skipped} skipped")
    if dry:
        parts.append(f"{dry} dry-run")
    print(f"Done. {' | '.join(parts)}")


if __name__ == "__main__":
    main()

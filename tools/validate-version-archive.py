#!/usr/bin/env python3
"""Validate Sight Reading Coach version archive links."""
from __future__ import annotations

import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
MANIFESTS = [ROOT / "version-history.json", *sorted((ROOT / "archive").glob("v*/version-history.json"))]


def resolve_path(manifest: Path, raw_path: str) -> Path | None:
    if not raw_path or raw_path.startswith(("http://", "https://")):
        return None
    return (manifest.parent / raw_path).resolve()


def main() -> int:
    failures: list[str] = []
    for manifest in MANIFESTS:
        if not manifest.exists():
            failures.append(f"Missing manifest: {manifest.relative_to(ROOT)}")
            continue
        try:
            versions = json.loads(manifest.read_text())
        except json.JSONDecodeError as exc:
            failures.append(f"Invalid JSON in {manifest.relative_to(ROOT)}: {exc}")
            continue
        for entry in versions:
            raw_path = entry.get("path", "")
            target = resolve_path(manifest, raw_path)
            if target and not target.exists():
                failures.append(
                    f"{manifest.relative_to(ROOT)} entry {entry.get('version')} points to missing {raw_path}"
                )
    for archive_dir in sorted((ROOT / "archive").glob("v*")):
        if archive_dir.is_dir() and not (archive_dir / "index.html").exists():
            failures.append(f"Archive folder missing index.html: {archive_dir.relative_to(ROOT)}")
    if failures:
        print("Version archive validation failed:")
        for failure in failures:
            print(f"- {failure}")
        return 1
    print(f"Validated {len(MANIFESTS)} version manifest(s) and archive folders.")
    return 0


if __name__ == "__main__":
    sys.exit(main())

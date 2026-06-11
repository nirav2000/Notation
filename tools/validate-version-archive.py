#!/usr/bin/env python3
"""Validate Sight Reading Coach version archive links and client fallbacks."""
from __future__ import annotations

import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
ARCHIVE = ROOT / "archive"
MANIFESTS = [ROOT / "version-history.json", *sorted(ARCHIVE.glob("v*/version-history.json"))]
VERSION_RE = re.compile(r"const APP_VERSION = '([^']+)'")
FALLBACK_VERSION_RE = re.compile(r"version: '([^']+)'")
FALLBACK_PATH_RE = re.compile(r"path: '([^']*)'")


def resolve_path(manifest: Path, raw_path: str) -> Path | None:
    if not raw_path or raw_path.startswith(("http://", "https://", "file:")):
        return None
    return (manifest.parent / raw_path).resolve()


def read_manifest(path: Path, failures: list[str]) -> list[dict]:
    if not path.exists():
        failures.append(f"Missing manifest: {path.relative_to(ROOT)}")
        return []
    try:
        data = json.loads(path.read_text())
    except json.JSONDecodeError as exc:
        failures.append(f"Invalid JSON in {path.relative_to(ROOT)}: {exc}")
        return []
    if not isinstance(data, list):
        failures.append(f"Manifest must be a list: {path.relative_to(ROOT)}")
        return []
    return data


def validate_manifest_paths(manifest: Path, versions: list[dict], failures: list[str]) -> None:
    seen: set[str] = set()
    for entry in versions:
        version = str(entry.get("version", ""))
        if version in seen:
            failures.append(f"Duplicate version {version} in {manifest.relative_to(ROOT)}")
        seen.add(version)
        raw_path = entry.get("path", "")
        target = resolve_path(manifest, raw_path)
        if target and not target.exists():
            failures.append(f"{manifest.relative_to(ROOT)} entry {version} points to missing {raw_path}")
        if entry.get("status") != "future" and not raw_path:
            failures.append(f"Released entry {version} in {manifest.relative_to(ROOT)} has no path")


def validate_archive_dirs(root_versions: list[dict], failures: list[str]) -> None:
    root_previous = {entry.get("version") for entry in root_versions if entry.get("status") == "previous"}
    for archive_dir in sorted(ARCHIVE.glob("v*")):
        if not archive_dir.is_dir():
            continue
        version = archive_dir.name.removeprefix("v")
        if not (archive_dir / "index.html").exists():
            failures.append(f"Archive folder missing index.html: {archive_dir.relative_to(ROOT)}")
        if version not in root_previous:
            failures.append(f"Archive folder {archive_dir.relative_to(ROOT)} is not listed as previous in root manifest")


def validate_app_js(path: Path, expected_version: str | None, failures: list[str]) -> None:
    if not path.exists():
        failures.append(f"Missing JavaScript file: {path.relative_to(ROOT)}")
        return
    text = path.read_text()
    match = VERSION_RE.search(text)
    if not match:
        failures.append(f"Missing APP_VERSION in {path.relative_to(ROOT)}")
    elif expected_version and match.group(1) != expected_version:
        failures.append(f"APP_VERSION {match.group(1)} in {path.relative_to(ROOT)} does not match folder/manifest version {expected_version}")
    for raw_path in FALLBACK_PATH_RE.findall(text):
        target = resolve_path(path.parent / "version-history.json", raw_path)
        if target and not target.exists():
            failures.append(f"Fallback path {raw_path} in {path.relative_to(ROOT)} is missing")
    if "getAppBasePath" not in text or "resolveVersionPath" not in text:
        failures.append(f"{path.relative_to(ROOT)} is missing robust version path helpers")


def main() -> int:
    failures: list[str] = []
    root_versions: list[dict] = []
    for manifest in MANIFESTS:
        versions = read_manifest(manifest, failures)
        if manifest == ROOT / "version-history.json":
            root_versions = versions
        validate_manifest_paths(manifest, versions, failures)
    validate_archive_dirs(root_versions, failures)
    current = next((entry.get("version") for entry in root_versions if entry.get("status") == "current"), None)
    validate_app_js(ROOT / "app.js", current, failures)
    for archive_dir in sorted(ARCHIVE.glob("v*")):
        if archive_dir.is_dir() and (archive_dir / "app.js").exists():
            validate_app_js(archive_dir / "app.js", archive_dir.name.removeprefix("v"), failures)
    if failures:
        print("Version archive validation failed:")
        for failure in failures:
            print(f"- {failure}")
        return 1
    print(f"Validated {len(MANIFESTS)} version manifest(s), archive folders, APP_VERSION values, and fallback paths.")
    return 0


if __name__ == "__main__":
    sys.exit(main())

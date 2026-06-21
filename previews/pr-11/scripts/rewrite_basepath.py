#!/usr/bin/env python3
"""Rewrite absolute-root asset paths so a static site works under a subpath.

This repo uses absolute paths in HTML, e.g.:
  href="/css/base.css"
  src="/assets/js/data.js"

PR previews are served under /previews/... so those would break.
We rewrite ONLY in the preview build folder:

- href="/X"   -> href="{BASE}/X"
- src="/X"    -> src="{BASE}/X"
- url(/X)     -> url({BASE}/X)

It only touches .html and .css files.
"""

from __future__ import annotations

import re
import sys
from pathlib import Path


def main() -> int:
    if len(sys.argv) != 3:
        print("Usage: rewrite_basepath.py <root_dir> <base_path>", file=sys.stderr)
        return 2

    root = Path(sys.argv[1]).resolve()
    base = sys.argv[2].rstrip("/")
    if not base.startswith("/"):
        base = "/" + base

    # Avoid rewriting protocol-relative URLs (//example.com)
    href_re = re.compile(r'href="/(?!/)')
    src_re = re.compile(r'src="/(?!/)')
    url_re = re.compile(r"url\(/(?!/)")

    exts = {".html", ".css"}

    for p in root.rglob("*"):
        if not p.is_file() or p.suffix.lower() not in exts:
            continue

        text = p.read_text(encoding="utf-8", errors="ignore")
        new = text
        new = href_re.sub(f'href="{base}/', new)
        new = src_re.sub(f'src="{base}/', new)
        new = url_re.sub(f'url({base}/', new)

        if new != text:
            p.write_text(new, encoding="utf-8")

    return 0


if __name__ == "__main__":
    raise SystemExit(main())

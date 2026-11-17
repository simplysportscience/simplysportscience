#!/bin/bash
cd "$(dirname "$0")"
echo "Simply Sport Science - image tidy"
if ! command -v python3 >/dev/null 2>&1; then
  echo "Python 3 is not installed. A Mac window may offer to install it - click Install, wait, then double-click this file again."
  python3 --version 2>/dev/null
  read -p "Press Enter to close"; exit 1
fi
python3 -m pip install --quiet --user Pillow 2>/dev/null || python3 -m pip install --quiet --user --break-system-packages Pillow
python3 tidy_assets.py
echo
echo "All done. You can close this window and go to GitHub Desktop."
read -p "Press Enter to close"

#!/usr/bin/env python3
"""Simply Sport Science - tidy and shrink slide images so the site fits GitHub Pages' 1 GB limit.
Run from inside your repo folder:   python3 tidy_assets.py
Add --dry-run to preview without changing anything.
Needs Pillow:  pip3 install Pillow
"""
import os, shutil, sys
from PIL import Image
DRY = '--dry-run' in sys.argv
ROOT = os.getcwd()
PRES = os.path.join(ROOT, 'assets', 'presentations')
if not os.path.isdir(PRES):
    sys.exit('Run this from the repo folder (the one containing the assets folder).')
UNUSED = ['cam-biomechanics','cam-biomechanics-slides','cam-cardiovascular-system','cam-cardiovascular-system-slides','cam-ethics-deviance','cam-ethics-deviance-slides','cam-information-processing','cam-information-processing-slides','cam-respiratory-system','cam-sociocultural-issues','cam-sociocultural-issues-slides','cam-theories-of-learning']
def say(m): print(('[dry run] ' if DRY else '')+m)
# 1. move decks from "assets 3" into assets/presentations (never overwrite)
src = os.path.join(ROOT, 'assets 3', 'presentations')
if os.path.isdir(src):
    for d in sorted(os.listdir(src)):
        dst = os.path.join(PRES, d)
        if os.path.exists(dst): say(f'skip (already exists): {d}')
        else:
            say(f'move: {d}')
            if not DRY: shutil.move(os.path.join(src, d), dst)
# 2. delete duplicate asset folders
for extra in ['assets 3', 'assets 4']:
    p = os.path.join(ROOT, extra)
    if os.path.isdir(p):
        say(f'delete folder: {extra}')
        if not DRY: shutil.rmtree(p)
# 3. delete unused decks
for d in UNUSED:
    p = os.path.join(PRES, d)
    if os.path.isdir(p):
        say(f'delete unused deck: {d}')
        if not DRY: shutil.rmtree(p)
# 4. shrink JPEGs: max 1280px wide, quality 72
before = after = n = 0
for dp, _, fs in os.walk(os.path.join(ROOT, 'assets')):
    for f in fs:
        if not f.lower().endswith(('.jpg', '.jpeg')): continue
        p = os.path.join(dp, f); size = os.path.getsize(p); before += size
        try:
            im = Image.open(p); w = im.width
            if w <= 1280 and size < 150_000: after += size; continue
            im = im.convert('RGB')
            if w > 1280: im = im.resize((1280, round(im.height*1280/w)), Image.LANCZOS)
            tmp = p + '.tmp'
            im.save(tmp, format='JPEG', quality=72, optimize=True, progressive=True)
            new = os.path.getsize(tmp)
            if new < size:
                after += new; n += 1
                if DRY: os.remove(tmp)
                else: os.replace(tmp, p)
            else:
                os.remove(tmp); after += size
        except Exception as e: print('could not process', p, e); after += size
print(f'\nImages shrunk: {n}.  Size before: {before/1e6:.0f} MB, after: {after/1e6:.0f} MB')

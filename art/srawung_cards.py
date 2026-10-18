"""Crop the 32 Srawung animal photos out of the Canva card pages (design DAHYX5J9_CM, PNG export, 8 pages).
Each page has 4 front cards (photo in a green frame) next to their backs; the frame is found by scanning for
its green border, so a slightly shifted card still crops cleanly.
Usage: art/.venv/bin/python -I art/srawung_cards.py <dir with page-1.png..page-8.png> art/export/layers/extra"""
import sys
from PIL import Image

PAGES = [  # top-left, top-right, bottom-left, bottom-right front card on each page
    ['burung', 'gajah', 'kuda', 'ikan'],
    ['harimau', 'kucing', 'pinguin', 'singa'],
    ['katak', 'ayam', 'jerapah', 'monyet'],
    ['elang', 'kelinci', 'sapi', 'nyamuk'],
    ['kupu-kupu', 'ular', 'bebek', 'serigala'],
    ['panda', 'buaya', 'kura-kura', 'unta'],
    ['kambing', 'anjing', 'lebah', 'merak'],
    ['laba-laba', 'landak', 'jangkrik', 'cumi-cumi'],
]
src, out = sys.argv[1], sys.argv[2]


def inner(line):
    """Inner edges of the green frame along one scan line: end of the first green run, start of the last."""
    runs, prev = [], None
    for v in line:
        if prev is None or v != prev + 1:
            runs.append([v, v])
        runs[-1][1] = prev = v
    return runs[0][1] + 1, runs[-1][0]


for n, names in enumerate(PAGES, 1):
    im = Image.open(f'{src}/page-{n}.png').convert('RGB')
    k = im.width / 1600  # card centres below are in 1600-px page units
    green = lambda x, y: (lambda c: c[1] > 150 and c[0] < 120 and c[2] < 120)(im.getpixel((x, y)))
    for name, (cx, cy) in zip(names, [(246, 278), (988, 278), (246, 780), (988, 780)]):
        cx, cy, r = int(cx * k), int(cy * k), int(180 * k)
        x0, x1 = inner([x for x in range(cx - r, cx + r) if green(x, cy)])
        y0, y1 = inner([y for y in range(cy - r, cy + r) if green(cx, y)])
        i = int(12 * k)  # past the frame's rounded inner corners
        im.crop((x0 + i, y0 + i, x1 - i, y1 - i)).save(f'{out}/animal-{name}.png')
        print(name, x1 - x0, y1 - y0)

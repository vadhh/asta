"""Cut the emotion faces out of the p3 cards (flood-fill the card background from its edges)
so the app can draw tiles + selected state in CSS. Writes layers/extra/face-<emotion>.png."""
import sys, glob, os
import cv2, numpy as np
src, out = sys.argv[1], sys.argv[2]
for f in sorted(glob.glob(f'{src}/card-*.png')):
    name = os.path.basename(f)[5:-4].replace('-selected', '')
    im = cv2.imread(f, cv2.IMREAD_UNCHANGED)
    h, w = im.shape[:2]
    i = int(min(h, w) * (0.2 if 'selected' in f else 0.16))  # skip the tile border / green ring / check badge
    body = np.ascontiguousarray(im[i:h - i, i:w - i, :3])
    bh, bw = body.shape[:2]
    mask = np.zeros((bh + 2, bw + 2), np.uint8)
    flags = 4 | cv2.FLOODFILL_MASK_ONLY | cv2.FLOODFILL_FIXED_RANGE | (255 << 8)
    for x in range(0, bw, 4):
        for y in (0, bh - 1):
            if not mask[y + 1, x + 1]: cv2.floodFill(body, mask, (x, y), 0, (22,) * 3, (22,) * 3, flags)
    for y in range(0, bh, 4):
        for x in (0, bw - 1):
            if not mask[y + 1, x + 1]: cv2.floodFill(body, mask, (x, y), 0, (22,) * 3, (22,) * 3, flags)
    bg = mask[1:-1, 1:-1]
    alpha = cv2.GaussianBlur(cv2.erode(255 - bg, np.ones((2, 2), np.uint8)), (3, 3), 0)
    rgba = np.dstack([body, alpha])
    ys, xs = np.where(alpha > 8)
    rgba = rgba[ys.min():ys.max() + 1, xs.min():xs.max() + 1]
    cv2.imwrite(f'{out}/face-{name}.png', rgba)
    print(name, rgba.shape[1], rgba.shape[0])

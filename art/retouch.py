# usage: retouch.py <in.png> <out.png> <x0,y0,x1,y1> [...]
# Inpaints specks inside each box that stand out from the box's own edge tone (paper colour). Alpha untouched.
import sys, cv2, numpy as np
src, dst, boxes = sys.argv[1], sys.argv[2], [tuple(map(int, b.split(","))) for b in sys.argv[3:]]
im = cv2.imread(src, cv2.IMREAD_UNCHANGED); rgb = np.ascontiguousarray(im[..., :3])
mask = np.zeros(rgb.shape[:2], np.uint8)
for x0, y0, x1, y1 in boxes:
    roi = rgb[y0:y1, x0:x1].astype(np.int16)
    edge = np.concatenate([roi[0], roi[-1], roi[:, 0], roi[:, -1]])
    ref = np.median(edge, axis=0)  # paper tone just outside the defect
    mask[y0:y1, x0:x1] = (np.abs(roi - ref).max(2) > 7).astype(np.uint8) * 255
mask = cv2.dilate(mask, np.ones((9, 9), np.uint8))
for x0, y0, x1, y1 in boxes:  # never let dilation leak past the box
    keep = np.zeros_like(mask); keep[y0:y1, x0:x1] = 1; mask &= keep * 255
im[..., :3] = cv2.inpaint(rgb, mask, 9, cv2.INPAINT_TELEA)
cv2.imwrite(dst, im)
print(dst, "masked px:", int((mask > 0).sum()))

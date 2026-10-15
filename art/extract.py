# usage: extract.py <pdf> <outdir>
# Pulls every art layer (image with soft mask, native-res) out of a Canva PDF page.
# Rasterized text shows up as oversampled images (native px >> placed px) and is skipped.
import fitz, json, sys, os
from PIL import Image, ImageDraw
pdf, out = sys.argv[1], sys.argv[2]
os.makedirs(out, exist_ok=True)
d = fitz.open(pdf); p = d[0]; k = 1600 / p.rect.width
layers = []
for info in p.get_image_info(xrefs=True):
    x0, y0, x1, y1 = [v * k for v in info["bbox"]]
    w, h = info["width"], info["height"]
    if x1 - x0 >= 1590 and y1 - y0 >= 890:
        continue  # background (downsampled in PDF; exported separately as PNG)
    if w / (x1 - x0) > 1.5:
        continue  # rasterized text
    pix = fitz.Pixmap(d, info["xref"])
    smask = d.extract_image(info["xref"]).get("smask")
    if smask:
        pix = fitz.Pixmap(pix, fitz.Pixmap(d, smask))
    name = f"{len(layers):02d}"
    pix.save(f"{out}/{name}.png")
    layers.append({"file": f"{name}.png", "x": round(x0), "y": round(y0), "w": w, "h": h})
json.dump(layers, open(f"{out}/layers.json", "w"), indent=1)
# contact sheet for naming
cols, cell = 6, 200
sheet = Image.new("RGB", (cols * cell, ((len(layers) + cols - 1) // cols) * (cell + 20)), "#888")
dr = ImageDraw.Draw(sheet)
for i, l in enumerate(layers):
    im = Image.open(f"{out}/{l['file']}"); im.thumbnail((cell - 10, cell - 10))
    cx, cy = (i % cols) * cell, (i // cols) * (cell + 20)
    sheet.paste(im, (cx + 5, cy + 5), im if im.mode == "RGBA" else None)
    dr.text((cx + 5, cy + cell), f"{i:02d} {l['w']}x{l['h']}", fill="white")
sheet.save(f"{out}/_sheet.png")
print(len(layers), "layers")

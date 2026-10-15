"""Crop the four Srawung animal photos out of art/source/page-7.png (inside their green frames).
Usage: art/.venv/bin/python -I art/animals.py art/source/page-7.png art/export/layers/extra"""
import sys
from PIL import Image
im = Image.open(sys.argv[1]); out = sys.argv[2]
i = 12  # inset past the green border
for name,(x0,y0,x1,y1) in {'burung':(255,112,452,335),'gajah':(855,112,1052,335),'kuda':(255,518,452,742),'ikan':(855,518,1052,742)}.items():
    im.crop((x0+i,y0+i,x1-i,y1-i)).save(f'{out}/animal-{name}.png')

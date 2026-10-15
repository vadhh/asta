# usage: ops.py manifest.json add            -> add_page ops (white+black per layer)
#        ops.py manifest.json fill ids.json  -> insert_fill ops given ordered new page ids
import json, sys
m = json.load(open(sys.argv[1]))
if sys.argv[2] == "add":
    ops = []
    for name, _, _, _, w, h in m["layers"]:
        for tag, col in (("w", "#ffffff"), ("k", "#000000")):
            ops.append({"type": "add_page", "width": w, "height": h, "title": f"{name}-{tag}", "background_color": col})
else:
    ids = json.load(open(sys.argv[3]))
    ops = []
    for i, (name, mid, _, _, w, h) in enumerate(m["layers"]):
        for j in (0, 1):
            ops.append({"type": "insert_fill", "page_id": ids[2*i+j], "asset_type": "image", "asset_id": mid, "alt_text": name, "top": 0, "left": 0, "width": w, "height": h})
print(json.dumps(ops, separators=(",", ":")))

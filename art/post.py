# usage: post.py <node uuid list file>  -- POST each manifest file to its Figma upload URL
import json, sys, subprocess, concurrent.futures as cf
items = {i["node"]: i for i in json.load(open("manifest/figma-items.json"))}
pairs = [l.split() for l in open(sys.argv[1]) if l.strip()]
def post(p):
    node, uid = p; it = items[node]
    fname = f"{it['scene']}--{it['name']}.png"
    r = subprocess.run(["curl", "-s", "-o", "/dev/null", "-w", "%{http_code}", "-F", f"file=@{it['file']};type=image/png;filename={fname}",
        f"https://mcp.figma.com/mcp/upload/{uid}/submit?scaleMode=FILL&currentPageId=0%3A1"], capture_output=True, text=True)
    return node, r.stdout
with cf.ThreadPoolExecutor(8) as ex:
    res = list(ex.map(post, pairs))
bad = [r for r in res if r[1] != "200"]
print(len(res), "posted; failures:", bad)

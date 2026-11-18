# Traces a black-line drawing (transparent PNG/WebP) into single-stroke SVG paths for /v/why.
# Usage: python3 scripts/trace-line-art.py public/images/why-thread/business.webp out.json 520
# Needs numpy, opencv-python, scikit-image, pillow.
import sys, json
import numpy as np, cv2
from PIL import Image
from skimage.morphology import skeletonize

src, out, W = sys.argv[1], sys.argv[2], int(sys.argv[3])
im = Image.open(src).convert("RGBA")
im = im.resize((W, round(im.height * W / im.width)), Image.LANCZOS)
a = np.array(im)[..., 3]
b = a > 90
sk = skeletonize(b).astype(np.uint8)
H, Wd = sk.shape
nb = [(-1,-1),(-1,0),(-1,1),(0,-1),(0,1),(1,-1),(1,0),(1,1)]
def neigh(y, x):
    for dy, dx in nb:
        yy, xx = y+dy, x+dx
        if 0 <= yy < H and 0 <= xx < Wd and sk[yy, xx]: yield yy, xx
deg = np.zeros_like(sk, dtype=np.int32)
ys, xs = np.nonzero(sk)
for y, x in zip(ys, xs): deg[y, x] = sum(1 for _ in neigh(y, x))
visited = set()  # edges as frozenset pairs
def walk(y, x):
    path = [(x, y)]
    py, px = None, None
    cy, cx = y, x
    while True:
        nxt = None
        for ny, nx in neigh(cy, cx):
            e = frozenset(((cy, cx), (ny, nx)))
            if e in visited: continue
            nxt = (ny, nx); break
        if nxt is None: break
        visited.add(frozenset(((cy, cx), nxt)))
        cy, cx = nxt
        path.append((cx, cy))
        if deg[cy, cx] != 2: break
    return path
paths = []
starts = [(y, x) for y, x in zip(ys, xs) if deg[y, x] != 2]
for y, x in starts:
    for _ in range(8):
        p = walk(y, x)
        if len(p) > 1: paths.append(p)
        else: break
# loops (all degree 2)
for y, x in zip(ys, xs):
    for ny, nx in neigh(y, x):
        if frozenset(((y, x), (ny, nx))) not in visited:
            p = walk(y, x)
            if len(p) > 1: paths.append(p)
res = []
for p in paths:
    arr = np.array(p, dtype=np.float32).reshape(-1, 1, 2)
    length = cv2.arcLength(arr, False)
    if length < 8: continue
    ap = cv2.approxPolyDP(arr, 0.9, False).reshape(-1, 2)
    d = "M" + " L".join(f"{x:.0f} {y:.0f}" for x, y in ap)
    res.append({"d": d, "len": float(length), "y": float(ap[:, 1].mean()), "x": float(ap[:, 0].mean())})
# order: bottom to top, like something being built up
res.sort(key=lambda r: -r["y"])
json.dump({"w": Wd, "h": H, "paths": [r["d"] for r in res]}, open(out, "w"))
print(len(res), "paths", Wd, H, sum(len(r["d"]) for r in res), "chars")

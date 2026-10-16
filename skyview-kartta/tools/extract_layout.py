"""Lukee opastekartan PDF:stä tiestön ja kohteiden sijainnit 3D-näkymää varten.

Käyttö: python3 -I tools/extract_layout.py <opastekartta.pdf>
Tuottaa: src/assets/roads.png (tiemaski) ja src/layout.json (sijainnit pisteinä, pt).
"""
import json
import subprocess
import sys
import tempfile
from pathlib import Path

import pdfplumber
from PIL import Image, ImageFilter

ROOT = Path(__file__).resolve().parent.parent
PDF = sys.argv[1]
DPI = 100
# Kartta-alue sivulla (pt). Kaikki koordinaatit annetaan tämän suhteen.
BOX = (60, 140, 1461.5, 1800)

# Uusin nimilista (vaalea kartta, 2026). Numeroa 50 ei ole kartalla.
NAMES = {
    1: "Aries", 2: "Scorpio", 3: "Gemini", 4: "Leo", 5: "Capricorn", 6: "Taurus", 7: "Libra",
    8: "Sagitta", 9: "Lyra", 10: "Virgo", 11: "Cassiopeia", 12: "Pegasus", 13: "Auriga",
    14: "Ursa Major", 15: "Aquarius", 16: "Corvus", 17: "Lynx", 18: "Sagittarius", 19: "Lupus",
    20: "Hercules", 21: "Cygnus", 22: "Grus", 23: "Cepheus", 24: "Phoenix", 25: "Centarius",
    26: "Tucana", 27: "Apus", 28: "Dorado", 29: "Octans", 30: "Lepus", 31: "Pavo", 32: "Volans",
    33: "Monoceros", 34: "Pictor", 35: "Musca", 36: "Boötes", 37: "Caelum", 38: "Lacerta",
    39: "Pyxis", 40: "Sculptor", 41: "Antlia", 42: "Ara", 43: "Vela", 44: "Triangulum",
    45: "Reticulum", 46: "Norma", 47: "Equuleus", 48: "Cetus", 49: "Aquila", 51: "Columba",
}


def rel(x, y):
    return [round(x - BOX[0], 1), round(y - BOX[1], 1)]


with pdfplumber.open(PDF) as pdf:
    words = pdf.pages[0].extract_words()

badges = [w for w in words if w["text"].isdigit() and int(w["text"]) <= 51 and abs((w["bottom"] - w["top"]) - 13) < 4]
labels = [w for w in words if not w["text"].isdigit() and 8 < (w["bottom"] - w["top"]) < 10.5]
is_cabin = lambda w: w["x0"] < 600 and w["top"] < 1110

igloos, cabins = [], []
for b in badges:
    n = int(b["text"])
    if is_cabin(b):
        # Mökin numeropallo on mökin vasemmalla (12–18 ja 5–11) tai oikealla puolella.
        if 12 <= n <= 18:
            x, y = b["x0"] + 30, b["top"] + 14
        elif 5 <= n <= 11:
            x, y = b["x0"] + 30, b["top"] - 2
        else:
            x, y = b["x0"] - 22, b["top"] + 6
        cabins.append({"n": n, "pos": rel(x, y)})
    else:
        # Iglun numero on kuvakkeen oikeassa yläkulmassa; nimi kuvakkeen alla.
        tx, ty = b["x0"] - 22, b["top"] + 43
        lab = min(labels, key=lambda w: ((w["x0"] + w["x1"]) / 2 - tx) ** 2 + (w["top"] - ty) ** 2)
        x = (lab["x0"] + lab["x1"]) / 2
        if lab["text"] == "URSA":
            x = lab["x1"] + 3
        igloos.append({"n": n, "name": NAMES.get(n, ""), "pos": rel(x, lab["top"] - 20)})

igloos.sort(key=lambda i: i["n"])
cabins.sort(key=lambda c: c["n"])

layout = {
    "unit": "pt (1 pt ≈ 0.25 m)",
    "size": [round(BOX[2] - BOX[0], 1), round(BOX[3] - BOX[1], 1)],
    "igloos": igloos,
    "cabins": cabins,
    # Rakennukset ja merkit karttakuvakkeiden kohdalta (arvioitu kuvakkeen keskeltä).
    "buildings": {
        "reception": {"pos": rel(1046, 846), "size": [130, 42], "angle": 0},
        "safariHouse": {"pos": rel(941, 930), "size": [80, 22], "angle": -57.6},
        "hut": {"pos": rel(886, 1300), "size": [22, 22], "angle": 0},  # siirretty: metsään parkkipaikan eteläpuolelle (käyttäjä 16.10.2026)
        "hut2": {"pos": rel(1017, 1080), "size": [20, 16], "angle": 0},
    },
    "points": {
        # Pysäköinti autorivin luona, kokoontumispaikka sen itäpuolella (16.10.2026: opastekartan merkit ovat toisinpäin)
        "parking": rel(814, 1066),
        # Pysäköintialueen lumivalli (vinoviivoitus) päästä päähän
        "snowbankA": rel(758, 1066),
        "snowbankB": rel(855, 1124),
        "assembly": rel(852, 1066),
        "reindeerEast": rel(1178, 702),  # siirretty pohjoiseen (käyttäjä 16.10.2026)
        "ovalDome": rel(300, 911),
        "ovalFire": rel(368, 930),
        "ovalReindeer": rel(442, 958),
    },
}
(ROOT / "src" / "layout.json").write_text(json.dumps(layout, ensure_ascii=False, indent=1))
print("igloos", len(igloos), "cabins", len(cabins))

# Tiemaski: tiet ovat sivulla vaaleamman ruskeita (≈ 53,35,30).
with tempfile.TemporaryDirectory() as tmp:
    subprocess.run(["pdftoppm", "-r", str(DPI), "-f", "1", "-l", "1", "-png", PDF, f"{tmp}/p"], check=True)
    im = Image.open(next(Path(tmp).glob("p*.png"))).convert("RGB")
k = DPI / 72
im = im.crop(tuple(round(v * k) for v in BOX))
r, g, b = im.split()
mask = Image.merge("RGB", (r, g, b)).point(lambda v: v)  # kopio
px = im.load()
out = Image.new("L", im.size, 0)
op = out.load()
for yy in range(im.size[1]):
    for xx in range(im.size[0]):
        R, G, B = px[xx, yy]
        if 46 <= R <= 62 and 30 <= G <= 42 and 25 <= B <= 37:
            op[xx, yy] = 255
# Pysäköintialueen P- ja kokoontumispaikkamerkit ovat tien päällä: täytä ne.
from PIL import ImageDraw
ImageDraw.Draw(out).rectangle([round(v * k) for v in (798 - BOX[0], 1050 - BOX[1], 866 - BOX[0], 1082 - BOX[1])], fill=255)
# Sulje kuvakkeiden ja tekstien jättämät aukot, poista ohuet korkeuskäyrät.
out = out.filter(ImageFilter.MaxFilter(9)).filter(ImageFilter.MinFilter(9))
out = out.filter(ImageFilter.MinFilter(5)).filter(ImageFilter.MaxFilter(5))
# Poista irralliset täplät (selite, kuvakkeiden reunat): säilytä vain isot yhtenäiset alueet.
W, H = out.size
pix = bytearray(1 if v > 127 else 0 for v in out.tobytes())
seen = bytearray(W * H)
keep = bytearray(W * H)
for start in range(W * H):
    if not pix[start] or seen[start]:
        continue
    comp, stack = [], [start]
    seen[start] = 1
    while stack:
        i = stack.pop()
        comp.append(i)
        x, y = i % W, i // W
        for j in (i - 1 if x else -1, i + 1 if x < W - 1 else -1, i - W, i + W):
            if 0 <= j < W * H and pix[j] and not seen[j]:
                seen[j] = 1
                stack.append(j)
    if len(comp) > 5000:
        for i in comp:
            keep[i] = 255
out = Image.frombytes("L", (W, H), bytes(keep))
out = out.filter(ImageFilter.GaussianBlur(1.5))
out = out.resize((1024, round(1024 * out.size[1] / out.size[0])), Image.LANCZOS)
out.save(ROOT / "src" / "assets" / "roads.png", optimize=True)
print("roads", out.size)

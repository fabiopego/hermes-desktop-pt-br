"""Gera docs/img/banner-v2.1.webp a partir das capturas docs/img/tela-*.webp.
Mascote: Nous Girl (c) Nous Research, usada pequena como referencia; o projeto NAO e oficial.
Uso: python tools/make-banner.py  (precisa de docs/img/_nous-girl.png, nao versionado)"""
from PIL import Image, ImageDraw, ImageFont, ImageFilter
import os
F = "C:/Windows/Fonts/"
font = lambda n, s: ImageFont.truetype(F + n, s)
D = os.path.join(os.path.dirname(__file__), "..", "docs", "img")
imgs = {k: Image.open(os.path.join(D, f"tela-{k}.webp")).convert("RGB") for k in ("idioma", "notificacoes")}
W, H = 1600, 640
bg = Image.new("RGB", (W, H)); d = ImageDraw.Draw(bg)
for y in range(H):
    t = y / H; d.line([(0, y), (W, y)], fill=(int(247 - 10 * t), int(248 - 4 * t), int(252 - 14 * t)))
d.rectangle([0, 0, W, 8], fill=(31, 157, 85)); d.rectangle([W * 0.62, 0, W, 8], fill=(250, 204, 21))
def card(img, w):
    h = int(img.size[1] * w / img.size[0]); im = img.resize((w, h), Image.LANCZOS); pad = 14
    sh = Image.new("RGBA", (w + pad * 2 + 30, h + pad * 2 + 30), (0, 0, 0, 0))
    ImageDraw.Draw(sh).rounded_rectangle([pad + 6, pad + 14, pad + 6 + w, pad + 14 + h], 14, fill=(20, 30, 60, 70))
    sh = sh.filter(ImageFilter.GaussianBlur(14))
    m = Image.new("L", (w, h), 0); ImageDraw.Draw(m).rounded_rectangle([0, 0, w, h], 12, fill=255)
    sh.paste(im, (pad, pad), m); return sh
base = bg.convert("RGBA")
# duas capturas, compactadas: texto (esq.) + interruptor/seletor (dir.) lado a lado, sem o vao do meio
def compact(img, h, pad=12):
    l = img.crop((0, 0, 600, h)); r = img.crop((930, 0, 1168, h))
    o = Image.new("RGB", (l.size[0] + r.size[0], h + pad), (11, 29, 34)); o.paste(l, (0, pad)); o.paste(r, (l.size[0], pad)); return o
c1 = compact(imgs["idioma"], 205); c2 = compact(imgs["notificacoes"], 290)
base.alpha_composite(card(c1, 660), (884, 100))
base.alpha_composite(card(c2, 660), (884, 322))
d = ImageDraw.Draw(base)
# mascote em medalhao
S = 104; ng = Image.open(os.path.join(D, "_nous-girl.png")).convert("RGB").resize((S - 10, S - 10), Image.LANCZOS)
ring = Image.new("RGBA", (S, S), (0, 0, 0, 0)); rd = ImageDraw.Draw(ring)
rd.ellipse([0, 0, S - 1, S - 1], fill=(31, 157, 85, 255)); rd.ellipse([4, 4, S - 5, S - 5], fill=(255, 255, 255, 255))
mk = Image.new("L", (S - 10, S - 10), 0); ImageDraw.Draw(mk).ellipse([0, 0, S - 11, S - 11], fill=255)
ring.paste(ng, (5, 5), mk); base.alpha_composite(ring, (70, 62))
d.rounded_rectangle([196, 74, 456, 120], 23, fill=(31, 157, 85))
d.text((218, 81), "PLUGIN NÃO OFICIAL", font=font("segoeuib.ttf", 22), fill="white")
d.text((198, 126), "Ícone: Nous Girl, © Nous Research", font=font("segoeui.ttf", 18), fill=(75, 85, 99))
d.text((70, 188), "Hermes Desktop", font=font("segoeuib.ttf", 92), fill=(17, 24, 39))
d.text((70, 290), "em Português", font=font("segoeuib.ttf", 92), fill=(31, 157, 85))
d.text((74, 416), "A interface do Hermes em português do Brasil.", font=font("segoeui.ttf", 32), fill=(55, 65, 81))
d.text((74, 462), "Atualizou o Hermes? A tradução continua lá.", font=font("segoeuib.ttf", 34), fill=(17, 24, 39))
for i, (n, l) in enumerate([("5.552", "textos traduzidos"), ("0", "recompilações"), ("0.22.7", "Hermes testado")]):
    x = 74 + i * 270
    d.text((x, 536), n, font=font("segoeuib.ttf", 50), fill=(31, 157, 85)); d.text((x, 592), l, font=font("segoeui.ttf", 21), fill=(55, 65, 81))
out = base.convert("RGB"); out.save(os.path.join(D, "banner-v2.1.webp"), quality=88, method=6); out.save(os.path.join(D, "_preview.png"))
print("ok", os.path.getsize(os.path.join(D, "banner-v2.1.webp")) // 1024, "KB")

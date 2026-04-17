#!/usr/bin/env python3
"""
Generate 3 branded placeholder images for the README screenshots section,
while real product screenshots aren't captured yet.

Output: docs/screenshots/{import,review,results}.png (1400x900 each)
"""
from PIL import Image, ImageDraw, ImageFont
from pathlib import Path

W, H = 1400, 900
OUT_DIR = Path(__file__).resolve().parent.parent / "docs" / "screenshots"
OUT_DIR.mkdir(parents=True, exist_ok=True)

BG_TOP = (15, 23, 42)
BG_BOTTOM = (23, 37, 84)
CARD = (30, 41, 59)
BORDER = (71, 85, 105)
TEXT_PRIMARY = (248, 250, 252)
TEXT_SECONDARY = (203, 213, 225)
TEXT_MUTED = (148, 163, 184)
ACCENT_BLUE = (59, 130, 246)
ACCENT_EMERALD = (52, 211, 153)
ACCENT_AMBER = (251, 191, 36)

FONT_BOLD = "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"
FONT_REG = "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"
FONT_MONO = "/usr/share/fonts/truetype/dejavu/DejaVuSansMono.ttf"


def gradient(size, top, bottom):
    img = Image.new("RGB", size, top)
    d = ImageDraw.Draw(img)
    for y in range(size[1]):
        t = y / size[1]
        r = int(top[0] + (bottom[0] - top[0]) * t)
        g = int(top[1] + (bottom[1] - top[1]) * t)
        b = int(top[2] + (bottom[2] - top[2]) * t)
        d.line([(0, y), (size[0], y)], fill=(r, g, b))
    return img


def text_wh(draw, text, font):
    l, t, r, b = draw.textbbox((0, 0), text, font=font)
    return r - l, b - t


def draw_header(draw, step_num, step_name):
    # Top bar
    draw.rectangle([0, 0, W, 72], fill=(15, 23, 42))
    draw.line([(0, 72), (W, 72)], fill=BORDER, width=1)

    # Brand top-left
    f_brand = ImageFont.truetype(FONT_BOLD, 22)
    draw.rounded_rectangle([30, 20, 62, 52], radius=7, fill=ACCENT_BLUE)
    tw, th = text_wh(draw, "T", f_brand)
    draw.text((30 + (32 - tw) / 2, 20 + (32 - th) / 2 - 3), "T",
              fill=TEXT_PRIMARY, font=ImageFont.truetype(FONT_BOLD, 20))
    draw.text((75, 22), "CryptoTaxLocal", fill=TEXT_PRIMARY, font=f_brand)

    # Step indicator right
    f_step = ImageFont.truetype(FONT_BOLD, 18)
    steps = [("1", "Import"), ("2", "Review"), ("3", "Results")]
    x = W - 30
    for num, name in reversed(steps):
        active = num == step_num
        label = f"{num}. {name}"
        lw, lh = text_wh(draw, label, f_step)
        color = ACCENT_EMERALD if active else TEXT_MUTED
        draw.text((x - lw, 26), label, fill=color, font=f_step)
        x -= lw + 24

    # Placeholder stripe
    f_ph = ImageFont.truetype(FONT_REG, 14)
    msg = "Placeholder · remplacer par une vraie capture d'ecran"
    mw, mh = text_wh(draw, msg, f_ph)
    draw.rectangle([0, 72, W, 98], fill=(251, 191, 36, 255))
    draw.text(((W - mw) / 2, 72 + (26 - mh) / 2 - 1), msg,
              fill=(15, 23, 42), font=f_ph)


def card(draw, xy, radius=14, fill=CARD, outline=BORDER, width=1):
    draw.rounded_rectangle(xy, radius=radius, fill=fill,
                           outline=outline, width=width)


def make_import():
    img = gradient((W, H), BG_TOP, BG_BOTTOM)
    d = ImageDraw.Draw(img, "RGBA")
    draw_header(d, "1", "Import")

    # Privacy banner
    f_body = ImageFont.truetype(FONT_REG, 18)
    f_bold = ImageFont.truetype(FONT_BOLD, 18)
    card(d, [90, 140, W - 90, 200], radius=12,
         fill=(16, 76, 58), outline=(16, 185, 129), width=1)
    d.text((120, 160), "100% local.",
           fill=ACCENT_EMERALD, font=f_bold)
    d.text((240, 160),
           "Vos donnees ne quittent jamais votre navigateur. Aucun serveur, aucun compte, aucun tracking.",
           fill=(134, 239, 172), font=f_body)

    # Dropzone
    dz_x0, dz_y0, dz_x1, dz_y1 = 90, 240, W - 90, 700
    # Dashed border
    d.rounded_rectangle([dz_x0, dz_y0, dz_x1, dz_y1], radius=16,
                        fill=(30, 41, 59, 180), outline=ACCENT_BLUE, width=2)
    f_h = ImageFont.truetype(FONT_BOLD, 42)
    f_s = ImageFont.truetype(FONT_REG, 22)
    title = "Glissez votre fichier CSV ici"
    sub = "ou cliquez pour selectionner — Binance, Kraken, Coinbase detectes automatiquement"
    tw, th = text_wh(d, title, f_h)
    sw, sh = text_wh(d, sub, f_s)
    d.text(((W - tw) / 2, dz_y0 + 170), title,
           fill=TEXT_PRIMARY, font=f_h)
    d.text(((W - sw) / 2, dz_y0 + 170 + th + 16), sub,
           fill=TEXT_SECONDARY, font=f_s)

    # Demo button
    f_btn = ImageFont.truetype(FONT_BOLD, 20)
    btn_text = "Essayer avec des donnees de demonstration"
    bw, bh = text_wh(d, btn_text, f_btn)
    btn_x = (W - (bw + 64)) / 2
    btn_y = dz_y0 + 170 + th + sh + 60
    d.rounded_rectangle([btn_x, btn_y, btn_x + bw + 64, btn_y + bh + 28],
                        radius=(bh + 28) // 2,
                        fill=ACCENT_BLUE)
    d.text((btn_x + 32, btn_y + 14), btn_text,
           fill=TEXT_PRIMARY, font=f_btn)

    # Footer hint
    f_foot = ImageFont.truetype(FONT_REG, 16)
    foot = "Formats supportes : Binance (4 variantes) · Kraken · Coinbase"
    fw, fh = text_wh(d, foot, f_foot)
    d.text(((W - fw) / 2, H - 80), foot, fill=TEXT_MUTED, font=f_foot)

    img.convert("RGB").save(OUT_DIR / "import.png", "PNG", optimize=True)


def make_review():
    img = gradient((W, H), BG_TOP, BG_BOTTOM)
    d = ImageDraw.Draw(img, "RGBA")
    draw_header(d, "2", "Review")

    f_h = ImageFont.truetype(FONT_BOLD, 28)
    f_s = ImageFont.truetype(FONT_REG, 18)
    d.text((90, 130), "Verifiez vos transactions",
           fill=TEXT_PRIMARY, font=f_h)
    d.text((90, 170), "142 transactions detectees · Binance · annee fiscale 2025",
           fill=TEXT_SECONDARY, font=f_s)

    # Table
    tx_x0, tx_y0, tx_x1, tx_y1 = 90, 220, W - 90, 780
    card(d, [tx_x0, tx_y0, tx_x1, tx_y1], radius=12)

    # Header row
    f_th = ImageFont.truetype(FONT_BOLD, 15)
    f_td = ImageFont.truetype(FONT_MONO, 15)
    cols = ["Date", "Type", "Actif", "Quantite", "Prix unitaire", "Frais", "Total"]
    col_x = [tx_x0 + 24, tx_x0 + 220, tx_x0 + 340, tx_x0 + 480,
             tx_x0 + 680, tx_x0 + 900, tx_x0 + 1080]
    d.rectangle([tx_x0, tx_y0, tx_x1, tx_y0 + 44],
                fill=(51, 65, 85))
    for c, x in zip(cols, col_x):
        d.text((x, tx_y0 + 14), c, fill=TEXT_SECONDARY, font=f_th)

    rows = [
        ("2025-01-12 10:30", "BUY",  "BTC",  "0.5000",   "38 500,00 EUR",  "0,0005 BNB",  "19 250,00 EUR"),
        ("2025-02-20 14:15", "BUY",  "ETH",  "5.0000",   "2 200,00 EUR",   "0,0050 BNB",  "11 000,00 EUR"),
        ("2025-03-10 09:00", "SELL", "BTC",  "0.2000",   "42 000,00 EUR",  "0,0002 BNB",  "8 400,00 EUR"),
        ("2025-04-05 16:45", "BUY",  "ETH",  "2.0000",   "3 100,00 EUR",   "0,0020 BNB",  "6 200,00 EUR"),
        ("2025-06-15 11:20", "SELL", "BTC",  "0.1500",   "58 000,00 EUR",  "0,0002 BNB",  "8 700,00 EUR"),
        ("2025-08-01 08:30", "SELL", "ETH",  "3.0000",   "2 800,00 EUR",   "0,0030 BNB",  "8 400,00 EUR"),
        ("2025-10-20 13:00", "BUY",  "BTC",  "0.1000",   "62 000,00 EUR",  "0,0001 BNB",  "6 200,00 EUR"),
        ("2025-11-15 10:00", "SELL", "BTC",  "0.1500",   "90 000,00 EUR",  "0,0002 BNB",  "13 500,00 EUR"),
    ]
    row_h = 42
    for i, r in enumerate(rows):
        y = tx_y0 + 44 + i * row_h
        if i % 2 == 0:
            d.rectangle([tx_x0, y, tx_x1, y + row_h],
                        fill=(40, 52, 72))
        type_color = (244, 114, 182) if r[1] == "SELL" else (110, 231, 183)
        for idx, (val, x) in enumerate(zip(r, col_x)):
            color = type_color if idx == 1 else TEXT_SECONDARY
            d.text((x, y + 12), val, fill=color, font=f_td)

    # CTA
    f_btn = ImageFont.truetype(FONT_BOLD, 18)
    btn_text = "Calculer ma plus-value"
    bw, bh = text_wh(d, btn_text, f_btn)
    btn_x = W - 90 - (bw + 48)
    btn_y = 810
    d.rounded_rectangle([btn_x, btn_y, btn_x + bw + 48, btn_y + bh + 22],
                        radius=10, fill=ACCENT_BLUE)
    d.text((btn_x + 24, btn_y + 11), btn_text,
           fill=TEXT_PRIMARY, font=f_btn)

    img.convert("RGB").save(OUT_DIR / "review.png", "PNG", optimize=True)


def make_results():
    img = gradient((W, H), BG_TOP, BG_BOTTOM)
    d = ImageDraw.Draw(img, "RGBA")
    draw_header(d, "3", "Results")

    # Big summary card
    f_lbl = ImageFont.truetype(FONT_REG, 16)
    f_val = ImageFont.truetype(FONT_BOLD, 36)
    f_sm = ImageFont.truetype(FONT_REG, 14)

    # KPI cards (3 across)
    card_y0, card_y1 = 130, 300
    gap = 24
    cw = (W - 180 - gap * 2) / 3
    stats = [
        ("Plus-value imposable", "+ 8 450,00 EUR", ACCENT_EMERALD),
        ("PFU (31,4%)", "2 653,30 EUR", ACCENT_BLUE),
        ("Vs bareme progressif", "- 480,00 EUR", TEXT_MUTED),
    ]
    for i, (lbl, val, color) in enumerate(stats):
        x0 = 90 + i * (cw + gap)
        card(d, [x0, card_y0, x0 + cw, card_y1], radius=12)
        d.text((x0 + 24, card_y0 + 24), lbl,
               fill=TEXT_MUTED, font=f_lbl)
        d.text((x0 + 24, card_y0 + 60), val,
               fill=color, font=f_val)
        d.text((x0 + 24, card_y0 + 120),
               "Annee fiscale 2025" if i == 0 else
               "IR 12,8% + PS 18,6%" if i == 1 else
               "Option avantageuse PFU",
               fill=TEXT_SECONDARY, font=f_sm)

    # Form 2086 helper
    f_h = ImageFont.truetype(FONT_BOLD, 22)
    f_code = ImageFont.truetype(FONT_MONO, 18)
    card_y0, card_y1 = 340, 620
    card(d, [90, card_y0, W - 90, card_y1], radius=12)
    d.text((120, card_y0 + 24),
           "Aide formulaire 2086 — Cases a remplir",
           fill=TEXT_PRIMARY, font=f_h)
    d.text((120, card_y0 + 62),
           "Reportez ces valeurs sur votre declaration 2042-C",
           fill=TEXT_SECONDARY, font=f_lbl)

    boxes = [
        ("3AN", "Plus-values imposables au PFU", "8 450,00 EUR", ACCENT_EMERALD),
        ("3BN", "Moins-values reportables", "0,00 EUR", TEXT_MUTED),
        ("3CN", "Option pour le bareme progressif", "Non", TEXT_MUTED),
    ]
    by = card_y0 + 110
    for code, desc, val, color in boxes:
        # Code pill
        cw2, ch2 = text_wh(d, code, ImageFont.truetype(FONT_BOLD, 18))
        d.rounded_rectangle([120, by, 120 + cw2 + 24, by + 40],
                            radius=6, fill=(71, 85, 105))
        d.text((132, by + 9), code,
               fill=TEXT_PRIMARY, font=ImageFont.truetype(FONT_BOLD, 18))
        d.text((120 + cw2 + 44, by + 11), desc,
               fill=TEXT_SECONDARY, font=f_lbl)
        vw, vh = text_wh(d, val, f_code)
        d.text((W - 90 - vw - 30, by + 11), val,
               fill=color, font=f_code)
        by += 56

    # Export button
    f_btn = ImageFont.truetype(FONT_BOLD, 20)
    btn_text = "Exporter le rapport PDF"
    bw, bh = text_wh(d, btn_text, f_btn)
    btn_x = (W - (bw + 64)) / 2
    btn_y = 670
    d.rounded_rectangle([btn_x, btn_y, btn_x + bw + 64, btn_y + bh + 28],
                        radius=(bh + 28) // 2,
                        fill=ACCENT_EMERALD)
    d.text((btn_x + 32, btn_y + 14), btn_text,
           fill=(15, 23, 42), font=f_btn)

    # Disclaimer
    f_small = ImageFont.truetype(FONT_REG, 14)
    disc = "Estimation indicative · pour une declaration precise, consultez un expert-comptable specialise"
    dw, dh = text_wh(d, disc, f_small)
    d.text(((W - dw) / 2, 800), disc, fill=TEXT_MUTED, font=f_small)

    img.convert("RGB").save(OUT_DIR / "results.png", "PNG", optimize=True)


if __name__ == "__main__":
    make_import()
    make_review()
    make_results()
    print("Wrote:",
          OUT_DIR / "import.png",
          OUT_DIR / "review.png",
          OUT_DIR / "results.png")

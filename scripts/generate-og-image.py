#!/usr/bin/env python3
"""
Generate og-image.png (1200x630) for CryptoTaxLocal social shares.

Palette matches the app (Tailwind):
  - bg gradient: slate-900 -> blue-950
  - accent: blue-500 (#3b82f6)
  - emerald: emerald-400 (#34d399)

Run:
  python3 scripts/generate-og-image.py
Output:
  public/og-image.png
"""
from PIL import Image, ImageDraw, ImageFont
from pathlib import Path

W, H = 1200, 630
PAD = 60
OUT = Path(__file__).resolve().parent.parent / "public" / "og-image.png"

BG_TOP = (15, 23, 42)
BG_BOTTOM = (23, 37, 84)
TEXT_PRIMARY = (248, 250, 252)
TEXT_SECONDARY = (203, 213, 225)
TEXT_MUTED = (148, 163, 184)
ACCENT_BLUE = (59, 130, 246)
ACCENT_EMERALD = (52, 211, 153)
BORDER = (71, 85, 105)
CARD_BG = (30, 41, 59, 230)

FONT_BOLD = "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"
FONT_REG = "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"
FONT_MONO = "/usr/share/fonts/truetype/dejavu/DejaVuSansMono-Bold.ttf"


def vertical_gradient(size, top, bottom):
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


def main():
    img = vertical_gradient((W, H), BG_TOP, BG_BOTTOM)

    # Soft color glows
    glow = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    gd = ImageDraw.Draw(glow)
    gd.ellipse([-250, -300, 500, 400], fill=(59, 130, 246, 45))
    gd.ellipse([820, 380, 1400, 900], fill=(52, 211, 153, 30))
    img = Image.alpha_composite(img.convert("RGBA"), glow)
    draw = ImageDraw.Draw(img, "RGBA")

    # ---- Top row: logo + brand (left) | pill (right) ----
    logo_size = 64
    logo_x, logo_y = PAD, PAD
    draw.rounded_rectangle(
        [logo_x, logo_y, logo_x + logo_size, logo_y + logo_size],
        radius=14,
        fill=ACCENT_BLUE,
    )
    f_logo = ImageFont.truetype(FONT_BOLD, 40)
    tw, th = text_wh(draw, "T", f_logo)
    draw.text(
        (logo_x + (logo_size - tw) / 2 - 1, logo_y + (logo_size - th) / 2 - 6),
        "T",
        fill=TEXT_PRIMARY,
        font=f_logo,
    )

    f_brand = ImageFont.truetype(FONT_BOLD, 40)
    brand_text = "CryptoTaxLocal"
    bw, bh = text_wh(draw, brand_text, f_brand)
    draw.text(
        (logo_x + logo_size + 18, logo_y + (logo_size - bh) / 2 - 4),
        brand_text,
        fill=TEXT_PRIMARY,
        font=f_brand,
    )

    # Pill top-right
    pill_text = "Open source · MIT · $0 / mois"
    f_pill = ImageFont.truetype(FONT_REG, 20)
    pw, ph = text_wh(draw, pill_text, f_pill)
    pill_w = pw + 32
    pill_h = ph + 18
    pill_x = W - PAD - pill_w
    pill_y = PAD + (logo_size - pill_h) // 2
    draw.rounded_rectangle(
        [pill_x, pill_y, pill_x + pill_w, pill_y + pill_h],
        radius=pill_h // 2,
        fill=CARD_BG,
        outline=BORDER,
        width=2,
    )
    draw.text(
        (pill_x + 16, pill_y + (pill_h - ph) / 2 - 2),
        pill_text,
        fill=TEXT_SECONDARY,
        font=f_pill,
    )

    # ---- Headline ----
    # Line 1 (white): "Calculateur d'impots crypto"
    # Line 2 (emerald, big): "100% local."
    f_h1 = ImageFont.truetype(FONT_BOLD, 62)
    f_h2 = ImageFont.truetype(FONT_BOLD, 86)

    y_headline = 180
    line1 = "Calculateur d'impots crypto"
    line2 = "100% local."
    # Ensure line1 fits
    l1w, l1h = text_wh(draw, line1, f_h1)
    if l1w > W - 2 * PAD:
        # step down font size until it fits
        size = 62
        while l1w > W - 2 * PAD and size > 40:
            size -= 2
            f_h1 = ImageFont.truetype(FONT_BOLD, size)
            l1w, l1h = text_wh(draw, line1, f_h1)

    draw.text((PAD, y_headline), line1, fill=TEXT_PRIMARY, font=f_h1)
    draw.text((PAD, y_headline + l1h + 12), line2, fill=ACCENT_EMERALD, font=f_h2)

    # ---- Sub-headline ----
    sub = "Pas de compte. Pas d'upload. Vos donnees ne quittent jamais votre navigateur."
    f_sub = ImageFont.truetype(FONT_REG, 26)
    sw, sh = text_wh(draw, sub, f_sub)
    # Wrap if needed
    if sw > W - 2 * PAD:
        mid = sub.rfind(" ", 0, len(sub) // 2 + 20)
        sub_l1 = sub[:mid]
        sub_l2 = sub[mid + 1:]
        draw.text((PAD, 430), sub_l1, fill=TEXT_SECONDARY, font=f_sub)
        draw.text((PAD, 430 + sh + 4), sub_l2, fill=TEXT_SECONDARY, font=f_sub)
    else:
        draw.text((PAD, 438), sub, fill=TEXT_SECONDARY, font=f_sub)

    # ---- Feature chips bottom ----
    chips = [
        ("Art. 150 VH bis", ACCENT_BLUE),
        ("PFU 31,4%", ACCENT_EMERALD),
        ("Export PDF 2086", ACCENT_BLUE),
        ("Binance / Kraken / Coinbase", ACCENT_EMERALD),
    ]
    f_chip = ImageFont.truetype(FONT_BOLD, 20)
    gap = 12
    # Measure total
    widths = []
    for label, _ in chips:
        cw, ch = text_wh(draw, label, f_chip)
        widths.append((cw + 32, ch + 18))
    total_w = sum(w for w, _ in widths) + gap * (len(chips) - 1)
    start_x = PAD
    if total_w > W - 2 * PAD:
        # shrink font
        f_chip = ImageFont.truetype(FONT_BOLD, 18)
        widths = []
        for label, _ in chips:
            cw, ch = text_wh(draw, label, f_chip)
            widths.append((cw + 28, ch + 16))
        total_w = sum(w for w, _ in widths) + gap * (len(chips) - 1)

    chip_y = H - PAD - widths[0][1] - 8
    x = start_x
    for (label, color), (cw, ch) in zip(chips, widths):
        draw.rounded_rectangle(
            [x, chip_y, x + cw, chip_y + ch],
            radius=ch // 2,
            fill=CARD_BG,
            outline=color,
            width=2,
        )
        lw, lh = text_wh(draw, label, f_chip)
        draw.text(
            (x + (cw - lw) / 2, chip_y + (ch - lh) / 2 - 2),
            label,
            fill=color,
            font=f_chip,
        )
        x += cw + gap

    # ---- URL bottom-right (above chips so no overlap) ----
    url_text = "cryptotaxlocal.com"
    f_url = ImageFont.truetype(FONT_MONO, 22)
    uw, uh = text_wh(draw, url_text, f_url)
    draw.text(
        (W - PAD - uw, chip_y - uh - 18),
        url_text,
        fill=TEXT_MUTED,
        font=f_url,
    )

    # Save
    OUT.parent.mkdir(parents=True, exist_ok=True)
    img.convert("RGB").save(OUT, "PNG", optimize=True)
    print(f"Wrote {OUT} ({OUT.stat().st_size // 1024} KB)")


if __name__ == "__main__":
    main()

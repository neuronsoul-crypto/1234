# -*- coding: utf-8 -*-
"""Объёмные изображения эконом-шкафа: внешний вид и каркас (диметрия)."""
import math
import random
from reportlab.lib.units import mm
from reportlab.lib.colors import HexColor
from geom import *
from draw import *

GRASS = HexColor('#B9CDA0')
GRAVEL3 = HexColor('#D8D2C4')
PLASTER = HexColor('#ECE5D8')
PLINTH = HexColor('#B7AC9A')
DARK = HexColor('#2B2E33')
PNC = HexColor('#5E8A6A')        # профнастил RAL 6005-подобный, осветлён для печати
PNC_D = HexColor('#456B51')
WOOD3 = HexColor('#E8C893')
OSBC = HexColor('#E4C07E')


def env(ax, house=True, ground=True):
    rnd = random.Random(7)
    if ground:
        ax.face([(-1600, HOUSE_Y, 0), (2600, HOUSE_Y, 0), (2600, 1900, 0), (-1600, 1900, 0)], GRASS, stroke=None)
        g = [(-250, HOUSE_Y, 0), (1250, HOUSE_Y, 0), (1250, 900, 0), (-250, 900, 0)]
        ax.face(g, GRAVEL3, stroke=shade(GRAVEL3, 0.8), lw=0.3)
        c = ax.c
        c.saveState()
        for _ in range(600):
            x = rnd.uniform(-240, 1240)
            y = rnd.uniform(HOUSE_Y + 5, 890)
            px, py = ax.P(x, y, 0)
            c.setFillColor(shade(GRAVEL3, rnd.uniform(0.72, 0.95)))
            c.circle(px, py, rnd.uniform(0.15, 0.35) * mm, stroke=0, fill=1)
        c.restoreState()
    if house:
        ax.face([(-1600, HOUSE_Y, 0), (2600, HOUSE_Y, 0), (2600, HOUSE_Y, 3200), (-1600, HOUSE_Y, 3200)],
                PLASTER, stroke=None)
        ax.face([(-1600, HOUSE_Y, 0), (2600, HOUSE_Y, 0), (2600, HOUSE_Y, 450), (-1600, HOUSE_Y, 450)],
                PLINTH, stroke=None)
        for zz in (150, 300):
            ax.line((-1600, HOUSE_Y, zz), (2600, HOUSE_Y, zz), color=shade(PLINTH, 0.85), lw=0.25)
        ax.line((-1600, HOUSE_Y, 450), (2600, HOUSE_Y, 450), color=shade(PLINTH, 0.7), lw=0.4)
    # пустота под шкафом и опоры
    ax.box(-PN, W + PN, -PN, D + 10, 0, CLAD_Z0, DARK, stroke=None)
    for (x0, x1) in BLK_X:
        ax.box(x0, x1, BLK_Y[0], BLK_Y[1], 0, Z_BLK, HexColor('#A7A7A2'), lw=0.25)


def right_side(ax):
    # правая боковая обшивка
    xs = W + PN
    prof = [(-PN, Z_B - T), (T, Z_B - T), (T, zu(T)), (D - T, zu(D - T)), (D - T, Z_F - T), (D, Z_F - T)]
    side = [(xs, -PN, CLAD_Z0), (xs, D, CLAD_Z0)] + [(xs, y, z) for (y, z) in reversed(prof)]
    ax.face(side, shade(PNC, 0.86), lw=0.35)
    y = -PN + 30
    while y < D - 5:
        zt = side_top(y)
        ax.line((xs, y, CLAD_Z0), (xs, y, zt), color=shade(PNC, 0.62), lw=0.3)
        ax.line((xs, y + 22, CLAD_Z0), (xs, y + 22, side_top(y + 22)), color=shade(PNC, 1.08), lw=0.25)
        y += WAVE
    # концы прогонов за обшивкой
    ax.box(W + PN, PURLIN_X[1], 0, T, Z_B - T, Z_B, WOOD3, lw=0.3)


def front_closed(ax, shadow=True):
    xs = W + PN
    # передний прогон, продух
    ax.box(PURLIN_X[0], PURLIN_X[1], D - T, D, Z_F - T, Z_F, WOOD3, lw=0.3)
    ax.face([(OPEN_X[0], D, VENT_Z[0]), (OPEN_X[1], D, VENT_Z[0]), (OPEN_X[1], D, VENT_Z[1]),
             (OPEN_X[0], D, VENT_Z[1])], HexColor('#3A3F44'), lw=0.3)
    for xx in range(OPEN_X[0] + 15, OPEN_X[1], 30):
        ax.line((xx, D + 1, VENT_Z[0]), (xx, D + 1, VENT_Z[1]), color=HexColor('#6E767E'), lw=0.15)
    ax.box(OPEN_X[0], OPEN_X[1], D - T, D, Z_HEADER[0], Z_HEADER[1], WOOD3, lw=0.3)
    # двери: рамки (видны в притворе) и листы
    for (x0, x1) in (DOOR_L, DOOR_R):
        ax.box(x0, x1, DOOR_Y[0], DOOR_Y[1], FRAME_Z[0], FRAME_Z[1], WOOD3, lw=0.25)
    for (x0, x1), dy in ((SHEET_L, 0), (SHEET_R, 1.5)):
        y0, y1 = SHEET_DOOR_Y[0] + dy, SHEET_DOOR_Y[1] + dy
        ax.box(x0, x1, y0, y1, DOOR_Z[0], DOOR_Z[1], PNC, lw=0.4)
        xx = x0 + 20
        while xx < x1 - 10:
            ax.line((xx, y1, DOOR_Z[0]), (xx, y1, DOOR_Z[1]), color=shade(PNC, 0.6), lw=0.3)
            ax.line((xx + 22, y1, DOOR_Z[0]), (xx + 22, y1, DOOR_Z[1]), color=shade(PNC, 1.15), lw=0.2)
            xx += WAVE
    # петли, ручки, проушина
    for zc in HINGE_Z:
        ax.box(-6, 4, D - 2, D + 8, zc - 50, zc + 50, DARK, stroke=None)
        ax.box(W - 4, W + 6, D - 2, D + 8, zc - 50, zc + 50, DARK, stroke=None)
    for xh in (395, 600):
        ax.box(xh - 8, xh + 8, SHEET_DOOR_Y[1] + 2, SHEET_DOOR_Y[1] + 28, 1050, 1210, STEEL, lw=0.2)
    ax.box(405, 475, SHEET_DOOR_Y[1] + 2, SHEET_DOOR_Y[1] + 6, 1260, 1300, STEEL, lw=0.2)
    ax.box(470, 500, SHEET_DOOR_Y[1] + 6, SHEET_DOOR_Y[1] + 24, 1200, 1265, HexColor('#B08D2E'), lw=0.2)
    if shadow:
        ax.face([(-10, SHEET_DOOR_Y[1] + 3, DOOR_Z[1]), (W + 10, SHEET_DOOR_Y[1] + 3, DOOR_Z[1]),
                 (W + 10, SHEET_DOOR_Y[1] + 3, DOOR_Z[1] - 170), (-10, SHEET_DOOR_Y[1] + 3, DOOR_Z[1] - 120)],
                HexColor('#000000'), stroke=None, alpha=0.13)
        ax.face([(xs + 1, -PN, Z_B - T), (xs + 1, D, Z_F - T), (xs + 1, D, Z_F - T - 120),
                 (xs + 1, -PN, Z_B - T - 100)], HexColor('#000000'), stroke=None, alpha=0.10)


def roof(ax):
    # кровля
    x0r, x1r = ROOF_X
    ax.face([(x1r, ROOF_Y[0], zu(ROOF_Y[0])), (x1r, ROOF_Y[1], zu(ROOF_Y[1])), (x1r, ROOF_Y[1], zr(ROOF_Y[1])),
             (x1r, ROOF_Y[0], zr(ROOF_Y[0]))], PNC_D, lw=0.3)
    ax.face([(x0r, ROOF_Y[1], zu(ROOF_Y[1])), (x1r, ROOF_Y[1], zu(ROOF_Y[1])), (x1r, ROOF_Y[1], zr(ROOF_Y[1])),
             (x0r, ROOF_Y[1], zr(ROOF_Y[1]))], PNC_D, lw=0.3)
    top = [(x0r, ROOF_Y[0], zr(ROOF_Y[0])), (x1r, ROOF_Y[0], zr(ROOF_Y[0])),
           (x1r, ROOF_Y[1], zr(ROOF_Y[1])), (x0r, ROOF_Y[1], zr(ROOF_Y[1]))]
    ax.face(top, PNC, lw=0.45)
    xx = x0r + 25
    while xx < x1r - 5:
        ax.line((xx, ROOF_Y[0], zr(ROOF_Y[0])), (xx, ROOF_Y[1], zr(ROOF_Y[1])), color=shade(PNC, 0.62), lw=0.3)
        ax.line((xx + 22, ROOF_Y[0], zr(ROOF_Y[0])), (xx + 22, ROOF_Y[1], zr(ROOF_Y[1])), color=shade(PNC, 1.15),
                lw=0.25)
        xx += WAVE
    # планка примыкания
    zb = zr(ROOF_Y[0])
    ax.face([(x0r, ROOF_Y[0], zb + 1), (x1r, ROOF_Y[0], zb + 1), (x1r, ROOF_Y[0] + 110, zr(ROOF_Y[0] + 110) + 1),
             (x0r, ROOF_Y[0] + 110, zr(ROOF_Y[0] + 110) + 1)], shade(PNC, 0.8), lw=0.3)
    ax.face([(x0r, HOUSE_Y, zb), (x1r, HOUSE_Y, zb), (x1r, HOUSE_Y, zb + 130), (x0r, HOUSE_Y, zb + 130)],
            shade(PNC, 0.9), lw=0.3)
    ax.line((x0r, HOUSE_Y + 1, zb + 132), (x1r, HOUSE_Y + 1, zb + 132), color=SEALANT, lw=0.8)


def exterior(ax, house=True, ground=True, shadow=True):
    env(ax, house, ground)
    right_side(ax)
    front_closed(ax, shadow)
    roof(ax)


def frame_solids():
    S_ = []
    bx = Axo.box_verts
    WC = WOOD3
    for (x0, x1) in BLK_X:
        S_.append((bx(x0, x1, BLK_Y[0], BLK_Y[1], 0, Z_BLK), HexColor('#B5B5B0'), 'blk'))
    zb0, zb1 = Z_BASE
    S_.append((bx(0, W, 0, T, zb0, zb1), WC, 'base'))
    S_.append((bx(0, W, D - T, D, zb0, zb1), WC, 'base'))
    for x0 in (0, (W - T) / 2, W - T):
        S_.append((bx(x0, x0 + T, T, D - T, zb0, zb1), WC, 'base'))
    S_.append((bx(0, W, 0, D, zb1, Z_FLOOR), OSBC, 'floor'))
    for x0 in (0, W - T):
        S_.append((bx(x0, x0 + T, 0, T, POST_B[0], POST_B[1]), WC, 'post'))
        S_.append((bx(x0, x0 + T, D - T, D, POST_F[0], POST_F[1]), WC, 'post'))
        S_.append((bx(x0, x0 + T, T, D - T, Z_GIRT[0], Z_GIRT[1]), WC, 'girt'))
        v = [(x0, T, zu(T) - T / CA), (x0 + T, T, zu(T) - T / CA), (x0 + T, D - T, zu(D - T) - T / CA),
             (x0, D - T, zu(D - T) - T / CA),
             (x0, T, zu(T)), (x0 + T, T, zu(T)), (x0 + T, D - T, zu(D - T)), (x0, D - T, zu(D - T))]
        S_.append((v, WC, 'rail'))
    S_.append((bx(T, W - T, 0, T, Z_GIRT[0], Z_GIRT[1]), WC, 'girt'))
    S_.append((bx(PURLIN_X[0], PURLIN_X[1], 0, T, Z_B - T, Z_B), HexColor('#E2BC7F'), 'purlin'))
    S_.append((bx(PURLIN_X[0], PURLIN_X[1], D - T, D, Z_F - T, Z_F), HexColor('#E2BC7F'), 'purlin'))
    S_.append((bx(T, W - T, D - T, D, Z_HEADER[0], Z_HEADER[1]), WC, 'front'))
    S_.append((bx(T, W - T, D - T, D, Z_THR[0], Z_THR[1]), WC, 'front'))
    return S_


def frame_iso(ax):
    items = frame_solids()
    items.sort(key=lambda it: ax.depth([sum(p[i] for p in it[0]) / 8 for i in range(3)]))
    for v, col, tag in items:
        ax.solid(v, col, lw=0.3)


# ---------------------------------------------------------------- вид с открытыми дверьми
INNER = HexColor('#C9CFD2')       # изнанка профнастила (серый грунт)
HANDLE3 = HexColor('#B07A44')
HEAD3 = HexColor('#8E99A4')


def _clip_quad(ax, pts):
    c = ax.c
    p = c.beginPath()
    p.moveTo(*ax.P(*pts[0]))
    for q in pts[1:]:
        p.lineTo(*ax.P(*q))
    p.close()
    c.clipPath(p, stroke=0, fill=0)


def _hexa(ax, v, col, lw=0.3, stroke=INK):
    ax.solid(v, col, lw=lw, stroke=stroke)


def _tool(ax, kind, x, y=85):
    zf = Z_FLOOR
    if kind == 'shovel':
        ax.box(x - 100, x + 100, y - 4, y + 4, zf, zf + 300, HEAD3, lw=0.25)
        ax.box(x - 12, x + 12, y - 12, y + 12, zf + 300, zf + 1450, HANDLE3, lw=0.2)
        ax.box(x - 50, x + 50, y - 12, y + 12, zf + 1430, zf + 1460, HANDLE3, lw=0.2)
    elif kind == 'scoop':
        ax.box(x - 110, x + 110, y - 40, y + 30, zf, zf + 330, HEAD3, lw=0.25)
        ax.box(x - 12, x + 12, y - 12, y + 12, zf + 330, zf + 1400, HANDLE3, lw=0.2)
    elif kind == 'fork':
        for dx in (-75, -25, 25, 75):
            ax.box(x + dx - 4, x + dx + 4, y - 4, y + 4, zf, zf + 280, HEAD3, stroke=None)
        ax.box(x - 85, x + 85, y - 8, y + 8, zf + 270, zf + 300, HEAD3, lw=0.2)
        ax.box(x - 12, x + 12, y - 12, y + 12, zf + 300, zf + 1450, HANDLE3, lw=0.2)
    elif kind == 'rake':
        ax.box(x - 12, x + 12, y - 12, y + 12, zf, zf + 1640, HANDLE3, lw=0.2)
        ax.box(x - 180, x + 180, y - 15, y + 15, zf + 1640, zf + 1670, HEAD3, lw=0.25)
        for i in range(10):
            xx = x - 170 + i * 37.8
            ax.box(xx - 3, xx + 3, y + 10, y + 16, zf + 1580, zf + 1640, HEAD3, stroke=None)
    elif kind == 'hoe':
        ax.box(x - 12, x + 12, y - 12, y + 12, zf, zf + 1520, HANDLE3, lw=0.2)
        ax.box(x - 60, x + 60, y + 10, y + 20, zf + 1520, zf + 1620, HEAD3, lw=0.25)


def _items_on_shelf(ax, z, kind):
    """Мелочь на полках стеллажа."""
    x0 = RACK_SHELF_X[0]
    if kind == 0:   # нижняя: банки и коробка
        ax.box(x0 + 30, x0 + 140, 120, 230, z, z + 160, HexColor('#C8A86B'), lw=0.25)
        for i, col in enumerate((HexColor('#3B6EA5'), HexColor('#C0392B'))):
            ax.box(x0 + 170 + i * 85, x0 + 240 + i * 85, 300, 370, z, z + 190, col, lw=0.25)
    elif kind == 1:  # средняя: мешок удобрений, опрыскиватель
        ax.box(x0 + 25, x0 + 175, 90, 300, z, z + 120, HexColor('#E6D3A3'), lw=0.25)
        ax.box(x0 + 215, x0 + 300, 300, 385, z, z + 260, HexColor('#E3E7EA'), lw=0.25)
        ax.box(x0 + 245, x0 + 270, 330, 355, z + 260, z + 330, HexColor('#2E7D32'), lw=0.2)
    else:            # верхняя: перчатки, секатор, ящик с мелочью
        ax.box(x0 + 30, x0 + 230, 80, 260, z, z + 110, HexColor('#7E9C5A'), lw=0.25)
        ax.box(x0 + 250, x0 + 320, 320, 400, z, z + 25, HexColor('#E67E22'), lw=0.2)


def _door_open(ax, side, theta_deg):
    """Открытая створка. side: 'L' или 'R'; theta — угол открывания."""
    th = math.radians(theta_deg)
    if side == 'L':
        H = (0.0, D + 3.0)
        d = (math.cos(th), math.sin(th))
        n = (math.sin(th), -math.cos(th))
        sheet_u = (SHEET_L[0], SHEET_L[1])
    else:
        H = (float(W), D + 3.0)
        d = (-math.cos(th), math.sin(th))
        n = (-math.sin(th), -math.cos(th))
        sheet_u = (W - SHEET_R[1], W - SHEET_R[0])

    def P(u, s, z):
        return (H[0] + u * d[0] - (2 + s) * n[0], H[1] + u * d[1] - (2 + s) * n[1], z)

    def blk(u0, u1, s0, s1, z0, z1, col, lw=0.3):
        v = [P(u0, s0, z0), P(u1, s0, z0), P(u1, s1, z0), P(u0, s1, z0),
             P(u0, s0, z1), P(u1, s0, z1), P(u1, s1, z1), P(u0, s1, z1)]
        _hexa(ax, v, col, lw=lw)

    # лист: изнанка серая
    u0, u1 = sheet_u
    v = [P(u0, T, DOOR_Z[0]), P(u1, T, DOOR_Z[0]), P(u1, T + PN, DOOR_Z[0]), P(u0, T + PN, DOOR_Z[0]),
         P(u0, T, DOOR_Z[1]), P(u1, T, DOOR_Z[1]), P(u1, T + PN, DOOR_Z[1]), P(u0, T + PN, DOOR_Z[1])]
    for pts, nn in ax.hexa_faces(v):
        inner = (nn[0] * n[0] + nn[1] * n[1]) > 0.5
        ax.face(pts, INNER if inner else PNC, lw=0.35)
    uu = u0 + 20
    while uu < u1 - 10:
        ax.line(P(uu, T - 0.5, DOOR_Z[0]), P(uu, T - 0.5, DOOR_Z[1]), color=shade(INNER, 0.8), lw=0.25)
        uu += WAVE
    # рамка: раскосы, ригели, стойки
    a0, a1 = T, DOOR_W - T
    for (lo, hi) in ((RAIL_BOT[1], RAIL_MID[0]), (RAIL_MID[1], RAIL_TOP[0])):
        k = (hi - lo) / (a1 - a0)
        dz = T * math.sqrt(1 + k * k)
        quad = [(a0, lo), (a0, lo + dz), (a1, hi), (a1, hi - dz)]
        v = [P(qa, 0, qz) for qa, qz in quad] + [P(qa, T, qz) for qa, qz in quad]
        v = [v[0], v[3], v[7], v[4], v[1], v[2], v[6], v[5]]
        _hexa(ax, v, HexColor('#E9C98F'))
    for (z0, z1) in (RAIL_BOT, RAIL_MID, RAIL_TOP):
        blk(T, DOOR_W - T, 0, T, z0, z1, WOOD3)
    blk(2, 2 + T, 0, T, FRAME_Z[0], FRAME_Z[1], WOOD3)
    blk(DOOR_W - T + 2, DOOR_W + 2, 0, T, FRAME_Z[0], FRAME_Z[1], WOOD3)
    if side == 'L':   # шпингалеты на свободной кромке
        for zc in (FRAME_Z[0] + 300, FRAME_Z[1] - 300):
            blk(DOOR_W - 20, DOOR_W - 5, -6, 0, zc - 60, zc + 60, STEEL, lw=0.2)
    for zc in HINGE_Z:
        blk(-4, 24, -3, 0, zc - 50, zc + 50, DARK, lw=0.1)


def interior_open(ax, theta_l=105, theta_r=128):
    """Вид спереди-справа с открытыми дверьми: стеллаж на 3 полки и инструмент."""
    env(ax)
    right_side(ax)
    c = ax.c
    # --- интерьер в проёме (обрезка по проёму) ---
    c.saveState()
    _clip_quad(ax, [(OPEN_X[0], D, OPEN_Z[0]), (OPEN_X[1], D, OPEN_Z[0]), (OPEN_X[1], D, OPEN_Z[1]),
                    (OPEN_X[0], D, OPEN_Z[1])])
    ax.face([(0, 0, Z_FLOOR), (W, 0, Z_FLOOR), (W, 0, Z_B), (0, 0, Z_B)], INNER, lw=0.3)
    xx = 20
    while xx < W:
        ax.line((xx, 0.5, Z_FLOOR), (xx, 0.5, Z_B), color=shade(INNER, 0.82), lw=0.25)
        xx += WAVE
    ax.face([(0, 0, Z_FLOOR), (0, D, Z_FLOOR), (0, D, Z_F), (0, 0, Z_B)], shade(INNER, 0.9), lw=0.3)
    yy = 20
    while yy < D:
        ax.line((0.5, yy, Z_FLOOR), (0.5, yy, side_top(yy)), color=shade(INNER, 0.72), lw=0.25)
        yy += WAVE
    ax.face([(0, 0, Z_FLOOR), (W, 0, Z_FLOOR), (W, D, Z_FLOOR), (0, D, Z_FLOOR)], OSBC, lw=0.3)
    for hx in (120, 260, 400, 540):
        px, py = ax.P(hx, 30, Z_FLOOR)
        c.setFillColor(DARK)
        c.circle(px, py, 0.35 * mm, stroke=0, fill=1)
    # каркас внутри
    ax.box(0, T, 0, T, POST_B[0], POST_B[1], WOOD3, lw=0.25)
    ax.box(T, W - T, 0, T, Z_GIRT[0], Z_GIRT[1], WOOD3, lw=0.25)
    ax.box(0, T, T, D - T, Z_GIRT[0], Z_GIRT[1], WOOD3, lw=0.25)
    # держатели и инструмент
    tools = [('fork', 110), ('shovel', 215), ('rake', 305), ('scoop', 415), ('hoe', 540)]
    for kind, x in tools:
        ax.box(x - 22, x + 22, T, T + 30, Z_GIRT[0] + 8, Z_GIRT[1] - 8, DARK, lw=0.1)
    for kind, x in tools:
        _tool(ax, kind, x)
    # шланг на левой стене
    pts = [(8, 300 + 150 * math.cos(math.radians(a)), 900 + 150 * math.sin(math.radians(a))) for a in range(0, 361, 15)]
    for r_off, col in ((0, HexColor('#2E7D32')), (25, HexColor('#3E8E41'))):
        pts = [(8 + r_off * 0.3, 300 + (150 - r_off) * math.cos(math.radians(a)),
                900 + (150 - r_off) * math.sin(math.radians(a))) for a in range(0, 361, 15)]
        c.saveState()
        c.setStrokeColor(col)
        c.setLineWidth(1.6)
        p = c.beginPath()
        p.moveTo(*ax.P(*pts[0]))
        for q in pts[1:]:
            p.lineTo(*ax.P(*q))
        c.drawPath(p, stroke=1, fill=0)
        c.restoreState()
    # стеллаж: задняя стойка, бруски, полки, вещи, передняя стойка
    ax.box(RACK_X[0], RACK_X[1], RACK_Y[0][0], RACK_Y[0][1], Z_FLOOR, Z_FLOOR + RACK_H, WOOD3, lw=0.3)
    ax.box(W - T, W, 0, T, POST_B[0], POST_B[1], WOOD3, lw=0.25)
    for i, z in enumerate(RACK_SHELF_Z):
        ax.box(CLEAT_R_X[0], CLEAT_R_X[1], RACK_SHELF_Y[0], RACK_SHELF_Y[1], z - T, z, WOOD3, lw=0.25)
        ax.box(RACK_X[0], RACK_X[1], RACK_Y[0][1], RACK_Y[1][0], z - T, z, WOOD3, lw=0.25)
        ax.box(RACK_SHELF_X[0], RACK_SHELF_X[1], RACK_SHELF_Y[0], RACK_SHELF_Y[1], z, z + 12, OSBC, lw=0.35)
        _items_on_shelf(ax, z + 12, i)
    # под нижней полкой — лейка и ведро
    ax.box(700, 860, 250, 420, Z_FLOOR, Z_FLOOR + 260, HexColor('#2E86C1'), lw=0.25)
    ax.box(880, 980, 100, 200, Z_FLOOR, Z_FLOOR + 230, HexColor('#7F8C8D'), lw=0.25)
    ax.box(RACK_X[0], RACK_X[1], RACK_Y[1][0], RACK_Y[1][1], Z_FLOOR, Z_FLOOR + RACK_H, WOOD3, lw=0.3)
    c.restoreState()
    # --- передняя рама проёма с уплотнителем ---
    ax.box(PURLIN_X[0], PURLIN_X[1], D - T, D, Z_F - T, Z_F, WOOD3, lw=0.3)
    ax.face([(OPEN_X[0], D, VENT_Z[0]), (OPEN_X[1], D, VENT_Z[0]), (OPEN_X[1], D, VENT_Z[1]),
             (OPEN_X[0], D, VENT_Z[1])], HexColor('#3A3F44'), lw=0.3)
    ax.box(OPEN_X[0], OPEN_X[1], D - T, D, Z_HEADER[0], Z_HEADER[1], WOOD3, lw=0.3)
    ax.box(OPEN_X[0], OPEN_X[1], D - T, D, Z_THR[0], Z_THR[1], WOOD3, lw=0.3)
    for x0 in (0, W - T):
        ax.box(x0, x0 + T, D - T, D, POST_F[0], POST_F[1], WOOD3, lw=0.3)
        ax.box(x0, x0 + PN if x0 == 0 else x0 + T, D - T, D, Z_BASE[0], Z_FLOOR, WOOD3, lw=0.2)
    for (x0, x1, z0, z1) in ((20, 32, OPEN_Z[0], OPEN_Z[1]), (W - 32, W - 20, OPEN_Z[0], OPEN_Z[1]),
                             (OPEN_X[0], OPEN_X[1], Z_THR[0] + 18, Z_THR[0] + 28),
                             (OPEN_X[0], OPEN_X[1], Z_HEADER[0] + 18, Z_HEADER[0] + 28)):
        ax.box(x0, x1, D, D + 4, z0, z1, DARK, stroke=None)
    ax.box(-PN, W + PN, D, D + 1, Z_BASE[0], Z_FLOOR, shade(WOOD3, 0.9), stroke=None)
    # --- створки ---
    _door_open(ax, 'L', theta_l)
    roof(ax)
    _door_open(ax, 'R', theta_r)

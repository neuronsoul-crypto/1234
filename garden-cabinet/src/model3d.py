# -*- coding: utf-8 -*-
"""Объёмные изображения: внешний вид шкафа и каркас (диметрия)."""
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
WOOD3 = HexColor('#E8C893')


def _tube(ax, pts, r, col, dark=None):
    """Труба: толстая линия по оси (в проекции)."""
    c = ax.c
    w = 2 * r * ax.k * mm
    c.saveState()
    c.setLineCap(1)
    c.setLineJoin(1)
    for lw, cc in ((w + 0.8, dark or shade(col, 0.55)), (w, col), (w * 0.28, shade(col, 1.25))):
        c.setLineWidth(lw)
        c.setStrokeColor(cc)
        p = c.beginPath()
        x, y = ax.P(*pts[0])
        if cc is not col and lw < w:
            # блик чуть левее оси
            pass
        p.moveTo(x, y)
        for q in pts[1:]:
            p.lineTo(*ax.P(*q))
        c.drawPath(p, stroke=1, fill=0)
    c.restoreState()


def exterior(ax, house=True, ground=True, shadow=True):
    """Внешний вид шкафа у стены дома."""
    rnd = random.Random(7)
    # --- земля ---
    if ground:
        ax.face([(-1600, HOUSE_Y, 0), (2600, HOUSE_Y, 0), (2600, 1900, 0), (-1600, 1900, 0)], GRASS, stroke=None)
        g = [(-260, HOUSE_Y, 0), (1820, HOUSE_Y, 0), (1820, 1180, 0), (-260, 1180, 0)]
        ax.face(g, GRAVEL3, stroke=shade(GRAVEL3, 0.8), lw=0.3)
        c = ax.c
        c.saveState()
        for _ in range(900):
            x = rnd.uniform(-250, 1810)
            y = rnd.uniform(HOUSE_Y + 5, 1170)
            px, py = ax.P(x, y, 0)
            c.setFillColor(shade(GRAVEL3, rnd.uniform(0.72, 0.95)))
            c.circle(px, py, rnd.uniform(0.15, 0.35) * mm, stroke=0, fill=1)
        c.restoreState()
    # --- стена дома ---
    if house:
        ax.face([(-1600, HOUSE_Y, 0), (2600, HOUSE_Y, 0), (2600, HOUSE_Y, 3200), (-1600, HOUSE_Y, 3200)],
                PLASTER, stroke=None)
        ax.face([(-1600, HOUSE_Y, 0), (2600, HOUSE_Y, 0), (2600, HOUSE_Y, 450), (-1600, HOUSE_Y, 450)],
                PLINTH, stroke=None)
        for zz in (150, 300):
            ax.line((-1600, HOUSE_Y, zz), (2600, HOUSE_Y, zz), color=shade(PLINTH, 0.85), lw=0.25)
        ax.line((-1600, HOUSE_Y, 450), (2600, HOUSE_Y, 450), color=shade(PLINTH, 0.7), lw=0.4)
    # --- пустота под шкафом ---
    ax.box(-20, W + 20, -20, D + 20, 0, CLAD_Z0, DARK, stroke=None)
    # опоры
    for (x0, x1) in BLK_X:
        for (y0, y1) in BLK_Y:
            ax.box(x0, x1, y0, y1, 0, Z_BLK, HexColor('#A7A7A2'), lw=0.25)
    # --- правая боковая обшивка ---
    side = [(W + CL, -CL, CLAD_Z0), (W + CL, D, CLAD_Z0), (W + CL, D, zo(D)), (W + CL, -CL, zo(-CL))]
    ax.face(side, shade(PAINT, 0.86), lw=0.35)
    z = CLAD_Z0 + CLAD_STEP
    while z < zo(-CL):
        y_end = D if z < zo(D) else (Z_BACK_TOP - z + RAF_V) / S
        y_end = min(D, y_end)
        ax.line((W + CL, -CL, z), (W + CL, y_end, z), color=shade(PAINT, 0.62), lw=0.3)
        ax.line((W + CL, -CL, z - 6), (W + CL, y_end, z - 6), color=shade(PAINT, 0.95), lw=0.2)
        z += CLAD_STEP
    # --- левая петельная стойка ---
    ax.box(POST_L[0], POST_L[1], POST_Y[0], POST_Y[1], POST_Z[0], POST_Z[1], TRIM, lw=0.3)
    # --- цоколь и отлив ---
    ax.box(POST_L[1], POST_R[0], D, D + CL, SKIRT_Z[0], SKIRT_Z[1], PAINT, lw=0.3)
    ax.box(POST_L[1], POST_R[0], D, D + 32, SKIRT_Z[1], SKIRT_Z[1] + 6, METAL, lw=0.25)
    # --- фриз и отлив над дверью ---
    ax.box(POST_L[1], POST_R[0], D, D + CL, FRIEZE_Z[0], FRIEZE_Z[1], TRIM, lw=0.3)
    # --- двери ---
    for (x0, x1) in (DOOR_L, DOOR_R):
        ax.box(x0, x1, DOOR_Y[0], DOOR_Y[1], DOOR_Z[0], DOOR_Z[1], PAINT, lw=0.4)
        xs = [x0 + 90 + i * 135 for i in range(5)]
        for xx in xs:
            ax.line((xx, DOOR_Y[1], DOOR_Z[0]), (xx, DOOR_Y[1], DOOR_Z[1]), color=shade(PAINT, 0.6), lw=0.3)
            ax.line((xx + 5, DOOR_Y[1], DOOR_Z[0]), (xx + 5, DOOR_Y[1], DOOR_Z[1]), color=shade(PAINT, 1.12), lw=0.2)
    # нащельник
    ax.box(ASTR_X[0], ASTR_X[1], ASTR_Y[0], ASTR_Y[1], DOOR_Z[0], DOOR_Z[1], TRIM, lw=0.3)
    # отлив над дверью
    ax.box(POST_L[1], POST_R[0], D, D + 58, DOOR_Z[1], DOOR_Z[1] + 9, METAL, lw=0.25)
    # петли-стрелы
    yh = DOOR_Y[1] + 1
    for zc in ((DOOR_RAIL_BOT[0] + DOOR_RAIL_BOT[1]) / 2, (DOOR_RAIL_MID[0] + DOOR_RAIL_MID[1]) / 2,
               (DOOR_RAIL_TOP[0] + DOOR_RAIL_TOP[1]) / 2):
        for side_, xp, xe in (('L', -12, 430), ('R', W + 12, W - 430)):
            s = 1 if side_ == 'L' else -1
            ax.face([(xp, yh, zc - 32), (xp + s * 38, yh, zc - 32), (xp + s * 38, yh, zc + 32), (xp, yh, zc + 32)],
                    STEEL, stroke=DARK, lw=0.2)
            ax.face([(xp + s * 38, yh, zc - 22), (xe, yh, zc - 9), (xe, yh, zc + 9), (xp + s * 38, yh, zc + 22)],
                    STEEL, stroke=DARK, lw=0.2)
    # ручки, проушина
    for xh in (672, 828):
        ax.box(xh - 8, xh + 8, DOOR_Y[1] + 2 if xh < 750 else ASTR_Y[1] - 18, DOOR_Y[1] + 28, 1110, 1270, STEEL, lw=0.2)
    ax.box(ASTR_X[0] - 20, ASTR_X[1] + 22, ASTR_Y[1], ASTR_Y[1] + 4, 1330, 1380, STEEL, lw=0.2)
    ax.box(ASTR_X[1] - 12, ASTR_X[1] + 30, ASTR_Y[1] + 4, ASTR_Y[1] + 24, 1265, 1335, HexColor('#B08D2E'), lw=0.2)
    # правая петельная стойка
    ax.box(POST_R[0], POST_R[1], POST_Y[0], POST_Y[1], POST_Z[0], POST_Z[1], TRIM, lw=0.3)
    # тень от свеса на фасаде
    if shadow:
        ax.face([(POST_L[0], POST_Y[1] + 2, 2140), (POST_R[1], POST_Y[1] + 2, 2140),
                 (POST_R[1], POST_Y[1] + 2, 1960), (POST_L[0], POST_Y[1] + 2, 1900)],
                HexColor('#000000'), stroke=None, alpha=0.13)
        ax.face([(W + CL + 1, -CL, zo(-CL)), (W + CL + 1, D, zo(D)), (W + CL + 1, D, zo(D) - 130),
                 (W + CL + 1, -CL, zo(-CL) - 110)], HexColor('#000000'), stroke=None, alpha=0.10)
    # --- водосточная труба (за желобом) ---
    yb = D - 40
    pipe = [(1550, GUT_YC, GUT_ZTOP - GUT_R), (1550, GUT_YC, 2010), (PIPE_X, yb, 2010 - (GUT_YC - yb)),
            (PIPE_X, yb, 260), (PIPE_X + 140, yb, 150)]
    # --- кровля ---
    x0r, x1r = X_ROOF
    hb = 45 / CA
    # правый ветровой брусок и торцевая планка
    ax.face([(x1r, Y_ROOF[0], zo(Y_ROOF[0]) - hb), (x1r, FASCIA_Y[0], zo(FASCIA_Y[0]) - hb),
             (x1r, FASCIA_Y[0], zo(FASCIA_Y[0])), (x1r, Y_ROOF[0], zo(Y_ROOF[0]))], shade(TRIM, 0.86), lw=0.3)
    # лобовая доска
    ax.box(x0r, x1r, FASCIA_Y[0], FASCIA_Y[1], FASCIA_Z[0], FASCIA_Z[1], TRIM, lw=0.3)
    # торцевая металлическая планка
    ax.face([(x1r + 2, Y_ROOF[0], zo(Y_ROOF[0]) - 30), (x1r + 2, Y_ROOF[1] + 4, zo(Y_ROOF[1]) - 30),
             (x1r + 2, Y_ROOF[1] + 4, zr(Y_ROOF[1]) + 3), (x1r + 2, Y_ROOF[0], zr(Y_ROOF[0]) + 3)],
            shade(ROOF, 0.9), lw=0.3)
    # скат
    top = [(x0r, Y_ROOF[0], zr(Y_ROOF[0])), (x1r, Y_ROOF[0], zr(Y_ROOF[0])),
           (x1r, Y_ROOF[1], zr(Y_ROOF[1])), (x0r, Y_ROOF[1], zr(Y_ROOF[1]))]
    ax.face(top, ROOF, lw=0.4)
    exp_y = 143 * CA
    y = Y_ROOF[1] - 40
    row = 0
    while y > Y_ROOF[0] + 20:
        ax.line((x0r, y, zr(y)), (x1r, y, zr(y)), color=HexColor('#2A2D31'), lw=0.35)
        ax.line((x0r, y - 6, zr(y - 6)), (x1r, y - 6, zr(y - 6)), color=ROOF_L, lw=0.2)
        off = 167 if row % 2 else 0
        xx = x0r + 60 + off
        y2 = y + exp_y * 0.62
        while xx < x1r - 20:
            if y2 < Y_ROOF[1]:
                ax.line((xx, y, zr(y)), (xx, min(y2, Y_ROOF[1] - 5), zr(min(y2, Y_ROOF[1] - 5))),
                        color=HexColor('#2A2D31'), lw=0.25)
            xx += 333
        y -= exp_y
        row += 1
    # капельник
    ax.line((x0r, Y_ROOF[1] + 6, zr(Y_ROOF[1]) - 4), (x1r, Y_ROOF[1] + 6, zr(Y_ROOF[1]) - 4), color=METAL, lw=0.9)
    # примыкание к стене: ковёр + планка примыкания + герметик
    zb = zr(Y_ROOF[0])
    ax.face([(x0r, HOUSE_Y, zb), (x1r, HOUSE_Y, zb), (x1r, HOUSE_Y, zb + 250), (x0r, HOUSE_Y, zb + 250)],
            HexColor('#34373C'), stroke=None)
    ax.face([(x0r - 10, HOUSE_Y + 3, zb + 160), (x1r + 10, HOUSE_Y + 3, zb + 160),
             (x1r + 10, HOUSE_Y + 3, zb + 265), (x0r - 10, HOUSE_Y + 3, zb + 265)], METAL, lw=0.3)
    ax.line((x0r - 10, HOUSE_Y + 3, zb + 268), (x1r + 10, HOUSE_Y + 3, zb + 268), color=SEALANT, lw=0.8)
    # --- желоб ---
    yc, zt, R = GUT_YC, GUT_ZTOP, GUT_R
    ax.face([(x0r, yc - R, zt), (x1r, yc - R, zt), (x1r, yc + R, zt), (x0r, yc + R, zt)], HexColor('#30343A'),
            stroke=None)
    angs = [math.radians(a) for a in range(-70, 1, 10)]
    for i in range(len(angs) - 1):
        a0, a1 = angs[i], angs[i + 1]
        p = [(x0r, yc + R * math.cos(a0), zt + R * math.sin(a0)), (x1r, yc + R * math.cos(a0), zt + R * math.sin(a0)),
             (x1r, yc + R * math.cos(a1), zt + R * math.sin(a1)), (x0r, yc + R * math.cos(a1), zt + R * math.sin(a1))]
        k = 0.75 + 0.35 * (i / (len(angs) - 1))
        ax.face(p, shade(HexColor('#5E646C'), k), stroke=None)
    ax.line((x0r, yc + R, zt), (x1r, yc + R, zt), color=DARK, lw=0.4)
    cap = [(x1r, yc + R * math.cos(math.radians(a)), zt + R * math.sin(math.radians(a))) for a in range(-180, 1, 15)]
    ax.face(cap, HexColor('#4A4F56'), stroke=DARK, lw=0.3)
    # кронштейны желоба
    for xb in (0, 727, 1455):
        ax.line((xb, FASCIA_Y[1], FASCIA_Z[1] - 20), (xb, yc + R, zt), color=DARK, lw=0.5)
    _tube(ax, pipe, PIPE_R, HexColor('#5E646C'))
    # хомуты трубы
    for zz in (600, 1300):
        ax.box(PIPE_X - PIPE_R - 4, PIPE_X + PIPE_R + 4, yb - 6, yb + 6, zz, zz + 25, DARK, stroke=None)


def frame_solids():
    """Список элементов каркаса для изометрии: (вершины, цвет, тег)."""
    S_ = []
    bx = Axo.box_verts
    WOODC = WOOD3
    BASEC = HexColor('#C9A46A')
    # опоры
    for (x0, x1) in BLK_X:
        for (y0, y1) in BLK_Y:
            S_.append((bx(x0, x1, y0, y1, 0, Z_BLK), HexColor('#B5B5B0'), 'blk'))
    # обвязка
    S_.append((bx(0, W, 0, T, Z_BLK, Z_BASE_TOP), BASEC, 'base'))
    S_.append((bx(0, W, D - T, D, Z_BLK, Z_BASE_TOP), BASEC, 'base'))
    for x0 in (0, (W - T) / 2, W - T):
        S_.append((bx(x0, x0 + T, T, D - T, Z_BLK, Z_BASE_TOP), BASEC, 'base'))
    # пол
    for i in range(N_FLOOR):
        x0 = i * (FLOOR_W + FLOOR_GAP)
        S_.append((bx(x0, x0 + FLOOR_W, 0, D, Z_BASE_TOP, Z_FLOOR), HexColor('#D9B57E'), 'floor'))
    # задняя стена
    S_.append((bx(0, W, 0, T, Z_FLOOR, Z_FLOOR + T), WOODC, 'back'))
    S_.append((bx(0, W, 0, T, Z_BACK_TOP - T, Z_BACK_TOP), WOODC, 'back'))
    for x0 in STUDS_X:
        S_.append((bx(x0, x0 + T, 0, T, Z_FLOOR + T, Z_BACK_TOP - T), WOODC, 'back'))
    # передняя стена
    S_.append((bx(0, W, D - T, D, Z_FLOOR, Z_FLOOR + T), WOODC, 'front'))
    S_.append((bx(0, W, D - T, D, Z_HEADER[0], Z_HEADER[1]), WOODC, 'front'))
    S_.append((bx(0, W, D - T, D, Z_TOPF[0], Z_TOPF[1]), WOODC, 'front'))
    for x0 in (0, W - FRONT_STUD):
        S_.append((bx(x0, x0 + FRONT_STUD, D - T, D, OPEN_Z[0], OPEN_Z[1]), WOODC, 'front'))
    # боковые стены
    tp = T / CA
    for x0 in (0, W - T):
        x1 = x0 + T
        S_.append((bx(x0, x1, T, D - T, Z_FLOOR, Z_FLOOR + T), WOODC, 'side'))
        for (y0, y1) in ((T, 2 * T), (D - 2 * T, D - T)):
            v = [(x0, y0, Z_FLOOR + T), (x1, y0, Z_FLOOR + T), (x1, y1, Z_FLOOR + T), (x0, y1, Z_FLOOR + T),
                 (x0, y0, zu(y0) - tp), (x1, y0, zu(y0) - tp), (x1, y1, zu(y1) - tp), (x0, y1, zu(y1) - tp)]
            S_.append((v, WOODC, 'side'))
        ya, yb = T, D - T
        v = [(x0, ya, zu(ya) - tp), (x1, ya, zu(ya) - tp), (x1, yb, zu(yb) - tp), (x0, yb, zu(yb) - tp),
             (x0, ya, zu(ya)), (x1, ya, zu(ya)), (x1, yb, zu(yb)), (x0, yb, zu(yb))]
        S_.append((v, WOODC, 'side'))
        zn = Z_FLOOR + 1000
        S_.append((bx(x0, x1, 2 * T, D - 2 * T, zn, zn + T), WOODC, 'side'))
    # стропила
    for x0 in STUDS_X:
        x1 = x0 + T
        ya, yb = Y_RAF
        v = [(x0, ya, zu(ya)), (x1, ya, zu(ya)), (x1, yb, zu(yb)), (x0, yb, zu(yb)),
             (x0, ya, zo(ya)), (x1, ya, zo(ya)), (x1, yb, zo(yb)), (x0, yb, zo(yb))]
        S_.append((v, HexColor('#E2BC7F'), 'raf'))
    # бруски свеса
    hb = 45 / CA
    for x0 in (X_ROOF[0], X_ROOF[1] - 45):
        ya, yb = Y_ROOF[0], FASCIA_Y[0]
        v = [(x0, ya, zo(ya) - hb), (x0 + 45, ya, zo(ya) - hb), (x0 + 45, yb, zo(yb) - hb), (x0, yb, zo(yb) - hb),
             (x0, ya, zo(ya)), (x0 + 45, ya, zo(ya)), (x0 + 45, yb, zo(yb)), (x0, yb, zo(yb))]
        S_.append((v, HexColor('#E2BC7F'), 'raf'))
    return S_


def frame_iso(ax, tags=None):
    items = frame_solids()
    if tags:
        items = [it for it in items if it[2] in tags]
    items.sort(key=lambda it: ax.depth([sum(p[i] for p in it[0]) / 8 for i in range(3)]))
    for v, col, tag in items:
        ax.solid(v, col, lw=0.3)

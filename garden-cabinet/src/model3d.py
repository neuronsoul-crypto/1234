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


def exterior(ax, house=True, ground=True, shadow=True):
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

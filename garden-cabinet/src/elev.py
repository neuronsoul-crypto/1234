# -*- coding: utf-8 -*-
"""Ортогональные виды эконом-шкафа: фасад, вид сбоку, план."""
import math
from reportlab.lib.colors import HexColor
from geom import *
from draw import *

PN_L = HexColor('#9DBBA4')       # профнастил на чертежах
PN_E = HexColor('#5E8A6A')       # кромки/волны
WOODV = HexColor('#EED9B0')
DARKV = HexColor('#5A5A5A')


def waves_v(v, a0, a1, b_of, step=WAVE, lw=0.25):
    """Вертикальные линии волн от a0 до a1; b_of(a) -> (b0, b1)."""
    a = a0 + 20
    while a < a1 - 5:
        b0, b1 = b_of(a)
        v.line(a, b0, a, b1, color=PN_E, lw=lw)
        a += step


def zigzag(v, a0, a1, b, h=PN, step=WAVE, color=PN_E, lw=0.5):
    """Профиль листа (трапеция) вдоль a на уровне b."""
    pts = []
    a = a0
    while a < a1:
        pts += [(a, b), (a + step * 0.15, b + h), (a + step * 0.45, b + h), (a + step * 0.6, b)]
        a += step
    pts = [(min(p[0], a1), p[1]) for p in pts]
    v.polyline(pts, color=color, lw=lw)


def front_elev(v, house=(-300, 1300), house_top=2700):
    v.hatch([(house[0], 0), (house[1], 0), (house[1], house_top), (house[0], house_top)], step=3.2, angle=45,
            color=HexColor('#D8D0C2'), lw=0.2, fill=HOUSE)
    v.text(house[0] + 25, 1500, 'стена\nдома', 5.5, color=GREY)
    v.ground(house[0], house[1])
    v.rect(-PN, 0, W + PN, CLAD_Z0, fill=DARKV, stroke=None)
    for (x0, x1) in BLK_X:
        v.rect(x0, 0, x1, CLAD_Z0, fill=CONCRETE, stroke=INK, lw=0.3)
    zb = zr(ROOF_Y[0])
    v.rect(ROOF_X[0], zb, ROOF_X[1], zb + 130, fill=PN_E, stroke=INK, lw=0.3)
    v.line(ROOF_X[0], zb + 132, ROOF_X[1], zb + 132, color=SEALANT, lw=0.8)
    # кровля сверху (видна в сокращении)
    v.rect(ROOF_X[0], zr(ROOF_Y[1]), ROOF_X[1], zb, fill=PN_L, stroke=INK, lw=0.4)
    waves_v(v, ROOF_X[0], ROOF_X[1], lambda a: (zr(ROOF_Y[1]), zb))
    v.rect(ROOF_X[0], zu(ROOF_Y[1]), ROOF_X[1], zr(ROOF_Y[1]), fill=PN_E, stroke=INK, lw=0.3)
    # боковые листы (видны с торца)
    for (x0, x1) in ((-PN, 0), (W, W + PN)):
        v.rect(x0, CLAD_Z0, x1, Z_F - T, fill=PN_E, stroke=INK, lw=0.3)
    # продух
    v.rect(OPEN_X[0], DOOR_Z[1], OPEN_X[1], VENT_Z[1], fill=HexColor('#3A3F44'), stroke=INK, lw=0.3)
    # двери
    for (x0, x1) in (SHEET_L, SHEET_R):
        v.rect(x0, DOOR_Z[0], x1, DOOR_Z[1], fill=PN_L, stroke=INK, lw=0.5)
        waves_v(v, x0, x1, lambda a: (DOOR_Z[0], DOOR_Z[1]))
    for zc in HINGE_Z:
        v.rect(-6, zc - 50, 4, zc + 50, fill=DARK3, stroke=None)
        v.rect(W - 4, zc - 50, W + 6, zc + 50, fill=DARK3, stroke=None)
    for xh in (395, 600):
        v.rect(xh - 8, 1050, xh + 8, 1210, fill=STEEL, stroke=INK, lw=0.2)
    v.rect(405, 1260, 475, 1300, fill=STEEL, stroke=INK, lw=0.2)
    v.rect(470, 1200, 500, 1265, fill=HexColor('#C9A642'), stroke=INK, lw=0.2)


DARK3 = HexColor('#2B2E33')


def side_elev(v, wall=(-300, HOUSE_Y), top=2700):
    v.hatch([(wall[0], -60), (wall[1], -60), (wall[1], top), (wall[0], top)], step=1.6, angle=45,
            color=HOUSE_H, lw=0.25, fill=HOUSE, stroke=INK, slw=0.5)
    v.text(wall[0] + 15, top - 120, 'стена\nдома', 5.5, color=GREY)
    v.ground(wall[1], 900)
    for _ in (0,):
        v.rect(BLK_Y[0], 0, BLK_Y[1], Z_BLK, fill=CONCRETE, stroke=INK, lw=0.3)
    prof = [(-PN, Z_B - T), (T, Z_B - T), (T, zu(T)), (D - T, zu(D - T)), (D - T, Z_F - T), (D, Z_F - T)]
    pts = [(-PN, CLAD_Z0), (D, CLAD_Z0)] + list(reversed(prof))
    v.poly(pts, fill=PN_L, stroke=INK, lw=0.5)
    waves_v(v, -PN, D, lambda a: (CLAD_Z0, side_top(a)))
    # концы прогонов
    v.rect(0, Z_B - T, T, Z_B, fill=WOODV, stroke=INK, lw=0.4)
    v.rect(D - T, Z_F - T, D, Z_F, fill=WOODV, stroke=INK, lw=0.4)
    # кровельный лист
    v.poly([(ROOF_Y[0], zu(ROOF_Y[0])), (ROOF_Y[1], zu(ROOF_Y[1])), (ROOF_Y[1], zr(ROOF_Y[1])),
            (ROOF_Y[0], zr(ROOF_Y[0]))], fill=PN_E, stroke=INK, lw=0.4)
    # дверь с торца: рамка + лист
    v.rect(DOOR_Y[0], FRAME_Z[0], DOOR_Y[1], FRAME_Z[1], fill=WOODV, stroke=INK, lw=0.4)
    v.rect(SHEET_DOOR_Y[0], DOOR_Z[0], SHEET_DOOR_Y[1], DOOR_Z[1], fill=PN_E, stroke=INK, lw=0.4)
    for zc in HINGE_Z:
        v.rect(D - 2, zc - 50, D + 8, zc + 50, fill=DARK3, stroke=None)
    # планка примыкания
    zb = zr(ROOF_Y[0])
    v.polyline([(HOUSE_Y + 2, zb + 130), (HOUSE_Y + 2, zb + 2), (ROOF_Y[0] + 110, zr(ROOF_Y[0] + 110) + 2),
                (ROOF_Y[0] + 125, zr(ROOF_Y[0] + 125) - 12)], color=PN_E, lw=1.2)
    v.line(HOUSE_Y, zb + 132, HOUSE_Y + 6, zb + 132, color=SEALANT, lw=1.2)


def plan_view(v, swing=True):
    B = lambda y: -y
    v.hatch([(-200, B(HOUSE_Y)), (1200, B(HOUSE_Y)), (1200, B(-260)), (-200, B(-260))], step=1.6, angle=45,
            color=HOUSE_H, lw=0.25, fill=HOUSE, stroke=INK, slw=0.5)
    v.text(-180, B(-190), 'стена дома', 5.5, color=GREY)
    v.rect(-PN, B(-PN), W + PN, B(D), fill=None, stroke=GREY, lw=0.35, dash=(2, 1.5))
    v.rect(0, B(DOOR_Y[0]), W, B(SHEET_DOOR_Y[1]), fill=None, stroke=GREY, lw=0.35, dash=(2, 1.5))
    v.rect(ROOF_X[0], B(ROOF_Y[0]), ROOF_X[1], B(ROOF_Y[1]), fill=PN_L, stroke=INK, lw=0.5)
    waves_v(v, ROOF_X[0], ROOF_X[1], lambda a: (B(ROOF_Y[1]), B(ROOF_Y[0])))
    v.rect(ROOF_X[0], B(ROOF_Y[0]), ROOF_X[1], B(ROOF_Y[0] + 110), fill=PN_E, stroke=INK, lw=0.3)
    xm = 250
    v.line(xm, B(170), xm, B(600), color=INK, lw=0.6)
    v.poly([(xm - 22, B(530), ), (xm + 22, B(530)), (xm, B(620))], fill=INK, stroke=None)
    v.text(xm + 40, B(330), 'уклон %.0f°' % ALPHA_DEG, 6, color=INK)
    if swing:
        for hx, s, r in ((0, 1, DOOR_W), (W, -1, SHEET_R[1] - SHEET_R[0])):
            yc = DOOR_Y[0]
            pts = [(hx + s * r * math.cos(math.radians(a)), B(yc + r * math.sin(math.radians(a))))
                   for a in range(0, 91, 5)]
            v.polyline(pts, color=ACCENT, lw=0.35, dash=(1.5, 1))
            v.line(hx, B(yc), hx, B(yc + r), color=ACCENT, lw=0.5)

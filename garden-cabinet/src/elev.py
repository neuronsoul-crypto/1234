# -*- coding: utf-8 -*-
"""Ортогональные виды: фасад, вид сбоку, план (общие для нескольких листов)."""
import math
from reportlab.lib.colors import HexColor
from geom import *
from draw import *

PAINT_L = HexColor('#C9D3C9')     # обшивка на чертежах (светлый тон фасадного цвета)
DOOR_C = HexColor('#BCC9BE')
ROOF_C = HexColor('#7B8088')
GUT_C = HexColor('#8A9098')
DARKV = HexColor('#5A5A5A')


def shingle_rows():
    exp_y = 143 * CA
    ys = []
    y = Y_ROOF[1] - 40
    while y > Y_ROOF[0] + 20:
        ys.append(y)
        y -= exp_y
    return ys


def hinge_z():
    return [(DOOR_RAIL_BOT[0] + DOOR_RAIL_BOT[1]) / 2, (DOOR_RAIL_MID[0] + DOOR_RAIL_MID[1]) / 2,
            (DOOR_RAIL_TOP[0] + DOOR_RAIL_TOP[1]) / 2]


# ------------------------------------------------------------------ фасад
def front_elev(v, house=(-250, 1750), house_top=2800, doors=True):
    if house:
        v.hatch([(house[0], 0), (house[1], 0), (house[1], house_top), (house[0], house_top)], step=3.2, angle=45,
                color=HexColor('#D8D0C2'), lw=0.2, fill=HOUSE)
        v.text(house[0] + 25, 1500, 'стена\nдома', 5.5, color=GREY)
    v.ground(house[0] if house else -300, house[1] if house else 1800)
    # пустота под шкафом и опоры
    v.rect(-CL, 0, W + CL, CLAD_Z0, fill=DARKV, stroke=None)
    for (x0, x1) in BLK_X:
        v.rect(x0, 0, x1, CLAD_Z0, fill=CONCRETE, stroke=INK, lw=0.3)
    # примыкание к стене
    zb = zr(Y_ROOF[0])
    v.rect(X_ROOF[0], zb, X_ROOF[1], zb + 250, fill=HexColor('#4A4E54'), stroke=INK, lw=0.3)
    v.rect(X_ROOF[0] - 10, zb + 160, X_ROOF[1] + 10, zb + 265, fill=METAL, stroke=INK, lw=0.3)
    v.line(X_ROOF[0] - 10, zb + 268, X_ROOF[1] + 10, zb + 268, color=SEALANT, lw=0.8)
    # скат кровли (виден спереди в сокращении)
    v.rect(X_ROOF[0], zr(Y_ROOF[1]), X_ROOF[1], zb, fill=ROOF_C, stroke=INK, lw=0.4)
    for y in shingle_rows():
        v.line(X_ROOF[0], zr(y), X_ROOF[1], zr(y), color=HexColor('#4D5157'), lw=0.25)
    # петельные стойки, цоколь, двери
    for (x0, x1) in (POST_L, POST_R):
        v.rect(x0, POST_Z[0], x1, POST_Z[1], fill=TRIM, stroke=INK, lw=0.4)
    v.rect(POST_L[1], SKIRT_Z[0], POST_R[0], SKIRT_Z[1], fill=PAINT_L, stroke=INK, lw=0.4)
    v.rect(POST_L[1], SKIRT_Z[1], POST_R[0], SKIRT_Z[1] + 8, fill=METAL, stroke=INK, lw=0.3)
    v.rect(POST_L[1], FRIEZE_Z[0], POST_R[0], FRIEZE_Z[1], fill=TRIM, stroke=INK, lw=0.4)
    v.rect(POST_L[1], DOOR_Z[1], POST_R[0], DOOR_Z[1] + 9, fill=METAL, stroke=INK, lw=0.3)
    if doors:
        for (x0, x1) in (DOOR_L, DOOR_R):
            v.rect(x0, DOOR_Z[0], x1, DOOR_Z[1], fill=DOOR_C, stroke=INK, lw=0.5)
            for i in range(5):
                xx = x0 + 90 + i * 135
                v.line(xx, DOOR_Z[0], xx, DOOR_Z[1], color=HexColor('#7F8F82'), lw=0.25)
        v.rect(ASTR_X[0], DOOR_Z[0], ASTR_X[1], DOOR_Z[1], fill=TRIM, stroke=INK, lw=0.4)
        for zc in hinge_z():
            for s, xp, xe in ((1, -12, 430), (-1, W + 12, W - 430)):
                v.poly([(xp, zc - 32), (xp + s * 38, zc - 32), (xp + s * 38, zc + 32), (xp, zc + 32)],
                       fill=STEEL, stroke=INK, lw=0.2)
                v.poly([(xp + s * 38, zc - 22), (xe, zc - 9), (xe, zc + 9), (xp + s * 38, zc + 22)],
                       fill=STEEL, stroke=INK, lw=0.2)
        for xh in (672, 828):
            v.rect(xh - 8, 1110, xh + 8, 1270, fill=STEEL, stroke=INK, lw=0.2)
        v.rect(ASTR_X[0] - 20, 1330, ASTR_X[1] + 22, 1380, fill=STEEL, stroke=INK, lw=0.2)
        v.rect(ASTR_X[1] - 12, 1265, ASTR_X[1] + 30, 1335, fill=HexColor('#C9A642'), stroke=INK, lw=0.2)
    # лобовая доска, желоб, труба
    v.rect(X_ROOF[0], FASCIA_Z[0], X_ROOF[1], FASCIA_Z[1], fill=TRIM, stroke=INK, lw=0.4)
    v.rect(X_ROOF[0] - 5, GUT_ZTOP - GUT_R, X_ROOF[1] + 5, GUT_ZTOP, fill=GUT_C, stroke=INK, lw=0.4)
    v.line(X_ROOF[0] - 5, GUT_ZTOP - 8, X_ROOF[1] + 5, GUT_ZTOP - 8, color=HexColor('#6E747C'), lw=0.3)
    v.rect(PIPE_X - PIPE_R, 260, PIPE_X + PIPE_R, GUT_ZTOP - GUT_R, fill=GUT_C, stroke=INK, lw=0.4)
    v.poly([(PIPE_X - PIPE_R, 260), (PIPE_X + PIPE_R, 260), (PIPE_X + 170, 150), (PIPE_X + 170, 225),
            (PIPE_X + PIPE_R, 300)], fill=GUT_C, stroke=INK, lw=0.4)
    for zz in (600, 1300):
        v.rect(PIPE_X - PIPE_R - 4, zz, PIPE_X + PIPE_R + 4, zz + 25, fill=DARKV, stroke=None)


# ------------------------------------------------------------------ вид сбоку (справа), дом слева
def side_elev(v, wall=(-300, HOUSE_Y), top=2800):
    v.hatch([(wall[0], -60), (wall[1], -60), (wall[1], top), (wall[0], top)], step=1.6, angle=45,
            color=HOUSE_H, lw=0.25, fill=HOUSE, stroke=INK, slw=0.5)
    v.text(wall[0] + 15, top - 120, 'стена\nдома', 5.5, color=GREY)
    v.ground(wall[1], 1250)
    for (y0, y1) in BLK_Y:
        v.rect(y0, 0, y1, Z_BLK, fill=CONCRETE, stroke=INK, lw=0.3)
    # боковая обшивка
    pts = [(-CL, CLAD_Z0), (D, CLAD_Z0), (D, zo(D)), (-CL, zo(-CL))]
    v.poly(pts, fill=PAINT_L, stroke=INK, lw=0.5)
    z = CLAD_Z0 + CLAD_STEP
    while z < zo(-CL):
        y_end = D if z < zo(D) else (Z_BACK_TOP - z + RAF_V) / S
        v.line(-CL, z, min(D, y_end), z, color=HexColor('#7F8F82'), lw=0.25)
        z += CLAD_STEP
    # стойка, торец двери, нащельник, отлив
    v.rect(POST_Y[0], POST_Z[0], POST_Y[1], POST_Z[1], fill=TRIM, stroke=INK, lw=0.4)
    v.rect(ASTR_Y[0], DOOR_Z[0], ASTR_Y[1], DOOR_Z[1], fill=TRIM, stroke=INK, lw=0.3)
    v.rect(D, DOOR_Z[1], D + 58, DOOR_Z[1] + 9, fill=METAL, stroke=INK, lw=0.3)
    for zc in hinge_z():
        v.rect(POST_Y[1], zc - 22, POST_Y[1] + 5, zc + 22, fill=STEEL, stroke=None)
    # кровля: ветровой брусок, лобовая доска, ОСП + покрытие, торцевая планка
    hb = 45 / CA
    ya, yb = Y_ROOF[0], FASCIA_Y[0]
    v.poly([(ya, zo(ya) - hb), (yb, zo(yb) - hb), (yb, zo(yb)), (ya, zo(ya))], fill=TRIM, stroke=INK, lw=0.4)
    v.rect(FASCIA_Y[0], FASCIA_Z[0], FASCIA_Y[1], FASCIA_Z[1], fill=TRIM, stroke=INK, lw=0.4)
    v.poly([(Y_ROOF[0], zo(Y_ROOF[0])), (Y_ROOF[1], zo(Y_ROOF[1])), (Y_ROOF[1], zr(Y_ROOF[1])),
            (Y_ROOF[0], zr(Y_ROOF[0]))], fill=ROOF_C, stroke=INK, lw=0.4)
    v.poly([(Y_ROOF[0], zo(Y_ROOF[0]) - 30), (Y_ROOF[1] + 4, zo(Y_ROOF[1]) - 30), (Y_ROOF[1] + 4, zr(Y_ROOF[1]) + 3),
            (Y_ROOF[0], zr(Y_ROOF[0]) + 3)], fill=HexColor('#6C7179'), stroke=INK, lw=0.4)
    # примыкание
    zb = zr(Y_ROOF[0])
    v.polyline([(HOUSE_Y + 4, zb + 268), (HOUSE_Y + 4, zb + 160), (HOUSE_Y + 18, zb + 150)], color=METAL, lw=1.2)
    v.line(HOUSE_Y, zb + 268, HOUSE_Y + 6, zb + 268, color=SEALANT, lw=1.2)
    # желоб
    pts = [(GUT_YC + GUT_R * math.cos(math.radians(a)), GUT_ZTOP + GUT_R * math.sin(math.radians(a)))
           for a in range(-180, 1, 15)]
    v.poly(pts, fill=GUT_C, stroke=INK, lw=0.4)
    v.line(FASCIA_Y[1], FASCIA_Z[1] - 20, GUT_YC - GUT_R, GUT_ZTOP, color=INK, lw=0.4)
    # труба: выпуск → отвод к стене → вниз
    yb2 = D - 40
    c = v.c
    pts = [(GUT_YC, GUT_ZTOP - GUT_R), (GUT_YC, 2010), (yb2, 2010 - (GUT_YC - yb2)), (yb2, 230)]
    c.saveState()
    c.setLineCap(1)
    c.setLineJoin(1)
    for lw, col in ((2 * PIPE_R * v.k * mm + 0.9, INK), (2 * PIPE_R * v.k * mm, GUT_C)):
        c.setLineWidth(lw)
        c.setStrokeColor(col)
        p = c.beginPath()
        p.moveTo(*v.P(*pts[0]))
        for q in pts[1:]:
            p.lineTo(*v.P(*q))
        c.drawPath(p, stroke=1, fill=0)
    c.restoreState()
    v.circle(yb2, 190, PIPE_R + 8, fill=GUT_C, stroke=INK, lw=0.4)
    for zz in (600, 1300):
        v.rect(yb2 - PIPE_R - 6, zz, yb2 + PIPE_R + 6, zz + 25, fill=DARKV, stroke=None)


# ------------------------------------------------------------------ план (вид сверху), дом сверху листа
def plan_view(v, swing=True):
    B = lambda y: -y
    v.hatch([(-200, B(HOUSE_Y)), (1700, B(HOUSE_Y)), (1700, B(-260)), (-200, B(-260))], step=1.6, angle=45,
            color=HOUSE_H, lw=0.25, fill=HOUSE, stroke=INK, slw=0.5)
    v.text(-180, B(-190), 'стена дома', 5.5, color=GREY)
    # скрытый контур шкафа
    v.rect(-CL, B(-CL), W + CL, B(D), fill=None, stroke=GREY, lw=0.35, dash=(2, 1.5))
    v.rect(POST_L[0], B(POST_Y[0]), POST_R[1], B(POST_Y[1]), fill=None, stroke=GREY, lw=0.35, dash=(2, 1.5))
    # кровля
    v.rect(X_ROOF[0], B(Y_ROOF[0]), X_ROOF[1], B(Y_ROOF[1]), fill=HexColor('#9AA0A8'), stroke=INK, lw=0.5)
    for y in shingle_rows():
        v.line(X_ROOF[0], B(y), X_ROOF[1], B(y), color=HexColor('#7C828A'), lw=0.25)
    # желоб
    v.rect(X_ROOF[0] - 5, B(GUT_YC - GUT_R), X_ROOF[1] + 5, B(GUT_YC + GUT_R), fill=GUT_C, stroke=INK, lw=0.4)
    v.rect(X_ROOF[0] - 5, B(GUT_YC - GUT_R + 10), X_ROOF[1] + 5, B(GUT_YC + GUT_R - 10), fill=HexColor('#6F757D'),
           stroke=None)
    v.circle(1550, B(GUT_YC), 30, fill=HexColor('#3E4349'), stroke=INK, lw=0.3)
    # скрытая труба и отвод
    v.circle(PIPE_X, B(D - 40), PIPE_R, fill=None, stroke=GREY, lw=0.35)
    v.rect(PIPE_X, B(D - 40 - PIPE_R), PIPE_X + 170, B(D - 40 + PIPE_R), fill=GUT_C, stroke=INK, lw=0.35)
    # стрелка уклона
    xm = 520
    v.line(xm, B(120), xm, B(640), color=INK, lw=0.6)
    v.poly([(xm - 22, B(560)), (xm + 22, B(560)), (xm, B(660))], fill=INK, stroke=None)
    v.text(xm + 40, B(330), 'уклон %.0f°' % ALPHA_DEG, 6, color=INK)
    v.text(xm + 40, B(420), '(i ≈ %d%%)' % round(S * 100), 5.5, color=GREY)
    if swing:
        for hx, s in ((POST_L[1] + 1.5, 1), (POST_R[0] - 1.5, -1)):
            r = DOOR_W
            yc = POST_Y[1]
            pts = [(hx + s * r * math.cos(math.radians(a)), B(yc + r * math.sin(math.radians(a))))
                   for a in range(0, 91, 5)]
            v.polyline(pts, color=ACCENT, lw=0.35, dash=(1.5, 1))
            v.line(hx, B(yc), hx, B(yc + r), color=ACCENT, lw=0.5)

# -*- coding: utf-8 -*-
"""Лист: внутреннее оснащение — 3D с открытыми дверьми, вид спереди, план."""
import math
from reportlab.lib.units import mm
from reportlab.lib.colors import HexColor
from geom import *
from draw import *
from common import para, PS, PSs
from model3d import interior_open
from elev import PN_L, PN_E

INNER2 = HexColor('#D5DADD')
HANDLE = HexColor('#B07A44')
HEAD = HexColor('#8E99A4')
WOODV = HexColor('#EED9B0')


def tool2d(v, kind, x, b0=Z_FLOOR):
    if kind == 'shovel':
        v.line(x, b0 + 300, x, b0 + 1450, color=HANDLE, lw=1.4)
        v.poly([(x - 95, b0 + 60), (x, b0 + 2), (x + 95, b0 + 60), (x + 100, b0 + 300), (x - 100, b0 + 300)],
               fill=HEAD, stroke=INK, lw=0.3)
        v.rect(x - 45, b0 + 1430, x + 45, b0 + 1460, fill=HANDLE, stroke=INK, lw=0.2)
    elif kind == 'scoop':
        v.line(x, b0 + 330, x, b0 + 1400, color=HANDLE, lw=1.4)
        v.poly([(x - 110, b0 + 5), (x + 110, b0 + 5), (x + 100, b0 + 330), (x - 100, b0 + 330)], fill=HEAD,
               stroke=INK, lw=0.3)
    elif kind == 'fork':
        v.line(x, b0 + 300, x, b0 + 1450, color=HANDLE, lw=1.4)
        v.rect(x - 85, b0 + 270, x + 85, b0 + 300, fill=HEAD, stroke=INK, lw=0.3)
        for dx in (-75, -25, 25, 75):
            v.line(x + dx, b0 + 5, x + dx, b0 + 275, color=HEAD, lw=0.9)
    elif kind == 'rake':
        v.line(x, b0 + 20, x, b0 + 1640, color=HANDLE, lw=1.4)
        v.rect(x - 180, b0 + 1640, x + 180, b0 + 1670, fill=HEAD, stroke=INK, lw=0.3)
        for i in range(10):
            xx = x - 170 + i * 37.8
            v.line(xx, b0 + 1640, xx, b0 + 1580, color=HEAD, lw=0.6)
    elif kind == 'hoe':
        v.line(x, b0 + 20, x, b0 + 1520, color=HANDLE, lw=1.4)
        v.rect(x - 60, b0 + 1520, x + 60, b0 + 1620, fill=HEAD, stroke=INK, lw=0.3)


TOOLS = [('fork', 110), ('shovel', 215), ('rake', 305), ('scoop', 415), ('hoe', 540)]


def inside_front(v):
    """Вид спереди без створок."""
    v.ground(-150, 1150)
    v.rect(-PN, 0, W + PN, CLAD_Z0, fill=HexColor('#5A5A5A'), stroke=None)
    for (x0, x1) in BLK_X:
        v.rect(x0, 0, x1, CLAD_Z0, fill=CONCRETE, stroke=INK, lw=0.3)
    # задняя стена изнутри в проёме
    v.rect(OPEN_X[0], OPEN_Z[0], OPEN_X[1], OPEN_Z[1], fill=INNER2, stroke=None)
    x = 20
    while x < W:
        if OPEN_X[0] < x < OPEN_X[1]:
            v.line(x, OPEN_Z[0], x, OPEN_Z[1], color=HexColor('#B8BFC3'), lw=0.25)
        x += WAVE
    v.rect(OPEN_X[0], Z_GIRT[0], OPEN_X[1], Z_GIRT[1], fill=WOODV, stroke=GREY, lw=0.3)
    for kind, x in TOOLS:
        v.rect(x - 22, Z_GIRT[0] + 8, x + 22, Z_GIRT[1] - 8, fill=HexColor('#2B2E33'), stroke=None)
    for kind, x in TOOLS:
        tool2d(v, kind, x)
    # стеллаж
    for i, z in enumerate(RACK_SHELF_Z):
        v.rect(RACK_SHELF_X[0], z, OPEN_X[1], z + 12, fill=OSB, stroke=INK, lw=0.4)
        v.rect(RACK_X[1], z - T, RACK_X[1] + 2, z, fill=None, stroke=None)
        if i == 0:
            v.rect(RACK_SHELF_X[0] + 30, z + 12, RACK_SHELF_X[0] + 140, z + 172, fill=HexColor('#C8A86B'), stroke=INK,
                   lw=0.25)
            v.rect(RACK_SHELF_X[0] + 170, z + 12, RACK_SHELF_X[0] + 240, z + 202, fill=HexColor('#3B6EA5'),
                   stroke=INK, lw=0.25)
        elif i == 1:
            v.rect(RACK_SHELF_X[0] + 25, z + 12, RACK_SHELF_X[0] + 175, z + 132, fill=HexColor('#E6D3A3'), stroke=INK,
                   lw=0.25)
            v.rect(RACK_SHELF_X[0] + 215, z + 12, RACK_SHELF_X[0] + 290, z + 272, fill=HexColor('#E3E7EA'), stroke=INK,
                   lw=0.25)
        else:
            v.rect(RACK_SHELF_X[0] + 30, z + 12, RACK_SHELF_X[0] + 230, z + 122, fill=HexColor('#7E9C5A'), stroke=INK,
                   lw=0.25)
    v.rect(700, Z_FLOOR, 860, Z_FLOOR + 260, fill=HexColor('#2E86C1'), stroke=INK, lw=0.25)
    v.rect(RACK_X[0], Z_FLOOR, RACK_X[1], Z_FLOOR + RACK_H, fill=WOODV, stroke=INK, lw=0.4)
    # передняя рама
    for x0 in (0, W - T):
        v.rect(x0, Z_FLOOR, x0 + T, Z_F - T, fill=WOODV, stroke=INK, lw=0.4)
        v.rect(x0 + 20, OPEN_Z[0], x0 + 30, OPEN_Z[1], fill=HexColor('#2B2E33'), stroke=None)
    v.rect(-PN, Z_BASE[0], W + PN, Z_FLOOR, fill=WOODV, stroke=INK, lw=0.4)
    v.rect(OPEN_X[0], Z_THR[0], OPEN_X[1], Z_THR[1], fill=WOODV, stroke=INK, lw=0.4)
    v.rect(OPEN_X[0], Z_HEADER[0], OPEN_X[1], Z_HEADER[1], fill=WOODV, stroke=INK, lw=0.4)
    v.rect(OPEN_X[0], VENT_Z[0], OPEN_X[1], VENT_Z[1], fill=HexColor('#3A3F44'), stroke=INK, lw=0.3)
    v.rect(PURLIN_X[0], Z_F - T, PURLIN_X[1], Z_F, fill=WOODV, stroke=INK, lw=0.4)
    v.rect(ROOF_X[0], zu(ROOF_Y[1]), ROOF_X[1], zr(ROOF_Y[1]), fill=PN_E, stroke=INK, lw=0.3)
    for (x0, x1) in ((-PN, 0), (W, W + PN)):
        v.rect(x0, CLAD_Z0, x1, Z_F - T, fill=PN_E, stroke=INK, lw=0.3)


def inside_plan(v):
    """План на высоте 1.0 м от пола."""
    B = lambda y: -y
    v.rect(-PN, B(-PN), W + PN, B(D), fill=None, stroke=INK, lw=0.6)
    v.rect(0, B(0), W, B(D), fill=HexColor('#F3E3C4'), stroke=None)
    for (x0, y0) in ((0, 0), (W - T, 0), (0, D - T), (W - T, D - T)):
        v.cut(x0, B(y0), x0 + T, B(y0 + T))
    v.rect(RACK_SHELF_X[0], B(RACK_SHELF_Y[0]), RACK_SHELF_X[1], B(RACK_SHELF_Y[1]), fill=OSB, stroke=INK, lw=0.4)
    for (y0, y1) in RACK_Y:
        v.cut(RACK_X[0], B(y0), RACK_X[1], B(y1))
    for kind, x in TOOLS:
        v.circle(x, B(85), 16, fill=HexColor('#B27B47'), stroke=INK, lw=0.25)
    v.circle(60, B(300), 40, fill=None, stroke=HexColor('#2E7D32'), lw=1.0)
    v.text(330, B(250), 'инструмент', 5, anchor='c', color=GREY)
    v.text(828, B(250), 'стеллаж', 5, anchor='c')


def sheet_interior(c, num, total):
    tblock(c, num, total, 'Внутреннее оснащение', '1:15, 1:20')
    heading(c, num, 'Внутреннее оснащение: стеллаж на 3 полки',
            'Слева — секция 565 мм для длинного инструмента, справа — стеллаж 345 × 410 мм на 3 полки')
    # 3D с открытыми дверьми
    c.saveState()
    p = c.beginPath()
    p.roundRect(18 * mm, 25 * mm, 134 * mm, 160 * mm, 3 * mm)
    c.clipPath(p, stroke=0, fill=0)
    c.setFillColor(HexColor('#F4F7F9'))
    c.rect(18 * mm, 25 * mm, 134 * mm, 160 * mm, stroke=0, fill=1)
    interior_open(Axo(c, 54, 40, 18), theta_l=115, theta_r=168)
    c.restoreState()
    text(c, 22, 179, 'Двери открыты', 8, FB, INK)
    # вид спереди без створок
    v = View(c, 157 + 10 / 15, 40, 15)
    inside_front(v)
    text(c, 157 + 500 / 15, 182, 'Вид спереди (створки сняты)', 7.5, FB, anchor='c')
    zs = [Z_FLOOR] + RACK_SHELF_Z
    for i in range(3):
        v.dim_v(zs[i], zs[i + 1], W + 70, W, W, txt='450', tside='right')
    v.dim_v(Z_FLOOR, Z_GIRT[1], -45, 0, None, txt='1250')
    v.dim_h(OPEN_X[0], RACK_X[0], -150, 0, 0, txt='565')
    v.dim_h(RACK_X[1], OPEN_X[1], -150, 0, 0, txt='300')
    # план
    v2 = View(c, 236, 162, 20)
    inside_plan(v2)
    text(c, 236 + 500 / 20, 182, 'План на высоте 1 м', 7.5, FB, anchor='c')
    v2.dim_h(RACK_SHELF_X[0], RACK_SHELF_X[1], -620, -D, -D, txt='345')
    v2.dim_v(-RACK_SHELF_Y[0], -RACK_SHELF_Y[1], 1080, W, W, txt='410', tside='right')
    # пояснения
    para(c, 234, 124, 56,
         '<b>Стеллаж.</b> Две стойки 45×45 (поз. 14) от пола до верхней полки, 1350 мм. Под каждую полку — '
         'два бруска 45×45: у правой стены (поз. 15, торцами в стойки каркаса) и между стойками стеллажа '
         '(поз. 16). Полки — ОСП-3 12 мм, 345 × 410 (поз. 18), прикрутить к брускам.<br/><br/>'
         '<b>Высоты полок</b> от пола: 450, 900, 1350 мм. Под нижней — лейка, ведро, канистра.<br/><br/>'
         '<b>Инструмент</b> — 5 шт. до 1.7 м в пружинных держателях на заднем ригеле (h = 1250). '
         'Шланг — на крючке левой стены.<br/><br/>'
         '<b>Нагрузка</b> на полку — до 15 кг. Тяжёлое (мешки, канистры) — вниз.', PSs)

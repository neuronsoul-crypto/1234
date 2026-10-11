# -*- coding: utf-8 -*-
"""Листы: каркас, узлы, двери (эконом-вариант)."""
import math
from reportlab.lib.colors import HexColor
from reportlab.lib.units import mm
from geom import *
from draw import *
from model3d import frame_iso
from parts import PARTS, SHEETS
from sheets_a import PN_CUT, sheet_line

PNF = HexColor('#C7D9CB')
PARTN = {p[0]: p for p in PARTS}


def clip_begin(c, v, a0, b0, a1, b1):
    c.saveState()
    p = c.beginPath()
    x0, y0 = v.P(a0, b0)
    x1, y1 = v.P(a1, b1)
    p.rect(x0, y0, x1 - x0, y1 - y0)
    c.clipPath(p, stroke=0, fill=0)


def frame_box(c, v, a0, b0, a1, b1, n, title):
    x0, y0 = v.pm(a0, b0)
    x1, y1 = v.pm(a1, b1)
    c.saveState()
    c.setStrokeColor(ACCENT)
    c.setLineWidth(0.5)
    c.setDash(3, 1.5)
    c.rect(x0 * mm, y0 * mm, (x1 - x0) * mm, (y1 - y0) * mm)
    c.restoreState()
    V = View(c, x0 + 3.5, y1 + 4.5, 1)
    V.marker(0, 0, n, r=3.0)
    text(c, x0 + 8, y1 + 3.3, title, 8, FB)


def part_list(c, x0, y0, ids, title, size=5.4, step=6.2):
    if title:
        text(c, x0, y0, title, 7, FB)
    for i, pid in enumerate(ids):
        p = PARTN[pid]
        y = y0 - 5.5 - i * step
        V = View(c, x0 + 2.2, y - 0.2, 1)
        V.marker(0, 0, pid, r=1.9)
        text(c, x0 + 5.5, y + 0.3, p[1], size)
        text(c, x0 + 5.5, y - 2.2, '%s · L = %d · %d шт.' % (p[2], round(p[3]), p[4]), size, F, GREY)


def pn_sheet_v(v, y_out, z0, z1, outward=-1):
    """Профнастил в вертикальном разрезе (волна поперёк плоскости): полоса толщиной PN."""
    v.rect(min(y_out, y_out - outward * PN), z0, max(y_out, y_out - outward * PN), z1, fill=PNF, stroke=None)
    sheet_line(v, [(y_out, z0), (y_out, z1)])
    sheet_line(v, [(y_out - outward * PN, z0 + 3), (y_out - outward * PN, z1)], lw=0.5)


# ============================================================ ЛИСТ: каркас
def sheet_frame(c, num, total):
    tblock(c, num, total, 'Каркас и основание', '1:18, 1:15')
    heading(c, num, 'Каркас и основание', 'Изометрия каркаса без обшивки и дверей · брусок 45×45 сорт ВС, '
                                          'пропитанный антисептиком')
    ax = Axo(c, 36.5, 46, 18)
    frame_iso(ax)
    marks = [('1', (500, D, Z_BASE[0] + 20), (0, -8)), ('2', (W - 22, 250, Z_BASE[0] + 20), (9, -5)),
             ('3', (W - 22, 22, 1700), (9, 6)), ('4', (W - 22, D - 22, 1000), (10, 0)),
             ('5', (PURLIN_X[1] - 30, 22, Z_B - 20), (8, 6)), ('6', (W - 22, 250, zu(250) - 20), (10, 2)),
             ('7', (500, 22, Z_GIRT[0] + 20), (-4, 8)), ('8', (W - 22, 250, Z_GIRT[0] + 20), (10, 0)),
             ('9', (500, D - 22, Z_HEADER[0] + 20), (0, -7)), ('10', (300, D - 22, Z_THR[0] + 20), (-10, 4))]
    for pid, p, (dx, dy) in marks:
        x, y = ax.pm(*p)
        c.saveState()
        c.setStrokeColor(ACCENT)
        c.setLineWidth(0.35)
        c.line(x * mm, y * mm, (x + dx) * mm, (y + dy) * mm)
        c.setFillColor(ACCENT)
        c.circle(x * mm, y * mm, 0.5 * mm, stroke=0, fill=1)
        c.restoreState()
        View(c, x + dx, y + dy, 1).marker(0, 0, pid, r=2.0)
    part_list(c, 112, 183, [str(i) for i in range(1, 11)], 'Позиции каркаса')
    text(c, 112, 113, 'Двери — лист 8, раскрой — лист 9.', 5.6, F, GREY)
    # схема основания
    v = View(c, 175, 160, 15)
    B = lambda y: -y
    text(c, 175 + 500 / 15, 173, 'Опоры и обвязка (вид сверху)', 7.5, FB, anchor='c')
    for (x0, x1) in BLK_X:
        v.dots([(x0, B(BLK_Y[0])), (x1, B(BLK_Y[0])), (x1, B(BLK_Y[1])), (x0, B(BLK_Y[1]))], step=0.9,
               fill=CONCRETE, color=GREY, stroke=INK, slw=0.4, seed=int(x0))
    v.cut(0, B(0), W, B(T), x=False)
    v.cut(0, B(D - T), W, B(D), x=False)
    for x0 in (0, (W - T) / 2, W - T):
        v.cut(x0, B(T), x0 + T, B(D - T), x=False)
    v.line(0, B(0), W, B(D), color=ACCENT2, lw=0.3, dash=(1.5, 1))
    v.text(600, B(250), 'диагонали %d' % round(math.hypot(W, D)), 5.5, color=ACCENT2, rot=-26.6)
    v.dim_h(0, W, 130, 0, 0)
    v.dim_v(B(0), B(D), -120, 0, 0)
    v.dim_h(BLK_X[0][0], BLK_X[0][1], -640, B(BLK_Y[1]), B(BLK_Y[1]), txt='190')
    v.dim_h(BLK_X[1][0], BLK_X[1][1], -640, B(BLK_Y[1]), B(BLK_Y[1]), txt='190')
    v.dim_h(BLK_X[2][0], BLK_X[2][1], -640, B(BLK_Y[1]), B(BLK_Y[1]), txt='190')
    v.dim_v(B(BLK_Y[0]), B(BLK_Y[1]), 1120, W, W, txt='390', tside='right')
    v.text(-110, B(-55), 'стена дома ↑', 5.5, color=GREY)
    text(c, 175, 112, 'Пескоблок 390×190×188 — 3 шт. под боковые и среднюю\n'
                      'поперечины. Верх блоков в одном уровне, +0.150 от земли.\n'
                      'Под каждую поперечину — полоса рубероида.\n'
                      'Соединения обвязки — саморезы 4.5×70 + уголок.', 5.8)
    # раскрой ОСП
    v2 = View(c, 175, 88, 40)
    text(c, 175, 94, 'Раскрой листа ОСП-3 12 мм 2500×1250', 7.5, FB)
    v2.rect(0, -1250, 2500, 0, fill=HexColor('#F7EEDC'), stroke=INK, lw=0.4)
    v2.rect(0, -500, 1000, 0, fill=OSB, stroke=INK, lw=0.5)
    v2.text(500, -270, 'пол 1000×500', 5.3, anchor='c')
    v2.rect(1000, -250, 1910, 0, fill=OSB, stroke=INK, lw=0.5)
    v2.text(1455, -150, 'полка 910×250', 5.3, anchor='c')
    v2.text(1250, -900, 'остаток — запас (ремонт, крышка, подставки)', 5.0, color=GREY, anchor='c')
    text(c, 175, 52, 'Пол: в углах — вырезы 45×45 не нужны: стойки ставятся\n'
                     'поверх пола и крепятся саморезами 4.5×70 сквозь пол\n'
                     'в обвязку + уголок. В полу просверлить 6–8 отверстий\n'
                     'Ø 10 мм у задней стены — для стока воды с инструмента.\n'
                     'Кромки ОСП дважды пропитать антисептиком.', 5.8)


# ============================================================ узлы 1, 2
def node1(v, box):
    A0, A1, B0, B1 = box
    c = v.c
    zb = zr(ROOF_Y[0])
    clip_begin(c, v, A0, B0, A1, B1)
    v.hatch([(A0 - 20, B0 - 20), (HOUSE_Y, B0 - 20), (HOUSE_Y, B1 + 20), (A0 - 20, B1 + 20)], step=1.6, angle=45,
            color=HOUSE_H, lw=0.3, fill=HOUSE, stroke=INK, slw=0.6)
    v.rect(0, B0 - 20, T, Z_B - T, fill=WOOD, stroke=GREY, lw=0.3)
    v.cut(0, Z_B - T, T, Z_B, lw=0.7)
    pn_sheet_v(v, -PN, B0 - 20, BACK_SHEET['z'][1], outward=-1)
    za = Z_B - T / 2
    v.rect(HOUSE_Y, za - 25, -PN, za + 25, fill=HexColor('#D7C9A8'), stroke=INK, lw=0.4)
    v.line(T - 2, za, -150, za, color=STEEL, lw=2.2)
    v.rect(T - 4, za - 9, T + 1, za + 9, fill=STEEL, stroke=None)
    # кровля
    v.poly([(ROOF_Y[0], zu(ROOF_Y[0])), (A1 + 20, zu(A1 + 20)), (A1 + 20, zr(A1 + 20)), (ROOF_Y[0], zr(ROOF_Y[0]))],
           fill=PNF, stroke=None)
    sheet_line(v, [(ROOF_Y[0], zr(ROOF_Y[0])), (A1 + 20, zr(A1 + 20))])
    sheet_line(v, [(ROOF_Y[0], zu(ROOF_Y[0])), (A1 + 20, zu(A1 + 20))], lw=0.5)
    # уплотнитель, планка, герметик, саморез
    v.poly([(ROOF_Y[0] + 4, zr(ROOF_Y[0] + 4)), (ROOF_Y[0] + 95, zr(ROOF_Y[0] + 95)),
            (ROOF_Y[0] + 95, zr(ROOF_Y[0] + 95) + 12), (ROOF_Y[0] + 4, zr(ROOF_Y[0] + 4) + 12)], fill=SEAL, stroke=None)
    v.polyline([(HOUSE_Y + 2, zb + 130), (HOUSE_Y + 2, zb + 14), (ROOF_Y[0] + 110, zr(ROOF_Y[0] + 110) + 14),
                (ROOF_Y[0] + 125, zr(ROOF_Y[0] + 125) - 4)], color=METAL, lw=1.8)
    v.circle(HOUSE_Y + 1, zb + 134, 7, fill=SEALANT, stroke=None)
    v.line(HOUSE_Y + 2, zb + 90, HOUSE_Y - 45, zb + 90, color=STEEL, lw=1.1)
    yy = 20
    v.line(yy, zr(yy) + 18, yy, zu(yy) - 35, color=STEEL, lw=1.1)
    v.rect(yy - 9, zr(yy) + 14, yy + 9, zr(yy) + 18, fill=SEAL, stroke=None)
    c.restoreState()
    v.dim_h(HOUSE_Y, -PN, B0 + 25, None, None, txt='40')
    v.dim_v(zb, zb + 130, HOUSE_Y + 45, HOUSE_Y + 2, HOUSE_Y + 2, txt='130', tside='right')
    return [
        (HOUSE_Y + 1, zb + 134, 'Герметик ПУ / кровельный\nпо верхней кромке планки'),
        (HOUSE_Y - 20, zb + 90, 'Дюбель-гвоздь 6×40, шаг 300'),
        (HOUSE_Y + 2, zb + 50, 'Планка примыкания (в цвет)'),
        (-120, za, 'Рамный дюбель 10×100'),
        (-30, za - 15, 'Проставка 40 мм'),
        (-PN, 2150, 'Профнастил задней стены'),
    ], [
        (ROOF_Y[0] + 60, zr(ROOF_Y[0] + 60) + 8, 'Уплотнитель под волну'),
        (yy, zr(yy) + 16, 'Саморез 4.8×29 с EPDM'),
        (120, zr(120), 'Кровельный лист С10'),
        (22, Z_B - 22, 'Задний прогон 45×45'),
        (22, 2150, 'Стойка 45×45'),
    ]


def node2(v, box):
    A0, A1, B0, B1 = box
    c = v.c
    clip_begin(c, v, A0, B0, A1, B1)
    v.rect(D - T, B0 - 20, D, Z_HEADER[0], fill=WOOD, stroke=GREY, lw=0.3)
    v.cut(D - T, Z_HEADER[0], D, Z_HEADER[1], lw=0.7)
    v.cut(D - T, Z_F - T, D, Z_F, lw=0.7)
    v.rect(D - T, Z_HEADER[1], D, Z_F - T, fill=WOOD, stroke=GREY, lw=0.3)
    v.line(D + 1.5, VENT_Z[0], D + 1.5, VENT_Z[1], color=MESH, lw=1.3, dash=(2, 1.2))
    # дверь: верхний ригель рамки и лист
    v.rect(DOOR_Y[0], B0 - 20, DOOR_Y[1], RAIL_TOP[0], fill=None, stroke=None)
    v.cut(DOOR_Y[0], RAIL_TOP[0], DOOR_Y[1], RAIL_TOP[1], lw=0.6)
    pn_sheet_v(v, SHEET_DOOR_Y[1], B0 - 20, DOOR_Z[1], outward=1)
    v.circle(D + 2.5, Z_HEADER[0] + 22, 5, fill=SEAL, stroke=None)
    # кровля
    v.poly([(A0 - 20, zu(A0 - 20)), (ROOF_Y[1], zu(ROOF_Y[1])), (ROOF_Y[1], zr(ROOF_Y[1])), (A0 - 20, zr(A0 - 20))],
           fill=PNF, stroke=None)
    sheet_line(v, [(A0 - 20, zr(A0 - 20)), (ROOF_Y[1], zr(ROOF_Y[1]))])
    sheet_line(v, [(A0 - 20, zu(A0 - 20)), (ROOF_Y[1], zu(ROOF_Y[1]))], lw=0.5)
    yy = D - 22
    v.line(yy, zr(yy) + 18, yy, zu(yy) - 35, color=STEEL, lw=1.1)
    v.rect(yy - 9, zr(yy) + 14, yy + 9, zr(yy) + 18, fill=SEAL, stroke=None)
    for k in range(3):
        v.circle(ROOF_Y[1] + 25 + k * 12, zu(ROOF_Y[1]) - 30 - k * 25, 3.5, fill=HexColor('#4A90C2'), stroke=None)
    c.restoreState()
    v.dim_v(DOOR_Z[1], zu(ROOF_Y[1]), ROOF_Y[1] - 20, SHEET_DOOR_Y[1], ROOF_Y[1] - 20,
            txt='%d' % round(door_clearance()), tside='right')
    v.line(SHEET_DOOR_Y[1], DOOR_Z[1], ROOF_Y[1] + 30, DOOR_Z[1], color=ACCENT2, lw=0.5, dash=(2, 1.2))
    v.dim_h(D, ROOF_Y[1], B1 - 15, None, None, txt='200')
    return [
        (D - 22, Z_F - 22, 'Передний прогон 45×45'),
        (D + 1.5, VENT_Z[0] + 25, 'Продух 55 мм, сетка'),
        (D - 22, Z_HEADER[0] + 22, 'Перемычка 45×45'),
        (D + 2.5, Z_HEADER[0] + 22, 'Уплотнитель D-профиль'),
        (D - 22, 1935, 'Стойка (за разрезом)'),
    ], [
        (620, zr(620), 'Кровельный лист С10'),
        (yy, zr(yy) + 16, 'Саморез 4.8×29 с EPDM\nв нижнюю волну'),
        (ROOF_Y[1] + 30, zu(ROOF_Y[1]) - 50, 'Капли падают с края волны —\nпод свесом сухо'),
        (DOOR_Y[0] + 22, RAIL_TOP[0] + 22, 'Верхний ригель створки'),
        (SHEET_DOOR_Y[1], 1950, 'Лист створки'),
        (ROOF_Y[1] - 10, DOOR_Z[1], 'Верх створки при\nоткрывании — проходит'),
    ]


def sheet_nodes12(c, num, total):
    tblock(c, num, total, 'Узлы 1, 2: примыкание, карниз', '1:5')
    heading(c, num, 'Узлы 1 и 2', 'Масштаб 1:5 · примыкание кровли к стене дома и карниз над дверями')
    b1 = (-130, 170, 2120, 2400)
    v = View(c, 125 + 130 / 5, 118 - 2120 / 5, 5)
    L, R = node1(v, b1)
    frame_box(c, v, b1[0], b1[2], b1[1], b1[3], 1, 'Примыкание кровли к стене дома')
    column_notes(v, L, 120, right=False, y_min=112, y_max=178, size=5.8)
    column_notes(v, R, 189, right=True, y_min=112, y_max=178, size=5.8)
    b2 = (420, 760, 1900, 2150)
    v2 = View(c, 125 - 420 / 5, 38 - 1900 / 5, 5)
    L2, R2 = node2(v2, b2)
    frame_box(c, v2, b2[0], b2[2], b2[1], b2[3], 2, 'Карниз и верх двери')
    column_notes(v2, L2, 120, right=False, y_min=30, y_max=92, size=5.8)
    column_notes(v2, R2, 197, right=True, y_min=30, y_max=92, size=5.8)


# ============================================================ узлы 3, 4
def ground_part(v, a0, a1, B0):
    v.hatch([(a0, B0 - 60), (a1, B0 - 60), (a1, -100), (a0, -100)], step=1.5, angle=45, color=SOIL, lw=0.3)
    v.dots([(a0, -100), (a1, -100), (a1, 0), (a0, 0)], step=1.3, color=HexColor('#9A8F78'), fill=GRAVEL,
           stroke=None, circles=True, seed=11)
    v.line(a0, 0, a1, 0, color=INK, lw=0.8)


def node3(v, box):
    A0, A1, B0, B1 = box
    c = v.c
    clip_begin(c, v, A0, B0, A1, B1)
    ground_part(v, HOUSE_Y, A1 + 10, B0)
    v.hatch([(A0 - 20, B0 - 20), (HOUSE_Y, B0 - 20), (HOUSE_Y, B1 + 20), (A0 - 20, B1 + 20)], step=1.6, angle=45,
            color=HOUSE_H, lw=0.3, fill=HOUSE, stroke=INK, slw=0.6)
    v.rect(BLK_Y[0], Z_BLK - BLK_H, A1 + 10, Z_BLK, fill=HexColor('#E3E3E3'), stroke=GREY, lw=0.3)
    v.text(70, 40, 'пескоблок (за разрезом)', 4.6, color=GREY)
    v.rect(T, Z_BLK - 4, A1 + 10, Z_BLK, fill=SEAL, stroke=None)
    v.rect(T, Z_BASE[0], A1 + 10, Z_BASE[1], fill=WOOD, stroke=GREY, lw=0.3)
    v.cut(0, Z_BASE[0], T, Z_BASE[1], lw=0.7)
    v.rect(0, Z_BASE[1], A1 + 10, Z_FLOOR, fill=OSB, stroke=INK, lw=0.5)
    v.rect(0, Z_FLOOR, T, B1 + 10, fill=WOOD, stroke=GREY, lw=0.3)
    pn_sheet_v(v, -PN, CLAD_Z0, B1 + 10, outward=-1)
    v.poly([(-PN, CLAD_Z0), (0, CLAD_Z0 + 6), (0, CLAD_Z0)], fill=HexColor('#FFFFFF'), stroke=None)
    v.line(-5, Z_BASE[0] + 22, 22, Z_BASE[0] + 22, color=STEEL, lw=1.1)
    c.restoreState()
    v.dim_v(0, CLAD_Z0, -95, -PN, -PN)
    v.dim_v(CLAD_Z0, Z_BLK, -40, -PN, None, txt='20')
    v.dim_v(0, Z_FLOOR, 220, None, None, tside='right')
    v.dim_h(HOUSE_Y, -PN, B1 - 25, None, None, txt='40')
    return [
        (-PN - 1, B1 - 60, 'Зазор 40 мм открыт снизу и с боков —\nстена дома проветривается'),
        (-PN, 330, 'Профнастил С10'),
        (-PN, CLAD_Z0 + 4, 'Низ листа на 20 мм ниже обвязки'),
        (5, Z_BASE[0] + 22, 'Саморез 4.8×29 в обвязку'),
        (22, Z_BASE[0] + 30, 'Обвязка 45×45'),
        (150, Z_FLOOR - 6, 'Пол ОСП-3 12 мм'),
        (22, 330, 'Стойка 45×45 (за разрезом)'),
        (120, Z_BLK - 2, 'Рубероид'),
        (-30, -50, 'Щебень 50–100 мм'),
    ]


def node4(v, box):
    A0, A1, B0, B1 = box
    c = v.c
    clip_begin(c, v, A0, B0, A1, B1)
    ground_part(v, A0 - 10, A1 + 10, B0)
    v.rect(A0 - 10, Z_BLK - BLK_H, BLK_Y[1], Z_BLK, fill=HexColor('#E3E3E3'), stroke=GREY, lw=0.3)
    v.rect(A0 - 10, Z_BASE[0], D - T, Z_BASE[1], fill=WOOD, stroke=GREY, lw=0.3)
    v.cut(D - T, Z_BASE[0], D, Z_BASE[1], lw=0.7)
    v.rect(A0 - 10, Z_BASE[1], D, Z_FLOOR, fill=OSB, stroke=INK, lw=0.5)
    v.cut(D - T, Z_THR[0], D, Z_THR[1], lw=0.7)
    v.cut(DOOR_Y[0], RAIL_BOT[0], DOOR_Y[1], RAIL_BOT[1], lw=0.6)
    pn_sheet_v(v, SHEET_DOOR_Y[1], DOOR_Z[0], B1 + 10, outward=1)
    v.circle(D + 2.5, Z_THR[0] + 25, 5, fill=SEAL, stroke=None)
    v.line(SHEET_DOOR_Y[1] + 3, RAIL_BOT[0] + 22, DOOR_Y[0] + 8, RAIL_BOT[0] + 22, color=STEEL, lw=1.1)
    c.restoreState()
    v.dim_v(DOOR_Z[0], Z_FLOOR, 640, SHEET_DOOR_Y[1], None, txt='47', tside='right')
    v.dim_v(0, DOOR_Z[0], 700, None, SHEET_DOOR_Y[1], txt='160', tside='right')
    return [
        (D + 2.5, Z_THR[0] + 25, 'Уплотнитель D-профиль на пороге'),
        (SHEET_DOOR_Y[1] + 3, RAIL_BOT[0] + 22, 'Саморез 4.8×29 с EPDM'),
        (DOOR_Y[0] + 22, RAIL_BOT[0] + 30, 'Нижний ригель створки'),
        (SHEET_DOOR_Y[1], 330, 'Лист створки'),
        (SHEET_DOOR_Y[1], DOOR_Z[0] + 8, 'Фартук листа закрывает пол\nи обвязку — вода стекает наружу'),
        (D - 22, Z_THR[0] + 22, 'Порог 45×45'),
        (450, Z_FLOOR - 6, 'Пол ОСП-3 12 мм'),
        (D - 22, Z_BASE[0] + 22, 'Обвязка 45×45'),
        (420, 40, 'Пескоблок'),
        (650, -50, 'Щебень'),
    ]


def sheet_nodes34(c, num, total):
    tblock(c, num, total, 'Узлы 3, 4: низ стены, порог', '1:5')
    heading(c, num, 'Узлы 3 и 4', 'Масштаб 1:5 · низ задней стены у дома и порог с низом двери')
    b3 = (-150, 200, -120, 420)
    v = View(c, 72 + 150 / 5, 45 + 120 / 5, 5)
    L = node3(v, b3)
    frame_box(c, v, b3[0], b3[2], b3[1], b3[3], 3, 'Низ задней стены у дома')
    column_notes(v, L, 68, right=False, y_min=30, y_max=150, size=5.8)
    b4 = (380, 720, -120, 420)
    v2 = View(c, 160 - 380 / 5, 45 + 120 / 5, 5)
    L2 = node4(v2, b4)
    frame_box(c, v2, b4[0], b4[2], b4[1], b4[3], 4, 'Порог и низ двери')
    column_notes(v2, L2, 233, right=True, y_min=30, y_max=150, size=5.8)


# ============================================================ двери
def node5a(v):
    B = lambda y: -y
    c = v.c
    A0, A1, Y0, Y1 = -90, 130, 430, 600
    clip_begin(c, v, A0, B(Y1), A1, B(Y0))
    pts = []
    y = 400
    while y < D:
        pts += [(0, B(y)), (-PN, B(y + 12)), (-PN, B(y + 36)), (0, B(y + 48))]
        y += WAVE
    v.polyline([(p[0], max(p[1], B(D))) for p in pts], color=PN_CUT, lw=1.0)
    v.cut(0, B(D - T), T, B(D), lw=0.7)
    v.rect(T, B(400), A1 + 20, B(D - T), fill=HexColor('#F3E3C4'), stroke=None)
    v.cut(DOOR_L[0], B(DOOR_Y[0]), DOOR_L[0] + T, B(DOOR_Y[1]), lw=0.6)
    pts = []
    x = SHEET_L[0]
    while x < A1 + 20:
        pts += [(x, B(SHEET_DOOR_Y[0])), (x + 12, B(SHEET_DOOR_Y[1])), (x + 36, B(SHEET_DOOR_Y[1])),
                (x + 48, B(SHEET_DOOR_Y[0]))]
        x += WAVE
    v.polyline(pts, color=PN_CUT, lw=1.0)
    v.circle(30, B(D + 2.5), 5, fill=SEAL, stroke=None)
    # петля накладная
    v.rect(-3, B(D - 1), 3, B(D + 6), fill=STEEL, stroke=None)
    v.rect(2, B(D), 22, B(D + 1.2), fill=STEEL, stroke=None)
    v.rect(2, B(DOOR_Y[0] - 1.2), 22, B(DOOR_Y[0]), fill=STEEL, stroke=None)
    v.circle(0, B(D + 2.5), 5, fill=STEEL, stroke=INK, lw=0.3)
    c.restoreState()
    v.dim_h(DOOR_L[0], T, B(Y0) - 6, B(DOOR_Y[0]), B(D), txt='43')
    return [(-PN, B(450), 'Боковая обшивка'), (0, B(D + 2.5), 'Петля накладная 100 мм\n(ось у кромки)')], \
           [(22, B(D - 22), 'Стойка 45×45'), (30, B(D + 2.5), 'Уплотнитель D'),
            (25, B(DOOR_Y[0] + 22), 'Стойка рамки створки'), (90, B(SHEET_DOOR_Y[1]), 'Лист створки')]


def node5b(v):
    B = lambda y: -y
    c = v.c
    A0, A1, Y0, Y1 = 380, 620, 490, 590
    clip_begin(c, v, A0, B(Y1), A1, B(Y0))
    v.cut(DOOR_L[1] - T, B(DOOR_Y[0]), DOOR_L[1], B(DOOR_Y[1]), lw=0.6)
    v.cut(DOOR_R[0], B(DOOR_Y[0]), DOOR_R[0] + T, B(DOOR_Y[1]), lw=0.6)
    for (x0, x1), dy in ((SHEET_L, 0), (SHEET_R, 2)):
        pts = []
        x = x0 if x0 > A0 else A0 - 20
        x = x0 + ((A0 - 20 - x0) // WAVE) * WAVE if x0 < A0 else x0
        while x < min(x1, A1 + 20):
            pts += [(x, B(SHEET_DOOR_Y[0] + dy)), (x + 12, B(SHEET_DOOR_Y[1] + dy)),
                    (x + 36, B(SHEET_DOOR_Y[1] + dy)), (x + 48, B(SHEET_DOOR_Y[0] + dy))]
            x += WAVE
        v.polyline([(min(p[0], x1), p[1]) for p in pts], color=PN_CUT, lw=1.0)
    v.circle(SHEET_R[0] + 30, B(SHEET_DOOR_Y[1] + 1), 5, fill=SEAL, stroke=None)
    v.rect(DOOR_L[1] - 80, B(DOOR_Y[0] - 10), DOOR_L[1] - 20, B(DOOR_Y[0]), fill=STEEL, stroke=None)
    c.restoreState()
    v.dim_h(SHEET_R[0], SHEET_L[1], B(Y1) + 6, B(SHEET_DOOR_Y[1] + 2), B(SHEET_DOOR_Y[1]), txt='68')
    v.dim_h(DOOR_L[1], DOOR_R[0], B(Y0) - 6, B(DOOR_Y[0]), B(DOOR_Y[0]), txt='4')
    return [(DOOR_L[1] - 50, B(DOOR_Y[0] - 5), 'Шпингалеты на левой\nстворке (верх, низ)'),
            (SHEET_R[0] + 30, B(SHEET_DOOR_Y[1] + 1), 'Уплотнитель под нахлёстом')], \
           [(SHEET_R[0] + 120, B(SHEET_DOOR_Y[1] + 2), 'Лист правой створки\nзаходит на левую — нащельник'),
            (DOOR_R[0] + 22, B(DOOR_Y[0] + 22), 'Стойка рамки')]


def door_leaf(v, inside=False):
    Wd, Hd = DOOR_W, FRAME_H
    m = (lambda a: Wd - a) if inside else (lambda a: a)
    R = lambda a0, b0, a1, b1, **kw: v.rect(min(m(a0), m(a1)), b0, max(m(a0), m(a1)), b1, **kw)
    off = FRAME_Z[0] - DOOR_Z[0]
    if not inside:
        R(0, 0, Wd, DOOR_H, fill=HexColor('#9DBBA4'), stroke=INK, lw=0.6)
        a = 20
        while a < Wd - 5:
            v.line(m(a), 0, m(a), DOOR_H, color=HexColor('#5E8A6A'), lw=0.3)
            a += WAVE
        for zc in HINGE_Z:
            z = zc - DOOR_Z[0]
            R(-8, z - 50, 2, z + 50, fill=STEEL, stroke=INK, lw=0.2)
        R(Wd - 110, 1050 - DOOR_Z[0], Wd - 94, 1210 - DOOR_Z[0], fill=STEEL, stroke=INK, lw=0.2)
    else:
        R(0, 0, Wd, DOOR_H, fill=HexColor('#DDE8DF'), stroke=INK, lw=0.4)
        R(0, off, T, off + Hd, fill=WOOD_CUT, stroke=INK, lw=0.5)
        R(Wd - T, off, Wd, off + Hd, fill=WOOD_CUT, stroke=INK, lw=0.5)
        rb = (off, off + T)
        rm = (RAIL_MID[0] - DOOR_Z[0], RAIL_MID[1] - DOOR_Z[0])
        rt = (off + Hd - T, off + Hd)
        for (b0, b1) in (rb, rm, rt):
            R(T, b0, Wd - T, b1, fill=WOOD_CUT, stroke=INK, lw=0.5)
        for (lo, hi) in ((rb[1], rm[0]), (rm[1], rt[0])):
            a0, a1 = T, Wd - T
            w = 45
            k = (hi - lo) / (a1 - a0)
            dz = w * math.sqrt(1 + k * k)
            pts = [(m(a0), lo), (m(a0), lo + dz), (m(a1 - dz / k), hi), (m(a1), hi), (m(a1), hi - dz),
                   (m(a0 + dz / k), lo)]
            v.poly(pts, fill=HexColor('#E9C98F'), stroke=INK, lw=0.5)
        for b in (rt[0] - 160, rb[1] + 40):
            R(Wd - 30, b, Wd - 14, b + 120, fill=STEEL, stroke=INK, lw=0.2)


def sheet_doors(c, num, total):
    tblock(c, num, total, 'Двери, раскрой профнастила', '1:4, 1:20, 1:40')
    heading(c, num, 'Двери и раскрой профнастила',
            'Накладные створки на рамке 45×45; уплотнитель D-профиль по контуру проёма')
    va = View(c, 68 + 90 / 4, 178 + 430 / 4, 4)
    La, Ra = node5a(va)
    frame_box(c, va, -90, -600, 130, -430, '5а', 'Петлевая сторона (план)')
    column_notes(va, La, 64, right=False, y_min=133, y_max=178, size=5.6)
    column_notes(va, Ra, 128, right=True, y_min=133, y_max=178, size=5.6)
    vb = View(c, 68 - 380 / 4, 112 + 490 / 4, 4)
    Lb, Rb = node5b(vb)
    frame_box(c, vb, 380, -590, 620, -490, '5б', 'Притвор створок (план)')
    column_notes(vb, Lb, 64, right=False, y_min=78, y_max=112, size=5.6)
    column_notes(vb, Rb, 134, right=True, y_min=78, y_max=112, size=5.6)
    text(c, 150, 76, 'Правая створка открывается первой; левая держится\n'
                     'шпингалетами в перемычку и порог. Раскос — нижним\n'
                     'концом к петлям. Лист крепить к рамке саморезами\n'
                     '4.8×29 с EPDM через волну, по краям — в каждую.', 5.8, F, GREY)
    # створки 1:20
    vo = View(c, 196, 92, 20)
    door_leaf(vo)
    text(c, 196 + 12.4, 188, 'Левая, снаружи', 6.5, FB, anchor='c')
    vi = View(c, 236, 92, 20)
    door_leaf(vi, inside=True)
    text(c, 236 + 12.4, 188, 'Левая, изнутри', 6.5, FB, anchor='c')
    vo.dim_h(0, DOOR_W, -80, 0, 0)
    vo.dim_v(0, DOOR_H, -100, 0, 0)
    vi.text(DOOR_W + 60, 900, 'петли', 5, color=ACCENT, rot=90)
    text(c, 262, 180, 'Правая —\nзеркально,\nлист шире\n(568 мм)', 5.2, F, GREY)
    # раскрой профнастила
    text(c, 20, 70, 'Раскрой профнастила С10 (лист 1150 мм, нарезка по длине на заводе)', 7.5, FB)
    vk = View(c, 22, 16, 45)
    xs = 0
    pieces = [('1. Задняя стена', BACK_SHEET['z'][1] - BACK_SHEET['z'][0], [(0, W + 2 * PN, 'задняя\n1020')]),
              ('2. Боковые стены', Z_B - T - CLAD_Z0, [(0, 575, 'левая\n510'), (575, 1150, 'правая\n510')]),
              ('3. Двери', DOOR_H, [(0, 575, 'левая\n496'), (575, 1150, 'правая\n568')]),
              ('4. Кровля', ROOF_LEN, [(0, 1150, 'кровля\n1150×%d' % round(ROOF_LEN))])]
    for title, L, parts in pieces:
        vk.rect(xs, 0, xs + SHEET_W, L, fill=HexColor('#F1F4F2'), stroke=INK, lw=0.4)
        for (a0, a1, t) in parts:
            vk.rect(xs + a0 + 8, 8, xs + a1 - 8, L - 8, fill=HexColor('#9DBBA4'), stroke=INK, lw=0.3)
            vk.text(xs + (a0 + a1) / 2, L / 2 + 60, t, 4.8, anchor='c')
        vk.text(xs, L + 80, '%s — %d мм' % (title, round(L / 10.0) * 10), 5.2, FB)
        xs += SHEET_W + 380
    text(c, 150, 50, 'Итого 4 листа, %.1f пог. м (≈ %.1f м²). Заказывайте с нарезкой в\n'
                     'размер — резать дома не придётся. Продольные резы (листы 2 и 3)\n'
                     'делать ножницами по металлу по нижней волне. Болгаркой не резать:\n'
                     'горит покрытие, кромка ржавеет. Срезы — подкрасить в цвет.' % (
                         sum(p[1] for p in pieces) / 1000.0, sum(p[1] for p in pieces) / 1000.0 * SHEET_W / 1000),
         5.8)

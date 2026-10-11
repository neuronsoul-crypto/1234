# -*- coding: utf-8 -*-
"""Лист: внутреннее оснащение."""
import math
from reportlab.lib.colors import HexColor
from geom import *
from draw import *

HANDLE = HexColor('#B07A44')
HEAD = HexColor('#8E99A4')


def tool(v, kind, x, b0=Z_FLOOR):
    """Условный силуэт инструмента у задней стены."""
    if kind == 'shovel':
        top = b0 + 1450
        v.line(x, b0 + 280, x, top, color=HANDLE, lw=1.6)
        v.poly([(x - 90, b0 + 60), (x, b0 + 2), (x + 90, b0 + 60), (x + 95, b0 + 300), (x - 95, b0 + 300)],
               fill=HEAD, stroke=INK, lw=0.3)
        v.rect(x - 45, top - 20, x + 45, top, fill=HANDLE, stroke=INK, lw=0.2)
    elif kind == 'scoop':
        top = b0 + 1400
        v.line(x, b0 + 330, x, top, color=HANDLE, lw=1.6)
        v.poly([(x - 120, b0 + 5), (x + 120, b0 + 5), (x + 110, b0 + 330), (x - 110, b0 + 330)], fill=HEAD, stroke=INK,
               lw=0.3)
    elif kind == 'fork':
        top = b0 + 1450
        v.line(x, b0 + 300, x, top, color=HANDLE, lw=1.6)
        v.rect(x - 90, b0 + 260, x + 90, b0 + 300, fill=HEAD, stroke=INK, lw=0.3)
        for dx in (-80, -27, 27, 80):
            v.line(x + dx, b0 + 5, x + dx, b0 + 270, color=HEAD, lw=1.0)
    elif kind == 'rake':
        top = b0 + 1650
        v.line(x, b0 + 20, x, top, color=HANDLE, lw=1.6)
        v.rect(x - 190, top - 10, x + 190, top + 20, fill=HEAD, stroke=INK, lw=0.3)
        for i in range(12):
            xx = x - 180 + i * 32.7
            v.line(xx, top - 10, xx, top - 70, color=HEAD, lw=0.7)
    elif kind == 'hoe':
        top = b0 + 1550
        v.line(x, b0 + 20, x, top, color=HANDLE, lw=1.6)
        v.poly([(x - 75, top + 10), (x + 75, top + 10), (x + 75, top + 110), (x - 75, top + 110)], fill=HEAD,
               stroke=INK, lw=0.3)
    elif kind == 'fan':
        top = b0 + 1250
        v.line(x, b0 + 20, x, top, color=HANDLE, lw=1.6)
        for ang in range(-35, 36, 7):
            a = math.radians(ang)
            v.line(x, top, x + 360 * math.sin(a), top + 360 * math.cos(a), color=HEAD, lw=0.6)


def sheet_interior(c, num, total):
    tblock(c, num, total, 'Внутреннее оснащение', '1:20')
    heading(c, num, 'Внутреннее оснащение', 'Вид спереди без дверей и развёртки боковых стен · 1:20')
    v = View(c, 22 + 20 / 20, 40 - Z_FLOOR / 20 + 13, 20)
    # задняя стена (ОСП)
    v.rect(T, Z_FLOOR, W - T, Z_HEADER[0], fill=HexColor('#F2E2BF'), stroke=GREY, lw=0.3)
    v.line(750, Z_FLOOR, 750, Z_HEADER[0], color=LIGHT, lw=0.3)
    # пол
    v.rect(0, Z_BASE_TOP, W, Z_FLOOR, fill=WOOD_CUT, stroke=INK, lw=0.4)
    # рейки
    v.rect(T + 12, RAIL_Z[0], W - T - 12, RAIL_Z[1], fill=WOOD_CUT, stroke=INK, lw=0.4)
    v.rect(T + 12, LOW_RAIL_Z[0], W - T - 12, LOW_RAIL_Z[1], fill=WOOD_CUT, stroke=INK, lw=0.4)
    tools = [('shovel', 190), ('fork', 380), ('rake', 610), ('scoop', 830), ('hoe', 1010), ('shovel', 1150),
             ('fan', 1320)]
    for k, x in tools:
        tool(v, k, x)
        v.rect(x - 25, RAIL_Z[0] + 25, x + 25, RAIL_Z[0] + 70, fill=STEEL, stroke=None)
    # полка
    v.rect(T + 12, SHELF_Z, W - T - 12, SHELF_Z + SHELF_T, fill=WOOD_CUT, stroke=INK, lw=0.5)
    for x in (STUDS_X[1] + T / 2, 750, STUDS_X[3] + T / 2):
        v.poly([(x - 10, SHELF_Z), (x + 10, SHELF_Z), (x + 10, SHELF_Z - 200), (x - 10, SHELF_Z - 200)], fill=STEEL,
               stroke=None)
    # крючки на боковых стенах (видны в проёме)
    v.rect(T + 12, 1150, T + 12 + 170, 1550, fill=HexColor('#3E8E5E'), stroke=INK, lw=0.3)
    v.text(T + 100, 1350, 'шланг', 4.5, color=HexColor('#FFFFFF'), anchor='c', rot=90)
    for zz in (900, 1000, 1100):
        v.line(W - T - 12, zz, W - T - 130, zz + 30, color=STEEL, lw=1.0)
    # передняя рамка (контур проёма)
    v.rect(0, Z_FLOOR, FRONT_STUD, Z_HEADER[0], fill=HexColor('#FFFFFF'), stroke=INK, lw=0.5, alpha=0.6)
    v.rect(W - FRONT_STUD, Z_FLOOR, W, Z_HEADER[0], fill=HexColor('#FFFFFF'), stroke=INK, lw=0.5, alpha=0.6)
    v.rect(0, Z_FLOOR, W, Z_FLOOR + T, fill=WOOD_CUT, stroke=INK, lw=0.5)
    v.rect(0, Z_HEADER[0], W, Z_FRONT_TOP, fill=HexColor('#FFFFFF'), stroke=INK, lw=0.5, alpha=0.6)
    v.rect(0, Z_HEADER[0], W, Z_FRONT_TOP, fill=None, stroke=INK, lw=0.5)
    v.text(750, Z_HEADER[0] + 50, 'перемычка (полка — выше, за ней)', 4.8, color=GREY, anchor='c')
    v.line(T + 12, SHELF_Z, W - T - 12, SHELF_Z, color=INK, lw=0.4, dash=(2, 1))
    # размеры
    v.dim_v(Z_FLOOR, SHELF_Z, -110, 0, None, txt='1750')
    v.dim_v(Z_FLOOR, RAIL_Z[0], -230, 0, None, txt='1250')
    v.dim_v(Z_FLOOR, LOW_RAIL_Z[0], -350, 0, None, txt='230')
    v.dim_h(T + 12, W - T - 12, Z_BASE_TOP - 120, Z_BASE_TOP, Z_BASE_TOP, txt='1386 — внутри')
    notes = [(750, SHELF_Z + 10, 'Полка 290 мм на 3 кронштейнах'),
             (420, RAIL_Z[1] - 20, 'Рейка 20×95, пружинные держатели\nдля черенков Ø 25–40, шаг ~180'),
             (300, LOW_RAIL_Z[1] - 15, 'Упорная рейка — черенки не\nсъезжают к двери'),
             (T + 90, 1200, 'Держатель шланга (левая стена)'),
             (W - T - 80, 1000, 'Крючки (правая стена)')]
    column_notes(v, notes, 107, right=True, y_min=40, y_max=170, size=5.6)

    # боковые стены (развёртки)
    for i, (title, x0, items) in enumerate((
            ('Левая стена изнутри', 150, 'left'), ('Правая стена изнутри', 185, 'right'))):
        vs = View(c, x0 - (T + 12) / 20, 40 - Z_FLOOR / 20 + 13, 20)
        if items == 'left':
            a = lambda y: y
        else:
            a = lambda y: (D - y) + T + 12 - (T + 12) + 0
        pts = [(a(T + 12), Z_FLOOR), (a(D - T), Z_FLOOR), (a(D - T), zu(D - T)), (a(T + 12), zu(T + 12))]
        vs.poly(pts, fill=HexColor('#F2E2BF'), stroke=INK, lw=0.4)
        vs.line(a(T + 12), Z_FLOOR + 1000 + T / 2, a(D - T), Z_FLOOR + 1000 + T / 2, color=LIGHT, lw=0.3,
                dash=(1.5, 1))
        text(c, x0 + 12.5, 158, title, 6.5, FB, anchor='c')
        text(c, x0 + 12.5, 154.5, '← дом' if items == 'left' else 'дом →', 5, F, GREY, anchor='c')
        if items == 'left':
            vs.circle(a(300), 1400, 170, fill=None, stroke=HexColor('#3E8E5E'), lw=1.6)
            vs.circle(a(300), 1400, 120, fill=None, stroke=HexColor('#3E8E5E'), lw=1.2)
            vs.rect(a(270), 1350, a(330), 1600, fill=STEEL, stroke=None)
            vs.text(a(300), 1100, 'шланг\n25 м', 5, color=GREY, anchor='c')
            for zz in (700, 850):
                for y in (150, 300, 450):
                    vs.line(a(y), zz, a(y), zz - 60, color=STEEL, lw=1.0)
            vs.text(a(300), 560, 'крючки', 5, color=GREY, anchor='c')
        else:
            vs.rect(a(D - T - 20), 800, a(T + 32), 1500, fill=HexColor('#E6E8EA'), stroke=GREY, lw=0.3)
            for zz in range(860, 1480, 90):
                for y in range(120, 520, 60):
                    vs.circle(a(y), zz, 6, fill=GREY, stroke=None)
            vs.text(a(300), 1560, 'перфопанель', 5, color=GREY, anchor='c')
            vs.rect(a(D - T - 20), 1900, a(T + 32), 1920, fill=WOOD_CUT, stroke=INK, lw=0.3)
            vs.text(a(300), 1700, 'полочка\n120 мм', 5, color=GREY, anchor='c')
            for y in (150, 300, 450):
                vs.line(a(y), 650, a(y), 590, color=STEEL, lw=1.0)
    text(c, 150, 36, 'Ригель боковой стены (пунктир) на высоте 1.0 м — опора для крючков.', 5.4, F, GREY)

    # что помещается
    x0 = 222
    text(c, x0, 182, 'Что помещается', 8, FB)
    rows = ['• 8–12 длинномерных инструментов до 1.7 м:',
            '  лопаты, вилы, грабли, тяпки, веерные грабли;',
            '• шланг до 25–30 м на держателе;',
            '• секатор, совок, рыхлители, перчатки — на',
            '  перфопанели и крючках правой стены;',
            '• лейка, ведро, канистра — на полу у двери;',
            '• мелочь, шпагат, средства — на полке.']
    for i, r in enumerate(rows):
        text(c, x0, 176 - i * 4.0, r, 5.8)
    text(c, x0, 140, 'Советы по хранению', 8, FB)
    rows = ['• Инструмент очищать от земли перед',
            '  хранением: щели в полу пропускают воду,',
            '  но комья грязи лучше не заносить.',
            '• Мокрый инструмент — в держатели, не',
            '  прислонять полотном к стенам.',
            '• Удобрения и химию — в закрытых',
            '  контейнерах на полке, не на полу.',
            '• Аккумуляторы и бензоинструмент на',
            '  зиму забирать в тёплое помещение.',
            '• Внутреннюю ОСП можно покрасить —',
            '  проще мыть, дольше служит.']
    for i, r in enumerate(rows):
        text(c, x0, 134 - i * 4.0, r, 5.8)

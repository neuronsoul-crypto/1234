# -*- coding: utf-8 -*-
"""Листы 3–4: виды и разрезы."""
import math
from reportlab.lib.colors import HexColor
from geom import *
from draw import *
from elev import *


def levels_left(v, a, items, right=False):
    for z, t in items:
        v.level(a, z, t, right=right, L=9)


def fmt_lvl(z):
    return ('±0.000' if abs(z) < 0.5 else '+%.3f' % (z / 1000.0))


# ============================================================ ЛИСТ 3
def sheet_views(c, num, total):
    tblock(c, num, total, 'Фасад, вид сбоку, план', '1:25')
    heading(c, num, 'Виды и габариты', 'Масштаб 1:25 · размеры в мм · отметки в метрах от уровня земли')

    # --- фасад ---
    v = View(c, 50, 52, 25)
    front_elev(v)
    text(c, 50 + 750 / 25, 172, 'Фасад (вид на двери)', 8, FB, anchor='c')
    v.dim_h(X_ROOF[0], X_ROOF[1], 2900, zr(-50) + 270, zr(-50) + 270)
    v.dim_h(-CL, W + CL, -280, 0, 0)
    v.dim_h(DOOR_L[0], DOOR_L[1], -150, DOOR_Z[0], DOOR_Z[0])
    v.dim_h(DOOR_R[0], DOOR_R[1], -150, DOOR_Z[0], DOOR_Z[0])
    levels = [(0, '±0.000 земля'), (Z_FLOOR, '+%.3f пол' % (Z_FLOOR / 1000)),
              (DOOR_Z[1], '+%.3f верх двери' % (DOOR_Z[1] / 1000)),
              (FASCIA_Z[1], '+%.3f карниз' % (FASCIA_Z[1] / 1000)),
              (H_TOTAL, '+%.3f верх' % (H_TOTAL / 1000))]
    for z, t in levels:
        v.level(-480, z, t, right=False, L=17)
        v.line(-470, z, -260, z, color=LIGHT, lw=0.2, dash=(1, 1))

    # --- вид сбоку ---
    v2 = View(c, 160, 52, 25)
    side_elev(v2)
    text(c, 160 + 400 / 25, 172, 'Вид сбоку (справа)', 8, FB, anchor='c')
    v2.dim_h(HOUSE_Y, -CL, -150, 0, 0, txt='40')
    v2.dim_h(-CL, ASTR_Y[1], -150, 0, DOOR_Z[0])
    v2.dim_h(HOUSE_Y, GUT_YC + GUT_R, -290, 0, 0)
    v2.dim_h(D, Y_RAF[1], 2620, zo(D), FASCIA_Z[1], txt='250')
    v2.text(300, zr(300) + 170, 'свес', 5.5, color=GREY)
    # угол ската
    ya = 120
    v2.text(ya + 60, zr(ya) + 70, '%.0f°' % ALPHA_DEG, 6.5, FB, color=ACCENT)

    # --- план ---
    v3 = View(c, 218, 146, 25)
    plan_view(v3)
    text(c, 218 + 750 / 25, 172, 'План (вид сверху)', 8, FB, anchor='c')
    v3.dim_h(X_ROOF[0], X_ROOF[1], -1520, -Y_ROOF[1], -Y_ROOF[1])
    v3.dim_h(X_ROOF[0], -CL, -1400, None, None, txt='80')
    v3.dim_v(-HOUSE_Y, -(GUT_YC + GUT_R), -330, -250, X_ROOF[0])
    v3.dim_v(-HOUSE_Y, -(POST_Y[1] + DOOR_W), 1290, None, None, txt='%d' % round(POST_Y[1] + DOOR_W - HOUSE_Y),
             tside='right', color=ACCENT)
    v3.text(1330, -1180, 'зона\nоткрывания\nдверей', 5.2, color=ACCENT)
    # линия разреза 1-1
    for (b0, b1) in ((-1050, -950), (60, 160)):
        v3.line(740, b0, 740, b1, color=ACCENT2, lw=0.9)
    v3.line(740, -950, 640, -950, color=ACCENT2, lw=0.6)
    v3.line(740, 60, 640, 60, color=ACCENT2, lw=0.6)
    v3.text(600, -1010, '1', 6.5, FB, color=ACCENT2, anchor='r')
    v3.text(600, 30, '1', 6.5, FB, color=ACCENT2, anchor='r')

    # --- сводка габаритов ---
    x0, y0 = 207, 66
    rows = [('Габарит по кровле (Ш × Г)', '1700 × 1055 мм (от стены дома)'),
            ('Корпус (Ш × Г × В)', '1540 × 685 × 2444 мм'),
            ('Внутри (Ш × Г × В)', '1386 × 498 × 1760…2040 мм'),
            ('Проём (Ш × В)', '1310 × 1715 мм, 2 створки по 720'),
            ('Уклон кровли', '%.1f° (≥12° для гибкой черепицы)' % ALPHA_DEG),
            ('Пол над землёй', '273 мм; зазор до стены 40 мм')]
    text(c, x0, y0 + 4, 'Основные параметры', 7, FB)
    for i, (k, val) in enumerate(rows):
        yy = y0 - 1 - i * 6.3
        text(c, x0, yy, k, 5.6, F, GREY)
        text(c, x0, yy - 2.6, val, 6.0, F, INK)


# ============================================================ разрез 1-1 (по x = 740)
def section_11(v, labels=True):
    """Поперечный разрез по оси x = 740 (через левую створку, нащельник, среднее стропило)."""
    # грунт, подсыпка
    v.hatch([(-300, -260), (1150, -260), (1150, -100), (-300, -100)], step=1.4, angle=45, color=SOIL, lw=0.25)
    v.dots([(HOUSE_Y, -100), (1100, -100), (1100, 0), (HOUSE_Y, 0)], step=1.0, color=HexColor('#9A8F78'),
           fill=GRAVEL, stroke=None, circles=True, seed=3)
    v.line(HOUSE_Y, 0, 1150, 0, color=INK, lw=0.6)
    # подушка под опорами и опоры
    for (y0, y1) in BLK_Y:
        v.dots([(y0 - 50, -150), (y1 + 50, -150), (y1 + 50, -50), (y0 - 50, -50)], step=0.9,
               color=HexColor('#8C826C'), fill=HexColor('#D8CFB8'), stroke=INK, slw=0.25, circles=True, seed=5)
        v.dots([(y0, -50), (y1, -50), (y1, Z_BLK), (y0, Z_BLK)], step=0.9, color=HexColor('#888888'),
               fill=CONCRETE, stroke=INK, slw=0.5, seed=9)
        v.rect(y0, Z_BLK - 4, y1, Z_BLK, fill=SEAL, stroke=None)
    # стена дома
    v.hatch([(-300, -100), (HOUSE_Y, -100), (HOUSE_Y, 2750), (-300, 2750)], step=1.5, angle=45,
            color=HOUSE_H, lw=0.25, fill=HOUSE, stroke=INK, slw=0.6)
    # основание
    v.cut(0, Z_BLK, T, Z_BASE_TOP)
    v.cut(D - T, Z_BLK, D, Z_BASE_TOP)
    v.rect(T, Z_BLK, D - T, Z_BASE_TOP, fill=WOOD_CUT, stroke=INK, lw=0.5)
    for zz in (180, 210):
        v.line(T + 10, zz, D - T - 10, zz, color=WOOD_CUT_X, lw=0.2)
    v.rect(0, Z_BASE_TOP, D, Z_FLOOR, fill=WOOD_CUT, stroke=INK, lw=0.5)
    # задняя стена
    v.cut(0, Z_FLOOR, T, Z_FLOOR + T)
    v.rect(0, Z_FLOOR + T, T, Z_BACK_TOP - T, fill=WOOD_CUT, stroke=INK, lw=0.5)
    v.cut(0, Z_BACK_TOP - T, T, Z_BACK_TOP)
    v.rect(T, Z_FLOOR, T + 12, Z_BACK_TOP, fill=OSB, stroke=INK, lw=0.4)
    v.rect(-CL, CLAD_Z0, -1, Z_BACK_TOP, fill=CLAD, stroke=INK, lw=0.4)
    z = CLAD_Z0
    while z < Z_BACK_TOP - 10:
        v.line(-CL, z, -1, z, color=INK, lw=0.2)
        z += CLAD_STEP
    v.line(-0.5, Z_BLK, -0.5, Z_BACK_TOP, color=MEMB, lw=1.0)
    # анкер к стене дома через проставку
    za = Z_BACK_TOP - 25
    v.rect(HOUSE_Y, za - 30, -CL, za + 30, fill=HexColor('#D7C9A8'), stroke=INK, lw=0.4)
    v.line(T + 12, za, -200, za, color=STEEL, lw=1.1)
    v.rect(T + 12, za - 9, T + 17, za + 9, fill=STEEL, stroke=None)
    # передняя стена
    v.cut(D - T, Z_FLOOR, D, Z_FLOOR + T)
    v.cut(D - T, Z_HEADER[0], D, Z_HEADER[1])
    v.cut(D - T, Z_TOPF[0], D, Z_TOPF[1])
    # крайняя стойка проёма (за плоскостью разреза)
    v.rect(D - T, OPEN_Z[0], D, OPEN_Z[1], fill=WOOD, stroke=GREY, lw=0.3)
    # боковая стена вдали: ОСП и ригель
    v.rect(T + 12, Z_FLOOR, D - T, zu(T + 12), fill=None, stroke=LIGHT, lw=0.25)
    # цоколь, отлив, фриз, отлив над дверью
    v.line(D + 0.5, Z_BLK, D + 0.5, SKIRT_Z[1] + 20, color=MEMB, lw=1.0)
    v.rect(D + 1, SKIRT_Z[0], D + CL, SKIRT_Z[1], fill=CLAD, stroke=INK, lw=0.4)
    v.polyline([(D + 1, SKIRT_Z[1] + 20), (D + 1, SKIRT_Z[1] + 2), (D + 34, SKIRT_Z[1] - 6),
                (D + 34, SKIRT_Z[1] - 18)], color=METAL, lw=1.1)
    v.line(D + 0.5, Z_HEADER[0], D + 0.5, Z_TOPF[1], color=MEMB, lw=1.0)
    v.rect(D + 1, FRIEZE_Z[0], D + CL, FRIEZE_Z[1], fill=CLAD, stroke=INK, lw=0.4)
    v.polyline([(D + 1, FRIEZE_Z[0] + 20), (D + 1, DOOR_Z[1] + 6), (D + 56, DOOR_Z[1] + 1),
                (D + 56, DOOR_Z[1] - 12)], color=METAL, lw=1.1)
    # дверь (стойка рамки + обшивка) и нащельник
    v.rect(DOOR_Y[0], DOOR_Z[0], DOOR_Y[0] + 20, DOOR_Z[1], fill=WOOD_CUT, stroke=INK, lw=0.5)
    v.rect(DOOR_Y[0] + 20, DOOR_Z[0], DOOR_Y[1], DOOR_Z[1], fill=CLAD, stroke=INK, lw=0.5)
    v.poly([(DOOR_Y[0], DOOR_Z[0]), (DOOR_Y[1], DOOR_Z[0] - 8), (DOOR_Y[1], DOOR_Z[0])], fill=CLAD, stroke=INK, lw=0.4)
    v.rect(ASTR_Y[0], DOOR_Z[0] - 8, ASTR_Y[1], DOOR_Z[1], fill=WOOD_CUT, stroke=INK, lw=0.5)
    for zz in (OPEN_Z[0] - 12, OPEN_Z[1] + 12):
        v.circle(D + 3, zz, 5, fill=SEAL, stroke=None)
    # стропило (по оси разреза — разрезано вдоль)
    ya, yb = Y_RAF
    bot = [(ya, zu(ya)), (0, Z_BACK_TOP), (T, Z_BACK_TOP), (T, zu(T)), (D - T, zu(D - T)),
           (D, Z_FRONT_TOP), (D, zu(D)), (yb, zu(yb))]
    pts = bot + [(yb, zo(yb)), (ya, zo(ya))]
    v.poly(pts, fill=WOOD_CUT, stroke=INK, lw=0.5)
    # ОСП, ковёр, черепица
    v.poly([(Y_ROOF[0], zo(Y_ROOF[0])), (Y_ROOF[1], zo(Y_ROOF[1])), (Y_ROOF[1], zo(Y_ROOF[1]) + OSB_V),
            (Y_ROOF[0], zo(Y_ROOF[0]) + OSB_V)], fill=OSB, stroke=INK, lw=0.4)
    zt = lambda y: zo(y) + OSB_V
    v.polyline([(Y_ROOF[0] + 12, zt(Y_ROOF[0]) + 1.5), (Y_ROOF[1] + 10, zt(Y_ROOF[1]) + 1.5)], color=UNDERLAY, lw=1.0)
    v.poly([(Y_ROOF[0] + 50, zt(Y_ROOF[0] + 50) + 2.5), (Y_ROOF[1] + 12, zt(Y_ROOF[1]) + 2.5),
            (Y_ROOF[1] + 12, zr(Y_ROOF[1]) + 1), (Y_ROOF[0] + 50, zr(Y_ROOF[0] + 50) + 1)],
           fill=SHINGLE, stroke=None)
    # лобовая доска и желоб
    v.rect(FASCIA_Y[0], FASCIA_Z[0], FASCIA_Y[1], FASCIA_Z[1], fill=WOOD_CUT, stroke=INK, lw=0.4)
    v.polyline([(Y_ROOF[1] - 60, zt(Y_ROOF[1] - 60) + 2), (Y_ROOF[1] + 2, zt(Y_ROOF[1]) + 2),
                (Y_ROOF[1] + 14, zt(Y_ROOF[1]) - 30)], color=METAL, lw=1.1)
    gp = [(GUT_YC + GUT_R * math.cos(math.radians(a)), GUT_ZTOP + GUT_R * math.sin(math.radians(a)))
          for a in range(-180, 1, 10)]
    v.polyline(gp, color=STEEL, lw=1.3)
    v.line(FASCIA_Y[1], FASCIA_Z[1] - 25, GUT_YC - GUT_R, GUT_ZTOP, color=STEEL, lw=0.7)
    # примыкание к стене
    v.poly([(HOUSE_Y, zt(-50) + 3), (HOUSE_Y + 50, zt(-50) + 3), (HOUSE_Y, zt(-50) + 53)],
           fill=WOOD_CUT, stroke=INK, lw=0.4)
    zb = zr(Y_ROOF[0])
    v.polyline([(HOUSE_Y + 1.5, zb + 255), (HOUSE_Y + 1.5, zb + 50), (HOUSE_Y + 52, zb + 2), (HOUSE_Y + 260, zr(200) + 2)],
               color=UNDERLAY, lw=1.0)
    v.polyline([(HOUSE_Y - 18, zb + 268), (HOUSE_Y + 4, zb + 268), (HOUSE_Y + 4, zb + 150), (HOUSE_Y + 22, zb + 136)],
               color=METAL, lw=1.2)
    v.circle(HOUSE_Y + 2, zb + 270, 9, fill=SEALANT, stroke=None)
    # вентиляционные зазоры (сетка)
    v.line(D + CL + 2, FRIEZE_Z[1] + 2, D + CL + 2, zo(D + CL) - 4, color=MESH, lw=0.9, dash=(1.2, 0.8))
    v.line(-CL - 1, Z_BACK_TOP + 2, -CL - 1, zo(-CL) - 4, color=MESH, lw=0.9, dash=(1.2, 0.8))
    # полка, рейки
    v.rect(SHELF_Y[0], SHELF_Z, SHELF_Y[1], SHELF_Z + SHELF_T, fill=WOOD_CUT, stroke=INK, lw=0.4)
    v.poly([(T + 12, SHELF_Z), (T + 12 + 240, SHELF_Z), (T + 12, SHELF_Z - 190)], fill=None, stroke=STEEL, lw=0.6)
    v.rect(T + 12, RAIL_Z[0], T + 32, RAIL_Z[1], fill=WOOD_CUT, stroke=INK, lw=0.4)
    v.rect(T + 32, RAIL_Z[0] + 30, T + 75, RAIL_Z[0] + 60, fill=STEEL, stroke=None)
    v.rect(T + 12, LOW_RAIL_Z[0], T + 32, LOW_RAIL_Z[1], fill=WOOD_CUT, stroke=INK, lw=0.4)
    # инструмент (условно)
    v.line(T + 55, Z_FLOOR + 5, T + 55, Z_FLOOR + 1650, color=HexColor('#9C6B3C'), lw=1.6)
    v.poly([(T + 35, Z_FLOOR + 3), (T + 75, Z_FLOOR + 3), (T + 75, Z_FLOOR + 300), (T + 35, Z_FLOOR + 300)],
           fill=HexColor('#9AA3AD'), stroke=INK, lw=0.3)
    # стрелки вентиляции
    for (y0, z0, y1, z1) in ((300, Z_BLK + 20, 300, Z_FLOOR + 160), (480, 1900, 590, 2185)):
        v.line(y0, z0, y1, z1, color=MESH, lw=0.6)
        ang = math.atan2((z1 - z0), (y1 - y0))
        for s in (-1, 1):
            v.line(y1, z1, y1 - 70 * math.cos(ang + s * 0.4), z1 - 70 * math.sin(ang + s * 0.4), color=MESH, lw=0.6)


def section_11_labels(v, xl, xr, y_min=None, y_max=None):
    zt = lambda y: zo(y) + OSB_V
    zb = zr(Y_ROOF[0])
    L = [
        (HOUSE_Y + 2, zb + 268, 'Планка примыкания в штробу\n+ полиуретановый герметик'),
        (HOUSE_Y + 3, zb + 200, 'Ендовный ковёр на стену 250 мм'),
        (HOUSE_Y + 18, zt(-50) + 18, 'Треугольная рейка 50×50'),
        (-CL - 1, Z_BACK_TOP + 50, 'Вентзазор между стропилами,\nсетка'),
        (-150, Z_BACK_TOP - 25, 'Рамный дюбель 10×160 через\nпроставку 40 мм (3 шт.)'),
        (-10, 1700, '«Американка» 20×140,\nшипом вверх'),
        (-0.5, 1400, 'Мембрана ветро-влагозащитная\n(диффузионная)'),
        (T + 6, 1100, 'ОСП-3 12 мм — внутренняя\nобшивка (крепёж крючков)'),
        (20, 700, 'Каркас 45×45'),
        (SHELF_Y[0] + 30, SHELF_Z + 10, 'Полка 2×20×145 на кронштейнах'),
        (T + 25, RAIL_Z[1] - 10, 'Рейка с держателями инструмента'),
        (T + 25, LOW_RAIL_Z[1] - 10, 'Упорная рейка 20×45'),
        (-10, CLAD_Z0 + 5, 'Низ обшивки на 20 мм ниже\nобвязки, торец со скосом'),
        (100, Z_BLK - 2, 'Гидроизоляция 2 слоя'),
        (60, 60, 'Бетонная опора 200×200×200'),
        (120, -100, 'Песчано-гравийная подушка'),
        (-30, -50, 'Щебень 100 мм по геотекстилю'),
    ]
    column_notes(v, L, xl, right=False, y_min=y_min, y_max=y_max)
    R = [
        (300, zr(300) - 2, 'Гибкая черепица'),
        (420, zt(420) + 1.5, 'Подкладочный ковёр (самоклеящийся)'),
        (520, zo(520) + 5, 'ОСП-3 12 мм'),
        (400, zu(400) + 40, 'Стропило 45×95, шаг 364'),
        (Y_ROOF[1] + 8, zt(Y_ROOF[1]) - 10, 'Карнизная планка (капельник)'),
        (FASCIA_Y[1] - 5, FASCIA_Z[0] + 40, 'Лобовая доска 20×120'),
        (GUT_YC + 40, GUT_ZTOP - 40, 'Желоб, уклон 3–5 мм/м'),
        (D + CL + 2, 2180, 'Продух с сеткой'),
        (D + 30, DOOR_Z[1] + 3, 'Отлив над дверью'),
        (DOOR_Y[1] - 8, 1700, 'Створка: рамка 20×95\n+ обшивка 20×145'),
        (ASTR_Y[1] - 5, 1500, 'Нащельник 20×95'),
        (D + 3, OPEN_Z[0] - 12, 'Уплотнитель EPDM по контуру'),
        (300, Z_FLOOR - 10, 'Пол 28×95, зазоры 5 мм'),
        (D + 30, SKIRT_Z[1] - 4, 'Цокольный отлив'),
        (D + 10, 200, 'Цокольная доска 20×145'),
        (D - 20, 170, 'Обвязка 45×95'),
    ]
    column_notes(v, R, xr, right=True, y_min=y_min, y_max=y_max)


# ============================================================ разрез 2-2 (горизонтальный, z = 1000)
def section_22(v):
    B = lambda y: -y
    # стена дома
    v.hatch([(-150, B(HOUSE_Y)), (1650, B(HOUSE_Y)), (1650, B(-200)), (-150, B(-200))], step=1.5, angle=45,
            color=HOUSE_H, lw=0.25, fill=HOUSE, stroke=INK, slw=0.5)
    # пол (вид сверху ниже плоскости разреза)
    for i in range(N_FLOOR):
        x0 = i * (FLOOR_W + FLOOR_GAP)
        v.rect(max(x0, T + 12), B(T + 12), min(x0 + FLOOR_W, W - T - 12), B(D - T), fill=WOOD, stroke=LIGHT, lw=0.2)
    # задняя стена: обшивка, мембрана, стойки, ОСП
    v.rect(0, B(-CL), W, B(-1), fill=CLAD, stroke=INK, lw=0.4)
    v.line(0, B(-0.5), W, B(-0.5), color=MEMB, lw=0.9)
    for x0 in STUDS_X:
        v.cut(x0, B(0), x0 + T, B(T))
    v.rect(T, B(T), W - T, B(T + 12), fill=OSB, stroke=INK, lw=0.4)
    # боковые стены
    for xs, xc0, xc1 in ((0, -CL, -1), (W - T, W + 1, W + CL)):
        v.rect(xc0, B(-CL), xc1, B(D), fill=CLAD, stroke=INK, lw=0.4)
        xm = 0 if xs == 0 else W
        v.line(xm + (-0.5 if xs == 0 else 0.5), B(-CL), xm + (-0.5 if xs == 0 else 0.5), B(D), color=MEMB, lw=0.9)
        v.cut(xs, B(T), xs + T, B(2 * T))
        v.cut(xs, B(D - 2 * T), xs + T, B(D - T))
        xo = T if xs == 0 else W - T - 12
        v.rect(xo, B(T + 12), xo + 12, B(D - T), fill=OSB, stroke=INK, lw=0.4)
    # передние стойки 45×95, петельные стойки
    v.cut(0, B(D - T), FRONT_STUD, B(D))
    v.cut(W - FRONT_STUD, B(D - T), W, B(D))
    v.cut(POST_L[0], B(POST_Y[0]), POST_L[1], B(POST_Y[1]), fill=HexColor('#F7F3EA'))
    v.cut(POST_R[0], B(POST_Y[0]), POST_R[1], B(POST_Y[1]), fill=HexColor('#F7F3EA'))
    # двери
    for (x0, x1) in (DOOR_L, DOOR_R):
        v.rect(x0, B(DOOR_Y[0] + 20), x1, B(DOOR_Y[1]), fill=CLAD, stroke=INK, lw=0.4)
        v.rect(x0, B(DOOR_Y[0]), x0 + DR, B(DOOR_Y[0] + 20), fill=WOOD_CUT, stroke=INK, lw=0.4)
        v.rect(x1 - DR, B(DOOR_Y[0]), x1, B(DOOR_Y[0] + 20), fill=WOOD_CUT, stroke=INK, lw=0.4)
    v.rect(ASTR_X[0], B(ASTR_Y[0]), ASTR_X[1], B(ASTR_Y[1]), fill=WOOD_CUT, stroke=INK, lw=0.4)
    for xx in (60, W - 60):
        v.circle(xx, B(D + 2.5), 5, fill=SEAL, stroke=None)
    v.circle(ASTR_X[0] + 25, B(ASTR_Y[0] - 2), 5, fill=SEAL, stroke=None)
    # петли
    for (hx, s) in ((POST_L[1] + 1.5, 1), (POST_R[0] - 1.5, -1)):
        v.circle(hx, B(POST_Y[1] + 4), 7, fill=STEEL, stroke=None)
        r = DOOR_W
        pts = [(hx + s * r * math.cos(math.radians(a)), B(POST_Y[1] + r * math.sin(math.radians(a))))
               for a in range(0, 91, 5)]
        v.polyline(pts, color=ACCENT, lw=0.3, dash=(1.5, 1))
    # инструмент в разрезе (черенки)
    for i, x in enumerate(range(150, 1350, 115)):
        v.circle(x, B(T + 12 + 45), 17, fill=HexColor('#B27B47'), stroke=INK, lw=0.25)


def legend(c, x0, y0, cols=2, colw=46):
    items = [
        ('cut', 'Древесина в разрезе'),
        ('osb', 'ОСП-3 12 мм'),
        ('clad', 'Обшивка, доски'),
        ('memb', 'Ветро-влагозащитная мембрана'),
        ('under', 'Подкладочный / ендовный ковёр'),
        ('shingle', 'Гибкая черепица'),
        ('metal', 'Оцинк. планки, отливы'),
        ('seal', 'Уплотнитель EPDM'),
        ('sealant', 'Герметик ПУ / МС-полимер'),
        ('conc', 'Бетон'),
        ('gravel', 'Щебень / песок'),
        ('mesh', 'Сетка в продухах'),
    ]
    text(c, x0, y0 + 4, 'Условные обозначения', 7, FB)
    v = View(c, 0, 0, 1)
    for i, (k, t) in enumerate(items):
        col, row = i % cols, i // cols
        x = x0 + col * colw
        y = y0 - row * 5.2
        V = View(c, x, y - 1.6, 1)
        if k == 'cut':
            V.cut(0, 0, 7, 3.2)
        elif k == 'osb':
            V.rect(0, 0, 7, 3.2, fill=OSB, stroke=INK, lw=0.4)
        elif k == 'clad':
            V.rect(0, 0, 7, 3.2, fill=CLAD, stroke=INK, lw=0.4)
        elif k == 'memb':
            V.line(0, 1.6, 7, 1.6, color=MEMB, lw=1.2)
        elif k == 'under':
            V.line(0, 1.6, 7, 1.6, color=UNDERLAY, lw=1.2)
        elif k == 'shingle':
            V.rect(0, 0.6, 7, 2.6, fill=SHINGLE, stroke=None)
        elif k == 'metal':
            V.line(0, 1.6, 7, 1.6, color=METAL, lw=1.4)
        elif k == 'seal':
            V.circle(3.5, 1.6, 1.0, fill=SEAL, stroke=None)
        elif k == 'sealant':
            V.circle(3.5, 1.6, 1.0, fill=SEALANT, stroke=None)
        elif k == 'conc':
            V.dots([(0, 0), (7, 0), (7, 3.2), (0, 3.2)], step=0.9, fill=CONCRETE, color=GREY, seed=2)
        elif k == 'gravel':
            V.dots([(0, 0), (7, 0), (7, 3.2), (0, 3.2)], step=1.0, fill=GRAVEL, color=HexColor('#9A8F78'),
                   circles=True, seed=4)
        elif k == 'mesh':
            V.line(0, 1.6, 7, 1.6, color=MESH, lw=1.0, dash=(1.2, 0.8))
        text(c, x + 9, y - 0.9, t, 5.6)


def sheet_sections(c, num, total):
    tblock(c, num, total, 'Разрезы 1-1 и 2-2', '1:20')
    heading(c, num, 'Разрезы', 'Масштаб 1:20 · разрез 1-1 — по левой створке и среднему стропилу; '
                               'разрез 2-2 — горизонтальный на высоте 1.0 м')
    v = View(c, 86, 43, 20)
    section_11(v)
    text(c, 86 + 425 / 20, 183, 'Разрез 1-1', 8, FB, anchor='c')
    section_11_labels(v, 66, 144, y_min=27, y_max=182)
    for z, t in ((0, '±0.000'), (Z_FLOOR, '+0.273'), (DOOR_Z[1], '+%.3f' % (DOOR_Z[1] / 1000)),
                 (H_TOTAL, '+%.3f' % (H_TOTAL / 1000))):
        pass
    # маркеры узлов
    zb = zr(Y_ROOF[0])
    for (a, b, n) in ((HOUSE_Y + 60, zb + 80, 1), (FASCIA_Y[1] + 40, FASCIA_Z[0] - 30, 2),
                      (-CL - 40, Z_BLK + 60, 3), (D + 70, Z_FLOOR + 40, 4)):
        v.circle(a, b, 230, fill=None, stroke=ACCENT, lw=0.5)
        v.marker(a + 165, b + 165, n, r=2.0)
    # --- разрез 2-2 ---
    v2 = View(c, 205, 175, 20)
    section_22(v2)
    text(c, 205 + 750 / 20, 186, 'Разрез 2-2 (z = 1.0 м)', 8, FB, anchor='c')
    v2.dim_h(-CL, W + CL, -1450, None, None)
    v2.dim_h(OPEN_X[0], OPEN_X[1], -1330, None, None, txt='проём 1310')
    v2.marker(ASTR_X[1] + 120, -(D + 200), 5, r=2.0)
    v2.circle(750, -(D + 20), 160, fill=None, stroke=ACCENT, lw=0.5)
    v2.circle(30, -(D + 20), 160, fill=None, stroke=ACCENT, lw=0.5)
    v2.text(-150, -1090, 'Открывание\nстворок 90°', 5.4, color=ACCENT)
    legend(c, 196, 86, cols=2, colw=47)
    text(c, 196, 33, 'Номера в кружках — узлы, см. листы 7–10.', 5.8, F, GREY)

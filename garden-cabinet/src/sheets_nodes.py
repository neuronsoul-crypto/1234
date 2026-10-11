# -*- coding: utf-8 -*-
"""Листы 7–9: узлы 1–5, двери."""
import math
from reportlab.lib.colors import HexColor
from geom import *
from draw import *

WALL_PTS = None


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


def clad_profile(v, y_out, z0, z1, side=-1, step=CLAD_STEP):
    """Обшивка «американка» в разрезе: доски внахлёст, шипом вверх. y_out — наружная грань."""
    t = CL
    z = z0
    while z < z1:
        zt = min(z + step + 15, z1)
        # профиль доски: толще внизу (20), тоньше вверху (10)
        if side < 0:
            pts = [(y_out, z), (y_out + t, z + 8), (y_out + t, zt), (y_out + t - 10, zt), (y_out + 0.5, z + step * 0.75)]
        else:
            pts = [(y_out, z), (y_out - t, z + 8), (y_out - t, zt), (y_out - t + 10, zt), (y_out - 0.5, z + step * 0.75)]
        v.poly(pts, fill=CLAD, stroke=INK, lw=0.4)
        z += step


def house_wall(v, a_out, a_in, b0, b1):
    v.hatch([(a_out, b0), (a_in, b0), (a_in, b1), (a_out, b1)], step=1.6, angle=45, color=HOUSE_H, lw=0.3,
            fill=HOUSE, stroke=INK, slw=0.6)


# ============================================================ ЛИСТ 7
def node1(v, box):
    zb = zr(Y_ROOF[0])
    zt = lambda y: zo(y) + OSB_V
    A0, A1, B0, B1 = box
    c = v.c
    clip_begin(c, v, A0, B0, A1, B1)
    # стена дома со штробой
    zg = zb + 268
    house_wall(v, A0 - 50, HOUSE_Y, B0 - 50, B1 + 50)
    v.rect(HOUSE_Y - 20, zg - 6, HOUSE_Y + 0.5, zg + 6, fill=HexColor('#FFFFFF'), stroke=INK, lw=0.3)
    # задняя стена
    v.rect(0, B0 - 50, T, Z_BACK_TOP - T, fill=WOOD_CUT, stroke=INK, lw=0.5)
    v.cut(0, Z_BACK_TOP - T, T, Z_BACK_TOP, lw=0.7)
    v.rect(T, B0 - 50, T + 12, Z_BACK_TOP, fill=OSB, stroke=INK, lw=0.5)
    clad_profile(v, -CL, 2130, Z_BACK_TOP)
    v.line(-0.6, B0 - 50, -0.6, Z_BACK_TOP, color=MEMB, lw=1.6)
    # анкер
    za = Z_BACK_TOP - 25
    v.rect(HOUSE_Y, za - 30, -CL, za + 30, fill=HexColor('#D7C9A8'), stroke=INK, lw=0.5)
    v.line(T + 14, za, -170, za, color=STEEL, lw=2.4)
    v.rect(T + 12, za - 10, T + 18, za + 10, fill=STEEL, stroke=None)
    v.circle(-CL + 1, za + 34, 5, fill=SEALANT, stroke=None)
    # стропило
    ya, yb = Y_RAF
    bot = [(ya, zu(ya)), (0, Z_BACK_TOP), (T, Z_BACK_TOP), (T, zu(T)), (400, zu(400))]
    v.poly(bot + [(400, zo(400)), (ya, zo(ya))], fill=WOOD_CUT, stroke=INK, lw=0.6)
    for k in (25, 55):
        v.polyline([(ya + 10, zu(ya) + k), (400, zu(400) + k)], color=WOOD_CUT_X, lw=0.25)
    # ОСП
    v.poly([(Y_ROOF[0], zo(Y_ROOF[0])), (400, zo(400)), (400, zt(400)), (Y_ROOF[0], zt(Y_ROOF[0]))], fill=OSB,
           stroke=INK, lw=0.5)
    # треугольная рейка
    tri = [(HOUSE_Y + 1, zt(HOUSE_Y + 1) + 2), (HOUSE_Y + 55, zt(HOUSE_Y + 55) + 2), (HOUSE_Y + 1, zt(HOUSE_Y) + 56)]
    v.poly(tri, fill=WOOD_CUT, stroke=INK, lw=0.5)
    # подкладочный ковёр (по ОСП и на рейку + 100 на стену)
    v.polyline([(400, zt(400) + 2), (HOUSE_Y + 57, zt(HOUSE_Y + 57) + 4), (HOUSE_Y + 3, zt(HOUSE_Y) + 60),
                (HOUSE_Y + 3, zt(HOUSE_Y) + 150)], color=UNDERLAY, lw=1.3)
    # черепица до рейки и на рейку
    sh = [(400, zt(400) + 4), (HOUSE_Y + 57, zt(HOUSE_Y + 57) + 6), (HOUSE_Y + 22, zt(HOUSE_Y) + 42),
          (HOUSE_Y + 22 - 4, zt(HOUSE_Y) + 38), (HOUSE_Y + 54, zt(HOUSE_Y + 54) + 12), (400, zt(400) + 11)]
    v.poly(sh, fill=SHINGLE, stroke=None)
    # ендовный ковёр на мастике: 200 на скат + 250 на стену
    v.polyline([(HOUSE_Y + 200, zr(HOUSE_Y + 200) + 3), (HOUSE_Y + 58, zr(HOUSE_Y + 58) + 4),
                (HOUSE_Y + 6, zt(HOUSE_Y) + 64), (HOUSE_Y + 6, zb + 250)], color=HexColor('#5B2C6F'), lw=1.6)
    # планка примыкания + герметик
    v.polyline([(HOUSE_Y - 18, zg), (HOUSE_Y + 9, zg), (HOUSE_Y + 9, zb + 140), (HOUSE_Y + 30, zb + 122)],
               color=METAL, lw=1.8)
    v.circle(HOUSE_Y - 4, zg + 2, 9, fill=SEALANT, stroke=None)
    v.line(HOUSE_Y + 9, zb + 200, HOUSE_Y - 40, zb + 200, color=STEEL, lw=1.0)
    c.restoreState()
    v.rect(A0, B0, A1, B1, fill=None, stroke=None)
    # размеры
    v.dim_h(HOUSE_Y, -CL, B0 + 30, None, None, txt='40')
    v.dim_v(zb, zb + 250, HOUSE_Y + 70, HOUSE_Y + 6, HOUSE_Y + 6, txt='250', tside='right')
    v.dim_h(HOUSE_Y, HOUSE_Y + 200, zb + 40, None, zr(HOUSE_Y + 200) + 3, txt='200')
    return [
        (HOUSE_Y - 4, zg + 2, 'Штроба 20 мм + полиуретановый\nгерметик'),
        (HOUSE_Y + 9, zb + 180, 'Планка примыкания (оцинк.,\nс полимером), дюбели шаг 250'),
        (HOUSE_Y + 6, zb + 230, 'Ендовный ковёр на битумной\nмастике: 250 на стену, 200 на скат'),
        (HOUSE_Y + 3, zt(HOUSE_Y) + 120, 'Подкладочный ковёр заведён\nна стену на 100 мм'),
        (HOUSE_Y + 25, zt(HOUSE_Y) + 20, 'Треугольная рейка 50×50'),
        (-150, za, 'Рамный дюбель 10×160'),
        (-40, za - 20, 'Проставка 40×60×60\n(лиственница / ПВХ)'),
        (-12, 2240, '«Американка» 20×140'),
        (-0.6, 2215, 'Мембрана'),
    ], [
        (110, zr(110) - 3, 'Гибкая черепица'),
        (140, zt(140) + 1, 'Подкладочный ковёр'),
        (170, zo(170) + 6, 'ОСП-3 12 мм'),
        (130, zu(130) + 45, 'Стропило 45×95'),
        (22, Z_BACK_TOP - 20, 'Верхняя обвязка 45×45,\n«седло» стропила 11 мм'),
        (T + 6, 2225, 'ОСП-3 12 мм (внутри)'),
        (T + 14, za, 'Шайба 30 мм'),
    ]


def node2(v, box):
    zt = lambda y: zo(y) + OSB_V
    A0, A1, B0, B1 = box
    c = v.c
    clip_begin(c, v, A0, B0, A1, B1)
    # передняя стена: перемычка, обвязка
    v.cut(D - T, Z_HEADER[0], D, Z_HEADER[1], lw=0.7)
    v.cut(D - T, Z_TOPF[0], D, Z_TOPF[1], lw=0.7)
    v.rect(T + 12, B0 - 50, D - T, B0 + 30, fill=None, stroke=None)
    v.line(D + 0.6, Z_HEADER[0], D + 0.6, Z_TOPF[1], color=MEMB, lw=1.6)
    # стропило за плоскостью разреза
    ya, yb = Y_RAF
    bot = [(450, zu(450)), (D - T, zu(D - T)), (D, Z_FRONT_TOP), (D, zu(D)), (yb, zu(yb))]
    v.poly(bot + [(yb, zo(yb)), (450, zo(450))], fill=WOOD, stroke=GREY, lw=0.4)
    v.text(700, zu(700) + 30, 'стропило (за плоскостью разреза)', 4.8, color=GREY, rot=-ALPHA_DEG)
    # ОСП, ковёр, черепица
    v.poly([(450, zo(450)), (Y_ROOF[1], zo(Y_ROOF[1])), (Y_ROOF[1], zt(Y_ROOF[1])), (450, zt(450))], fill=OSB,
           stroke=INK, lw=0.5)
    v.polyline([(450, zt(450) + 1.5), (Y_ROOF[1] - 5, zt(Y_ROOF[1] - 5) + 1.5)], color=UNDERLAY, lw=1.3)
    v.poly([(450, zt(450) + 4), (Y_ROOF[1] + 12, zt(Y_ROOF[1] + 12) + 4), (Y_ROOF[1] + 12, zt(Y_ROOF[1] + 12) + 10),
            (450, zt(450) + 11)], fill=SHINGLE, stroke=None)
    # карнизная планка
    v.polyline([(Y_ROOF[1] - 90, zt(Y_ROOF[1] - 90) + 2.5), (Y_ROOF[1] + 3, zt(Y_ROOF[1]) + 2.5),
                (Y_ROOF[1] + 3, zt(Y_ROOF[1]) - 22), (Y_ROOF[1] + 16, zt(Y_ROOF[1]) - 34)], color=METAL, lw=1.8)
    # лобовая доска
    v.cut(FASCIA_Y[0], FASCIA_Z[0], FASCIA_Y[1], FASCIA_Z[1], lw=0.6)
    # желоб и кронштейн
    gp = [(GUT_YC + GUT_R * math.cos(math.radians(a)), GUT_ZTOP + GUT_R * math.sin(math.radians(a)))
          for a in range(-180, 1, 8)]
    v.polyline(gp, color=STEEL, lw=1.8)
    v.polyline([(FASCIA_Y[1] + 1, FASCIA_Z[1] - 70), (FASCIA_Y[1] + 1, FASCIA_Z[1] - 20),
                (GUT_YC - GUT_R - 3, GUT_ZTOP + 3)] + [(GUT_YC + (GUT_R + 4) * math.cos(math.radians(a)),
                                                          GUT_ZTOP + (GUT_R + 4) * math.sin(math.radians(a)))
                                                         for a in range(-180, 10, 10)], color=HexColor('#333333'),
               lw=0.7)
    # фриз, отлив, сетка
    v.rect(D + 1, FRIEZE_Z[0], D + CL, FRIEZE_Z[1], fill=CLAD, stroke=INK, lw=0.5)
    v.polyline([(D + 1.5, FRIEZE_Z[0] + 25), (D + 1.5, DOOR_Z[1] + 7), (D + 58, DOOR_Z[1] + 2),
                (D + 58, DOOR_Z[1] - 12)], color=METAL, lw=1.8)
    v.line(D + CL + 3, FRIEZE_Z[1], D + CL + 3, zo(D + CL + 3), color=MESH, lw=1.4, dash=(2, 1.2))
    # дверь (верх)
    v.rect(DOOR_Y[0], B0 - 50, DOOR_Y[0] + 20, DOOR_Z[1], fill=WOOD_CUT, stroke=INK, lw=0.6)
    v.rect(DOOR_Y[0] + 20, B0 - 50, DOOR_Y[1], DOOR_Z[1], fill=CLAD, stroke=INK, lw=0.6)
    v.circle(D + 2.6, Z_HEADER[0] + 11, 5, fill=SEAL, stroke=None)
    # внутренняя часть
    v.rect(SHELF_Y[1] - 60, SHELF_Z, SHELF_Y[1], SHELF_Z + SHELF_T, fill=WOOD_CUT, stroke=INK, lw=0.4)
    c.restoreState()
    # траектория верхней кромки створки
    v.dim_v(DOOR_Z[1], FASCIA_Z[0], 1000, FASCIA_Y[1], FASCIA_Y[1], txt='29', tside='right')
    v.line(DOOR_Y[1], DOOR_Z[1], 1030, DOOR_Z[1], color=ACCENT2, lw=0.5, dash=(2, 1.2))
    v.text(905, DOOR_Z[1] - 25, 'верх створки при открывании', 5, color=ACCENT2)
    v.dim_h(D, Y_RAF[1], B1 - 15, None, None, txt='250')
    return [
        (D + 10, FRIEZE_Z[0] + 60, 'Фризовая доска 20×95'),
        (D + 30, DOOR_Z[1] + 4, 'Отлив над дверью, вынос 10 мм'),
        (D + 2.6, Z_HEADER[0] + 11, 'Уплотнитель EPDM D-профиль'),
        (D - 20, Z_HEADER[0] + 40, 'Перемычка 45×95'),
        (D - 20, Z_TOPF[0] + 20, 'Верхняя обвязка 45×45'),
        (D + 0.6, Z_HEADER[1] - 10, 'Мембрана'),
        (DOOR_Y[1] - 10, 2000, 'Створка'),
    ], [
        (720, zt(720) + 8, 'Гибкая черепица + стартовая полоса'),
        (760, zt(760) + 1.5, 'Подкладочный ковёр'),
        (800, zo(800) + 5, 'ОСП-3 12 мм'),
        (Y_ROOF[1] + 3, zt(Y_ROOF[1]) - 15, 'Карнизная планка (капельник)'),
        (FASCIA_Y[0] + 10, FASCIA_Z[0] + 30, 'Лобовая доска 20×120'),
        (GUT_YC + 30, GUT_ZTOP - 46, 'Желоб Ø 110–125, уклон 3–5 мм/м'),
        (D + CL + 3, 2190, 'Продух между стропилами,\nсетка от насекомых'),
    ]


def sheet_node1(c, num, total):
    tblock(c, num, total, 'Узел 1: примыкание к стене дома', '1:4')
    heading(c, num, 'Узел 1. Примыкание кровли к стене дома',
            'Масштаб 1:4 · главное место, где может появиться протечка — делать строго по схеме')
    A0, A1, B0, B1 = -200, 200, 2200, 2740
    v = View(c, 135, 33 - B0 / 4, 4)
    L, R = node1(v, (A0, A1, B0, B1))
    frame_box(c, v, A0, B0, A1, B1, 1, '')
    column_notes(v, L, 80, right=False, y_min=30, y_max=176, size=6)
    column_notes(v, R, 190, right=True, y_min=30, y_max=176, size=6)


def sheet_node2(c, num, total):
    tblock(c, num, total, 'Узел 2: карниз и водосток', '1:4')
    heading(c, num, 'Узел 2. Карниз, водосток, верх двери',
            'Масштаб 1:4 · разрез между стропилами · створка открывается под свесом без задевания')
    A0, A1, B0, B1 = 500, 1030, 1960, 2300
    v = View(c, 76 - A0 / 4, 70 - B0 / 4, 4)
    L, R = node2(v, (A0, A1, B0, B1))
    frame_box(c, v, A0, B0, A1, B1, 2, '')
    column_notes(v, L, 72, right=False, y_min=40, y_max=176, size=6)
    column_notes(v, R, 214, right=True, y_min=40, y_max=176, size=6)
    text(c, 76, 52, 'Почему так:', 7, FB, ACCENT)
    text(c, 76, 47.5, '• свес 250 мм уводит воду от дверей; капельник сбрасывает её в желоб, а не на лобовую доску;\n'
                      '• продухи между стропилами под свесом выводят влажный воздух — нет конденсата и плесени;\n'
                      '• отлив над дверью закрывает верхний стык створки, уплотнитель — второй рубеж;\n'
                      '• верх створки на 29 мм ниже лобовой доски и на 50 мм ниже желоба — двери открываются свободно.',
         6.2)


# ============================================================ узлы 3, 4 (низ стен)
def ground_part(v, a0, a1, B0):
    v.hatch([(a0, B0 - 60), (a1, B0 - 60), (a1, -100), (a0, -100)], step=1.5, angle=45, color=SOIL, lw=0.3)
    v.dots([(a0, -100), (a1, -100), (a1, 0), (a0, 0)], step=1.3, color=HexColor('#9A8F78'), fill=GRAVEL,
           stroke=None, circles=True, seed=11)
    v.line(a0, -100, a1, -100, color=HexColor('#2D7D46'), lw=0.9, dash=(3, 1))   # геотекстиль
    v.line(a0, 0, a1, 0, color=INK, lw=0.8)


def block_part(v, y0, y1):
    v.dots([(y0 - 50, -150), (y1 + 50, -150), (y1 + 50, -50), (y0 - 50, -50)], step=1.1,
           color=HexColor('#8C826C'), fill=HexColor('#D8CFB8'), stroke=INK, slw=0.3, circles=True, seed=5)
    v.dots([(y0, -50), (y1, -50), (y1, Z_BLK), (y0, Z_BLK)], step=1.0, color=HexColor('#888888'),
           fill=CONCRETE, stroke=INK, slw=0.6, seed=9)
    v.rect(y0 - 5, Z_BLK - 5, y1 + 5, Z_BLK, fill=SEAL, stroke=None)


def node3(v, box):
    A0, A1, B0, B1 = box
    c = v.c
    clip_begin(c, v, A0, B0, A1, B1)
    ground_part(v, HOUSE_Y, A1 + 10, B0)
    house_wall(v, A0 - 20, HOUSE_Y, B0 - 20, B1 + 20)
    v.text(-150, 300, 'цоколь\nдома', 6, color=GREY)
    block_part(v, *BLK_Y[0])
    v.cut(0, Z_BLK, T, Z_BASE_TOP, lw=0.7)
    v.rect(T, Z_BLK, A1 + 10, Z_BASE_TOP, fill=WOOD, stroke=GREY, lw=0.3)
    v.text(55, 190, 'поперечная обвязка (за разрезом)', 4.6, color=GREY)
    v.rect(0, Z_BASE_TOP, A1 + 10, Z_FLOOR, fill=WOOD_CUT, stroke=INK, lw=0.5)
    v.cut(0, Z_FLOOR, T, Z_FLOOR + T, lw=0.7)
    v.rect(0, Z_FLOOR + T, T, B1 + 10, fill=WOOD_CUT, stroke=INK, lw=0.5)
    v.rect(T, Z_FLOOR, T + 12, B1 + 10, fill=OSB, stroke=INK, lw=0.5)
    clad_profile(v, -CL, CLAD_Z0, B1 + 10)
    v.line(-0.6, Z_BLK - 2, -0.6, B1 + 10, color=MEMB, lw=1.6)
    v.polyline([(-0.6, Z_BLK - 2), (40, Z_BLK - 2)], color=MEMB, lw=1.6)
    c.restoreState()
    v.dim_v(0, CLAD_Z0, -100, -CL, -CL)
    v.dim_v(CLAD_Z0, Z_BLK, -45, -CL, None, txt='20')
    v.dim_v(0, Z_FLOOR, 240, None, None, tside='right')
    v.dim_v(-100, 0, 175, None, None, txt='100', tside='right')
    v.dim_h(HOUSE_Y, -CL, B1 - 25, None, None, txt='40')
    return [
        (-CL - 1, B1 - 60, 'Зазор 40 мм открыт снизу и с боков —\nпроветривание, стена дома сухая'),
        (-12, 390, '«Американка», первая доска на\nстартовой рейке, шипом вверх'),
        (-0.6, 330, 'Мембрана заведена на обвязку'),
        (-14, CLAD_Z0 + 6, 'Нижний торец со скосом-капельником,\nна 20 мм ниже обвязки'),
        (100, Z_BLK - 2, 'Гидроизол / рубероид, 2 слоя'),
        (60, 50, 'Бетонная опора 200×200×200'),
        (40, -120, 'Песчано-гравийная подушка 100 мм'),
        (-40, -60, 'Щебень 20–40 мм, 100 мм'),
        (-40, -100, 'Геотекстиль'),
    ], [
        (22, Z_BLK + 50, 'Обвязка 45×95'),
        (150, Z_FLOOR - 14, 'Пол 28×95'),
        (22, Z_FLOOR + 22, 'Нижняя обвязка\nзадней стены 45×45'),
        (T + 6, 380, 'ОСП-3 12 мм'),
    ]


def node4(v, box):
    A0, A1, B0, B1 = box
    c = v.c
    clip_begin(c, v, A0, B0, A1, B1)
    ground_part(v, A0 - 10, A1 + 10, B0)
    block_part(v, *BLK_Y[1])
    v.rect(A0 - 10, Z_BLK, D - T, Z_BASE_TOP, fill=WOOD, stroke=GREY, lw=0.3)
    v.cut(D - T, Z_BLK, D, Z_BASE_TOP, lw=0.7)
    v.rect(A0 - 10, Z_BASE_TOP, D, Z_FLOOR, fill=WOOD_CUT, stroke=INK, lw=0.5)
    v.cut(D - T, Z_FLOOR, D, Z_FLOOR + T, lw=0.7)
    # мембрана на обвязке и пороге
    v.line(D + 0.6, Z_BLK - 2, D + 0.6, SKIRT_Z[1] + 22, color=MEMB, lw=1.6)
    # цокольная доска и отлив
    v.rect(D + 1, SKIRT_Z[0], D + CL, SKIRT_Z[1], fill=CLAD, stroke=INK, lw=0.5)
    v.poly([(D + 1, SKIRT_Z[0]), (D + CL, SKIRT_Z[0] + 6), (D + CL, SKIRT_Z[0])], fill=HexColor('#FFFFFF'),
           stroke=None)
    v.polyline([(D + 1.5, SKIRT_Z[1] + 22), (D + 1.5, SKIRT_Z[1] + 3), (D + 36, SKIRT_Z[1] - 5),
                (D + 36, SKIRT_Z[1] - 20)], color=METAL, lw=1.8)
    # дверь: нижний ригель рамки + обшивка, капельник
    v.rect(DOOR_Y[0], DOOR_Z[0], DOOR_Y[0] + 20, B1 + 10, fill=WOOD_CUT, stroke=INK, lw=0.6)
    v.line(DOOR_Y[0], DOOR_RAIL_BOT[1], DOOR_Y[0] + 20, DOOR_RAIL_BOT[1], color=INK, lw=0.4)
    v.poly([(DOOR_Y[0] + 20, DOOR_Z[0]), (DOOR_Y[1], DOOR_Z[0] - 8), (DOOR_Y[1], B1 + 10),
            (DOOR_Y[0] + 20, B1 + 10)], fill=CLAD, stroke=INK, lw=0.6)
    v.line(DOOR_Y[1] - 6, DOOR_Z[0] - 6, DOOR_Y[1] - 6, DOOR_Z[0] + 4, color=INK, lw=0.5)
    v.circle(D + 2.6, OPEN_Z[0] - 12, 5, fill=SEAL, stroke=None)
    # нащельник за разрезом
    v.rect(ASTR_Y[0], DOOR_Z[0] - 8, ASTR_Y[1], B1 + 10, fill=None, stroke=GREY, lw=0.3, dash=(1.5, 1))
    c.restoreState()
    v.dim_v(OPEN_Z[0] - 25, OPEN_Z[0], 700, DOOR_Y[1], DOOR_Y[1], txt='25', tside='right')
    v.dim_v(0, Z_FLOOR, 750, None, None, tside='right')
    v.dim_h(D, D + 45, B1 - 20, None, None, txt='45')
    return [
        (D + 2.6, OPEN_Z[0] - 12, 'Уплотнитель EPDM на пороге'),
        (DOOR_Y[1] - 6, DOOR_Z[0], 'Низ створки: скос 15° + канавка-\nкапельник, торцы прокрашены'),
        (DOOR_Y[0] + 10, 360, 'Нижний ригель рамки 20×95'),
        (DOOR_Y[1] - 8, 420, 'Обшивка створки 20×145'),
        (ASTR_Y[1] - 3, 430, 'Нащельник (на правой створке)'),
        (D + 30, SKIRT_Z[1] - 3, 'Цокольный отлив, заведён\nпод мембрану'),
        (D + 10, 190, 'Цокольная доска 20×145'),
        (D + 0.6, 220, 'Мембрана'),
        (D - 22, Z_FLOOR + 22, 'Порог 45×45 (нижняя\nобвязка передней стены)'),
        (D - 22, 200, 'Обвязка 45×95'),
        (480, Z_FLOOR - 14, 'Пол 28×95'),
        (500, 60, 'Опора 200×200×200'),
        (680, -50, 'Щебень по геотекстилю'),
    ]


def sheet_nodes34(c, num, total):
    tblock(c, num, total, 'Узлы 3, 4: низ стены, порог', '1:5')
    heading(c, num, 'Узлы 3 и 4. Низ задней стены и порог',
            'Масштаб 1:5 · пол поднят на 273 мм, обшивка и двери перекрывают обвязку — вода не попадает внутрь')
    b3 = (-200, 250, -170, 450)
    v = View(c, 70 + 200 / 5, 40 + 170 / 5, 5)
    L, R = node3(v, b3)
    frame_box(c, v, *b3[:1], b3[2], b3[1], b3[3], 3, 'Низ задней стены у дома')
    column_notes(v, L + R, 66, right=False, y_min=30, y_max=160, size=5.8)
    b4 = (390, 770, -170, 450)
    v2 = View(c, 172 - 390 / 5, 40 + 170 / 5, 5)
    L2 = node4(v2, b4)
    frame_box(c, v2, b4[0], b4[2], b4[1], b4[3], 4, 'Порог и низ двери')
    column_notes(v2, L2, 252 - 2, right=True, y_min=30, y_max=158, size=5.8)


# ============================================================ узел 5 и двери
def node5a(v):
    """Горизонтальный разрез: петлевая сторона левой створки (вид сверху, дом сверху)."""
    B = lambda y: -y
    c = v.c
    A0, A1, Y0, Y1 = -70, 175, 470, 690
    clip_begin(c, v, A0, B(Y1), A1, B(Y0))
    v.rect(-CL, B(Y0 - 10), -1, B(D), fill=CLAD, stroke=INK, lw=0.5)
    v.line(-0.6, B(Y0 - 10), -0.6, B(D + 0.6), color=MEMB, lw=1.4)
    v.line(-0.6, B(D + 0.6), FRONT_STUD - 30, B(D + 0.6), color=MEMB, lw=1.4)
    v.cut(0, B(D - 2 * T), T, B(D - T), lw=0.7)
    v.rect(T, B(Y0 - 10), T + 12, B(D - T), fill=OSB, stroke=INK, lw=0.5)
    v.cut(0, B(D - T), FRONT_STUD, B(D), lw=0.7)
    v.cut(POST_L[0], B(POST_Y[0]), POST_L[1], B(POST_Y[1]), fill=HexColor('#F7F3EA'), lw=0.7)
    # створка: стойка рамки + обшивка
    v.cut(DOOR_L[0], B(DOOR_Y[0]), DOOR_L[0] + DR, B(DOOR_Y[0] + 20), lw=0.6)
    v.rect(DOOR_L[0], B(DOOR_Y[0] + 20), A1 + 20, B(DOOR_Y[1]), fill=CLAD, stroke=INK, lw=0.6)
    v.line(DOOR_L[0] + 90, B(DOOR_Y[0] + 20), DOOR_L[0] + 90, B(DOOR_Y[1]), color=INK, lw=0.4)
    v.circle(FRONT_STUD - 20, B(D + 2.6), 5, fill=SEAL, stroke=None)
    # петля-стрела
    hx = POST_L[1] + 1.5
    v.rect(POST_L[0] + 5, B(POST_Y[1]), hx - 4, B(POST_Y[1] + 3), fill=STEEL, stroke=None)
    v.rect(hx + 4, B(POST_Y[1]), A1 + 20, B(POST_Y[1] + 3), fill=STEEL, stroke=None)
    v.circle(hx, B(POST_Y[1] + 5), 6, fill=STEEL, stroke=INK, lw=0.3)
    # траектория
    r = DOOR_W
    pts = [(hx + r * math.cos(math.radians(a)), B(POST_Y[1] + r * math.sin(math.radians(a)))) for a in range(0, 16)]
    c.restoreState()
    v.dim_h(DOOR_L[0], FRONT_STUD, B(Y1) + 12, B(DOOR_Y[1]), B(D), txt='67')
    v.dim_h(POST_L[1], DOOR_L[0], B(Y0) - 5, B(POST_Y[0]), B(DOOR_Y[0]), txt='3')
    return [
        (-10, B(520), 'Боковая обшивка'),
        (-0.6, B(540), 'Мембрана заводится\nпод петельную стойку'),
        (2, B(POST_Y[1] - 10), 'Петельная стойка 45×45'),
        (hx, B(POST_Y[1] + 5), 'Ось петли-стрелы'),
    ], [
        (22, B(D - 2 * T + 20), 'Стойка боковой стены'),
        (60, B(D - 20), 'Стойка проёма 45×95'),
        (FRONT_STUD - 20, B(D + 2.6), 'Уплотнитель EPDM'),
        (DOOR_L[0] + 50, B(DOOR_Y[0] + 10), 'Стойка рамки створки 20×95'),
        (140, B(DOOR_Y[1] - 8), 'Обшивка створки 20×145'),
    ]


def node5b(v):
    B = lambda y: -y
    c = v.c
    A0, A1, Y0, Y1 = 600, 900, 560, 700
    clip_begin(c, v, A0, B(Y1), A1, B(Y0))
    for (x0, x1) in (DOOR_L, DOOR_R):
        v.rect(x0, B(DOOR_Y[0] + 20), x1, B(DOOR_Y[1]), fill=CLAD, stroke=INK, lw=0.6)
    v.cut(DOOR_L[1] - DR, B(DOOR_Y[0]), DOOR_L[1], B(DOOR_Y[0] + 20), lw=0.6)
    v.cut(DOOR_R[0], B(DOOR_Y[0]), DOOR_R[0] + DR, B(DOOR_Y[0] + 20), lw=0.6)
    v.cut(ASTR_X[0], B(ASTR_Y[0]), ASTR_X[1], B(ASTR_Y[1]), lw=0.6)
    v.circle(ASTR_X[0] + 20, B(ASTR_Y[0] + 2.6), 5, fill=SEAL, stroke=None)
    # шпингалет на левой створке изнутри
    v.rect(DOOR_L[1] - 80, B(DOOR_Y[0] - 12), DOOR_L[1] - 20, B(DOOR_Y[0]), fill=STEEL, stroke=None)
    for xx in (DOOR_L[1] - 135, DOOR_R[0] + 135):
        v.line(xx, B(DOOR_Y[0] + 20), xx, B(DOOR_Y[1]), color=INK, lw=0.4)
    c.restoreState()
    v.dim_h(ASTR_X[0], DOOR_L[1], B(Y1) + 12, B(ASTR_Y[1]), B(DOOR_Y[1]), txt='45')
    v.dim_h(DOOR_L[1], DOOR_R[0], B(Y0) - 5, B(DOOR_Y[0]), B(DOOR_Y[0]), txt='4')
    return [
        (ASTR_X[0] + 20, B(ASTR_Y[0] + 2.6), 'Уплотнитель под нащельником'),
        (DOOR_L[1] - 50, B(DOOR_Y[0] - 6), 'Шпингалеты (верх/низ) —\nна левой створке изнутри'),
    ], [
        (ASTR_X[1] - 20, B(ASTR_Y[1] - 8), 'Нащельник 20×95 на правой\n(ведущей) створке'),
        (DOOR_R[0] + 40, B(DOOR_Y[0] + 10), 'Стойка рамки'),
    ]


def door_leaf(v, inside=False):
    """Левая створка: вид снаружи или изнутри. Координаты: a — от левой кромки (снаружи), b — от низа."""
    Wd, Hd = DOOR_W, DOOR_H
    m = (lambda a: Wd - a) if inside else (lambda a: a)
    R = lambda a0, b0, a1, b1, **kw: v.rect(min(m(a0), m(a1)), b0, max(m(a0), m(a1)), b1, **kw)
    if not inside:
        R(0, 0, Wd, Hd, fill=CLAD, stroke=INK, lw=0.6)
        xs = [90 + i * 135 for i in range(5)]
        for x in xs:
            v.line(m(x), 0, m(x), Hd, color=INK, lw=0.3)
        for zc in [DR / 2, (DOOR_RAIL_MID[0] + DOOR_RAIL_MID[1]) / 2 - DOOR_Z[0], Hd - DR / 2]:
            v.poly([(m(-40), zc - 32), (m(0), zc - 32), (m(0), zc + 32), (m(-40), zc + 32)], fill=STEEL,
                   stroke=INK, lw=0.2)
            v.poly([(m(0), zc - 22), (m(400), zc - 9), (m(400), zc + 9), (m(0), zc + 22)], fill=STEEL, stroke=INK,
                   lw=0.2)
        R(Wd - 80, 1110 - DOOR_Z[0], Wd - 60, 1270 - DOOR_Z[0], fill=STEEL, stroke=INK, lw=0.2)
    else:
        R(0, 0, Wd, Hd, fill=HexColor('#F3E3C4'), stroke=INK, lw=0.4)
        for x in [90 + i * 135 for i in range(5)]:
            v.line(m(x), 0, m(x), Hd, color=LIGHT, lw=0.25)
        R(0, 0, DR, Hd, fill=WOOD_CUT, stroke=INK, lw=0.5)
        R(Wd - DR, 0, Wd, Hd, fill=WOOD_CUT, stroke=INK, lw=0.5)
        rb = (0, DR)
        rm = (DOOR_RAIL_MID[0] - DOOR_Z[0], DOOR_RAIL_MID[1] - DOOR_Z[0])
        rt = (Hd - DR, Hd)
        for (b0, b1) in (rb, rm, rt):
            R(DR, b0, Wd - DR, b1, fill=WOOD_CUT, stroke=INK, lw=0.5)
        # раскосы: нижний конец — у петель (a = 0 снаружи)
        for (lo, hi) in ((rb[1], rm[0]), (rm[1], rt[0])):
            a0, a1 = DR, Wd - DR
            w = 95
            k = (hi - lo) / (a1 - a0)
            dz = w * math.sqrt(1 + k * k)
            pts = [(m(a0), lo), (m(a0), lo + dz), (m(a1 - dz / k), hi), (m(a1), hi), (m(a1), hi - dz),
                   (m(a0 + dz / k), lo)]
            v.poly(pts, fill=HexColor('#E9C98F'), stroke=INK, lw=0.5)
        # шпингалеты
        for b in (Hd - 220, 160):
            R(Wd - 60, b, Wd - 40, b + 120, fill=STEEL, stroke=INK, lw=0.2)


def sheet_doors(c, num, total):
    tblock(c, num, total, 'Узел 5, конструкция створок', '1:4, 1:20')
    heading(c, num, 'Узел 5 и двери', 'Накладные створки перекрывают проём по всему контуру — '
                                      'уплотнитель EPDM обжимается между створкой и каркасом')
    # узел 5а
    va = View(c, 70 + 70 / 4, 175 + 470 / 4, 4)
    La, Ra = node5a(va)
    x0, y0 = va.pm(-70, -470)
    x1, y1 = va.pm(175, -690)
    frame_box(c, va, -70, -690, 175, -470, '5а', 'Петлевая сторона')
    column_notes(va, La, 64, right=False, y_min=118, y_max=175, size=5.6)
    column_notes(va, Ra, 136, right=True, y_min=118, y_max=175, size=5.6)
    # узел 5б
    vb = View(c, 70 - 600 / 4 + 0, 98 + 560 / 4, 4)
    Lb, Rb = node5b(vb)
    frame_box(c, vb, 600, -700, 900, -560, '5б', 'Притвор створок')
    column_notes(vb, Lb, 64, right=False, y_min=55, y_max=100, size=5.6)
    column_notes(vb, Rb, 150, right=True, y_min=55, y_max=100, size=5.6)
    text(c, 20, 47, 'Вид сверху, дом — вверху листа. Правая створка открывается первой;\n'
                    'левая фиксируется шпингалетами в перемычку и порог.', 5.8, F, GREY)
    # створки 1:20
    vo = View(c, 200, 52, 20)
    door_leaf(vo, inside=False)
    text(c, 200 + 18, 147, 'Левая створка, снаружи', 7, FB, anchor='c')
    vi = View(c, 246, 52, 20)
    door_leaf(vi, inside=True)
    text(c, 246 + 18, 147, 'Левая створка, изнутри', 7, FB, anchor='c')
    vo.dim_h(0, DOOR_W, -90, 0, 0)
    vo.dim_v(0, DOOR_H, -110, 0, 0)
    vi.dim_h(0, DR, -90, 0, 0, txt='95')
    vi.text(DOOR_W + 120, 900, 'петли', 5, color=ACCENT, rot=90)
    text(c, 198, 39, 'Правая створка — зеркально, с нащельником.\n'
                     'Раскос нижним концом упирается в сторону петель.', 5.6, F, GREY)
    # фурнитура
    text(c, 200, 182, 'Фурнитура на 2 створки', 7, FB)
    rows = ['Петля-стрела 400 мм с опорной пластиной — 6 шт.',
            'Шпингалет накладной 120–160 мм — 2 шт.',
            'Ручка-скоба — 2 шт.; проушины + навесной замок',
            'Уплотнитель EPDM D-профиль 9×7.5 мм — 10 м',
            'Фиксатор открытой створки (крючок) — 2 шт.',
            'Отлив над дверью оцинк. 1.5 м — 1 шт.']
    for i, r in enumerate(rows):
        text(c, 200, 177.5 - i * 4.2, '• ' + r, 5.6)

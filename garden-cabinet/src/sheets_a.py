# -*- coding: utf-8 -*-
"""Листы: виды, разрезы (эконом-вариант)."""
import math
from reportlab.lib.colors import HexColor
from geom import *
from draw import *
from elev import *

PN_CUT = HexColor('#3E6B4B')


def sheet_line(v, pts, lw=1.2):
    v.polyline(pts, color=PN_CUT, lw=lw)


# ============================================================ ЛИСТ: виды
def sheet_views(c, num, total):
    tblock(c, num, total, 'Фасад, вид сбоку, план', '1:20')
    heading(c, num, 'Виды и габариты', 'Масштаб 1:20 · размеры в мм · отметки в метрах от уровня земли')
    v = View(c, 37, 45, 20)
    front_elev(v)
    text(c, 37 + 500 / 20, 184, 'Фасад', 8, FB, anchor='c')
    v.dim_h(ROOF_X[0], ROOF_X[1], 2560, zr(ROOF_Y[0]) + 132, zr(ROOF_Y[0]) + 132)
    v.dim_h(-PN, W + PN, -230, 0, 0)
    v.dim_h(SHEET_L[0], SHEET_L[1], -110, DOOR_Z[0], DOOR_Z[0], txt='496')
    v.dim_h(SHEET_L[1], SHEET_R[1], -110, None, DOOR_Z[0], txt='500')
    for z, t in ((0, '±0.000'), (Z_FLOOR, '+0.207 пол'), (DOOR_Z[1], '+%.3f' % (DOOR_Z[1] / 1000)),
                 (H_TOTAL, '+%.3f' % (H_TOTAL / 1000))):
        v.level(1340, z, t, right=True, L=12)
        v.line(1100, z, 1330, z, color=LIGHT, lw=0.2, dash=(1, 1))

    v2 = View(c, 148, 45, 20)
    side_elev(v2)
    text(c, 148 + 300 / 20, 184, 'Вид сбоку (справа)', 8, FB, anchor='c')
    v2.dim_h(HOUSE_Y, -PN, -110, 0, 0, txt='40')
    v2.dim_h(-PN, SHEET_DOOR_Y[1], -110, 0, DOOR_Z[0])
    v2.dim_h(HOUSE_Y, ROOF_Y[1], -230, 0, 0)
    v2.dim_h(D, ROOF_Y[1], 2420, Z_F, zu(ROOF_Y[1]), txt='200')
    v2.text(120, zr(120) + 70, '%.0f°' % ALPHA_DEG, 6.5, FB, color=ACCENT)

    v3 = View(c, 218, 160, 20)
    plan_view(v3)
    text(c, 218 + 500 / 20, 184, 'План (вид сверху)', 8, FB, anchor='c')
    v3.dim_h(ROOF_X[0], ROOF_X[1], -1170, -ROOF_Y[1], -ROOF_Y[1])
    v3.dim_v(-HOUSE_Y, -ROOF_Y[1], -170, -200, ROOF_X[0])
    v3.text(-75, -1290, 'дуги — открывание створок (до 180°)', 5.2, color=ACCENT)
    for (b0, b1) in ((-860, -760), (60, 160)):
        v3.line(250, b0, 250, b1, color=ACCENT2, lw=0.9)
    v3.line(250, -760, 170, -760, color=ACCENT2, lw=0.6)
    v3.line(250, 60, 170, 60, color=ACCENT2, lw=0.6)
    v3.text(150, -800, '1', 6.5, FB, color=ACCENT2, anchor='r')
    v3.text(150, 40, '1', 6.5, FB, color=ACCENT2, anchor='r')

    x0, y0 = 207, 82
    rows = [('Корпус (Ш × Г × В)', '1020 × 570 × %d мм' % round(H_TOTAL)),
            ('Кровля', '1150 × 740 мм, один лист, свес 200 спереди'),
            ('Внутри (Ш × Г × В)', '910 × 455 × 1850…1970 мм'),
            ('Проём', '910 × 1703 мм, 2 накладные створки'),
            ('Уклон кровли', '%.0f° от дома' % ALPHA_DEG),
            ('Пол над землёй', '207 мм; зазор до стены дома 40 мм')]
    text(c, x0, y0 + 4, 'Основные параметры', 7, FB)
    for i, (k, val) in enumerate(rows):
        yy = y0 - 1 - i * 6.3
        text(c, x0, yy, k, 5.6, F, GREY)
        text(c, x0, yy - 2.6, val, 6.0, F, INK)


# ============================================================ разрез 1-1 (x = 250)
def section_11(v):
    v.hatch([(-300, -260), (900, -260), (900, -100), (-300, -100)], step=1.4, angle=45, color=SOIL, lw=0.25)
    v.dots([(HOUSE_Y, -100), (900, -100), (900, 0), (HOUSE_Y, 0)], step=1.0, color=HexColor('#9A8F78'),
           fill=GRAVEL, stroke=None, circles=True, seed=3)
    v.line(HOUSE_Y, 0, 900, 0, color=INK, lw=0.6)
    v.hatch([(-300, -100), (HOUSE_Y, -100), (HOUSE_Y, 2650), (-300, 2650)], step=1.5, angle=45,
            color=HOUSE_H, lw=0.25, fill=HOUSE, stroke=INK, slw=0.6)
    # пескоблок за плоскостью разреза
    v.rect(BLK_Y[0], 0, BLK_Y[1], Z_BLK, fill=HexColor('#E3E3E3'), stroke=GREY, lw=0.3)
    v.rect(BLK_Y[0], Z_BLK - 4, BLK_Y[1], Z_BLK, fill=SEAL, stroke=None)
    # основание и пол
    v.rect(T, Z_BASE[0], D - T, Z_BASE[1], fill=WOOD, stroke=GREY, lw=0.3)
    v.cut(0, Z_BASE[0], T, Z_BASE[1])
    v.cut(D - T, Z_BASE[0], D, Z_BASE[1])
    v.rect(0, Z_BASE[1], D, Z_FLOOR, fill=OSB, stroke=INK, lw=0.5)
    # задняя стена: стойка за разрезом, ригель и прогон в разрезе, лист
    v.rect(0, POST_B[0], T, POST_B[1], fill=WOOD, stroke=GREY, lw=0.3)
    v.cut(0, Z_GIRT[0], T, Z_GIRT[1])
    v.cut(0, Z_B - T, T, Z_B)
    v.rect(-PN, CLAD_Z0, 0, BACK_SHEET['z'][1], fill=HexColor('#C7D9CB'), stroke=None)
    sheet_line(v, [(-PN, CLAD_Z0), (-PN, BACK_SHEET['z'][1])])
    sheet_line(v, [(-1, CLAD_Z0 + 5), (-1, BACK_SHEET['z'][1])], lw=0.5)
    # анкер к дому через проставку
    za = Z_B - T / 2
    v.rect(HOUSE_Y, za - 30, -PN, za + 30, fill=HexColor('#D7C9A8'), stroke=INK, lw=0.4)
    v.line(T, za, -200, za, color=STEEL, lw=1.1)
    # передняя стена
    v.rect(D - T, POST_F[0], D, POST_F[1], fill=WOOD, stroke=GREY, lw=0.3)
    v.cut(D - T, Z_THR[0], D, Z_THR[1])
    v.cut(D - T, Z_HEADER[0], D, Z_HEADER[1])
    v.cut(D - T, Z_F - T, D, Z_F)
    v.line(D + 1, VENT_Z[0], D + 1, VENT_Z[1], color=MESH, lw=0.9, dash=(1.2, 0.8))
    # дверь: ригели и раскосы рамки, лист
    for (z0, z1) in (RAIL_BOT, RAIL_MID, RAIL_TOP):
        v.cut(DOOR_Y[0], z0, DOOR_Y[1], z1)
    for zc in (670, 1555):
        v.rect(DOOR_Y[0], zc - 70, DOOR_Y[1], zc + 70, fill=WOOD_CUT, stroke=INK, lw=0.4)
    v.rect(SHEET_DOOR_Y[0], DOOR_Z[0], SHEET_DOOR_Y[1], DOOR_Z[1], fill=HexColor('#C7D9CB'), stroke=None)
    sheet_line(v, [(SHEET_DOOR_Y[1], DOOR_Z[0]), (SHEET_DOOR_Y[1], DOOR_Z[1])])
    sheet_line(v, [(SHEET_DOOR_Y[0], DOOR_Z[0] + 5), (SHEET_DOOR_Y[0], DOOR_Z[1])], lw=0.5)
    for zz in (Z_THR[0] + 25, Z_HEADER[0] + 22):
        v.circle(D + 2.5, zz, 5, fill=SEAL, stroke=None)
    # кровельный лист
    v.poly([(ROOF_Y[0], zu(ROOF_Y[0])), (ROOF_Y[1], zu(ROOF_Y[1])), (ROOF_Y[1], zr(ROOF_Y[1])),
            (ROOF_Y[0], zr(ROOF_Y[0]))], fill=HexColor('#C7D9CB'), stroke=None)
    sheet_line(v, [(ROOF_Y[0], zr(ROOF_Y[0])), (ROOF_Y[1], zr(ROOF_Y[1]))])
    sheet_line(v, [(ROOF_Y[0], zu(ROOF_Y[0])), (ROOF_Y[1], zu(ROOF_Y[1]))], lw=0.5)
    # планка примыкания
    zb = zr(ROOF_Y[0])
    v.rect(ROOF_Y[0] + 5, zr(ROOF_Y[0] + 5), ROOF_Y[0] + 90, zr(ROOF_Y[0] + 90) + 12, fill=SEAL, stroke=None)
    v.polyline([(HOUSE_Y + 2, zb + 130), (HOUSE_Y + 2, zb + 14), (ROOF_Y[0] + 110, zr(ROOF_Y[0] + 110) + 14),
                (ROOF_Y[0] + 125, zr(ROOF_Y[0] + 125) - 5)], color=METAL, lw=1.2)
    v.circle(HOUSE_Y + 1, zb + 134, 8, fill=SEALANT, stroke=None)
    # полка, держатели, инструмент
    v.rect(SHELF_Y[0], SHELF_Z, SHELF_Y[1], SHELF_Z + 12, fill=OSB, stroke=INK, lw=0.4)
    v.rect(T, Z_GIRT[0] + 10, T + 40, Z_GIRT[0] + 35, fill=STEEL, stroke=None)
    v.line(T + 45, Z_FLOOR + 5, T + 45, Z_FLOOR + 1650, color=HexColor('#9C6B3C'), lw=1.6)
    v.poly([(T + 25, Z_FLOOR + 3), (T + 65, Z_FLOOR + 3), (T + 65, Z_FLOOR + 300), (T + 25, Z_FLOOR + 300)],
           fill=HexColor('#9AA3AD'), stroke=INK, lw=0.3)
    # отверстия в полу
    for yy in (150, 300):
        v.rect(yy - 5, Z_BASE[1], yy + 5, Z_FLOOR, fill=HexColor('#FFFFFF'), stroke=None)
    # вентиляция
    for (y0, z0, y1, z1) in ((225, Z_BLK + 10, 225, Z_FLOOR + 160), (380, 1850, 495, 2035)):
        v.line(y0, z0, y1, z1, color=MESH, lw=0.6)
        ang = math.atan2((z1 - z0), (y1 - y0))
        for s in (-1, 1):
            v.line(y1, z1, y1 - 60 * math.cos(ang + s * 0.4), z1 - 60 * math.sin(ang + s * 0.4), color=MESH, lw=0.6)


def section_11_notes(v, xl, xr, y_min, y_max):
    zb = zr(ROOF_Y[0])
    L = [
        (HOUSE_Y + 1, zb + 134, 'Герметик по верху планки'),
        (HOUSE_Y + 2, zb + 70, 'Планка примыкания, дюбели шаг 300'),
        (ROOF_Y[0] + 50, zr(ROOF_Y[0] + 50) + 6, 'Уплотнитель под волну'),
        (-150, Z_B - T / 2, 'Рамный дюбель 10×100 через\nпроставку 40 мм (2 шт.)'),
        (22, Z_B - 20, 'Прогон 45×45'),
        (-PN, 1700, 'Профнастил С10, волна\nвертикально'),
        (22, Z_GIRT[0] + 20, 'Ригель 45×45 + держатели'),
        (SHELF_Y[0] + 80, SHELF_Z + 6, 'Полка из ОСП (остаток листа)'),
        (22, 900, 'Стойка 45×45 (за разрезом)'),
        (-PN, CLAD_Z0 + 10, 'Низ листа на 20 мм ниже\nобвязки — капельник'),
        (120, Z_BLK - 2, 'Рубероид под обвязку'),
        (300, 70, 'Пескоблок 390×190×188'),
        (-30, -50, 'Щебень 50–100 мм'),
    ]
    column_notes(v, L, xl, right=False, y_min=y_min, y_max=y_max)
    R = [
        (400, zr(400), 'Кровля — один лист С10\nбез поперечных стыков'),
        (ROOF_Y[1] - 20, zr(ROOF_Y[1] - 20), 'Свес 200 мм, волны открыты —\nпроветривание'),
        (D - 20, Z_F - 20, 'Передний прогон 45×45'),
        (D + 1, VENT_Z[0] + 30, 'Продух над дверями, сетка'),
        (D - 20, Z_HEADER[0] + 20, 'Перемычка 45×45'),
        (D + 2.5, Z_HEADER[0] + 22, 'Уплотнитель D-профиль'),
        (SHEET_DOOR_Y[1], 1300, 'Створка: рамка 45×45\n+ профнастил'),
        (DOOR_Y[0] + 20, 700, 'Раскос рамки'),
        (D - 20, Z_THR[0] + 20, 'Порог 45×45'),
        (SHEET_DOOR_Y[1], DOOR_Z[0] + 10, 'Фартук створки до +0.160'),
        (150, Z_FLOOR - 6, 'Пол ОСП-3 12 мм,\nотверстия Ø10 для стока'),
        (D - 20, Z_BASE[0] + 20, 'Обвязка 45×45'),
    ]
    column_notes(v, R, xr, right=True, y_min=y_min, y_max=y_max)


# ============================================================ разрез 2-2 (z = 1000)
def zig_plan_x(v, x0, x1, y_back, h=PN, lw=0.6):
    """Профиль листа в плане вдоль x (волны вертикальные): y_back — внутренняя плоскость."""
    pts = []
    x = x0
    while x < x1:
        pts += [(x, y_back), (x + 12, y_back + h), (x + 36, y_back + h), (x + 48, y_back)]
        x += WAVE
    pts = [(min(p[0], x1), p[1]) for p in pts]
    v.polyline(pts, color=PN_CUT, lw=lw)


def zig_plan_y(v, y0, y1, x_back, s=1, h=PN, lw=0.6):
    pts = []
    y = y0
    while y < y1:
        pts += [(x_back, y), (x_back + s * h, y + 12), (x_back + s * h, y + 36), (x_back, y + 48)]
        y += WAVE
    pts = [(p[0], min(p[1], y1)) for p in pts]
    v.polyline(pts, color=PN_CUT, lw=lw)


def section_22(v):
    B = lambda y: -y
    v.hatch([(-150, B(HOUSE_Y)), (1150, B(HOUSE_Y)), (1150, B(-200)), (-150, B(-200))], step=1.5, angle=45,
            color=HOUSE_H, lw=0.25, fill=HOUSE, stroke=INK, slw=0.5)
    v.rect(T, B(T), W - T, B(D - T), fill=HexColor('#F3E3C4'), stroke=LIGHT, lw=0.2)
    # задняя обшивка (волны вертикальные → в плане зигзаг)
    pts_back = []
    x = -PN
    while x < W + PN:
        pts_back += [(x, B(0)), (x + 12, B(-PN)), (x + 36, B(-PN)), (x + 48, B(0))]
        x += WAVE
    v.polyline([(min(p[0], W + PN), p[1]) for p in pts_back], color=PN_CUT, lw=0.7)
    # боковые
    for xb, s in ((0, -1), (W, 1)):
        pts = []
        y = -PN
        while y < D:
            pts += [(xb, B(y)), (xb + s * PN, B(y + 12)), (xb + s * PN, B(y + 36)), (xb, B(y + 48))]
            y += WAVE
        v.polyline([(p[0], max(p[1], B(D))) for p in pts], color=PN_CUT, lw=0.7)
    # стойки и ригели
    for (x0, y0) in ((0, 0), (W - T, 0), (0, D - T), (W - T, D - T)):
        v.cut(x0, B(y0), x0 + T, B(y0 + T))
    # двери: стойки рамок и листы
    for (x0, x1) in (DOOR_L, DOOR_R):
        v.cut(x0, B(DOOR_Y[0]), x0 + T, B(DOOR_Y[1]))
        v.cut(x1 - T, B(DOOR_Y[0]), x1, B(DOOR_Y[1]))
    for (x0, x1), dy in ((SHEET_L, 0), (SHEET_R, 2)):
        pts = []
        x = x0
        while x < x1:
            pts += [(x, B(SHEET_DOOR_Y[0] + dy)), (x + 12, B(SHEET_DOOR_Y[1] + dy)),
                    (x + 36, B(SHEET_DOOR_Y[1] + dy)), (x + 48, B(SHEET_DOOR_Y[0] + dy))]
            x += WAVE
        v.polyline([(min(p[0], x1), p[1]) for p in pts], color=PN_CUT, lw=0.7)
    for xx in (25, W - 25):
        v.circle(xx, B(D + 2.5), 6, fill=SEAL, stroke=None)
    v.circle(SHEET_R[0] + 30, B(SHEET_DOOR_Y[1] + 1), 6, fill=SEAL, stroke=None)
    for hx in (0, W):
        v.circle(hx, B(D + 3), 9, fill=STEEL, stroke=INK, lw=0.3)
        for (r, s) in ((DOOR_W if hx == 0 else SHEET_R[1] - SHEET_R[0], 1 if hx == 0 else -1),):
            pts = [(hx + s * r * math.cos(math.radians(a)), B(D + 5 + r * math.sin(math.radians(a))))
                   for a in range(0, 91, 5)]
            v.polyline(pts, color=ACCENT, lw=0.3, dash=(1.5, 1))
    for x in range(140, 900, 110):
        v.circle(x, B(T + 45), 17, fill=HexColor('#B27B47'), stroke=INK, lw=0.25)


def sheet_sections(c, num, total):
    tblock(c, num, total, 'Разрезы 1-1 и 2-2', '1:20, 1:15')
    heading(c, num, 'Разрезы', 'Разрез 1-1 — по левой створке (1:20); разрез 2-2 — горизонтальный на высоте 1.0 м (1:15)')
    v = View(c, 101, 43, 20)
    section_11(v)
    text(c, 101 + 250 / 20, 183, 'Разрез 1-1', 8, FB, anchor='c')
    section_11_notes(v, 84, 145, 27, 180)
    v2 = View(c, 208, 170, 15)
    section_22(v2)
    text(c, 208 + 500 / 15, 187, 'Разрез 2-2', 8, FB, anchor='c')
    v2.dim_h(-PN, W + PN, -1350, None, None)
    v2.dim_h(OPEN_X[0], OPEN_X[1], -1240, None, None, txt='проём 910')
    v2.text(-130, -1050, 'Створки\nоткрываются\nдо 180°', 5.2, color=ACCENT)
    notes = [(T / 2, -T / 2, 'Стойка 45×45'),
             (500, -(-PN / 2), 'Профнастил'),
             (25, -(D + 2.5), 'Уплотнитель'),
             (0, -(D + 3), 'Петля'),
             (SHEET_R[0] + 30, -(SHEET_DOOR_Y[1] + 1), 'Нахлёст листа 68 мм')]
    for (a, b, t), (dx, dy) in zip(notes, ((-8, 14), (8, 10), (-6, -16), (-10, -9), (14, -13))):
        v2.note(a, b, dx, dy, t, size=5.4)
    legend(c, 198, 70)


def legend(c, x0, y0, cols=2, colw=46):
    items = [('cut', 'Древесина в разрезе'), ('osb', 'ОСП-3 12 мм'), ('pn', 'Профнастил С10'),
             ('seal', 'Уплотнитель D-профиль'), ('sealant', 'Герметик'), ('foam', 'Уплотнитель под волну'),
             ('metal', 'Планка примыкания'), ('mesh', 'Сетка в продухе'), ('conc', 'Пескоблок'),
             ('gravel', 'Щебень')]
    text(c, x0, y0 + 4, 'Условные обозначения', 7, FB)
    for i, (k, t) in enumerate(items):
        col, row = i % cols, i // cols
        x = x0 + col * colw
        y = y0 - row * 5.2
        V = View(c, x, y - 1.6, 1)
        if k == 'cut':
            V.cut(0, 0, 7, 3.2)
        elif k == 'osb':
            V.rect(0, 0, 7, 3.2, fill=OSB, stroke=INK, lw=0.4)
        elif k == 'pn':
            V.line(0, 1.6, 7, 1.6, color=PN_CUT, lw=1.2)
        elif k == 'seal':
            V.circle(3.5, 1.6, 1.0, fill=SEAL, stroke=None)
        elif k == 'sealant':
            V.circle(3.5, 1.6, 1.0, fill=SEALANT, stroke=None)
        elif k == 'foam':
            V.rect(0, 0.9, 7, 2.3, fill=SEAL, stroke=None)
        elif k == 'metal':
            V.line(0, 1.6, 7, 1.6, color=METAL, lw=1.4)
        elif k == 'mesh':
            V.line(0, 1.6, 7, 1.6, color=MESH, lw=1.0, dash=(1.2, 0.8))
        elif k == 'conc':
            V.dots([(0, 0), (7, 0), (7, 3.2), (0, 3.2)], step=0.9, fill=CONCRETE, color=GREY, seed=2)
        elif k == 'gravel':
            V.dots([(0, 0), (7, 0), (7, 3.2), (0, 3.2)], step=1.0, fill=GRAVEL, color=HexColor('#9A8F78'),
                   circles=True, seed=4)
        text(c, x + 9, y - 0.9, t, 5.6)

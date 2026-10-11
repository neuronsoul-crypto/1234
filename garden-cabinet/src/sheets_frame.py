# -*- coding: utf-8 -*-
"""Листы 5–6: каркас, основание, панели стен, стропило."""
import math
from reportlab.lib.colors import HexColor
from geom import *
from draw import *
from model3d import frame_iso
from parts import PARTS

PN = {p[0]: p for p in PARTS}


def part_list(c, x0, y0, ids, title, size=5.4, step=6.2):
    if title:
        text(c, x0, y0, title, 7, FB)
    for i, pid in enumerate(ids):
        p = PN[pid]
        y = y0 - 5.5 - i * step
        V = View(c, x0 + 2.2, y - 0.2, 1)
        V.marker(0, 0, pid, r=1.9)
        text(c, x0 + 5.5, y + 0.3, p[1], size)
        text(c, x0 + 5.5, y - 2.2, '%s · L = %d · %d шт.' % (p[2], round(p[3]), p[4]), size, F, GREY)


# ============================================================ ЛИСТ 5
def sheet_frame(c, num, total):
    tblock(c, num, total, 'Каркас: изометрия, основание', '1:20')
    heading(c, num, 'Каркас и основание', 'Изометрия каркаса (без обшивки) · схемы опор и настила пола · '
                                          'позиции — см. раскрой, лист 15')
    ax = Axo(c, 33, 47.4, 22)
    frame_iso(ax)
    marks = [('1', (750, D, 200), (0, -8)), ('2', (W - 22, 300, 200), (8, -6)),
             ('3', (380, 300, Z_FLOOR), (-12, -1)), ('4', (500, 22, Z_BACK_TOP), (-8, 8)),
             ('5', (1113, 22, 1600), (-6, 6)), ('6', (300, D - 22, 300), (-10, -6)),
             ('7', (1100, D - 22, Z_TOPF[1] - 20), (0, -8)), ('8', (300, D - 22, Z_HEADER[0] + 40), (-12, 0)),
             ('9', (W - 50, D - 22, 1300), (12, 0)), ('10', (W - 22, 300, Z_FLOOR + 22), (10, 4)),
             ('11', (W - 22, 67, 1700), (8, 4)), ('12', (W - 22, D - 2 * T + 22, 1000), (12, -4)),
             ('13', (W - 22, 300, zu(300) - 20), (10, 3)), ('14', (W - 22, 300, Z_FLOOR + 1022), (10, 0)),
             ('15', (1113, 450, zo(450)), (0, 9)), ('16', (X_ROOF[1] - 22, 450, zo(450) - 25), (8, 12))]
    for pid, p, (dx, dy) in marks:
        x, y = ax.pm(*p)
        c.saveState()
        c.setStrokeColor(ACCENT)
        c.setLineWidth(0.35)
        c.line(x * mm, y * mm, (x + dx) * mm, (y + dy) * mm)
        c.setFillColor(ACCENT)
        c.circle(x * mm, y * mm, 0.5 * mm, stroke=0, fill=1)
        c.restoreState()
        V = View(c, x + dx, y + dy, 1)
        V.marker(0, 0, pid, r=2.0)
    # --- схема опор и обвязки ---
    v = View(c, 170, 158, 20)
    B = lambda y: -y
    text(c, 170 + 37.5, 173, 'Схема опор и обвязки основания', 7.5, FB, anchor='c')
    for (x0, x1) in BLK_X:
        for (y0, y1) in BLK_Y:
            v.dots([(x0, B(y0)), (x1, B(y0)), (x1, B(y1)), (x0, B(y1))], step=0.9, fill=CONCRETE, color=GREY,
                   stroke=INK, slw=0.4, seed=int(x0 + y0))
    v.cut(0, B(0), W, B(T), x=False)
    v.cut(0, B(D - T), W, B(D), x=False)
    for x0 in (0, (W - T) / 2, W - T):
        v.cut(x0, B(T), x0 + T, B(D - T), x=False)
    v.line(0, B(0), W, B(D), color=ACCENT2, lw=0.3, dash=(1.5, 1))
    v.text(1000, B(330), 'диагонали ' + '%d' % round(math.hypot(W, D)), 5.5, color=ACCENT2, rot=-21.8)
    v.dim_h(0, W, 160, 0, 0)
    v.dim_h(BLK_X[0][0], BLK_X[0][1], -760, B(D), B(D), txt='200')
    v.dim_h(BLK_X[0][1], BLK_X[1][0], -760, None, None, txt='430')
    v.dim_h(BLK_X[1][0], BLK_X[1][1], -760, B(D), B(D), txt='200')
    v.dim_h(BLK_X[1][1], BLK_X[2][0], -760, None, None, txt='430')
    v.dim_h(BLK_X[2][0], BLK_X[2][1], -760, B(D), B(D), txt='200')
    v.dim_v(B(0), B(D), -140, 0, 0)
    v.dim_v(B(BLK_Y[0][0]), B(BLK_Y[0][1]), 1620, W, W, txt='200', tside='right')
    v.dim_v(B(BLK_Y[1][0]), B(BLK_Y[1][1]), 1620, W, W, txt='200', tside='right')
    v.text(-130, B(-60), 'стена дома ↑', 5.5, color=GREY)
    text(c, 170, 114, 'Опоры 200×200×200 — 6 шт., отступ 20 мм от наружных граней обвязки.\n'
                      'Верх опор в одном уровне, +0.150 от земли (допуск ±2 мм).\n'
                      'На каждую опору — 2 слоя гидроизола; обвязку крепить к опорам\n'
                      'уголком и дюбелем 8×60 (по 1 на опору).', 5.8)
    # --- схема настила пола ---
    v2 = View(c, 170, 88, 20)
    text(c, 170 + 37.5, 94, 'Настил пола (вид сверху)', 7.5, FB, anchor='c')
    v2.rect(0, B(0), W, B(D), fill=WOOD_CUT, stroke=INK, lw=0.4)
    for i in range(N_FLOOR):
        x0 = i * (FLOOR_W + FLOOR_GAP)
        v2.rect(x0, B(0), x0 + FLOOR_W, B(D), fill=HexColor('#E3C590'), stroke=INK, lw=0.3)
    v2.dim_h(0, FLOOR_W, -720, B(D), B(D), txt='95')
    v2.dim_h(FLOOR_W, FLOOR_W + FLOOR_GAP, -720, B(D), B(D), txt='5')
    v2.dim_h(0, W, -840, None, None, txt='15 досок 28×95 по 600 мм')
    text(c, 170, 40, 'Доски укладывать поперёк (от стены к дверям) с зазором ~5 мм —\n'
                     'через щели уходит вода и земля с инструмента, пол проветривается.\n'
                     'Крепление: 2 оцинк. самореза 4.5×50 на каждую опору доски.', 5.8)
    # список позиций
    part_list(c, 113, 183, [str(i) for i in range(1, 17)], 'Позиции каркаса')


# ============================================================ ЛИСТ 6
def sheet_panels(c, num, total):
    tblock(c, num, total, 'Каркас: панели стен, стропило', '1:25, 1:10')
    heading(c, num, 'Панели стен и стропило', 'Панели собираются на ровной площадке, затем ставятся на пол '
                                              'и стягиваются саморезами 5×90 шаг 300 · вид изнутри')
    y0 = 92
    # --- задняя панель ---
    v = View(c, 33, y0, 25)
    text(c, 33 + 30, 183, 'Задняя панель (поз. 4, 5)', 7.5, FB, anchor='c')
    v.cut(0, 0, W, T, x=False)
    v.cut(0, H_BACK - T, W, H_BACK, x=False)
    for x0 in STUDS_X:
        v.cut(x0, T, x0 + T, H_BACK - T, x=False)
    v.rect(T, 0, 750, H_BACK, fill=None, stroke=OSB, lw=0.6, dash=(2, 1.2))
    v.rect(750, 0, W - T, H_BACK, fill=None, stroke=OSB, lw=0.6, dash=(2, 1.2))
    v.text(400, 1050, 'ОСП 705×2040', 5, color=HexColor('#9A7A3A'), anchor='c')
    v.text(1100, 1050, 'ОСП 705×2040', 5, color=HexColor('#9A7A3A'), anchor='c')
    v.dim_h(0, W, -230, 0, 0)
    xs = [0] + [x + T / 2 for x in STUDS_X[1:-1]] + [W]
    for i in range(len(STUDS_X) - 1):
        a = STUDS_X[i] + (0 if i == 0 else T / 2)
        b = STUDS_X[i + 1] + (T if i == len(STUDS_X) - 2 else T / 2)
    v.dim_h(T / 2, STUDS_X[1] + T / 2, -110, 0, 0, txt='364')
    v.dim_h(STUDS_X[1] + T / 2, STUDS_X[2] + T / 2, -110, 0, 0, txt='364')
    v.dim_h(STUDS_X[2] + T / 2, STUDS_X[3] + T / 2, -110, 0, 0, txt='364')
    v.dim_h(STUDS_X[3] + T / 2, STUDS_X[4] + T / 2, -110, 0, 0, txt='364')
    v.dim_v(0, H_BACK, -130, 0, 0)
    v.dim_v(T, H_BACK - T, W + 120, W, W, tside='right')
    # --- передняя панель ---
    v = View(c, 112, y0, 25)
    text(c, 112 + 30, 183, 'Передняя панель (поз. 6–9)', 7.5, FB, anchor='c')
    v.cut(0, 0, W, T, x=False)
    zh0 = Z_HEADER[0] - Z_FLOOR
    zt0 = Z_TOPF[0] - Z_FLOOR
    v.cut(0, zh0, W, zt0, x=False)
    v.cut(0, zt0, W, H_FRONT, x=False)
    v.cut(0, T, FRONT_STUD, zh0, x=False)
    v.cut(W - FRONT_STUD, T, W, zh0, x=False)
    v.text(750, zh0 + 30, 'перемычка 45×95 на ребро', 4.8, anchor='c')
    v.text(750, 900, 'проём\n1310 × 1715', 6, color=GREY, anchor='c')
    v.dim_h(0, W, -230, 0, 0)
    v.dim_h(FRONT_STUD, W - FRONT_STUD, -110, T, T)
    v.dim_v(0, H_FRONT, -130, 0, 0)
    v.dim_v(T, zh0, W + 120, W, W, tside='right')
    v.dim_v(zh0, zt0, W + 120, W, W, txt='95', tside='right')
    # --- боковая панель ---
    v = View(c, 200, y0, 25)
    text(c, 200 + 12, 183, 'Боковая панель, 2 шт.', 7.5, FB, anchor='c')
    text(c, 200 + 12, 179, '(поз. 10–14; вторая — зеркально)', 5.5, F, GREY, anchor='c')
    tp = T / CA
    y_a, y_b = T, D - T
    zz = lambda y: zu(y) - Z_FLOOR
    v.cut(0, 0, D - 2 * T, T, x=False)
    for (y0_, y1_) in ((T, 2 * T), (D - 2 * T, D - T)):
        v.poly([(y0_ - T, T), (y1_ - T, T), (y1_ - T, zz(y1_) - tp), (y0_ - T, zz(y0_) - tp)], fill=WOOD_CUT,
               stroke=INK, lw=0.5)
    v.poly([(0, zz(y_a) - tp), (D - 2 * T, zz(y_b) - tp), (D - 2 * T, zz(y_b)), (0, zz(y_a))], fill=WOOD_CUT,
           stroke=INK, lw=0.5)
    v.cut(T, 1000, D - 3 * T, 1000 + T, x=False)
    v.dim_h(0, D - 2 * T, -230, 0, 0)
    v.dim_v(0, zz(y_a), -130, 0, 0)
    v.dim_v(0, zz(y_b), D - 2 * T + 120, D - 2 * T, D - 2 * T, tside='right')
    v.dim_v(0, 1000, 255, None, None, txt='1000', tside='right')
    v.text(-60, -400, '← к дому', 5, color=GREY)
    v.text(D - 2 * T - 30, zz(y_b) + 60, '%.1f°' % ALPHA_DEG, 5.5, color=ACCENT)
    text(c, 232, 160, 'Стойки (по длинной грани):\nзадняя  %d\nпередняя %d\nнаклонная обвязка %d\n'
                      'верх стоек — скос %.1f°' % (round(side_stud_lengths()[0]), round(side_stud_lengths()[1]),
                                                   round(side_stud_lengths()[2]), ALPHA_DEG), 5.5)
    # --- стропило 1:10 ---
    v = View(c, 40, 30, 10)
    text(c, 40 + 46, 77, 'Стропило 45×95, 5 шт. (поз. 15) — М 1:10', 7.5, FB, anchor='c')
    ya, yb = Y_RAF
    Y = lambda y: y - ya
    Zs = lambda z: z - zu(yb)
    bot = [(ya, zu(ya)), (0, Z_BACK_TOP), (T, Z_BACK_TOP), (T, zu(T)), (D - T, zu(D - T)), (D, Z_FRONT_TOP),
           (D, zu(D)), (yb, zu(yb))]
    pts = [(Y(y), Zs(z)) for y, z in bot] + [(Y(yb), Zs(zo(yb))), (Y(ya), Zs(zo(ya)))]
    v.poly(pts, fill=WOOD_CUT, stroke=INK, lw=0.6)
    for (y0_, y1_, ztop) in ((0, T, Z_BACK_TOP), (D - T, D, Z_FRONT_TOP)):
        v.rect(Y(y0_), Zs(ztop) - 60, Y(y1_), Zs(ztop), fill=None, stroke=GREY, lw=0.3, dash=(1, 1))
    v.text(Y(T / 2), Zs(Z_BACK_TOP) - 110, 'задняя\nобвязка', 4.8, color=GREY, anchor='c')
    v.text(Y(D - T / 2), Zs(Z_FRONT_TOP) - 110, 'передняя\nобвязка', 4.8, color=GREY, anchor='c')
    v.dim_h(Y(ya), Y(yb), Zs(zu(yb)) - 140, Zs(zu(ya)), Zs(zu(yb)), txt='%d (по горизонтали)' % (yb - ya))
    v.dim_h(Y(ya), Y(0), Zs(zo(ya)) + 60, Zs(zo(ya)), None, txt='50')
    v.dim_h(Y(0), Y(T), Zs(zo(ya)) + 60, None, None, txt='45')
    v.dim_h(Y(T), Y(D - T), Zs(zo(ya)) + 60, None, None, txt='%d' % (D - 2 * T))
    v.dim_h(Y(D - T), Y(D), Zs(zo(ya)) + 60, None, None, txt='45')
    v.dim_h(Y(D), Y(yb), Zs(zo(ya)) + 60, None, Zs(zo(yb)), txt='%d — свес' % (yb - D))
    text(c, 140, 62, 'Длина заготовки по скату — %d мм (взять 950).\n'
                     'Оба торца — отвесный рез (скос %.1f° от поперечного).\n'
                     'Два «седла» (запила) глубиной %.0f мм и шириной 45 мм:\n'
                     'на задней обвязке и на передней. Седло ложится на\n'
                     'обвязку всей площадью; крепление — 2 уголка 70×70\n'
                     'и саморезы 5×70 на каждую опору.\n'
                     'Крайние стропила лежат на наклонных обвязках\n'
                     'боковых стен и крепятся к ним саморезами шаг 300.' % (round(RAF_LEN), ALPHA_DEG, BIRD), 5.8)
    text(c, 222, 62, 'Шаблон: первое стропило\nпримерить по месту, по нему\nразметить остальные.', 5.8, F, ACCENT)

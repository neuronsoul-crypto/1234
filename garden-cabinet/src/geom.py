# -*- coding: utf-8 -*-
"""Геометрия эконом-шкафа (каркас 45×45, обшивка профнастилом С10). Все размеры в мм.

Система координат:
  x — ширина, слева направо, если смотреть на двери (x=0 — левая наружная грань каркаса);
  y — глубина, от стены дома к дверям (y=0 — задняя грань каркаса, y=D — передняя);
  z — высота от уровня земли.
"""
import math

W = 1000            # ширина каркаса
D = 500             # глубина каркаса
T = 45              # брусок 45×45
PN = 10             # высота волны профнастила С10
SHEET_W = 1150      # полная ширина листа С10 (рабочая 1100)
WAVE = 80           # шаг волны (условно, для чертежа)
HOUSE_Y = -50       # стена дома: зазор 40 мм до задней обшивки (−10…0)

# --- основание ---
Z_BLK = 150                                  # верх пескоблоков
BLK_X = [(20, 210), (405, 595), (790, 980)]  # пескоблок 390×190×188, длинной стороной вдоль y
BLK_Y = (55, 445)
BLK_H = 188
Z_BASE = (Z_BLK, Z_BLK + T)                  # обвязка 45×45: 150…195
OSB = 12
Z_FLOOR = Z_BASE[1] + OSB                    # пол 207
CLAD_Z0 = Z_BLK - 20                         # низ обшивки 130 (на 20 мм ниже обвязки)

# --- каркас ---
Z_F = 2100                                   # верх переднего прогона
Z_B = 2225                                   # верх заднего прогона
S = (Z_B - Z_F) / D                          # уклон 0.25
ALPHA = math.atan(S)
ALPHA_DEG = math.degrees(ALPHA)
CA = math.cos(ALPHA)
PURLIN_X = (-75, W + 75)                     # прогоны 1150 = ширина листа


def zu(y):
    """Низ кровельного листа (по наружным верхним кромкам прогонов)."""
    return Z_B - S * y


def zr(y):
    return zu(y) + PN


ROOF_Y = (HOUSE_Y + 10, D + 200)             # лист: от 10 мм до стены дома до свеса 200
ROOF_X = PURLIN_X
ROOF_LEN = (ROOF_Y[1] - ROOF_Y[0]) / CA

POST_B = (Z_FLOOR, Z_B - T)                  # задние стойки 207…2180
POST_F = (Z_FLOOR, Z_F - T)                  # передние стойки 207…2055
Z_GIRT = (Z_FLOOR + 1250 - T, Z_FLOOR + 1250)   # ригели 1412…1457 (на них держатели)
Z_HEADER = (1955, 2000)                      # перемычка над дверями
Z_THR = (Z_FLOOR, Z_FLOOR + T)               # порог 207…252
OPEN_X = (T, W - T)                          # проём 910
OPEN_Z = (Z_THR[1], Z_HEADER[0])             # 252…1955 (1703)
VENT_Z = (Z_HEADER[1], Z_F - T)              # продух над дверями 2000…2055

# --- двери (накладные) ---
SEAL = 5
DOOR_Y = (D + SEAL, D + SEAL + T)            # рамка створки 505…550
SHEET_DOOR_Y = (DOOR_Y[1], DOOR_Y[1] + PN)   # лист 550…560
DOOR_Z = (160, Z_HEADER[1] + 20)             # лист: 160…2020 (низ — фартук ниже порога)
FRAME_Z = (Z_THR[0] - 2, DOOR_Z[1])          # рамка 205…2020
DOOR_L = (2, 498)                            # рамка левой створки
DOOR_R = (502, 998)                          # рамка правой
SHEET_L = (2, 498)                           # лист левой
SHEET_R = (430, 998)                         # лист правой — заходит на левую на 68 мм (нащельник)
DOOR_W = DOOR_L[1] - DOOR_L[0]               # 496
DOOR_H = DOOR_Z[1] - DOOR_Z[0]               # 1860
FRAME_H = FRAME_Z[1] - FRAME_Z[0]            # 1815
RAIL_BOT = (FRAME_Z[0], FRAME_Z[0] + T)
RAIL_TOP = (FRAME_Z[1] - T, FRAME_Z[1])
_m = (FRAME_Z[0] + FRAME_Z[1]) / 2
RAIL_MID = (_m - T / 2, _m + T / 2)
HINGE_Z = [(RAIL_BOT[0] + RAIL_BOT[1]) / 2, (RAIL_MID[0] + RAIL_MID[1]) / 2, (RAIL_TOP[0] + RAIL_TOP[1]) / 2]

# --- обшивка ---
BACK_SHEET = dict(x=(-PN, W + PN), z=(CLAD_Z0, Z_B - 5))
SIDE_SHEET_Y = (-PN, D)

# --- оснащение ---
# стеллаж в правой секции: 2 стойки 45×45 и 3 полки 345×410 из ОСП
RACK_X = (610, 655)                          # стойки стеллажа
RACK_Y = [(T, 2 * T), (D - 2 * T, D - T)]    # задняя и передняя стойка
RACK_H = 1350                                # высота стоек от пола
RACK_SHELF_X = (RACK_X[1], W)                # полка 345 мм: от стойки стеллажа до обшивки
RACK_SHELF_Y = (T, D - T)                    # глубина 410 (между стойками каркаса)
RACK_SHELF_H = [450, 900, 1350]              # низ полок от пола
RACK_SHELF_Z = [Z_FLOOR + h for h in RACK_SHELF_H]
CLEAT_R_X = (W - T, W)                       # опорный брусок у правой стены — в плоскости стоек каркаса
TOOLS_X = (T, RACK_X[0])                     # секция для длинного инструмента, 565 мм
H_TOTAL = zr(ROOF_Y[0])


def side_top(y):
    """Верх боковой обшивки."""
    if y <= T:
        return Z_B - T
    if y >= D - T:
        return Z_F - T
    return zu(y)


# --- раскрой профнастила: (назначение, длина листа, что выкраивается) ---
SHEETS_PN = [
    ('Задняя стена', BACK_SHEET['z'][1] - BACK_SHEET['z'][0], 'обрезать по ширине до %d' % (W + 2 * PN)),
    ('Боковые стены', Z_B - T - CLAD_Z0, 'распустить вдоль на 2 полосы по 575, верх — по скату'),
    ('Двери', DOOR_H, 'распустить вдоль: 496 (левая) и 568 (правая)'),
    ('Кровля', ROOF_LEN, 'целиком'),
]


def door_clearance():
    return zu(ROOF_Y[1]) - DOOR_Z[1]


if __name__ == '__main__':
    print('alpha %.2f°' % ALPHA_DEG, 'roof len', round(ROOF_LEN), 'H', round(H_TOTAL))
    print('door', DOOR_W, DOOR_H, 'frame', FRAME_H, 'open', OPEN_X[1] - OPEN_X[0], OPEN_Z[1] - OPEN_Z[0])
    print('door clearance under eave', round(door_clearance()))
    print('posts', POST_B[1] - POST_B[0], POST_F[1] - POST_F[0])
    for s in SHEETS_PN:
        print(s[0], round(s[1]))
    print('total sheet length', round(sum(s[1] for s in SHEETS_PN)))

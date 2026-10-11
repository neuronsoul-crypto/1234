# -*- coding: utf-8 -*-
"""Геометрия шкафа. Все размеры в мм.

Система координат:
  x — ширина, слева направо, если смотреть на двери (x=0 — левая наружная грань каркаса);
  y — глубина, от стены дома к дверям (y=0 — задняя грань каркаса, y=600 — передняя);
  z — высота от уровня земли (z=0 — планировочная отметка земли).
"""
import math

# --- основные габариты каркаса ---
W = 1500            # ширина каркаса
D = 600             # глубина каркаса
T = 45              # сечение бруска каркаса стен 45×45
CL = 20             # толщина наружной обшивки
HOUSE_Y = -60       # плоскость стены дома (зазор 40 мм до обшивки)

# --- фундамент и основание ---
Z_BLK = 150                     # верх бетонных опор над землёй
BLK = 200                       # опора 200×200×200
BLK_X = [(20, 220), (650, 850), (1280, 1480)]
BLK_Y = [(20, 220), (380, 580)]
BASE_H = 95                     # обвязка 45×95 на ребро
Z_BASE_TOP = Z_BLK + BASE_H     # 245
FLOOR_T = 28
Z_FLOOR = Z_BASE_TOP + FLOOR_T  # 273 — чистый пол
N_FLOOR = 15
FLOOR_W = 95
FLOOR_GAP = (W - N_FLOOR * FLOOR_W) / (N_FLOOR - 1)   # ≈5.4 мм

# --- стены ---
H_BACK = 2040                   # высота задней панели (от пола)
H_FRONT = 1900                  # высота передней панели
Z_BACK_TOP = Z_FLOOR + H_BACK   # 2313
Z_FRONT_TOP = Z_FLOOR + H_FRONT # 2173
STUDS_X = [0, 363.75, 727.5, 1091.25, 1455]   # левые грани стоек задней стены и стропил
FRONT_STUD = 95                 # крайние стойки передней стены 45×95 (95 по ширине)
HEADER_H = 95                   # перемычка 45×95 на ребро
Z_TOPF = (Z_FRONT_TOP - T, Z_FRONT_TOP)            # верхняя обвязка передней стены 2128…2173
Z_HEADER = (Z_TOPF[0] - HEADER_H, Z_TOPF[0])       # перемычка 2033…2128
OPEN_X = (FRONT_STUD, W - FRONT_STUD)              # 95…1405 (1310)
OPEN_Z = (Z_FLOOR + T, Z_HEADER[0])                # 318…2033 (1715)

# --- кровля ---
S = (Z_BACK_TOP - Z_FRONT_TOP) / (D - T)           # уклон 140/555 (линия: наруж. грань задней — внутр. грань передней обвязки)
ALPHA = math.atan(S)
ALPHA_DEG = math.degrees(ALPHA)
CA = math.cos(ALPHA)
RAF_H = 95
RAF_V = RAF_H / CA              # вертикальная высота стропила
OSB_T = 12
OSB_V = OSB_T / CA
ROOF_T = 8                      # подкладочный ковёр + гибкая черепица
ROOF_V = ROOF_T / CA
Y_RAF = (-50, 850)              # стропила: от 10 мм до стены дома до переднего свеса 250
Y_ROOF = (-50, 870)             # настил ОСП (над лобовой доской)
X_ROOF = (-100, 1600)           # боковые свесы 100 мм
FASCIA_Y = (850, 870)


def zu(y):
    """Низ стропила (линия опирания) в точке y."""
    return Z_BACK_TOP - S * y


def zo(y):
    """Низ настила ОСП (= верх стропила)."""
    return zu(y) + RAF_V


def zr(y):
    """Верх кровли (по черепице)."""
    return zu(y) + RAF_V + OSB_V + ROOF_V


RAF_LEN = (Y_RAF[1] - Y_RAF[0]) / CA          # длина стропила по скату
BIRD = T * S                                  # глубина «седла» ≈11 мм
ROOF_SLOPE_LEN = (Y_ROOF[1] - Y_ROOF[0]) / CA  # длина ската ОСП

FASCIA_Z = (zo(FASCIA_Y[1]) + OSB_V - 120, zo(FASCIA_Y[1]) + OSB_V)

# --- двери и фасад ---
POST_L = (-20, 25)              # петельные стойки 45×45
POST_R = (W - 25, W + 20)
POST_Y = (D, D + 45)
POST_Z = (130, 2145)
DOOR_L = (28, 748)
DOOR_R = (752, 1472)
DOOR_W = DOOR_L[1] - DOOR_L[0]   # 720
DOOR_Y = (D + 5, D + 45)          # 605…645 (уплотнитель 5 мм в обжатии)
DOOR_Z = (OPEN_Z[0] - 25, Z_HEADER[0] + 22)   # 293…2055
DOOR_H = DOOR_Z[1] - DOOR_Z[0]   # 1807
ASTR_X = (702.5, 797.5)          # нащельник 20×95 на правой створке
ASTR_Y = (D + 45, D + 65)
SKIRT_Z = (130, 275)            # цокольная доска 20×145
FRIEZE_Z = (DOOR_Z[1] + 10, 2155)   # фризовая доска 20×95 над отливом
CLAD_Z0 = 130                   # низ обшивки (на 20 мм ниже обвязки)
CLAD_STEP = 125                 # рабочая ширина «американки»

# рамка двери 20×95
DR = 95
DOOR_RAIL_TOP = (DOOR_Z[1] - DR, DOOR_Z[1])
DOOR_RAIL_BOT = (DOOR_Z[0], DOOR_Z[0] + DR)
_mid = (DOOR_Z[0] + DOOR_Z[1]) / 2
DOOR_RAIL_MID = (_mid - DR / 2, _mid + DR / 2)

# --- внутреннее оснащение ---
SHELF_Z = Z_FLOOR + 1750        # низ полки
SHELF_T = 20
SHELF_Y = (57, 57 + 290)
RAIL_Z = (Z_FLOOR + 1250, Z_FLOOR + 1250 + 95)   # рейка с держателями
LOW_RAIL_Z = (Z_FLOOR + 230, Z_FLOOR + 275)      # нижняя упорная рейка 20×45

# --- гибкие производные ---
H_TOTAL = zr(Y_ROOF[0])          # ≈2458
FLOOR_ABOVE_GROUND = Z_FLOOR

# --- водосток ---
GUT_R = 55
GUT_YC = FASCIA_Y[1] + 15 + GUT_R    # 940
GUT_ZTOP = 2160
PIPE_R = 37
PIPE_X = W + 20 + 5 + PIPE_R          # 1562


def side_stud_lengths():
    """Длины стоек боковой панели (по длинной грани) и верхней наклонной обвязки."""
    tp_v = T / CA
    back_long = (zu(T) - tp_v) - (Z_FLOOR + T)
    front_long = (zu(D - 2 * T) - tp_v) - (Z_FLOOR + T)
    top_len = (D - 2 * T) / CA
    return back_long, front_long, top_len


if __name__ == '__main__':
    print('alpha', round(ALPHA_DEG, 2), 'raf_len', round(RAF_LEN, 1), 'bird', round(BIRD, 1))
    print('H_total', round(H_TOTAL), 'eave', round(zo(870) + OSB_V), 'door top', DOOR_Z[1])
    print('zu(645)', round(zu(645), 1), 'roof slope len', round(ROOF_SLOPE_LEN))
    print('side studs', [round(v, 1) for v in side_stud_lengths()])
    print('door', DOOR_Z, DOOR_H, 'open', OPEN_Z, OPEN_Z[1]-OPEN_Z[0])
    print('clear: rafter end', round(zu(850) - DOOR_Z[1]), 'fascia', round(FASCIA_Z[0] - DOOR_Z[1]),
          'gutter', GUT_ZTOP - GUT_R - DOOR_Z[1])
    print('fascia z', [round(v) for v in FASCIA_Z], 'zr(940)', round(zr(940)))

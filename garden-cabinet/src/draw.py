# -*- coding: utf-8 -*-
"""Примитивы для чертежей на reportlab: виды в масштабе, размеры, выноски, изометрия."""
import math
from reportlab.lib.units import mm
from reportlab.lib.colors import HexColor, Color
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont

FONT_DIR = '/usr/share/fonts/truetype/dejavu/'
pdfmetrics.registerFont(TTFont('DV', FONT_DIR + 'DejaVuSans.ttf'))
pdfmetrics.registerFont(TTFont('DVB', FONT_DIR + 'DejaVuSans-Bold.ttf'))
pdfmetrics.registerFont(TTFont('DVS', FONT_DIR + 'DejaVuSerif.ttf'))
from reportlab.lib.fonts import addMapping
pdfmetrics.registerFontFamily('DV', normal='DV', bold='DVB', italic='DV', boldItalic='DVB')

F, FB = 'DV', 'DVB'

# --- палитра ---
INK = HexColor('#1E2329')
GREY = HexColor('#6B7280')
LIGHT = HexColor('#9CA3AF')
ACCENT = HexColor('#1F6F8B')        # акцент проекта (вода/защита)
ACCENT2 = HexColor('#C0392B')       # важное

WOOD_CUT = HexColor('#F1D6A4')
WOOD_CUT_X = HexColor('#A9834F')
WOOD = HexColor('#F6E7CB')
WOOD_EDGE = HexColor('#8A6A3E')
OSB = HexColor('#E4C07E')
CLAD = HexColor('#D9B27A')
MEMB = HexColor('#1F77B4')
UNDERLAY = HexColor('#8E44AD')
SHINGLE = HexColor('#3B3F45')
METAL = HexColor('#5D6D7E')
SEAL = HexColor('#111111')
SEALANT = HexColor('#D35400')
CONCRETE = HexColor('#C9C9C9')
GRAVEL = HexColor('#E3DCCB')
SOIL = HexColor('#8B7355')
HOUSE = HexColor('#E9E3D8')
HOUSE_H = HexColor('#B9AE9C')
MESH = HexColor('#2E9E5B')
STEEL = HexColor('#4B5563')

# фасадные цвета (внешний вид)
PAINT = HexColor('#7E9282')        # серо-зелёный (обшивка, двери)
PAINT_D = HexColor('#66796A')
TRIM = HexColor('#F3EFE6')         # белые наличники/стойки
ROOF = HexColor('#454A51')
ROOF_L = HexColor('#5A6068')


def shade(col, k):
    r, g, b = col.red * k, col.green * k, col.blue * k
    return Color(min(r, 1), min(g, 1), min(b, 1))


def text(c, x, y, s, size=7, font=F, color=INK, anchor='l'):
    """x, y в мм страницы. Поддерживает переносы строк."""
    c.setFont(font, size)
    c.setFillColor(color)
    lines = s.split('\n')
    for i, ln in enumerate(lines):
        yy = (y - i * size * 1.22 / mm * 1.0) * mm
        if anchor == 'l':
            c.drawString(x * mm, yy, ln)
        elif anchor == 'c':
            c.drawCentredString(x * mm, yy, ln)
        else:
            c.drawRightString(x * mm, yy, ln)


def text_w(s, size=7, font=F):
    return max(pdfmetrics.stringWidth(ln, font, size) for ln in s.split('\n')) / mm


class View:
    """Плоский вид: реальные координаты (a, b) в мм → страница. scale = 20 → М1:20."""

    def __init__(self, c, ox, oy, scale):
        self.c, self.ox, self.oy, self.k = c, ox, oy, 1.0 / scale

    def P(self, a, b):
        return (self.ox + a * self.k) * mm, (self.oy + b * self.k) * mm

    def pm(self, a, b):
        """координаты в мм страницы"""
        return self.ox + a * self.k, self.oy + b * self.k

    # --- базовые фигуры ---
    def _style(self, fill, stroke, lw, dash=None, alpha=None):
        c = self.c
        if fill is not None:
            c.setFillColor(fill)
        if stroke is not None:
            c.setStrokeColor(stroke)
        c.setLineWidth(lw)
        c.setDash(*dash) if dash else c.setDash()
        if alpha is not None:
            c.setFillAlpha(alpha)

    def poly(self, pts, fill=None, stroke=INK, lw=0.4, dash=None, close=True, alpha=None):
        c = self.c
        c.saveState()
        self._style(fill, stroke, lw, dash, alpha)
        p = c.beginPath()
        x, y = self.P(*pts[0])
        p.moveTo(x, y)
        for a, b in pts[1:]:
            p.lineTo(*self.P(a, b))
        if close:
            p.close()
        c.drawPath(p, stroke=1 if stroke is not None else 0, fill=1 if (fill is not None and close) else 0)
        c.restoreState()

    def rect(self, a0, b0, a1, b1, **kw):
        self.poly([(a0, b0), (a1, b0), (a1, b1), (a0, b1)], **kw)

    def line(self, a0, b0, a1, b1, color=INK, lw=0.4, dash=None, cap=0):
        c = self.c
        c.saveState()
        c.setStrokeColor(color)
        c.setLineWidth(lw)
        c.setLineCap(cap)
        c.setDash(*dash) if dash else c.setDash()
        c.line(*self.P(a0, b0), *self.P(a1, b1))
        c.restoreState()

    def polyline(self, pts, color=INK, lw=0.4, dash=None):
        self.poly(pts, fill=None, stroke=color, lw=lw, dash=dash, close=False)

    def circle(self, a, b, r, fill=None, stroke=INK, lw=0.4, page_r=False):
        c = self.c
        c.saveState()
        self._style(fill, stroke, lw)
        x, y = self.P(a, b)
        rr = r * mm if page_r else r * self.k * mm
        c.circle(x, y, rr, stroke=1 if stroke is not None else 0, fill=1 if fill is not None else 0)
        c.restoreState()

    def cut(self, a0, b0, a1, b1, fill=WOOD_CUT, lw=0.6, x=True):
        """Сечение бруса: заливка + диагональный крест (условное обозначение древесины в разрезе)."""
        self.rect(a0, b0, a1, b1, fill=fill, stroke=INK, lw=lw)
        if x:
            self.line(a0, b0, a1, b1, color=WOOD_CUT_X, lw=0.25)
            self.line(a0, b1, a1, b0, color=WOOD_CUT_X, lw=0.25)

    def hatch(self, pts, step=2.0, angle=45, color=HOUSE_H, lw=0.25, fill=None, stroke=None, slw=0.4):
        """Штриховка полигона; step — шаг в мм страницы."""
        c = self.c
        c.saveState()
        p = c.beginPath()
        p.moveTo(*self.P(*pts[0]))
        for a, b in pts[1:]:
            p.lineTo(*self.P(a, b))
        p.close()
        if fill is not None:
            c.setFillColor(fill)
            c.drawPath(p, stroke=0, fill=1)
        c.clipPath(p, stroke=0, fill=0)
        xs = [self.P(*q)[0] for q in pts]
        ys = [self.P(*q)[1] for q in pts]
        x0, x1, y0, y1 = min(xs), max(xs), min(ys), max(ys)
        c.setStrokeColor(color)
        c.setLineWidth(lw)
        L = (x1 - x0) + (y1 - y0)
        ang = math.radians(angle)
        dx, dy = math.cos(ang), math.sin(ang)
        nx, ny = -dy, dx
        cx, cy = (x0 + x1) / 2, (y0 + y1) / 2
        n = int(L / (step * mm)) + 2
        for i in range(-n, n + 1):
            ox, oy = cx + nx * i * step * mm, cy + ny * i * step * mm
            c.line(ox - dx * L, oy - dy * L, ox + dx * L, oy + dy * L)
        c.restoreState()
        if stroke is not None:
            self.poly(pts, fill=None, stroke=stroke, lw=slw)

    def dots(self, pts, step=1.6, color=GREY, r=0.18, fill=None, stroke=INK, slw=0.4, seed=1, circles=False):
        """Точечная/гравийная заливка полигона."""
        import random
        rnd = random.Random(seed)
        c = self.c
        c.saveState()
        p = c.beginPath()
        p.moveTo(*self.P(*pts[0]))
        for a, b in pts[1:]:
            p.lineTo(*self.P(a, b))
        p.close()
        if fill is not None:
            c.setFillColor(fill)
            c.drawPath(p, stroke=0, fill=1)
        c.clipPath(p, stroke=0, fill=0)
        xs = [self.P(*q)[0] for q in pts]
        ys = [self.P(*q)[1] for q in pts]
        x = min(xs)
        c.setFillColor(color)
        c.setStrokeColor(color)
        c.setLineWidth(0.25)
        while x < max(xs):
            y = min(ys)
            while y < max(ys):
                jx = rnd.uniform(-0.45, 0.45) * step * mm
                jy = rnd.uniform(-0.45, 0.45) * step * mm
                if circles:
                    c.circle(x + jx, y + jy, rnd.uniform(0.25, 0.55) * mm, stroke=1, fill=0)
                else:
                    c.circle(x + jx, y + jy, r * mm, stroke=0, fill=1)
                y += step * mm
            x += step * mm
        c.restoreState()
        if stroke is not None:
            self.poly(pts, fill=None, stroke=stroke, lw=slw)

    def ground(self, a0, a1, b=0, depth=60):
        """Линия земли с условной штриховкой."""
        self.hatch([(a0, b - depth), (a1, b - depth), (a1, b), (a0, b)], step=1.6, angle=45,
                   color=SOIL, lw=0.25)
        self.line(a0, b, a1, b, color=INK, lw=0.7)

    # --- надписи ---
    def text(self, a, b, s, size=6.5, font=F, color=INK, anchor='l', dx=0, dy=0, rot=0):
        x, y = self.pm(a, b)
        if rot:
            c = self.c
            c.saveState()
            c.translate((x + dx) * mm, (y + dy) * mm)
            c.rotate(rot)
            c.setFont(font, size)
            c.setFillColor(color)
            if anchor == 'c':
                c.drawCentredString(0, 0, s)
            elif anchor == 'r':
                c.drawRightString(0, 0, s)
            else:
                c.drawString(0, 0, s)
            c.restoreState()
        else:
            text(self.c, x + dx, y + dy, s, size, font, color, anchor)

    def note(self, a, b, dx, dy, s, size=6, color=INK, dot=True, shelf=True, right=None):
        """Выноска с полкой: от точки (a,b) до точки, смещённой на (dx,dy) мм страницы."""
        c = self.c
        x0, y0 = self.pm(a, b)
        x1, y1 = x0 + dx, y0 + dy
        if right is None:
            right = dx >= 0
        lines = s.split('\n')
        w = text_w(s, size)
        c.saveState()
        c.setStrokeColor(GREY)
        c.setLineWidth(0.3)
        c.line(x0 * mm, y0 * mm, x1 * mm, y1 * mm)
        if shelf:
            if right:
                c.line(x1 * mm, y1 * mm, (x1 + w + 1) * mm, y1 * mm)
            else:
                c.line(x1 * mm, y1 * mm, (x1 - w - 1) * mm, y1 * mm)
        if dot:
            c.setFillColor(INK)
            c.circle(x0 * mm, y0 * mm, 0.45 * mm, stroke=0, fill=1)
        c.restoreState()
        tx = x1 + 0.5 if right else x1 - 0.5
        # первая строка — над полкой, остальные — под ней
        text(c, tx, y1 + 0.6, lines[0], size, F, color, 'l' if right else 'r')
        if len(lines) > 1:
            text(c, tx, y1 - size * 0.36 - 0.4, '\n'.join(lines[1:]), size, F, color, 'l' if right else 'r')

    def marker(self, a, b, label, r=2.2, fill=ACCENT, color=None, dx=0, dy=0):
        """Номер в кружке (позиция/узел)."""
        c = self.c
        x, y = self.pm(a, b)
        x += dx
        y += dy
        c.saveState()
        c.setFillColor(fill)
        c.setStrokeColor(HexColor('#FFFFFF'))
        c.setLineWidth(0.5)
        c.circle(x * mm, y * mm, r * mm, stroke=1, fill=1)
        c.setFillColor(color or HexColor('#FFFFFF'))
        c.setFont(FB, r * 2.9)
        c.drawCentredString(x * mm, (y - r * 0.36) * mm, str(label))
        c.restoreState()

    # --- размеры ---
    def _tick(self, x, y, horiz=True):
        c = self.c
        L = 1.1
        c.line((x - L) * mm, (y - L) * mm, (x + L) * mm, (y + L) * mm)

    def dim_h(self, a0, a1, b_line, b0=None, b1=None, txt=None, size=6, color=INK, gap=1.0, tside='up'):
        """Горизонтальный размер. b0, b1 — откуда идут выносные линии (реальные коорд.)."""
        c = self.c
        x0, yl = self.pm(a0, b_line)
        x1, _ = self.pm(a1, b_line)
        c.saveState()
        c.setStrokeColor(color)
        c.setLineWidth(0.3)
        for a, bf in ((a0, b0), (a1, b1)):
            if bf is not None:
                xa, ya = self.pm(a, bf)
                s = 1 if yl > ya else -1
                c.line(xa * mm, (ya + s * gap) * mm, xa * mm, (yl + s * 1.5) * mm)
        c.line((x0 - 1.5) * mm, yl * mm, (x1 + 1.5) * mm, yl * mm)
        self._tick(x0, yl)
        self._tick(x1, yl)
        c.restoreState()
        if txt is None:
            txt = '%d' % round(abs(a1 - a0))
        w = text_w(txt, size)
        xm = (x0 + x1) / 2
        if w + 2 > abs(x1 - x0):
            xm = max(x0, x1) + 2 + w / 2
        yy = yl + 0.7 if tside == 'up' else yl - size * 0.36 - 0.9
        text(c, xm, yy, txt, size, F, color, 'c')

    def dim_v(self, b0, b1, a_line, a0=None, a1=None, txt=None, size=6, color=INK, gap=1.0, tside='left'):
        c = self.c
        xl, y0 = self.pm(a_line, b0)
        _, y1 = self.pm(a_line, b1)
        c.saveState()
        c.setStrokeColor(color)
        c.setLineWidth(0.3)
        for b, af in ((b0, a0), (b1, a1)):
            if af is not None:
                xa, ya = self.pm(af, b)
                s = 1 if xl > xa else -1
                c.line((xa + s * gap) * mm, ya * mm, (xl + s * 1.5) * mm, ya * mm)
        c.line(xl * mm, (y0 - 1.5) * mm, xl * mm, (y1 + 1.5) * mm)
        self._tick(xl, y0)
        self._tick(xl, y1)
        c.restoreState()
        if txt is None:
            txt = '%d' % round(abs(b1 - b0))
        w = text_w(txt, size)
        ym = (y0 + y1) / 2
        if w + 2 > abs(y1 - y0):
            ym = max(y0, y1) + 2 + w / 2
        c.saveState()
        xx = xl - 0.8 if tside == 'left' else xl + size * 0.36 + 0.9
        c.translate(xx * mm, ym * mm)
        c.rotate(90)
        c.setFont(F, size)
        c.setFillColor(color)
        c.drawCentredString(0, 0, txt)
        c.restoreState()

    def level(self, a, b, txt, size=6, right=True, L=8):
        """Высотная отметка (треугольник + полка)."""
        c = self.c
        x, y = self.pm(a, b)
        c.saveState()
        c.setStrokeColor(INK)
        c.setFillColor(INK)
        c.setLineWidth(0.3)
        h = 1.3
        p = c.beginPath()
        p.moveTo(x * mm, y * mm)
        p.lineTo((x - h * 0.7) * mm, (y + h) * mm)
        p.lineTo((x + h * 0.7) * mm, (y + h) * mm)
        p.close()
        c.drawPath(p, stroke=1, fill=0)
        sx = 1 if right else -1
        c.line(x * mm, (y + h) * mm, (x + sx * L) * mm, (y + h) * mm)
        c.line(x * mm, y * mm, x * mm, (y + h + 0.01) * mm)
        c.restoreState()
        text(c, x + (0.4 if right else -0.4), y + h + 0.6, txt, size, F, INK, 'l' if right else 'r')


class Axo:
    """Диметрическая проекция (ГОСТ 2.317): ось x под 7°, ось y под 41° с коэффициентом 0.5."""

    def __init__(self, c, ox, oy, scale, ax=7.0, ay=41.4, ys=0.5):
        self.c, self.ox, self.oy, self.k = c, ox, oy, 1.0 / scale
        self.c1, self.s1 = math.cos(math.radians(ax)), math.sin(math.radians(ax))
        self.c2, self.s2 = ys * math.cos(math.radians(ay)), ys * math.sin(math.radians(ay))
        vx = self.c2 / self.c1
        self.V = (vx, 1.0, vx * self.s1 + self.s2)

    def uv(self, x, y, z):
        u = x * self.c1 - y * self.c2
        v = z - x * self.s1 - y * self.s2
        return u, v

    def P(self, x, y, z):
        u, v = self.uv(x, y, z)
        return (self.ox + u * self.k) * mm, (self.oy + v * self.k) * mm

    def pm(self, x, y, z):
        u, v = self.uv(x, y, z)
        return self.ox + u * self.k, self.oy + v * self.k

    def depth(self, p):
        return p[0] * self.V[0] + p[1] * self.V[1] + p[2] * self.V[2]

    def face(self, pts, fill, stroke=INK, lw=0.35, alpha=None):
        c = self.c
        c.saveState()
        if fill is not None:
            c.setFillColor(fill)
        if alpha is not None:
            c.setFillAlpha(alpha)
            c.setStrokeAlpha(alpha)
        if stroke is not None:
            c.setStrokeColor(stroke)
            c.setLineWidth(lw)
            c.setLineJoin(1)
        p = c.beginPath()
        p.moveTo(*self.P(*pts[0]))
        for q in pts[1:]:
            p.lineTo(*self.P(*q))
        p.close()
        c.drawPath(p, stroke=1 if stroke is not None else 0, fill=1 if fill is not None else 0)
        c.restoreState()

    def line(self, p0, p1, color=INK, lw=0.35, dash=None):
        c = self.c
        c.saveState()
        c.setStrokeColor(color)
        c.setLineWidth(lw)
        c.setDash(*dash) if dash else c.setDash()
        c.line(*self.P(*p0), *self.P(*p1))
        c.restoreState()

    @staticmethod
    def box_verts(x0, x1, y0, y1, z0, z1):
        return [(x0, y0, z0), (x1, y0, z0), (x1, y1, z0), (x0, y1, z0),
                (x0, y0, z1), (x1, y0, z1), (x1, y1, z1), (x0, y1, z1)]

    def hexa_faces(self, v):
        """Видимые грани шестигранника (вершины: низ 0-3, верх 4-7)."""
        idx = [(0, 1, 2, 3), (4, 5, 6, 7), (0, 1, 5, 4), (1, 2, 6, 5), (2, 3, 7, 6), (3, 0, 4, 7)]
        cen = [sum(p[i] for p in v) / 8 for i in range(3)]
        out = []
        for f in idx:
            pts = [v[i] for i in f]
            # нормаль методом Ньюэлла
            nx = ny = nz = 0.0
            for i in range(4):
                a, b = pts[i], pts[(i + 1) % 4]
                nx += (a[1] - b[1]) * (a[2] + b[2])
                ny += (a[2] - b[2]) * (a[0] + b[0])
                nz += (a[0] - b[0]) * (a[1] + b[1])
            fc = [sum(p[i] for p in pts) / 4 for i in range(3)]
            if nx * (fc[0] - cen[0]) + ny * (fc[1] - cen[1]) + nz * (fc[2] - cen[2]) < 0:
                nx, ny, nz = -nx, -ny, -nz
            if nx * self.V[0] + ny * self.V[1] + nz * self.V[2] > 1e-9:
                L = math.sqrt(nx * nx + ny * ny + nz * nz) or 1
                out.append((pts, (nx / L, ny / L, nz / L)))
        return out

    def solid(self, v, col, lw=0.35, stroke=INK, alpha=None):
        for pts, n in self.hexa_faces(v):
            # простое освещение: свет сверху-слева-спереди
            light = 0.62 + 0.22 * n[2] + 0.12 * n[1] - 0.10 * n[0]
            self.face(pts, shade(col, light / 0.84), stroke=stroke, lw=lw, alpha=alpha)

    def box(self, x0, x1, y0, y1, z0, z1, col, lw=0.35, stroke=INK, alpha=None):
        self.solid(self.box_verts(x0, x1, y0, y1, z0, z1), col, lw, stroke, alpha)


def tblock(c, num, total, title, scale='—'):
    """Рамка листа и основная надпись."""
    c.saveState()
    c.setStrokeColor(INK)
    c.setLineWidth(0.9)
    c.rect(15 * mm, 7 * mm, 275 * mm, 196 * mm)
    # основная надпись
    x0, y0, w, h = 185, 7, 105, 16
    c.setLineWidth(0.6)
    c.rect(x0 * mm, y0 * mm, w * mm, h * mm)
    c.line((x0 + 78) * mm, y0 * mm, (x0 + 78) * mm, (y0 + h) * mm)
    c.line(x0 * mm, (y0 + 8) * mm, (x0 + w) * mm, (y0 + 8) * mm)
    c.line((x0 + 91.5) * mm, y0 * mm, (x0 + 91.5) * mm, (y0 + 8) * mm)
    c.restoreState()
    text(c, x0 + 1.5, y0 + 11.2, 'Шкаф садовый пристенный', 7, FB)
    text(c, x0 + 1.5, y0 + 2.6, title, 6.3, F)
    text(c, x0 + 79, y0 + 13, 'Масштаб', 4.8, F, GREY)
    text(c, x0 + 79, y0 + 9.4, scale, 6.3, F)
    text(c, x0 + 79, y0 + 5, 'Лист', 4.8, F, GREY)
    text(c, x0 + 79, y0 + 1.6, str(num), 6.5, FB)
    text(c, x0 + 92.5, y0 + 5, 'Листов', 4.8, F, GREY)
    text(c, x0 + 92.5, y0 + 1.6, str(total), 6.5, F)


def heading(c, num, title, sub=None):
    text(c, 20, 195.5, '%s' % title, 13, FB, INK)
    if sub:
        text(c, 20, 190.2, sub, 7, F, GREY)


def column_notes(v, items, x_col, right=True, size=5.4, gap=1.2, y_min=None, y_max=None):
    """Выноски, выровненные в колонку x_col (мм страницы) без наложений.
    items: (a, b, text) — точка на виде и подпись."""
    lh = size * 1.22 / mm * 1.0
    capx = size * 0.36
    rows = []
    for a, b, t in items:
        xa, ya = v.pm(a, b)
        n = len(t.split('\n'))
        rows.append([ya, xa, a, b, t, capx + 0.6, (n - 1) * lh + 0.6])
    rows.sort(key=lambda r: -r[0])
    # прямой проход сверху вниз
    prev_bottom = None
    for r in rows:
        y = r[0]
        if y_max is not None:
            y = min(y, y_max - r[5])
        if prev_bottom is not None:
            y = min(y, prev_bottom - gap - r[5])
        r.append(y)
        prev_bottom = y - r[6]
    # если вылезли вниз — обратный проход
    if y_min is not None and rows and rows[-1][7] - rows[-1][6] < y_min:
        nxt_top = None
        for r in reversed(rows):
            y = r[7]
            lo = y_min + r[6] if nxt_top is None else nxt_top + gap + r[6]
            y = max(y, lo)
            r[7] = y
            nxt_top = y + r[5]
    for r in rows:
        ya, xa, a, b, t, up, down, y = r
        v.note(a, b, x_col - xa, y - ya, t, size=size, right=right)

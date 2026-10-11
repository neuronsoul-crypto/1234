# -*- coding: utf-8 -*-
"""Общие помощники для текстовых листов: абзацы и таблицы."""
from reportlab.lib.units import mm
from reportlab.lib.colors import HexColor
from reportlab.platypus import Table, TableStyle, Paragraph
from reportlab.lib.styles import ParagraphStyle
from draw import F, FB, INK

PS = ParagraphStyle('p', fontName=F, fontSize=6.6, leading=8.4, textColor=INK)
PSs = ParagraphStyle('ps', fontName=F, fontSize=5.8, leading=7.0, textColor=INK)
PSb = ParagraphStyle('pb', fontName=FB, fontSize=6.6, leading=8.4, textColor=INK)
NB = ' '


def para(c, x, y_top, w, html, style=PS):
    p = Paragraph(html, style)
    _, h = p.wrap(w * mm, 500 * mm)
    p.drawOn(c, x * mm, y_top * mm - h)
    return h / mm


def table(c, x, y_top, data, colw, style_cmds, font_size=5.8, pad=1.4):
    t = Table(data, colWidths=[w * mm for w in colw])
    base = [('FONT', (0, 0), (-1, -1), F, font_size),
            ('LEADING', (0, 0), (-1, -1), font_size * 1.18),
            ('TOPPADDING', (0, 0), (-1, -1), pad),
            ('BOTTOMPADDING', (0, 0), (-1, -1), pad),
            ('LEFTPADDING', (0, 0), (-1, -1), 2),
            ('RIGHTPADDING', (0, 0), (-1, -1), 2),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
            ('LINEBELOW', (0, 0), (-1, -1), 0.25, HexColor('#D5D9DE'))]
    t.setStyle(TableStyle(base + style_cmds))
    w, h = t.wrap(0, 0)
    t.drawOn(c, x * mm, y_top * mm - h)
    return h / mm


def money(x):
    return '{:,}'.format(int(round(x))).replace(',', NB)

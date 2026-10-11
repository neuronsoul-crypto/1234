# -*- coding: utf-8 -*-
"""Сборка PDF-проекта эконом-шкафа: python3 build.py [out.pdf]"""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import A4, landscape
from draw import *
import sheets_a as SA
import sheets_b as SB
import sheets_c as SC
import sheets_d as SD

SHEETS = [
    (SC.sheet_cover, 'Титульный лист'),
    (SC.sheet_general, 'Общие данные, защита от воды'),
    (SA.sheet_views, 'Виды и габариты'),
    (SA.sheet_sections, 'Разрезы 1-1 и 2-2'),
    (SB.sheet_frame, 'Каркас и основание'),
    (SB.sheet_nodes12, 'Узлы 1, 2'),
    (SB.sheet_nodes34, 'Узлы 3, 4'),
    (SB.sheet_doors, 'Двери, раскрой профнастила'),
    (SD.sheet_interior, 'Внутреннее оснащение'),
    (SC.sheet_spec, 'Спецификация и раскрой'),
    (SC.sheet_estimate, 'Смета (цены Крыма)'),
    (SC.sheet_assembly, 'Порядок сборки'),
    (SC.sheet_care, 'Проверка и обслуживание'),
]
SC.SHEET_TITLES[:] = [t for _, t in SHEETS]

OUT = sys.argv[1] if len(sys.argv) > 1 else 'out.pdf'
c = canvas.Canvas(OUT, pagesize=landscape(A4))
c.setTitle('Шкаф садовый пристенный — эконом-вариант')
c.setAuthor('Проект для самостоятельного строительства')
c.setSubject('Пристенный водонепроницаемый шкаф для садового инвентаря из профнастила, бюджет до 20 000 ₽')
for i, (fn, title) in enumerate(SHEETS):
    fn(c, i + 1, len(SHEETS))
    c.bookmarkPage('p%d' % (i + 1))
    c.addOutlineEntry('%d. %s' % (i + 1, title), 'p%d' % (i + 1), level=0)
    c.showPage()
c.save()
print('saved', OUT)

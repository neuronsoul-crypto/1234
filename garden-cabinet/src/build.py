# -*- coding: utf-8 -*-
"""Сборка PDF-проекта: python3 build.py [out.pdf]"""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import A4, landscape
from draw import *
import sheets_views as SV
import sheets_frame as SF
import sheets_nodes as SN
import sheets_interior as SI
import sheets_text as ST

SHEETS = [
    (ST.sheet_cover, 'Титульный лист'),
    (ST.sheet_general, 'Общие данные, защита от воды'),
    (SV.sheet_views, 'Виды и габариты'),
    (SV.sheet_sections, 'Разрезы 1-1 и 2-2'),
    (SF.sheet_frame, 'Каркас и основание'),
    (SF.sheet_panels, 'Панели стен и стропило'),
    (SN.sheet_node1, 'Узел 1. Примыкание к дому'),
    (SN.sheet_node2, 'Узел 2. Карниз и водосток'),
    (SN.sheet_nodes34, 'Узлы 3, 4. Низ стены, порог'),
    (SN.sheet_doors, 'Узел 5 и двери'),
    (SI.sheet_interior, 'Внутреннее оснащение'),
    (ST.sheet_bom, 'Спецификация материалов'),
    (ST.sheet_cutlist, 'Раскрой деталей'),
    (ST.sheet_assembly, 'Порядок сборки'),
    (ST.sheet_care, 'Отделка и обслуживание'),
]
ST.SHEET_TITLES[:] = [t for _, t in SHEETS]

OUT = sys.argv[1] if len(sys.argv) > 1 else 'out.pdf'
only = [int(a) for a in sys.argv[2:]] if len(sys.argv) > 2 else None
c = canvas.Canvas(OUT, pagesize=landscape(A4))
c.setTitle('Шкаф садовый пристенный — проект')
c.setAuthor('Проект для самостоятельного строительства')
c.setSubject('Пристенный уличный водонепроницаемый шкаф для садового инвентаря')
for i, (fn, title) in enumerate(SHEETS):
    if only and (i + 1) not in only:
        continue
    fn(c, i + 1, len(SHEETS))
    c.bookmarkPage('p%d' % (i + 1))
    c.addOutlineEntry('%d. %s' % (i + 1, title), 'p%d' % (i + 1), level=0)
    c.showPage()
c.save()
print('saved', OUT)

# -*- coding: utf-8 -*-
"""Листы сметы: позиции с ценами Крыма, итог и варианты."""
from reportlab.lib.units import mm
from reportlab.lib.colors import HexColor
from reportlab.platypus import Paragraph
from draw import *
from sheets_text import table, para, PS, PSs
import prices as PR

NB = ' '


def money(x):
    return '{:,}'.format(int(round(x))).replace(',', NB)


def qty(q):
    return ('%g' % q).replace('.', ',')


SRC_COL = {'К': HexColor('#1F7A4D'), 'К*': HexColor('#1F7A4D'), 'Р': HexColor('#9A6B00'), 'О': GREY}


def est_table(c, x, y_top, groups, start_no):
    data = [['№', 'Наименование', 'Ед.', 'Кол.', 'Цена, ₽', 'Сумма, ₽', 'Ист.']]
    cmds = [('FONT', (0, 0), (-1, 0), FB, 5.6), ('BACKGROUND', (0, 0), (-1, 0), HexColor('#E7EDF1')),
            ('ALIGN', (2, 0), (3, -1), 'CENTER'), ('ALIGN', (4, 0), (5, -1), 'RIGHT'),
            ('ALIGN', (6, 0), (6, -1), 'CENTER')]
    no = start_no
    for g, rows in groups:
        s = sum(PR.rnd(q * p) for (_, _, q, p, _, _) in rows)
        data.append(['', g, '', '', '', money(s), ''])
        r = len(data) - 1
        cmds += [('SPAN', (1, r), (4, r)), ('FONT', (0, r), (-1, r), FB, 5.8),
                 ('TEXTCOLOR', (0, r), (-1, r), ACCENT), ('TOPPADDING', (0, r), (-1, r), 2.4)]
        for (name, unit, q, p, src, note) in rows:
            data.append([str(no), name, unit, qty(q), money(p) if p >= 10 else ('%g' % p).replace('.', ','),
                         money(PR.rnd(q * p)), src])
            rr = len(data) - 1
            cmds.append(('TEXTCOLOR', (6, rr), (6, rr), SRC_COL[src]))
            no += 1
    table(c, x, y_top, data, [6, 64, 10, 9, 14, 15, 8], cmds, font_size=5.4, pad=0.95)
    return no


def sheet_estimate(c, num, total):
    tblock(c, num, total, 'Смета на материалы (Крым)', '—')
    heading(c, num, 'Смета на материалы — цены Крыма',
            'Розница Симферополя и Крыма, цены собраны %s · К — крымский прайс, К* — пересчёт с крымского прайса, '
            'Р — розница РФ + 15 %%, О — оценка' % PR.DATE)
    G = PR.groups()
    left = G[:5]
    right = G[5:]
    n = est_table(c, 18, 186, left, 1)
    est_table(c, 155, 186, right, n)
    by_group, sub, reserve, tot = PR.totals()
    # итоговая плашка справа внизу
    x, y = 155, 52
    c.saveState()
    c.setFillColor(HexColor('#E7F1F5'))
    c.setStrokeColor(ACCENT)
    c.setLineWidth(0.6)
    c.roundRect(x * mm, (y - 23) * mm, 133 * mm, 25 * mm, 2 * mm, stroke=1, fill=1)
    c.restoreState()
    rows = [('Материалы', money(sub)), ('Доставка по Симферополю (оценка)', money(PR.DELIVERY)),
            ('Резерв на непредвиденное 10 %', money(reserve))]
    for i, (k, v) in enumerate(rows):
        text(c, x + 4, y - 4 - i * 4, k, 6.4)
        text(c, x + 78, y - 4 - i * 4, v + ' ₽', 6.4, F, INK, 'r')
    text(c, x + 4, y - 19, 'ИТОГО', 9, FB, ACCENT)
    text(c, x + 78, y - 19, money(tot) + ' ₽', 11, FB, ACCENT, 'r')
    para(c, x + 84, y - 2.5, 46, 'Без учёта работ, инструмента и расходников (диски, свёрла, кисти). '
                                 'Варианты экономии — лист %d.' % (num + 1), PSs)


def sheet_estimate_summary(c, num, total):
    tblock(c, num, total, 'Смета: итог, экономия, источники', '—')
    heading(c, num, 'Смета: итог, варианты экономии, источники цен')
    by_group, sub, reserve, tot = PR.totals()
    # сводка по группам
    text(c, 20, 182, 'Сводка по разделам', 8.5, FB)
    data = [['Раздел', 'Сумма, ₽', 'Доля']]
    for g, s in sorted(by_group, key=lambda r: -r[1]):
        data.append([g, money(s), '%d %%' % round(100.0 * s / sub)])
    data += [['Материалы, всего', money(sub), '100 %'],
             ['Доставка по Симферополю (оценка)', money(PR.DELIVERY), ''],
             ['Резерв на непредвиденное 10 %', money(reserve), ''],
             ['ИТОГО', money(tot), '']]
    n = len(data)
    cmds = [('FONT', (0, 0), (-1, 0), FB, 6.2), ('BACKGROUND', (0, 0), (-1, 0), HexColor('#E7EDF1')),
            ('ALIGN', (1, 0), (-1, -1), 'RIGHT'),
            ('FONT', (0, n - 4), (-1, n - 4), FB, 6.4), ('LINEABOVE', (0, n - 4), (-1, n - 4), 0.6, INK),
            ('FONT', (0, n - 1), (-1, n - 1), FB, 8), ('TEXTCOLOR', (0, n - 1), (-1, n - 1), ACCENT),
            ('LINEABOVE', (0, n - 1), (-1, n - 1), 0.8, ACCENT)]
    h = table(c, 20, 179, data, [62, 24, 14], cmds, font_size=6.2, pad=1.5)
    # крупная цифра
    y = 179 - h - 10
    text(c, 20, y, 'Ориентировочная стоимость материалов', 7, F, GREY)
    text(c, 20, y - 9, '≈ %d тыс. ₽' % round(tot / 1000.0), 22, FB, ACCENT)
    lo = round((tot - 5210 - 3073 - 1280 - 1300) / 1000.0)
    text(c, 20, y - 15, 'в экономном варианте — около %d тыс. ₽ (см. справа)' % lo, 6.4, F, GREY)
    para(c, 20, y - 19, 100,
         '<b>Самые дорогие разделы</b> — пиломатериалы (обшивка «американкой» и брусок) и кровля. '
         'Пиломатериалы выгоднее брать на базах (Лес Крым, Терем-Крым, ЗлатоЛес и др.), а не в '
         'строймаркетах: разница бывает 15–30 %. Метизы, петли и уплотнитель дешевле в крупных '
         'строймаркетах и на маркетплейсах с доставкой в Крым.', PS)

    # варианты
    x2 = 132
    text(c, x2, 182, 'Как сэкономить или улучшить', 8.5, FB)
    data = [['Вариант', 'Разница, ₽']]
    for t, d in PR.savings():
        data.append([Paragraph(t, PSs), ('−' if d < 0 else '+') + money(abs(d))])
    cmds = [('FONT', (0, 0), (-1, 0), FB, 6.2), ('BACKGROUND', (0, 0), (-1, 0), HexColor('#E7EDF1')),
            ('ALIGN', (1, 0), (1, -1), 'RIGHT'), ('FONT', (1, 1), (1, -1), FB, 6.4)]
    for i, (t, d) in enumerate(PR.savings()):
        cmds.append(('TEXTCOLOR', (1, i + 1), (1, i + 1), HexColor('#1F7A4D') if d < 0 else ACCENT2))
    h2 = table(c, x2, 179, data, [132, 24], cmds, font_size=6.2, pad=1.6)
    y2 = 179 - h2 - 8
    text(c, x2, y2, 'Перед покупкой', 8.5, FB)
    h3 = para(c, x2, y2 - 2.5, 156,
              '• Цены взяты с сайтов магазинов на %s; даты обновления прайсов на сайтах указаны не всегда, '
              'поэтому обзвоните 2–3 базы и сверьте актуальные цены и наличие.<br/>'
              '• Уточняйте сорт и влажность: брус и доска нужны <b>камерной сушки</b>, строганые, сорт АВ '
              '(для каркаса можно ВС).<br/>'
              '• Ендовный ковёр продаётся рулонами по 10 м² (13–14 тыс. ₽) — спросите отрез 1 м² у кровельщиков '
              'или купите вместе с соседями.<br/>'
              '• Щебень навалом дешевле (1 050–2 400 ₽/м³), но машиной от нескольких кубов; на 0.3 м³ удобнее '
              'мешки.' % PR.DATE, PS)
    y3 = y2 - 2.5 - h3 - 7
    text(c, x2, y3, 'Источники цен', 8.5, FB)
    html = '<br/>'.join('<font color="%s"><b>%s</b></font> — %s' % (
        '#1F7A4D' if k.startswith('К') else '#9A6B00', k, t) for k, t in PR.SOURCES)
    para(c, x2, y3 - 2.5, 156, html, PSs)

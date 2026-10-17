export type NavItem = { href: string; label: string; path: string; hint: string }

export const NAV: NavItem[] = [
  { href: '/raspisanie', label: 'Расписание', path: '/расписание', hint: 'Когда и в каком храме служба' },
  { href: '/hramy', label: 'Храмы', path: '/храмы', hint: 'Храм святой Нины и церковь «Нерушимая Стена»' },
  { href: '/novosti', label: 'Новости', path: '/новости', hint: 'Объявления и события прихода' },
  { href: '/arhiv', label: 'Архив', path: '/архив', hint: 'Фотографии служб, праздников и старой Гаспры' },
  { href: '/duhovenstvo', label: 'Духовенство', path: '/духовенство', hint: 'Священники прихода' },
  { href: '/tainstva', label: 'Таинства и требы', path: '/таинства', hint: 'Крещение, венчание, исповедь, отпевание, освящение' },
  { href: '/zapiski', label: 'Записки', path: '/записки', hint: 'Подать записку о здравии или о упокоении' },
  { href: '/pozhertvovaniya', label: 'Пожертвования', path: '/пожертвования', hint: 'Помочь приходу и реставрации храма' },
  { href: '/prihod', label: 'Приходская жизнь', path: '/приход', hint: 'Воскресная школа, хор, социальное служение' },
  { href: '/palomnikam', label: 'Паломникам', path: '/паломникам', hint: 'Как добраться, правила посещения, что рядом' },
  { href: '/kontakty', label: 'Контакты', path: '/контакты', hint: 'Адреса, телефоны, реквизиты' },
]

export const HEADER_NAV = ['/raspisanie', '/hramy', '/novosti', '/arhiv', '/zapiski'].map(
  (href) => NAV.find((n) => n.href === href)!,
)

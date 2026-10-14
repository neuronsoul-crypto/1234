/* =========================================================
   Расписание богослужений и новости.
   Данные лежат в data/schedule.json и data/news.json —
   именно эти файлы будет редактировать будущая админка.
   ========================================================= */
(function () {
  var MONTHS = ['январь', 'февраль', 'март', 'апрель', 'май', 'июнь', 'июль', 'август', 'сентябрь', 'октябрь', 'ноябрь', 'декабрь'];
  var MONTHS_GEN = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'];
  var WEEKDAYS = ['воскресенье', 'понедельник', 'вторник', 'среда', 'четверг', 'пятница', 'суббота'];
  var TYPES = {
    great: 'Великий праздник',
    patronal: 'Престольный праздник',
    feast: 'Праздник',
    memorial: 'Поминовение усопших'
  };

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  // "2026-10-14" -> локальная дата без сдвига часового пояса
  function parseDate(iso) {
    var p = String(iso).split('-');
    return new Date(+p[0], +p[1] - 1, +p[2]);
  }
  function today() {
    var d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), d.getDate());
  }
  function sameDay(a, b) { return a.getTime() === b.getTime(); }
  function humanDate(d) { return d.getDate() + ' ' + MONTHS_GEN[d.getMonth()] + ' ' + d.getFullYear(); }

  function load(url) {
    return fetch(url, { cache: 'no-cache' }).then(function (r) {
      if (!r.ok) throw new Error('HTTP ' + r.status);
      return r.json();
    });
  }

  function prepare(data) {
    var days = (data && data.days || []).map(function (d) {
      return Object.assign({}, d, { _date: parseDate(d.date), services: (d.services || []).slice().sort(function (a, b) {
        return String(a.time).localeCompare(String(b.time));
      }) });
    });
    days.sort(function (a, b) { return a._date - b._date; });
    return days;
  }

  function servicesHtml(services) {
    return services.map(function (s) {
      return '<li><time>' + esc(s.time) + '</time><span>' + esc(s.name) +
        (s.priest ? ' <small>— ' + esc(s.priest) + '</small>' : '') +
        (s.note ? ' <small>(' + esc(s.note) + ')</small>' : '') + '</span></li>';
    }).join('');
  }

  function errorHtml() {
    var local = location.protocol === 'file:';
    return '<div class="schedule-error">Не удалось загрузить расписание.' +
      (local ? '<br><small>Сайт открыт как файл с компьютера — запустите локальный сервер (см. README).</small>' : '<br><small>Обновите страницу или позвоните нам.</small>') +
      '</div>';
  }

  /* ---------- Главная: ближайшие дни ---------- */
  function renderUpcoming(el, days, limit) {
    var t = today();
    var next = days.filter(function (d) { return d._date >= t && d.services.length; }).slice(0, limit);
    if (!next.length) {
      el.innerHTML = '<div class="schedule-empty" style="grid-column:1/-1">Расписание на ближайшие дни скоро будет опубликовано.</div>';
      return next;
    }
    el.innerHTML = next.map(function (d) {
      var isToday = sameDay(d._date, t);
      return '<article class="up-day' + (isToday ? ' is-today' : '') + '">' +
        (isToday ? '<span class="badge">Сегодня</span>' : (d.type === 'patronal' || d.type === 'great' ? '<span class="badge badge--light">' + esc(TYPES[d.type]) + '</span>' : '')) +
        '<div class="up-day__date"><span class="up-day__num">' + d._date.getDate() + '</span>' +
        '<span class="up-day__meta"><b>' + WEEKDAYS[d._date.getDay()] + '</b>' + MONTHS_GEN[d._date.getMonth()] + '</span></div>' +
        (d.title ? '<div class="up-day__feast">' + esc(d.title) + '</div>' : '') +
        '<ul>' + servicesHtml(d.services) + '</ul></article>';
    }).join('');
    return next;
  }

  function renderNextService(el, days) {
    var now = new Date();
    var t = today();
    for (var i = 0; i < days.length; i++) {
      var d = days[i];
      if (d._date < t) continue;
      for (var j = 0; j < d.services.length; j++) {
        var s = d.services[j];
        var hm = String(s.time).split(':');
        var at = new Date(d._date.getFullYear(), d._date.getMonth(), d._date.getDate(), +hm[0] || 0, +hm[1] || 0);
        if (at >= now) {
          var when = sameDay(d._date, t) ? 'Сегодня' : (d._date.getDate() + ' ' + MONTHS_GEN[d._date.getMonth()] + ', ' + WEEKDAYS[d._date.getDay()]);
          el.innerHTML = '<span class="eyebrow">Ближайшее богослужение</span>' +
            '<div class="hero__next-body">' + esc(when) + ', ' + esc(s.time) + ' — ' + esc(s.name) +
            (d.title ? '<small>' + esc(d.title) + '</small>' : '') + '</div>';
          el.hidden = false;
          return;
        }
      }
    }
  }

  /* ---------- Страница расписания ---------- */
  function renderSchedule(root, data, days) {
    var list = root.querySelector('[data-schedule-list]');
    var updated = root.querySelector('[data-schedule-updated]');
    var note = root.querySelector('[data-schedule-note]');
    var chips = root.querySelectorAll('[data-filter]');
    var t = today();

    if (updated && data.updated) updated.textContent = 'Обновлено: ' + humanDate(parseDate(data.updated));
    if (note) {
      if (data.note) { note.querySelector('span').textContent = data.note; note.hidden = false; }
      else note.hidden = true;
    }

    function draw(filter) {
      var items = days.filter(function (d) {
        if (filter === 'all') return true;
        if (d._date < t) return false;
        if (filter === 'feasts') return !!d.type;
        return true;
      });
      if (!items.length) {
        list.innerHTML = '<div class="schedule-empty">' +
          (filter === 'all' ? 'Расписание пока не опубликовано.' : 'На ближайшее время богослужений в расписании нет. Новое расписание появится скоро.') +
          '</div>';
        return;
      }
      var html = '', month = -1, year = -1;
      items.forEach(function (d) {
        var m = d._date.getMonth(), y = d._date.getFullYear();
        if (m !== month || y !== year) {
          if (month !== -1) html += '</section>';
          month = m; year = y;
          html += '<section class="month"><h2 class="month__title">' + MONTHS[m] + (y !== t.getFullYear() ? ' ' + y : '') + '</h2>';
        }
        var cls = ['day'];
        if (d._date.getDay() === 0) cls.push('day--sunday');
        if (d.type) cls.push('day--' + d.type);
        if (sameDay(d._date, t)) cls.push('day--today');
        if (d._date < t) cls.push('day--past');
        html += '<article class="' + cls.join(' ') + '"' + (sameDay(d._date, t) ? ' id="today"' : '') + '>' +
          '<div class="day__date"><span class="day__num">' + d._date.getDate() + '</span>' +
          '<span class="day__wd"><b>' + WEEKDAYS[d._date.getDay()] + '</b>' + MONTHS_GEN[m] + '</span></div>' +
          '<div>' +
          (d.title || d.type ? '<div class="day__feast">' + esc(d.title || '') +
            (d.type && TYPES[d.type] ? '<span class="badge' + (d.type === 'patronal' || d.type === 'great' ? '' : ' badge--light') + '">' + esc(TYPES[d.type]) + '</span>' : '') +
            (sameDay(d._date, t) ? '<span class="badge">Сегодня</span>' : '') + '</div>'
            : (sameDay(d._date, t) ? '<div class="day__feast"><span class="badge" style="margin-left:0">Сегодня</span></div>' : '')) +
          (d.services.length ? '<ul class="services">' + servicesHtml(d.services) + '</ul>' : '<small class="services">Богослужений нет</small>') +
          '</div></article>';
      });
      html += '</section>';
      list.innerHTML = html;
    }

    chips.forEach(function (chip) {
      chip.addEventListener('click', function () {
        chips.forEach(function (c) { c.setAttribute('aria-pressed', String(c === chip)); });
        draw(chip.getAttribute('data-filter'));
      });
    });
    draw('upcoming');
  }

  /* ---------- Новости ---------- */
  function renderNews(el, data, limit) {
    var items = (data && data.items || []).slice().sort(function (a, b) { return a.date < b.date ? 1 : -1; });
    if (limit) items = items.slice(0, limit);
    if (!items.length) { el.innerHTML = '<p class="news-empty">Новостей пока нет.</p>'; return; }
    el.innerHTML = items.map(function (n) {
      var d = parseDate(n.date);
      var dd = ('0' + d.getDate()).slice(-2) + '.' + ('0' + (d.getMonth() + 1)).slice(-2) + '.' + d.getFullYear();
      return '<article class="news-card reveal is-visible">' +
        '<div class="news-card__body"><div class="news-card__date"><time datetime="' + esc(n.date) + '">' + dd + '</time></div>' +
        '<h3 class="news-card__title">' + esc(n.title) + '</h3>' +
        '<p class="news-card__text">' + esc(n.text) + '</p></div>' +
        (n.image ? '<div class="news-card__img"><img src="' + esc(n.image) + '" alt="" loading="lazy"></div>' : '') +
        '</article>';
    }).join('');
  }

  /* ---------- Запуск ---------- */
  var upcomingEl = document.querySelector('[data-upcoming]');
  var nextEl = document.querySelector('[data-next-service]');
  var scheduleRoot = document.querySelector('[data-schedule]');
  var newsEl = document.querySelector('[data-news]');

  if (upcomingEl || nextEl || scheduleRoot) {
    load('data/schedule.json').then(function (data) {
      var days = prepare(data);
      if (upcomingEl) renderUpcoming(upcomingEl, days, +upcomingEl.getAttribute('data-upcoming') || 4);
      if (nextEl) renderNextService(nextEl, days);
      if (scheduleRoot) renderSchedule(scheduleRoot, data, days);
    }).catch(function (err) {
      console.error('schedule:', err);
      if (upcomingEl) upcomingEl.innerHTML = errorHtml();
      if (scheduleRoot) scheduleRoot.querySelector('[data-schedule-list]').innerHTML = errorHtml();
    });
  }

  if (newsEl) {
    load('data/news.json').then(function (data) {
      renderNews(newsEl, data, +newsEl.getAttribute('data-news') || 0);
    }).catch(function (err) {
      console.error('news:', err);
      newsEl.innerHTML = '<p class="news-empty">Не удалось загрузить новости.</p>';
    });
  }
})();

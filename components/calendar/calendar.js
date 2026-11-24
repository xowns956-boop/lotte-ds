/* Lotte Kendo DS · Calendar 동작 (이 DS 구조 .k-calendar[data-ux-calendar] 전용)
   - 달 판을 그림(일요일 시작, 이전·다음 달 날짜는 흐리게 같이 보임)
   - ‹ ›: 이전·다음 달 / 날짜를 누르면 고름
   - 키보드: ← → 하루 · ↑ ↓ 일주일 · Home End 그 주 처음·끝 · PageUp PageDown 한 달 · Enter Space 고르기
   - 고르면: data-value(YYYY-MM-DD) 바뀜 · 판에 change 이벤트(detail = { value })
   - data-min · data-max 밖 날짜는 고를 수 없음 / data-today로 오늘 날짜를 바꿔 볼 수 있음(미리보기용)
   Kendo 위젯([data-role])은 Kendo가 그리고 동작시키므로 건드리지 않는다. */
(function () {
  'use strict';

  var WEEK = ['일', '월', '화', '수', '목', '금', '토'];
  var WEEK_FULL = ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'];
  var IC_PREV = '<path d="m15 18-6-6 6-6"/>';
  var IC_NEXT = '<path d="m9 18 6-6-6-6"/>';

  function svg(p) {
    return '<svg class="k-svg-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">' + p + '</svg>';
  }
  function pad(n) { return (n < 10 ? '0' : '') + n; }
  function fmt(d) { return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); }
  function parse(s) {
    var m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s || '');
    return m ? new Date(+m[1], +m[2] - 1, +m[3]) : null;
  }
  function same(a, b) { return !!a && !!b && fmt(a) === fmt(b); }
  function addDays(d, n) { return new Date(d.getFullYear(), d.getMonth(), d.getDate() + n); }
  function addMonths(d, n) {
    var t = new Date(d.getFullYear(), d.getMonth() + n, 1);
    var last = new Date(t.getFullYear(), t.getMonth() + 1, 0).getDate();
    return new Date(t.getFullYear(), t.getMonth(), Math.min(d.getDate(), last));
  }

  function state(cal) {
    if (!cal._uxCal) {
      var value = parse(cal.getAttribute('data-value'));
      var today = parse(cal.getAttribute('data-today')) || new Date();
      cal._uxCal = { value: value, today: today, focus: value || today };
    }
    var s = cal._uxCal;
    s.min = parse(cal.getAttribute('data-min'));
    s.max = parse(cal.getAttribute('data-max'));
    return s;
  }
  function allowed(s, d) {
    return !(s.min && fmt(d) < fmt(s.min)) && !(s.max && fmt(d) > fmt(s.max));
  }

  function render(cal, keepFocus) {
    var s = state(cal);
    var y = s.focus.getFullYear(), m = s.focus.getMonth();
    var first = new Date(y, m, 1);
    var start = addDays(first, -first.getDay());
    var lastDay = new Date(y, m + 1, 0);
    var weeks = Math.ceil((first.getDay() + lastDay.getDate()) / 7);
    var caption = y + '년 ' + (m + 1) + '월';

    var h = '<div class="k-header">' +
      '<button type="button" class="k-nav-prev k-button k-flat k-icon-button" aria-label="이전 달">' + svg(IC_PREV) + '</button>' +
      '<span class="k-nav-fast" aria-live="polite">' + caption + '</span>' +
      '<button type="button" class="k-nav-next k-button k-flat k-icon-button" aria-label="다음 달">' + svg(IC_NEXT) + '</button>' +
      '</div><div class="k-calendar-view k-calendar-monthview"><table class="k-content k-month" role="grid" aria-label="' + caption + '"><thead><tr>';
    for (var w = 0; w < 7; w++) h += '<th scope="col" abbr="' + WEEK_FULL[w] + '">' + WEEK[w] + '</th>';
    h += '</tr></thead><tbody>';
    for (var r = 0; r < weeks; r++) {
      h += '<tr>';
      for (var c = 0; c < 7; c++) {
        var d = addDays(start, r * 7 + c);
        var cls = [];
        if (d.getMonth() !== m) cls.push('k-other-month');
        if (same(d, s.today)) cls.push('k-today');
        if (same(d, s.value)) cls.push('k-state-selected');
        var ok = allowed(s, d);
        if (!ok) cls.push('k-state-disabled');
        var foc = same(d, s.focus);
        if (foc) cls.push('k-state-focused');
        h += '<td role="gridcell"' + (cls.length ? ' class="' + cls.join(' ') + '"' : '') +
          ' aria-selected="' + same(d, s.value) + '"' + (ok ? '' : ' aria-disabled="true"') + '>' +
          '<button type="button" class="k-link" tabindex="' + (foc ? '0' : '-1') + '" data-date="' + fmt(d) + '"' +
          ' aria-label="' + d.getFullYear() + '년 ' + (d.getMonth() + 1) + '월 ' + d.getDate() + '일 ' + WEEK_FULL[d.getDay()] + '"' +
          (same(d, s.today) ? ' aria-current="date"' : '') + '>' + d.getDate() + '</button></td>';
      }
      h += '</tr>';
    }
    h += '</tbody></table></div>';
    cal.innerHTML = h;
    if (keepFocus) focusDay(cal);
  }
  function focusDay(cal) {
    var b = cal.querySelector('td.k-state-focused > .k-link');
    if (b) b.focus();
  }
  function moveTo(cal, d) {
    var s = state(cal);
    s.focus = d;
    render(cal, true);
  }
  function select(cal, d) {
    var s = state(cal);
    if (!allowed(s, d)) return;
    s.value = d;
    s.focus = d;
    cal.setAttribute('data-value', fmt(d));
    render(cal, true);
    cal.dispatchEvent(new CustomEvent('change', { bubbles: true, detail: { value: fmt(d) } }));
  }

  function managed(el) { return el.closest('[data-role]'); }
  function calOf(el) {
    var cal = el.closest('.k-calendar[data-ux-calendar]');
    return cal && !managed(cal) ? cal : null;
  }

  document.addEventListener('click', function (e) {
    var cal = calOf(e.target);
    if (!cal) return;
    var s = state(cal);
    if (e.target.closest('.k-nav-prev')) { s.focus = addMonths(s.focus, -1); render(cal); return; }
    if (e.target.closest('.k-nav-next')) { s.focus = addMonths(s.focus, 1); render(cal); return; }
    var b = e.target.closest('.k-link[data-date]');
    if (b) select(cal, parse(b.getAttribute('data-date')));
  });

  document.addEventListener('keydown', function (e) {
    var b = e.target.closest && e.target.closest('.k-link[data-date]');
    var cal = b && calOf(b);
    if (!cal) return;
    var d = parse(b.getAttribute('data-date'));
    var n = null;
    switch (e.key) {
      case 'ArrowLeft': n = addDays(d, -1); break;
      case 'ArrowRight': n = addDays(d, 1); break;
      case 'ArrowUp': n = addDays(d, -7); break;
      case 'ArrowDown': n = addDays(d, 7); break;
      case 'Home': n = addDays(d, -d.getDay()); break;
      case 'End': n = addDays(d, 6 - d.getDay()); break;
      case 'PageUp': n = addMonths(d, -1); break;
      case 'PageDown': n = addMonths(d, 1); break;
      case 'Enter': case ' ': e.preventDefault(); select(cal, d); return;
      default: return;
    }
    e.preventDefault();
    moveTo(cal, n);
  });

  function init(root) {
    (root || document).querySelectorAll('.k-calendar[data-ux-calendar]').forEach(function (cal) {
      if (managed(cal) || cal._uxCal) return;
      render(cal);
    });
  }
  function setValue(cal, v) {
    var s = state(cal), d = parse(v);
    s.value = d;
    if (d) s.focus = d;
    if (d) cal.setAttribute('data-value', v); else cal.removeAttribute('data-value');
    render(cal);
  }

  window.LotteDS = window.LotteDS || {};
  window.LotteDS.initCalendar = init;
  window.LotteDS.calendar = {
    render: function (cal, keepFocus) { render(cal, keepFocus); },
    focus: focusDay,
    setValue: setValue,
    value: function (cal) { var s = state(cal); return s.value ? fmt(s.value) : ''; }
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', function () { init(); });
  else init();
})();

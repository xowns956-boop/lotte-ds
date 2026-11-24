/* Lotte Kendo DS · DatePicker 동작 (이 DS 구조 .ux-datepicker 전용, Calendar 동작이 먼저 있어야 함)
   - 칸을 누르면 달력이 열리고, 고른 날짜(없으면 오늘)에 키보드가 감
   - 날짜를 고르면: 칸 글자(YYYY-MM-DD) · 숨은 input 값 바뀜 → 닫고 칸으로 돌아감 · 상자에 change 이벤트(detail = { value })
   - Esc: 닫고 칸으로 / 바깥을 누르거나 Tab으로 나가면 닫음
   Kendo 위젯(.k-datepicker)은 Kendo가 동작시키므로 건드리지 않는다. */
(function () {
  'use strict';

  var open = null;

  function parts(box) {
    return {
      trigger: box.querySelector('.ux-datepicker-trigger'),
      text: box.querySelector('.ux-datepicker-value'),
      hidden: box.querySelector('input[type="hidden"]'),
      popup: box.querySelector('.k-calendar-container'),
      cal: box.querySelector('.k-calendar[data-ux-calendar]')
    };
  }
  function show(box) {
    if (open && open !== box) hide(open);
    var p = parts(box);
    if (p.trigger.disabled) return;
    p.popup.hidden = false;
    p.trigger.setAttribute('aria-expanded', 'true');
    open = box;
    if (window.LotteDS && LotteDS.calendar) {
      LotteDS.calendar.render(p.cal);
      LotteDS.calendar.focus(p.cal);
    }
  }
  function hide(box, back) {
    var p = parts(box);
    p.popup.hidden = true;
    p.trigger.setAttribute('aria-expanded', 'false');
    if (open === box) open = null;
    if (back) p.trigger.focus();
  }
  function sync(box) {
    var p = parts(box);
    var v = p.cal && p.cal.getAttribute('data-value');
    if (!p.text.hasAttribute('data-placeholder')) p.text.setAttribute('data-placeholder', p.text.textContent);
    p.text.textContent = v || p.text.getAttribute('data-placeholder');
    if (v) p.trigger.removeAttribute('data-empty'); else p.trigger.setAttribute('data-empty', '');
    if (p.hidden) p.hidden.value = v || '';
  }

  document.addEventListener('click', function (e) {
    var t = e.target.closest && e.target.closest('.ux-datepicker-trigger');
    var box = t && t.closest('.ux-datepicker');
    if (box && !box.closest('[data-role]')) {
      if (open === box) hide(box); else show(box);
      return;
    }
    // 달력 안에서 다시 그려져 떨어져 나간 요소는 바깥 클릭이 아님
    if (open && e.target.isConnected && !open.contains(e.target)) hide(open);
  });
  document.addEventListener('change', function (e) {
    var cal = e.target.closest && e.target.closest('.k-calendar[data-ux-calendar]');
    var box = cal && cal.closest('.ux-datepicker');
    if (!box || e.target !== cal) return;
    sync(box);
    hide(box, true);
    box.dispatchEvent(new CustomEvent('change', { bubbles: true, detail: { value: e.detail.value } }));
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && open) { e.preventDefault(); hide(open, true); }
  });
  document.addEventListener('focusin', function (e) {
    if (open && !open.contains(e.target)) hide(open);
  });

  function init(root) {
    (root || document).querySelectorAll('.ux-datepicker').forEach(function (box) {
      if (box.closest('[data-role]')) return;
      var p = parts(box);
      if (!p.trigger || !p.popup || !p.cal) return;
      p.popup.hidden = true;
      p.trigger.setAttribute('aria-expanded', 'false');
      sync(box);
    });
  }
  window.LotteDS = window.LotteDS || {};
  window.LotteDS.initDatePicker = init;
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', function () { init(); });
  else init();
})();

/* Lotte Kendo DS · Splitter 동작 (이 DS 구조 .k-splitter.k-splitter-vertical 전용)
   - 막대를 끌면 위 칸 높이가 바뀐다(%)
   - 막대에 포커스가 있을 때 ↑ ↓: 5%씩, Home · End: 위 칸 최소 · 최대
   - 처음 높이 data-splitter-size(%, 기본 50), 양쪽 최소 data-splitter-min(%, 기본 20) — 막대에 둔다
   - 바뀌면 막대에 change 이벤트(detail.size = 위 칸 %)
   Kendo 위젯(kendoSplitter)은 Kendo가 동작시키므로 건드리지 않는다(.k-splitter-vertical 클래스가 없는 구조). */
(function () {
  'use strict';

  var STEP = 5;

  function num(v, d) { var n = parseFloat(v); return isNaN(n) ? d : n; }
  function limits(bar) {
    var min = num(bar.getAttribute('data-splitter-min'), 20);
    return { min: min, max: 100 - min };
  }
  function set(bar, size, fire) {
    var box = bar.parentElement;
    var l = limits(bar);
    size = Math.round(Math.min(l.max, Math.max(l.min, size)) * 10) / 10;
    box.style.setProperty('--_k-sp-size', size + '%');
    bar.setAttribute('aria-valuenow', String(Math.round(size)));
    bar.setAttribute('aria-valuemin', String(l.min));
    bar.setAttribute('aria-valuemax', String(l.max));
    bar.setAttribute('aria-valuetext', '위 칸 ' + Math.round(size) + '%');
    if (fire) bar.dispatchEvent(new CustomEvent('change', { bubbles: true, detail: { size: size } }));
  }
  function current(bar) { return num(bar.getAttribute('aria-valuenow'), 50); }
  function isBar(el) {
    return el && el.matches && el.matches('.k-splitter.k-splitter-vertical > .k-splitbar-vertical');
  }

  function init(root) {
    (root || document).querySelectorAll('.k-splitter.k-splitter-vertical > .k-splitbar-vertical').forEach(function (bar) {
      if (bar._lotteSplit) return;
      bar._lotteSplit = true;
      if (!bar.hasAttribute('role')) bar.setAttribute('role', 'separator');
      if (!bar.hasAttribute('tabindex')) bar.tabIndex = 0;
      if (!bar.hasAttribute('aria-orientation')) bar.setAttribute('aria-orientation', 'horizontal');
      set(bar, num(bar.getAttribute('data-splitter-size'), 50), false);
    });
  }

  document.addEventListener('pointerdown', function (e) {
    var bar = e.target.closest && e.target.closest('.k-splitbar-vertical');
    if (!isBar(bar) || e.button !== 0) return;
    e.preventDefault();
    var box = bar.parentElement;
    bar.setPointerCapture(e.pointerId);
    bar.setAttribute('data-dragging', '');
    box.setAttribute('data-dragging', '');
    bar.focus({ preventScroll: true });
    function move(ev) {
      var r = box.getBoundingClientRect();
      if (r.height > 0) set(bar, (ev.clientY - r.top) / r.height * 100, false);
    }
    function up() {
      bar.removeAttribute('data-dragging');
      box.removeAttribute('data-dragging');
      bar.removeEventListener('pointermove', move);
      bar.removeEventListener('pointerup', up);
      bar.removeEventListener('pointercancel', up);
      set(bar, current(bar), true);
    }
    bar.addEventListener('pointermove', move);
    bar.addEventListener('pointerup', up);
    bar.addEventListener('pointercancel', up);
  });

  document.addEventListener('keydown', function (e) {
    var bar = e.target;
    if (!isBar(bar)) return;
    var l = limits(bar), now = current(bar), next = null;
    if (e.key === 'ArrowUp') next = now - STEP;
    else if (e.key === 'ArrowDown') next = now + STEP;
    else if (e.key === 'Home') next = l.min;
    else if (e.key === 'End') next = l.max;
    if (next === null) return;
    e.preventDefault();
    set(bar, next, true);
  });

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', function () { init(); });
  else init();
  window.LotteDS = window.LotteDS || {};
  window.LotteDS.initSplitter = init;
})();

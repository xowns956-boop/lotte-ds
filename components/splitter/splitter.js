/* Lotte Kendo DS · Splitter 동작 (이 DS 구조 .k-splitter.k-splitter-vertical 전용)
   - 막대를 끌면 위 칸 높이가 바뀐다
   - 막대에 포커스가 있을 때 ↑ ↓: 16씩(kendo-spacing-4), Shift + ↑ ↓: 64씩(kendo-spacing-16), Home · End: 위 칸 최소 · 최대
   - 위 · 아래 칸 최소 높이는 CSS(칸의 min-height, 160)를 따른다
   - 처음 위 칸 높이 data-splitter-size(%, 기본 50) — 막대에 둔다
   - aria-valuenow = 위 칸 높이, 바뀌면 막대에 change 이벤트(detail.size = 위 칸 높이)
   Kendo 위젯(kendoSplitter)은 Kendo가 동작시키므로 건드리지 않는다(.k-splitter-vertical 클래스가 없는 구조). */
(function () {
  'use strict';

  function num(v, d) { var n = parseFloat(v); return isNaN(n) ? d : n; }
  function token(name) { return num(getComputedStyle(document.documentElement).getPropertyValue(name), 0); }
  function panes(bar) { return { top: bar.previousElementSibling, bottom: bar.nextElementSibling, box: bar.parentElement }; }
  function limits(bar) {
    var p = panes(bar);
    var minTop = num(getComputedStyle(p.top).minHeight, 0);
    var minBottom = num(getComputedStyle(p.bottom).minHeight, 0);
    var room = p.box.getBoundingClientRect().height - bar.getBoundingClientRect().height;
    return { min: minTop, max: Math.max(minTop, room - minBottom) };
  }
  function set(bar, size, fire) {
    var p = panes(bar), l = limits(bar);
    size = Math.round(Math.min(l.max, Math.max(l.min, size)));
    p.box.style.setProperty('--_k-sp-size', size + 'px');
    bar.setAttribute('aria-valuenow', String(size));
    bar.setAttribute('aria-valuemin', String(Math.round(l.min)));
    bar.setAttribute('aria-valuemax', String(Math.round(l.max)));
    if (fire) bar.dispatchEvent(new CustomEvent('change', { bubbles: true, detail: { size: size } }));
  }
  function current(bar) { return panes(bar).top.getBoundingClientRect().height; }
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
      var room = panes(bar).box.getBoundingClientRect().height - bar.getBoundingClientRect().height;
      set(bar, room * num(bar.getAttribute('data-splitter-size'), 50) / 100, false);
    });
  }

  document.addEventListener('pointerdown', function (e) {
    var bar = e.target.closest && e.target.closest('.k-splitbar-vertical');
    if (!isBar(bar) || e.button !== 0) return;
    e.preventDefault();
    var box = bar.parentElement;
    var offset = e.clientY - bar.getBoundingClientRect().top;
    bar.setPointerCapture(e.pointerId);
    bar.setAttribute('data-dragging', '');
    box.setAttribute('data-dragging', '');
    function move(ev) { set(bar, ev.clientY - offset - box.getBoundingClientRect().top, false); }
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
    var step = token(e.shiftKey ? '--kendo-spacing-16' : '--kendo-spacing-4');
    var l = limits(bar), now = current(bar), next = null;
    if (e.key === 'ArrowUp') next = now - step;
    else if (e.key === 'ArrowDown') next = now + step;
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

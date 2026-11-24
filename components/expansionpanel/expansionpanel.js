/* Lotte Kendo DS · ExpansionPanel 동작 (.k-expander)
   - 제목 줄을 누르면(Enter Space 포함) 접고 폄: aria-expanded · .k-expanded · 내용 hidden
   - 상자에 change 이벤트(detail.expanded)
   Kendo 위젯([data-role])은 Kendo가 동작시키므로 건드리지 않는다. */
(function () {
  'use strict';
  function set(box, on) {
    var head = box.querySelector(':scope > .k-expander-header');
    var body = box.querySelector(':scope > .k-expander-content-wrapper');
    head.setAttribute('aria-expanded', String(on));
    box.classList.toggle('k-expanded', on);
    if (body) body.hidden = !on;
  }
  document.addEventListener('click', function (e) {
    var head = e.target.closest && e.target.closest('.k-expander > .k-expander-header');
    if (!head || head.closest('[data-role]') || head.disabled) return;
    var box = head.parentElement;
    var on = head.getAttribute('aria-expanded') !== 'true';
    set(box, on);
    box.dispatchEvent(new CustomEvent('change', { bubbles: true, detail: { expanded: on } }));
  });
  function init(root) {
    (root || document).querySelectorAll('.k-expander').forEach(function (box) {
      var head = box.querySelector(':scope > .k-expander-header');
      if (!head || box.closest('[data-role]')) return;
      set(box, head.getAttribute('aria-expanded') === 'true' || box.classList.contains('k-expanded'));
    });
  }
  window.LotteDS = window.LotteDS || {};
  window.LotteDS.initExpansionPanel = init;
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', function () { init(); });
  else init();
})();

/* Lotte Kendo DS · Drawer 동작
   - [data-drawer-toggle="ID"] 누르면 그 Drawer를 펼침(256) ↔ 아이콘 모드(48, .k-drawer-mini)로 바꾼다.
     버튼의 aria-expanded가 따라 바뀌고, Drawer에서 change 이벤트(detail.collapsed)가 난다.
   - 하위 메뉴가 있는 항목(button.k-drawer-item[aria-controls])을 누르면 하위 메뉴를 열고 닫는다(aria-expanded).
   - 아이콘 모드에서는 메뉴 이름을 말풍선(Tooltip, 오른쪽)으로 보여 준다.
   Kendo가 직접 만든 Drawer(data-role)는 건드리지 않는다. */
(function () {
  'use strict';

  function isMini(d) {
    return d.classList.contains('k-drawer-mini') || !!(d.parentElement && d.parentElement.closest('.k-drawer-mini'));
  }

  function syncTips(d) {
    var mini = isMini(d);
    d.querySelectorAll('.k-drawer-item').forEach(function (it) {
      var txt = it.querySelector('.k-item-text');
      if (mini && txt) {
        it.setAttribute('data-tooltip', txt.textContent.trim());
        it.setAttribute('data-tooltip-side', 'right');
        it.setAttribute('data-drawer-tip', '');
      } else if (it.hasAttribute('data-drawer-tip')) {
        it.removeAttribute('data-tooltip');
        it.removeAttribute('data-tooltip-side');
        it.removeAttribute('data-drawer-tip');
      }
    });
  }

  function drawers() {
    return [].slice.call(document.querySelectorAll('.k-drawer')).filter(function (d) { return !d.closest('[data-role]'); });
  }

  document.addEventListener('click', function (e) {
    var tg = e.target.closest('[data-drawer-toggle]');
    if (tg) {
      var d = document.getElementById(tg.getAttribute('data-drawer-toggle'));
      if (!d || d.closest('[data-role]')) return;
      var collapsed = d.classList.toggle('k-drawer-mini');
      document.querySelectorAll('[data-drawer-toggle="' + d.id + '"]').forEach(function (b) {
        b.setAttribute('aria-expanded', String(!collapsed));
      });
      syncTips(d);
      d.dispatchEvent(new CustomEvent('change', { bubbles: true, detail: { collapsed: collapsed } }));
      return;
    }
    var it = e.target.closest('.k-drawer button.k-drawer-item[aria-controls]');
    if (it && !it.closest('[data-role]')) {
      var sub = document.getElementById(it.getAttribute('aria-controls'));
      if (!sub) return;
      var open = it.getAttribute('aria-expanded') !== 'true';
      it.setAttribute('aria-expanded', String(open));
      sub.hidden = !open;
    }
  });

  function init() { drawers().forEach(syncTips); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();

  window.LotteDS = window.LotteDS || {};
  window.LotteDS.syncDrawer = function (d) { (d ? [d] : drawers()).forEach(syncTips); };
})();

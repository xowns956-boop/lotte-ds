/* Lotte Kendo DS · Tabs 동작 (이 DS 구조: .k-tabstrip 안 button.k-link[role="tab"])
   - 탭을 누르면 그 탭을 고르고 연결된 내용 칸(aria-controls)만 보인다.
   - 키보드: ← → 이웃 탭, Home End 처음·끝 (고르면서 이동, 비활성 탭은 건너뜀)
   - 고르면 .k-tabstrip에서 change 이벤트(detail.tab = 고른 button)
   Kendo 위젯(data-role="tabstrip")은 Kendo가 동작시키므로 건드리지 않는다. */
(function () {
  'use strict';

  function tabsOf(strip) {
    return Array.prototype.slice.call(strip.querySelectorAll('.k-tabstrip-items [role="tab"]'));
  }
  function usable(tab) {
    return !tab.disabled && tab.getAttribute('aria-disabled') !== 'true';
  }
  function select(strip, tab, focus) {
    if (!tab || !usable(tab)) return;
    tabsOf(strip).forEach(function (t) {
      var on = t === tab;
      t.setAttribute('aria-selected', String(on));
      t.tabIndex = on ? 0 : -1;
      var li = t.closest('.k-item');
      if (li) { li.classList.toggle('k-state-active', on); li.classList.toggle('k-active', on); }
      var panel = document.getElementById(t.getAttribute('aria-controls'));
      if (panel) { panel.hidden = !on; panel.classList.toggle('k-state-active', on); }
    });
    if (focus) tab.focus();
    strip.dispatchEvent(new CustomEvent('change', { bubbles: true, detail: { tab: tab } }));
  }

  document.addEventListener('click', function (e) {
    var tab = e.target.closest('.k-tabstrip [role="tab"]');
    if (!tab) return;
    var strip = tab.closest('.k-tabstrip');
    if (strip.getAttribute('data-role') === 'tabstrip') return;
    select(strip, tab, false);
  });

  document.addEventListener('keydown', function (e) {
    var tab = e.target.closest && e.target.closest('.k-tabstrip [role="tab"]');
    if (!tab) return;
    var strip = tab.closest('.k-tabstrip');
    if (strip.getAttribute('data-role') === 'tabstrip') return;
    var list = tabsOf(strip).filter(usable);
    var i = list.indexOf(tab);
    var next = null;
    if (e.key === 'ArrowRight') next = list[(i + 1) % list.length];
    else if (e.key === 'ArrowLeft') next = list[(i - 1 + list.length) % list.length];
    else if (e.key === 'Home') next = list[0];
    else if (e.key === 'End') next = list[list.length - 1];
    if (next) { e.preventDefault(); select(strip, next, true); }
  });
})();

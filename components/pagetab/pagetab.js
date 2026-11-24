/* Lotte Kendo DS · PageTab 동작 (.ux-page-tabs)
   - 탭을 누르면 그 탭이 고른 탭(aria-selected="true")이 되고 줄에 select 이벤트(detail.tab = .ux-page-tab)
   - ← → Home End로 탭 사이 이동(고르기까지)
   - X를 누르면 탭에 close 이벤트(detail.tab)만 보낸다. 탭을 지우고 다른 화면을 고르는 건 쓰는 쪽에서 한다.
   - 탭이 0개가 되면 줄의 role="tablist"를 떼고(안내 글자만 남음), 탭이 다시 생기면 붙인다. */
(function () {
  'use strict';
  function links(bar) { return Array.prototype.slice.call(bar.querySelectorAll('.ux-page-tab-link')); }
  function select(link) {
    var bar = link.closest('.ux-page-tabs');
    links(bar).forEach(function (l) {
      var on = l === link;
      l.setAttribute('aria-selected', String(on));
      l.tabIndex = on ? 0 : -1;
    });
    bar.dispatchEvent(new CustomEvent('select', { bubbles: true, detail: { tab: link.closest('.ux-page-tab') } }));
  }
  function role(bar) {
    if (bar.querySelector('.ux-page-tab')) bar.setAttribute('role', 'tablist');
    else bar.removeAttribute('role');
  }
  function init(root) {
    (root || document).querySelectorAll('.ux-page-tabs').forEach(function (bar) {
      role(bar);
      if (!bar._uxPtObs && window.MutationObserver) {
        bar._uxPtObs = new MutationObserver(function () { role(bar); });
        bar._uxPtObs.observe(bar, { childList: true });
      }
      var all = links(bar);
      var cur = all.filter(function (l) { return l.getAttribute('aria-selected') === 'true'; })[0] || all[0];
      all.forEach(function (l) {
        if (l.getAttribute('aria-selected') !== 'true') l.setAttribute('aria-selected', 'false');
        l.tabIndex = l === cur ? 0 : -1;
      });
    });
  }
  document.addEventListener('click', function (e) {
    var t = e.target.closest && e.target.closest('.ux-page-tabs .ux-page-tab-link, .ux-page-tabs .ux-page-tab-close');
    if (!t) return;
    if (t.classList.contains('ux-page-tab-close')) {
      var tab = t.closest('.ux-page-tab');
      tab.dispatchEvent(new CustomEvent('close', { bubbles: true, detail: { tab: tab } }));
    } else if (t.getAttribute('aria-selected') !== 'true') select(t);
  });
  document.addEventListener('keydown', function (e) {
    var t = e.target.closest && e.target.closest('.ux-page-tabs .ux-page-tab-link');
    if (!t) return;
    var all = links(t.closest('.ux-page-tabs'));
    var i = all.indexOf(t), n = null;
    if (e.key === 'ArrowRight') n = all[(i + 1) % all.length];
    else if (e.key === 'ArrowLeft') n = all[(i - 1 + all.length) % all.length];
    else if (e.key === 'Home') n = all[0];
    else if (e.key === 'End') n = all[all.length - 1];
    if (!n) return;
    e.preventDefault();
    select(n);
    n.focus();
  });
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', function () { init(); }); else init();
  window.LotteDS = window.LotteDS || {};
  window.LotteDS.initPageTabs = init;
})();

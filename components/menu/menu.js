/* Lotte Kendo DS · Menu 동작 (이 DS 구조 .ux-menu 전용)
   - 버튼을 누르거나 ↓ Enter Space: 열고 첫 항목에 키보드 / ↑: 열고 마지막 항목
   - 열린 동안 ↓ ↑ Home End: 항목 옮기기(비활성·라벨은 건너뜀) · Enter Space: 실행 · Esc: 닫고 버튼으로 · Tab: 닫기
   - 하위 메뉴: 마우스를 올리거나 → Enter로 열기, ←로 닫기
   - 항목을 누르면 닫고 .ux-menu에 select 이벤트(detail = { value, text })
     체크 항목은 aria-checked를 바꾸고(detail.checked) 닫음
   - 바깥을 누르면 닫힘
   Kendo 위젯([data-role])은 Kendo가 동작시키므로 건드리지 않는다. */
(function () {
  'use strict';

  var open = null; // 지금 열린 .ux-menu

  function rootOf(el) {
    var m = el.closest && el.closest('.ux-menu');
    return m && !m.closest('[data-role]') ? m : null;
  }
  function items(group) {
    return Array.prototype.filter.call(group.children, function (li) { return li.classList.contains('k-menu-item'); })
      .map(function (li) { return li.querySelector(':scope > .k-menu-link'); })
      .filter(function (a) { return a && !a.disabled && a.getAttribute('aria-disabled') !== 'true'; });
  }
  function popupOf(link) { return link.parentElement.querySelector(':scope > .k-menu-popup'); }
  function closeSub(link) {
    var p = popupOf(link);
    if (!p) return;
    p.querySelectorAll('.k-menu-link[aria-expanded="true"]').forEach(closeSub);
    p.hidden = true;
    link.setAttribute('aria-expanded', 'false');
  }
  function openSub(link, focusFirst) {
    var group = link.closest('.k-menu-group');
    items(group).forEach(function (a) { if (a !== link && a.getAttribute('aria-expanded') === 'true') closeSub(a); });
    var p = popupOf(link);
    p.hidden = false;
    link.setAttribute('aria-expanded', 'true');
    if (focusFirst) { var f = items(p.querySelector('.k-menu-group'))[0]; if (f) f.focus(); }
  }
  function show(menu, last) {
    if (open && open !== menu) hide(open);
    var t = menu.querySelector('.ux-menu-trigger');
    var p = menu.querySelector(':scope > .k-menu-popup');
    if (!t || !p || t.disabled) return;
    p.hidden = false;
    t.setAttribute('aria-expanded', 'true');
    open = menu;
    var list = items(p.querySelector('.k-menu-group'));
    var f = last ? list[list.length - 1] : list[0];
    if (f) f.focus();
  }
  function hide(menu, back) {
    var t = menu.querySelector('.ux-menu-trigger');
    var p = menu.querySelector(':scope > .k-menu-popup');
    p.querySelectorAll('.k-menu-link[aria-expanded="true"]').forEach(closeSub);
    p.hidden = true;
    t.setAttribute('aria-expanded', 'false');
    if (open === menu) open = null;
    if (back) t.focus();
  }
  function activate(menu, link) {
    if (link.disabled || link.getAttribute('aria-disabled') === 'true') return;
    if (link.getAttribute('aria-haspopup') === 'menu') { openSub(link, true); return; }
    var detail = { value: link.value || link.getAttribute('data-value') || '', text: (link.querySelector('.k-menu-link-text') || link).textContent.trim() };
    if (link.getAttribute('role') === 'menuitemcheckbox') {
      var on = link.getAttribute('aria-checked') !== 'true';
      link.setAttribute('aria-checked', String(on));
      detail.checked = on;
    }
    hide(menu, true);
    menu.dispatchEvent(new CustomEvent('select', { bubbles: true, detail: detail }));
  }

  document.addEventListener('click', function (e) {
    var menu = rootOf(e.target);
    if (open && (!menu || menu !== open)) hide(open);
    if (!menu) return;
    if (e.target.closest('.ux-menu-trigger')) {
      if (open === menu) hide(menu); else show(menu);
      return;
    }
    var link = e.target.closest('.k-menu-link');
    if (link) activate(menu, link);
  });

  document.addEventListener('mouseover', function (e) {
    var link = e.target.closest && e.target.closest('.ux-menu .k-menu-link');
    if (!link || !rootOf(link) || link.disabled || link.getAttribute('aria-disabled') === 'true') return;
    var group = link.closest('.k-menu-group');
    items(group).forEach(function (a) { if (a !== link && a.getAttribute('aria-expanded') === 'true') closeSub(a); });
    if (link.getAttribute('aria-haspopup') === 'menu' && link.getAttribute('aria-expanded') !== 'true') openSub(link, false);
    if (document.activeElement !== link) link.focus({ preventScroll: true });
  });

  document.addEventListener('keydown', function (e) {
    var menu = rootOf(e.target);
    if (!menu) return;
    if (e.target.closest('.ux-menu-trigger')) {
      if (e.key === 'ArrowDown' || ((e.key === 'Enter' || e.key === ' ') && open !== menu)) { e.preventDefault(); show(menu); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); show(menu, true); }
      else if (e.key === 'Escape' && open === menu) { e.preventDefault(); hide(menu, true); }
      return;
    }
    var link = e.target.closest('.k-menu-link');
    if (!link) return;
    var group = link.closest('.k-menu-group');
    var list = items(group);
    var i = list.indexOf(link);
    var sub = group.closest('.k-menu-item');
    switch (e.key) {
      case 'ArrowDown': list[(i + 1) % list.length].focus(); break;
      case 'ArrowUp': list[(i - 1 + list.length) % list.length].focus(); break;
      case 'Home': list[0].focus(); break;
      case 'End': list[list.length - 1].focus(); break;
      case 'ArrowRight': if (link.getAttribute('aria-haspopup') === 'menu') openSub(link, true); else return; break;
      case 'ArrowLeft': if (sub) { var up = sub.querySelector(':scope > .k-menu-link'); closeSub(up); up.focus(); } else return; break;
      case 'Enter': case ' ': activate(menu, link); break;
      case 'Escape': hide(menu, true); break;
      case 'Tab': hide(menu); return;
      default: return;
    }
    e.preventDefault();
  });

  function init(root) {
    (root || document).querySelectorAll('.ux-menu').forEach(function (menu) {
      if (menu.closest('[data-role]')) return;
      menu.querySelectorAll('.k-menu-popup').forEach(function (p) { p.hidden = true; });
      menu.querySelectorAll('.k-menu-link[role^="menuitem"]').forEach(function (a) { a.tabIndex = -1; });
      var t = menu.querySelector('.ux-menu-trigger');
      if (t) t.setAttribute('aria-expanded', 'false');
    });
  }
  window.LotteDS = window.LotteDS || {};
  window.LotteDS.initMenu = init;
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', function () { init(); });
  else init();
})();

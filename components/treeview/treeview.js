/* Lotte Kendo DS · TreeView 동작 (이 DS 구조 .k-treeview 안 [role="tree"] 전용)
   - 줄을 누르면 고르고, 하위가 있으면 펼침·접힘도 바뀜
   - 키보드: ↓ ↑ 보이는 줄 이동 · → 펼치기(펼쳐져 있으면 첫 하위로) · ← 접기(접혀 있으면 상위로)
             Home End 처음·끝 · Enter Space 고르기
   - 고르면: aria-selected 바뀜 · 트리([role="tree"])에 select 이벤트(detail = { id, text })
   - 펼침 아이콘(▾ ▸)은 이 파일이 그림
   Kendo 위젯([data-role])은 Kendo가 동작시키므로 건드리지 않는다. */
(function () {
  'use strict';

  var DOWN = '<path d="m6 9 6 6 6-6"/>';
  var RIGHT = '<path d="m9 18 6-6-6-6"/>';
  function svg(p) {
    return '<svg class="k-svg-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">' + p + '</svg>';
  }
  function treeOf(el) {
    var t = el.closest && el.closest('.k-treeview [role="tree"]');
    return t && !t.closest('[data-role]') ? t : null;
  }
  function hasKids(li) { return !!li.querySelector(':scope > .k-treeview-group'); }
  function paint(li) {
    var tg = li.querySelector(':scope > .k-treeview-mid > .k-treeview-toggle');
    if (!tg) return;
    tg.innerHTML = hasKids(li) ? svg(li.getAttribute('aria-expanded') === 'true' ? DOWN : RIGHT) : '';
  }
  function visible(tree) {
    return Array.prototype.filter.call(tree.querySelectorAll('.k-treeview-item'), function (li) {
      var p = li.parentElement.closest('.k-treeview-item');
      while (p) { if (p.getAttribute('aria-expanded') === 'false') return false; p = p.parentElement.closest('.k-treeview-item'); }
      return true;
    });
  }
  function focus(tree, li) {
    if (!li) return;
    tree.querySelectorAll('.k-treeview-item[tabindex="0"]').forEach(function (x) { x.tabIndex = -1; });
    li.tabIndex = 0;
    li.focus();
  }
  function setOpen(li, on) {
    if (!hasKids(li)) return;
    li.setAttribute('aria-expanded', String(on));
    paint(li);
  }
  function select(tree, li) {
    tree.querySelectorAll('.k-treeview-item[aria-selected="true"]').forEach(function (x) { x.setAttribute('aria-selected', 'false'); });
    li.setAttribute('aria-selected', 'true');
    var text = li.querySelector(':scope > .k-treeview-mid .k-treeview-leaf-text');
    tree.dispatchEvent(new CustomEvent('select', { bubbles: true, detail: { id: li.getAttribute('data-id') || '', text: text ? text.textContent.trim() : '' } }));
  }

  document.addEventListener('click', function (e) {
    var row = e.target.closest && e.target.closest('.k-treeview-mid');
    var tree = row && treeOf(row);
    if (!tree) return;
    var li = row.parentElement;
    if (hasKids(li)) setOpen(li, li.getAttribute('aria-expanded') !== 'true');
    select(tree, li);
    focus(tree, li);
  });

  document.addEventListener('keydown', function (e) {
    var li = e.target.closest && e.target.closest('.k-treeview-item');
    var tree = li && treeOf(li);
    if (!tree || e.target !== li) return;
    var list = visible(tree), i = list.indexOf(li);
    var parent = li.parentElement.closest('.k-treeview-item');
    switch (e.key) {
      case 'ArrowDown': focus(tree, list[i + 1]); break;
      case 'ArrowUp': focus(tree, list[i - 1]); break;
      case 'Home': focus(tree, list[0]); break;
      case 'End': focus(tree, list[list.length - 1]); break;
      case 'ArrowRight':
        if (!hasKids(li)) return;
        if (li.getAttribute('aria-expanded') !== 'true') setOpen(li, true); else focus(tree, li.querySelector(':scope > .k-treeview-group > .k-treeview-item'));
        break;
      case 'ArrowLeft':
        if (hasKids(li) && li.getAttribute('aria-expanded') === 'true') setOpen(li, false); else if (parent && tree.contains(parent)) focus(tree, parent); else return;
        break;
      case 'Enter': case ' ': select(tree, li); break;
      default: return;
    }
    e.preventDefault();
  });

  function init(root) {
    (root || document).querySelectorAll('.k-treeview [role="tree"]').forEach(function (tree) {
      if (tree.closest('[data-role]')) return;
      var all = tree.querySelectorAll('.k-treeview-item');
      all.forEach(function (li) {
        li.tabIndex = -1;
        if (hasKids(li) && !li.hasAttribute('aria-expanded')) li.setAttribute('aria-expanded', 'false');
        if (!li.hasAttribute('aria-selected')) li.setAttribute('aria-selected', 'false');
        paint(li);
      });
      var start = tree.querySelector('.k-treeview-item[aria-selected="true"]') || all[0];
      if (start) start.tabIndex = 0;
    });
  }
  window.LotteDS = window.LotteDS || {};
  window.LotteDS.initTreeView = init;
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', function () { init(); });
  else init();
})();

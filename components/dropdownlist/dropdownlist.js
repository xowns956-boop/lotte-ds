/* Lotte Kendo DS · DropDownList 동작 (이 DS 구조 .k-dropdownlist 전용)
   - 칸을 누르거나 ↓ ↑ Enter Space: 목록 열기
   - 열린 동안 ↓ ↑ Home End: 가리킬 줄 옮기기(비활성 줄은 건너뜀), Enter Space: 고르기, Esc: 닫기, Tab: 닫기
   - 줄을 누르면 고르고 닫음, 바깥을 누르면 닫음
   - 고르면: 값 글자 바꿈 · aria-selected · 숨은 input 값 · 상자에 change 이벤트(detail = { value, text })
   - 목록 최대 높이: 열 때 화면에 남은 높이(끝 여백 = 칸과 목록 사이 간격과 같음)까지. 넘치면 목록 안에서 세로로 넘김
     아래 자리가 목록보다 모자라고 위가 더 넓으면 위로 연다
   Kendo 위젯(.k-dropdown · .k-combobox)은 Kendo가 동작시키므로 건드리지 않는다. */
(function () {
  'use strict';

  var open = null; // 지금 열린 .k-dropdownlist

  function parts(box) {
    return {
      button: box.querySelector('.k-input-inner'),
      value: box.querySelector('.k-input-value-text'),
      popup: box.querySelector('.k-popup'),
      items: Array.prototype.slice.call(box.querySelectorAll('.k-list-item')),
      hidden: box.querySelector('input[type="hidden"]')
    };
  }
  function enabled(item) {
    return item.getAttribute('aria-disabled') !== 'true' && !item.classList.contains('k-disabled');
  }
  function ensureIds(box, p) {
    var base = p.button.id || ('k-dd-' + Math.random().toString(36).slice(2, 8));
    if (!p.button.id) p.button.id = base;
    p.items.forEach(function (it, i) { if (!it.id) it.id = base + '-opt-' + i; });
  }
  function setActive(box, item) {
    var p = parts(box);
    p.items.forEach(function (it) { it.classList.toggle('k-focus', it === item); });
    if (item) {
      p.button.setAttribute('aria-activedescendant', item.id);
      item.scrollIntoView({ block: 'nearest' });
    } else {
      p.button.removeAttribute('aria-activedescendant');
    }
  }
  // 최대 높이 = 열리는 쪽에 남은 화면 높이 (CSS 변수 --_k-dd-max로 넘김)
  // 아래 자리가 목록보다 모자라고 위가 더 넓으면 위로 연다(data-side="top")
  function fit(popup) {
    popup.style.removeProperty('--_k-dd-max');
    popup.removeAttribute('data-side');
    var gap = parseFloat(getComputedStyle(popup).marginTop) || 0;
    var field = popup.parentElement.getBoundingClientRect();
    var need = popup.getBoundingClientRect().height;
    var below = window.innerHeight - popup.getBoundingClientRect().top - gap;
    var above = field.top - 2 * gap;
    var up = need > below && above > below;
    if (up) popup.setAttribute('data-side', 'top');
    popup.style.setProperty('--_k-dd-max', Math.max(up ? above : below, 0) + 'px');
  }
  function show(box) {
    if (open && open !== box) hide(open);
    var p = parts(box);
    if (p.button.disabled) return;
    ensureIds(box, p);
    p.popup.hidden = false;
    fit(p.popup);
    p.button.setAttribute('aria-expanded', 'true');
    open = box;
    var sel = p.items.filter(function (it) { return it.getAttribute('aria-selected') === 'true'; })[0];
    setActive(box, sel || p.items.filter(enabled)[0] || null);
  }
  function hide(box) {
    var p = parts(box);
    p.popup.hidden = true;
    p.button.setAttribute('aria-expanded', 'false');
    setActive(box, null);
    if (open === box) open = null;
  }
  function choose(box, item) {
    if (!item || !enabled(item)) return;
    var p = parts(box);
    p.items.forEach(function (it) { it.setAttribute('aria-selected', String(it === item)); });
    var text = (item.querySelector('.k-list-item-text') || item).textContent.trim();
    var value = item.dataset.value !== undefined ? item.dataset.value : text;
    p.value.textContent = text;
    p.value.removeAttribute('data-placeholder');
    if (p.hidden) p.hidden.value = value;
    hide(box);
    p.button.focus();
    box.dispatchEvent(new CustomEvent('change', { bubbles: true, detail: { value: value, text: text } }));
  }
  function move(box, dir) {
    var p = parts(box);
    var list = p.items.filter(enabled);
    if (!list.length) return;
    var cur = p.items.filter(function (it) { return it.classList.contains('k-focus'); })[0];
    var i = list.indexOf(cur);
    var next = dir === 'first' ? list[0] : dir === 'last' ? list[list.length - 1] : list[Math.min(list.length - 1, Math.max(0, i + dir))];
    setActive(box, next);
  }

  document.addEventListener('click', function (e) {
    var item = e.target.closest('.k-dropdownlist .k-list-item');
    if (item) { choose(item.closest('.k-dropdownlist'), item); return; }
    var btn = e.target.closest('.k-dropdownlist > .k-input-inner');
    if (btn) {
      var box = btn.closest('.k-dropdownlist');
      if (open === box) { hide(box); } else { show(box); }
      return;
    }
    if (open && !open.contains(e.target)) hide(open);
  });

  document.addEventListener('keydown', function (e) {
    var btn = e.target.closest && e.target.closest('.k-dropdownlist > .k-input-inner');
    if (!btn) return;
    var box = btn.closest('.k-dropdownlist');
    var isOpen = open === box;
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        if (isOpen) { move(box, 1); } else { show(box); }
        break;
      case 'ArrowUp':
        e.preventDefault();
        if (isOpen) { move(box, -1); } else { show(box); }
        break;
      case 'Home':
        if (isOpen) { e.preventDefault(); move(box, 'first'); }
        break;
      case 'End':
        if (isOpen) { e.preventDefault(); move(box, 'last'); }
        break;
      case 'Enter':
      case ' ':
        e.preventDefault();
        if (isOpen) {
          choose(box, parts(box).items.filter(function (it) { return it.classList.contains('k-focus'); })[0]);
        } else {
          show(box);
        }
        break;
      case 'Escape':
        if (isOpen) { e.preventDefault(); hide(box); }
        break;
      case 'Tab':
        if (isOpen) hide(box);
        break;
    }
  });

  // 마우스로 가리키면 그 줄을 가리킴 상태로
  document.addEventListener('mousemove', function (e) {
    var item = e.target.closest && e.target.closest('.k-dropdownlist .k-list-item');
    if (item && enabled(item) && !item.classList.contains('k-focus')) setActive(item.closest('.k-dropdownlist'), item);
  });
})();

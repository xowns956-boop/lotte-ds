/* Lotte Kendo DS · Tooltip 동작
   [data-tooltip] 대상에 마우스를 올리거나 키보드 포커스가 가면 말풍선을 보이고,
   벗어나거나 포커스가 빠지거나 Esc를 누르면 숨긴다.
   위치: data-tooltip-side = top(기본) · right · bottom · left. 화살표 끝이 대상 가장자리에 닿는다.
   화면 밖으로 넘치면 화면 안으로만 밀어 넣는다(방향은 바꾸지 않음). */
(function () {
  'use strict';

  var CALLOUT = { top: 's', bottom: 'n', right: 'w', left: 'e' };
  var tip = null;
  var current = null;

  function ensure() {
    if (tip) return tip;
    tip = document.createElement('div');
    tip.id = 'k-lotte-tooltip';
    tip.setAttribute('role', 'tooltip');
    tip.hidden = true;
    tip.innerHTML = '<div class="k-tooltip-content"></div><div class="k-callout"></div>';
    document.body.appendChild(tip);
    return tip;
  }

  function show(target) {
    var text = target.getAttribute('data-tooltip');
    if (!text) return;
    var side = target.getAttribute('data-tooltip-side') || 'top';
    if (!CALLOUT[side]) side = 'top';
    var t = ensure();
    t.className = 'k-tooltip k-tooltip-' + side;
    t.querySelector('.k-tooltip-content').textContent = text;
    t.querySelector('.k-callout').className = 'k-callout k-callout-' + CALLOUT[side];
    t.hidden = false;
    current = target;
    var prev = target.getAttribute('aria-describedby') || '';
    if (prev.split(' ').indexOf(t.id) < 0) target.setAttribute('aria-describedby', (prev + ' ' + t.id).trim());

    var r = target.getBoundingClientRect();
    var w = t.offsetWidth, h = t.offsetHeight;
    var x, y;
    if (side === 'top') { x = r.left + r.width / 2 - w / 2; y = r.top - h; }
    else if (side === 'bottom') { x = r.left + r.width / 2 - w / 2; y = r.bottom; }
    else if (side === 'right') { x = r.right; y = r.top + r.height / 2 - h / 2; }
    else { x = r.left - w; y = r.top + r.height / 2 - h / 2; }
    x = Math.max(0, Math.min(x, document.documentElement.clientWidth - w));
    y = Math.max(0, Math.min(y, document.documentElement.clientHeight - h));
    t.style.left = x + 'px';
    t.style.top = y + 'px';
  }

  function hide() {
    if (!tip || !current) return;
    tip.hidden = true;
    var ids = (current.getAttribute('aria-describedby') || '').split(' ').filter(function (id) { return id && id !== tip.id; });
    if (ids.length) { current.setAttribute('aria-describedby', ids.join(' ')); } else { current.removeAttribute('aria-describedby'); }
    current = null;
  }

  function targetOf(e) { return e.target.closest && e.target.closest('[data-tooltip]'); }

  document.addEventListener('mouseover', function (e) { var t = targetOf(e); if (t && t !== current) show(t); });
  document.addEventListener('mouseout', function (e) { var t = targetOf(e); if (t && t === current && !t.contains(e.relatedTarget)) hide(); });
  document.addEventListener('focusin', function (e) { var t = targetOf(e); if (t) show(t); });
  document.addEventListener('focusout', function (e) { var t = targetOf(e); if (t && t === current) hide(); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') hide(); });
  window.addEventListener('scroll', hide, true);
})();

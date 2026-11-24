/* Lotte Kendo DS · Toast 띄우기
   LotteDS.toast({ type: 'success', title: '저장되었습니다', description: '2026-09-23 14:30', action: '실행 취소', onAction: fn })
   - type: default(생략) · success · info · warning · error
   - 화면 오른쪽 아래(.ux-toaster)에 쌓이고 4초 뒤 사라진다. 마우스를 올려 두면 안 사라진다.
   - 화면 읽기 프로그램에는 role="status"(오류는 role="alert")로 읽힌다.
   반환값: 띄운 알림 요소(직접 지울 때 .remove()) */
(function () {
  'use strict';

  var ICONS = {
    success: '<circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/>',
    info: '<circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/>',
    warning: '<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"/><path d="M12 9v4"/><path d="M12 17h.01"/>',
    error: '<path d="M2.586 16.726A2 2 0 0 1 2 15.312V8.688a2 2 0 0 1 .586-1.414l4.688-4.688A2 2 0 0 1 8.688 2h6.624a2 2 0 0 1 1.414.586l4.688 4.688A2 2 0 0 1 22 8.688v6.624a2 2 0 0 1-.586 1.414l-4.688 4.688a2 2 0 0 1-1.414.586H8.688a2 2 0 0 1-1.414-.586z"/><path d="m15 9-6 6"/><path d="m9 9 6 6"/>'
  };
  var DURATION = 4000;

  function toaster() {
    var t = document.querySelector('.ux-toaster');
    if (!t) {
      t = document.createElement('div');
      t.className = 'ux-toaster';
      t.setAttribute('aria-label', '알림');
      document.body.appendChild(t);
    }
    return t;
  }

  function toast(opts) {
    opts = opts || {};
    var type = ICONS[opts.type] ? opts.type : 'default';
    var n = document.createElement('div');
    n.className = 'k-notification' + (type === 'default' ? '' : ' k-notification-' + type);
    n.setAttribute('role', type === 'error' ? 'alert' : 'status');
    var wrap = document.createElement('div');
    wrap.className = 'k-notification-wrap';
    if (type !== 'default') {
      wrap.insertAdjacentHTML('beforeend', '<svg class="k-svg-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">' + ICONS[type] + '</svg>');
    }
    var content = document.createElement('div');
    content.className = 'k-notification-content';
    var title = document.createElement('p');
    title.className = 'k-notification-title';
    title.textContent = opts.title || '';
    content.appendChild(title);
    if (opts.description) {
      var desc = document.createElement('p');
      desc.className = 'k-notification-description';
      desc.textContent = opts.description;
      content.appendChild(desc);
    }
    wrap.appendChild(content);
    if (opts.action) {
      var act = document.createElement('button');
      act.type = 'button';
      act.className = 'k-notification-action';
      act.textContent = opts.action;
      act.addEventListener('click', function () {
        if (typeof opts.onAction === 'function') opts.onAction();
        n.remove();
      });
      wrap.appendChild(act);
    }
    n.appendChild(wrap);
    toaster().appendChild(n);

    var timer = null;
    function arm() { timer = setTimeout(function () { n.remove(); }, opts.duration || DURATION); }
    n.addEventListener('mouseenter', function () { clearTimeout(timer); });
    n.addEventListener('mouseleave', arm);
    n.addEventListener('focusin', function () { clearTimeout(timer); });
    n.addEventListener('focusout', arm);
    arm();
    return n;
  }

  window.LotteDS = window.LotteDS || {};
  window.LotteDS.toast = toast;
})();

/* Lotte Kendo DS · Switch 동작
   button.k-switch[role="switch"]를 누르면 켜짐·꺼짐을 바꾼다(aria-checked · .k-switch-on/.k-switch-off).
   Kendo 위젯이 관리하는 스위치(data-role="switch")는 건드리지 않는다. */
(function () {
  'use strict';

  document.addEventListener('click', function (e) {
    var sw = e.target.closest('.k-switch[role="switch"]');
    if (!sw || sw.getAttribute('data-role') === 'switch') return;
    if (sw.disabled || sw.getAttribute('aria-disabled') === 'true') return;
    var on = sw.getAttribute('aria-checked') !== 'true';
    sw.setAttribute('aria-checked', String(on));
    sw.classList.toggle('k-switch-on', on);
    sw.classList.toggle('k-switch-off', !on);
    sw.dispatchEvent(new Event('change', { bubbles: true }));
  });
})();

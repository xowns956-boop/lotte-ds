/* Lotte Kendo DS · Toggle 동작 (.k-toggle-button · ButtonGroup / Toggle)
   - 누르면 aria-pressed가 true ↔ false로 바뀌고 버튼에 change 이벤트(detail.pressed)
   - 비활성(disabled · aria-disabled="true")은 바뀌지 않음
   - 묶음(.ux-toggle-group) data-ux-toggle-group="single"(기본): 켜면 나머지는 꺼짐
     → 묶음에 change 이벤트(detail.value = 켜진 칸들의 value 또는 글자 목록)
   Kendo 위젯([data-role])은 Kendo가 동작시키므로 건드리지 않는다. */
(function () {
  'use strict';
  document.addEventListener('click', function (e) {
    var b = e.target.closest && e.target.closest('.k-toggle-button');
    if (!b || b.closest('[data-role]') || b.disabled || b.getAttribute('aria-disabled') === 'true') return;
    var on = b.getAttribute('aria-pressed') !== 'true';
    var group = b.closest('.ux-toggle-group');
    var single = group && group.getAttribute('data-ux-toggle-group') !== 'multiple';
    if (single && on) {
      group.querySelectorAll('.k-toggle-button[aria-pressed="true"]').forEach(function (x) { if (x !== b) x.setAttribute('aria-pressed', 'false'); });
    }
    b.setAttribute('aria-pressed', String(on));
    b.dispatchEvent(new CustomEvent('change', { bubbles: true, detail: { pressed: on } }));
    if (group) {
      var value = Array.prototype.map.call(group.querySelectorAll('.k-toggle-button[aria-pressed="true"]'), function (x) {
        return x.value || x.textContent.trim();
      });
      group.dispatchEvent(new CustomEvent('change', { bubbles: true, detail: { value: value } }));
    }
  });
})();

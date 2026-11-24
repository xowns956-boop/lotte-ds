/* Lotte Kendo DS · Numeric / Numeric Stepper 공통 동작
   - 최신 Kendo 구조의 증감 칸(.k-spinner-increase / .k-spinner-decrease)과
     Numeric Stepper의 빼기·더하기 버튼([data-step="down"|"up"])을 누르면 값을 한 단계 바꾼다.
   - 단계·최소·최대는 입력칸의 data-increment · data-min · data-max(없으면 1 · 제한 없음).
   - Kendo 위젯이 관리하는 칸(data-role="numerictextbox")은 건드리지 않는다. */
(function () {
  'use strict';

  function decimals(n) {
    var s = String(n);
    var i = s.indexOf('.');
    return i < 0 ? 0 : s.length - i - 1;
  }

  function stepValue(input, dir) {
    if (!input || input.disabled || input.readOnly) return;
    var step = parseFloat(input.dataset.increment) || 1;
    var min = input.dataset.min !== undefined ? parseFloat(input.dataset.min) : -Infinity;
    var max = input.dataset.max !== undefined ? parseFloat(input.dataset.max) : Infinity;
    var raw = String(input.value);
    var current = parseFloat(raw.replace(/,/g, ''));
    if (isNaN(current)) current = isFinite(min) ? min : 0;
    var next = current + dir * step;
    next = Math.min(max, Math.max(min, next));
    var digits = Math.max(decimals(step), decimals(current));
    // 천 단위 쉼표: 원래 값에 쉼표가 있으면 유지
    input.value = raw.indexOf(',') >= 0
      ? next.toLocaleString('en-US', { minimumFractionDigits: digits, maximumFractionDigits: digits })
      : next.toFixed(digits);
    input.dispatchEvent(new Event('input', { bubbles: true }));
    input.dispatchEvent(new Event('change', { bubbles: true }));
  }

  document.addEventListener('click', function (e) {
    // Numeric (최신 Kendo 구조)
    var spin = e.target.closest('.k-numerictextbox .k-spinner-increase, .k-numerictextbox .k-spinner-decrease');
    if (spin) {
      var box = spin.closest('.k-numerictextbox');
      var field = box.querySelector('.k-input-inner');
      if (!field || field.getAttribute('data-role') === 'numerictextbox') return;
      stepValue(field, spin.classList.contains('k-spinner-increase') ? 1 : -1);
      return;
    }
    // Numeric Stepper
    var btn = e.target.closest('.ux-numeric-stepper button[data-step]');
    if (btn) {
      var group = btn.closest('.ux-numeric-stepper');
      stepValue(group.querySelector('input'), btn.dataset.step === 'up' ? 1 : -1);
    }
  });

  window.LotteDS = window.LotteDS || {};
  window.LotteDS.stepValue = stepValue;
})();

/* Lotte Kendo DS · Dialog 동작 (브라우저 <dialog> 사용)
   - [data-dialog-open="ID"] 누르면 그 dialog를 모달로 연다(포커스 가두기·Esc 닫기는 브라우저가 함).
   - dialog 안 [data-dialog-close] 누르면 닫는다. 닫히면 연 버튼으로 포커스가 돌아간다(브라우저 기본).
   - 뒤 가림을 누르면 Dialog는 닫히고, Alert(role="alertdialog")는 안 닫힌다.
   - 닫히면 dialog에서 close 이벤트(브라우저 기본) — returnValue에 [data-dialog-close]의 값이 들어간다. */
(function () {
  'use strict';

  document.addEventListener('click', function (e) {
    var opener = e.target.closest('[data-dialog-open]');
    if (opener) {
      var dlg = document.getElementById(opener.getAttribute('data-dialog-open'));
      if (dlg && typeof dlg.showModal === 'function' && !dlg.open) dlg.showModal();
      return;
    }
    var closer = e.target.closest('dialog [data-dialog-close]');
    if (closer) {
      closer.closest('dialog').close(closer.getAttribute('data-dialog-close') || closer.value || '');
      return;
    }
    // 뒤 가림 누름 = dialog 요소 자체가 눌림(상자 바깥)
    var d = e.target;
    if (d.tagName === 'DIALOG' && d.open && d.classList.contains('k-window') && d.getAttribute('role') !== 'alertdialog') {
      var r = d.getBoundingClientRect();
      var inside = e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom;
      if (!inside) d.close('');
    }
  });
})();

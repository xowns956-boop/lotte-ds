// 업데이트 현황: changelog.json(버전별 기록)을 읽어 카드로 그린다.
// 최신 버전 카드에만 업데이트 프롬프트 복사 버튼을 둔다(설치 주소에는 최신 버전 파일만 있음).
// 기록은 changelog.json 한 곳에서만 고친다(llms-full.txt도 같은 파일을 읽는다).
(function () {
  'use strict';

  var html = document.documentElement;
  var STORE = 'lotte-ds-preview';
  var BASE = new URL('../', location.href).href;
  var ICON = {
    copy: '<rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>',
    check: '<path d="M20 6 9 17l-5-5"/>'
  };
  function svg(name) {
    return '<svg class="k-svg-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">' + ICON[name] + '</svg>';
  }
  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }

  // 테마 (미리보기·설치 페이지와 같은 기억 장소)
  function load() { try { return JSON.parse(localStorage.getItem(STORE)) || {}; } catch (e) { return {}; } }
  function save(s) { try { localStorage.setItem(STORE, JSON.stringify(s)); } catch (e) { /* 저장 못 해도 괜찮음 */ } }
  var state = Object.assign({ theme: 'light' }, load());
  html.setAttribute('data-theme', state.theme);
  document.getElementById('ins-theme').addEventListener('click', function () {
    state.theme = state.theme === 'dark' ? 'light' : 'dark';
    html.setAttribute('data-theme', state.theme);
    save(state);
  });

  // 복사 (막힌 브라우저면 글을 펼쳐 직접 선택하게 함)
  var live = document.getElementById('ins-live');
  function writeClipboard(text) {
    if (navigator.clipboard && window.isSecureContext) {
      return navigator.clipboard.writeText(text).catch(function () { return legacyCopy(text); });
    }
    return legacyCopy(text);
  }
  function legacyCopy(text) {
    return new Promise(function (resolve, reject) {
      var ta = document.createElement('textarea');
      ta.value = text;
      ta.setAttribute('readonly', '');
      ta.className = 'ins-sr-only';
      document.body.appendChild(ta);
      ta.select();
      var ok = false;
      try { ok = document.execCommand('copy'); } catch (e) { ok = false; }
      ta.remove();
      if (ok) resolve(); else reject(new Error('copy failed'));
    });
  }
  function showManual(text) {
    var box = document.getElementById('ins-manual-copy');
    var ta = document.getElementById('ins-manual-text');
    ta.value = text;
    box.hidden = false;
    ta.focus();
    ta.select();
  }
  function copyButton(label, text, message) {
    var b = el('button', 'k-button k-button-sm k-button-solid-primary');
    b.type = 'button';
    b.innerHTML = svg('copy');
    var t = el('span', 'k-button-text', label);
    b.appendChild(t);
    b.addEventListener('click', function () {
      writeClipboard(text).then(function () {
        b.querySelector('.k-svg-icon').outerHTML = svg('check');
        t.textContent = '복사했어요';
        live.textContent = message;
        clearTimeout(b._t);
        b._t = setTimeout(function () {
          b.querySelector('.k-svg-icon').outerHTML = svg('copy');
          t.textContent = label;
        }, 2000);
      }, function () {
        live.textContent = '복사하지 못했어요. 펼쳐진 글을 직접 선택해서 복사해 주세요.';
        showManual(text);
      });
    });
    return b;
  }

  function render(log, C) {
    document.getElementById('cl-version').textContent = 'Lotte Kendo DS v' + C.VERSION;
    document.title = '업데이트 현황 · Lotte Kendo DS v' + C.VERSION;
    var list = document.getElementById('cl-list');
    log.forEach(function (rel) {
      var li = el('li');
      var card = el('article', 'k-card');
      var id = 'cl-v' + rel.version.replace(/\./g, '-');
      card.setAttribute('aria-labelledby', id);

      var head = el('div', 'k-card-header');
      var row = el('div', 'cl-head');
      var title = el('div', 'cl-head__title');
      var h2 = el('h2', 'k-card-title', 'v' + rel.version);
      h2.id = id;
      title.append(h2, el('span', 'k-badge k-badge-md k-badge-outline-base', rel.date));
      row.appendChild(title);
      if (rel.version === C.VERSION) {
        row.appendChild(copyButton('v' + C.VERSION + ' 업데이트 프롬프트', C.updatePrompt,
          'v' + C.VERSION + ' 업데이트 프롬프트를 복사했어요. 설치한 프로젝트의 AI 채팅창에 붙여넣어 주세요.'));
      }
      head.append(row, el('p', 'k-card-subtitle', rel.summary));

      var body = el('div', 'k-card-body cl-body');
      rel.groups.forEach(function (g) {
        var sec = el('section', 'cl-group');
        var ul = el('ul', 'cl-group__items text-sm-regular');
        g.items.forEach(function (it) { ul.appendChild(el('li', null, it)); });
        sec.append(el('h3', 'cl-group__title text-sm-semibold', g.title), ul);
        body.appendChild(sec);
      });

      card.append(head, body);
      li.appendChild(card);
      list.appendChild(li);
    });
  }

  function json(url, what) {
    return fetch(url, { cache: 'no-store' }).then(function (r) {
      if (!r.ok) throw new Error(what + '을(를) 읽지 못했어요.');
      return r.json();
    });
  }
  Promise.all([json(BASE + 'r/meta.json', '설치 정보(r/meta.json)'), json('changelog.json', '업데이트 기록(changelog.json)')])
    .then(function (res) { render(res[1], window.LotteInstallContent.build(res[0].version, BASE)); })
    .catch(function (err) {
      var box = document.getElementById('ins-error');
      box.textContent = err.message;
      box.hidden = false;
    });
})();

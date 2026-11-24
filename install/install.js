// AI로 설치하기: r/meta.json(버전·부품)을 읽어 content.js 글로 화면을 채우고, 복사 버튼을 단다.
(function () {
  'use strict';

  var html = document.documentElement;
  var STORE = 'lotte-ds-preview';
  var BASE = new URL('../', location.href).href;

  var ICON = {
    copy: '<rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>',
    check: '<path d="M20 6 9 17l-5-5"/>',
    sparkles: '<path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z"/><path d="M20 3v4"/><path d="M22 5h-4"/><path d="M4 17v2"/><path d="M5 18H3"/>',
    'chevron-down': '<path d="m6 9 6 6 6-6"/>'
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

  // 테마 (미리보기 페이지와 같은 기억 장소를 씀)
  function load() { try { return JSON.parse(localStorage.getItem(STORE)) || {}; } catch (e) { return {}; } }
  function save(s) { try { localStorage.setItem(STORE, JSON.stringify(s)); } catch (e) { /* 저장 못 해도 괜찮음 */ } }
  var state = Object.assign({ theme: 'light' }, load());
  html.setAttribute('data-theme', state.theme);
  document.getElementById('ins-theme').addEventListener('click', function () {
    state.theme = state.theme === 'dark' ? 'light' : 'dark';
    html.setAttribute('data-theme', state.theme);
    save(state);
  });

  // 복사
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
      if (ok) { resolve(); } else { reject(new Error('copy failed')); }
    });
  }
  function copy(btn, text, message) {
    writeClipboard(text).then(function () {
      setIcon(btn, 'check');
      if (btn.dataset.doneLabel) btn.querySelector('.k-button-text').textContent = btn.dataset.doneLabel;
      live.textContent = message || '복사했어요.';
      clearTimeout(btn._t);
      btn._t = setTimeout(function () {
        setIcon(btn, btn.dataset.icon || 'copy');
        if (btn.dataset.label) btn.querySelector('.k-button-text').textContent = btn.dataset.label;
      }, 2000);
    }, function () {
      live.textContent = '복사하지 못했어요. 펼쳐진 글을 직접 선택해서 복사해 주세요.';
      if (btn.id === 'ins-copy-prompt') showManual(text);
    });
  }
  // 복사가 막힌 브라우저용: 프롬프트를 펼쳐서 직접 선택하게 함
  function showManual(text) {
    var box = document.getElementById('ins-manual-copy');
    var ta = document.getElementById('ins-manual-text');
    ta.value = text;
    box.hidden = false;
    ta.focus();
    ta.select();
  }
  function setIcon(btn, name) {
    var old = btn.querySelector('.k-svg-icon');
    var tmp = document.createElement('span');
    tmp.innerHTML = svg(name);
    old.replaceWith(tmp.firstChild);
  }
  function copyIconButton(label, getText, message) {
    var b = el('button', 'k-button k-icon-button k-button-flat-base');
    b.type = 'button';
    b.setAttribute('aria-label', label);
    b.innerHTML = svg('copy');
    b.addEventListener('click', function () { copy(b, getText(), message); });
    return b;
  }
  function codeBlock(host, text, label) {
    host.textContent = '';
    var pre = el('pre', null, text);
    host.append(pre, copyIconButton(label, function () { return text; }));
  }

  function render(C, components) {
    document.getElementById('ins-version').textContent = 'Lotte Kendo DS v' + C.VERSION;
    document.title = 'AI로 설치하기 · Lotte Kendo DS v' + C.VERSION;

    // 설치 프롬프트 복사
    var main = document.getElementById('ins-copy-prompt');
    main.dataset.icon = 'sparkles';
    main.dataset.label = '설치 프롬프트 복사';
    main.dataset.doneLabel = '복사했어요';
    setIcon(main, 'sparkles');
    main.disabled = false;
    main.addEventListener('click', function () {
      copy(main, C.setupPrompt, '설치 프롬프트를 복사했어요. AI 채팅창에 붙여넣어 주세요.');
    });

    // 3단계
    var steps = document.getElementById('ins-steps');
    C.steps.forEach(function (s, i) {
      var li = el('li', 'ins-step');
      li.append(el('span', 'ins-step__num text-sm-semibold', String(i + 1)), el('h3', 'text-base-semibold', s.title), el('p', 'ins-step__body text-sm-regular', s.body));
      steps.appendChild(li);
    });

    // 예시 문장
    var ex = document.getElementById('ins-examples');
    C.examples.forEach(function (t) {
      var li = el('li', 'ins-example');
      li.append(el('span', 'ins-example__text text-sm-regular', t), copyIconButton('예시 문장 복사', function () { return t; }, '예시 문장을 복사했어요.'));
      ex.appendChild(li);
    });

    // 자주 막히는 곳
    var faq = document.getElementById('ins-faq');
    C.faqs.forEach(function (f) {
      var d = el('details');
      var s = el('summary', 'text-sm-medium');
      s.append(el('span', null, f.q));
      s.insertAdjacentHTML('beforeend', svg('chevron-down'));
      d.append(s, el('p', 'ins-faq__a text-sm-regular', f.a));
      faq.appendChild(d);
    });

    // 들어 있는 부품 (그룹별)
    var groupsHost = document.getElementById('ins-components');
    var groups = [];
    var byName = {};
    components.forEach(function (c) {
      if (!byName[c.group]) { byName[c.group] = []; groups.push(c.group); }
      byName[c.group].push(c.name);
    });
    groups.forEach(function (g) {
      var box = el('div', 'ins-panel');
      var ul = el('ul', 'ins-chips');
      byName[g].forEach(function (n) { ul.appendChild(el('li', 'ins-chip text-caption-medium', n)); });
      box.append(el('h3', 'text-base-semibold', g), ul);
      groupsHost.appendChild(box);
    });

    // 직접 설치
    var cases = document.getElementById('ins-cases');
    C.manualCases.forEach(function (c) {
      var li = el('li', 'ins-case text-sm-regular');
      li.insertAdjacentHTML('afterbegin', svg('check'));
      var span = el('span');
      span.append(el('span', 'ins-case__title text-sm-medium', c.title), el('span', 'ins-case__body', c.body));
      li.appendChild(span);
      cases.appendChild(li);
    });

    var dl = document.getElementById('ins-code-download');
    var osButtons = document.querySelectorAll('[data-os]');
    function showOs(os) {
      // 고른 쪽 = secondary(현재 탭 색), 나머지 = outline
      osButtons.forEach(function (b) {
        var on = b.dataset.os === os;
        b.setAttribute('aria-pressed', String(on));
        b.classList.toggle('k-button-solid-secondary', on);
        b.classList.toggle('k-button-outline-base', !on);
      });
      codeBlock(dl, os === 'win' ? C.psCommand : C.curlCommand, '받기 명령 복사');
    }
    osButtons.forEach(function (b) { b.addEventListener('click', function () { showOs(b.dataset.os); }); });
    showOs('mac');
    codeBlock(document.getElementById('ins-code-link'), C.linkTags, '연결 코드 복사');

    var notes = document.getElementById('ins-notes');
    [
      ['불러오는 순서는 ', 'Kendo CSS → lotte-tokens.css → lotte-ds.css → 화면 CSS', '예요. 롯데 DS가 Kendo보다 앞에 있으면 바뀌지 않아요.'],
      ['숫자 증감 버튼 같은 부품 동작은 ', 'lotte-ds.js', '에 있어요. 빠지면 버튼을 눌러도 값이 안 바뀌어요.'],
      ['다크·태블릿은 ', '<html data-theme="dark" data-device="tablet">', '처럼 속성으로 바꿔요. 없으면 라이트·PC예요.'],
      ['규칙과 부품 목록은 받은 뒤 ', 'docs/lotte.md', '에 있어요. AI는 이 파일을 보고 화면을 만들어요.'],
      ['주소에 버전(', C.VERSION, ')이 들어 있어요. 롯데 DS가 업데이트돼도 이미 받은 프로젝트는 자동으로 바뀌지 않아요.']
    ].forEach(function (n) {
      var li = el('li');
      li.append(document.createTextNode(n[0]), el('code', null, n[1]), document.createTextNode(n[2]));
      notes.appendChild(li);
    });
  }

  fetch(BASE + 'r/meta.json', { cache: 'no-store' })
    .then(function (r) {
      if (!r.ok) throw new Error('설치 정보(r/meta.json)를 읽지 못했어요. 관리자는 npm run build를 먼저 실행해 주세요.');
      return r.json();
    })
    .then(function (meta) {
      render(window.LotteInstallContent.build(meta.version, BASE), meta.components);
    })
    .catch(function (err) {
      var box = document.getElementById('ins-error');
      box.textContent = err.message;
      box.hidden = false;
    });
})();

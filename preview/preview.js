// 미리보기: dist/lotte-tokens.css를 읽어서 견본을 그린다. 토큰이 바뀌면 다시 빌드만 하면 된다.
(function () {
  'use strict';

  var html = document.documentElement;
  var STORE = 'lotte-ds-preview';

  // 라이트·다크, PC·Tablet 전환 (브라우저에 기억, 실패해도 동작)
  function load() {
    try { return JSON.parse(localStorage.getItem(STORE)) || {}; } catch (e) { return {}; }
  }
  function save(state) {
    try { localStorage.setItem(STORE, JSON.stringify(state)); } catch (e) { /* 저장 못 해도 괜찮음 */ }
  }
  var state = Object.assign({ theme: 'light', device: 'pc' }, load());

  var toggles = document.querySelectorAll('[data-set]');
  function apply() {
    html.setAttribute('data-theme', state.theme);
    html.setAttribute('data-device', state.device);
    toggles.forEach(function (btn) {
      btn.setAttribute('aria-pressed', String(state[btn.dataset.set] === btn.dataset.value));
    });
    refreshValues();
  }
  document.querySelector('.pv-header__controls').addEventListener('click', function (e) {
    var btn = e.target.closest('[data-set]');
    if (!btn) return;
    state[btn.dataset.set] = btn.dataset.value;
    save(state);
    apply();
  });

  // 값 글자는 모드를 바꿀 때마다 다시 읽는다
  var valueNodes = [];
  function refreshValues() {
    valueNodes.forEach(function (item) {
      var cs = getComputedStyle(item.from || html);
      item.node.textContent = item.read(cs);
    });
  }
  function bindValue(node, read, from) {
    valueNodes.push({ node: node, read: read, from: from });
  }
  function prop(name) {
    return function (cs) { return cs.getPropertyValue(name).trim(); };
  }

  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }

  // CSS 파일에서 선택자별 변수 이름 모으기
  function parseBlocks(css) {
    var blocks = [];
    css.replace(/\/\*[\s\S]*?\*\//g, '').replace(/([^{}]+)\{([^{}]*)\}/g, function (_, sel, body) {
      var names = [];
      body.replace(/(--[\w-]+)\s*:/g, function (__, n) { names.push(n); });
      blocks.push({ sel: sel.trim(), names: names });
    });
    return blocks;
  }

  var GROUP_WORDS = ['primary', 'secondary', 'tertiary', 'base', 'error', 'success', 'warning', 'info',
    'dark', 'light', 'inverse', 'pending', 'progress', 'highlight', 'disabled', 'chart', 'sidebar', 'ees', 'brand'];
  function colorGroup(name) {
    var n = name.replace(/^--/, '');
    if (/^ux4-alpha-/.test(n)) return 'ux4-alpha (반투명)';
    var rest = n.replace(/^(kendo|ux4)-color-/, '').replace(/^on-/, '');
    var series = rest.match(/^series-[a-f]/);
    if (series) return series[0];
    var word = rest.split('-')[0];
    if (GROUP_WORDS.indexOf(word) >= 0) return word;
    return /^ux4-/.test(n) ? 'ux4-color (면 · 선)' : 'kendo-color (면 · 글자 · 선)';
  }

  function renderColors(names) {
    var host = document.getElementById('pv-colors');
    var groups = {};
    var order = [];
    names.forEach(function (n) {
      var g = colorGroup(n);
      if (!groups[g]) { groups[g] = []; order.push(g); }
      groups[g].push(n);
    });
    order.forEach(function (g) {
      host.appendChild(el('h3', 'pv-group-title text-sm-semibold', g + ' · ' + groups[g].length));
      var grid = el('div', 'pv-grid');
      groups[g].forEach(function (n) {
        var item = el('div', 'pv-swatch');
        var chip = el('div', 'pv-swatch__chip');
        chip.style.background = 'var(' + n + ')';
        var value = el('span', 'pv-swatch__value text-xs-regular');
        bindValue(value, prop(n));
        item.append(chip, el('code', 'pv-swatch__name text-xs-medium', n), value);
        grid.appendChild(item);
      });
      host.appendChild(grid);
    });
  }

  function renderDevice(names) {
    var table = document.getElementById('pv-device');
    var head = el('tr');
    ['변수', '현재 값', '보기'].forEach(function (t) {
      var th = el('th', 'text-data-medium', t); th.scope = 'col'; head.appendChild(th);
    });
    var thead = el('thead'); thead.appendChild(head); table.appendChild(thead);
    var tbody = el('tbody');
    names.forEach(function (n) {
      var tr = el('tr');
      var td1 = el('td'); td1.appendChild(el('code', 'text-data-regular', n));
      var td2 = el('td', 'text-data-regular'); bindValue(td2, prop(n));
      var td3 = el('td');
      if (/font-size/.test(n)) {
        var s = el('span', null, '가나다 Aa 123');
        s.style.fontSize = 'var(' + n + ')';
        td3.appendChild(s);
      } else if (!/line-height/.test(n)) {
        var bar = el('span', 'pv-bar');
        bar.style.width = 'var(' + n + ')';
        bar.style.height = 'var(' + n + ')';
        td3.appendChild(bar);
      }
      tr.append(td1, td2, td3);
      tbody.appendChild(tr);
    });
    table.appendChild(tbody);
  }

  function renderText(classes) {
    var host = document.getElementById('pv-text');
    classes.forEach(function (cls) {
      var row = el('div', 'pv-text-row');
      var sample = el('span', cls, '작업 지시 Aa 123');
      var meta = el('span', 'pv-text-row__meta text-xs-regular');
      bindValue(meta, function (cs) { return cs.fontSize + ' / ' + cs.lineHeight + ' · ' + cs.fontWeight; }, sample);
      row.append(el('code', 'pv-text-row__name text-xs-medium', '.' + cls), sample, meta);
      host.appendChild(row);
    });
  }

  function renderSpacing(names) {
    var host = document.getElementById('pv-spacing');
    var table = el('table', 'pv-table');
    var tbody = el('tbody');
    names.forEach(function (n) {
      var tr = el('tr');
      var td1 = el('td'); td1.appendChild(el('code', 'text-data-regular', n));
      var td2 = el('td', 'text-data-regular'); bindValue(td2, prop(n));
      var td3 = el('td');
      var bar = el('span', 'pv-bar');
      bar.style.width = 'var(' + n + ')';
      bar.style.height = 'var(--kendo-spacing-2)';
      td3.appendChild(bar);
      tr.append(td1, td2, td3);
      tbody.appendChild(tr);
    });
    table.appendChild(tbody);
    var wrap = el('div', 'pv-table-wrap'); wrap.appendChild(table);
    host.appendChild(wrap);
  }

  function renderBoxes(hostId, names, styleProp, fill) {
    var host = document.getElementById(hostId);
    names.forEach(function (n) {
      var box = el('div', 'pv-box');
      var shape = el('div', 'pv-box__shape' + (fill ? ' pv-box__shape--fill' : ''));
      shape.style[styleProp] = 'var(' + n + ')';
      var value = el('span', 'pv-swatch__value text-xs-regular');
      bindValue(value, prop(n));
      box.append(shape, el('code', 'pv-swatch__name text-xs-medium', n), value);
      host.appendChild(box);
    });
  }

  function renderIcons() {
    var host = document.getElementById('pv-icon');
    [['control', 'Control (기본)'], ['title', 'Title'], ['tile', 'Tile']].forEach(function (m) {
      var box = el('div', 'pv-box');
      box.setAttribute('data-icon', m[0]);
      var sample = el('span', 'pv-icon-sample');
      sample.setAttribute('aria-hidden', 'true');
      var value = el('span', 'pv-swatch__value text-xs-regular');
      bindValue(value, function (cs) {
        return cs.getPropertyValue('--kendo-icon-size').trim() + ' · 선 ' + cs.getPropertyValue('--kendo-icon-stroke').trim();
      }, box);
      box.append(sample, el('span', 'pv-swatch__name text-xs-medium', m[1]), value);
      host.appendChild(box);
    });
  }

  // Button: variant × 상태, variant × 크기, 아이콘 위치
  var ICON = {
    plus: '<path d="M5 12h14"/><path d="M12 5v14"/>',
    minus: '<path d="M5 12h14"/>',
    'chevron-down': '<path d="m6 9 6 6 6-6"/>'
  };
  function icon(name) {
    return '<svg class="k-svg-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">' + ICON[name] + '</svg>';
  }
  function btn(cls, label, opts) {
    opts = opts || {};
    var b = document.createElement('button');
    b.type = 'button';
    b.className = 'k-button ' + cls;
    if (opts.disabled) b.disabled = true;
    if (opts.iconOnly) {
      b.setAttribute('aria-label', label);
      b.innerHTML = icon('plus');
    } else {
      b.innerHTML = (opts.left ? icon('plus') : '') + '<span class="k-button-text">' + label + '</span>' + (opts.right ? icon('chevron-down') : '');
    }
    return b;
  }
  function renderButtons() {
    var host = document.getElementById('pv-button');
    var variants = [
      ['default', 'k-button-solid-primary'],
      ['destructive', 'k-button-solid-error'],
      ['outline', 'k-button-outline-base'],
      ['secondary', 'k-button-solid-secondary'],
      ['ghost', 'k-button-flat-base'],
      ['link', 'k-button-link-primary']
    ];
    var states = [
      ['default', '', false],
      ['hover', 'k-state-hover', false],
      ['focus', 'k-state-focused', false],
      ['pressed', 'k-state-active', false],
      ['disabled', '', true]
    ];
    function table(title, cols, cell) {
      host.appendChild(el('h3', 'pv-group-title text-sm-semibold', title));
      var t = el('table', 'pv-table pv-btn-table');
      var head = el('tr');
      var th0 = el('th', 'text-data-medium', 'variant'); th0.scope = 'col'; head.appendChild(th0);
      cols.forEach(function (c) { var th = el('th', 'text-data-medium', c[0]); th.scope = 'col'; head.appendChild(th); });
      var thead = el('thead'); thead.appendChild(head); t.appendChild(thead);
      var tbody = el('tbody');
      variants.forEach(function (v) {
        var tr = el('tr');
        var th = el('th', 'text-data-regular'); th.scope = 'row'; th.appendChild(el('code', null, v[0])); tr.appendChild(th);
        cols.forEach(function (c) { var td = el('td'); td.appendChild(cell(v, c)); tr.appendChild(td); });
        tbody.appendChild(tr);
      });
      t.appendChild(tbody);
      var wrap = el('div', 'pv-table-wrap'); wrap.appendChild(t);
      host.appendChild(wrap);
    }
    table('상태 (size=md)', states, function (v, s) {
      return btn('k-button-md ' + v[1] + ' ' + s[1], '버튼', { disabled: s[2] });
    });
    table('크기', [['sm', 'k-button-sm'], ['md', 'k-button-md'], ['lg', 'k-button-lg'], ['icon', 'k-icon-button']], function (v, s) {
      return btn(s[1] + ' ' + v[1], s[0] === 'icon' ? '추가' : '버튼', { iconOnly: s[0] === 'icon' });
    });
    table('아이콘 (Show Icon Left · Right)', [['왼쪽', 'left'], ['오른쪽', 'right'], ['양쪽', 'both']], function (v, s) {
      return btn('k-button-md ' + v[1], '버튼', { left: s[1] !== 'right', right: s[1] !== 'left' });
    });

    host.appendChild(el('h3', 'pv-group-title text-sm-semibold', '기존 화면 호환 — 클래스 없는 .k-button · 옛 이름 .k-primary · .k-flat'));
    var row = el('div', 'pv-btn-row');
    row.append(btn('', '.k-button'), btn('k-primary', '.k-primary'), btn('k-flat', '.k-flat'));
    host.appendChild(row);
  }

  // Input: 상태 × filled, 최신 Kendo 구조
  var inputSeq = 0;
  function textbox(state, filled) {
    var i = document.createElement('input');
    i.type = 'text';
    i.className = 'k-textbox k-input k-input-md' + (state === 'focus' ? ' k-state-focused' : '');
    i.placeholder = '내용을 입력하세요';
    i.id = 'pv-in-' + (++inputSeq);
    i.setAttribute('aria-label', 'Input ' + state + (filled ? ' 입력값' : ' 안내 글자'));
    if (filled) i.value = '내용을 입력하세요';
    if (state === 'disabled') i.disabled = true;
    if (state === 'invalid') i.setAttribute('aria-invalid', 'true');
    return i;
  }
  function renderInputs() {
    var host = document.getElementById('pv-input');
    var states = ['default', 'focus', 'disabled', 'invalid'];
    host.appendChild(el('h3', 'pv-group-title text-sm-semibold', '상태 × filled'));
    var t = el('table', 'pv-table pv-input-table');
    var head = el('tr');
    var th0 = el('th', 'text-data-medium', 'filled'); th0.scope = 'col'; head.appendChild(th0);
    states.forEach(function (s) { var th = el('th', 'text-data-medium', s); th.scope = 'col'; head.appendChild(th); });
    var thead = el('thead'); thead.appendChild(head); t.appendChild(thead);
    var tbody = el('tbody');
    [false, true].forEach(function (filled) {
      var tr = el('tr');
      var th = el('th', 'text-data-regular'); th.scope = 'row'; th.appendChild(el('code', null, filled ? 'true (입력값)' : 'false (안내 글자)')); tr.appendChild(th);
      states.forEach(function (s) { var td = el('td'); td.appendChild(textbox(s, filled)); tr.appendChild(td); });
      tbody.appendChild(tr);
    });
    t.appendChild(tbody);
    var wrap = el('div', 'pv-table-wrap'); wrap.appendChild(t);
    host.appendChild(wrap);

    host.appendChild(el('h3', 'pv-group-title text-sm-semibold', '최신 Kendo 구조 (span.k-textbox > input.k-input-inner) — 같은 모양'));
    var row = el('div', 'pv-btn-row pv-input-table');
    [['default', false], ['default', true], ['invalid', true], ['disabled', true]].forEach(function (c) {
      var span = el('span', 'k-textbox k-input k-input-md');
      var inner = textbox(c[0], c[1]);
      inner.className = 'k-input-inner';
      span.appendChild(inner);
      row.appendChild(span);
    });
    host.appendChild(row);

    host.appendChild(el('h3', 'pv-group-title text-sm-semibold', 'InputGroup (앞 아이콘 · 뒤 Kbd) — default · focus · disabled'));
    var grow = el('div', 'pv-btn-row pv-input-table');
    ['default', 'focus', 'disabled'].forEach(function (st) {
      var g = el('span', 'k-textbox pv-input-group' + (st === 'focus' ? ' k-state-focused' : ''));
      g.innerHTML = '<span class="k-input-prefix">' + svg('<path d="m21 21-4.34-4.34"/><circle cx="11" cy="11" r="8"/>') + '</span>' +
        '<input class="k-input-inner" placeholder="검색" aria-label="검색 ' + st + '"' + (st === 'disabled' ? ' disabled' : '') + '>' +
        '<span class="k-input-suffix"><kbd class="ux-kbd-group"><kbd class="ux-kbd">⌘</kbd><kbd class="ux-kbd">K</kbd></kbd></span>';
      grow.appendChild(g);
    });
    host.appendChild(grow);
  }

  // TextArea: 상태 × filled, 최신 Kendo 구조
  function textarea(state, filled) {
    var t = document.createElement('textarea');
    t.className = 'k-textarea' + (state === 'focus' ? ' k-state-focused' : '');
    t.placeholder = '내용을 입력하세요';
    t.setAttribute('aria-label', 'TextArea ' + state + (filled ? ' 입력값' : ' 안내 글자'));
    if (filled) t.value = '내용을 입력하세요';
    if (state === 'disabled') t.disabled = true;
    if (state === 'invalid') t.setAttribute('aria-invalid', 'true');
    return t;
  }
  function renderTextareas() {
    var host = document.getElementById('pv-textarea');
    var states = ['default', 'focus', 'disabled', 'invalid'];
    host.appendChild(el('h3', 'pv-group-title text-sm-semibold', '상태 × filled'));
    var t = el('table', 'pv-table pv-input-table');
    var head = el('tr');
    var th0 = el('th', 'text-data-medium', 'filled'); th0.scope = 'col'; head.appendChild(th0);
    states.forEach(function (s) { var th = el('th', 'text-data-medium', s); th.scope = 'col'; head.appendChild(th); });
    var thead = el('thead'); thead.appendChild(head); t.appendChild(thead);
    var tbody = el('tbody');
    [false, true].forEach(function (filled) {
      var tr = el('tr');
      var th = el('th', 'text-data-regular'); th.scope = 'row'; th.appendChild(el('code', null, filled ? 'true (입력값)' : 'false (안내 글자)')); tr.appendChild(th);
      states.forEach(function (s) { var td = el('td'); td.appendChild(textarea(s, filled)); tr.appendChild(td); });
      tbody.appendChild(tr);
    });
    t.appendChild(tbody);
    var wrap = el('div', 'pv-table-wrap'); wrap.appendChild(t);
    host.appendChild(wrap);

    host.appendChild(el('h3', 'pv-group-title text-sm-semibold', '최신 Kendo 구조 (span.k-textarea > textarea.k-input-inner) — 같은 모양'));
    var row = el('div', 'pv-btn-row pv-input-table');
    [['default', false], ['default', true], ['invalid', true], ['disabled', true]].forEach(function (c) {
      var span = el('span', 'k-textarea k-input');
      var inner = textarea(c[0], c[1]);
      inner.className = 'k-input-inner';
      span.appendChild(inner);
      row.appendChild(span);
    });
    host.appendChild(row);

    host.appendChild(el('h3', 'pv-group-title text-sm-semibold', '긴 글 (줄바꿈 · 넘치면 안에서 스크롤)'));
    var long = textarea('default', true);
    long.value = '1차 계량 후 원료 투입 순서를 바꿨음. 오전 작업조 확인 필요. 냉동면4호 라인 점검 일정과 겹치지 않게 조정했고, 다음 배합부터 기준 시간을 다시 잼.';
    long.setAttribute('aria-label', 'TextArea 긴 글');
    var lrow = el('div', 'pv-input-table'); lrow.appendChild(long);
    host.appendChild(lrow);
  }

  // Numeric: 상태 × 빈 칸/값
  var CHEV_UP = '<path d="m18 15-6-6-6 6"/>', CHEV_DOWN = '<path d="m6 9 6 6 6-6"/>';
  function smallIcon(path) {
    return '<svg class="k-svg-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">' + path + '</svg>';
  }
  function numeric(state, filled) {
    var box = el('span', 'k-numerictextbox k-input k-input-md' + (state === 'focus' ? ' k-state-focused' : ''));
    var i = document.createElement('input');
    i.type = 'text'; i.className = 'k-input-inner'; i.inputMode = 'decimal'; i.placeholder = '0';
    i.setAttribute('aria-label', 'Numeric ' + state + (filled ? ' 입력값' : ' 안내 글자'));
    i.dataset.increment = '1';
    if (filled) i.value = '1,250';
    if (state === 'disabled') i.disabled = true;
    if (state === 'invalid') i.setAttribute('aria-invalid', 'true');
    var spin = el('span', 'k-input-spinner');
    spin.innerHTML = '<button type="button" class="k-spinner-increase" tabindex="-1" aria-label="값 올리기">' + smallIcon(CHEV_UP) + '</button>' +
      '<button type="button" class="k-spinner-decrease" tabindex="-1" aria-label="값 내리기">' + smallIcon(CHEV_DOWN) + '</button>';
    box.append(i, spin);
    return box;
  }
  function stateTable(host, label, make) {
    var states = ['default', 'focus', 'disabled', 'invalid'];
    host.appendChild(el('h3', 'pv-group-title text-sm-semibold', label));
    var t = el('table', 'pv-table pv-input-table');
    var head = el('tr');
    var th0 = el('th', 'text-data-medium', 'filled'); th0.scope = 'col'; head.appendChild(th0);
    states.forEach(function (s) { var th = el('th', 'text-data-medium', s); th.scope = 'col'; head.appendChild(th); });
    var thead = el('thead'); thead.appendChild(head); t.appendChild(thead);
    var tbody = el('tbody');
    [false, true].forEach(function (filled) {
      var tr = el('tr');
      var th = el('th', 'text-data-regular'); th.scope = 'row'; th.appendChild(el('code', null, filled ? 'true (입력값)' : 'false (안내 글자)')); tr.appendChild(th);
      states.forEach(function (s) { var td = el('td'); td.appendChild(make(s, filled)); tr.appendChild(td); });
      tbody.appendChild(tr);
    });
    t.appendChild(tbody);
    var wrap = el('div', 'pv-table-wrap'); wrap.appendChild(t);
    host.appendChild(wrap);
  }
  function renderNumeric() {
    stateTable(document.getElementById('pv-numeric'), '상태 × filled (상태는 Input과 같음)', numeric);
  }
  function renderStepper() {
    var host = document.getElementById('pv-numeric-stepper');
    host.appendChild(el('h3', 'pv-group-title text-sm-semibold', 'default'));
    var g = el('div', 'ux-numeric-stepper pv-stepper');
    g.setAttribute('role', 'group');
    g.setAttribute('aria-label', '검사값');
    g.innerHTML =
      '<button type="button" class="k-button k-icon-button k-button-outline-base" data-step="down" aria-label="값 내리기">' + icon('minus') + '</button>' +
      '<input type="text" class="k-textbox k-input k-input-md" inputmode="decimal" value="35.4" data-increment="0.1" aria-label="검사값">' +
      '<button type="button" class="k-button k-icon-button k-button-outline-base" data-step="up" aria-label="값 올리기">' + icon('plus') + '</button>';
    host.appendChild(g);
  }

  // 표: 행(checked 등) × 열(상태)
  function gridTable(host, title, rowKey, rows, cols, make) {
    host.appendChild(el('h3', 'pv-group-title text-sm-semibold', title));
    var t = el('table', 'pv-table pv-btn-table');
    var head = el('tr');
    var th0 = el('th', 'text-data-medium', rowKey); th0.scope = 'col'; head.appendChild(th0);
    cols.forEach(function (c) { var th = el('th', 'text-data-medium', c); th.scope = 'col'; head.appendChild(th); });
    var thead = el('thead'); thead.appendChild(head); t.appendChild(thead);
    var tbody = el('tbody');
    rows.forEach(function (r) {
      var tr = el('tr');
      var th = el('th', 'text-data-regular'); th.scope = 'row'; th.appendChild(el('code', null, String(r))); tr.appendChild(th);
      cols.forEach(function (c) { var td = el('td'); td.appendChild(make(r, c)); tr.appendChild(td); });
      tbody.appendChild(tr);
    });
    t.appendChild(tbody);
    var wrap = el('div', 'pv-table-wrap'); wrap.appendChild(t);
    host.appendChild(wrap);
  }
  var choiceSeq = 0;
  function choice(type, checked, state) {
    var i = document.createElement('input');
    i.type = type;
    i.className = (type === 'checkbox' ? 'k-checkbox k-checkbox-md' : 'k-radio k-radio-md') + (state === 'focus' ? ' k-state-focused' : '');
    i.id = 'pv-ch-' + (++choiceSeq);
    if (type === 'radio') i.name = 'pv-radio-' + choiceSeq;
    i.checked = checked;
    i.setAttribute('aria-label', type + ' ' + state + (checked ? ' 선택됨' : ''));
    if (state === 'disabled') i.disabled = true;
    if (state === 'invalid') i.setAttribute('aria-invalid', 'true');
    return i;
  }
  function pair(type, text, opts) {
    var frag = document.createDocumentFragment();
    var i = choice(type, !!opts.checked, opts.disabled ? 'disabled' : 'default');
    i.removeAttribute('aria-label');
    if (type === 'radio') i.name = 'pv-pair-radio';
    var l = el('label', 'k-' + (type === 'checkbox' ? 'checkbox' : 'radio') + '-label', text);
    l.htmlFor = i.id;
    frag.append(i, l);
    var box = el('span', 'pv-pair'); box.appendChild(frag);
    return box;
  }
  function renderChoices() {
    var states = ['default', 'focus', 'disabled', 'invalid'];
    ['checkbox', 'radio'].forEach(function (type) {
      var host = document.getElementById('pv-' + type);
      gridTable(host, 'checked × 상태', 'checked', [false, true], states, function (r, c) { return choice(type, r, c); });
      host.appendChild(el('h3', 'pv-group-title text-sm-semibold', '글자와 함께 (Label 모양 · 간격 8)'));
      var row = el('div', 'pv-btn-row');
      if (type === 'checkbox') {
        row.append(pair('checkbox', '아이디 저장', {}), pair('checkbox', '자동 로그인', { checked: true }), pair('checkbox', '비활성', { disabled: true }));
      } else {
        row.append(pair('radio', '주간', { checked: true }), pair('radio', '야간', {}), pair('radio', '비활성', { disabled: true }));
      }
      host.appendChild(row);
    });
  }
  function switchEl(on, state) {
    var b = document.createElement('button');
    b.type = 'button';
    b.className = 'k-switch k-switch-md ' + (on ? 'k-switch-on' : 'k-switch-off') + (state === 'focus' ? ' k-state-focused' : '');
    b.setAttribute('role', 'switch');
    b.setAttribute('aria-checked', String(on));
    b.setAttribute('aria-label', 'Switch ' + state);
    if (state === 'disabled') b.disabled = true;
    b.innerHTML = '<span class="k-switch-track"></span><span class="k-switch-thumb-wrap"><span class="k-switch-thumb"></span></span>';
    return b;
  }
  function renderSwitch() {
    gridTable(document.getElementById('pv-switch'), 'checked × 상태 (눌러서 바꿔 볼 수 있음)', 'checked', [false, true], ['default', 'focus', 'disabled'], function (r, c) { return switchEl(r, c); });
  }
  function renderLabel() {
    gridTable(document.getElementById('pv-label'), 'Required × 상태', 'Required', [false, true], ['default', 'disabled'], function (req, st) {
      var l = el('label', 'k-label' + (st === 'disabled' ? ' k-state-disabled' : ''));
      if (req) { var dot = el('span', 'k-required'); dot.setAttribute('aria-hidden', 'true'); l.appendChild(dot); }
      l.appendChild(document.createTextNode('라벨'));
      return l;
    });
  }

  // Badge · Chip · Separator
  var X_ICON = '<path d="M18 6 6 18"/><path d="m6 6 12 12"/>';
  function renderBadge() {
    var host = document.getElementById('pv-badge');
    var variants = [['default', 'k-badge-solid-primary'], ['secondary', 'k-badge-solid-secondary'], ['destructive', 'k-badge-solid-error'], ['outline', 'k-badge-outline-base']];
    gridTable(host, 'variant × 아이콘', 'Show Icon', [false, true], variants.map(function (v) { return v[0]; }), function (withIcon, name) {
      var cls = variants.filter(function (v) { return v[0] === name; })[0][1];
      var b = el('span', 'k-badge k-badge-md ' + cls);
      b.innerHTML = (withIcon ? smallIcon(ICON.plus) : '') + '배지';
      return b;
    });
  }
  function renderChip() {
    var host = document.getElementById('pv-chip');
    host.appendChild(el('h3', 'pv-group-title text-sm-semibold', 'Show Remove: 켬 · 끔'));
    var row = el('div', 'pv-btn-row');
    [['품목 · 냉동면', true], ['기간 · 이번 주', true], ['라인 · 4호', false]].forEach(function (c) {
      var chip = el('span', 'k-chip k-chip-md');
      chip.innerHTML = '<span class="k-chip-content"><span class="k-chip-label"></span></span>' +
        (c[1] ? '<span class="k-chip-actions"><button type="button" class="k-chip-action k-chip-remove-action">' + smallIcon(X_ICON) + '</button></span>' : '');
      chip.querySelector('.k-chip-label').textContent = c[0];
      var x = chip.querySelector('button');
      if (x) x.setAttribute('aria-label', c[0].split(' · ')[0] + ' 조건 해제');
      row.appendChild(chip);
    });
    host.appendChild(row);
  }
  function renderSeparator() {
    var host = document.getElementById('pv-separator');
    host.appendChild(el('h3', 'pv-group-title text-sm-semibold', 'horizontal'));
    host.appendChild(el('hr', 'k-separator k-separator-horizontal'));
    host.appendChild(el('h3', 'pv-group-title text-sm-semibold', 'vertical (가로 줄 안)'));
    var row = el('div', 'pv-btn-row');
    var v = el('span', 'k-separator k-separator-vertical');
    v.setAttribute('role', 'separator');
    v.setAttribute('aria-orientation', 'vertical');
    row.append(el('span', 'text-control-regular', '조회'), v, el('span', 'text-control-regular', '등록'));
    host.appendChild(row);
  }

  // DropDownList · Tooltip · Loader · Skeleton
  var ddSeq = 0;
  var CHECK_PATH = '<path d="M20 6 9 17l-5-5"/>';
  function dropdown(opts) {
    opts = opts || {};
    var id = 'pv-dd-' + (++ddSeq);
    var box = el('div', 'k-dropdownlist k-picker ' + (opts.sm ? 'k-picker-sm' : 'k-picker-md') + (opts.state === 'focus' ? ' k-state-focused' : ''));
    var items = opts.items || ['조립 1라인', '조립 2라인', '도장 라인', '포장 라인'];
    box.innerHTML =
      '<button type="button" class="k-input-inner" role="combobox" aria-haspopup="listbox" aria-expanded="false" aria-controls="' + id + '-list" aria-label="라인">' +
        '<span class="k-input-value-text"></span><span class="k-input-button" aria-hidden="true">' + smallIcon(CHEV_DOWN) + '</span></button>' +
      '<div class="k-popup k-list-container" hidden><ul class="k-list-ul" role="listbox" id="' + id + '-list" aria-label="라인"></ul></div>' +
      '<input type="hidden" name="' + id + '">';
    var ul = box.querySelector('ul');
    items.forEach(function (t, i) {
      var li = el('li', 'k-list-item');
      li.setAttribute('role', 'option');
      li.setAttribute('aria-selected', String(!!opts.filled && i === 0));
      if (i === 2) li.setAttribute('aria-disabled', 'true');
      li.dataset.value = 'L' + i;
      li.appendChild(el('span', 'k-list-item-text', t));
      ul.appendChild(li);
    });
    var v = box.querySelector('.k-input-value-text');
    if (opts.filled) { v.textContent = items[0]; } else { v.textContent = '선택하세요'; v.setAttribute('data-placeholder', ''); }
    var btn = box.querySelector('button');
    if (opts.state === 'disabled') btn.disabled = true;
    if (opts.state === 'invalid') btn.setAttribute('aria-invalid', 'true');
    return box;
  }
  function renderDropdown() {
    var host = document.getElementById('pv-dropdownlist');
    host.appendChild(el('h3', 'pv-group-title text-sm-semibold', '직접 눌러 보기'));
    var live = el('div', 'pv-input-table'); live.appendChild(dropdown({})); host.appendChild(live);
    [['md', false], ['sm', true]].forEach(function (sz) {
      stateTable(host, 'size=' + sz[0] + ' · 상태 × filled', function (s, filled) { return dropdown({ sm: sz[1], state: s, filled: filled }); });
    });
    host.appendChild(el('h3', 'pv-group-title text-sm-semibold', '목록 상자 · 목록 줄 (고름 · 가리킴 · 비활성)'));
    var pop = el('div', 'k-popup k-list-container pv-popup-demo');
    var ul = el('ul', 'k-list-ul'); ul.setAttribute('role', 'listbox'); ul.setAttribute('aria-label', '목록 줄 예시');
    [['조립 1라인', 'selected'], ['조립 2라인', 'focus'], ['도장 라인', ''], ['포장 라인', 'disabled'], ['검사 라인', 'selected-disabled']].forEach(function (c) {
      var li = el('li', 'k-list-item' + (c[1] === 'focus' ? ' k-focus' : ''));
      li.setAttribute('role', 'option');
      li.setAttribute('aria-selected', String(c[1].indexOf('selected') === 0));
      if (c[1].indexOf('disabled') >= 0) li.setAttribute('aria-disabled', 'true');
      li.appendChild(el('span', 'k-list-item-text', c[0]));
      ul.appendChild(li);
    });
    pop.appendChild(ul);
    host.appendChild(pop);
  }
  function renderTooltip() {
    var host = document.getElementById('pv-tooltip');
    host.appendChild(el('h3', 'pv-group-title text-sm-semibold', '직접 올려 보기 (위 · 오른쪽 · 아래 · 왼쪽)'));
    var row = el('div', 'pv-btn-row pv-tip-row');
    ['top', 'right', 'bottom', 'left'].forEach(function (side) {
      var b = btn('k-button-md k-button-outline-base', side);
      b.setAttribute('data-tooltip', '도움말 · ' + side);
      b.setAttribute('data-tooltip-side', side);
      row.appendChild(b);
    });
    host.appendChild(row);
    host.appendChild(el('h3', 'pv-group-title text-sm-semibold', '모양 (side별)'));
    var demo = el('div', 'pv-btn-row pv-tip-demo');
    ['top', 'right', 'bottom', 'left'].forEach(function (side) {
      var t = el('div', 'k-tooltip k-tooltip-' + side);
      t.innerHTML = '<div class="k-tooltip-content">툴팁</div>';
      demo.appendChild(t);
    });
    host.appendChild(demo);
  }
  function renderLoader() {
    var host = document.getElementById('pv-loader');
    var row = el('div', 'pv-btn-row');
    var l = el('span', 'k-loader');
    l.setAttribute('role', 'status'); l.setAttribute('aria-label', '불러오는 중');
    l.innerHTML = '<svg class="k-svg-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>';
    var inBtn = btn('k-button-md k-button-solid-primary', '저장 중');
    inBtn.disabled = true;
    var l2 = l.cloneNode(true); l2.setAttribute('aria-label', '저장 중');
    inBtn.insertBefore(l2, inBtn.firstChild);
    row.append(l, inBtn);
    host.appendChild(row);
  }
  function renderSkeleton() {
    var host = document.getElementById('pv-skeleton');
    var box = el('div', 'pv-skel');
    box.setAttribute('aria-busy', 'true');
    ['pv-skel--w1', 'pv-skel--w2', 'pv-skel--w3'].forEach(function (w) {
      var s = el('span', 'k-skeleton k-skeleton-rect ' + w);
      s.setAttribute('aria-hidden', 'true');
      box.appendChild(s);
    });
    host.appendChild(box);
  }

  // Grid
  var SORT_PATH = '<path d="m21 16-4 4-4-4"/><path d="M17 20V4"/><path d="m3 8 4-4 4 4"/><path d="M7 4v16"/>';
  var DOTS_PATH = '<circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/>';
  function gridTableEl(rows, opts) {
    opts = opts || {};
    var wrap = el('div', 'k-grid');
    var t = el('table', 'k-grid-table');
    var head = el('thead', 'k-grid-header');
    if (opts.group) {
      var g = el('tr');
      g.innerHTML = '<th class="k-header" scope="col" rowspan="2">품목코드</th><th class="k-header" scope="colgroup" colspan="2">계획</th><th class="k-header" scope="colgroup" colspan="2">실적</th>';
      head.appendChild(g);
      var g2 = el('tr');
      g2.innerHTML = '<th class="k-header k-text-right" scope="col">수량</th><th class="k-header k-text-right" scope="col">중량</th><th class="k-header k-text-right" scope="col">수량</th><th class="k-header k-text-right" scope="col">중량</th>';
      head.appendChild(g2);
    } else {
      var h = el('tr');
      h.innerHTML = '<th class="k-header k-checkbox-column" scope="col"><input type="checkbox" class="k-checkbox" aria-label="전체 선택"></th>' +
        '<th class="k-header" scope="col"><span class="k-required" aria-hidden="true"></span>품목코드</th>' +
        '<th class="k-header" scope="col" aria-sort="none"><button type="button" class="k-link">품명' + smallIcon(SORT_PATH).replace('stroke-linecap', 'stroke-width="2" stroke-linecap') + '</button></th>' +
        '<th class="k-header" scope="col">라인</th>' +
        '<th class="k-header k-text-right" scope="col">수량</th>' +
        '<th class="k-header k-text-center" scope="col">검사</th>' +
        '<th class="k-header k-command-cell" scope="col"><span class="k-sr-only">메뉴</span></th>';
      head.appendChild(h);
    }
    t.appendChild(head);
    var body = el('tbody');
    if (!rows.length) {
      var nr = el('tr', 'k-grid-norecords');
      nr.innerHTML = '<td colspan="' + (opts.group ? 5 : 7) + '">표시할 데이터가 없습니다</td>';
      body.appendChild(nr);
    }
    rows.forEach(function (r, i) {
      var tr = el('tr', 'k-master-row' + (r.hover ? ' k-hover' : ''));
      tr.setAttribute('aria-selected', String(!!r.selected));
      if (opts.group) {
        tr.innerHTML = '<td>' + r.code + '</td><td class="k-text-right">1,200</td><td class="k-text-right">480.0</td><td class="k-text-right">1,250</td><td class="k-text-right">500.5</td>';
      } else {
        tr.innerHTML = '<td class="k-checkbox-column"><input type="checkbox" class="k-checkbox"' + (r.selected ? ' checked' : '') + ' aria-label="' + r.code + ' 선택"></td>' +
          '<td>' + r.code + '</td><td>' + r.name + '</td><td class="k-color-subtle">' + r.line + '</td><td class="k-text-right">' + r.qty + '</td>' +
          '<td class="k-text-center"><input type="checkbox" class="k-checkbox"' + (i % 2 ? '' : ' checked') + ' aria-label="' + r.code + ' 검사 여부"></td>' +
          '<td class="k-command-cell"><button type="button" class="k-button k-icon-button k-button-flat-base k-button-sm" aria-label="' + r.code + ' 메뉴">' + smallIcon(DOTS_PATH).replace('stroke-linecap', 'stroke-width="2" stroke-linecap') + '</button></td>';
      }
      body.appendChild(tr);
    });
    t.appendChild(body);
    wrap.appendChild(t);
    return wrap;
  }
  function renderGrid() {
    var host = document.getElementById('pv-grid');
    var rows = [
      { code: '100001', name: '냉동면 4호', line: '조립 1라인', qty: '1,250' },
      { code: '100002', name: '생면 2호', line: '조립 2라인', qty: '980', hover: true },
      { code: '100003', name: '건면 1호', line: '포장 라인', qty: '12,400', selected: true },
      { code: '100004', name: '냉동면 6호', line: '조립 1라인', qty: '75' }
    ];
    host.appendChild(el('h3', 'pv-group-title text-sm-semibold', '기본 (default · hover · selected)'));
    host.appendChild(gridTableEl(rows));
    host.appendChild(el('h3', 'pv-group-title text-sm-semibold', '2단 머리글 (묶음 칸)'));
    host.appendChild(gridTableEl(rows.slice(0, 2), { group: true }));
    host.appendChild(el('h3', 'pv-group-title text-sm-semibold', '숫자 입력 칸 (기본 · 포커스 · 오류 · 꺼짐 · 고른 줄)'));
    host.appendChild(gridInputEl());
    host.appendChild(el('h3', 'pv-group-title text-sm-semibold', '글자 입력 칸 · 목록 고르기 칸 (기본 · 오류 · 꺼짐) — 목록을 눌러 보기'));
    host.appendChild(gridEditEl());
    host.appendChild(el('h3', 'pv-group-title text-sm-semibold', '빈 표 (state=empty)'));
    host.appendChild(gridTableEl([]));
  }
  function gridEditEl() {
    var CHEV = '<svg class="k-svg-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="m6 9 6 6 6-6"/></svg>';
    var OPTS = ['적합', '한계', '부적합'];
    var rows = [
      { item: '수분', val: '적합', note: '이상 없음' },
      { item: '염도', val: '', note: '', invalid: true },
      { item: '이물', val: '', note: '', off: true }
    ];
    function dd(r, i) {
      var id = 'pv-gdd-' + i;
      var list = OPTS.map(function (o, k) {
        return '<li class="k-list-item" role="option" aria-selected="' + (o === r.val) + '" data-value="' + k + '"><span class="k-list-item-text">' + o + '</span></li>';
      }).join('');
      return '<div class="k-dropdownlist k-picker k-picker-sm"><button type="button" class="k-input-inner" role="combobox" aria-haspopup="listbox" aria-expanded="false" aria-controls="' + id + '" aria-label="' + r.item + ' 판정"' +
        (r.invalid ? ' aria-invalid="true"' : '') + (r.off ? ' disabled' : '') + '><span class="k-input-value-text"' + (r.val ? '' : ' data-placeholder') + '>' + (r.val || '선택') + '</span><span class="k-input-button" aria-hidden="true">' + CHEV + '</span></button>' +
        '<div class="k-popup k-list-container" hidden><ul class="k-list-ul" role="listbox" id="' + id + '">' + list + '</ul></div><input type="hidden"></div>';
    }
    var wrap = el('div', 'k-grid');
    var t = el('table', 'k-grid-table');
    t.innerHTML = '<thead class="k-grid-header"><tr><th class="k-header" scope="col">검사항목</th><th class="k-header" scope="col">판정</th><th class="k-header" scope="col">특이사항</th></tr></thead>';
    var body = el('tbody');
    rows.forEach(function (r, i) {
      var tr = el('tr', 'k-master-row');
      tr.setAttribute('aria-selected', 'false');
      tr.innerHTML = '<td>' + r.item + '</td><td>' + dd(r, i) + '</td>' +
        '<td><input type="text" class="k-textbox" value="' + r.note + '" aria-label="' + r.item + ' 특이사항"' + (r.invalid ? ' aria-invalid="true"' : '') + (r.off ? ' disabled' : '') + '></td>';
      body.appendChild(tr);
    });
    t.appendChild(body);
    wrap.appendChild(t);
    return wrap;
  }
  function gridInputEl() {
    var rows = [
      { id: 'QI-001', name: '성상', val: '1', on: true },
      { id: 'QI-002', name: '수분', val: '2', on: true, state: 'focus' },
      { id: 'QI-003', name: '염도', val: '2', on: true, state: 'invalid' },
      { id: 'QI-004', name: '이물', val: '', on: false },
      { id: 'QI-005', name: '중량', val: '3', on: true, selected: true }
    ];
    var wrap = el('div', 'k-grid');
    var t = el('table', 'k-grid-table');
    var head = el('thead', 'k-grid-header');
    var h = el('tr');
    h.innerHTML = '<th class="k-header k-checkbox-column" scope="col"><input type="checkbox" class="k-checkbox" aria-label="전체 선택"></th>' +
      '<th class="k-header" scope="col">검사항목 ID</th><th class="k-header" scope="col">검사항목명</th>' +
      '<th class="k-header k-text-right" scope="col">출력순서</th>';
    head.appendChild(h);
    t.appendChild(head);
    var body = el('tbody');
    rows.forEach(function (r) {
      var tr = el('tr', 'k-master-row');
      tr.setAttribute('aria-selected', String(!!r.selected));
      var cls = 'k-textbox' + (r.state === 'focus' ? ' k-state-focused' : '');
      tr.innerHTML = '<td class="k-checkbox-column"><input type="checkbox" class="k-checkbox"' + (r.on ? ' checked' : '') + ' aria-label="' + r.id + ' 선택"></td>' +
        '<td>' + r.id + '</td><td>' + r.name + '</td>' +
        '<td class="k-text-right"><input type="text" inputmode="numeric" class="' + cls + '" value="' + r.val + '" aria-label="' + r.name + ' 출력순서"' +
        (r.state === 'invalid' ? ' aria-invalid="true"' : '') + (r.on ? '' : ' disabled') + '></td>';
      body.appendChild(tr);
    });
    t.appendChild(body);
    wrap.appendChild(t);
    return wrap;
  }

  // Tabs
  var tabSeq = 0;
  function tabstrip(variant, labels, opts) {
    opts = opts || {};
    var strip = el('div', 'k-tabstrip k-tabstrip-top' + (variant === 'pill' ? ' ux-tabstrip-pill' : ''));
    var wrap = el('div', 'k-tabstrip-items-wrapper');
    var ul = el('ul', 'k-tabstrip-items');
    ul.setAttribute('role', 'tablist');
    ul.setAttribute('aria-label', (variant === 'pill' ? '알약형' : '밑줄형') + ' 탭 예시');
    var panels = [];
    labels.forEach(function (label, i) {
      var id = 'pv-tab-' + (++tabSeq);
      var st = (opts.states || [])[i] || '';
      var active = i === (opts.active || 0);
      var li = el('li', 'k-item' + (active ? ' k-state-active' : '') + (st === 'focus' ? ' k-state-focused' : '') + (st === 'disabled' ? ' k-state-disabled' : ''));
      li.setAttribute('role', 'presentation');
      var b = el('button', 'k-link', label);
      b.type = 'button';
      b.id = id;
      b.setAttribute('role', 'tab');
      b.setAttribute('aria-selected', String(active));
      if (!active) b.tabIndex = -1;
      if (st === 'disabled') b.disabled = true;
      if (opts.panels) b.setAttribute('aria-controls', id + '-p');
      li.appendChild(b);
      ul.appendChild(li);
      if (opts.panels) {
        var pnl = el('div', 'k-content k-tabstrip-content' + (active ? ' k-state-active' : ''), label + ' 내용 칸');
        pnl.id = id + '-p';
        pnl.setAttribute('role', 'tabpanel');
        pnl.setAttribute('aria-labelledby', id);
        pnl.tabIndex = 0;
        pnl.hidden = !active;
        panels.push(pnl);
      }
    });
    wrap.appendChild(ul);
    strip.appendChild(wrap);
    panels.forEach(function (pn) { strip.appendChild(pn); });
    return strip;
  }
  function renderTabs() {
    var host = document.getElementById('pv-tabs');
    ['line', 'pill'].forEach(function (v) {
      host.appendChild(el('h3', 'pv-group-title text-sm-semibold', (v === 'line' ? '밑줄형 (기본)' : '알약형 · ux-tabstrip-pill') + ' — 눌러 보기'));
      host.appendChild(tabstrip(v, ['기본 정보', '점검 이력', '알람', '설정'], { panels: true }));
    });
    host.appendChild(el('h3', 'pv-group-title text-sm-semibold', '상태 (고른 탭 · 안 고른 탭 × default · focus · disabled)'));
    ['line', 'pill'].forEach(function (v) {
      var r2 = el('div', 'pv-btn-row pv-tab-states');
      ['default', 'focus', 'disabled'].forEach(function (st) {
        r2.appendChild(tabstrip(v, [st + ' · 고름', st], { active: 0, states: st === 'default' ? [] : [st, st] }));
      });
      host.appendChild(r2);
    });
  }

  // Pager
  var CHEV_L = '<path d="m15 18-6-6 6-6"/>', CHEV_R = '<path d="m9 18 6-6-6-6"/>';
  var CHEVS_L = '<path d="m11 17-5-5 5-5"/><path d="m18 17-5-5 5-5"/>';
  var CHEVS_R = '<path d="m6 17 5-5-5-5"/><path d="m13 17 5-5-5-5"/>';
  function pagerEl(current, total, opts) {
    opts = opts || {};
    var nav = el('nav', 'k-pager');
    nav.setAttribute('aria-label', '페이지' + (opts.label ? ' ' + opts.label : ''));
    var icon16 = function (pth) { return smallIcon(pth).replace('stroke-linecap', 'stroke-width="2" stroke-linecap'); };
    var prev, next;
    if (opts.iconNav) {
      prev = el('a', 'k-link k-pager-nav k-pager-prev'); prev.innerHTML = icon16(CHEV_L);
      prev.setAttribute('aria-label', '이전 페이지'); prev.setAttribute('data-tooltip', '이전 페이지');
      next = el('a', 'k-link k-pager-nav k-pager-next'); next.innerHTML = icon16(CHEV_R);
      next.setAttribute('aria-label', '다음 페이지'); next.setAttribute('data-tooltip', '다음 페이지');
    } else {
      prev = el('a', 'k-link k-pager-nav'); prev.innerHTML = icon16(CHEV_L) + '이전';
      next = el('a', 'k-link k-pager-nav'); next.innerHTML = '다음' + icon16(CHEV_R);
    }
    if (current === 1) prev.setAttribute('aria-disabled', 'true'); else prev.href = '#pager';
    if (current === total) next.setAttribute('aria-disabled', 'true'); else next.href = '#pager';
    if (opts.hoverPrev) prev.classList.add('k-state-hover');
    var ul = el('ul', 'k-pager-numbers');
    [1, 2, 3, 'ellipsis', total].forEach(function (n) {
      var li = el('li');
      if (n === 'ellipsis') {
        var e = el('span', 'ux-pager-ellipsis'); e.setAttribute('aria-hidden', 'true'); e.innerHTML = icon16(DOTS_PATH); li.appendChild(e);
      } else {
        var a = el('a', 'k-link' + (opts.hover === n ? ' k-state-hover' : ''), String(n)); a.href = '#pager';
        if (n === current) a.setAttribute('aria-current', 'page');
        li.appendChild(a);
      }
      ul.appendChild(li);
    });
    var items = [prev, ul, next];
    if (opts.edges) {
      var first = el('a', 'k-link k-pager-nav k-pager-first'); first.innerHTML = icon16(CHEVS_L);
      first.setAttribute('aria-label', '첫 페이지'); first.setAttribute('data-tooltip', '첫 페이지로 이동');
      if (current === 1) first.setAttribute('aria-disabled', 'true'); else first.href = '#pager';
      var last = el('a', 'k-link k-pager-nav k-pager-last'); last.innerHTML = icon16(CHEVS_R);
      last.setAttribute('aria-label', '마지막 페이지'); last.setAttribute('data-tooltip', '마지막 페이지로 이동');
      if (current === total) last.setAttribute('aria-disabled', 'true'); else last.href = '#pager';
      if (opts.hoverEdge === 'first') first.classList.add('k-state-hover');
      if (opts.hoverEdge === 'last') last.classList.add('k-state-hover');
      items = [first].concat(items, [last]);
    }
    nav.append.apply(nav, items);
    if (opts.hoverNav) next.classList.add('k-state-hover');
    return nav;
  }
  function renderPager() {
    var host = document.getElementById('pv-pager');
    host.appendChild(el('h3', 'pv-group-title text-sm-semibold', '첫 페이지 (이전 못 누름)'));
    host.appendChild(pagerEl(1, 10, { label: '예시 1' }));
    host.appendChild(el('h3', 'pv-group-title text-sm-semibold', '마우스 올림: 3번 · 현재 페이지(2) · 다음'));
    host.appendChild(pagerEl(2, 10, { label: '예시 2', hover: 3, hoverNav: true }));
    var cur = host.querySelectorAll('nav')[1].querySelector('[aria-current]'); cur.classList.add('k-state-hover');
    host.appendChild(el('h3', 'pv-group-title text-sm-semibold', '끝 페이지 (다음 못 누름)'));
    host.appendChild(pagerEl(10, 10, { label: '예시 3' }));
    host.appendChild(el('h3', 'pv-group-title text-sm-semibold', '처음 · 마지막 버튼 — 첫 페이지(처음 = 흰 바탕) · 마우스 올림: 마지막'));
    host.appendChild(pagerEl(1, 10, { label: '예시 4', edges: true, hoverEdge: 'last' }));
    host.appendChild(el('h3', 'pv-group-title text-sm-semibold', '처음 · 마지막 버튼 — 끝 페이지(마지막 = 흰 바탕) · 마우스 올림: 처음'));
    host.appendChild(pagerEl(10, 10, { label: '예시 5', edges: true, hoverEdge: 'first' }));
    host.appendChild(el('h3', 'pv-group-title text-sm-semibold', '이전 · 다음 아이콘만 — 첫 페이지(< = 흰 바탕) · 마우스 올림: >'));
    host.appendChild(pagerEl(1, 10, { label: '예시 6', iconNav: true, hoverNav: true }));
    host.appendChild(el('h3', 'pv-group-title text-sm-semibold', '이전 · 다음 아이콘만 — 끝 페이지(> = 흰 바탕) · 마우스 올림: < · 처음 · 마지막과 같이'));
    host.appendChild(pagerEl(10, 10, { label: '예시 7', iconNav: true, hoverPrev: true, edges: true }));
  }

  // Dialog
  function dialogEl(id, kind, open) {
    var isAlert = kind === 'alert';
    var d = el('dialog', 'k-window k-dialog' + (isAlert ? ' k-alert' : '') + (open === 'static' ? ' pv-dialog-static' : ''));
    d.id = id;
    if (open === 'static') d.setAttribute('open', '');   // 모양 예시: 모달이 아닌 펼친 상태
    if (isAlert) d.setAttribute('role', 'alertdialog');
    d.setAttribute('aria-labelledby', id + '-t');
    d.setAttribute('aria-describedby', id + '-d');
    d.innerHTML =
      '<div class="k-window-titlebar k-dialog-titlebar">' +
        '<h3 class="k-window-title" id="' + id + '-t">' + (isAlert ? '설비를 삭제할까요?' : '검사 실적 등록') + '</h3>' +
        '<p class="k-dialog-description" id="' + id + '-d">' + (isAlert ? '삭제한 설비는 되돌릴 수 없습니다.' : '검사 항목별 값을 입력합니다.') + '</p>' +
      '</div>' +
      (isAlert ? '' : '<div class="k-window-content k-dialog-content"><div class="ux-design-needed pv-dn">디자인 필요: 팝업 내용 (Dialog Content는 패턴 단계)</div></div>') +
      '<div class="k-dialog-actions">' +
        '<button type="button" class="k-button k-button-md k-button-outline-base" data-dialog-close="cancel"><span class="k-button-text">취소</span></button>' +
        '<button type="button" class="k-button k-button-md ' + (isAlert ? 'k-button-solid-error' : 'k-button-solid-primary') + '" data-dialog-close="ok"><span class="k-button-text">' + (isAlert ? '삭제' : '저장') + '</span></button>' +
      '</div>' +
      (isAlert ? '' : '<button type="button" class="k-window-action k-dialog-close" data-dialog-close="close" aria-label="닫기">' + smallIcon(X_ICON).replace('stroke-linecap', 'stroke-width="2" stroke-linecap') + '</button>');
    return d;
  }
  function renderDialog() {
    var host = document.getElementById('pv-dialog');
    host.appendChild(el('h3', 'pv-group-title text-sm-semibold', '직접 열어 보기'));
    var row = el('div', 'pv-btn-row');
    var b1 = btn('k-button-md k-button-outline-base', 'Dialog 열기'); b1.setAttribute('data-dialog-open', 'pv-dlg-live');
    var b2 = btn('k-button-md k-button-outline-base', 'Alert 열기'); b2.setAttribute('data-dialog-open', 'pv-alert-live');
    var b3 = btn('k-button-md k-button-outline-base', '큰 팝업(1080) 열기'); b3.setAttribute('data-dialog-open', 'pv-dlg-lg');
    row.append(b1, b2, b3);
    host.appendChild(row);
    host.appendChild(dialogEl('pv-dlg-live', 'dialog'));
    var lg = dialogEl('pv-dlg-lg', 'dialog');
    lg.classList.add('ux-dialog-lg');
    host.appendChild(lg);
    host.appendChild(dialogEl('pv-alert-live', 'alert'));
    host.appendChild(el('h3', 'pv-group-title text-sm-semibold', '모양 (Dialog · Alert)'));
    var demo = el('div', 'pv-dialog-demo');
    demo.append(dialogEl('pv-dlg-s', 'dialog', 'static'), dialogEl('pv-alert-s', 'alert', 'static'));
    host.appendChild(demo);
  }

  // Toast · Inline
  var ALERT_PATH = '<circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/>';
  function renderNotification() {
    var host = document.getElementById('pv-notification');
    host.appendChild(el('h3', 'pv-group-title text-sm-semibold', 'Toast 띄워 보기'));
    var row = el('div', 'pv-btn-row');
    [['default', '저장되었습니다'], ['success', '저장되었습니다'], ['info', '새 작업지시가 있습니다'], ['warning', '재고가 부족합니다'], ['error', '저장하지 못했습니다']].forEach(function (c) {
      var b = btn('k-button-md k-button-outline-base', c[0]);
      b.addEventListener('click', function () {
        window.LotteDS.toast({ type: c[0], title: c[1], description: '2026-09-23 14:30', action: c[0] === 'default' ? '실행 취소' : '' });
      });
      row.appendChild(b);
    });
    host.appendChild(row);
    host.appendChild(el('h3', 'pv-group-title text-sm-semibold', 'Toast 모양 (type 5종, default는 실행 버튼 켬)'));
    var demo = el('div', 'pv-toast-demo');
    ['default', 'success', 'info', 'warning', 'error'].forEach(function (t) {
      var n = window.LotteDS.toast({ type: t, title: '저장되었습니다', description: '2026-09-23 14:30', action: t === 'default' ? '실행 취소' : '', duration: 2147483647 });
      n.setAttribute('role', 'group');
      demo.appendChild(n);
    });
    host.appendChild(demo);
    host.appendChild(el('h3', 'pv-group-title text-sm-semibold', 'Inline (default · destructive)'));
    var inl = el('div', 'pv-inline-demo');
    [['', '알림', '확인이 필요한 내용이 있습니다.'], ['ux-alert-error', '저장하지 못했습니다', 'LOT NO를 확인하고 다시 저장해 주세요.']].forEach(function (c) {
      var a = el('div', 'ux-alert ' + c[0]);
      a.setAttribute('role', 'note');
      a.innerHTML = smallIcon(ALERT_PATH).replace('stroke-linecap', 'stroke-width="2" stroke-linecap') + '<div class="ux-alert-text"><p class="ux-alert-title"></p><p class="ux-alert-description"></p></div>';
      a.querySelector('.ux-alert-title').textContent = c[1];
      a.querySelector('.ux-alert-description').textContent = c[2];
      inl.appendChild(a);
    });
    host.appendChild(inl);
  }

  var formSeq = 0;
  function formItem(control, error) {
    var id = 'pv-fm-' + (++formSeq);
    var f = el('div', 'k-form-field');
    var desc = id + '-hint' + (error ? ' ' + id + '-err' : '');
    if (control === 'checkbox') {
      var row = el('div', 'ux-form-check');
      row.innerHTML = '<input type="checkbox" class="k-checkbox k-checkbox-md" id="' + id + '" aria-describedby="' + desc + '"' + (error ? ' aria-invalid="true"' : '') + '><label class="k-checkbox-label" for="' + id + '">확인</label>';
      f.appendChild(row);
    } else {
      var lab = el('label', 'k-label k-form-label', control === 'select' ? '라인' : control === 'textarea' ? '특이사항' : 'LOT NO');
      if (control === 'select') {
        lab.id = id + '-l';
        f.appendChild(lab);
        var dd = dropdown({ state: error ? 'invalid' : '' });
        var b = dd.querySelector('button');
        b.removeAttribute('aria-label');
        b.setAttribute('aria-labelledby', id + '-l');
        b.setAttribute('aria-describedby', desc);
        f.appendChild(dd);
      } else {
        lab.htmlFor = id;
        f.appendChild(lab);
        var c = control === 'textarea' ? el('textarea', 'k-textarea') : el('input', 'k-textbox k-input k-input-md');
        if (control !== 'textarea') c.type = 'text';
        c.id = id;
        c.placeholder = '내용을 입력하세요';
        c.setAttribute('aria-describedby', desc);
        if (error) c.setAttribute('aria-invalid', 'true');
        f.appendChild(c);
      }
    }
    var h = el('p', 'k-form-hint', '도움말을 입력합니다.'); h.id = id + '-hint'; f.appendChild(h);
    if (error) { var m = el('p', 'k-form-error', '입력값을 확인하세요.'); m.id = id + '-err'; f.appendChild(m); }
    return f;
  }
  function renderForm() {
    var host = document.getElementById('pv-form');
    host.appendChild(el('h3', 'pv-group-title text-sm-semibold', 'Form (항목 간격 32)'));
    var form = el('form', 'k-form pv-form-demo');
    form.noValidate = true;
    form.appendChild(formItem('input', false));
    form.appendChild(formItem('select', false));
    form.appendChild(formItem('textarea', true));
    var bt = el('div', 'k-form-buttons');
    var sb = btn('k-button-md k-button-solid-primary', '저장');
    sb.type = 'submit';
    bt.appendChild(sb);
    form.appendChild(bt);
    form.addEventListener('submit', function (e) { e.preventDefault(); });
    host.appendChild(form);
    host.appendChild(el('h3', 'pv-group-title text-sm-semibold', 'Form / Item (control 4 × state 2)'));
    var grid = el('div', 'pv-form-grid');
    ['input', 'textarea', 'select', 'checkbox'].forEach(function (c) {
      [false, true].forEach(function (er) {
        var cell = el('div', 'pv-form-cell');
        cell.appendChild(el('p', 'pv-form-cap text-xs-medium', c + ' · ' + (er ? 'error' : 'default')));
        cell.appendChild(formItem(c, er));
        grid.appendChild(cell);
      });
    });
    host.appendChild(grid);
  }

  var TREND_UP = '<path d="M16 7h6v6"/><path d="m22 7-8.5 8.5-5-5L2 17"/>';
  var TREND_DOWN = '<path d="M16 17h6v-6"/><path d="m22 17-8.5-8.5-5 5L2 7"/>';
  function trendIcon(p) { return '<svg class="k-svg-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">' + p + '</svg>'; }
  function renderCard() {
    var host = document.getElementById('pv-card');
    host.appendChild(el('h3', 'pv-group-title text-sm-semibold', 'Card (실행 없음 · 실행 있음 · 설명·아래 버튼 없음)'));
    var row = el('div', 'pv-card-row');
    [[false, true, true], [true, true, true], [false, false, false]].forEach(function (c, i) {
      var a = el('article', 'k-card pv-card-demo');
      var hid = 'pv-card-t' + i;
      a.setAttribute('aria-labelledby', hid);
      var h = el('div', 'k-card-header');
      var t = el('h4', 'k-card-title', '카드 제목'); t.id = hid; h.appendChild(t);
      if (c[1]) h.appendChild(el('p', 'k-card-subtitle', '카드 설명'));
      if (c[0]) { var ab = btn('k-button-sm k-button-link-primary ux-card-action', '보기'); h.appendChild(ab); }
      a.appendChild(h);
      var b = el('div', 'k-card-body');
      b.appendChild(el('div', 'pv-slot text-sm-regular', '내용 자리'));
      a.appendChild(b);
      if (c[2]) { var f = el('div', 'k-card-footer'); f.appendChild(btn('k-button-md k-button-solid-primary', '저장')); a.appendChild(f); }
      row.appendChild(a);
    });
    host.appendChild(row);
    host.appendChild(el('h3', 'pv-group-title text-sm-semibold', 'Card / Stat (trend × tone)'));
    var grid = el('div', 'pv-stat-row');
    [['up', ''], ['down', ''], ['up', 'emphasis'], ['down', 'emphasis']].forEach(function (c) {
      var up = c[0] === 'up';
      var a = el('article', 'k-card ux-card-stat' + (c[1] ? ' ux-card-stat-emphasis' : ''));
      a.innerHTML = '<div class="k-card-header"><p class="k-card-subtitle">오늘 생산량</p><p class="k-card-title">1,250</p>' +
        '<span class="k-badge k-badge-md k-badge-outline-base ux-card-action">' + trendIcon(up ? TREND_UP : TREND_DOWN) + (up ? '+12.5%' : '-20%') + '</span></div>' +
        '<div class="k-card-footer"><p class="ux-card-stat-summary">' + (up ? '지난주 대비 증가' : '지난주 대비 감소') + trendIcon(up ? TREND_UP : TREND_DOWN) + '</p><p class="ux-card-stat-detail">최근 6개월 기준</p></div>';
      grid.appendChild(a);
    });
    host.appendChild(grid);
  }

  var IC_DASH = '<rect width="7" height="9" x="3" y="3" rx="1"/><rect width="7" height="5" x="14" y="3" rx="1"/><rect width="7" height="9" x="14" y="12" rx="1"/><rect width="7" height="5" x="3" y="16" rx="1"/>';
  var IC_CHEV_R = '<path d="m9 18 6-6-6-6"/>';
  var IC_PANEL = '<rect width="18" height="18" x="3" y="3" rx="2"/><path d="M9 3v18"/>';
  function svg(p, cls) { return '<svg class="k-svg-icon' + (cls ? ' ' + cls : '') + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">' + p + '</svg>'; }
  function avatarHtml(t) { return '<span class="k-avatar k-avatar-circle" aria-hidden="true"><span class="k-avatar-text">' + t + '</span></span>'; }
  function brandHtml(opts) {
    opts = opts || {};
    return '<div class="ux-drawer-brand">' + avatarHtml('관') + '<div class="ux-drawer-brand-text"><p class="ux-drawer-brand-name">서비스 이름' +
      (opts.noBadge ? '' : ' <span class="k-badge k-badge-md k-badge-outline-base">사내</span>') + '</p>' +
      (opts.noSub ? '' : '<p class="ux-drawer-brand-subtitle">부제</p>') + '</div></div>';
  }
  function userHtml(opts) {
    opts = opts || {};
    if (opts.avatarOnly) return '<div class="ux-drawer-user" role="img" aria-label="사용자 이름">' + avatarHtml('관') + '</div>';
    return '<div class="ux-drawer-user">' + avatarHtml('관') + '<div class="ux-drawer-user-text"><p class="ux-drawer-user-name">사용자 이름</p><p class="ux-drawer-user-email">user@example.com</p></div>' +
      (opts.chevron ? svg('<path d="m6 9 6 6 6-6"/>', 'ux-drawer-chevron') : '') + '</div>';
  }
  function drawerHtml(id, mini, footer) {
    var it = function (t, cur) { return '<li><a class="k-drawer-item" href="#' + id + '"' + (cur ? ' aria-current="page"' : '') + '>' + svg(IC_DASH) + '<span class="k-item-text">' + t + '</span></a></li>'; };
    return '<aside class="k-drawer k-drawer-start' + (mini ? ' k-drawer-mini' : '') + ' pv-drawer-demo" id="' + id + '"><div class="k-drawer-wrapper">' +
      '<div class="ux-drawer-header">' + brandHtml() + '</div>' +
      '<nav class="ux-drawer-content" aria-label="' + (mini ? '예시 메뉴(아이콘 모드)' : '예시 메뉴') + '"><div class="ux-drawer-group"><p class="ux-drawer-group-label">메뉴 그룹</p><ul class="k-drawer-items">' +
      it('대시보드', true) +
      '<li><button type="button" class="k-drawer-item" aria-expanded="true" aria-controls="' + id + '-sub">' + svg(IC_DASH) + '<span class="k-item-text">생산</span>' + svg(IC_CHEV_R, 'ux-drawer-chevron') + '</button>' +
      '<ul class="ux-drawer-sub" id="' + id + '-sub"><li><a class="ux-drawer-sub-item" href="#' + id + '" aria-current="page">작업지시</a></li><li><a class="ux-drawer-sub-item" href="#' + id + '">생산 실적</a></li><li><a class="ux-drawer-sub-item" href="#' + id + '">설비 가동</a></li></ul></li>' +
      it('품질') + it('설정') +
      '</ul></div></nav>' + (footer ? '<div class="ux-drawer-footer">' + userHtml() + '</div>' : '') + '</div></aside>';
  }
  function renderAvatar() {
    var host = document.getElementById('pv-avatar');
    var row = el('div', 'pv-btn-row');
    row.innerHTML = '<span class="k-avatar k-avatar-circle" role="img" aria-label="관리자"><span class="k-avatar-text" aria-hidden="true">관</span></span>' +
      '<span class="k-avatar k-avatar-circle" role="img" aria-label="사진 자리"><span class="k-avatar-image pv-avatar-img"></span></span>';
    host.appendChild(row);
  }
  function renderDrawer() {
    var host = document.getElementById('pv-drawer');
    host.appendChild(el('h3', 'pv-group-title text-sm-semibold', 'Drawer (펼침 · 아이콘 모드) — 왼쪽 위 버튼으로 첫 번째를 바꿔 볼 수 있음'));
    var bar = el('div', 'pv-btn-row');
    bar.innerHTML = '<button type="button" class="k-button k-button-flat-base k-icon-button ux-drawer-toggle" data-drawer-toggle="pv-drawer-a" aria-expanded="true" aria-controls="pv-drawer-a" aria-label="메뉴 펼치기·접기">' + svg(IC_PANEL) + '</button>';
    host.appendChild(bar);
    var row = el('div', 'pv-drawer-row');
    row.innerHTML = drawerHtml('pv-drawer-a', false, true) + drawerHtml('pv-drawer-b', true, true);
    host.appendChild(row);
    host.appendChild(el('h3', 'pv-group-title text-sm-semibold', 'Drawer 아이콘 모드 · 말풍선 끔 (data-drawer-tips="off")'));
    var row2 = el('div', 'pv-drawer-row');
    row2.innerHTML = drawerHtml('pv-drawer-c', true, true);
    row2.querySelector('.k-drawer').setAttribute('data-drawer-tips', 'off');
    host.appendChild(row2);
    if (window.LotteDS && window.LotteDS.syncDrawer) window.LotteDS.syncDrawer();

    host.appendChild(el('h3', 'pv-group-title text-sm-semibold', 'Drawer Item · Sub (default · hover · active, 펼침 · 아이콘 모드)'));
    var st = el('div', 'pv-drawer-states');
    var mk = function (mini, cls, cur) {
      return '<div class="k-drawer pv-drawer-strip' + (mini ? ' k-drawer-mini' : '') + '"><ul class="k-drawer-items"><li><a class="k-drawer-item ' + cls + '" href="#drawer"' + (cur ? ' aria-current="page"' : '') + '>' + svg(IC_DASH) + '<span class="k-item-text">메뉴</span></a></li>' +
        (mini ? '' : '<li><ul class="ux-drawer-sub pv-drawer-sub-strip"><li><a class="ux-drawer-sub-item ' + cls + '" href="#drawer"' + (cur ? ' aria-current="page"' : '') + '>하위 메뉴</a></li></ul></li>') + '</ul></div>';
    };
    st.innerHTML = [['default', '', false], ['hover', 'k-state-hover', false], ['active', '', true]].map(function (c) {
      return '<div class="pv-form-cell"><p class="pv-form-cap text-xs-medium">' + c[0] + '</p>' + mk(false, c[1], c[2]) + mk(true, c[1], c[2]) + '</div>';
    }).join('');
    host.appendChild(st);

    host.appendChild(el('h3', 'pv-group-title text-sm-semibold', 'Drawer / Group Label · Toggle · Brand · User'));
    var parts = el('div', 'pv-drawer-parts');
    parts.innerHTML =
      '<div class="k-drawer pv-drawer-strip"><p class="ux-drawer-group-label">메뉴 그룹</p></div>' +
      '<button type="button" class="k-button k-button-flat-base k-icon-button ux-drawer-toggle" aria-label="토글 모양 예시">' + svg(IC_PANEL) + '</button>' +
      '<div class="k-drawer pv-drawer-strip">' + brandHtml() + '</div>' +
      '<div class="k-drawer k-drawer-mini pv-drawer-strip">' + brandHtml() + '</div>' +
      userHtml() + userHtml({ chevron: true }) + userHtml({ avatarOnly: true });
    host.appendChild(parts);
  }

  var IC_ELLIPSIS = '<circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/>';
  function renderBreadcrumb() {
    var host = document.getElementById('pv-breadcrumb');
    var sep = '<li class="ux-breadcrumb-separator" aria-hidden="true">' + svg(IC_CHEV_R) + '</li>';
    var link = function (t, cls) { return '<li class="k-breadcrumb-item"><a class="k-breadcrumb-link' + (cls ? ' ' + cls : '') + '" href="#breadcrumb">' + t + '</a></li>'; };
    var page = function (t) { return '<li class="k-breadcrumb-item"><span class="k-breadcrumb-link" aria-current="page">' + t + '</span></li>'; };
    var nav = function (items) { return '<nav class="k-breadcrumb" aria-label="현재 위치"><ol class="k-breadcrumb-container">' + items.join(sep) + '</ol></nav>'; };
    host.appendChild(el('h3', 'pv-group-title text-sm-semibold', 'Breadcrumb'));
    var a = el('div'); a.innerHTML = nav([link('홈'), link('생산관리'), page('작업 지시')]); host.appendChild(a);
    host.appendChild(el('h3', 'pv-group-title text-sm-semibold', 'Breadcrumb (중간 생략)'));
    var b = el('div'); b.innerHTML = nav([link('홈'), '<li class="k-breadcrumb-item"><span class="ux-breadcrumb-ellipsis" aria-hidden="true">' + svg(IC_ELLIPSIS) + '</span></li>', link('생산관리'), page('작업 지시')]); host.appendChild(b);
    host.appendChild(el('h3', 'pv-group-title text-sm-semibold', 'Link (default · hover) · Page'));
    var c = el('div', 'pv-btn-row'); c.innerHTML = nav([link('상위 메뉴')]) + nav([link('상위 메뉴', 'k-state-hover')]) + nav([page('현재 화면')]); host.appendChild(c);
  }
  var IC_CAL = '<path d="M8 2v4"/><path d="M16 2v4"/><rect width="18" height="18" x="3" y="4" rx="2"/><path d="M3 10h18"/>';
  function renderCalendar() {
    var host = document.getElementById('pv-calendar');
    host.appendChild(el('h3', 'pv-group-title text-sm-semibold', 'Calendar'));
    var a = el('div');
    a.innerHTML = '<div class="k-calendar" data-ux-calendar data-today="2026-09-18" data-value="2026-09-18" aria-label="날짜 선택"></div>';
    host.appendChild(a);

    host.appendChild(el('h3', 'pv-group-title text-sm-semibold', 'Calendar Cell (default · hover · today · selected · range-middle · outside · disabled)'));
    var st = [['default', ''], ['hover', 'k-state-hover'], ['today', 'k-today'], ['selected', 'k-state-selected'], ['range-middle', 'k-range-mid'], ['outside', 'k-other-month'], ['disabled', 'k-state-disabled']];
    var b = el('div', 'pv-btn-row');
    b.innerHTML = st.map(function (c) {
      return '<div class="pv-form-cell"><p class="pv-form-cap text-xs-medium">' + c[0] + '</p><div class="k-calendar pv-cal-cell"><table class="k-content k-month"><tbody><tr><td' + (c[1] ? ' class="' + c[1] + '"' : '') + '><span class="k-link">18</span></td></tr></tbody></table></div></div>';
    }).join('');
    host.appendChild(b);

    host.appendChild(el('h3', 'pv-group-title text-sm-semibold', 'DatePicker (빈 칸 · 값 있음 · 오류 · 비활성)'));
    var dp = function (v, attr) {
      return '<div class="ux-datepicker" data-ux-datepicker><button type="button" class="k-button k-button-md k-button-outline-base ux-datepicker-trigger" aria-haspopup="dialog" aria-expanded="false"' + (attr || '') + '>' + svg(IC_CAL) + '<span class="ux-datepicker-value">날짜 선택</span></button>' +
        '<input type="hidden" name="pv-date"><div class="k-calendar-container k-popup" role="dialog" aria-label="날짜 선택" hidden><div class="k-calendar" data-ux-calendar data-today="2026-09-18"' + (v ? ' data-value="' + v + '"' : '') + '></div></div></div>';
    };
    var c = el('div', 'pv-btn-row pv-date-row');
    c.innerHTML = dp('') + dp('2026-09-23') + dp('', ' aria-invalid="true"') + dp('2026-09-23', ' disabled');
    host.appendChild(c);
    if (window.LotteDS) { if (LotteDS.initCalendar) LotteDS.initCalendar(host); if (LotteDS.initDatePicker) LotteDS.initDatePicker(host); }
  }
  var IC_BOLD = '<path d="M6 12h9a4 4 0 0 1 0 8H7a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1h7a4 4 0 0 1 0 8"/>';
  function renderToggle() {
    var host = document.getElementById('pv-toggle');
    var states = [['', 'false', ''], ['k-state-hover', 'false', ''], ['', 'true', ''], ['k-state-hover', 'true', ''], ['', 'false', ' disabled'], ['', 'true', ' disabled']];
    [['default', ''], ['outline', 'ux-toggle-outline'], ['solid', 'ux-toggle-solid'], ['pill', 'ux-toggle-pill']].forEach(function (v) {
      ['', 'ux-toggle-sm'].forEach(function (sz) {
        host.appendChild(el('h3', 'pv-group-title text-sm-semibold', v[0] + (sz ? ' · sm' : '')));
        var row = el('div', 'pv-btn-row');
        row.innerHTML = states.map(function (st, i) {
          var cls = ['k-toggle-button', v[1], sz, st[0]].filter(Boolean).join(' ');
          var label = v[0] === 'default' || v[0] === 'outline' ? (i % 2 ? '굵게' : svg(IC_BOLD) + '굵게') : '진행중';
          return '<button type="button" class="' + cls + '" aria-pressed="' + st[1] + '"' + st[2] + '>' + label + '</button>';
        }).join('');
        host.appendChild(row);
      });
    });
  }
  function renderButtonGroup() {
    var host = document.getElementById('pv-button-group');
    var add = function (title, html) {
      host.appendChild(el('h3', 'pv-group-title text-sm-semibold', title));
      var row = el('div', 'pv-btn-row'); row.innerHTML = html; host.appendChild(row);
    };
    var btn = function (t) { return '<button type="button" class="k-button k-button-md k-button-outline-base">' + t + '</button>'; };
    add('ButtonGroup', '<div class="k-button-group" role="group" aria-label="날짜 이동">' + btn('이전') + btn('오늘') + btn('다음') + '</div>');
    var grp = function (mode, cls, on) {
      return '<div class="k-button-group ux-toggle-group" role="group" aria-label="기간" data-ux-toggle-group="' + mode + '">' +
        ['일', '주', '월'].map(function (t, i) { return '<button type="button" class="k-toggle-button' + (cls ? ' ' + cls : '') + '" aria-pressed="' + (on.indexOf(i) > -1) + '">' + t + '</button>'; }).join('') + '</div>';
    };
    add('ButtonGroup / Toggle · default', grp('single', '', [0]));
    add('ButtonGroup / Toggle · outline', grp('single', 'ux-toggle-outline', [0]));
    add('ButtonGroup / Toggle · outline · 여러 개 고르기', grp('multiple', 'ux-toggle-outline', [0, 2]));
  }
  var IC_CHECK = '<path d="M20 6 9 17l-5-5"/>';
  var IC_USER = '<path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>';
  function menuItem(t, o) {
    o = o || {};
    var attrs = ' role="' + (o.check !== undefined ? 'menuitemcheckbox" aria-checked="' + o.check : 'menuitem') + '"' + (o.sub ? ' aria-haspopup="menu" aria-expanded="' + (o.open ? 'true' : 'false') + '"' : '') + (o.disabled ? ' disabled' : '');
    return '<li class="k-item k-menu-item" role="none"><button type="button" class="k-link k-menu-link' + (o.cls ? ' ' + o.cls : '') + '"' + attrs + '>' +
      (o.check !== undefined ? '<span class="ux-menu-check" aria-hidden="true">' + svg(IC_CHECK) + '</span>' : '') +
      (o.icon ? svg(o.icon) : '') + '<span class="k-menu-link-text">' + t + '</span>' +
      (o.key ? '<span class="ux-menu-shortcut">' + o.key + '</span>' : '') + (o.sub ? svg(IC_CHEV_R, 'k-menu-expand-arrow') : '') + '</button>' + (o.subHtml || '') + '</li>';
  }
  function menuList(inner, label) { return '<div class="k-menu-popup k-popup"><ul class="k-menu-group" role="menu"' + (label ? ' aria-label="' + label + '"' : '') + '>' + inner + '</ul></div>'; }
  var SEP = '<li class="k-separator" role="separator"></li>';
  function renderMenu() {
    var host = document.getElementById('pv-menu');
    host.appendChild(el('h3', 'pv-group-title text-sm-semibold', 'Menu (눌러서 써 보기)'));
    var sub = menuList(menuItem('엑셀') + menuItem('PDF'), '내보내기');
    var live = el('div', 'pv-btn-row pv-menu-live');
    live.innerHTML = '<div class="ux-menu"><button type="button" class="k-button k-button-md k-button-outline-base ux-menu-trigger" aria-haspopup="menu" aria-expanded="false">더보기' + svg('<path d="m6 9 6 6 6-6"/>') + '</button>' +
      menuList('<li class="ux-menu-label" role="presentation">내 계정</li>' + SEP + menuItem('프로필', { icon: IC_USER, key: '⌘P' }) + menuItem('설정') + menuItem('상태 표시줄', { check: true }) +
        menuItem('내보내기', { sub: true, subHtml: sub }) + SEP + menuItem('삭제', { cls: 'ux-menu-error' }), '더보기') + '</div>';
    host.appendChild(live);

    host.appendChild(el('h3', 'pv-group-title text-sm-semibold', 'Menu (펼쳐 둔 모양)'));
    var a = el('div', 'pv-btn-row pv-menu-static');
    a.innerHTML = menuList('<li class="ux-menu-label" role="presentation">내 계정</li>' + SEP + menuItem('메뉴') + menuItem('메뉴') + menuItem('체크 항목', { check: true }) + menuItem('하위 메뉴', { sub: true }) + SEP + menuItem('메뉴', { cls: 'ux-menu-error' }));
    host.appendChild(a);

    host.appendChild(el('h3', 'pv-group-title text-sm-semibold', 'Menu Item · CheckBox · Submenu (default · focus · disabled · open)'));
    var b = el('div', 'pv-btn-row pv-menu-static');
    b.innerHTML = menuList(menuItem('메뉴') + menuItem('메뉴', { cls: 'k-state-hover' }) + menuItem('메뉴', { disabled: true, key: '⌘K' })) +
      menuList(menuItem('메뉴', { cls: 'ux-menu-error' }) + menuItem('메뉴', { cls: 'ux-menu-error k-state-hover' }) + menuItem('메뉴', { cls: 'ux-menu-error', disabled: true })) +
      menuList(menuItem('체크 항목', { check: false }) + menuItem('체크 항목', { check: false, cls: 'k-state-hover' }) + menuItem('체크 항목', { check: true }) + menuItem('체크 항목', { check: true, cls: 'k-state-hover' })) +
      menuList(menuItem('하위 메뉴', { sub: true }) + menuItem('하위 메뉴', { sub: true, open: true }));
    host.appendChild(b);
    if (window.LotteDS && LotteDS.initMenu) LotteDS.initMenu(host);
  }
  var IC_BOX = '<path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/>';
  function treeItem(t, o) {
    o = o || {};
    return '<li class="k-treeview-item" role="treeitem" aria-level="' + (o.level || 1) + '"' + (o.kids ? ' aria-expanded="' + !!o.open + '"' : '') + ' aria-selected="' + !!o.sel + '"' + (o.id ? ' data-id="' + o.id + '"' : '') + '>' +
      '<span class="k-treeview-mid"><span class="k-treeview-toggle" aria-hidden="true"></span>' + svg(IC_BOX, 'ux-tree-icon') +
      '<span class="k-treeview-leaf-text">' + t + '</span>' + (o.count !== undefined ? '<span class="ux-tree-count">' + o.count + '</span>' : '') + '</span>' +
      (o.kids ? '<ul class="k-treeview-group" role="group">' + o.kids + '</ul>' : '') + '</li>';
  }
  function renderTreeView() {
    var host = document.getElementById('pv-treeview');
    var row = el('div', 'pv-btn-row pv-tree-row');
    var live = '<div class="k-treeview pv-tree"><ul class="k-treeview-lines" role="tree" aria-label="공정">' +
      treeItem('전체', { id: 'all', count: 12, sel: true }) +
      treeItem('배합', { id: 'mix', count: 5, open: true, kids: treeItem('원료 계량', { level: 2, id: 'weigh', count: 3 }) + treeItem('혼합', { level: 2, id: 'blend', count: 2, kids: treeItem('1호기', { level: 3, id: 'm1' }) + treeItem('2호기', { level: 3, id: 'm2' }) }) }) +
      treeItem('성형', { id: 'form', count: 4, kids: treeItem('압출', { level: 2, id: 'ext' }) }) +
      treeItem('포장', { id: 'pack', count: 3 }) + '</ul></div>';
    var states = '';
    [1, 2, 3].forEach(function (lv) {
      [['open', { kids: '<li hidden></li>', open: true }], ['closed', { kids: '<li hidden></li>' }], ['leaf', {}]].forEach(function (ex) {
        [false, true].forEach(function (sel) {
          var o = { level: lv, count: 0, sel: sel }; for (var k in ex[1]) o[k] = ex[1][k];
          states += treeItem('level=' + (lv - 1) + ' · ' + ex[0] + (sel ? ' · selected' : ''), o);
        });
      });
    });
    row.innerHTML = live + '<div class="k-treeview pv-tree"><ul class="k-treeview-lines" role="tree" aria-label="상태 표">' + states + '</ul></div>';
    host.appendChild(row);
    if (window.LotteDS && LotteDS.initTreeView) LotteDS.initTreeView(host);
  }
  var IC_X = '<path d="M18 6 6 18"/><path d="m6 6 12 12"/>';
  function stepHtml(n, label, st, opt) {
    var cls = { done: ' k-step-done', current: ' k-step-current', invalid: ' k-step-error', disabled: ' k-step-disabled' }[st] || '';
    var ind = st === 'done' ? svg(IC_CHECK) : st === 'invalid' ? svg(IC_X) : n;
    return '<li class="k-step' + cls + '"' + (st === 'current' ? ' aria-current="step"' : '') + (st === 'disabled' ? ' aria-disabled="true"' : '') + '><span class="k-step-indicator">' + ind + '</span><span class="k-step-label"><span class="k-step-text">' + label + '</span>' + (opt ? '<span class="ux-step-optional">' + opt + '</span>' : '') + '</span></li>';
  }
  function conn(done) { return '<li class="ux-step-connector' + (done ? ' ux-step-connector-done' : '') + '" aria-hidden="true"></li>'; }
  function stepper(o, steps) {
    var h = '';
    steps.forEach(function (s, i) { if (i) h += conn(steps[i - 1][2] === 'done' && s[2] !== 'upcoming'); h += stepHtml(i + 1, s[0], s[2], s[1]); });
    return '<div class="k-stepper"><ol class="k-step-list k-step-list-' + o + '" aria-label="등록 단계">' + h + '</ol></div>';
  }
  function renderStepList() {
    var host = document.getElementById('pv-stepper');
    var flow = [['기본 정보', '', 'done'], ['상세 입력', '', 'current'], ['첨부', '(선택)', 'upcoming'], ['확인', '', 'upcoming']];
    host.appendChild(el('h3', 'pv-group-title text-sm-semibold', 'Stepper · horizontal'));
    var a = el('div', 'pv-stepper-h'); a.innerHTML = stepper('horizontal', flow); host.appendChild(a);
    host.appendChild(el('h3', 'pv-group-title text-sm-semibold', 'Stepper · vertical'));
    var b = el('div'); b.innerHTML = stepper('vertical', flow); host.appendChild(b);
    host.appendChild(el('h3', 'pv-group-title text-sm-semibold', 'Stepper / Step (done · current · upcoming · invalid · disabled)'));
    var st = ['done', 'current', 'upcoming', 'invalid', 'disabled'];
    var c = el('div', 'pv-btn-row pv-step-states');
    c.innerHTML = '<div class="k-stepper"><ol class="k-step-list k-step-list-horizontal">' + st.map(function (s, i) { return stepHtml(i + 1, s, s); }).join('<li class="pv-step-gap" aria-hidden="true"></li>') + '</ol></div>' +
      '<div class="k-stepper"><ol class="k-step-list k-step-list-vertical">' + st.map(function (s, i) { return stepHtml(i + 1, s, s); }).join('<li class="pv-step-gap" aria-hidden="true"></li>') + '</ol></div>';
    host.appendChild(c);
  }
  function renderProgressBar() {
    var host = document.getElementById('pv-progressbar');
    var box = el('div', 'pv-progress');
    box.innerHTML = [0, 25, 50, 75, 100].map(function (v) {
      return '<div class="pv-form-cell"><p class="pv-form-cap text-xs-medium">value=' + v + '</p><div class="k-progressbar" role="progressbar" aria-label="진행률" aria-valuemin="0" aria-valuemax="100" aria-valuenow="' + v + '"><div class="k-progressbar-value" style="width: ' + v + '%"></div></div></div>';
    }).join('');
    host.appendChild(box);
  }
  function renderExpansionPanel() {
    var host = document.getElementById('pv-expansionpanel');
    var box = el('div', 'pv-expander');
    box.innerHTML = [['collapsed', false], ['expanded', true]].map(function (c, i) {
      return '<div class="pv-form-cell"><p class="pv-form-cap text-xs-medium">state=' + c[0] + '</p><div class="k-expander' + (c[1] ? ' k-expanded' : '') + '">' +
        '<button type="button" class="k-expander-header" aria-expanded="' + c[1] + '" aria-controls="pv-exp-' + i + '"><span class="k-expander-title">조회 조건</span><span class="k-spacer"></span>' + svg('<path d="m6 9 6 6 6-6"/>', 'k-expander-indicator') + '</button>' +
        '<div class="k-expander-content-wrapper" id="pv-exp-' + i + '"' + (c[1] ? '' : ' hidden') + '><div class="k-expander-content"><div class="pv-slot">조회 조건 칸 자리</div></div></div></div></div>';
    }).join('');
    host.appendChild(box);
  }
  function renderToolbar() {
    var host = document.getElementById('pv-toolbar');
    var b = function (cls, t) { return '<button type="button" class="k-button k-button-sm ' + cls + '">' + t + '</button>'; };
    var row = el('div');
    row.innerHTML = '<div class="k-toolbar" role="toolbar" aria-label="목록 도구">' + b('k-button-solid-primary', '조회') + b('k-button-outline-base', '초기화') +
      '<span class="k-separator k-separator-vertical" role="separator" aria-orientation="vertical"></span>' + b('k-button-flat-base', '엑셀') + b('k-button-flat-base', '설정') + '</div>';
    host.appendChild(row);
  }
  function renderSplitter() {
    var host = document.getElementById('pv-splitter');
    var box = el('div', 'pv-splitter-box');
    box.innerHTML = '<div class="k-splitter k-splitter-vertical"><div class="k-pane pv-splitter-pane" id="pv-split-top">위 칸 (제품 검사 리스트)</div>' +
      '<div class="k-splitbar k-splitbar-vertical" role="separator" tabindex="0" aria-orientation="horizontal" aria-controls="pv-split-top" aria-label="위아래 크기 조절" data-splitter-size="50">' +
      '<span class="k-resize-handle" aria-hidden="true"></span></div>' +
      '<div class="k-pane pv-splitter-pane">아래 칸 (검사정보 · 실적)</div></div>';
    host.appendChild(box);
    host.appendChild(el('h3', 'pv-group-title text-sm-semibold', '막대 상태 (기본 · 마우스 올림 · 끄는 중 · 포커스)'));
    [['기본', ''], ['마우스 올림', ' k-hover'], ['끄는 중', ' pv-drag'], ['포커스', ' k-focus']].forEach(function (st) {
      var row = el('div', 'pv-splitter-state');
      row.appendChild(el('span', 'pv-splitter-state__label text-sm-regular', st[0]));
      var bar = el('div', 'k-splitbar k-splitbar-vertical' + st[1].replace(' pv-drag', ''));
      if (st[1] === ' pv-drag') bar.setAttribute('data-dragging', '');
      bar.setAttribute('aria-hidden', 'true');
      bar.innerHTML = '<span class="k-resize-handle"></span>';
      row.appendChild(bar);
      host.appendChild(row);
    });
    if (window.LotteDS && LotteDS.initSplitter) LotteDS.initSplitter(host);
  }
  function renderKbd() {
    var host = document.getElementById('pv-kbd');
    var row = el('div', 'pv-btn-row');
    row.innerHTML = '<kbd class="ux-kbd">K</kbd><kbd class="ux-kbd">Esc</kbd><kbd class="ux-kbd">Enter</kbd>' +
      '<kbd class="ux-kbd-group"><kbd class="ux-kbd">Ctrl</kbd><kbd class="ux-kbd">K</kbd></kbd>';
    host.appendChild(row);
  }
  function renderPageTab() {
    var host = document.getElementById('pv-pagetab');
    var IC_CLIP = '<rect width="8" height="4" x="8" y="2" rx="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>';
    var X = '<svg class="k-svg-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>';
    var tab = function (name, on, close, extra) {
      return '<div class="ux-page-tab' + (extra || '') + '"><button type="button" class="ux-page-tab-link" role="tab" aria-selected="' + on + '">' + svg(IC_CLIP) +
        '<span class="ux-page-tab-text">' + name + '</span></button>' + (close ? '<button type="button" class="ux-page-tab-close" aria-label="' + name + ' 닫기">' + X + '</button>' : '') + '</div>';
    };
    var states = el('div', 'pv-pagetab');
    states.innerHTML = '<div class="ux-page-tabs" role="tablist" aria-label="상태 보기">' + tab('default', false, true) + tab('hover', false, true, ' pv-hover') + tab('active', true, true) + tab('닫기 없음', false, false) + '</div>';
    var live = el('div', 'pv-pagetab');
    live.innerHTML = '<div class="ux-page-tabs" role="tablist" aria-label="열린 화면">' + tab('작업지시', false, true) + tab('원료 입고', true, true) + tab('소분 계량', false, true) + tab('품질 검사', false, true) + '</div>';
    var EMPTY = '<p class="ux-page-tabs-empty">열린 화면이 없어요</p>';
    live.firstChild.insertAdjacentHTML('beforeend', EMPTY);
    var empty = el('div', 'pv-pagetab');
    empty.innerHTML = '<div class="ux-page-tabs" role="tablist" aria-label="열린 화면 (빈 상태)">' + EMPTY + '</div>';
    host.appendChild(states);
    host.appendChild(live);
    host.appendChild(empty);
    if (window.LotteDS && LotteDS.initPageTabs) LotteDS.initPageTabs(host);
  }
  function renderAppBar() {
    var host = document.getElementById('pv-appbar');
    var full = "<header class=\"k-appbar ux-appbar\"><div class=\"k-appbar-section\"><button type=\"button\" class=\"k-button k-button-flat-base k-icon-button ux-drawer-toggle\" aria-label=\"메뉴 펼치기·접기\"><svg class=\"k-svg-icon\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\" focusable=\"false\"><rect width=\"18\" height=\"18\" x=\"3\" y=\"3\" rx=\"2\"/><path d=\"M9 3v18\"/></svg></button><span class=\"k-separator k-separator-vertical\" role=\"separator\" aria-orientation=\"vertical\"></span><button type=\"button\" class=\"k-toggle-button ux-toggle-sm ux-appbar-favorite\" aria-pressed=\"false\" aria-label=\"제품검사 결과 등록 즐겨찾기\"><svg class=\"k-svg-icon\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\" focusable=\"false\"><path d=\"M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z\"/></svg></button><div class=\"ux-appbar-titles\"><p class=\"ux-appbar-title\">제품검사 결과 등록</p><nav class=\"k-breadcrumb ux-appbar-crumb\" aria-label=\"현재 위치\"><ol class=\"k-breadcrumb-container\"><li class=\"k-breadcrumb-item\"><a class=\"k-breadcrumb-link\" href=\"#\">QMS</a></li><li class=\"ux-breadcrumb-separator\" aria-hidden=\"true\"><svg class=\"k-svg-icon\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" focusable=\"false\"><path d=\"m9 18 6-6-6-6\"/></svg></li><li class=\"k-breadcrumb-item\"><a class=\"k-breadcrumb-link\" href=\"#\">검사 관리</a></li><li class=\"ux-breadcrumb-separator\" aria-hidden=\"true\"><svg class=\"k-svg-icon\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" focusable=\"false\"><path d=\"m9 18 6-6-6-6\"/></svg></li><li class=\"k-breadcrumb-item\"><span class=\"k-breadcrumb-link\" aria-current=\"page\">QM-020</span></li></ol></nav></div></div><span class=\"k-appbar-spacer\"></span><div class=\"k-appbar-section\"><span class=\"k-textbox ux-appbar-search\"><span class=\"k-input-prefix\"><svg class=\"k-svg-icon\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\" focusable=\"false\"><path d=\"m21 21-4.34-4.34\"/><circle cx=\"11\" cy=\"11\" r=\"8\"/></svg></span><input class=\"k-input-inner\" type=\"search\" placeholder=\"메뉴 · 화면 검색\" aria-label=\"메뉴 · 화면 검색\"><span class=\"k-input-suffix\"><kbd class=\"ux-kbd-group\"><kbd class=\"ux-kbd\">⌘</kbd><kbd class=\"ux-kbd\">K</kbd></kbd></span></span><button type=\"button\" class=\"k-button k-button-flat-base k-icon-button\" aria-label=\"즐겨찾기 목록\" data-tooltip=\"즐겨찾기 목록\"><svg class=\"k-svg-icon\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\" focusable=\"false\"><path d=\"m3 17 2 2 4-4\"/><path d=\"m3 7 2 2 4-4\"/><path d=\"M13 6h8\"/><path d=\"M13 12h8\"/><path d=\"M13 18h8\"/></svg></button><div class=\"ux-drawer-user\"><span class=\"k-avatar k-avatar-circle\" aria-hidden=\"true\"><span class=\"k-avatar-text\">관</span></span><div class=\"ux-drawer-user-text\"><p class=\"ux-drawer-user-name\">사용자 이름</p><p class=\"ux-drawer-user-email\">시스템 관리자</p></div><svg class=\"k-svg-icon ux-drawer-chevron\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\" focusable=\"false\"><path d=\"m7 15 5 5 5-5\"/><path d=\"m7 9 5-5 5 5\"/></svg></div></div></header>";
    var legacy = "<header class=\"k-appbar ux-appbar\"><div class=\"k-appbar-section\"><button type=\"button\" class=\"k-button k-button-flat-base k-icon-button ux-drawer-toggle\" aria-label=\"메뉴 펼치기·접기\"><svg class=\"k-svg-icon\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\" focusable=\"false\"><rect width=\"18\" height=\"18\" x=\"3\" y=\"3\" rx=\"2\"/><path d=\"M9 3v18\"/></svg></button><span class=\"k-separator k-separator-vertical\" role=\"separator\" aria-orientation=\"vertical\"></span><nav class=\"k-breadcrumb\" aria-label=\"현재 위치\"><ol class=\"k-breadcrumb-container\"><li class=\"k-breadcrumb-item\"><a class=\"k-breadcrumb-link ux-appbar-home\" href=\"#\" aria-label=\"홈\"><svg class=\"k-svg-icon\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\" focusable=\"false\"><path d=\"M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8\"/><path d=\"M3 10a2 2 0 0 1 .709-1.528l7-5.999a2 2 0 0 1 2.582 0l7 5.999A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z\"/></svg></a></li><li class=\"ux-breadcrumb-separator\" aria-hidden=\"true\"><svg class=\"k-svg-icon\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" focusable=\"false\"><path d=\"m9 18 6-6-6-6\"/></svg></li><li class=\"k-breadcrumb-item\"><a class=\"k-breadcrumb-link\" href=\"#\">생산관리</a></li><li class=\"ux-breadcrumb-separator\" aria-hidden=\"true\"><svg class=\"k-svg-icon\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" focusable=\"false\"><path d=\"m9 18 6-6-6-6\"/></svg></li><li class=\"k-breadcrumb-item\"><span class=\"k-breadcrumb-link\" aria-current=\"page\">작업 지시</span></li></ol></nav></div><span class=\"k-appbar-spacer\"></span><div class=\"k-appbar-section\"><span class=\"k-textbox ux-appbar-search\"><span class=\"k-input-prefix\"><svg class=\"k-svg-icon\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\" focusable=\"false\"><path d=\"m21 21-4.34-4.34\"/><circle cx=\"11\" cy=\"11\" r=\"8\"/></svg></span><input class=\"k-input-inner\" type=\"search\" placeholder=\"메뉴 · 화면 검색\" aria-label=\"메뉴 · 화면 검색\"><span class=\"k-input-suffix\"><kbd class=\"ux-kbd-group\"><kbd class=\"ux-kbd\">⌘</kbd><kbd class=\"ux-kbd\">K</kbd></kbd></span></span><button type=\"button\" class=\"k-button k-button-flat-base k-icon-button\" aria-label=\"즐겨찾기 목록\" data-tooltip=\"즐겨찾기 목록\"><svg class=\"k-svg-icon\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\" focusable=\"false\"><path d=\"m3 17 2 2 4-4\"/><path d=\"m3 7 2 2 4-4\"/><path d=\"M13 6h8\"/><path d=\"M13 12h8\"/><path d=\"M13 18h8\"/></svg></button><div class=\"ux-drawer-user\"><span class=\"k-avatar k-avatar-circle\" aria-hidden=\"true\"><span class=\"k-avatar-text\">관</span></span><div class=\"ux-drawer-user-text\"><p class=\"ux-drawer-user-name\">사용자 이름</p><p class=\"ux-drawer-user-email\">시스템 관리자</p></div><svg class=\"k-svg-icon ux-drawer-chevron\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\" focusable=\"false\"><path d=\"m7 15 5 5 5-5\"/><path d=\"m7 9 5-5 5 5\"/></svg></div></div></header>";
    var a = el('div', 'pv-appbar'); a.innerHTML = full;
    var b = el('div', 'pv-appbar'); b.innerHTML = full;
    var bb = b.querySelector('.k-appbar');
    bb.querySelectorAll('.ux-drawer-toggle, .k-separator, .ux-appbar-search').forEach(function (x) { x.remove(); });
    var items = bb.querySelectorAll('.k-breadcrumb-container > li');
    items[0].remove(); items[1].remove();
    host.appendChild(a);
    host.appendChild(b);
    host.appendChild(el('h3', 'pv-group-title text-sm-semibold', '제목 없이 경로 줄만 (예전 구조)'));
    var c = el('div', 'pv-appbar'); c.innerHTML = legacy;
    c.querySelectorAll('.ux-appbar-search').forEach(function (x) { x.remove(); });
    host.appendChild(c);
  }
  function renderPageHeading() {
    var host = document.getElementById('pv-pageheading');
    var a = el('div', 'pv-pageheading');
    a.innerHTML = '<div class="ux-page-heading"><div class="ux-page-heading-titles"><p class="ux-page-heading-title">페이지 제목</p><p class="ux-page-heading-desc">페이지 설명을 입력합니다.</p></div>' +
      '<div class="ux-page-heading-actions"><button type="button" class="k-button k-button-md k-button-outline-base">보조 버튼</button><button type="button" class="k-button k-button-md k-button-solid-primary">주요 버튼</button></div></div>';
    var b = el('div', 'pv-pageheading');
    b.innerHTML = '<div class="ux-page-heading"><div class="ux-page-heading-titles"><p class="ux-page-heading-title">페이지 제목</p></div></div>';
    host.appendChild(a);
    host.appendChild(b);
  }
  function renderToolbarFilter() {
    var host = document.getElementById('pv-toolbar-filter');
    var a = el('div');
    a.innerHTML = "<div class=\"ux-toolbar-filter\" role=\"search\" aria-label=\"조회 조건\"><input type=\"search\" class=\"k-textbox k-input k-input-md ux-toolbar-filter-search\" placeholder=\"검색\" aria-label=\"검색\"><div class=\"k-dropdownlist k-picker k-picker-md\"><button type=\"button\" class=\"k-input-inner\" role=\"combobox\" aria-haspopup=\"listbox\" aria-expanded=\"false\" aria-controls=\"flt-line-list\" aria-label=\"라인\"><span class=\"k-input-value-text\">전체</span><span class=\"k-input-button\" aria-hidden=\"true\"><svg class=\"k-svg-icon\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" focusable=\"false\"><path d=\"m6 9 6 6 6-6\"/></svg></span></button><div class=\"k-popup k-list-container\" hidden><ul class=\"k-list-ul\" role=\"listbox\" id=\"flt-line-list\" aria-label=\"라인\"><li class=\"k-list-item\" role=\"option\" aria-selected=\"true\" data-value=\"\"><span class=\"k-list-item-text\">전체</span></li><li class=\"k-list-item\" role=\"option\" aria-selected=\"false\" data-value=\"A1\"><span class=\"k-list-item-text\">조립 1라인</span></li><li class=\"k-list-item\" role=\"option\" aria-selected=\"false\" data-value=\"A2\"><span class=\"k-list-item-text\">조립 2라인</span></li></ul></div><input type=\"hidden\" name=\"flt-line\" value=\"\"></div><div class=\"k-dropdownlist k-picker k-picker-md\"><button type=\"button\" class=\"k-input-inner\" role=\"combobox\" aria-haspopup=\"listbox\" aria-expanded=\"false\" aria-controls=\"flt-status-list\" aria-label=\"상태\"><span class=\"k-input-value-text\">전체</span><span class=\"k-input-button\" aria-hidden=\"true\"><svg class=\"k-svg-icon\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" focusable=\"false\"><path d=\"m6 9 6 6 6-6\"/></svg></span></button><div class=\"k-popup k-list-container\" hidden><ul class=\"k-list-ul\" role=\"listbox\" id=\"flt-status-list\" aria-label=\"상태\"><li class=\"k-list-item\" role=\"option\" aria-selected=\"true\" data-value=\"\"><span class=\"k-list-item-text\">전체</span></li><li class=\"k-list-item\" role=\"option\" aria-selected=\"false\" data-value=\"wait\"><span class=\"k-list-item-text\">대기</span></li><li class=\"k-list-item\" role=\"option\" aria-selected=\"false\" data-value=\"run\"><span class=\"k-list-item-text\">진행</span></li><li class=\"k-list-item\" role=\"option\" aria-selected=\"false\" data-value=\"done\"><span class=\"k-list-item-text\">완료</span></li></ul></div><input type=\"hidden\" name=\"flt-status\" value=\"\"></div><div class=\"ux-datepicker\" data-ux-datepicker><button type=\"button\" class=\"k-button k-button-md k-button-outline-base ux-datepicker-trigger\" aria-haspopup=\"dialog\" aria-expanded=\"false\" data-empty><svg class=\"k-svg-icon\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\" focusable=\"false\"><path d=\"M8 2v4\"/><path d=\"M16 2v4\"/><rect width=\"18\" height=\"18\" x=\"3\" y=\"4\" rx=\"2\"/><path d=\"M3 10h18\"/></svg><span class=\"ux-datepicker-value\">날짜 선택</span></button><input type=\"hidden\" name=\"workDate\"><div class=\"k-calendar-container k-popup\" role=\"dialog\" aria-label=\"날짜 선택\" hidden><div class=\"k-calendar\" data-ux-calendar></div></div></div><button type=\"button\" class=\"k-button k-button-md k-button-flat-base\"><span class=\"k-button-text\">초기화</span><svg class=\"k-svg-icon\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\" focusable=\"false\"><path d=\"M18 6 6 18\"/><path d=\"m6 6 12 12\"/></svg></button></div>";
    host.appendChild(a);
    if (window.LotteDS) { if (LotteDS.initCalendar) LotteDS.initCalendar(a); if (LotteDS.initDatePicker) LotteDS.initDatePicker(a); }
  }
  function renderToolbarFormAction() {
    var host = document.getElementById('pv-toolbar-form-action');
    var a = el('div', 'pv-form-action');
    a.innerHTML = '<div class="ux-toolbar-form-action"><button type="button" class="k-button k-button-md k-button-outline-base">취소</button><button type="button" class="k-button k-button-md k-button-solid-primary">저장</button></div>';
    host.appendChild(a);
  }
  function renderFormTable() {
    var host = document.getElementById('pv-form-table');
    var a = el('div', 'pv-form-table'); a.innerHTML = "<div class=\"ux-form-table\"><table><tbody><tr><th scope=\"row\">항목</th><td>값</td><th scope=\"row\">항목</th><td>값</td></tr><tr><th scope=\"row\">항목</th><td>값</td><th scope=\"row\">항목</th><td>값</td></tr><tr><th scope=\"row\">항목</th><td>값</td><th scope=\"row\">항목</th><td>값</td></tr><tr><th scope=\"row\">항목</th><td>값</td><th scope=\"row\">항목</th><td>값</td></tr></tbody></table></div>";
    var b = el('div', 'pv-form-table'); b.innerHTML = "<div class=\"ux-form-table\"><table><tbody><tr><th scope=\"row\">LOT NO</th><td>L20261124-01</td><th scope=\"row\">품목</th><td>빼빼로 오리지널</td></tr><tr><th scope=\"row\"><span class=\"k-required\" aria-hidden=\"true\"></span>라인</th><td class=\"ux-form-table-control\"><div class=\"k-dropdownlist k-picker k-picker-md\"><button type=\"button\" class=\"k-input-inner\" role=\"combobox\" aria-haspopup=\"listbox\" aria-expanded=\"false\" aria-controls=\"ft-line-list\" aria-label=\"라인\"><span class=\"k-input-value-text\" data-placeholder>선택하세요</span><span class=\"k-input-button\" aria-hidden=\"true\"><svg class=\"k-svg-icon\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" focusable=\"false\"><path d=\"m6 9 6 6 6-6\"/></svg></span></button><div class=\"k-popup k-list-container\" hidden><ul class=\"k-list-ul\" role=\"listbox\" id=\"ft-line-list\" aria-label=\"라인\"><li class=\"k-list-item\" role=\"option\" aria-selected=\"false\" data-value=\"A1\"><span class=\"k-list-item-text\">조립 1라인</span></li><li class=\"k-list-item\" role=\"option\" aria-selected=\"false\" data-value=\"A2\"><span class=\"k-list-item-text\">조립 2라인</span></li></ul></div><input type=\"hidden\" name=\"ft-line\"></div></td><th scope=\"row\"><span class=\"k-required\" aria-hidden=\"true\"></span>투입량</th><td class=\"ux-form-table-control\"><input class=\"k-textbox k-input k-input-md\" placeholder=\"입력하세요\" aria-label=\"투입량\"></td></tr><tr><th scope=\"row\">작업자</th><td class=\"ux-form-table-control\" colspan=\"3\"><div class=\"ux-form-table-stack\"><div class=\"k-dropdownlist k-picker k-picker-md\"><button type=\"button\" class=\"k-input-inner\" role=\"combobox\" aria-haspopup=\"listbox\" aria-expanded=\"false\" aria-controls=\"ft-worker-list\" aria-label=\"작업자\"><span class=\"k-input-value-text\" data-placeholder>선택하세요</span><span class=\"k-input-button\" aria-hidden=\"true\"><svg class=\"k-svg-icon\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" focusable=\"false\"><path d=\"m6 9 6 6 6-6\"/></svg></span></button><div class=\"k-popup k-list-container\" hidden><ul class=\"k-list-ul\" role=\"listbox\" id=\"ft-worker-list\" aria-label=\"작업자\"><li class=\"k-list-item\" role=\"option\" aria-selected=\"false\" data-value=\"w1\"><span class=\"k-list-item-text\">김롯데</span></li><li class=\"k-list-item\" role=\"option\" aria-selected=\"false\" data-value=\"w2\"><span class=\"k-list-item-text\">이웰푸드</span></li></ul></div><input type=\"hidden\" name=\"ft-worker\"></div><input class=\"k-textbox k-input k-input-md\" placeholder=\"메모\" aria-label=\"작업자 메모\"></div></td></tr><tr><th scope=\"row\">비고</th><td colspan=\"3\">특이사항 없음</td></tr></tbody></table></div>";
    host.appendChild(a);
    host.appendChild(b);
  }
  function renderDialogContent() {
    var host = document.getElementById('pv-dialog-content');
    [["Table", "<div class=\"k-grid ux-dialog-table\"><table class=\"k-grid-table\"><thead class=\"k-grid-header\"><tr><th class=\"k-header\" scope=\"col\">LOT NO</th><th class=\"k-header\" scope=\"col\">품목</th><th class=\"k-header\" scope=\"col\">입고일</th><th class=\"k-header\" scope=\"col\">수량</th></tr></thead><tbody><tr><td>L20261124-01</td><td>빼빼로 오리지널</td><td>2026-11-24</td><td>10</td></tr><tr><td>L20261124-02</td><td>빼빼로 오리지널</td><td>2026-11-24</td><td>20</td></tr><tr><td>L20261124-03</td><td>빼빼로 오리지널</td><td>2026-11-24</td><td>30</td></tr><tr><td>L20261124-04</td><td>빼빼로 오리지널</td><td>2026-11-24</td><td>40</td></tr></tbody></table></div>"], ["Info", "<div class=\"ux-dialog-info\"><table><tbody><tr><th scope=\"row\">LOT NO</th><td>L20261124-01</td></tr><tr><th scope=\"row\">품목</th><td>빼빼로 오리지널</td></tr><tr><th scope=\"row\">라인</th><td>조립 1라인</td></tr><tr><th scope=\"row\">작업자</th><td>김롯데</td></tr><tr><th scope=\"row\">수량</th><td>120 EA</td></tr><tr><th scope=\"row\">비고</th><td>특이사항 없음</td></tr></tbody></table></div>"], ["LOT Input", "<div class=\"ux-dialog-info\"><table><tbody><tr><th scope=\"row\"><label for=\"dlg-lot\">LOT NO</label></th><td class=\"ux-dialog-info-control\"><input id=\"dlg-lot\" class=\"k-textbox k-input k-input-md\" placeholder=\"LOT NO 입력\"></td></tr></tbody></table></div>"], ["TextArea", "<textarea class=\"k-textarea ux-dialog-textarea\" placeholder=\"내용을 입력하세요\" aria-label=\"특이사항\"></textarea>"], ["Option List", "<div class=\"ux-dialog-options\" role=\"radiogroup\" aria-label=\"프린터 선택\"><div class=\"ux-dialog-option\"><input type=\"radio\" class=\"k-radio k-radio-md\" name=\"dlg-printer\" id=\"dlg-p1\" checked><label class=\"k-radio-label\" for=\"dlg-p1\">선택 항목 1</label></div><div class=\"ux-dialog-option\"><input type=\"radio\" class=\"k-radio k-radio-md\" name=\"dlg-printer\" id=\"dlg-p2\"><label class=\"k-radio-label\" for=\"dlg-p2\">선택 항목 2</label></div><div class=\"ux-dialog-option\"><input type=\"radio\" class=\"k-radio k-radio-md\" name=\"dlg-printer\" id=\"dlg-p3\"><label class=\"k-radio-label\" for=\"dlg-p3\">선택 항목 3</label></div></div>"], ["Option Buttons", "<div class=\"ux-dialog-option-buttons\"><button type=\"button\" class=\"k-button k-button-lg k-button-outline-base\">방식 1</button><button type=\"button\" class=\"k-button k-button-lg k-button-outline-base\">방식 2</button><button type=\"button\" class=\"k-button k-button-lg k-button-outline-base\">방식 3</button></div>"]].forEach(function (p) {
      host.appendChild(el('h3', 'pv-group-title text-sm-semibold', p[0]));
      var box = el('div', 'pv-dialog-content'); box.innerHTML = p[1];
      host.appendChild(box);
    });
  }
  function renderMenuTile() {
    var host = document.getElementById('pv-menu-tile');
    var grid = el('div', 'pv-menu-tiles');
    var IC = '<rect width="7" height="7" x="3" y="3" rx="1"/><rect width="7" height="7" x="14" y="3" rx="1"/><rect width="7" height="7" x="14" y="14" rx="1"/><rect width="7" height="7" x="3" y="14" rx="1"/>';
    [['메뉴명', '', true], ['pressed', ' k-state-active', true], ['원료 입고 검수 및 소분 계량 결과 등록 화면', '', true], ['아이콘 없음', '', false]].forEach(function (t) {
      var a = el('a', 'ux-menu-tile' + t[1]); a.href = '#menu-tile';
      a.innerHTML = (t[2] ? svg(IC) : '') + '<span class="ux-menu-tile-text">' + t[0] + '</span>';
      grid.appendChild(a);
    });
    host.appendChild(grid);
  }
  function renderSectionCards() {
    var host = document.getElementById('pv-section-cards');
    var a = el('div'); a.innerHTML = "<section class=\"ux-section-cards\" aria-label=\"오늘 현황\"><article class=\"k-card ux-card-stat\"><div class=\"k-card-header\"><p class=\"k-card-subtitle\">오늘 생산량</p><p class=\"k-card-title\">1,250</p><span class=\"k-badge k-badge-md k-badge-outline-base ux-card-action\"><svg class=\"k-svg-icon\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\" focusable=\"false\"><path d=\"M16 7h6v6\"/><path d=\"m22 7-8.5 8.5-5-5L2 17\"/></svg>+12.5%</span></div><div class=\"k-card-footer\"><p class=\"ux-card-stat-summary\">지난주 대비 증가\n        <svg class=\"k-svg-icon\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\" focusable=\"false\"><path d=\"M16 7h6v6\"/><path d=\"m22 7-8.5 8.5-5-5L2 17\"/></svg></p><p class=\"ux-card-stat-detail\">최근 6개월 기준</p></div></article><article class=\"k-card ux-card-stat\"><div class=\"k-card-header\"><p class=\"k-card-subtitle\">불량률</p><p class=\"k-card-title\">0.8%</p><span class=\"k-badge k-badge-md k-badge-outline-base ux-card-action\"><svg class=\"k-svg-icon\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\" focusable=\"false\"><path d=\"M16 17h6v-6\"/><path d=\"m22 17-8.5-8.5-5 5L2 7\"/></svg>-0.3%</span></div><div class=\"k-card-footer\"><p class=\"ux-card-stat-summary\">지난주 대비 감소\n        <svg class=\"k-svg-icon\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\" focusable=\"false\"><path d=\"M16 17h6v-6\"/><path d=\"m22 17-8.5-8.5-5 5L2 7\"/></svg></p><p class=\"ux-card-stat-detail\">최근 6개월 기준</p></div></article><article class=\"k-card ux-card-stat\"><div class=\"k-card-header\"><p class=\"k-card-subtitle\">설비 가동률</p><p class=\"k-card-title\">92%</p><span class=\"k-badge k-badge-md k-badge-outline-base ux-card-action\"><svg class=\"k-svg-icon\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\" focusable=\"false\"><path d=\"M16 7h6v6\"/><path d=\"m22 7-8.5 8.5-5-5L2 17\"/></svg>+2.1%</span></div><div class=\"k-card-footer\"><p class=\"ux-card-stat-summary\">지난주 대비 증가\n        <svg class=\"k-svg-icon\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\" focusable=\"false\"><path d=\"M16 7h6v6\"/><path d=\"m22 7-8.5 8.5-5-5L2 17\"/></svg></p><p class=\"ux-card-stat-detail\">최근 6개월 기준</p></div></article><article class=\"k-card ux-card-stat\"><div class=\"k-card-header\"><p class=\"k-card-subtitle\">작업 지시</p><p class=\"k-card-title\">48</p><span class=\"k-badge k-badge-md k-badge-outline-base ux-card-action\"><svg class=\"k-svg-icon\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\" focusable=\"false\"><path d=\"M16 7h6v6\"/><path d=\"m22 7-8.5 8.5-5-5L2 17\"/></svg>+4</span></div><div class=\"k-card-footer\"><p class=\"ux-card-stat-summary\">지난주 대비 증가\n        <svg class=\"k-svg-icon\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\" focusable=\"false\"><path d=\"M16 7h6v6\"/><path d=\"m22 7-8.5 8.5-5-5L2 17\"/></svg></p><p class=\"ux-card-stat-detail\">최근 6개월 기준</p></div></article></section>";
    host.appendChild(a);
  }
  function renderNav() {
    var nav = document.getElementById('pv-nav');
    document.querySelectorAll('.pv-section').forEach(function (s) {
      var li = el('li');
      var a = el('a', 'pv-nav__link text-sm-medium', s.querySelector('.pv-section__title').textContent);
      a.href = '#' + s.id;
      li.appendChild(a);
      nav.appendChild(li);
    });
  }

  // 부품 스크립트(defer)가 다 돈 뒤에 그린다
  var ready = new Promise(function (res) {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', res); else res();
  });
  ready.then(function () { return fetch('dist/lotte-tokens.css'); })
    .then(function (r) {
      if (!r.ok) throw new Error('토큰 파일을 못 읽음: ' + r.status);
      return r.text();
    })
    .then(function (css) {
      var blocks = parseBlocks(css);
      var lightBlock = blocks.filter(function (b) { return b.names.indexOf('--kendo-color-primary') >= 0 && b.sel === ':root'; })[0];
      var deviceBlock = blocks.filter(function (b) { return b.sel === '[data-device="tablet"]'; })[0];
      var all = [].concat.apply([], blocks.filter(function (b) { return b.sel === ':root'; }).map(function (b) { return b.names; }));
      var textClasses = [];
      css.replace(/^\.(text-[\w-]+)\s*\{/gm, function (_, c) { textClasses.push(c); });

      renderColors(lightBlock.names);
      renderDevice(deviceBlock.names);
      renderText(textClasses);
      renderSpacing(all.filter(function (n) { return /^--kendo-spacing-/.test(n); }));
      renderBoxes('pv-radius', all.filter(function (n) { return /border-radius/.test(n); }), 'borderRadius', true);
      renderBoxes('pv-shadow', all.filter(function (n) { return /elevation|shadow/.test(n); }), 'boxShadow', false);
      renderIcons();
      renderButtons();
      renderInputs();
      renderTextareas();
      renderNumeric();
      renderStepper();
      renderChoices();
      renderSwitch();
      renderLabel();
      renderBadge();
      renderChip();
      renderSeparator();
      renderDropdown();
      renderTooltip();
      renderLoader();
      renderSkeleton();
      renderGrid();
      renderTabs();
      renderPager();
      renderDialog();
      renderNotification();
      renderForm();
      renderCard();
      renderAvatar();
      renderBreadcrumb();
      renderCalendar();
      renderToggle();
      renderButtonGroup();
      renderMenu();
      renderTreeView();
      renderStepList();
      renderProgressBar();
      renderExpansionPanel();
      renderToolbar();
      renderSplitter();
      renderKbd();
      renderPageTab();
      renderAppBar();
      renderPageHeading();
      renderToolbarFilter();
      renderToolbarFormAction();
      renderFormTable();
      renderDialogContent();
      renderMenuTile();
      renderSectionCards();
      renderDrawer();
      renderNav();
      apply();
    })
    .catch(function (err) {
      var main = document.getElementById('pv-main');
      main.prepend(el('p', 'pv-section__desc text-sm-regular', err.message));
      throw err;
    });
})();

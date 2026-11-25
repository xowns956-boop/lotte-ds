// tokens/source/*.txt → dist/lotte-tokens.css
// 실행: node scripts/build-tokens.mjs
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const src = (f) => readFileSync(join(root, 'tokens/source', f), 'utf8');

// "이름=값|값  ;종류" 줄 읽기. ## 줄은 구역 이름
function parse(text) {
  const rows = [];
  for (const raw of text.split('\n')) {
    const line = raw.trim();
    if (!line || line.startsWith('#')) continue;
    const i = line.indexOf('=');
    const name = line.slice(0, i);
    const [vals, type] = line.slice(i + 1).split(/\s+;/);
    rows.push({ name, vals: vals.split('|').map((s) => s.trim()), type: type?.trim() });
  }
  return rows;
}

// 토큰 원본 이름 → CSS 변수 이름. / 와 , 는 - 로.
// kendo-color-primary/primary → kendo-color-primary, kendo-color-primary/on-primary → kendo-color-on-primary
function cssName(name) {
  const parts = name.split('/');
  let out = name;
  if (parts.length >= 2) {
    const group = parts[0];
    const leaf = parts.slice(1).join('-');
    const m = group.match(/^((?:kendo|ux4)-color-)(.+)$/);
    if (m && leaf === m[2]) out = group;
    else if (m && leaf === 'on-' + m[2]) out = m[1] + 'on-' + m[2];
    else out = group + '-' + leaf;
  }
  return '--' + out.replace(/,/g, '-').replace(/\s+/g, '-');
}

// 원재료·숫자 표
const primitive = new Map(parse(src('primitive-color.txt')).map((r) => [r.name, r.vals[0]]));
const scaleRows = parse(src('scales.txt'));
const scale = new Map(scaleRows.map((r) => [r.name, r]));
const semanticRows = parse(src('semantic-color.txt'));
const semantic = new Map(semanticRows.map((r) => [r.name, r.vals]));

// 색: 모드 번호(0=Light, 1=Dark)로 끝까지 풀어서 hex
function color(v, mode, seen = []) {
  if (!v.startsWith('@')) return v;
  const ref = v.slice(1);
  if (seen.includes(ref)) throw new Error('순환 참조: ' + [...seen, ref].join(' → '));
  if (primitive.has(ref)) return color(primitive.get(ref), mode, [...seen, ref]);
  if (semantic.has(ref)) return color(semantic.get(ref)[mode], mode, [...seen, ref]);
  throw new Error('없는 변수: ' + ref);
}

// 숫자: 끝까지 풀어서 숫자
function num(v, seen = []) {
  if (!v.startsWith('@')) return v;
  const ref = v.slice(1);
  if (seen.includes(ref)) throw new Error('순환 참조: ' + ref);
  const r = scale.get(ref);
  if (!r) throw new Error('없는 변수: ' + ref);
  return num(r.vals[0], [...seen, ref]);
}

// 숫자 변수의 단위: 굵기·배율 줄높이·글자 사이·선 두께는 단위 없음, 나머지는 px
function unit(name, value) {
  if (/font-weight|letter-spacing|^kendo-line-height|stroke/.test(name)) return String(+(+value).toFixed(4));
  return value + 'px';
}

const names = new Set();
const decl = (name, value) => {
  const n = cssName(name);
  return `  ${n}: ${value};`;
};
const uniq = (list) => {
  for (const r of list) {
    const n = cssName(r.name);
    if (names.has(n)) throw new Error('CSS 이름 겹침: ' + n + ' (' + r.name + ')');
    names.add(n);
  }
};

uniq(semanticRows);
uniq(scaleRows);

// 1) 숫자·글꼴 (모드 없음)
const scaleCss = scaleRows.map((r) => {
  if (r.type === 'STRING') return decl(r.name, `"${r.vals[0]}", sans-serif`);
  const v = r.vals[0];
  // 다른 숫자를 가리키면 var()로 이어 줌(같은 값이 한 곳에서만 정해지게)
  if (v.startsWith('@')) return decl(r.name, `var(${cssName(v.slice(1))})`);
  return decl(r.name, unit(r.name, v));
});

// 2) 의미 색 (Light / Dark) — hex로 풀어서 넣음
const lightCss = semanticRows.map((r) => decl(r.name, color(r.vals[0], 0)));
const darkCss = semanticRows.map((r) => decl(r.name, color(r.vals[1], 1)));

// 3) 기기 (PC / Tablet)
const deviceRows = parse(src('device.txt'));
uniq(deviceRows);
const devVal = (v) => (v.startsWith('@') ? `var(${cssName(v.slice(1))})` : v + 'px');
const pcCss = deviceRows.map((r) => decl(r.name, devVal(r.vals[0])));
const tabletCss = deviceRows.map((r) => decl(r.name, devVal(r.vals[1])));

// 4) 아이콘 (Control / Title / Tile)
const iconRows = parse(src('icon.txt'));
uniq(iconRows);
const iconVal = (r, i) => (r.vals[i].startsWith('@') ? `var(${cssName(r.vals[i].slice(1))})` : unit(r.name, r.vals[i]));
const iconCss = (i) => iconRows.map((r) => decl(r.name, iconVal(r, i)));

// 5) 스타일 (글자·그림자)
const styleText = src('styles.txt');
const [textPart, shadowPart] = styleText.split('## shadow');
const textRows = parse(textPart);
const shadowRows = parse('## shadow' + shadowPart).map((r) => ({ name: r.name, value: r.vals.join('|') }));
uniq(shadowRows);
const shadowCss = shadowRows.map((r) =>
  decl(r.name, r.value.split(',').map((s) => {
    const [x, y, b, sp, c] = s.trim().split(/\s+/);
    return `${x}px ${y}px ${b}px ${sp}px ${c}`;
  }).join(', '))
);
const ref = (v) => `var(${cssName(v.slice(1))})`;
const textCss = textRows.map((r) => {
  const [w, size, lh] = r.vals;
  const cls = '.' + r.name.replace(/\//g, '-');
  return `${cls} {\n  font-family: var(--kendo-font-family);\n  font-weight: ${ref(w)};\n  font-size: ${ref(size)};\n  line-height: ${ref(lh)};\n  letter-spacing: var(--kendo-letter-spacing);\n}`;
});

const block = (sel, lines) => `${sel} {\n${lines.join('\n')}\n}`;
const css = `/* Lotte Kendo DS · 토큰
   라이트 = :root (기본) · 다크 = [data-theme="dark"]
   PC = :root (기본) · Tablet = [data-device="tablet"]
   아이콘 크기 = Control (기본) · [data-icon="title"] · [data-icon="tile"]
   이 파일은 자동으로 만들어진다. 직접 고치지 않는다. */

/* 간격 · 글자 · 모서리 */
${block(':root', scaleCss)}

/* 그림자 */
${block(':root', shadowCss)}

/* 색 — 라이트 */
${block(':root', ['  color-scheme: light;', ...lightCss])}

/* 색 — 다크 */
${block('[data-theme="dark"]', ['  color-scheme: dark;', ...darkCss])}

/* 기기 — PC (기본) */
${block(':root', pcCss)}

/* 기기 — Tablet */
${block('[data-device="tablet"]', tabletCss)}

/* 아이콘 — 기기 값을 따르므로 기기·아이콘 모드가 걸린 곳에서 다시 계산 */
${block(':root, [data-device], [data-icon="control"]', iconCss(0))}
${block('[data-icon="title"]', iconCss(1))}
${block('[data-icon="tile"]', iconCss(2))}

/* 글자 스타일 */
${textCss.join('\n\n')}
`;

mkdirSync(join(root, 'dist'), { recursive: true });
writeFileSync(join(root, 'dist/lotte-tokens.css'), css);
console.log(`dist/lotte-tokens.css — 색 ${semanticRows.length}(라이트·다크) · 숫자 ${scaleRows.length} · 기기 ${deviceRows.length}(PC·Tablet) · 아이콘 ${iconRows.length}(3모드) · 그림자 ${shadowRows.length} · 글자 스타일 ${textRows.length}`);

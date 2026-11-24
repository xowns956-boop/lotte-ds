// AI용 안내 파일 만들기: llms.txt(요약 목차) · llms-full.txt(전체 참고서)
// 설치 전에도 AI가 이 주소를 읽고 롯데 DS 규칙·부품·토큰을 알 수 있게 한다.
// 재료: package.json(버전) · components/index.json(부품) · docs/lotte.md(규칙) · dist/lotte-tokens.css(토큰) · changelog/changelog.json(업데이트 현황)
// 실행: npm run llms  (공개 주소로 만들 때: LOTTE_BASE=https://<주소> npm run llms)
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const read = (p) => readFileSync(join(root, p), 'utf8');

const VERSION = process.env.LOTTE_VERSION || JSON.parse(read('package.json')).version;
const BASE = (process.env.LOTTE_BASE || 'http://localhost:3700').replace(/\/$/, '');
const R = `${BASE}/r/${VERSION}`;
const components = JSON.parse(read('components/index.json'));
const rules = read('docs/lotte.md');
const changelog = JSON.parse(read('changelog/changelog.json'));
if (!existsSync(join(root, 'dist/lotte-tokens.css'))) throw new Error('dist/lotte-tokens.css 없음 (npm run tokens 먼저)');
const tokens = read('dist/lotte-tokens.css');

// 토큰 CSS에서 주석 제목으로 블록을 찾아 변수 목록을 꺼낸다
function block(title) {
  const at = tokens.indexOf(`/* ${title} */`);
  if (at < 0) throw new Error('토큰 블록 없음: ' + title);
  const open = tokens.indexOf('{', at);
  const close = tokens.indexOf('}', open);
  const vars = {};
  for (const m of tokens.slice(open + 1, close).matchAll(/(--[\w-]+):\s*([^;]+);/g)) vars[m[1]] = m[2].trim();
  return vars;
}
const light = block('색 — 라이트');
const dark = block('색 — 다크');
const pc = block('기기 — PC (기본)');
const tablet = block('기기 — Tablet');
const colorNames = Object.keys(dark).filter((k) => k in light);
const deviceNames = Object.keys(tablet).filter((k) => k in pc);

// 부품: 묶음(group)별
const groups = [];
for (const c of components) {
  let g = groups.find((x) => x.name === c.group);
  if (!g) groups.push((g = { name: c.group, items: [] }));
  g.items.push(c.name);
}
const partList = groups.map((g) => `- ${g.name}: ${g.items.join(' · ')}`).join('\n');

const files = {
  manifest: `${R}/manifest.json`,
  tokens: `${R}/lotte-tokens.css`,
  ds: `${R}/lotte-ds.css`,
  js: `${R}/lotte-ds.js`,
  rules: `${R}/lotte.md`,
};

const summary = `> 롯데웰푸드 MES 화면용 디자인 시스템. Kendo UI(2021.3) 화면 위에 마지막으로 불러오는 덮어쓰기 CSS·JS 묶음이다. 순수 HTML·CSS·JS 전용(React·Tailwind CSS·jQuery UI 등 쓰지 않음). 라이트·다크 두 모드, PC·Tablet 두 기기 크기. 부품 ${components.length}개. 현재 버전 ${VERSION}.`;

const llms = `# Lotte Kendo DS

${summary}

설치 주소에는 버전이 들어 있다(/r/${VERSION}/). 같은 버전의 설치 파일이 이 문서보다 우선한다.

## AI Reference

- [AI로 설치하기](${BASE}/install/): 설치 프롬프트(프로젝트 확인 → 파일 받기 → 화면 연결 → 규칙 저장 → 확인 화면)
- [전체 참고서](${BASE}/llms-full.txt): 화면 규칙(lotte.md 전문), 색 토큰 라이트·다크 값, 기기 크기 PC·Tablet 값, 부품 목록, 업데이트 현황

## 설치

- 받을 파일 4개: lotte-tokens.css · lotte-ds.css · lotte-ds.js(부품 동작) · lotte.md(화면 규칙)
- 불러오는 순서: Kendo CSS → lotte-tokens.css → lotte-ds.css → 화면 CSS. lotte-ds.js는 defer로 불러온다. 순서가 바뀌면 Kendo 원래 모양이 이긴다.
- \`<html>\`에 \`data-theme="light|dark"\` · \`data-device="pc|tablet"\`을 둔다.
- 설치 주소가 열리지 않으면 멈추고 사람에게 알린다. 비슷한 CSS를 지어내거나 다른 UI 라이브러리로 대신하지 않는다.

## 설치 파일

- [manifest.json](${files.manifest}): 버전 · 파일 목록 · 불러오는 순서 · 부품 목록
- [lotte-tokens.css](${files.tokens}): 토큰(색 · 간격 · 글자 · 모서리 · 그림자 · 기기 크기)과 글자 클래스
- [lotte-ds.css](${files.ds}): 부품 ${components.length}개 CSS 합본
- [lotte-ds.js](${files.js}): 부품 동작 합본(목록 열기 · 달력 · 탭 이동 등)
- [lotte.md](${files.rules}): 화면 규칙 · 부품별 쓰는 법

## Docs

- [부품 미리보기](${BASE}/): 모든 부품을 라이트·다크 · PC·Tablet으로 보는 화면
- [AI로 설치하기](${BASE}/install/): 사람이 복사해 AI에 붙여 넣는 설치 프롬프트
- [업데이트 현황](${BASE}/changelog/): 버전별로 추가·바뀐 점, 업데이트할 때 주의할 점

## 부품 (${components.length}개)

${partList}

이 목록에 없는 UI는 만들지 않는다. 화면에 "디자인 필요: <UI 이름>" 빈 자리를 빨간 점선으로 두고 디자이너에게 요청하라고 알린다(lotte.md 1장 "없는 UI").
`;

const colorRows = colorNames.map((k) => `| ${k} | ${light[k]} | ${dark[k]} |`).join('\n');
const deviceRows = deviceNames.map((k) => `| ${k} | ${pc[k]} | ${tablet[k]} |`).join('\n');

const changelogText = changelog
  .map((rel) => `### ${rel.version} (${rel.date})\n\n${rel.summary}\n\n` +
    rel.groups.map((g) => `${g.title}\n${g.items.map((it) => `- ${it}`).join('\n')}`).join('\n\n'))
  .join('\n\n');

const full = `# Lotte Kendo DS — 전체 참고서

${summary}

이 파일은 AI가 롯데 DS로 화면을 만들 때 읽는 참고서다. 설치된 프로젝트에서는 docs/lotte.md가 같은 규칙을 담고 있다.

## 설치

\`\`\`
mkdir -p lotte-ds docs
curl -fsSL ${files.tokens} -o lotte-ds/lotte-tokens.css
curl -fsSL ${files.ds} -o lotte-ds/lotte-ds.css
curl -fsSL ${files.js} -o lotte-ds/lotte-ds.js
curl -fsSL ${files.rules} -o docs/lotte.md
\`\`\`

\`\`\`html
<html lang="ko" data-theme="light" data-device="pc">
<!-- Kendo CSS 다음에, 화면 CSS보다 먼저 -->
<link rel="stylesheet" href="lotte-ds/lotte-tokens.css">
<link rel="stylesheet" href="lotte-ds/lotte-ds.css">
<script src="lotte-ds/lotte-ds.js" defer></script>
\`\`\`

- 설치 주소가 열리지 않거나 확인 화면에서 콘솔 에러가 나면 완료라고 말하지 않는다.
- lotte-ds/ 폴더의 파일과 부품 모양은 고치지 않는다.

## 화면 규칙 (lotte.md 전문, 제목은 한 단계 내림)

${rules.replace(/^# .*\n/, '').replace(/^(#{2,5}) /gm, '#$1 ')}

## 색 토큰 (${colorNames.length}개)

\`var(--이름)\`으로 쓴다. hex를 직접 쓰지 않는다. 라이트 = 기본, 다크 = \`[data-theme="dark"]\`.

| 이름 | 라이트 | 다크 |
|---|---|---|
${colorRows}

## 기기 크기 (${deviceNames.length}개)

\`var(--이름)\`으로 쓴다. PC = 기본, Tablet = \`[data-device="tablet"]\`. 값의 \`var(--kendo-spacing-N)\`은 N × 4px, 글자 크기·줄 높이는 lotte-tokens.css에 있다.

| 이름 | PC | Tablet |
|---|---|---|
${deviceRows}

## 부품 (${components.length}개)

${partList}

## 업데이트 현황

${changelogText}
`;

writeFileSync(join(root, 'llms.txt'), llms);
writeFileSync(join(root, 'llms-full.txt'), full);
console.log(`llms.txt ${llms.length}자 · llms-full.txt ${full.length}자 · base ${BASE} · v${VERSION}`);

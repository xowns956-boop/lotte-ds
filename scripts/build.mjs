// 설치용 파일 만들기
// 1) 부품 CSS를 순서대로 합쳐 dist/lotte-ds.css
// 2) 버전 폴더 r/<버전>/ 에 설치 파일 복사 + manifest.json
// 3) r/meta.json (설치 페이지가 읽는 버전·부품 목록)
// 실행: npm run build  (토큰이 바뀌었으면 먼저 npm run tokens)
import { readFileSync, writeFileSync, mkdirSync, copyFileSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const read = (p) => readFileSync(join(root, p), 'utf8');
const version = process.env.LOTTE_VERSION || JSON.parse(read('package.json')).version;
const components = JSON.parse(read('components/index.json'));

// 1) 합본 (CSS 전부 · JS는 있는 부품만)
const parts = components.map((c) => {
  const file = `components/${c.dir}/${c.dir}.css`;
  if (!existsSync(join(root, file))) throw new Error('부품 CSS 없음: ' + file);
  return `/* ── ${c.name} ── */\n` + read(file).trim() + '\n';
});
const bundle = `/* Lotte Kendo DS ${version} · 부품 CSS 합본
   불러오는 순서: Kendo CSS → lotte-tokens.css → lotte-ds.css
   이 파일은 자동으로 만들어진다. 직접 고치지 않는다. */\n\n` + parts.join('\n');
mkdirSync(join(root, 'dist'), { recursive: true });
writeFileSync(join(root, 'dist/lotte-ds.css'), bundle);

const jsParts = components
  .map((c) => `components/${c.dir}/${c.dir}.js`)
  .filter((f) => existsSync(join(root, f)))
  .map((f) => `/* ── ${f.split('/')[1]} ── */\n` + read(f).trim() + '\n');
const jsBundle = `/* Lotte Kendo DS ${version} · 부품 동작 합본
   <script src="lotte-ds/lotte-ds.js" defer></script> 로 불러온다.
   이 파일은 자동으로 만들어진다. 직접 고치지 않는다. */\n\n` + jsParts.join('\n');
writeFileSync(join(root, 'dist/lotte-ds.js'), jsBundle);

// 2) 버전 폴더
const out = join(root, 'r', version);
mkdirSync(out, { recursive: true });
const files = [
  ['dist/lotte-tokens.css', 'lotte-tokens.css'],
  ['dist/lotte-ds.css', 'lotte-ds.css'],
  ['dist/lotte-ds.js', 'lotte-ds.js'],
  ['docs/lotte.md', 'lotte.md'],
];
for (const [from, to] of files) {
  if (!existsSync(join(root, from))) throw new Error('파일 없음: ' + from + (from.includes('tokens') ? ' (npm run tokens 먼저)' : ''));
  copyFileSync(join(root, from), join(out, to));
}
const manifest = {
  name: 'lotte-ds',
  version,
  files: files.map(([, to]) => to),
  load: ['lotte-tokens.css', 'lotte-ds.css', 'lotte-ds.js'],
  rules: 'lotte.md',
  components: components.map((c) => ({ name: c.name, group: c.group })),
};
writeFileSync(join(out, 'manifest.json'), JSON.stringify(manifest, null, 2) + '\n');

// 3) 설치 페이지용
writeFileSync(join(root, 'r/meta.json'), JSON.stringify({ version, components: manifest.components }, null, 2) + '\n');

console.log(`r/${version}/ — ${manifest.files.join(' · ')} · manifest.json (부품 ${components.length}개)`);

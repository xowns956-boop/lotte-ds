// "AI로 설치하기" 페이지 글·프롬프트. 문구를 고칠 때는 이 파일만 연다.
// 버전은 package.json → npm run build → r/meta.json 에서 읽는다.
// 주소(BASE)는 이 페이지가 열린 주소에서 계산한다(로컬 미리보기 · 공개 주소 둘 다 그대로 동작).
(function () {
  'use strict';

  function build(VERSION, BASE) {
    var R = BASE + 'r/' + VERSION + '/';
    var url = {
      manifest: R + 'manifest.json',
      tokens: R + 'lotte-tokens.css',
      ds: R + 'lotte-ds.css',
      js: R + 'lotte-ds.js',
      rules: R + 'lotte.md'
    };

    var linkTags =
      '<!-- Kendo CSS 다음에, 화면 CSS보다 먼저 -->\n' +
      '<link rel="stylesheet" href="lotte-ds/lotte-tokens.css">\n' +
      '<link rel="stylesheet" href="lotte-ds/lotte-ds.css">\n' +
      '<!-- </body> 바로 앞 또는 <head>에 defer로 -->\n' +
      '<script src="lotte-ds/lotte-ds.js" defer></script>';

    var curlCommand =
      'mkdir -p lotte-ds docs\n' +
      'curl -fsSL ' + url.tokens + ' -o lotte-ds/lotte-tokens.css\n' +
      'curl -fsSL ' + url.ds + ' -o lotte-ds/lotte-ds.css\n' +
      'curl -fsSL ' + url.js + ' -o lotte-ds/lotte-ds.js\n' +
      'curl -fsSL ' + url.rules + ' -o docs/lotte.md';

    var psCommand =
      'New-Item -ItemType Directory -Force lotte-ds, docs | Out-Null\n' +
      'Invoke-WebRequest ' + url.tokens + ' -OutFile lotte-ds/lotte-tokens.css\n' +
      'Invoke-WebRequest ' + url.ds + ' -OutFile lotte-ds/lotte-ds.css\n' +
      'Invoke-WebRequest ' + url.js + ' -OutFile lotte-ds/lotte-ds.js\n' +
      'Invoke-WebRequest ' + url.rules + ' -OutFile docs/lotte.md';

    // 블록 앞뒤 표시: AI가 블록 끝을 헷갈리지 않게 하고, 업데이트 때 이 사이만 바꾸게 한다
    var RULES_START = '<!-- lotte-ds 규칙 시작 -->';
    var RULES_END = '<!-- lotte-ds 규칙 끝 -->';
    var rulesBlock =
RULES_START + '\n' +
'## Design system: Lotte Kendo DS v' + VERSION + '\n\n' +
'사용자가 "롯데 DS 써", "Lotte DS 써", "디자인 시스템 써"라고 하면 docs/lotte.md를 먼저 읽고 그 규칙대로 만든다.\n\n' +
'- 화면은 순수 HTML·CSS·JS로 만든다. React·Tailwind CSS·Bootstrap·jQuery UI 등 다른 프레임워크·UI 라이브러리를 설치하지 않는다.\n' +
'- docs/lotte.md 3장 부품 표에 있는 부품만 조립한다. 클래스 이름은 표에 적힌 Kendo 이름(.k-button, .k-textbox …)을 그대로 쓴다. UI를 만드는 것은 디자이너의 일이다.\n' +
'- 부품 표에 없는 UI는 만들지 않는다. "제가 만들까요?" 같은 제안이나 질문도 하지 않는다. 없는 UI를 빠짐없이 목록으로 알리고 디자이너에게 요청하라고 안내한다. 그 자리는 화면에 "디자인 필요: <UI 이름>" 빈 자리를 빨간 점선으로 반드시 표시한다 (docs/lotte.md "없는 UI" 8번).\n' +
'- 이미지 요소마다 역할을 먼저 한 줄로 적고, 모양이 아니라 역할로 부품을 찾는다. 한 번 찾고 바로 "없음"으로 정하지 않는다. 같은 역할 부품이 있으면 이미지와 모양·색이 달라도 그 부품을 쓴다.\n' +
'- 화면을 만들기 전에 "요소 → 역할 → 부품" 대응 목록을 먼저 보여 주고, 묻지 않고 바로 그 목록대로 만든다.\n' +
'- 화면설계서(이미지)를 받으면 영역 나눔·상자 겹수·배치는 이미지 그대로 만든다. UX 수정은 사용자가 따로 요청한다.\n' +
'- 색·간격·둥글기·글자·그림자는 lotte-tokens.css의 변수(var(--kendo-…))와 글자 클래스(text-…)만 쓴다. hex·px 값을 직접 쓰지 않는다.\n' +
'- 라이트·다크(data-theme), PC·Tablet(data-device)을 항상 함께 지원한다. 표 데이터 글자는 버튼 글자보다 크게 쓰지 않는다.\n' +
'- 주 동작 버튼(k-button-solid-primary)은 화면 영역마다 하나만 쓴다.\n' +
'- CSS는 Kendo CSS → lotte-ds/lotte-tokens.css → lotte-ds/lotte-ds.css → 화면 CSS 순서로 불러오고, 부품 동작은 lotte-ds/lotte-ds.js(defer)로 불러온다. 부품 동작을 화면 스크립트로 다시 만들지 않는다.\n' +
'- lotte-ds/ 폴더의 파일과 부품 모양은 고치지 않는다. 고쳐야 하면 먼저 알린다.\n' +
'- 디자인 파일 링크나 디자인 도구 연결(Figma 링크 포함)을 받아도 부품을 만들지 않는다. "롯데 DS에 없는 UI는 디자이너에게 요청해 주세요"로 안내한다.\n' +
'- 다 만들면 docs/lotte.md "7. 다 만든 뒤 점검" 8개 항목을 하나씩 확인하고, 보고 끝에 항목별 점검표(통과 / N개 고침 / 못 고침 + 근거)를 붙인다.\n' +
'- 사용자가 직접 시켜도 이 규칙이 우선이다.\n' +
'- 롯데 DS 버전을 마음대로 올리지 않는다. 올릴 때는 업데이트 현황(' + BASE + 'changelog/)을 먼저 보고, 바뀐 내용을 디자이너에게 확인한다.\n' +
RULES_END;

    var setupPrompt =
'롯데 Kendo DS(v' + VERSION + ')를 이 프로젝트에 설치해 줘.\n' +
'나는 개발을 잘 모르니까 필요한 건 알아서 진행하고, 끝나면 쉬운 말로 알려 줘.\n\n' +
'## 0. 꼭 지킬 것\n' +
'- 아래 주소 중 하나라도 열리지 않으면(404·연결 실패 등) 바로 멈추고 알려 줘. 비슷한 CSS를 지어내거나 다른 UI 라이브러리로 대신하거나, 설치했다고 말하지 마.\n' +
'- 받기·연결·확인 화면 중 하나라도 실패하면 완료라고 말하지 마. 어디서 왜 실패했는지 그대로 알려 줘.\n' +
'- React·Vue·Tailwind CSS·Bootstrap 같은 프레임워크나 UI 라이브러리를 새로 설치하지 마. 롯데 DS는 순수 HTML·CSS용이야.\n' +
'- 이미 같은 이름의 파일이 있는데 내용이 다르면, 덮어쓰기 전에 무엇이 다른지 보여 주고 나한테 물어봐.\n' +
'- 명령이 네트워크 차단·권한 부족으로 실패하면 몰래 건너뛰지 말고, 권한 승인을 요청하거나 나한테 알려 줘.\n\n' +
'## 1. 프로젝트 확인\n' +
'- 이 폴더가 비어 있으면: 빌드 도구 없이 index.html 하나로 시작하는 순수 HTML 프로젝트로 만들어.\n' +
'- HTML 파일(또는 JSP처럼 HTML을 만드는 화면 파일)이 있으면 그대로 써.\n' +
'- Kendo CSS를 HTML의 <link>가 아니라 서버 설정 파일로 합쳐서 불러오는 프로젝트면: 2번(파일 받기)과 4번(규칙 저장)만 하고 3번(연결)은 하지 마. 어디에 넣어야 하는지 개발자에게 확인하라고 알려 줘.\n\n' +
'## 2. 파일 받기\n' +
'먼저 ' + url.manifest + ' 를 열어 버전이 ' + VERSION + '인지 확인해. 그다음 아래 네 파일을 받아서 이 경로에 저장해.\n' +
'- ' + url.tokens + ' → lotte-ds/lotte-tokens.css\n' +
'- ' + url.ds + ' → lotte-ds/lotte-ds.css\n' +
'- ' + url.js + ' → lotte-ds/lotte-ds.js\n' +
'- ' + url.rules + ' → docs/lotte.md\n\n' +
'## 3. 화면에 연결\n' +
'- 화면 HTML의 <head>에서 Kendo CSS 다음, 화면 CSS보다 먼저 아래 CSS 두 줄을 넣고, 부품 동작 스크립트 한 줄도 넣어. CSS 순서가 바뀌면 Kendo 원래 모양이 이겨.\n\n' +
linkTags + '\n\n' +
'- Kendo CSS가 없는 프로젝트면 <head>에 위 줄들만 넣어.\n' +
'- <html>에 lang="ko" data-theme="light" data-device="pc" 를 넣어. (다크는 data-theme="dark", 태블릿은 data-device="tablet")\n\n' +
'## 4. AI 규칙 저장\n' +
'어떤 AI 도구(Claude Code·Cursor·Codex 등)로 열어도 같은 규칙을 읽도록 두 파일을 맞춰 줘.\n' +
'- 프로젝트 맨 위 AGENTS.md에 아래 블록을 추가해 줘(없으면 파일을 만들어). Cursor·Codex는 이 파일을 읽어.\n' +
'  블록은 `' + RULES_START + '` 줄부터 `' + RULES_END + '` 줄까지야. 이 두 줄도 그대로 넣고, 그 바깥 글(이 프롬프트의 5번부터)은 넣지 마.\n' +
'  AGENTS.md에 이미 이 두 줄로 둘러싼 블록이 있으면 그 사이를 통째로 바꿔.\n' +
'- 프로젝트 맨 위 CLAUDE.md에는 `@AGENTS.md` 한 줄이 있게 해 줘(없으면 파일을 만들어). Claude Code는 이 줄로 AGENTS.md를 읽어. CLAUDE.md에 예전 롯데 DS 블록이 있으면 지워서 규칙이 두 군데 생기지 않게 해.\n\n' +
rulesBlock + '\n\n' +
'## 5. 확인 화면\n' +
'프로젝트 맨 위에 lotte-check.html을 만들어 줘. 처음 보는 사람도 "이게 왜 생겼지?" 하지 않게, 무슨 화면인지 화면 안에 적어 줘. 3번처럼 CSS 두 개와 스크립트를 불러오고, 롯데 DS 부품과 글자 클래스만 써서, 문구는 아래 그대로:\n' +
'- 제목(h1, text-title-semibold): "롯데 DS 설치 확인"\n' +
'- 설명: "롯데 Kendo DS(v' + VERSION + ')가 잘 설치됐는지 확인하는 화면이에요. AI가 설치 마지막 단계에서 자동으로 만들었어요."\n' +
'- 전환 버튼 4개: "라이트" · "다크" (한 묶음), "PC" · "Tablet" (한 묶음). 모두 k-button k-button-md를 붙이고, 묶음마다 지금 고른 쪽은 k-button-solid-secondary + aria-pressed="true", 나머지는 k-button-outline-base + aria-pressed="false"로 해. 처음엔 라이트·PC가 고른 쪽이야.\n' +
'  누르면 <html>의 data-theme · data-device를 바꾸고, 같은 묶음 안에서 위 두 클래스와 aria-pressed도 바꿔 주는 짧은 스크립트를 같은 파일에 넣어.\n' +
'- 소제목 "이렇게 보이면 설치 성공" 아래 목록: "파란 주 버튼과 둥근 모서리로 보여요" / "다크를 누르면 바탕과 글자 색이 바뀌어요" / "Tablet을 누르면 버튼과 입력칸이 커져요"\n' +
'- 그 아래 견본: 주 버튼("주 버튼", k-button-solid-primary) 1개, 보조 버튼("보조 버튼", k-button-outline-base) 1개, 라벨("확인용 입력칸")과 연결된 입력칸(k-textbox, 안내 글자 "내용을 입력하세요") 1개\n' +
'- 소제목 "다음 단계" 아래: "이제 AI에게 \'롯데 DS 써서 ○○ 화면 만들어 줘\'라고 말하면 롯데 DS 부품으로 화면을 만들어요." / "확인이 끝났으면 이 화면은 지워도 돼요. (lotte-check.html)"\n' +
'- 바탕은 var(--ux4-color-page-bg), 글자는 var(--kendo-color-on-app-surface), 바깥 여백과 구역 간격은 var(--kendo-spacing-6). hex·px 값은 쓰지 마.\n' +
'그다음 브라우저로 열어서 라이트·다크·PC·Tablet을 눌러 보고 콘솔 에러가 없는지 확인해. 내가 열어 볼 방법(파일 경로나 주소)을 알려 줘.\n\n' +
'## 6. 끝나면 알려 줄 것\n' +
'- 무엇을 받고·바꿨는지 3줄 이내로\n' +
'- 앞으로 이렇게 말하면 된다는 예시 2개 (예: "롯데 DS 써서 LOT 입력 화면 만들어 줘")';

    // 업데이트 현황의 최신 버전 카드 버튼이 복사하는 글. 이미 롯데 DS를 설치한 프로젝트용
    var updatePrompt =
'이 프로젝트의 롯데 Kendo DS를 v' + VERSION + '으로 업데이트해 줘.\n' +
'나는 개발을 잘 모르니까 필요한 건 알아서 진행하고, 끝나면 쉬운 말로 알려 줘.\n\n' +
'## 0. 꼭 지킬 것\n' +
'- 이 프로젝트에 롯데 DS가 설치돼 있지 않으면(lotte-ds/lotte-ds.css나 docs/lotte.md가 없으면) 멈추고, AI로 설치하기 페이지(' + BASE + 'install/)의 설치 프롬프트를 쓰라고 알려 줘.\n' +
'- 아래 주소 중 하나라도 열리지 않으면(404·연결 실패 등) 바로 멈추고 알려 줘. 비슷한 CSS를 지어내거나 예전 파일을 그대로 둔 채 업데이트했다고 말하지 마.\n' +
'- 받기·확인 중 하나라도 실패하면 완료라고 말하지 마. 어디서 왜 실패했는지 그대로 알려 줘.\n' +
'- 화면 파일(화면 HTML·화면 CSS·화면 스크립트)은 건드리지 마. 바꾸는 건 lotte-ds/ 폴더의 세 파일, docs/lotte.md, AI 규칙 블록뿐이야.\n\n' +
'## 1. 바뀐 내용 확인\n' +
'업데이트 현황(' + BASE + 'changelog/)에서 v' + VERSION + ' 카드를 읽고, 무엇이 바뀌는지 3줄 이내로 먼저 알려 줘. 알려 준 뒤에는 묻지 말고 바로 2번으로 넘어가.\n\n' +
'## 2. 받기\n' +
'먼저 ' + url.manifest + ' 를 열어 버전이 ' + VERSION + '인지 확인해. 그다음 아래 네 파일을 받아서 같은 경로에 새 것으로 바꿔.\n' +
'- ' + url.tokens + ' → lotte-ds/lotte-tokens.css\n' +
'- ' + url.ds + ' → lotte-ds/lotte-ds.css\n' +
'- ' + url.js + ' → lotte-ds/lotte-ds.js\n' +
'- ' + url.rules + ' → docs/lotte.md\n' +
'- 단, git 기록에 롯데 DS 설치·업데이트가 아닌 수정이 있는 파일은 바꾸기 전에 무엇이 다른지 보여 주고 나한테 물어봐.\n' +
'- 화면 HTML의 <link>·<script> 순서는 그대로 둬. 파일 이름이 같아서 다시 연결할 필요 없어.\n\n' +
'## 3. AI 규칙 바꾸기\n' +
'AGENTS.md에서 `' + RULES_START + '` 줄부터 `' + RULES_END + '` 줄까지를 아래 블록으로 통째로 바꿔(블록이 없으면 맨 아래에 추가). CLAUDE.md는 `@AGENTS.md` 한 줄 그대로 두고, 거기에 예전 롯데 DS 블록이 있으면 지워.\n\n' +
rulesBlock + '\n\n' +
'## 4. 확인\n' +
'lotte-check.html이 있으면 브라우저로 열어서 라이트·다크·PC·Tablet을 눌러 보고 콘솔 에러가 없는지 확인해. 없으면 롯데 DS를 쓰는 화면 하나를 열어서 같은 걸 확인해.\n\n' +
'## 5. 끝나면 알려 줄 것\n' +
'- 바꾼 파일 목록, 바꾸지 않고 건너뛴 파일과 그 이유\n' +
'- 1번에서 확인한 바뀐 내용을 화면에서 어떻게 쓰면 되는지 예시 1개';

    return {
      VERSION: VERSION,
      BASE: BASE,
      url: url,
      linkTags: linkTags,
      curlCommand: curlCommand,
      psCommand: psCommand,
      rulesBlock: rulesBlock,
      setupPrompt: setupPrompt,
      updatePrompt: updatePrompt,

      steps: [
        {
          title: 'AI 도구로 프로젝트 폴더 열기',
          body: 'Claude Code·Cursor·Codex 같은 AI 도구에서 작업할 폴더를 열어요. 아무것도 없는 빈 폴더여도 괜찮아요. AI가 HTML 파일부터 만들어요.'
        },
        {
          title: '설치 프롬프트 붙여넣기',
          body: '위 버튼으로 복사한 글을 AI 채팅창에 그대로 붙여넣고 보내요. Cursor는 채팅을 Agent 모드로 두고 보내요. 파일 수정·명령 실행·인터넷 사용 허락을 물어보면 허용해요.'
        },
        {
          title: '확인 화면 열어 보기',
          body: 'AI가 알려 준 lotte-check.html을 브라우저로 열어요. \'롯데 DS 설치 확인\' 화면이 나오고 다크·Tablet 버튼으로 모양이 바뀌면 설치 끝이에요. 확인용이라 다 보고 나면 지워도 돼요.'
        }
      ],

      examples: [
        '롯데 DS 써서 LOT 번호 입력칸과 조회 버튼이 있는 화면 만들어 줘.',
        '롯데 DS 써서 이 화면설계서대로 태블릿 화면 만들어 줘. (이미지 첨부)',
        '롯데 DS 써서 로그인 화면 만들어 줘. 아이디·비밀번호 입력칸과 로그인 버튼이 있어야 해.'
      ],

      faqs: [
        {
          q: '설치했는데 버튼이 예전 Kendo 모양 그대로예요',
          a: 'CSS 불러오는 순서가 바뀐 경우예요. Kendo CSS가 롯데 DS 파일보다 뒤에 있으면 Kendo가 이겨요. AI에게 "lotte-ds CSS를 Kendo CSS 다음으로 옮겨 줘"라고 말해요.'
        },
        {
          q: '색이 전부 검정·회색이에요',
          a: 'lotte-tokens.css(색·간격 변수)가 빠진 경우예요. AI에게 "lotte-tokens.css도 받아서 lotte-ds.css 앞에 연결해 줘"라고 말해요.'
        },
        {
          q: '다크·태블릿으로 안 바뀌어요',
          a: '<html>에 data-theme · data-device 속성이 없거나 철자가 다른 경우예요. data-theme="dark", data-device="tablet"이어야 해요.'
        },
        {
          q: '글꼴이 시안과 조금 달라 보여요',
          a: '롯데 DS 글꼴은 Pretendard예요. 컴퓨터에 Pretendard가 없으면 기본 고딕으로 보여요. 글꼴 파일을 어디서 받을지는 개발자와 정해요.'
        },
        {
          q: '"파일을 덮어쓸까요?"라고 물어봐요',
          a: '처음 만든 프로젝트라면 덮어써도 괜찮아요. 이미 누가 고친 화면·CSS가 있는 프로젝트라면 개발자에게 먼저 물어봐요.'
        },
        {
          q: '"설치 주소가 열리지 않는다"며 AI가 멈췄어요',
          a: '롯데 DS 주소가 닫혀 있거나 인터넷 연결이 끊긴 경우예요. AI가 멈춘 게 맞는 동작이에요. 롯데 DS 담당 디자이너에게 주소가 열려 있는지 물어봐요.'
        },
        {
          q: 'AI가 "서버 설정 파일이라 연결은 개발자 확인이 필요하다"고 해요',
          a: 'Kendo CSS를 서버가 합쳐서 불러오는 프로젝트예요. 파일은 받아 뒀으니, 개발자에게 롯데 DS CSS 두 개를 Kendo CSS 다음 순서로 넣어 달라고 요청해요.'
        },
        {
          q: 'Cursor에서 붙여넣었는데 설명만 하고 설치를 안 해요',
          a: '채팅이 Ask 모드라서 그래요. 채팅창 아래에서 Agent 모드로 바꾸고 프롬프트를 다시 보내요.'
        },
        {
          q: 'Codex에서 파일 받기가 인터넷 문제로 실패해요',
          a: 'Codex는 기본으로 인터넷 사용을 막아 둘 수 있어요. 허락을 물어보면 허용하고, 묻지 않고 실패하면 Codex 승인 모드를 바꾸거나 "파일 받기를 인터넷 허용으로 다시 실행해 줘"라고 말해요.'
        },
        {
          q: '다른 AI 도구로 바꿔도 규칙이 그대로인가요?',
          a: '네. 규칙은 AGENTS.md에 저장되고 Claude Code는 CLAUDE.md에서 그 파일을 불러와요. Claude Code·Cursor·Codex 어느 쪽으로 열어도 같은 규칙으로 화면을 만들어요.'
        },
        {
          q: '필요한 UI를 AI가 만들지 않아요',
          a: '맞는 동작이에요. 롯데 DS에 없는 UI는 AI가 "디자인 필요" 빨간 점선으로 비워 두고 목록으로 알려 줘요. 디자이너에게 요청하면 롯데 DS에 추가돼요.'
        }
      ],

      manualCases: [
        { title: '이미 운영 중인 프로젝트에 넣을 때', body: '기존 화면의 Kendo 버튼·입력칸 모양이 한꺼번에 바뀌어요. 어느 화면에 먼저 붙일지 정하고 직접 넣는 게 안전해요.' },
        { title: 'Kendo CSS를 서버가 합쳐서 부를 때', body: '서버 설정 파일의 CSS 목록에서 Kendo 다음 자리에 두 파일을 넣어야 해요. AI가 함부로 고치면 안 되는 곳이에요.' },
        { title: '자동화(배포 스크립트)에 넣을 때', body: '사람 없이 돌아가는 과정에는 AI가 끼어들 수 없어서 명령이 필요해요.' },
        { title: 'AI 도구를 쓰지 않을 때', body: '터미널에서 명령을 직접 실행하는 방법밖에 없어요.' },
        { title: '버전을 올릴 때', body: '주소에 버전이 들어 있어요. 업데이트 현황에서 바뀐 내용을 먼저 확인하고, 직접 고친 화면과 비교하면서 바꿔요.' }
      ]
    };
  }

  window.LotteInstallContent = { build: build };
})();

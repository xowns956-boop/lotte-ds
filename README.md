# Lotte Kendo DS

롯데웰푸드 MES 화면용 디자인 시스템이에요. Kendo UI(2021.3) 화면 위에 CSS·JS 파일 몇 개를 마지막으로 불러오면 버튼·입력칸·표가 롯데 디자인으로 바뀌어요.

- 순수 HTML·CSS·JS 전용이에요. React·Vue·Tailwind CSS·jQuery UI 같은 프레임워크나 UI 라이브러리는 쓰지 않아요.
- 라이트·다크 두 모드, PC·Tablet 두 기기 크기를 지원해요.
- 부품 38종과 화면 패턴 8종이 들어 있어요.

## 바로 가기

| 페이지 | 내용 |
|---|---|
| [부품 미리보기](https://xowns956-boop.github.io/lotte-ds/) | 모든 부품을 라이트·다크, PC·Tablet으로 보는 화면 |
| [AI로 설치하기](https://xowns956-boop.github.io/lotte-ds/install/) | 설치 프롬프트를 복사해 AI 도구에 붙여 넣는 방법 |
| [업데이트 현황](https://xowns956-boop.github.io/lotte-ds/changelog/) | 버전별로 추가·바뀐 점, 업데이트 프롬프트 |
| [llms.txt](https://xowns956-boop.github.io/lotte-ds/llms.txt) | AI가 읽는 안내 파일(전체판은 [llms-full.txt](https://xowns956-boop.github.io/lotte-ds/llms-full.txt)) |

## 설치

### AI로 설치하기 (추천)

[AI로 설치하기](https://xowns956-boop.github.io/lotte-ds/install/) 페이지에서 설치 프롬프트를 복사해 Claude Code·Cursor·Codex 채팅창에 붙여 넣어요. AI가 파일을 받아 화면에 연결하고 규칙까지 저장해요.

### 직접 설치하기

1. 아래 네 파일을 받아요. 주소에 버전이 들어 있어요(`https://xowns956-boop.github.io/lotte-ds/r/<버전>/<파일>`).

   | 파일 | 저장 위치 | 내용 |
   |---|---|---|
   | `lotte-tokens.css` | `lotte-ds/` | 색·간격·글자·모서리·그림자·기기 크기 변수와 글자 클래스 |
   | `lotte-ds.css` | `lotte-ds/` | 부품 CSS 합본 |
   | `lotte-ds.js` | `lotte-ds/` | 부품 동작 합본(목록 열기·달력·탭 이동 등) |
   | `lotte.md` | `docs/` | 화면 규칙과 부품별 쓰는 법 |

2. 화면 HTML에 연결해요. **Kendo CSS 다음, 화면 CSS보다 먼저** 불러와야 해요. 순서가 바뀌면 Kendo 원래 모양이 이겨요.

   ```html
   <html lang="ko" data-theme="light" data-device="pc">
   <head>
     <!-- Kendo CSS 다음에 -->
     <link rel="stylesheet" href="lotte-ds/lotte-tokens.css">
     <link rel="stylesheet" href="lotte-ds/lotte-ds.css">
     <!-- 화면 CSS는 여기부터 -->
     <script src="lotte-ds/lotte-ds.js" defer></script>
   </head>
   ```

3. 모드는 `<html>` 속성으로 바꿔요. 다크는 `data-theme="dark"`, 태블릿은 `data-device="tablet"`이에요. 속성이 없으면 라이트·PC예요.

### 설치할 때 주의

- `lotte-tokens.css`가 빠지면 색이 나오지 않아요. 두 CSS를 같이 불러와요.
- 이미 운영 중인 화면에 넣으면 Kendo 버튼·입력칸 모양이 한꺼번에 바뀌어요. 어느 화면에 먼저 붙일지 정하고 넣어요.
- 글꼴은 Pretendard예요. 컴퓨터에 없으면 기본 고딕으로 보여요. 글꼴 파일은 프로젝트에서 준비해요.

## 쓰는 규칙

자세한 규칙은 [docs/lotte.md](docs/lotte.md)에 있어요. 핵심만 적으면 이래요.

- 부품 표에 있는 부품만 조립해요. 클래스 이름은 Kendo 이름(`.k-button`, `.k-textbox` …)을 그대로 써요.
- 롯데 DS에 없는 UI는 화면에서 새로 만들지 않아요. `디자인 필요: <UI 이름>` 빈 자리를 빨간 점선으로 두고 디자이너에게 요청해요.
- 색·간격·글자는 변수(`var(--kendo-…)`)와 글자 클래스(`text-…`)만 써요. hex·px 값을 직접 쓰지 않아요.
- 주 동작 버튼(`k-button-solid-primary`)은 화면 영역마다 하나만 써요.
- `lotte-ds/` 폴더의 파일은 고치지 않아요.

## 들어 있는 부품

| 묶음 | 부품 |
|---|---|
| 버튼 | Button · Toggle · ButtonGroup · Toolbar |
| 입력 | Input · TextArea · Numeric · Numeric Stepper · Label · Calendar · DatePicker |
| 선택 | CheckBox · RadioButton · Switch · DropDownList |
| 표시 | Badge · Chip · Separator · Tooltip · Loader · Skeleton · Toast · Inline · Card · Avatar · ProgressBar · ExpansionPanel · Kbd |
| 표 | Grid |
| 이동 | Tabs · Pager |
| 팝업 | Dialog |
| 폼 | Form |
| 탐색 | Drawer · Breadcrumb · Menu · TreeView · Stepper · PageTab |
| 패턴 | AppBar · PageHeading · Toolbar / Filter · Toolbar / Form Action · Form Table · Dialog Content · Menu Tile · SectionCards |

## 버전

설치 주소에 버전이 들어 있어서, 롯데 DS가 바뀌어도 이미 설치한 프로젝트는 자동으로 바뀌지 않아요. 버전을 올리기 전에 [업데이트 현황](https://xowns956-boop.github.io/lotte-ds/changelog/)을 확인하고, 최신 버전 카드의 업데이트 프롬프트를 AI에 붙여 넣어요.

## 폴더 구조

```
components/   부품 하나당 폴더 하나 (.html 예시 · .css · 동작이 있는 부품만 .js)
docs/         화면 규칙 lotte.md
install/      AI로 설치하기 페이지
changelog/    업데이트 현황 페이지와 기록(changelog.json)
preview/      부품 미리보기 화면용 파일
scripts/      설치 파일을 만드는 스크립트
```

설치 파일(`r/<버전>/`)과 `llms.txt`는 스크립트로 만들어요.

```bash
npm run build   # 부품 CSS·JS 합본 → r/<버전>/
npm run llms    # llms.txt · llms-full.txt (공개 주소로 만들 때 LOTTE_BASE=https://<주소>)
```

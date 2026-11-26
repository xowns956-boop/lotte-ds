# Lotte Kendo DS 0.1.2

이 프로젝트의 디자인 시스템이다. 사용자가 "롯데 DS 써", "Lotte DS 써", "디자인 시스템 써"라고 하면 이 규칙을 따른다.

- 대상: Kendo UI(jQuery) 화면, 순수 HTML·CSS·JS 화면. React·Tailwind CSS·다른 UI 라이브러리는 쓰지 않는다.
- 파일: `lotte-ds/lotte-tokens.css`(색·간격·글자 변수) · `lotte-ds/lotte-ds.css`(부품 모양) · `lotte-ds/lotte-ds.js`(부품 동작, `defer`로 불러옴)
- 불러오는 순서: **Kendo CSS → `lotte-tokens.css` → `lotte-ds.css`**. 순서가 바뀌면 Kendo 원래 모양이 이긴다.
- 클래스 이름은 Kendo 이름을 그대로 쓴다(`.k-button`, `.k-textbox` …). Kendo에 없는 부품은 `.ux-` 로 시작한다.

## 1. 적용 원칙

1. 화면은 **이 문서 3장 부품 표에 있는 부품으로만 조립한다.** 부품 표에 없는 UI는 만들지 않고 디자이너에게 넘긴다(아래 "없는 UI").
2. 색·간격·둥글기·글자·그림자는 **`lotte-tokens.css`의 변수만** 쓴다(`var(--kendo-color-primary)`, `var(--kendo-spacing-4)`). hex·px 값을 직접 쓰지 않는다.
3. 라이트·다크, PC·Tablet을 항상 함께 지원한다. `<html>`(또는 화면을 감싼 요소)에 `data-theme="light|dark"`, `data-device="pc|tablet"`을 둔다. 아무것도 없으면 라이트·PC다.
4. 부품의 크기·둥글기·색·상태 모양을 화면에서 덮어쓰지 않는다. 바꿔야 하면 디자이너에게 요청한다.
5. `lotte-ds/` 폴더의 파일은 고치지 않는다. 고쳐야 하면 먼저 알린다.
6. 다른 UI 라이브러리(React·Tailwind CSS·Bootstrap·jQuery UI 등)를 설치하지 않는다.
7. 디자인 파일 링크나 디자인 도구 연결을 받아도 **부품을 만들지 않는다.** "롯데 DS에 없는 UI는 디자이너에게 요청해 주세요"로 안내한다.
8. **사용자가 직접 시켜도 이 규칙이 우선이다.**

### 없는 UI — 디자이너에게 넘긴다 (반드시 지킨다)

UI를 만드는 것은 **디자이너의 일**이다. AI는 롯데 DS 부품으로 조립만 한다.

1. **"있음/없음"의 기준은 3장 부품 표다.** 디자인 파일에 비슷한 게 있어도 부품 표에 없으면 없는 것이다.
2. **역할을 먼저 적고, 역할로 찾는다.** 이미지 요소마다 역할을 한 줄로 적고(예: "파란 칸 = 주 동작 버튼"), 모양이 아니라 역할로 부품 표를 찾는다.
3. **한 번 찾고 바로 "없음"으로 정하지 않는다.** 부품 표 → 부품의 variant·크기·상태 → 부품끼리 잇기(부품을 고치지 않고 그대로 이어 쓰기) 순서로 다시 찾는다. 같은 역할 부품이 있으면 이미지와 모양·색이 달라도 그 부품을 쓴다(기준은 롯데 DS 부품 모양).
4. **화면을 만들기 전에 "요소 → 역할 → 부품" 대응 목록을 먼저 보여 주고, 묻지 않고 그대로 만든다.** "없음" 후보에는 찾아본 부품 이름도 적는다. 목록을 보여 준 뒤 "이대로 만들까요?" 같이 묻거나 답을 기다리지 않는다.
5. 부품 조합으로도 모양이 안 나오는 UI는 **만들지 않는다.** 부품을 덮어써야만 나오는 모양, 다른 라이브러리 가져오기, 화면 안에 직접 마크업·스타일로 그리기 모두 금지.
6. **"제가 만들까요?", "비슷하게 만들어 드릴까요?" 같은 제안·질문을 하지 않는다.** 선택지로도 내놓지 않는다.
7. 없는 UI를 **빠짐없이 목록으로 알린다.** 형식은 아래 그대로:

   ```
   롯데 DS에 없는 UI
   - <UI 이름>: <왜 없는지 한 줄>
   → 디자이너에게 요청해 주세요. 디자이너가 롯데 DS에 추가하면 업데이트로 받아 쓸 수 있어요.
   ```

8. 없는 UI 자리는 모양을 지어내지 않고 **`디자인 필요: <UI 이름>` 글자만 있는 빈 자리**로 화면에 반드시 표시한다. 빨간 점선으로 둔다:

   ```html
   <div class="ux-design-needed text-sm-semibold" role="note">디자인 필요: 진행 단계 표시</div>
   ```
   ```css
   /* 화면 CSS에 한 번만 둔다 */
   .ux-design-needed {
     display: flex; align-items: center; justify-content: center;
     min-height: var(--kendo-device-control-height);
     padding: var(--kendo-spacing-3);
     border: var(--kendo-spacing-0-5) dashed var(--kendo-color-error);
     border-radius: var(--kendo-border-radius-xl);
     color: var(--kendo-color-error-on-surface);
   }
   ```

9. 부품은 있지만 필요한 옵션·상태·크기가 없을 때도 같다. 그 부품을 그대로 쓰고, 없는 옵션 자리만 빨간 점선으로 둔다. 작은 옵션(배지 속 아이콘, 알림 점 등)도 빼지 않는다.
10. 누르는 요소(버튼)는 누른 뒤 화면까지 롯데 DS 부품으로 만든다. 누른 뒤 보여 줄 UI가 없으면 그 자리를 빨간 점선으로 두고 7번 목록에 넣는다. "~창을 엽니다" 같은 자리채움 알림은 쓰지 않는다.

### 새 UI가 필요할 때

- 새 UI·옵션은 **디자이너가 디자인해서 롯데 DS에 추가**한다. 프로젝트는 그 버전을 설치해 쓴다.
- 프로젝트 안에서 새 UI를 직접 만들거나, 받은 이미지·링크를 보고 부품을 만들지 않는다.

## 2. 토큰 (`lotte-tokens.css`)

### 모드

| 속성 | 값 | 바뀌는 것 |
|---|---|---|
| `data-theme` | `light`(기본) · `dark` | 색 |
| `data-device` | `pc`(기본) · `tablet` | 높이·글자 크기·아이콘 크기 |
| `data-icon` | `control`(기본) · `title` · `tile` | 아이콘 크기 (제목 옆 아이콘 = title, 태블릿 메뉴 타일 = tile) |

### 자주 쓰는 색

| 쓰임 | 변수 |
|---|---|
| 화면 바탕 | `--ux4-color-page-bg` |
| 면(카드·패널) | `--kendo-color-surface` |
| 기본 글자 | `--kendo-color-on-app-surface` |
| 보조 글자 | `--kendo-color-subtle` |
| 선 | `--kendo-color-border` |
| 주요 색 | `--kendo-color-primary` · 위 글자 `--kendo-color-on-primary` |
| 보조 색(롯데 Gray) | `--kendo-color-secondary` · 위 글자 `--kendo-color-on-secondary` |
| 오류 | `--kendo-color-error` · 오류 글자 `--kendo-color-error-on-surface` |
| 성공·주의·안내 | `--kendo-color-success` · `--kendo-color-warning` · `--kendo-color-info` (각각 `-subtle`, `-on-subtle`) |
| 대기·진행 | `--kendo-color-pending` · `--kendo-color-progress` |
| 비활성 | `--kendo-color-disabled` · 글자 `--kendo-color-on-disabled` |

전체 목록은 `lotte-tokens.css`에 있다. 없는 색을 hex로 만들지 않는다.

### 간격·둥글기·그림자

- 간격: `--kendo-spacing-*` (`-1` 4 · `-2` 8 · `-3` 12 · `-4` 16 · `-6` 24 · `-8` 32 …). 소수 단계는 `-0-5` 2 · `-1-5` 6 · `-2-5` 10처럼 쓴다.
- 둥글기: `--kendo-border-radius-md` 4 · `-lg` 6 · `-xl` 8 · `-xxl` 12 · `-full`. 입력칸은 `--ux4-border-radius-control` 10.
- 그림자: `--kendo-elevation-1` · `-2` · `-4` · `-7`.

### 글자 클래스

글자는 클래스로 쓴다. 크기만 따로 쓰지 않는다.

| 클래스 | 쓰임 | PC → Tablet |
|---|---|---|
| `text-title-semibold` | 화면 제목, 큰 버튼, 메뉴 타일 | 20 → 24 |
| `text-value-lg-semibold` | 품목 정보 같은 핵심 값 | 16 → 18 |
| `text-value-semibold` | 목록(구역) 제목 | 14 → 16 |
| `text-value-regular` · `-medium` | 정보 값 | 14 → 16 |
| `text-control-medium` | 버튼·탭·라벨 | 14 → 16 |
| `text-control-regular` | 선택칸·날짜 칸·목록 항목 | 14 → 16 |
| `text-input-regular` | 입력칸 | 12 → 16 |
| `text-data-regular` · `-medium` | 표 데이터 · 표 머리글, 건수 | 14 → 14 |
| `text-caption-medium` | 배지·칩 | 12 → 14 |
| `text-stat-semibold` | 지표 값 | 30 → 36 |

- **표 데이터 글자는 버튼 글자보다 크게 쓰지 않는다.** (`text-data-*` ≤ `text-control-*`)
- 모드와 상관없는 고정 크기가 필요할 때만 `text-xs-*` ~ `text-4xl-*`를 쓴다.

## 3. 부품

이 버전에 들어 있는 부품은 아래가 전부다(Button · Input · TextArea · Numeric · Numeric Stepper · CheckBox · RadioButton · Switch · Label · Badge · Chip · Separator · DropDownList · Tooltip · Loader · Skeleton · Grid · Tabs · Pager · Dialog · Toast · Inline · Form · Card · Card / Stat · Avatar · Drawer · Breadcrumb · Calendar · DatePicker · Toggle · ButtonGroup · Menu · TreeView · Stepper · ProgressBar · ExpansionPanel · Splitter · Toolbar · Kbd · PageTab · AppBar · PageHeading · Toolbar / Filter · Toolbar / Form Action · Form Table · Dialog Content 6종 · Menu Tile · SectionCards). 여기 없는 부품(머리줄 등)은 아직 없다 → 1장 "없는 UI".

### Button

```html
<button type="button" class="k-button k-button-md k-button-solid-primary">
  <span class="k-button-text">저장</span>
</button>
```

| 항목 | 클래스 |
|---|---|
| variant | `k-button-solid-primary`(주 동작) · `k-button-solid-error`(삭제 등 위험) · `k-button-outline-base`(보조, 클래스 없는 `.k-button`도 이 모양) · `k-button-solid-secondary`(현재 탭·작업 입력 타일) · `k-button-flat-base`(배경 없는 버튼) · `k-button-link-primary`(글자 링크) |
| 크기 | `k-button-sm` · `k-button-md` · `k-button-lg` · `k-icon-button`(정사각 아이콘 버튼) |
| 아이콘 | `<svg class="k-svg-icon" aria-hidden="true">`를 글자 앞(왼쪽) 또는 뒤(오른쪽)에. 아이콘은 lucide |
| 상태 | 비활성은 `disabled` 속성. hover·focus·pressed는 자동 |

- **주 동작 버튼(`k-button-solid-primary`)은 화면 영역마다 하나.** 나머지는 outline·secondary·flat.
- 아이콘만 있는 버튼은 `aria-label`을 반드시 붙인다.
- Kendo 2021.3의 옛 이름 `.k-primary`(= solid-primary), `.k-flat`(= flat-base)도 같은 모양이다. 새 화면에는 새 이름을 쓴다.

### Input

```html
<label for="lot-no" class="text-control-medium">LOT NO</label>
<input id="lot-no" type="text" class="k-textbox k-input k-input-md" placeholder="LOT NO 입력">
```

| 항목 | 방법 |
|---|---|
| 오류 | `aria-invalid="true"` |
| 비활성 | `disabled` 속성 |
| 최신 Kendo 구조 | `<span class="k-textbox k-input k-input-md"><input class="k-input-inner"></span>`도 같은 모양 |
| 앞 아이콘 · 뒤 Kbd (InputGroup) | 최신 구조 안에 `<span class="k-input-prefix">아이콘 16</span>` · `<span class="k-input-suffix"><kbd class="ux-kbd-group">…</kbd></span>` |

```html
<span class="k-textbox">
  <span class="k-input-prefix"><svg class="k-svg-icon" …>search</svg></span>
  <input class="k-input-inner" type="search" placeholder="검색" aria-label="검색">
  <span class="k-input-suffix"><kbd class="ux-kbd-group"><kbd class="ux-kbd">⌘</kbd><kbd class="ux-kbd">K</kbd></kbd></span>
</span>
```

- 입력칸은 항상 라벨과 연결한다(`for` ↔ `id`). 라벨이 안 보이는 자리에는 `aria-label`.
- 폭은 부품이 정하지 않는다. 놓이는 자리(폼·표·필터)에서 정한다.
- 오류 문구를 칸 아래에 붙이는 부품(Form Item)은 아직 없다 → "디자인 필요".

### TextArea

```html
<label for="remark" class="text-control-medium">특이사항</label>
<textarea id="remark" class="k-textarea" placeholder="내용을 입력하세요"></textarea>
```

| 항목 | 방법 |
|---|---|
| 오류 | `aria-invalid="true"` |
| 비활성 | `disabled` 속성 |
| 최신 Kendo 구조 | `<span class="k-textarea k-input"><textarea class="k-input-inner"></textarea></span>`도 같은 모양 |

- 여러 줄 입력(특이사항·비고·사유)에 쓴다. 한 줄이면 Input.
- 기본 높이 64. 글자가 길면 줄바꿈되고 넘치면 칸 안에서 스크롤된다. 더 높게 쓸 때만 놓이는 자리에서 `height`를 정한다(변수로).
- 쓰는 사람이 오른쪽 아래 손잡이로 **세로만** 늘릴 수 있다. 가로 폭은 놓이는 자리를 따른다. `resize`를 화면에서 바꾸지 않는다.
- 라벨 연결·폭 규칙은 Input과 같다.
- 서식 있는 글 편집기(굵게·목록·표 등 도구줄)는 없다. 결재 요청 내용처럼 긴 글도 TextArea로 받는다.

### Numeric (PC 숫자 입력)

```html
<label for="qty" class="text-control-medium">수량</label>
<span class="k-numerictextbox k-input k-input-md">
  <input id="qty" type="text" class="k-input-inner" inputmode="decimal" placeholder="0" data-increment="1" data-min="0">
  <span class="k-input-spinner">
    <button type="button" class="k-spinner-increase" tabindex="-1" aria-label="값 올리기"><svg class="k-svg-icon" …chevron-up…></svg></button>
    <button type="button" class="k-spinner-decrease" tabindex="-1" aria-label="값 내리기"><svg class="k-svg-icon" …chevron-down…></svg></button>
  </span>
</span>
```

| 항목 | 방법 |
|---|---|
| 단계·최소·최대 | 안쪽 input의 `data-increment` · `data-min` · `data-max` (없으면 1 · 제한 없음) |
| 오류 · 비활성 | 안쪽 input에 `aria-invalid="true"` · `disabled` |

- 상자 모양·상태는 Input과 같다. 글자는 `text-control-regular` 크기.
- 증감 칸은 작아서 손가락으로 누르기 어렵다. **태블릿 화면에서는 Numeric Stepper를 쓴다.**
- 증감 동작은 `lotte-ds.js`가 한다. 화면 스크립트로 다시 만들지 않는다.

### Numeric Stepper (태블릿 숫자 입력, `.ux-numeric-stepper`)

```html
<div class="ux-numeric-stepper" role="group" aria-label="검사값">
  <button type="button" class="k-button k-icon-button k-button-outline-base" data-step="down" aria-label="값 내리기"><svg …minus…></svg></button>
  <input type="text" class="k-textbox k-input k-input-md" inputmode="decimal" value="35.4" data-increment="0.1" aria-label="검사값">
  <button type="button" class="k-button k-icon-button k-button-outline-base" data-step="up" aria-label="값 올리기"><svg …plus…></svg></button>
</div>
```

- 빼기 버튼 · 값 · 더하기 버튼. 값 칸은 남은 폭을 채우고 값 글자는 크게(`text-value-lg-semibold` 크기) 가운데.
- 단계·최소·최대는 Numeric과 같다(`data-increment` · `data-min` · `data-max`).
- 묶음에 `role="group"`과 무엇의 값인지 `aria-label`을 붙인다.

### CheckBox · RadioButton

```html
<input type="checkbox" class="k-checkbox k-checkbox-md" id="save-id">
<label class="k-checkbox-label" for="save-id">아이디 저장</label>

<fieldset>
  <legend class="k-label">근무조</legend>
  <input type="radio" class="k-radio k-radio-md" name="shift" id="shift-day" checked>
  <label class="k-radio-label" for="shift-day">주간</label>
  <input type="radio" class="k-radio k-radio-md" name="shift" id="shift-night">
  <label class="k-radio-label" for="shift-night">야간</label>
</fieldset>
```

- 크기는 기기 모드를 따른다(PC 16 · Tablet 24). 옆 글자는 `k-checkbox-label` · `k-radio-label`(Label 모양, 상자와 간격 8)을 input **바로 뒤**에 둔다.
- 오류 `aria-invalid="true"`, 비활성 `disabled`. 라디오는 같은 `name`으로 묶고 묶음에 `fieldset` + `legend`(또는 `role="radiogroup"` + `aria-label`).
- 체크박스의 "일부 선택"(indeterminate) 모양은 없다 → 필요하면 "디자인 필요".

### Switch

```html
<button type="button" class="k-switch k-switch-md k-switch-off" role="switch" aria-checked="false" aria-label="알림 받기">
  <span class="k-switch-track"></span>
  <span class="k-switch-thumb-wrap"><span class="k-switch-thumb"></span></span>
</button>
```

- 켜짐 = `aria-checked="true"` + `k-switch-on`. 누르면 `lotte-ds.js`가 바꾼다. 비활성 `disabled`.
- 무엇을 켜는지 `aria-label`(또는 옆 글자 + `aria-labelledby`). ON/OFF 글자는 넣지 않는다.

### Label

```html
<label class="k-label" for="lot-no">LOT NO</label>
<label class="k-label" for="qty"><span class="k-required" aria-hidden="true"></span>수량</label>
```

- 입력칸 이름은 이 부품으로 쓴다(글자 `text-control-medium` 크기). 입력칸과 `for` ↔ `id`로 잇는다.
- 필수 항목은 라벨 앞 빨간 점(`k-required`) + 입력칸에 `required`. 비활성 라벨은 `k-state-disabled`.

### Badge

```html
<span class="k-badge k-badge-md k-badge-solid-primary">진행</span>
```

| variant | 클래스 |
|---|---|
| default | `k-badge-solid-primary` |
| secondary | `k-badge-solid-secondary` |
| destructive | `k-badge-solid-error` |
| outline | `k-badge-outline-base` |
| info | `k-badge-solid-info` |
| success | `k-badge-solid-success` |
| warning | `k-badge-solid-warning` |
| destructive-subtle | `k-badge-solid-error ux-badge-subtle` |

- 상태·종류를 짧게 표시한다(누르는 용도가 아니다). 아이콘은 글자 앞에 12 크기, `aria-hidden`.
- info·success·warning·destructive-subtle은 연한 바탕 + 진한 글자다(상태 표시). Kendo 기본처럼 진한 초록·노랑 바탕이 아니다.

#### 배지 variant 고르기

배지 색은 **뜻**으로 고른다.

| variant | 쓰는 때 | 예 |
|---|---|---|
| default | 상태가 없는 기본 이름표, 화면 주 색과 같은 계열 | 구분·분류 이름표, 진행 |
| secondary | default보다 약한 보조 이름표 | 부가 정보·개수 |
| outline | 디자인에 테두리 배지가 정해져 있을 때만 | — |
| info | 안내·진행 중·현재 상태(좋고 나쁨 판정 없음) | 진행 중, 검사중 |
| success | 긍정 결과 | 적합, 합격, 승인, 완료 |
| warning | 확인·검토가 필요하지만 아직 실패는 아닌 것 | 한계, 주의, 기준 근접 |
| destructive-subtle | 실패·오류·불량. **실패 표시는 기본이 이것** | 부적합, 불량, 오류 |
| destructive | destructive-subtle과 뜻이 같고 진한 바탕. 즉시 조치가 필요한 것 하나만 도드라지게 할 때만, 표·목록에 반복되는 배지에는 쓰지 않는다 | 긴급 정지 |

- **강도:** 진한 바탕(default·destructive)은 강조, 연한 바탕(상태 4개)은 표시다. 표·목록처럼 같은 배지가 여러 번 나오면 연한 바탕을 쓴다.
- **판정 3단계(적합·한계·부적합):** 적합 = success, 한계 = warning, 부적합 = destructive-subtle.
- **한 화면 안에서 같은 뜻 = 같은 variant.** 같은 상태에 다른 색을 섞지 않는다.
- **색만으로 구분하지 않는다:** 배지에는 항상 상태 글자를 쓴다.
- 설비 상태(가동·정지·대기 등) 전용 배지 모양은 아직 없다 → "디자인 필요".

### Chip (적용된 조회 조건)

```html
<span class="k-chip k-chip-md">
  <span class="k-chip-content"><span class="k-chip-label">품목 · 냉동면</span></span>
  <span class="k-chip-actions">
    <button type="button" class="k-chip-action k-chip-remove-action" aria-label="품목 조건 해제"><svg class="k-svg-icon" …x…></svg></button>
  </span>
</span>
```

- 문구는 "조건명 · 값". X 버튼의 `aria-label`에 무엇을 지우는지 쓴다.
- X를 눌렀을 때 조건을 지우고 칩을 없애는 일은 화면 스크립트가 한다. 칩을 고르는 용도(선택 칩)로 쓰지 않는다.

### Separator

```html
<hr class="k-separator k-separator-horizontal">
<span class="k-separator k-separator-vertical" role="separator" aria-orientation="vertical"></span>
```

- 가로는 부모 폭, 세로는 가로로 나란한(flex) 줄의 높이를 채운다. 두께 1, 색 `--kendo-color-border`.

### DropDownList (목록에서 하나 고르기)

```html
<label class="k-label" id="line-label">라인</label>
<div class="k-dropdownlist k-picker k-picker-md">
  <button type="button" class="k-input-inner" role="combobox" aria-haspopup="listbox" aria-expanded="false" aria-controls="line-list" aria-labelledby="line-label line-value">
    <span class="k-input-value-text" id="line-value" data-placeholder>선택하세요</span>
    <span class="k-input-button" aria-hidden="true"><svg class="k-svg-icon" …chevron-down…></svg></span>
  </button>
  <div class="k-popup k-list-container" hidden>
    <ul class="k-list-ul" role="listbox" id="line-list" aria-labelledby="line-label">
      <li class="k-list-item" role="option" aria-selected="false" data-value="A1"><span class="k-list-item-text">조립 1라인</span></li>
    </ul>
  </div>
  <input type="hidden" name="line">
</div>
```

| 항목 | 방법 |
|---|---|
| 크기 | `k-picker-md`(기본) · `k-picker-sm` |
| 고른 값 | 줄에 `aria-selected="true"`, 값 글자에서 `data-placeholder` 빼기(동작이 자동으로 함) |
| 비활성 줄 | `aria-disabled="true"` |
| 오류 · 비활성 칸 | button에 `aria-invalid="true"` · `disabled` |
| 고른 뒤 | 상자에서 `change` 이벤트(`detail.value`, `detail.text`), 숨은 input 값도 바뀜 |

- 열기·고르기·키보드(↓ ↑ Home End Enter Space Esc Tab)는 `lotte-ds.js`가 한다. 화면 스크립트로 다시 만들지 않는다.
- 글자를 쳐서 찾는 선택칸(ComboBox·AutoComplete)과 여러 개 고르기(MultiSelect)는 아직 없다 → "디자인 필요".
- 목록이 길면 화면에 남은 높이까지만 늘어나고, 넘치는 줄은 목록 안에서 세로로 넘긴다(열 때 `lotte-ds.js`가 잰다). 아래 자리가 모자라고 위가 더 넓으면 위로 열린다. SmartUX의 Kendo 위젯 목록 높이는 Kendo `height` 설정을 따른다.

### Tooltip (도움말 말풍선)

```html
<button type="button" class="k-button k-icon-button k-button-outline-base" aria-label="새로고침" data-tooltip="새로고침" data-tooltip-side="bottom">…</button>
```

- 대상에 `data-tooltip="문구"`, 방향은 `data-tooltip-side`(top 기본 · right · bottom · left).
- 말풍선에 꼬리(삼각형)는 없다. 대상과 4 떨어져서 뜬다.
- 마우스 올림·키보드 포커스 때 보이고 벗어나거나 Esc면 사라진다. **터치 화면(태블릿)에서는 보이지 않으니** 꼭 필요한 정보를 도움말에만 두지 않는다.
- 아이콘 버튼은 도움말과 별개로 `aria-label`을 꼭 붙인다.

### Loader · Skeleton (불러오는 중)

```html
<span class="k-loader" role="status" aria-label="불러오는 중"><svg class="k-svg-icon" …loader-circle…></svg></span>

<div aria-busy="true">
  <span class="k-skeleton k-skeleton-rect" aria-hidden="true"></span>
</div>
```

- Loader: 16 크기, 색은 둘레 글자색. 버튼 안에도 넣을 수 있다.
- Skeleton: 내용이 들어갈 자리에 둔다. 폭·높이는 그 내용 크기에 맞춰 놓이는 자리에서 정한다(변수로). 불러오는 영역에 `aria-busy="true"`.
- 둘 다 움직임 줄이기 설정을 켠 사람에게는 멈춘다.

### Grid (표)

```html
<div class="k-grid">
  <table class="k-grid-table">
    <thead class="k-grid-header">
      <tr>
        <th class="k-header k-checkbox-column" scope="col"><input type="checkbox" class="k-checkbox" aria-label="전체 선택"></th>
        <th class="k-header" scope="col"><span class="k-required" aria-hidden="true"></span>품목코드</th>
        <th class="k-header" scope="col" aria-sort="none"><button type="button" class="k-link">품명<svg class="k-svg-icon" …arrow-up-down…></svg></button></th>
        <th class="k-header k-text-right" scope="col">수량</th>
        <th class="k-header k-command-cell" scope="col"><span class="k-sr-only">메뉴</span></th>
      </tr>
    </thead>
    <tbody>
      <tr class="k-master-row" aria-selected="false">
        <td class="k-checkbox-column"><input type="checkbox" class="k-checkbox" aria-label="100001 선택"></td>
        <td>100001</td><td>냉동면 4호</td><td class="k-text-right">1,250</td>
        <td class="k-command-cell"><button type="button" class="k-button k-icon-button k-button-flat-base k-button-sm" aria-label="100001 메뉴">…ellipsis…</button></td>
      </tr>
    </tbody>
  </table>
</div>
```

| 칸 | 방법 |
|---|---|
| 흐린 글자(보조 정보) | `td.k-color-subtle` |
| 숫자 | `k-text-right` (머리칸도 같이) |
| 줄 고르기 체크박스 열 | `k-checkbox-column` (폭 40) |
| 예/아니오 체크 열 | `k-text-center` + 체크박스 |
| 줄 메뉴 | `k-command-cell` + Button(flat · icon · sm) |
| 숫자 입력 칸 | `td.k-text-right` 안에 `<input class="k-textbox" inputmode="numeric">` (머리칸도 `k-text-right`). 증감 버튼 없음. 꺼짐 = `disabled`, 오류 = `aria-invalid="true"` |
| 글자 입력 칸 | `td` 안에 `<input type="text" class="k-textbox">` (글자는 왼쪽). 꺼짐·오류는 숫자 입력 칸과 같음 |
| 목록 고르기 칸 | `td` 안에 DropDownList(`k-dropdownlist k-picker k-picker-sm`, DropDownList 절 구조 그대로). 꺼짐 = button `disabled`, 오류 = button `aria-invalid="true"`. 목록은 표 밖으로 나오게 화면 기준으로 뜨고, 화면이 스크롤되면 닫힌다 |
| 필수 열 | 머리칸 이름 앞 `k-required` |
| 정렬 열 | 머리칸 안 `button.k-link` + `aria-sort` (정렬하는 일은 화면 스크립트) |
| 2단 머리글 | 묶음 칸에 `colspan` + `scope="colgroup"` |
| 고른 줄 | `tr`에 `aria-selected="true"` |
| 빈 표 | `tr.k-grid-norecords > td colspan` "표시할 데이터가 없습니다" |
| 다른 화면으로 가는 칸 | `td` 안 `button.k-button.k-button-link-primary`(글자 링크). 누르면 화면 스크립트가 그 화면을 PageTab에 추가해 연다(같은 탭 이동 · 브라우저 새 탭 아님) |
| 파일 다운로드 칸 | `td` 안 Button(flat · icon · sm) + `aria-label`. 누르면 브라우저 기본 다운로드, 진행 표시는 두지 않는다 |

- 줄 높이·머리줄 높이는 기기 모드를 따른다(PC 37 · 40 / Tablet 57 · 48). 표 글자는 PC·Tablet 모두 14 — 버튼 글자보다 크게 하지 않는다.
- 칸 글자는 한 줄로 두고 넘치면 말줄임(…)된다.
- 표 위 툴바와 아래 줄은 부품이 아니라 조립한다: **툴바** = 위아래 16 여백, 왼쪽 검색 Input · 오른쪽 Button(양끝 정렬). **아래 줄** = 위아래 16 여백, 왼쪽 "N건 중 N건 선택"(`text-sm-regular`, 흐린 글자) · 오른쪽 이전/다음 Button(outline · sm), 간격 8.
- 한 페이지 10줄이 기본이다. 페이지 번호로 넘기려면 아래 줄 오른쪽에 Pager를 둔다. 칸 안에서 고칠 수 있는 건 숫자 입력 · 글자 입력 · 목록 고르기 칸이다(입력칸 높이 PC 32 · Tablet 40, 줄 높이는 그대로 37 · 57. 기본 테두리는 표 안에서 조금 옅고, 포커스 · 오류 · 꺼짐은 Input · DropDownList와 같음). 값 채우기·저장 검사는 화면 스크립트가 한다. 열 메뉴(⋮)·날짜 고르기 칸·줄 묶기는 아직 없다 → "디자인 필요".

### Tabs

```html
<div class="k-tabstrip k-tabstrip-top">
  <div class="k-tabstrip-items-wrapper">
    <ul class="k-tabstrip-items" role="tablist" aria-label="품목 상세">
      <li class="k-item k-state-active" role="presentation">
        <button type="button" class="k-link" role="tab" id="tab-info" aria-selected="true" aria-controls="panel-info">기본 정보</button>
      </li>
      <li class="k-item" role="presentation">
        <button type="button" class="k-link" role="tab" id="tab-history" aria-selected="false" aria-controls="panel-history" tabindex="-1">점검 이력</button>
      </li>
    </ul>
  </div>
  <div class="k-content k-tabstrip-content k-state-active" role="tabpanel" id="panel-info" aria-labelledby="tab-info" tabindex="0">…</div>
  <div class="k-content k-tabstrip-content" role="tabpanel" id="panel-history" aria-labelledby="tab-history" tabindex="0" hidden>…</div>
</div>
```

| 모양 | 클래스 | 쓰는 곳 |
|---|---|---|
| 밑줄형(기본) | `k-tabstrip` | 화면 안 구역을 바꾸는 탭 (PC 36 · Tablet 48) |
| 알약형 | `k-tabstrip ux-tabstrip-pill` | 작은 보기 전환 (PC 28 · Tablet 40) |

- 고르기·키보드(← → Home End)는 `lotte-ds.js`가 한다. 고르면 `.k-tabstrip`에서 `change` 이벤트(`detail.tab`).
- 비활성 탭은 `li.k-state-disabled` + button `disabled`. 탭 줄과 내용 사이는 8.
- 탭 안 아이콘·숫자 배지, 탭이 넘칠 때 좌우 넘기기는 아직 없다 → "디자인 필요".

### Pager (페이지 넘기기)

```html
<nav class="k-pager" aria-label="페이지">
  <a class="k-link k-pager-nav k-pager-first" aria-disabled="true" aria-label="첫 페이지" data-tooltip="첫 페이지로 이동"><svg class="k-svg-icon" …chevrons-left…></svg></a>
  <a class="k-link k-pager-nav" aria-disabled="true"><svg class="k-svg-icon" …chevron-left…></svg>이전</a>
  <ul class="k-pager-numbers">
    <li><a class="k-link" href="?page=1" aria-current="page">1</a></li>
    <li><a class="k-link" href="?page=2">2</a></li>
    <li><span class="ux-pager-ellipsis" aria-hidden="true"><svg class="k-svg-icon" …ellipsis…></svg></span></li>
    <li><a class="k-link" href="?page=10">10</a></li>
  </ul>
  <a class="k-link k-pager-nav" href="?page=2">다음<svg class="k-svg-icon" …chevron-right…></svg></a>
  <a class="k-link k-pager-nav k-pager-last" href="?page=10" aria-label="마지막 페이지" data-tooltip="마지막 페이지로 이동"><svg class="k-svg-icon" …chevrons-right…></svg></a>
</nav>
```

- 페이지 이동이라 링크(`a`)로 만든다. 현재 페이지는 `aria-current="page"`, 못 가는 이전·다음은 `href` 없이 `aria-disabled="true"`(흐리게 보임).
- 간격: 버튼끼리·번호끼리는 4, 번호 묶음과 앞뒤 버튼 묶음(처음·이전 / 다음·마지막) 사이만 16. 간격은 부품이 정하니 화면에서 덮어쓰지 않는다.
- 이전·다음은 글자 있는 버튼(`.k-pager-nav`)과 아이콘만 있는 버튼(`.k-pager-nav.k-pager-prev` · `.k-pager-nav.k-pager-next`, < >) 중 **하나만** 쓴다. 아이콘 버튼은 `aria-label`과 말풍선 `data-tooltip`("이전 페이지" · "다음 페이지")을 꼭 단다. 못 누를 때(첫·끝 페이지)는 `href` 없이 `aria-disabled="true"` → 흰 바탕(흐려지지 않음). 글자 있는 이전·다음은 못 누를 때 흐려진다.
- 처음·마지막 버튼(`.k-pager-first` · `.k-pager-last`)은 페이지가 많을 때만 넣는다. 이전 앞 · 다음 뒤에 두고, 아이콘만 있으니 `aria-label`과 말풍선 `data-tooltip`("첫 페이지로 이동" · "마지막 페이지로 이동")을 꼭 단다. 이미 첫·끝 페이지면 `href` 없이 `aria-disabled="true"` → 현재 페이지 번호와 같은 흰 바탕으로 보인다(흐려지지 않음).
- 번호가 많으면 처음 몇 개 · `…` · 마지막 번호로 줄인다. 표 아래 줄의 이전/다음 Button 대신 쓸 수 있다.
- 한 페이지 줄 수 고르기·페이지 번호 입력칸은 아직 없다 → "디자인 필요".

### Dialog · Alert (팝업)

```html
<button type="button" class="k-button k-button-md k-button-outline-base" data-dialog-open="save-dialog">검사 실적 등록</button>

<dialog class="k-window k-dialog" id="save-dialog" aria-labelledby="save-title" aria-describedby="save-desc">
  <div class="k-window-titlebar k-dialog-titlebar">
    <h2 class="k-window-title" id="save-title">검사 실적 등록</h2>
    <p class="k-dialog-description" id="save-desc">검사 항목별 값을 입력합니다.</p>
  </div>
  <div class="k-window-content k-dialog-content">…</div>
  <div class="k-dialog-actions">
    <button type="button" class="k-button k-button-md k-button-outline-base" data-dialog-close="cancel">취소</button>
    <button type="button" class="k-button k-button-md k-button-solid-primary">저장</button>
  </div>
  <button type="button" class="k-window-action k-dialog-close" data-dialog-close="close" aria-label="닫기"><svg class="k-svg-icon" …x…></svg></button>
</dialog>
```

- 브라우저 `<dialog>`를 쓴다. 여는 버튼 `data-dialog-open="ID"`, 닫는 버튼 `data-dialog-close`(값은 `returnValue`로). 포커스 가두기·Esc·닫은 뒤 포커스 되돌리기는 브라우저가 한다.
- 폭 512, 화면이 좁으면 양옆 16을 남기고 줄어든다. 아래 버튼은 오른쪽 정렬, 주 버튼(오른쪽 끝)은 하나.
- 큰 팝업: `dialog`에 `ux-dialog-lg`를 더하면 폭 1080(표 2개를 좌우로 놓는 팝업 등). 좁은 화면에서는 기본과 같이 양옆 16을 남기고 줄어든다. 내용이 512에 들어가면 쓰지 않는다.
- 제목줄 버튼은 닫기 × 하나뿐이다. 최소화(−)·최대화 버튼은 쓰지 않는다.
- **Alert**(되돌릴 수 없는 동작 확인)는 `k-alert` + `role="alertdialog"`, 닫기 × 없음, 뒤 가림을 눌러도 안 닫힌다. 위험 동작이면 주 버튼을 `k-button-solid-error`로.
- 내용 칸에는 다른 부품(입력칸·표 등)을 넣는다. 팝업 안 내용 틀(표 · 정보 · LOT 입력 · 여러 줄 입력 · 선택 목록 · 선택 버튼)은 아직 없다 → 비슷한 부품을 조합하고, 안 되면 "디자인 필요".
- 태블릿에서 입력칸이 있는 팝업은 화면 키보드에 가리지 않게 화면 위쪽에 둔다(`dialog`에 위쪽 여백 지정, 변수로).

### Toast · Inline (알림)

```js
// Toast: 작업 결과 알림. 화면 오른쪽 아래, 4초 뒤 사라짐
LotteDS.toast({ type: 'success', title: '저장되었습니다', description: '2026-09-23 14:30' });
LotteDS.toast({ title: '삭제했습니다', action: '실행 취소', onAction: function () { /* 되돌리기 */ } });
```

```html
<!-- Inline: 화면 안에 붙박이로 두는 안내 -->
<div class="ux-alert" role="note">
  <svg class="k-svg-icon" aria-hidden="true">…circle-alert…</svg>
  <div class="ux-alert-text">
    <p class="ux-alert-title">알림</p>
    <p class="ux-alert-description">확인이 필요한 내용이 있습니다.</p>
  </div>
</div>
```

| 종류 | 쓰는 곳 |
|---|---|
| Toast `type` 생략 · success · info · warning · error | 누른 뒤 결과(저장·삭제·오류). 오류는 바로 읽히게 `role="alert"`로 뜬다 |
| Inline `ux-alert` | 화면에 계속 보여야 하는 안내 |
| Inline `ux-alert ux-alert-error` | 화면에 계속 보여야 하는 오류(`role="alert"`) |

- Toast 문구: 제목은 무슨 일이 됐는지("저장되었습니다"), 설명은 시각·건수 같은 보조 정보. "~창을 엽니다" 같은 자리채움 알림은 쓰지 않는다.
- 마우스를 올리거나 키보드로 들어가면 사라지지 않는다. Toast를 화면에 직접 마크업하지 않는다.

### Form (입력 폼)

```html
<form class="k-form" novalidate>
  <div class="k-form-field">
    <label class="k-label k-form-label" for="lot-no">LOT NO</label>
    <input id="lot-no" type="text" class="k-textbox k-input k-input-md" aria-describedby="lot-no-hint lot-no-error" aria-invalid="true">
    <p class="k-form-hint" id="lot-no-hint">도움말</p>
    <p class="k-form-error" id="lot-no-error">입력값을 확인하세요.</p>
  </div>

  <div class="k-form-field">
    <div class="ux-form-check">
      <input type="checkbox" class="k-checkbox k-checkbox-md" id="confirm">
      <label class="k-checkbox-label" for="confirm">확인</label>
    </div>
  </div>

  <div class="k-form-buttons">
    <button type="submit" class="k-button k-button-md k-button-solid-primary">저장</button>
  </div>
</form>
```

| 부분 | 쓰는 법 |
|---|---|
| `.k-form-field` | 항목 하나. 라벨 → 입력칸 → 도움말 → 오류 문구 순서, 간격 8. 입력칸은 폭을 꽉 채운다 |
| 입력칸 | Input · TextArea · DropDownList 그대로. 체크박스는 `.ux-form-check`로 체크박스 + 라벨 한 줄(라벨은 오른쪽) |
| `.k-form-hint` | 도움말(흐린 글자). 없으면 빼도 된다 |
| `.k-form-error` | 오류 문구. 도움말 아래. 이때 입력칸에 `aria-invalid="true"` |
| `.k-form` | 항목을 32 간격으로 쌓는다. 마지막에 `.k-form-buttons` |

- 입력칸에 `aria-describedby`로 도움말·오류 문구 id를 잇는다.
- 필수 항목은 Label의 빨간 점(`.k-required`) + 입력칸 `required`.
- 저장 버튼 위치는 아직 정해지지 않았다. 지금은 폼 아래 왼쪽.

### Card · Card / Stat (카드)

```html
<article class="k-card" aria-labelledby="card-title">
  <div class="k-card-header">
    <h3 class="k-card-title" id="card-title">카드 제목</h3>
    <p class="k-card-subtitle">카드 설명</p>
    <button type="button" class="k-button k-button-sm k-button-link-primary ux-card-action">보기</button>
  </div>
  <div class="k-card-body">…</div>
  <div class="k-card-footer">
    <button type="button" class="k-button k-button-md k-button-solid-primary">저장</button>
  </div>
</article>

<!-- 지표 카드 -->
<article class="k-card ux-card-stat">
  <div class="k-card-header">
    <p class="k-card-subtitle">오늘 생산량</p>
    <p class="k-card-title">1,250</p>
    <span class="k-badge k-badge-md k-badge-outline-base ux-card-action"><svg class="k-svg-icon" aria-hidden="true">…trending-up…</svg>+12.5%</span>
  </div>
  <div class="k-card-footer">
    <p class="ux-card-stat-summary">지난주 대비 증가<svg class="k-svg-icon" aria-hidden="true">…trending-up…</svg></p>
    <p class="ux-card-stat-detail">최근 6개월 기준</p>
  </div>
</article>
```

| 종류 | 쓰는 곳 |
|---|---|
| `k-card` | 제목이 있는 묶음(설정 칸·요약 칸). 머리 · 내용 · 아래 버튼 중 필요 없는 줄은 뺀다 |
| `k-card ux-card-stat` | 지표 하나(생산량·불량률). 증감은 outline Badge, 오름 trending-up · 내림 trending-down 아이콘 |
| `+ ux-card-stat-emphasis` | 핵심 지표 강조. 바탕 secondary |

- 폭은 카드가 정하지 않는다. 지표 카드 여러 개는 놓이는 자리에서 한 줄로 나란히(간격 16).
- 제목 태그(h2~h4)는 화면의 제목 단계에 맞춘다. 지표 카드의 수치는 제목이 아니라 `<p>`.

### Avatar

```html
<span class="k-avatar k-avatar-circle" role="img" aria-label="관리자"><span class="k-avatar-text" aria-hidden="true">관</span></span>
<span class="k-avatar k-avatar-circle"><span class="k-avatar-image"><img src="…" alt="홍길동"></span></span>
```

- 사진이 없으면 이니셜 한 글자. 크기 32 하나.

### Drawer (사이드바)

```html
<button type="button" class="k-button k-button-flat-base k-icon-button ux-drawer-toggle" data-drawer-toggle="app-drawer" aria-expanded="true" aria-controls="app-drawer" aria-label="메뉴 펼치기·접기"><svg class="k-svg-icon" aria-hidden="true">…panel-left…</svg></button>

<aside class="k-drawer k-drawer-start" id="app-drawer">
  <div class="k-drawer-wrapper">
    <div class="ux-drawer-header">
      <div class="ux-drawer-brand">
        <span class="k-avatar k-avatar-circle" aria-hidden="true"><span class="k-avatar-text">관</span></span>
        <div class="ux-drawer-brand-text">
          <p class="ux-drawer-brand-name">서비스 이름 <span class="k-badge k-badge-md k-badge-outline-base">사내</span></p>
          <p class="ux-drawer-brand-subtitle">부제</p>
        </div>
      </div>
    </div>
    <nav class="ux-drawer-content" aria-label="주 메뉴">
      <div class="ux-drawer-group">
        <p class="ux-drawer-group-label">메뉴 그룹</p>
        <ul class="k-drawer-items">
          <li><a class="k-drawer-item" href="…" aria-current="page"><svg class="k-svg-icon" aria-hidden="true">…</svg><span class="k-item-text">대시보드</span></a></li>
          <li>
            <button type="button" class="k-drawer-item" aria-expanded="true" aria-controls="menu-prod"><svg class="k-svg-icon" aria-hidden="true">…</svg><span class="k-item-text">생산</span><svg class="k-svg-icon ux-drawer-chevron" aria-hidden="true">…chevron-right…</svg></button>
            <ul class="ux-drawer-sub" id="menu-prod">
              <li><a class="ux-drawer-sub-item" href="…">작업지시</a></li>
            </ul>
          </li>
        </ul>
      </div>
    </nav>
    <div class="ux-drawer-footer">
      <div class="ux-drawer-user">
        <span class="k-avatar k-avatar-circle" aria-hidden="true"><span class="k-avatar-text">관</span></span>
        <div class="ux-drawer-user-text"><p class="ux-drawer-user-name">사용자 이름</p><p class="ux-drawer-user-email">시스템 관리자</p></div>
      </div>
    </div>
  </div>
</aside>
```

| 부분 | 쓰는 법 |
|---|---|
| `k-drawer` | 화면 왼쪽 사이드바. 폭 256, 높이는 놓이는 자리를 채운다 |
| `k-drawer-mini` | 아이콘 모드(폭 64). 그룹 제목·하위 메뉴·글자가 숨고, 이름은 마우스를 올리면 말풍선 |
| `data-drawer-tips="off"` | 아이콘 모드 말풍선 끄기(선택). `k-drawer`나 그 바깥 상자에 붙인다. 꺼도 화면 읽기 프로그램은 메뉴 이름을 읽는다. 화면 도중에 바꾸면 `LotteDS.syncDrawer(drawer)` |
| `ux-drawer-toggle` + `data-drawer-toggle="Drawer id"` | 펼침 ↔ 아이콘 모드. 보통 머리줄 왼쪽 |
| `k-drawer-item` | 메뉴 항목. 이동은 `<a>`, 하위 메뉴 여닫기는 `<button aria-expanded aria-controls>` + `ux-drawer-chevron` |
| `ux-drawer-sub` · `ux-drawer-sub-item` | 하위 메뉴. 최대 2단계 |
| 현재 메뉴 | `aria-current="page"` |
| `ux-drawer-brand` · `ux-drawer-user` | 맨 위 서비스 표시 · 맨 아래 사용자(선택). 사용자 칸은 아바타만 넣어도 된다 |

- 메뉴 아이콘은 16, 모든 메뉴에 넣는다(아이콘 모드에서 아이콘만 남는다).
- 펼침/접힘이 바뀌면 Drawer에서 `change` 이벤트(`detail.collapsed`).

### Breadcrumb (경로 줄)

```html
<nav class="k-breadcrumb" aria-label="현재 위치">
  <ol class="k-breadcrumb-container">
    <li class="k-breadcrumb-item"><a class="k-breadcrumb-link" href="…">생산관리</a></li>
    <li class="ux-breadcrumb-separator" aria-hidden="true"><svg class="k-svg-icon">…chevron-right…</svg></li>
    <li class="k-breadcrumb-item"><span class="k-breadcrumb-link" aria-current="page">작업 지시</span></li>
  </ol>
</nav>
```

| 쓰는 것 | 뜻 |
|---|---|
| `a.k-breadcrumb-link` | 상위 단계. 흐린 글자, 마우스를 올리면 진하게 |
| `span.k-breadcrumb-link[aria-current="page"]` | 현재 화면. 항상 마지막, 링크 아님 |
| `ux-breadcrumb-separator` | 단계 사이 화살표 |
| `ux-breadcrumb-ellipsis` | 중간 단계 생략(…). 단계가 많을 때만 |

- 항목 간격·글자 크기는 PC·Tablet 같음.

### Calendar · DatePicker (날짜 고르기)

```html
<!-- 달력만: 빈 판을 두면 lotte-ds.js가 그린다 -->
<div class="k-calendar" data-ux-calendar data-value="2026-09-18" aria-label="작업일 선택"></div>

<!-- 날짜 칸 + 뜨는 달력 -->
<div class="ux-datepicker" data-ux-datepicker>
  <button type="button" class="k-button k-button-md k-button-outline-base ux-datepicker-trigger" aria-haspopup="dialog" aria-expanded="false">
    <svg class="k-svg-icon" aria-hidden="true">…calendar…</svg><span class="ux-datepicker-value">날짜 선택</span>
  </button>
  <input type="hidden" name="workDate">
  <div class="k-calendar-container k-popup" role="dialog" aria-label="날짜 선택" hidden>
    <div class="k-calendar" data-ux-calendar></div>
  </div>
</div>
```

| 쓰는 것 | 뜻 |
|---|---|
| `data-value` (`.k-calendar`) | 고른 날짜 `YYYY-MM-DD`. 처음 값이 없으면 비움 |
| `data-min` · `data-max` | 고를 수 있는 범위(밖 날짜는 흐린 비활성) |
| 날짜 칸 상태 | 오늘 · 고름 · 기간 가운데(`k-range-mid`) · 다른 달 · 비활성 — 색은 부품이 정한다 |
| 값 받기 | DatePicker 상자의 `change` 이벤트 `detail.value`, 또는 숨은 input |
| 오류 · 비활성 칸 | 칸(button)에 `aria-invalid="true"`(빨간 테두리 + 연한 빨간 링, Input 오류와 같음) · `disabled`(Button 비활성과 같음, 눌러도 안 열림) |

- 칸 폭 280, 높이는 PC 36 · Tablet 48. 날짜 칸은 PC 32 · Tablet 40.
- 일요일부터 시작. 날짜 표기는 `YYYY-MM-DD`.
- SmartUX 화면의 날짜 칸(kendoDatePicker)도 같은 모양이 된다. 그쪽은 Kendo가 동작시킨다.

### Toggle (켜고 끄는 버튼)

```html
<button type="button" class="k-toggle-button" aria-pressed="false">굵게</button>
<button type="button" class="k-toggle-button ux-toggle-pill" aria-pressed="true">진행중</button>
```

| variant | 쓰는 곳 |
|---|---|
| (없음) | 도구 줄 안 켜고 끄는 버튼(배경 없음) |
| `ux-toggle-outline` | 테두리가 필요한 자리 |
| `ux-toggle-solid` | 선택 칩 — 켜면 primary |
| `ux-toggle-pill` | 필터 조건 고르기 — 켜면 연파랑 + 파란 테두리 |

- 크기: 기본 · `ux-toggle-sm`. 켜짐은 `aria-pressed="true"`로만 표시한다.
- 누르면 lotte-ds.js가 켜짐·꺼짐을 바꾸고 `change` 이벤트(`detail.pressed`)를 보낸다.
- 실행 버튼(저장·조회)은 Toggle이 아니라 Button.

### ButtonGroup · ButtonGroup / Toggle (붙은 버튼 묶음)

```html
<!-- 누르면 바로 실행 -->
<div class="k-button-group" role="group" aria-label="날짜 이동">
  <button type="button" class="k-button k-button-md k-button-outline-base">이전</button>
  <button type="button" class="k-button k-button-md k-button-outline-base">오늘</button>
  <button type="button" class="k-button k-button-md k-button-outline-base">다음</button>
</div>

<!-- 고른 칸이 남음 -->
<div class="k-button-group ux-toggle-group" role="group" aria-label="기간" data-ux-toggle-group="single">
  <button type="button" class="k-toggle-button ux-toggle-outline" value="day" aria-pressed="true">일</button>
  <button type="button" class="k-toggle-button ux-toggle-outline" value="week" aria-pressed="false">주</button>
  <button type="button" class="k-toggle-button ux-toggle-outline" value="month" aria-pressed="false">월</button>
</div>
```

- ButtonGroup은 outline 버튼만 붙인다. 모서리·테두리·그림자는 묶음이 알아서 맞춘다.
- ButtonGroup / Toggle: 칸에 `ux-toggle-outline`을 붙이면 테두리형, 빼면 배경 없음. 하나만 고르면 `single`(기본), 여러 개면 `multiple`.
- 값은 묶음의 `change` 이벤트 `detail.value`(켜진 칸의 value 목록).
- SmartUX의 kendoButtonGroup도 ButtonGroup / Toggle(테두리형)처럼 보인다.

### Menu (더보기 · 동작 목록)

```html
<div class="ux-menu">
  <button type="button" class="k-button k-button-md k-button-outline-base ux-menu-trigger" aria-haspopup="menu" aria-expanded="false">더보기</button>
  <div class="k-menu-popup k-popup" hidden>
    <ul class="k-menu-group" role="menu" aria-label="더보기">
      <li class="k-item k-menu-item" role="none"><button type="button" class="k-link k-menu-link" role="menuitem" value="copy"><span class="k-menu-link-text">복사</span></button></li>
      <li class="k-separator" role="separator"></li>
      <li class="k-item k-menu-item" role="none"><button type="button" class="k-link k-menu-link ux-menu-error" role="menuitem" value="delete"><span class="k-menu-link-text">삭제</span></button></li>
    </ul>
  </div>
</div>
```

| 항목 | 쓰는 것 |
|---|---|
| 기본 | `k-menu-link` (아이콘 16 · 단축키 `ux-menu-shortcut` 선택) |
| 위험(삭제 등) | `k-menu-link ux-menu-error` — 맨 아래, 구분선 뒤 |
| 체크 | `role="menuitemcheckbox" aria-checked` + `ux-menu-check` |
| 하위 메뉴 | `aria-haspopup="menu"` + 안에 `k-menu-popup` 하나 더, 한 단계까지 |
| 라벨 · 구분선 | `ux-menu-label` · `k-separator` |

- 고르면 `.ux-menu`에 `select` 이벤트(`detail.value` · `text` · `checked`).
- 화면의 주 동작(저장·조회)은 메뉴에 숨기지 않고 Button으로 둔다.

### TreeView (계층 목록)

```html
<div class="k-treeview">
  <ul class="k-treeview-lines" role="tree" aria-label="공정">
    <li class="k-treeview-item" role="treeitem" aria-level="1" aria-expanded="true" aria-selected="false" data-id="mix">
      <span class="k-treeview-mid">
        <span class="k-treeview-toggle" aria-hidden="true"></span>
        <span class="k-treeview-leaf-text">배합</span>
        <span class="ux-tree-count">2</span>
      </span>
      <ul class="k-treeview-group" role="group">
        <li class="k-treeview-item" role="treeitem" aria-level="2" aria-selected="true" data-id="weigh">
          <span class="k-treeview-mid"><span class="k-treeview-toggle" aria-hidden="true"></span><span class="k-treeview-leaf-text">원료 계량</span></span>
        </li>
      </ul>
    </li>
  </ul>
</div>
```

- 단계는 `aria-level` 1~3(들여쓰기 16씩). 하위가 있으면 `aria-expanded`, 고른 줄은 `aria-selected="true"` 하나.
- 아이콘(`ux-tree-icon` 16)·개수(`ux-tree-count`)는 선택. 펼침 화살표는 lotte-ds.js가 그린다.
- 고르면 트리에 `select` 이벤트(`detail.id` · `text`). 줄 높이 32, 글자 크기는 PC·Tablet 같음.

### Stepper (단계 표시)

```html
<div class="k-stepper">
  <ol class="k-step-list k-step-list-horizontal" aria-label="등록 단계">
    <li class="k-step k-step-done"><span class="k-step-indicator"><svg class="k-svg-icon" aria-hidden="true">…check…</svg></span><span class="k-step-label"><span class="k-step-text">기본 정보</span></span></li>
    <li class="ux-step-connector ux-step-connector-done" aria-hidden="true"></li>
    <li class="k-step k-step-current" aria-current="step"><span class="k-step-indicator">2</span><span class="k-step-label"><span class="k-step-text">상세 입력</span></span></li>
    <li class="ux-step-connector" aria-hidden="true"></li>
    <li class="k-step"><span class="k-step-indicator">3</span><span class="k-step-label"><span class="k-step-text">확인</span></span></li>
  </ol>
</div>
```

| 상태 | 클래스 | 동그라미 안 |
|---|---|---|
| 완료 | `k-step-done` | 체크 아이콘 |
| 현재 | `k-step-current` + `aria-current="step"` | 번호 |
| 예정 | (없음) | 번호 |
| 오류 | `k-step-error` | X 아이콘 |
| 비활성 | `k-step-disabled` | 번호 |

- 가로형(`k-step-list-horizontal`)은 폼 위, 세로형(`k-step-list-vertical`)은 왼쪽 목록형.
- 단계 사이에 연결선 `ux-step-connector`, 지나온 구간은 `ux-step-connector-done`. 보조 문구는 `ux-step-optional`.
- 보여 주기만 한다(누를 수 없음). 단계 이동은 아래 버튼(이전·다음)으로.

### ProgressBar (진행 막대)

```html
<div class="k-progressbar" role="progressbar" aria-label="생산 진행률" aria-valuemin="0" aria-valuemax="100" aria-valuenow="25">
  <div class="k-progressbar-value" style="width: 25%"></div>
</div>
```

- 높이 8, 폭은 놓이는 자리를 채운다. 값을 바꿀 때 `width`와 `aria-valuenow`를 같이 바꾼다.
- `aria-label`로 무엇의 진행률인지 적는다. 숫자(%)가 필요하면 막대 옆에 글자로 따로 둔다.

### ExpansionPanel (접고 펴는 패널)

```html
<div class="k-expander k-expanded">
  <button type="button" class="k-expander-header" aria-expanded="true" aria-controls="search-body">
    <span class="k-expander-title">조회 조건</span>
    <span class="k-spacer"></span>
    <svg class="k-svg-icon k-expander-indicator" aria-hidden="true">…chevron-down…</svg>
  </button>
  <div class="k-expander-content-wrapper" id="search-body">
    <div class="k-expander-content">…조회 조건 Form…</div>
  </div>
</div>
```

- 조회 조건 영역에 쓴다. 폭은 놓이는 자리를 채운다.
- 처음 접어 두려면 `k-expanded`와 `aria-expanded="true"`를 빼고 내용에 `hidden`.
- 누르면 상자에 `change` 이벤트(`detail.expanded`).

### Splitter (위아래 칸 크기 조절)

```html
<div class="k-splitter k-splitter-vertical">
  <div class="k-pane" id="list-pane">…위 칸(예: 목록 Card)…</div>
  <div class="k-splitbar k-splitbar-vertical" role="separator" tabindex="0" aria-orientation="horizontal"
       aria-controls="list-pane" aria-label="위아래 크기 조절" data-splitter-size="50">
    <span class="k-resize-handle" aria-hidden="true"></span>
  </div>
  <div class="k-pane">…아래 칸(예: Tabs)…</div>
</div>
```

- 위 칸과 아래 칸 사이 막대를 끌면 위 칸 높이가 바뀐다. 막대에 포커스를 두고 ↑ ↓는 16씩, Shift + ↑ ↓는 64씩, Home · End는 위 칸 최소 · 최대.
- 막대 높이 PC 12 · Tablet 24, 가운데 잡는 표시 32 × 4. 마우스 올림 = 회색 바탕, 끄는 중 = 연한 파랑 바탕 + 파란 표시, 키보드 포커스 = 안쪽 파란 테두리.
- `.k-splitter` 높이는 놓이는 자리에서 정한다(부모 높이를 채운다). 위 · 아래 칸은 최소 160이라 상자 높이는 그보다 커야 한다.
- 처음 위 칸 높이 `data-splitter-size`(%, 기본 50). 막대에 둔다.
- 바뀌면 막대에 `change` 이벤트(`detail.size` = 위 칸 높이). 높이를 기억하는 일은 화면 스크립트가 한다.
- 칸 안 내용이 넘치면 칸 안에서 스크롤된다. 좌우 칸 나누기는 아직 없다 → "디자인 필요".

### Toolbar (도구 모음)

```html
<div class="k-toolbar" role="toolbar" aria-label="목록 도구">
  <button type="button" class="k-button k-button-sm k-button-solid-primary">조회</button>
  <button type="button" class="k-button k-button-sm k-button-outline-base">초기화</button>
  <span class="k-separator k-separator-vertical" role="separator" aria-orientation="vertical"></span>
  <button type="button" class="k-button k-button-sm k-button-flat-base">엑셀</button>
</div>
```

- 안의 버튼은 sm. 주 동작 1개만 solid-primary, 나머지는 outline·ghost.
- 안쪽 여백 4 · 버튼 사이 간격 4(구분선 양옆도 4).
- 묶음 사이는 세로 구분선. 자리가 모자라면 다음 줄로 넘어간다.

### Kbd (키 표시)

```html
<kbd class="ux-kbd">Esc</kbd>
<kbd class="ux-kbd-group"><kbd class="ux-kbd">Ctrl</kbd><kbd class="ux-kbd">K</kbd></kbd>
```

- 단축키를 알려 주는 표시. 눌리는 단추가 아니다(누르는 건 Button).
- 키 하나 = `.ux-kbd`, 여러 키 조합 = `.ux-kbd-group`으로 감싼다. 키 사이에 "+" 글자를 넣지 않는다.
- PC·Tablet 크기가 같다.

### PageTab (열린 화면 탭 줄)

```html
<div class="ux-page-tabs" role="tablist" aria-label="열린 화면">
  <div class="ux-page-tab">
    <button type="button" class="ux-page-tab-link" role="tab" aria-selected="true">
      <svg class="k-svg-icon" …>…</svg><span class="ux-page-tab-text">원료 입고</span>
    </button>
    <button type="button" class="ux-page-tab-close" aria-label="원료 입고 닫기"><svg class="k-svg-icon" …>…</svg></button>
  </div>
</div>
```

- 화면 맨 아래, 폭 전체에 한 줄. 높이 36(PC·Tablet 같음). 탭이 많으면 줄 안에서 가로로 넘긴다.
- 고른 탭은 하나(`aria-selected="true"`): 흰 바탕 · 굵은 글자 · 아이콘 primary. Tabs(`.k-tabstrip`)와 섞어 쓰지 않는다 — 화면 안 내용 나누기는 Tabs.
- X는 빼도 된다. 누르면 탭에 `close` 이벤트만 오고, 탭을 지우고 다른 화면을 고르는 건 쓰는 쪽에서 한다. 탭을 고르면 줄에 `select` 이벤트.
- 다른 화면으로 가는 링크(표 칸 링크 등)는 브라우저 새 탭으로 열지 않고, 그 화면을 이 줄에 탭으로 추가하고 고른다. 이미 열려 있으면 그 탭을 고른다.
- 빈 상태: 줄 맨 끝에 `<p class="ux-page-tabs-empty">열린 화면이 없어요</p>`를 둔다. 탭이 있으면 저절로 숨고, 탭이 다 닫히면 같은 줄에 흐린 글자로 보인다.

### AppBar (화면 맨 위 머리줄 · 패턴)

```html
<header class="k-appbar ux-appbar">
  <div class="k-appbar-section">
    <button type="button" class="k-button k-button-flat-base k-icon-button ux-drawer-toggle" data-drawer-toggle="app-drawer" aria-expanded="true" aria-controls="app-drawer" aria-label="메뉴 펼치기·접기">…panel-left…</button>
    <span class="k-separator k-separator-vertical" role="separator" aria-orientation="vertical"></span>
    <button type="button" class="k-toggle-button ux-toggle-sm ux-appbar-favorite" aria-pressed="false" aria-label="제품검사 결과 등록 즐겨찾기">…star…</button>
    <div class="ux-appbar-titles">
      <h1 class="ux-appbar-title">제품검사 결과 등록</h1>
      <nav class="k-breadcrumb ux-appbar-crumb" aria-label="현재 위치">
        <ol class="k-breadcrumb-container">
          <li class="k-breadcrumb-item"><a class="k-breadcrumb-link" href="#">QMS</a></li>
          <li class="ux-breadcrumb-separator" aria-hidden="true">…chevron-right…</li>
          <li class="k-breadcrumb-item"><a class="k-breadcrumb-link" href="#">검사 관리</a></li>
          <li class="ux-breadcrumb-separator" aria-hidden="true">…chevron-right…</li>
          <li class="k-breadcrumb-item"><span class="k-breadcrumb-link" aria-current="page">QM-020</span></li>
        </ol>
      </nav>
    </div>
  </div>
  <span class="k-appbar-spacer"></span>
  <div class="k-appbar-section">
    <span class="k-textbox ux-appbar-search">…InputGroup(검색 · ⌘K)…</span>
    <button type="button" class="k-button k-button-flat-base k-icon-button" aria-label="즐겨찾기 목록" data-tooltip="즐겨찾기 목록">…list-checks…</button>
    <div class="ux-drawer-user">…Drawer / User + chevron…</div>
  </div>
</header>
```

- 화면 맨 위, 폭 전체. 안의 칸은 전부 기존 부품(Drawer / Toggle · Separator · Toggle · Breadcrumb · Input InputGroup · Kbd · Drawer / User)을 그대로 쓴다.
- 왼쪽 순서: 메뉴 토글 · 구분선 · **이 화면 즐겨찾기 ☆** · **화면 제목**(`h1.ux-appbar-title`, 글자 16 semibold) 위 + **작은 경로**(`nav.k-breadcrumb.ux-appbar-crumb`, 글자 12 흐림) 아래. 화면 제목은 여기 `h1` 하나뿐이고, 본문에 제목(PageHeading)을 또 두지 않는다.
- 작은 경로는 상위 메뉴 이름을 차례로 두고, 마지막 칸은 화면 ID(`aria-current="page"`). 빼도 된다.
- **이 화면 즐겨찾기 ☆**(`.ux-appbar-favorite`): Toggle(sm, 정사각 PC 32 · Tablet 40) + star 아이콘. 꺼짐 = 빈 별, 켜짐(`aria-pressed="true"`) = 채운 주황 별. `aria-label`은 "<화면 이름> 즐겨찾기". 누르면 lotte-ds.js가 켜짐·꺼짐을 바꾸고 `change` 이벤트를 보낸다(저장은 화면 스크립트). 즐겨찾기를 쓰지 않는 화면은 뺀다.
- 빼도 되는 칸: 토글+구분선 · ☆ · 작은 경로 · 검색 · 사용자. 제목 없이 경로 줄(`nav.k-breadcrumb`, 첫 칸 홈 아이콘, 마지막 칸 = 화면 이름)만 두는 예전 구조도 된다. 아이콘 버튼은 ghost icon 버튼으로 사용자 앞에 둔다(기본은 없음). **즐겨찾기 목록 열기**는 이 자리의 ghost icon 버튼이고 아이콘은 list-checks(☆ 아님), `aria-label`·`data-tooltip` "즐겨찾기 목록". 누른 뒤 나오는 화면은 아직 없다 → "디자인 필요".
- 오른쪽 주요 버튼 자리는 아직 정해진 모양이 없다 → 1장 "없는 UI".
- Tablet에서는 검색 칸이 기기 높이(48)를 따라 줄이 65가 된다.

### PageHeading (본문 맨 위 제목 영역 · 패턴)

```html
<div class="ux-page-heading">
  <div class="ux-page-heading-titles">
    <h1 class="ux-page-heading-title">작업 지시</h1>
    <p class="ux-page-heading-desc">오늘 생산할 작업을 확인합니다.</p>
  </div>
  <div class="ux-page-heading-actions">
    <button type="button" class="k-button k-button-md k-button-outline-base">엑셀 다운로드</button>
    <button type="button" class="k-button k-button-md k-button-solid-primary">작업 등록</button>
  </div>
</div>
```

- 본문 맨 위에 하나. 화면 제목은 `h1` 하나뿐이다.
- 설명(`.ux-page-heading-desc`)은 빼도 된다.
- AppBar에 화면 제목을 둔 화면(기본)에서는 PageHeading을 쓰지 않는다. 제목이 두 번 나오면 안 된다. 이 화면 즐겨찾기 ☆는 AppBar에 둔다.
- 오른쪽 버튼은 최대 2개: 보조(outline) · 주요(solid-primary). 주요 버튼은 화면 전체에서 하나뿐이다. 버튼이 없으면 `.ux-page-heading-actions`를 통째로 뺀다.

### Toolbar / Filter (필터바 · 패턴)

```html
<div class="ux-toolbar-filter" role="search" aria-label="조회 조건">
  <input type="search" class="k-textbox k-input k-input-md ux-toolbar-filter-search" placeholder="검색" aria-label="검색">
  <div class="k-dropdownlist k-picker k-picker-md">…DropDownList(aria-label="라인")…</div>
  <div class="k-dropdownlist k-picker k-picker-md">…DropDownList(aria-label="상태")…</div>
  <div class="ux-datepicker" data-ux-datepicker>…DatePicker…</div>
  <button type="button" class="k-button k-button-md k-button-flat-base"><span class="k-button-text">초기화</span><svg …x…/></button>
</div>
```

- 표(Grid) 바로 위에 붙인다. 칸은 전부 기존 부품(Input · DropDownList · DatePicker · Button ghost)을 그대로 쓴다.
- 검색 칸 폭 250, 필터 칸은 글자 폭, 날짜 칸 280. 칸 사이 8.
- 빼도 되는 칸: 검색 · 필터 1 · 필터 2 · 날짜 · 초기화. 필터는 라벨이 안 보이니 `aria-label`을 꼭 단다.
- 초기화를 눌러 값을 지우는 건 쓰는 쪽에서 한다. 자리가 모자라면 다음 줄로 넘어간다.

### Toolbar / Form Action (폼 하단 버튼 줄 · 패턴)

```html
<div class="ux-toolbar-form-action">
  <button type="button" class="k-button k-button-md k-button-outline-base">취소</button>
  <button type="submit" class="k-button k-button-md k-button-solid-primary">저장</button>
</div>
```

- 등록·수정 화면 맨 아래에 하나. 화면을 내려도 아래에 붙어 있다(sticky).
- 버튼은 오른쪽 정렬, [취소] [저장] 순서(저장이 맨 오른쪽). 저장 버튼 위치는 바꾸지 않는다.
- 저장(solid-primary)은 화면에 하나뿐이다. 다른 버튼을 더할 때는 outline·ghost로 취소 왼쪽에 둔다.

### Form Table (이름 + 값 입력 표 · 패턴)

```html
<div class="ux-form-table">
  <table>
    <tbody>
      <tr>
        <th scope="row">LOT NO</th><td>L20261124-01</td>
        <th scope="row"><span class="k-required" aria-hidden="true"></span>투입량</th>
        <td class="ux-form-table-control"><input class="k-textbox k-input k-input-md" placeholder="입력하세요" aria-label="투입량"></td>
      </tr>
      <tr>
        <th scope="row">비고</th><td colspan="3">특이사항 없음</td>
      </tr>
    </tbody>
  </table>
</div>
```

- 모달(Dialog 내용 칸)이나 화면 본문에서 쓴다. 줄은 최대 6개, 줄마다 칸 1~2개.
- 칸 = 이름(`th`, 폭 128) + 값. 읽기 값은 `td` 그대로, 입력 부품(Input · DropDownList · Numeric · DatePicker)은 `td.ux-form-table-control` 안에 넣으면 폭을 채운다.
- 칸 하나가 줄 전체를 쓸 때는 `colspan="3"`. 입력 부품 두 개를 쌓을 때만 `.ux-form-table-stack`으로 감싼다(간격 8).
- 필수 칸은 이름 앞에 `<span class="k-required" aria-hidden="true"></span>`. 입력 부품에는 `aria-label`로 이름을 단다.
- 폭은 놓이는 자리(모달·본문)를 따른다. 값 칸 두 개는 같은 폭으로 나뉜다.

### Dialog Content 6종 (팝업 내용 칸 · 패턴)

Dialog 내용 칸(`.k-dialog-content`) 안에 하나를 넣는다. 폭은 내용 칸을 채운다. 안 쓰는 줄은 지운다.

| 종류 | 언제 | 틀 |
|---|---|---|
| Table | 조회 결과 표(4칸 · 줄 최대 4개) | `<div class="k-grid ux-dialog-table"><table class="k-grid-table">…Grid와 같은 구조…</table></div>` |
| Info | 확인·상세 정보(이름 + 값, 최대 6줄) | `<div class="ux-dialog-info"><table><tbody><tr><th scope="row">품목</th><td>빼빼로</td></tr>…</tbody></table></div>` |
| LOT Input | 이름 + 입력칸 한 줄 | Info와 같은 틀, 값 칸을 `<td class="ux-dialog-info-control"><input class="k-textbox k-input k-input-md" …></td>` |
| TextArea | 특이사항처럼 긴 글(높이 168) | `<textarea class="k-textarea ux-dialog-textarea" aria-label="특이사항"></textarea>` |
| Option List | 여러 개 중 하나 고르기(프린터 선택 등) | `<div class="ux-dialog-options" role="radiogroup" aria-label="…"><div class="ux-dialog-option"><input type="radio" class="k-radio k-radio-md" …><label class="k-radio-label" for="…">…</label></div>…</div>` |
| Option Buttons | 누르면 바로 다음 단계로 가는 선택 | `<div class="ux-dialog-option-buttons"><button type="button" class="k-button k-button-lg k-button-outline-base">방식 1</button>…</div>` |

- Table은 칸 폭 132 · 남는 폭 · 124 · 64, 글자는 가운데.
- Option Buttons를 쓸 때는 Dialog 아래 버튼 줄(`.k-dialog-actions`)을 뺀다.
- LOT Input의 이름은 `<label for>`로 입력칸과 잇는다.

### Menu Tile (태블릿 메인 메뉴 타일)

```html
<a class="ux-menu-tile" href="…">
  <svg class="k-svg-icon" …>…</svg>
  <span class="ux-menu-tile-text">소분 계량</span>
</a>
```

- 태블릿 메인 화면의 메뉴 격자에 놓는다. 폭은 격자가 정한다(놓이는 자리에서 `display: grid`로 칸을 나눈다). 높이는 148 고정.
- 화면 이동이면 `<a href>`, 동작이면 `<button type="button" class="ux-menu-tile">`.
- 색은 Button secondary와 같다. 누르는 동안 진해진다(pressed). 마우스 올림 색은 없다.
- 아이콘은 빼도 된다. 메뉴명은 두 줄까지, 넘치면 잘린다.

### SectionCards (지표 카드 한 줄 · 패턴)

```html
<section class="ux-section-cards" aria-label="오늘 현황">
  <article class="k-card ux-card-stat">…Card / Stat…</article>
  <article class="k-card ux-card-stat">…</article>
  <article class="k-card ux-card-stat">…</article>
  <article class="k-card ux-card-stat">…</article>
</section>
```

- 대시보드·현황 화면 위쪽에 한 줄. 카드는 Card / Stat 그대로, 같은 폭 · 간격 16. 기본 4개, 개수는 카드를 빼서 조절한다.
- 폭이 좁으면 카드가 같이 좁아지고 카드 안 글자가 줄바꿈된다(본문 1440 = 카드 348).
- 핵심 지표 강조(`.ux-card-stat-emphasis`)는 한 줄에 하나만.

## 4. 화면 조립

- 화면 바깥 여백과 구역 사이 간격: `var(--kendo-spacing-6)`(24).
- 한 구역 안 묶음 사이: `var(--kendo-spacing-4)`(16).
- 나란한 버튼 사이: `var(--kendo-device-action-gap)`(PC 8 · Tablet 16). 버튼 묶음은 `flex-wrap: wrap`으로 두고 줄이거나 자르지 않는다.
- 부품의 크기·간격·여백을 화면에서 바꾸지 않는다.
- 머리줄 같은 화면 틀 부품은 아직 없다(사이드 메뉴는 Drawer). 그 자리는 빨간 점선 빈 자리로 둔다.

### 화면설계서(이미지)를 받았을 때 — 배치는 이미지 그대로

1. 영역 나눔·상자 겹수·배치 순서는 이미지 그대로 만든다. AI가 구조를 바꾸거나 상자를 덧씌우지 않는다.
2. 이미지에서 상자가 한 겹이면 화면에서도 한 겹이다.
3. UX를 고치는 것은 사용자가 따로 요청한다. AI가 먼저 고치지 않는다.
4. 배치·구성은 이번에 받은 화면설계서만 기준으로 한다. 이전에 만든 화면 방식을 가져오지 않는다.
5. 이미지 속 문구는 그대로 쓴다.

## 5. 접근성

- 누르는 것은 `<button>`, 이동은 `<a>`. `<div>`에 클릭을 달지 않는다.
- 아이콘만 있는 버튼은 `aria-label`, 장식 아이콘은 `aria-hidden="true"`.
- 포커스 링·비활성·오류(`aria-invalid`) 표시를 지우지 않는다(`outline: none`으로 덮지 않는다).
- 입력칸은 `<label for>`로 연결한다.
- 제목은 `h1`부터 차례로 쓰고 단계를 건너뛰지 않는다.

## 6. 한글 문구

- 디자인·이미지에 적힌 문구는 그대로 쓴다.
- AI가 새로 쓰는 문구(빈 화면·오류·확인 팝업)는 맞춤법·띄어쓰기를 지킨다. 오류는 "무슨 일 + 지금 할 일", 버튼은 누르면 일어나는 일(마침표 없음).
- 숫자는 천 단위 쉼표. 긴 LOT·코드만 줄바꿈 허용(`overflow-wrap: anywhere`), 한글 단어를 쪼개지 않는다(`word-break: keep-all`).
- 12px보다 작은 글자를 쓰지 않는다.

## 7. 다 만든 뒤 점검

보고 끝에 항목별로 "통과 / N개 고침 / 못 고침 + 근거"를 붙인다. "점검: 통과" 한 줄로 끝내지 않는다.

1. 화면에 쓴 부품이 전부 3장 부품 표에 있는가
2. 화면 CSS에 hex·px 값이 없는가 (변수만)
3. 부품 클래스·모양을 덮어쓴 곳이 없는가
4. 이미지의 요소 수 = 만든 것 + 빨간 점선 수인가, 없는 UI 목록을 알렸는가
5. 주 동작 버튼이 영역마다 하나인가
6. 표 데이터 글자가 버튼 글자보다 크지 않은가
7. 아이콘 버튼에 `aria-label`, 입력칸에 라벨이 있는가
8. 브라우저에서 라이트·다크, PC·Tablet 네 가지로 열어 콘솔 에러 0건이고 안 보이는 곳이 없는가

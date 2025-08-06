# 세계관 소개 사이트

당신의 작품 세계관을 소개하는 세련된 웹사이트입니다.

## 🚀 주요 기능

- **세계관 페이지**: 메인 세계관 소개
- **캐릭터 페이지**: 드롭다운으로 다양한 캐릭터 정보 확인
- **설정 페이지**: 사이드바 메뉴로 다양한 설정 카테고리 탐색
- **반응형 디자인**: 모바일, 태블릿, 데스크톱 모든 기기에서 최적화
- **모던한 UI**: 세련된 애니메이션과 인터랙션

## 📁 파일 구조

```
worldbuilding-site/
├── index.html          # 메인 HTML 파일
├── styles.css          # CSS 스타일시트
├── script.js           # JavaScript 기능
└── README.md           # 이 파일
```

## 🎨 커스터마이징 방법

### 1. 세계관 내용 수정

`index.html` 파일에서 다음 부분을 수정하세요:

```html
<!-- 히어로 섹션 제목 -->
<h1 class="hero-title">당신의 세계관에 오신 것을 환영합니다</h1>

<!-- 세계관 개요 -->
<div class="content-card">
    <h2>세계관 개요</h2>
    <p>여기에 당신의 세계관에 대한 기본적인 소개를 작성하세요.</p>
</div>
```

### 2. 캐릭터 정보 수정

`script.js` 파일의 `characters` 객체를 수정하세요:

```javascript
const characters = {
    character1: {
        name: '캐릭터 이름',
        description: '캐릭터 설명',
        age: '나이',
        occupation: '직업',
        personality: '성격',
        background: '배경'
    },
    // 더 많은 캐릭터 추가...
};
```

### 3. 설정 정보 수정

`script.js` 파일의 `settings` 객체를 수정하세요:

```javascript
const settings = {
    'magic-system': {
        title: '마법 체계',
        description: '마법 체계 설명',
        details: [
            '마법 종류 1',
            '마법 종류 2',
            // 더 많은 세부사항...
        ]
    },
    // 더 많은 설정 카테고리 추가...
};
```

### 4. 색상 테마 변경

`styles.css` 파일에서 다음 CSS 변수들을 수정하세요:

```css
/* 주요 색상 */
--primary-color: #667eea;
--secondary-color: #764ba2;
--text-color: #333;
--background-color: #f8f9fa;
```

## 🎯 사용법

1. **index.html** 파일을 웹 브라우저에서 열기
2. 상단 네비게이션에서 원하는 메뉴 클릭
3. 캐릭터 페이지에서는 드롭다운으로 캐릭터 선택
4. 설정 페이지에서는 사이드바에서 카테고리 선택

## 📱 반응형 디자인

- **데스크톱**: 전체 기능 사용 가능
- **태블릿**: 적응형 레이아웃
- **모바일**: 햄버거 메뉴와 최적화된 레이아웃

## 🔧 기술 스택

- **HTML5**: 시맨틱 마크업
- **CSS3**: 모던 스타일링과 애니메이션
- **JavaScript**: 인터랙티브 기능
- **Font Awesome**: 아이콘
- **Google Fonts**: Noto Sans KR 폰트

## 🚀 배포 방법

### 로컬에서 실행
1. 모든 파일을 같은 폴더에 저장
2. `index.html` 파일을 웹 브라우저에서 열기

### 웹 서버에 배포
1. 모든 파일을 웹 서버에 업로드
2. `index.html`을 메인 페이지로 설정

### GitHub Pages 사용
1. GitHub 저장소에 파일 업로드
2. Settings > Pages에서 배포 설정

## 💡 추가 기능 아이디어

- 이미지 갤러리 추가
- 음악/사운드 효과
- 다크 모드 토글
- 검색 기능
- 소셜 미디어 링크
- 댓글 시스템

## 📞 지원

문제가 있거나 추가 기능이 필요하시면 언제든 연락주세요!

---

**참고**: 이 사이트는 순수 HTML, CSS, JavaScript로 제작되어 별도의 서버나 데이터베이스 없이도 작동합니다. 
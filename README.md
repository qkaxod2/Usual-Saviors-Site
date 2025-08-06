# Usual Saviors - 어반판타지 세계관 사이트

현실과 마법이 공존하는 어반판타지 세계관을 소개하는 웹사이트입니다.

## 🚀 기능

- **세계관 소개**: 메인 페이지에서 세계관 개요 제공
- **캐릭터 관리**: 캐릭터 추가, 수정, 삭제, 이미지 업로드
- **설정 관리**: 세계관 설정 카테고리 추가, 수정, 삭제
- **다중 사용자 지원**: 여러 사용자가 동시에 사용 가능
- **데이터 영속성**: SQLite 데이터베이스로 데이터 안전 보관

## 🛠️ 기술 스택

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Backend**: Node.js, Express.js
- **Database**: SQLite
- **Deployment**: Google Cloud Compute Engine
- **Process Management**: PM2

## 📁 프로젝트 구조

```
worldbuilding-site/
├── public/                 # 정적 파일
│   ├── index.html         # 메인 페이지
│   ├── styles.css         # 스타일시트
│   └── script.js          # 클라이언트 JavaScript
├── server/
│   ├── routes/            # API 라우트
│   │   ├── characters.js  # 캐릭터 API
│   │   ├── settings.js    # 설정 API
│   │   └── users.js       # 사용자 API
│   └── uploads/           # 업로드된 파일
├── server.js              # 메인 서버 파일
├── package.json           # 프로젝트 의존성
├── update.sh              # 안전한 업데이트 스크립트
└── README.md              # 프로젝트 문서
```

## 🚀 배포 및 업데이트

### 초기 배포

1. **Google Cloud 설정**
   ```bash
   gcloud auth login
   gcloud config set project vibrant-abbey-464310-n2
   ```

2. **서버 생성 및 배포**
   ```bash
   ./deploy.sh
   ```

### 안전한 업데이트

**중요**: 데이터 손실을 방지하기 위해 반드시 안전한 업데이트 스크립트를 사용하세요.

1. **로컬에서 코드 수정 후 GitHub에 푸시**
   ```bash
   git add .
   git commit -m "업데이트 내용"
   git push origin main
   ```

2. **서버에서 안전한 업데이트 실행**
   ```bash
   gcloud compute ssh usual-saviors-instance --zone=us-central1-a
   cd /app
   chmod +x update.sh
   ./update.sh
   ```

### 업데이트 스크립트 기능

- ✅ **자동 백업**: 업데이트 전 데이터베이스 자동 백업
- ✅ **코드 동기화**: GitHub에서 최신 코드 자동 다운로드
- ✅ **의존성 업데이트**: npm 패키지 자동 업데이트
- ✅ **서버 재시작**: PM2를 통한 안전한 서버 재시작
- ✅ **상태 확인**: 업데이트 후 서버 상태 자동 확인

## 🔧 개발 환경 설정

### 로컬 개발

1. **의존성 설치**
   ```bash
   npm install
   ```

2. **서버 실행**
   ```bash
   npm start
   ```

3. **브라우저에서 확인**
   ```
   http://localhost:3000
   ```

### 환경 변수

- `PORT`: 서버 포트 (기본값: 3000)
- `NODE_ENV`: 환경 설정 (development/production)

## 📊 데이터베이스

### 스키마

- **users**: 사용자 정보
- **characters**: 캐릭터 정보
- **settings**: 세계관 설정
- **migrations**: 데이터베이스 마이그레이션 기록

### 백업

데이터베이스는 `/app/backups/` 디렉토리에 자동으로 백업됩니다:
- 파일명: `worldbuilding_YYYYMMDD_HHMMSS.db`
- 업데이트 시마다 자동 생성

## 🔒 보안

- JWT 토큰 기반 인증
- 비밀번호 bcrypt 해싱
- 파일 업로드 검증
- CORS 설정

## 🌐 접속 정보

- **프로덕션**: http://34.63.185.176:3000
- **API**: http://34.63.185.176:3000/api

## 📝 API 문서

### 캐릭터 API
- `GET /api/characters` - 캐릭터 목록 조회
- `POST /api/characters` - 캐릭터 생성
- `PUT /api/characters/:id` - 캐릭터 수정
- `DELETE /api/characters/:id` - 캐릭터 삭제

### 설정 API
- `GET /api/settings` - 설정 목록 조회
- `POST /api/settings` - 설정 생성
- `PUT /api/settings/:id` - 설정 수정
- `DELETE /api/settings/:id` - 설정 삭제

## 🐛 문제 해결

### 서버 재시작 시 데이터 손실
- ✅ 마이그레이션 시스템으로 해결
- ✅ 자동 백업 시스템으로 보호

### 업데이트 실패
1. 백업 파일 확인: `/app/backups/`
2. 서버 로그 확인: `pm2 logs`
3. 수동 복구: 백업 파일 복원

### API 연결 오류
- 방화벽 설정 확인
- 서버 상태 확인: `pm2 status`
- 포트 확인: `netstat -tlnp | grep 3000`

## 📞 지원

문제가 발생하면 다음을 확인하세요:
1. 서버 로그: `pm2 logs`
2. 데이터베이스 상태: 백업 파일 확인
3. 네트워크 연결: 방화벽 설정

---

**⚠️ 주의사항**: 데이터 손실을 방지하기 위해 항상 안전한 업데이트 스크립트를 사용하세요! 
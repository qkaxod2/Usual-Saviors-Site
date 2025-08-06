# Usual Saviors - 어반판타지 세계관 사이트

현대 사회의 이면에 숨겨진 신화적 존재들과 그들을 다루는 '평범한 구원자들'의 이야기를 담은 어반판타지 세계관 소개 사이트입니다.

## 🌟 주요 기능

### 캐릭터 관리 시스템
- 캐릭터 추가, 수정, 삭제
- 이미지 업로드 지원
- 이력서 형태의 캐릭터 프로필
- 사용자별 캐릭터 관리

### 설정 관리 시스템
- 세계관 설정 카드 추가/수정/삭제
- 카테고리별 설정 분류
- 상세 정보 및 아이콘 지원

### 사용자 인증 시스템
- 회원가입 및 로그인
- JWT 토큰 기반 인증
- 사용자별 데이터 분리

## 🛠️ 기술 스택

### 프론트엔드
- HTML5, CSS3, JavaScript (ES6+)
- Font Awesome (아이콘)
- Google Fonts (Noto Sans KR)

### 백엔드
- Node.js, Express.js
- SQLite (데이터베이스)
- JWT (인증)
- Multer (파일 업로드)
- bcryptjs (비밀번호 해싱)

## 📁 프로젝트 구조

```
worldbuilding-site/
├── public/                 # 프론트엔드 파일
│   ├── index.html         # 메인 페이지
│   ├── styles.css         # 스타일시트
│   └── script.js          # 클라이언트 스크립트
├── server/                # 백엔드 서버
│   ├── server.js          # 메인 서버 파일
│   ├── database.js        # 데이터베이스 설정
│   ├── package.json       # Node.js 의존성
│   ├── routes/            # API 라우트
│   │   ├── characters.js  # 캐릭터 API
│   │   ├── settings.js    # 설정 API
│   │   └── users.js       # 사용자 API
│   └── uploads/           # 업로드된 파일
├── Dockerfile             # Docker 설정
├── docker-compose.yml     # Docker Compose 설정
├── deploy.sh              # 배포 스크립트
└── README.md              # 프로젝트 문서
```

## 🚀 설치 및 실행

### 로컬 개발 환경

1. **Node.js 설치** (버전 16 이상)
   ```bash
   # Windows: https://nodejs.org/에서 다운로드
   # macOS: brew install node
   # Linux: sudo apt install nodejs npm
   ```

2. **프로젝트 클론**
   ```bash
   git clone https://github.com/qkaxod2/Usual-Saviors-Site.git
   cd Usual-Saviors-Site
   ```

3. **의존성 설치**
   ```bash
   cd server
   npm install
   ```

4. **서버 실행**
   ```bash
   npm start
   # 또는 Windows에서 start.bat 실행
   ```

5. **브라우저에서 접속**
   ```
   http://localhost:3000
   ```

### Docker를 사용한 실행

```bash
# Docker 이미지 빌드 및 실행
docker-compose up --build

# 백그라운드 실행
docker-compose up -d
```

## 🌐 배포

### Google Cloud Compute Engine 배포

1. **Google Cloud SDK 설치**
   ```bash
   # https://cloud.google.com/sdk/docs/install
   ```

2. **프로젝트 설정**
   ```bash
   gcloud auth login
   gcloud config set project YOUR_PROJECT_ID
   ```

3. **배포 스크립트 실행**
   ```bash
   # deploy.sh 파일에서 PROJECT_ID 수정 후
   chmod +x deploy.sh
   ./deploy.sh
   ```

### 수동 배포

1. **Compute Engine 인스턴스 생성**
   - 머신 타입: e2-micro (무료 티어)
   - OS: Debian 11
   - 방화벽: HTTP(80), HTTPS(443), Node.js(3000) 포트 허용

2. **서버 설정**
   ```bash
   # Node.js 설치
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs

   # 애플리케이션 클론
   git clone https://github.com/qkaxod2/Usual-Saviors-Site.git
   cd Usual-Saviors-Site/server
   npm install

   # PM2로 프로세스 관리
   npm install -g pm2
   pm2 start server.js --name "usual-saviors"
   pm2 startup
   pm2 save
   ```

## 📡 API 엔드포인트

### 인증
- `POST /api/users/register` - 회원가입
- `POST /api/users/login` - 로그인
- `GET /api/users/profile` - 사용자 정보

### 캐릭터
- `GET /api/characters` - 캐릭터 목록
- `GET /api/characters/:id` - 캐릭터 상세
- `POST /api/characters` - 캐릭터 생성
- `PUT /api/characters/:id` - 캐릭터 수정
- `DELETE /api/characters/:id` - 캐릭터 삭제

### 설정
- `GET /api/settings` - 설정 목록
- `GET /api/settings/:id` - 설정 상세
- `POST /api/settings` - 설정 생성
- `PUT /api/settings/:id` - 설정 수정
- `DELETE /api/settings/:id` - 설정 삭제

## 🔒 보안 기능

- JWT 토큰 기반 인증
- bcryptjs를 사용한 비밀번호 해싱
- CORS 설정으로 허용된 도메인만 접근 가능
- 파일 업로드 크기 제한 (5MB)
- 이미지 파일 타입 검증

## 💰 비용 최적화

### Google Cloud 무료 티어 활용
- Compute Engine: e2-micro 인스턴스 (월 744시간 무료)
- Cloud Storage: 5GB 무료
- Cloud SQL: 없음 (SQLite 사용으로 비용 절약)

### 비용 절약 팁
- e2-micro 인스턴스 사용
- SQLite 데이터베이스 사용
- 정적 파일은 서버에서 직접 제공
- 불필요한 서비스 비활성화

## 🔄 업데이트 및 유지보수

### 코드 업데이트
```bash
# 서버에 접속
gcloud compute ssh usual-saviors-instance --zone=us-central1-a

# 코드 업데이트
cd /app
git pull origin main
cd server
npm install
pm2 restart usual-saviors
```

### 데이터베이스 백업
```bash
# SQLite 데이터베이스 백업
cp /app/server/database.sqlite /app/backup/database_$(date +%Y%m%d).sqlite
```

## 🤝 기여하기

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다. 자세한 내용은 `LICENSE` 파일을 참조하세요.

## 📞 지원

문제가 발생하거나 질문이 있으시면 GitHub Issues를 통해 문의해주세요.

---

**Usual Saviors** - 평범한 구원자들의 이야기 🌟 
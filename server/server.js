const express = require('express');
const cors = require('cors');
const path = require('path');
const { initDatabase, insertDefaultData, runMigrations } = require('./database');

// 라우트 가져오기
const charactersRouter = require('./routes/characters');
const settingsRouter = require('./routes/settings');
const usersRouter = require('./routes/users');

const app = express();
const PORT = process.env.PORT || 3000;

// 미들웨어 설정
app.use(cors({
    origin: process.env.NODE_ENV === 'production' 
        ? ['https://your-domain.com'] // 실제 도메인으로 변경 필요
        : ['http://localhost:3000', 'http://localhost:8080'],
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 정적 파일 제공
app.use(express.static(path.join(__dirname, '../public')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API 라우트
app.use('/api/characters', charactersRouter);
app.use('/api/settings', settingsRouter);
app.use('/api/users', usersRouter);

// 메인 페이지
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/index.html'));
});

// API 상태 확인
app.get('/api/status', (req, res) => {
    res.json({ 
        status: 'OK', 
        message: 'Usual Saviors API is running',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development'
    });
});

// 404 처리
app.use('*', (req, res) => {
    res.status(404).json({ error: '요청한 리소스를 찾을 수 없습니다.' });
});

// 에러 핸들러
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: '서버 내부 오류가 발생했습니다.' });
});

// 서버 시작
app.listen(PORT, async () => {
    console.log(`🚀 Usual Saviors Server running on port ${PORT}`);
    console.log(`📁 Static files served from: ${path.join(__dirname, '../public')}`);
    console.log(`🔗 API available at: http://localhost:${PORT}/api`);
    console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
    
    try {
        // 데이터베이스 초기화
        await initDatabase();
        
        // 마이그레이션 실행 (중복 데이터 정리)
        await runMigrations();
        
        // 기본 데이터 삽입
        await insertDefaultData();
        
        console.log('✅ Server startup completed successfully');
    } catch (error) {
        console.error('❌ Error during server startup:', error);
    }
});

module.exports = app; 
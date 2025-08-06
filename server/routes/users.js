const express = require('express');
const router = express.Router();
const { db } = require('../database');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// 사용자 등록
router.post('/register', async (req, res) => {
    const { username, password } = req.body;
    
    if (!username || !password) {
        return res.status(400).json({ error: '사용자명과 비밀번호를 입력해주세요.' });
    }
    
    if (password.length < 6) {
        return res.status(400).json({ error: '비밀번호는 최소 6자 이상이어야 합니다.' });
    }
    
    try {
        // 비밀번호 해시화
        const hashedPassword = await bcrypt.hash(password, 10);
        
        // 사용자 생성
        db.run('INSERT INTO users (username, password) VALUES (?, ?)', 
            [username, hashedPassword], function(err) {
                if (err) {
                    if (err.message.includes('UNIQUE constraint failed')) {
                        return res.status(400).json({ error: '이미 존재하는 사용자명입니다.' });
                    }
                    return res.status(500).json({ error: err.message });
                }
                
                // JWT 토큰 생성
                const token = jwt.sign(
                    { userId: this.lastID, username },
                    JWT_SECRET,
                    { expiresIn: '24h' }
                );
                
                res.json({
                    message: '회원가입이 완료되었습니다.',
                    token,
                    user: {
                        id: this.lastID,
                        username
                    }
                });
            });
    } catch (error) {
        res.status(500).json({ error: '서버 오류가 발생했습니다.' });
    }
});

// 사용자 로그인
router.post('/login', (req, res) => {
    const { username, password } = req.body;
    
    if (!username || !password) {
        return res.status(400).json({ error: '사용자명과 비밀번호를 입력해주세요.' });
    }
    
    db.get('SELECT * FROM users WHERE username = ?', [username], async (err, user) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        
        if (!user) {
            return res.status(401).json({ error: '사용자명 또는 비밀번호가 올바르지 않습니다.' });
        }
        
        try {
            // 비밀번호 확인
            const isValidPassword = await bcrypt.compare(password, user.password);
            
            if (!isValidPassword) {
                return res.status(401).json({ error: '사용자명 또는 비밀번호가 올바르지 않습니다.' });
            }
            
            // JWT 토큰 생성
            const token = jwt.sign(
                { userId: user.id, username: user.username },
                JWT_SECRET,
                { expiresIn: '24h' }
            );
            
            res.json({
                message: '로그인이 완료되었습니다.',
                token,
                user: {
                    id: user.id,
                    username: user.username
                }
            });
        } catch (error) {
            res.status(500).json({ error: '서버 오류가 발생했습니다.' });
        }
    });
});

// 토큰 검증 미들웨어
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token) {
        return res.status(401).json({ error: '인증 토큰이 필요합니다.' });
    }
    
    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ error: '유효하지 않은 토큰입니다.' });
        }
        req.user = user;
        next();
    });
}

// 사용자 정보 조회
router.get('/profile', authenticateToken, (req, res) => {
    db.get('SELECT id, username, created_at FROM users WHERE id = ?', 
        [req.user.userId], (err, user) => {
            if (err) {
                return res.status(500).json({ error: err.message });
            }
            if (!user) {
                return res.status(404).json({ error: '사용자를 찾을 수 없습니다.' });
            }
            
            res.json(user);
        });
});

// 사용자별 캐릭터 수 조회
router.get('/characters/count', authenticateToken, (req, res) => {
    db.get('SELECT COUNT(*) as count FROM characters WHERE user_id = ?', 
        [req.user.userId], (err, result) => {
            if (err) {
                return res.status(500).json({ error: err.message });
            }
            
            res.json({ count: result.count });
        });
});

// 사용자별 설정 수 조회
router.get('/settings/count', authenticateToken, (req, res) => {
    db.get('SELECT COUNT(*) as count FROM settings WHERE user_id = ?', 
        [req.user.userId], (err, result) => {
            if (err) {
                return res.status(500).json({ error: err.message });
            }
            
            res.json({ count: result.count });
        });
});

module.exports = router; 
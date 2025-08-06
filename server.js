const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// 미들웨어 설정
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// 파일 업로드 설정
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadDir = 'uploads';
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir);
        }
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

const upload = multer({ storage: storage });

// 데이터베이스 초기화
const db = new sqlite3.Database('worldbuilding.db');

db.serialize(() => {
    // 사용자 테이블
    db.run(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // 캐릭터 테이블
    db.run(`CREATE TABLE IF NOT EXISTS characters (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        age INTEGER,
        gender TEXT,
        occupation TEXT,
        abilities TEXT,
        background TEXT,
        relationships TEXT,
        image_path TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // 설정 테이블
    db.run(`CREATE TABLE IF NOT EXISTS settings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        category TEXT NOT NULL,
        description TEXT,
        details TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // 기본 설정 데이터 삽입
    const defaultSettings = [
        { title: '각성', category: '마법', description: '인간이 각성하여 얻는 초자연적 능력' },
        { title: '이형', category: '마법', description: '각성자들이 사용하는 변신 능력' },
        { title: '신앙', category: '조직', description: '각성자들을 관리하는 비밀 조직' },
        { title: '사냥꾼', category: '조직', description: '이형들을 사냥하는 특수 부대' }
    ];

    const insertSetting = db.prepare('INSERT OR IGNORE INTO settings (title, category, description) VALUES (?, ?, ?)');
    defaultSettings.forEach(setting => {
        insertSetting.run(setting.title, setting.category, setting.description);
    });
    insertSetting.finalize();
});

// JWT 토큰 검증 미들웨어
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

// 사용자 인증 API
app.post('/api/auth/register', async (req, res) => {
    try {
        const { username, password } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);
        
        db.run('INSERT INTO users (username, password) VALUES (?, ?)', 
            [username, hashedPassword], 
            function(err) {
                if (err) {
                    if (err.message.includes('UNIQUE constraint failed')) {
                        return res.status(400).json({ error: '이미 존재하는 사용자명입니다.' });
                    }
                    return res.status(500).json({ error: '사용자 등록 실패' });
                }
                
                const token = jwt.sign({ id: this.lastID, username }, JWT_SECRET);
                res.json({ token, user: { id: this.lastID, username } });
            });
    } catch (error) {
        res.status(500).json({ error: '서버 오류' });
    }
});

app.post('/api/auth/login', (req, res) => {
    const { username, password } = req.body;
    
    db.get('SELECT * FROM users WHERE username = ?', [username], async (err, user) => {
        if (err) {
            return res.status(500).json({ error: '로그인 실패' });
        }
        
        if (!user) {
            return res.status(400).json({ error: '사용자를 찾을 수 없습니다.' });
        }
        
        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            return res.status(400).json({ error: '잘못된 비밀번호입니다.' });
        }
        
        const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET);
        res.json({ token, user: { id: user.id, username: user.username } });
    });
});

// 캐릭터 API
app.get('/api/characters', (req, res) => {
    db.all('SELECT * FROM characters ORDER BY created_at DESC', (err, characters) => {
        if (err) {
            return res.status(500).json({ error: '캐릭터 조회 실패' });
        }
        res.json(characters);
    });
});

app.post('/api/characters', upload.single('image'), (req, res) => {
    const { name, age, gender, occupation, abilities, background, relationships } = req.body;
    const imagePath = req.file ? req.file.path : null;
    
    db.run(`INSERT INTO characters (name, age, gender, occupation, abilities, background, relationships, image_path) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [name, age, gender, occupation, abilities, background, relationships, imagePath],
        function(err) {
            if (err) {
                return res.status(500).json({ error: '캐릭터 생성 실패' });
            }
            
            db.get('SELECT * FROM characters WHERE id = ?', [this.lastID], (err, character) => {
                if (err) {
                    return res.status(500).json({ error: '캐릭터 조회 실패' });
                }
                res.json(character);
            });
        });
});

app.put('/api/characters/:id', upload.single('image'), (req, res) => {
    const { id } = req.params;
    const { name, age, gender, occupation, abilities, background, relationships } = req.body;
    const imagePath = req.file ? req.file.path : null;
    
    let query = `UPDATE characters SET name = ?, age = ?, gender = ?, occupation = ?, 
                  abilities = ?, background = ?, relationships = ?, updated_at = CURRENT_TIMESTAMP`;
    let params = [name, age, gender, occupation, abilities, background, relationships];
    
    if (imagePath) {
        query += ', image_path = ?';
        params.push(imagePath);
    }
    
    query += ' WHERE id = ?';
    params.push(id);
    
    db.run(query, params, function(err) {
        if (err) {
            return res.status(500).json({ error: '캐릭터 수정 실패' });
        }
        
        if (this.changes === 0) {
            return res.status(404).json({ error: '캐릭터를 찾을 수 없습니다.' });
        }
        
        db.get('SELECT * FROM characters WHERE id = ?', [id], (err, character) => {
            if (err) {
                return res.status(500).json({ error: '캐릭터 조회 실패' });
            }
            res.json(character);
        });
    });
});

app.delete('/api/characters/:id', (req, res) => {
    const { id } = req.params;
    
    db.run('DELETE FROM characters WHERE id = ?', [id], function(err) {
        if (err) {
            return res.status(500).json({ error: '캐릭터 삭제 실패' });
        }
        
        if (this.changes === 0) {
            return res.status(404).json({ error: '캐릭터를 찾을 수 없습니다.' });
        }
        
        res.json({ message: '캐릭터가 삭제되었습니다.' });
    });
});

// 설정 API
app.get('/api/settings', (req, res) => {
    db.all('SELECT * FROM settings ORDER BY created_at DESC', (err, settings) => {
        if (err) {
            return res.status(500).json({ error: '설정 조회 실패' });
        }
        res.json(settings);
    });
});

app.post('/api/settings', (req, res) => {
    const { title, category, description, details } = req.body;
    
    db.run('INSERT INTO settings (title, category, description, details) VALUES (?, ?, ?, ?)',
        [title, category, description, details],
        function(err) {
            if (err) {
                return res.status(500).json({ error: '설정 생성 실패' });
            }
            
            db.get('SELECT * FROM settings WHERE id = ?', [this.lastID], (err, setting) => {
                if (err) {
                    return res.status(500).json({ error: '설정 조회 실패' });
                }
                res.json(setting);
            });
        });
});

app.put('/api/settings/:id', (req, res) => {
    const { id } = req.params;
    const { title, category, description, details } = req.body;
    
    db.run(`UPDATE settings SET title = ?, category = ?, description = ?, details = ?, 
            updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
        [title, category, description, details, id],
        function(err) {
            if (err) {
                return res.status(500).json({ error: '설정 수정 실패' });
            }
            
            if (this.changes === 0) {
                return res.status(404).json({ error: '설정을 찾을 수 없습니다.' });
            }
            
            db.get('SELECT * FROM settings WHERE id = ?', [id], (err, setting) => {
                if (err) {
                    return res.status(500).json({ error: '설정 조회 실패' });
                }
                res.json(setting);
            });
        });
});

app.delete('/api/settings/:id', (req, res) => {
    const { id } = req.params;
    
    db.run('DELETE FROM settings WHERE id = ?', [id], function(err) {
        if (err) {
            return res.status(500).json({ error: '설정 삭제 실패' });
        }
        
        if (this.changes === 0) {
            return res.status(404).json({ error: '설정을 찾을 수 없습니다.' });
        }
        
        res.json({ message: '설정이 삭제되었습니다.' });
    });
});

// 업로드된 파일 제공
app.use('/uploads', express.static('uploads'));

// 메인 페이지
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// 서버 시작
app.listen(PORT, () => {
    console.log(`🚀 Usual Saviors Server running on port ${PORT}`);
    console.log(`📁 Static files served from: ${path.join(__dirname, 'public')}`);
    console.log(`🔗 API available at: http://localhost:${PORT}/api`);
    console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
}); 
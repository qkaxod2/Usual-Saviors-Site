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

// 데이터베이스 마이그레이션 함수
function runMigrations(db) {
    return new Promise((resolve, reject) => {
        // 마이그레이션 테이블 생성
        db.run(`CREATE TABLE IF NOT EXISTS migrations (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            version TEXT NOT NULL,
            applied_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`, (err) => {
            if (err) {
                reject(err);
                return;
            }

            // 마이그레이션 실행
            const migrations = [
                {
                    version: '1.0.0',
                    sql: `CREATE TABLE IF NOT EXISTS users (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        username TEXT UNIQUE NOT NULL,
                        password TEXT NOT NULL,
                        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
                    )`
                },
                {
                    version: '1.0.1',
                    sql: `CREATE TABLE IF NOT EXISTS characters (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        name TEXT NOT NULL,
                        description TEXT,
                        details TEXT,
                        image_url TEXT,
                        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
                    )`
                },
                {
                    version: '1.0.2',
                    sql: `CREATE TABLE IF NOT EXISTS settings (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        title TEXT NOT NULL,
                        description TEXT,
                        details TEXT,
                        icon TEXT DEFAULT 'fas fa-cog',
                        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
                    )`
                }
            ];

            let completed = 0;
            migrations.forEach(migration => {
                db.get('SELECT version FROM migrations WHERE version = ?', [migration.version], (err, row) => {
                    if (err) {
                        reject(err);
                        return;
                    }

                    if (!row) {
                        // 마이그레이션 실행
                        db.run(migration.sql, (err) => {
                            if (err) {
                                reject(err);
                                return;
                            }

                            // 마이그레이션 기록
                            db.run('INSERT INTO migrations (version) VALUES (?)', [migration.version], (err) => {
                                if (err) {
                                    reject(err);
                                    return;
                                }
                                console.log(`✅ 마이그레이션 ${migration.version} 완료`);
                                completed++;
                                if (completed === migrations.length) {
                                    resolve();
                                }
                            });
                        });
                    } else {
                        console.log(`⏭️ 마이그레이션 ${migration.version} 이미 적용됨`);
                        completed++;
                        if (completed === migrations.length) {
                            resolve();
                        }
                    }
                });
            });
        });
    });
}

// 데이터베이스 초기화 함수
function initDatabase() {
    return new Promise((resolve, reject) => {
        const dbPath = path.join(__dirname, 'worldbuilding.db');
        console.log(`📁 데이터베이스 경로: ${dbPath}`);

        db = new sqlite3.Database(dbPath, (err) => {
            if (err) {
                console.error('❌ 데이터베이스 연결 실패:', err);
                reject(err);
                return;
            }
            console.log('✅ SQLite 데이터베이스에 연결되었습니다.');

            // 마이그레이션 실행
            runMigrations(db).then(() => {
                console.log('✅ 데이터베이스 마이그레이션 완료');
                resolve();
            }).catch(reject);
        });
    });
}

// 기본 데이터 삽입 함수 (개선됨)
function insertDefaultData() {
    return new Promise((resolve, reject) => {
        // 기본 설정 데이터 삽입 (한 번만 실행)
        db.get('SELECT COUNT(*) as count FROM settings', (err, result) => {
            if (err) {
                console.error('❌ 설정 개수 확인 실패:', err);
                reject(err);
                return;
            }

            if (result.count === 0) {
                console.log('📝 기본 설정 데이터 삽입 중...');
                const defaultSettings = [
                    {
                        title: '마법 체계',
                        description: '현실과 마법이 공존하는 세계의 마법 체계',
                        details: ['기본 마법: 현실의 법칙에서 벗어나는 기본 마법', '고급 마법: 마법사들이 사용하는 고급 마법', '생성 마법: 현실의 생성물로 만드는 마법', '기술 마법: 기술과 마법의 융합'],
                        icon: 'fas fa-magic'
                    },
                    {
                        title: '조직 체계',
                        description: '세계를 관리하는 다양한 조직들의 체계',
                        details: ['마법 조직: 마법사들을 관리하는 조직', '생성 관리: 생성물들을 관리하는 조직', '기본 관리: 기본 마법 사용자들의 관리', '마법 기술: 마법과 기술을 결합하는 조직'],
                        icon: 'fas fa-users-cog'
                    },
                    {
                        title: '현실 구조',
                        description: '현실과 마법이 공존하는 세계의 구조',
                        details: ['현실 마법: 현대인들이 사용하는 마법', '마법 구조: 마법사들이 활동하는 구조', '생성 역사: 생성물들의 역사', '마법 조직 관리: 마법 조직들의 관리 체계'],
                        icon: 'fas fa-city'
                    },
                    {
                        title: '위험 요소',
                        description: '세계를 위협하는 다양한 위험 요소들',
                        details: ['마법의 이탈: 마법이 통제를 벗어나는 현상', '생성의 오용: 생성 마법의 오용', '기본 위험: 기본 마법의 위험성', '세계 멸망: 전체 세계를 위협하는 위험'],
                        icon: 'fas fa-skull'
                    },
                    {
                        title: '기술',
                        description: '현대 기술과 마법이 결합된 기술 체계',
                        details: ['주요 기술: 현실에서 사용되는 주요 기술', '현대 기술: 현대적인 기술 체계', '고급 기술: 고급 기술의 활용', '마법 기술: 마법과 기술의 결합'],
                        icon: 'fas fa-microchip'
                    }
                ];

                const insertSetting = db.prepare('INSERT INTO settings (title, description, details, icon) VALUES (?, ?, ?, ?)');
                defaultSettings.forEach(setting => {
                    insertSetting.run(setting.title, setting.description, JSON.stringify(setting.details), setting.icon);
                });
                insertSetting.finalize();
                console.log('✅ 기본 설정 데이터가 삽입되었습니다.');
            } else {
                console.log('⏭️ 기본 설정 데이터가 이미 존재합니다.');
            }
            resolve();
        });
    });
}

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
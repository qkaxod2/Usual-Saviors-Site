const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath);

// 데이터베이스 초기화
function initDatabase() {
    return new Promise((resolve, reject) => {
        // 사용자 테이블
        db.run(`CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`, (err) => {
            if (err) {
                console.error('Error creating users table:', err);
                reject(err);
                return;
            }
            
            // 캐릭터 테이블
            db.run(`CREATE TABLE IF NOT EXISTS characters (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER,
                name TEXT NOT NULL,
                title TEXT,
                age TEXT,
                occupation TEXT,
                team TEXT,
                personality TEXT,
                background TEXT,
                abilities TEXT,
                relationships TEXT,
                image_url TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users (id)
            )`, (err) => {
                if (err) {
                    console.error('Error creating characters table:', err);
                    reject(err);
                    return;
                }
                
                // 설정 테이블 - title에 UNIQUE 제약조건 추가
                db.run(`CREATE TABLE IF NOT EXISTS settings (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    user_id INTEGER,
                    title TEXT UNIQUE NOT NULL,
                    description TEXT,
                    details TEXT,
                    icon TEXT DEFAULT 'fas fa-cog',
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (user_id) REFERENCES users (id)
                )`, (err) => {
                    if (err) {
                        console.error('Error creating settings table:', err);
                        reject(err);
                        return;
                    }
                    
                    console.log('Database initialized successfully');
                    resolve();
                });
            });
        });
    });
}

// 기본 데이터 삽입
function insertDefaultData() {
    return new Promise((resolve, reject) => {
        // 먼저 settings 테이블이 비어있는지 확인
        db.get("SELECT COUNT(*) as count FROM settings", (err, row) => {
            if (err) {
                console.error('Error checking settings count:', err);
                reject(err);
                return;
            }
            
            // 이미 데이터가 있으면 추가하지 않음
            if (row.count > 0) {
                console.log('Settings table already has data, skipping default data insertion');
                resolve();
                return;
            }
            
            // 기본 설정 데이터
            const defaultSettings = [
                {
                    title: '마법 체계',
                    description: '이형세계의 마법과 인간의 각성 능력에 대한 체계적인 설명',
                    details: JSON.stringify([
                        '신앙 마법: 인간의 믿음에서 비롯되는 신족의 힘',
                        '이형 마법: 이형들이 사용하는 초자연적 능력',
                        '각성 능력: 인간이 각성으로 얻는 특별한 힘',
                        '기술 마법: 현대 기술과 마법의 결합'
                    ]),
                    icon: 'fas fa-magic'
                },
                {
                    title: '기술',
                    description: '현실보다 한 단계 발전된 근미래 기술들',
                    details: JSON.stringify([
                        '양자 컴퓨터: 상용화된 고성능 컴퓨팅',
                        '상온 초전도체: 에너지 효율성 극대화',
                        '제한적 반중력: 일부 분야에서 활용',
                        '이형 기술: 이형세계의 기술과의 융합'
                    ]),
                    icon: 'fas fa-microchip'
                },
                {
                    title: '도시 구조',
                    description: '현실과 이형세계가 공존하는 도시의 구조',
                    details: JSON.stringify([
                        '표면 세계: 일반인들이 살아가는 평범한 도시',
                        '이형 구역: 이형들이 은밀히 활동하는 지역',
                        '각성자 거주지: 각성자들이 모여사는 특별 구역',
                        '이형사냥꾼 본부: 이형 관리 조직의 거점'
                    ]),
                    icon: 'fas fa-city'
                },
                {
                    title: '위협 요소',
                    description: '세계를 위협하는 다양한 위험 요소들',
                    details: JSON.stringify([
                        '이형의 침입: 이형세계에서 넘어오는 위협',
                        '각성자 남용: 각성 능력을 악용하는 자들',
                        '신앙 분쟁: 신족들 간의 경쟁과 갈등',
                        '세계 멸망: 대규모 재앙의 위험'
                    ]),
                    icon: 'fas fa-skull'
                },
                {
                    title: '조직들',
                    description: '세계의 균형을 유지하는 주요 조직들',
                    details: JSON.stringify([
                        '이형사냥꾼: 이형을 관리하는 전문 조직',
                        '각성자 연합: 각성자들의 자조 단체',
                        '신앙 관리국: 신앙 관련 정부 기관',
                        '이형 연구소: 이형과 마법을 연구하는 기관'
                    ]),
                    icon: 'fas fa-users-cog'
                }
            ];

            let completed = 0;
            const total = defaultSettings.length;

            if (total === 0) {
                console.log('Default data inserted successfully');
                resolve();
                return;
            }

            // 기본 설정 삽입 (user_id = null로 공용 데이터)
            defaultSettings.forEach(setting => {
                db.run(`INSERT OR IGNORE INTO settings (user_id, title, description, details, icon) 
                        VALUES (NULL, ?, ?, ?, ?)`,
                    [setting.title, setting.description, setting.details, setting.icon], (err) => {
                        if (err) {
                            console.error('Error inserting default setting:', err);
                            reject(err);
                            return;
                        }
                        
                        completed++;
                        if (completed === total) {
                            console.log('Default data inserted successfully');
                            resolve();
                        }
                    });
            });
        });
    });
}

// 마이그레이션 실행
function runMigrations() {
    return new Promise((resolve, reject) => {
        // 마이그레이션 테이블 생성
        db.run(`CREATE TABLE IF NOT EXISTS migrations (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            version TEXT UNIQUE NOT NULL,
            applied_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`, (err) => {
            if (err) {
                console.error('Error creating migrations table:', err);
                reject(err);
                return;
            }
            
            // 마이그레이션 1: 중복 설정 데이터 정리
            db.get("SELECT COUNT(*) as count FROM migrations WHERE version = 'v1_cleanup_duplicates'", (err, row) => {
                if (err) {
                    console.error('Error checking migration v1:', err);
                    reject(err);
                    return;
                }
                
                if (!row || row.count === 0) {
                    console.log('Running migration v1: Cleanup duplicate settings...');
                    
                    // 중복된 title을 가진 설정들을 정리 (가장 오래된 것만 유지)
                    db.run(`
                        DELETE FROM settings 
                        WHERE id NOT IN (
                            SELECT MIN(id) 
                            FROM settings 
                            GROUP BY title
                        )
                    `, (err) => {
                        if (err) {
                            console.error('Error running migration v1:', err);
                            reject(err);
                            return;
                        }
                        
                        // 마이그레이션 완료 기록
                        db.run("INSERT INTO migrations (version) VALUES (?)", ['v1_cleanup_duplicates'], (err) => {
                            if (err) {
                                console.error('Error recording migration v1:', err);
                                reject(err);
                                return;
                            }
                            
                            console.log('Migration v1 completed successfully');
                            resolve();
                        });
                    });
                } else {
                    console.log('Migration v1 already applied');
                    
                    // 마이그레이션 2: 캐릭터 테이블에 team 필드 추가
                    db.get("SELECT COUNT(*) as count FROM migrations WHERE version = 'v2_add_team_field'", (err, row) => {
                        if (err) {
                            console.error('Error checking migration v2:', err);
                            reject(err);
                            return;
                        }
                        
                        if (!row || row.count === 0) {
                            console.log('Running migration v2: Add team field to characters...');
                            
                            // team 필드가 있는지 확인하고 없으면 추가
                            db.run(`ALTER TABLE characters ADD COLUMN team TEXT`, (err) => {
                                if (err && !err.message.includes('duplicate column name')) {
                                    console.error('Error running migration v2:', err);
                                    reject(err);
                                    return;
                                }
                                
                                // 마이그레이션 완료 기록
                                db.run("INSERT INTO migrations (version) VALUES (?)", ['v2_add_team_field'], (err) => {
                                    if (err) {
                                        console.error('Error recording migration v2:', err);
                                        reject(err);
                                        return;
                                    }
                                    
                                    console.log('Migration v2 completed successfully');
                                    resolve();
                                });
                            });
                        } else {
                            console.log('Migration v2 already applied');
                            resolve();
                        }
                    });
                }
            });
        });
    });
}

module.exports = { db, initDatabase, insertDefaultData, runMigrations }; 
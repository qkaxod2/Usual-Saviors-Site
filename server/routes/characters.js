const express = require('express');
const router = express.Router();
const { db } = require('../database');
const multer = require('multer');
const path = require('path');

// 파일 업로드 설정
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, '../uploads/'));
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'character-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ 
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB 제한
    fileFilter: function (req, file, cb) {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('이미지 파일만 업로드 가능합니다.'), false);
        }
    }
});

// 모든 캐릭터 조회 (공용 + 사용자별)
router.get('/', (req, res) => {
    const userId = req.query.userId || null;
    
    let query = `
        SELECT * FROM characters 
        WHERE user_id IS NULL OR user_id = ?
        ORDER BY created_at DESC
    `;
    
    db.all(query, [userId], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        
        // JSON 문자열을 배열로 변환
        const characters = rows.map(row => ({
            ...row,
            abilities: row.abilities ? JSON.parse(row.abilities) : [],
            relationships: row.relationships ? JSON.parse(row.relationships) : []
        }));
        
        res.json(characters);
    });
});

// 특정 캐릭터 조회
router.get('/:id', (req, res) => {
    const { id } = req.params;
    
    db.get('SELECT * FROM characters WHERE id = ?', [id], (err, row) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (!row) {
            return res.status(404).json({ error: '캐릭터를 찾을 수 없습니다.' });
        }
        
        // JSON 문자열을 배열로 변환
        const character = {
            ...row,
            abilities: row.abilities ? JSON.parse(row.abilities) : [],
            relationships: row.relationships ? JSON.parse(row.relationships) : []
        };
        
        res.json(character);
    });
});

// 캐릭터 생성
router.post('/', upload.single('image'), (req, res) => {
    const {
        userId,
        name,
        title,
        age,
        occupation,
        personality,
        background,
        abilities,
        relationships
    } = req.body;
    
    const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;
    
    const query = `
        INSERT INTO characters (user_id, name, title, age, occupation, personality, background, abilities, relationships, image_url)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    db.run(query, [
        userId || null,
        name,
        title,
        age,
        occupation,
        personality,
        background,
        JSON.stringify(abilities ? abilities.split('\n').filter(a => a.trim()) : []),
        JSON.stringify(relationships ? relationships.split('\n').filter(r => r.trim()) : []),
        imageUrl
    ], function(err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        
        res.json({
            id: this.lastID,
            message: '캐릭터가 성공적으로 생성되었습니다.'
        });
    });
});

// 캐릭터 수정
router.put('/:id', upload.single('image'), (req, res) => {
    const { id } = req.params;
    const {
        name,
        title,
        age,
        occupation,
        personality,
        background,
        abilities,
        relationships
    } = req.body;
    
    const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;
    
    let query = `
        UPDATE characters 
        SET name = ?, title = ?, age = ?, occupation = ?, personality = ?, 
            background = ?, abilities = ?, relationships = ?
    `;
    let params = [
        name,
        title,
        age,
        occupation,
        personality,
        background,
        JSON.stringify(abilities ? abilities.split('\n').filter(a => a.trim()) : []),
        JSON.stringify(relationships ? relationships.split('\n').filter(r => r.trim()) : [])
    ];
    
    if (imageUrl) {
        query += ', image_url = ?';
        params.push(imageUrl);
    }
    
    query += ' WHERE id = ?';
    params.push(id);
    
    db.run(query, params, function(err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (this.changes === 0) {
            return res.status(404).json({ error: '캐릭터를 찾을 수 없습니다.' });
        }
        
        res.json({ message: '캐릭터가 성공적으로 수정되었습니다.' });
    });
});

// 캐릭터 삭제
router.delete('/:id', (req, res) => {
    const { id } = req.params;
    
    db.run('DELETE FROM characters WHERE id = ?', [id], function(err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (this.changes === 0) {
            return res.status(404).json({ error: '캐릭터를 찾을 수 없습니다.' });
        }
        
        res.json({ message: '캐릭터가 성공적으로 삭제되었습니다.' });
    });
});

module.exports = router; 
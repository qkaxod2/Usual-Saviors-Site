const express = require('express');
const router = express.Router();
const { db } = require('../database');

// 모든 설정 조회 (공용 + 사용자별)
router.get('/', (req, res) => {
    const userId = req.query.userId || null;
    
    let query = `
        SELECT * FROM settings 
        WHERE user_id IS NULL OR user_id = ?
        ORDER BY created_at DESC
    `;
    
    db.all(query, [userId], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        
        // JSON 문자열을 배열로 변환
        const settings = rows.map(row => ({
            ...row,
            details: row.details ? JSON.parse(row.details) : []
        }));
        
        res.json(settings);
    });
});

// 특정 설정 조회
router.get('/:id', (req, res) => {
    const { id } = req.params;
    
    db.get('SELECT * FROM settings WHERE id = ?', [id], (err, row) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (!row) {
            return res.status(404).json({ error: '설정을 찾을 수 없습니다.' });
        }
        
        // JSON 문자열을 배열로 변환
        const setting = {
            ...row,
            details: row.details ? JSON.parse(row.details) : []
        };
        
        res.json(setting);
    });
});

// 설정 생성
router.post('/', (req, res) => {
    const {
        userId,
        title,
        description,
        details,
        icon
    } = req.body;
    
    const query = `
        INSERT INTO settings (user_id, title, description, details, icon)
        VALUES (?, ?, ?, ?, ?)
    `;
    
    db.run(query, [
        userId || null,
        title,
        description,
        JSON.stringify(details ? details.split('\n').filter(d => d.trim()) : []),
        icon
    ], function(err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        
        res.json({
            id: this.lastID,
            message: '설정이 성공적으로 생성되었습니다.'
        });
    });
});

// 설정 수정
router.put('/:id', (req, res) => {
    const { id } = req.params;
    const {
        title,
        description,
        details,
        icon
    } = req.body;
    
    const query = `
        UPDATE settings 
        SET title = ?, description = ?, details = ?, icon = ?
        WHERE id = ?
    `;
    
    db.run(query, [
        title,
        description,
        JSON.stringify(details ? details.split('\n').filter(d => d.trim()) : []),
        icon,
        id
    ], function(err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (this.changes === 0) {
            return res.status(404).json({ error: '설정을 찾을 수 없습니다.' });
        }
        
        res.json({ message: '설정이 성공적으로 수정되었습니다.' });
    });
});

// 설정 삭제
router.delete('/:id', (req, res) => {
    const { id } = req.params;
    
    db.run('DELETE FROM settings WHERE id = ?', [id], function(err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (this.changes === 0) {
            return res.status(404).json({ error: '설정을 찾을 수 없습니다.' });
        }
        
        res.json({ message: '설정이 성공적으로 삭제되었습니다.' });
    });
});

module.exports = router; 
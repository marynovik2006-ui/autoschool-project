const express = require('express');
const router = express.Router();
const pool = require('../db');

// ============================================
// СОЗДАТЬ НОВОЕ ЗАНЯТИЕ (для инструктора или админа)
// ============================================
router.post('/', async (req, res) => {
    try {
        const { start_time, duration_min, instructor_id, car_id } = req.body;

        if (!start_time || !instructor_id) {
            return res.status(400).json({ message: 'Укажите время начала и ID инструктора' });
        }

        // Проверка: не занят ли уже этот инструктор или машина в это время?
        // (Для простоты проверяем только точное совпадение времени начала)
        const [existing] = await pool.query(
            'SELECT id FROM sessions WHERE start_time = ? AND instructor_id = ?',
            [start_time, instructor_id]
        );

        if (existing.length > 0) {
            return res.status(409).json({ message: 'У инструктора уже есть занятие на это время' });
        }

        const [result] = await pool.query(
            'INSERT INTO sessions (start_time, duration_min, instructor_id, car_id) VALUES (?, ?, ?, ?)',
            [start_time, duration_min || 90, instructor_id, car_id || null]
        );

        res.status(201).json({ 
            message: 'Занятие успешно создано', 
            sessionId: result.insertId 
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Ошибка при создании занятия' });
    }
});

// ============================================
// ПОЛУЧИТЬ СПИСОК ВСЕХ ЗАНЯТИЙ (свободных и занятых)
// ============================================
router.get('/', async (req, res) => {
    try {
        // Достаем занятия вместе с именами инструкторов и марками машин
        const [sessions] = await pool.query(`
            SELECT s.id, s.start_time, s.duration_min,
                   u.username AS instructor_name,
                   c.brand AS car_brand, c.plate_number AS car_plate
            FROM sessions s
            LEFT JOIN instructors i ON s.instructor_id = i.id
            LEFT JOIN users u ON i.user_id = u.id
            LEFT JOIN cars c ON s.car_id = c.id
            ORDER BY s.start_time
        `);

        res.json(sessions);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Ошибка при получении списка занятий' });
    }
});

module.exports = router;
const express = require('express');
const router = express.Router();
const pool = require('../db');

// ============================================
// ПОЛУЧИТЬ ЗАНЯТИЯ КОНКРЕТНОГО ИНСТРУКТОРА
// ============================================
// URL: GET /api/instructor/:instructorId/sessions
router.get('/:instructorId/sessions', async (req, res) => {
    try {
        const { instructorId } = req.params;

        const [sessions] = await pool.query(`
            SELECT s.id, s.start_time, s.duration_min, 
                   c.brand AS car_brand, c.plate_number AS car_plate
            FROM sessions s
            LEFT JOIN cars c ON s.car_id = c.id
            WHERE s.instructor_id = ?
            ORDER BY s.start_time
        `, [instructorId]);

        res.json(sessions);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Ошибка при получении занятий инструктора' });
    }
});

// ============================================
// ПОЛУЧИТЬ СПИСОК КУРСАНТОВ НА ЗАНЯТИИ
// ============================================
// URL: GET /api/instructor/sessions/:sessionId/students
router.get('/sessions/:sessionId/students', async (req, res) => {
    try {
        const { sessionId } = req.params;

        // Достаем записи (bookings) на это занятие вместе с именами курсантов
        const [students] = await pool.query(`
            SELECT b.id AS booking_id, b.status,
                   u.username AS student_name,
                   st.group_name,
                   g.grade, g.comment
            FROM bookings b
            JOIN students st ON b.student_id = st.id
            JOIN users u ON st.user_id = u.id
            LEFT JOIN grades g ON b.id = g.booking_id
            WHERE b.session_id = ? AND b.status != 'CANCELLED'
        `, [sessionId]);

        res.json(students);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Ошибка при получении списка курсантов' });
    }
});

// ============================================
// ВЫСТАВИТЬ ОЦЕНКУ И ЗАВЕРШИТЬ ЗАНЯТИЕ
// ============================================
// URL: POST /api/instructor/grades
router.post('/grades', async (req, res) => {
    const { booking_id, grade, comment } = req.body;

    if (!booking_id || !grade) {
        return res.status(400).json({ message: 'Укажите booking_id и оценку' });
    }

    const connection = await pool.getConnection();

    try {
        await connection.beginTransaction();

        // 1. Проверяем, существует ли такая запись
        const [bookingCheck] = await connection.query(
            'SELECT id, status FROM bookings WHERE id = ?',
            [booking_id]
        );

        if (bookingCheck.length === 0) {
            throw new Error('BOOKING_NOT_FOUND');
        }

        // 2. Добавляем оценку (или обновляем, если уже была)
        await connection.query(`
            INSERT INTO grades (booking_id, grade, comment) 
            VALUES (?, ?, ?) 
            ON DUPLICATE KEY UPDATE grade = ?, comment = ?
        `, [booking_id, grade, comment || null, grade, comment || null]);

        // 3. Меняем статус записи на COMPLETED
        await connection.query(
            'UPDATE bookings SET status = "COMPLETED" WHERE id = ?',
            [booking_id]
        );

        // 4. Обновляем счетчик часов у курсанта (добавляем 90 минут = 1.5 часа)
        // (Это опционально, но очень реалистично для автошколы)
        const [bookingData] = await connection.query(
            'SELECT student_id, session_id FROM bookings WHERE id = ?',
            [booking_id]
        );
        
        if (bookingData.length > 0) {
            const { student_id, session_id } = bookingData[0];
            const [sessionData] = await connection.query('SELECT duration_min FROM sessions WHERE id = ?', [session_id]);
            if (sessionData.length > 0) {
                const hoursToAdd = sessionData[0].duration_min / 60;
                await connection.query(
                    'UPDATE students SET hours_driven = hours_driven + ? WHERE id = ?',
                    [hoursToAdd, student_id]
                );
            }
        }

        await connection.commit();
        res.status(201).json({ message: 'Оценка выставлена, занятие завершено' });

    } catch (error) {
        await connection.rollback();
        if (error.message === 'BOOKING_NOT_FOUND') {
            return res.status(404).json({ message: 'Запись не найдена' });
        }
        console.error(error);
        res.status(500).json({ message: 'Ошибка при выставлении оценки' });
    } finally {
        connection.release();
    }
});

module.exports = router;
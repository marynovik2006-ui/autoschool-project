const express = require('express');
const router = express.Router();
const pool = require('../db');

// ============================================
// ЗАПИСАТЬСЯ НА ЗАНЯТИЕ (С ПРОВЕРКОЙ ЛИМИТА)
// ============================================
router.post('/', async (req, res) => {
    // В реальном приложении student_id мы бы брали из токена (кто вошел),
    // но пока для теста мы будем передавать его в body.
    const { session_id, student_id } = req.body;

    if (!session_id || !student_id) {
        return res.status(400).json({ message: 'Укажите session_id и student_id' });
    }

    const connection = await pool.getConnection();

    try {
        await connection.beginTransaction();

        // 1. ПРОВЕРКА: Существует ли курсант?
        const [studentCheck] = await connection.query(
            'SELECT id FROM students WHERE id = ?', 
            [student_id]
        );
        if (studentCheck.length === 0) {
            throw new Error('STUDENT_NOT_FOUND');
        }

        // 2. ПРОВЕРКА: Не занято ли уже это место (если на одно занятие только 1 человек)
        // В нашей логике на практическое занятие записывается 1 курсант к 1 инструктору.
        const [existingBooking] = await connection.query(
            'SELECT id FROM bookings WHERE session_id = ? AND status = "ACTIVE"',
            [session_id]
        );
        if (existingBooking.length > 0) {
            throw new Error('SESSION_ALREADY_BOOKED');
        }

                // 3. ПРОВЕРКА: Лимит занятий в неделю (не более 3)
        // Получаем дату занятия, на которое пытаемся записаться
        const [sessionInfo] = await connection.query(
            'SELECT start_time FROM sessions WHERE id = ?',
            [session_id]
        );

        if (sessionInfo.length === 0) {
            throw new Error('SESSION_NOT_FOUND');
        }

        const sessionDate = new Date(sessionInfo[0].start_time);
        // Вычисляем начало недели (понедельник) для этого занятия
        const dayOfWeek = sessionDate.getDay() === 0 ? 7 : sessionDate.getDay(); // Воскресенье = 7
        const startOfWeek = new Date(sessionDate);
        startOfWeek.setDate(sessionDate.getDate() - dayOfWeek + 1);
        startOfWeek.setHours(0, 0, 0, 0);
        
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6);
        endOfWeek.setHours(23, 59, 59, 999);

        // Считаем, сколько активных записей у курсанта на эту же неделю
        const [weeklyCount] = await connection.query(`
            SELECT COUNT(*) as count 
            FROM bookings b
            JOIN sessions s ON b.session_id = s.id
            WHERE b.student_id = ? 
              AND b.status = 'ACTIVE'
              AND s.start_time BETWEEN ? AND ?
        `, [student_id, startOfWeek, endOfWeek]);

        if (weeklyCount[0].count >= 3) {
            throw new Error('WEEKLY_LIMIT_EXCEEDED');
        }
        // 4. ПРОВЕРКА: Не записан ли он уже на это же время к другому инструктору?
        const [timeConflict] = await connection.query(`
            SELECT b.id 
            FROM bookings b
            JOIN sessions s1 ON b.session_id = s1.id
            JOIN sessions s2 ON s2.id = ?
            WHERE b.student_id = ? 
              AND b.status = 'ACTIVE'
              AND s1.start_time = s2.start_time
        `, [session_id, student_id]);
        
        if (timeConflict.length > 0) {
            throw new Error('TIME_CONFLICT');
        }

        // Если все проверки пройдены — создаем запись
        const [result] = await connection.query(
            'INSERT INTO bookings (session_id, student_id, status) VALUES (?, ?, "ACTIVE")',
            [session_id, student_id]
        );

        await connection.commit();

        res.status(201).json({ 
            message: 'Вы успешно записаны на занятие!', 
            bookingId: result.insertId 
        });

    } catch (error) {
        await connection.rollback();

        // Обрабатываем наши кастомные ошибки
        if (error.message === 'STUDENT_NOT_FOUND') {
            return res.status(404).json({ message: 'Курсант не найден' });
        }
        if (error.message === 'SESSION_ALREADY_BOOKED') {
            return res.status(409).json({ message: 'На это занятие уже кто-то записан' });
        }
        if (error.message === 'WEEKLY_LIMIT_EXCEEDED') {
            return res.status(429).json({ message: 'Превышен лимит: не более 3 занятий в неделю' });
        }
        if (error.message === 'TIME_CONFLICT') {
            return res.status(409).json({ message: 'У вас уже есть занятие на это время' });
        }
        if (error.message === 'SESSION_NOT_FOUND') {
            return res.status(404).json({ message: 'Занятие не найдено' });
        }

        console.error(error);
        res.status(500).json({ message: 'Ошибка сервера при записи' });
    } finally {
        connection.release();
    }
});

// ============================================
// ПОЛУЧИТЬ ВСЕ ЗАПИСИ КУРСАНТА (Мои билеты)
// ============================================
router.get('/student/:studentId', async (req, res) => {
    try {
        const { studentId } = req.params;
        
        const [bookings] = await pool.query(`
            SELECT b.id, b.status, b.booked_at,
                   s.start_time, s.duration_min,
                   u.username AS instructor_name,
                   c.brand AS car_brand
            FROM bookings b
            JOIN sessions s ON b.session_id = s.id
            JOIN instructors i ON s.instructor_id = i.id
            JOIN users u ON i.user_id = u.id
            LEFT JOIN cars c ON s.car_id = c.id
            WHERE b.student_id = ?
            ORDER BY s.start_time
        `, [studentId]);

        res.json(bookings);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Ошибка при получении записей' });
    }
});

// ============================================
// ОТМЕНИТЬ ЗАПИСЬ (с проверкой правила "2 часа")
// ============================================
router.put('/:id/cancel', async (req, res) => {
    try {
        const { id } = req.params; // ID записи (booking_id)

        // 1. Получаем информацию о записи и времени начала занятия
        const [bookings] = await pool.query(`
            SELECT b.id, b.status, s.start_time 
            FROM bookings b
            JOIN sessions s ON b.session_id = s.id
            WHERE b.id = ?
        `, [id]);

        if (bookings.length === 0) {
            return res.status(404).json({ message: 'Запись не найдена' });
        }

        const booking = bookings[0];

        if (booking.status === 'CANCELLED') {
            return res.status(400).json({ message: 'Запись уже отменена' });
        }

        // 2. Проверяем, сколько времени осталось до занятия
        const now = new Date();
        const startTime = new Date(booking.start_time);
        const diffHours = (startTime - now) / (1000 * 60 * 60); // разница в часах

        if (diffHours < 2) {
            return res.status(400).json({ 
                message: 'Отмена невозможна: до начала занятия осталось менее 2 часов' 
            });
        }

        // 3. Если всё ок — меняем статус на CANCELLED
        await pool.query(
            'UPDATE bookings SET status = "CANCELLED" WHERE id = ?',
            [id]
        );

        res.json({ message: 'Запись успешно отменена' });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Ошибка сервера при отмене записи' });
    }
});

module.exports = router;
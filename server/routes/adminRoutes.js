const express = require('express');
const router = express.Router();
const pool = require('../db');

// Маршрут для создания нового пользователя (курсанта или инструктора)
router.post('/create-user', async (req, res) => {
    // Получаем данные из тела запроса
    const { username, password, email, phone, role, 
            // Поля для курсанта
            group_name, contract_number, 
            // Поля для инструктора
            categories, experience_years } = req.body;

    // Проверка на обязательные поля
    if (!username || !password || !email || !role) {
        return res.status(400).json({ message: 'Заполните обязательные поля: username, password, email, role' });
    }

    if (role !== 'STUDENT' && role !== 'INSTRUCTOR' && role !== 'ADMIN') {
        return res.status(400).json({ message: 'Неверная роль. Допустимо: STUDENT, INSTRUCTOR, ADMIN' });
    }

    const connection = await pool.getConnection(); // Для транзакции

    try {
        await connection.beginTransaction();

        // 1. Создаем пользователя в таблице users
        const [userResult] = await connection.query(
            'INSERT INTO users (username, password_hash, email, phone, role) VALUES (?, ?, ?, ?, ?)',
            [username, password, email, phone || null, role]
        );

        const newUserId = userResult.insertId;

        // 2. Если это курсант, создаем запись в students
        if (role === 'STUDENT') {
            await connection.query(
                'INSERT INTO students (user_id, group_name, contract_number) VALUES (?, ?, ?)',
                [newUserId, group_name || null, contract_number || null]
            );
        }

        // 3. Если это инструктор, создаем запись в instructors
        if (role === 'INSTRUCTOR') {
            await connection.query(
                'INSERT INTO instructors (user_id, categories, experience_years) VALUES (?, ?, ?)',
                [newUserId, categories || null, experience_years || 0]
            );
        }

        // Если всё успешно — фиксируем изменения в БД
        await connection.commit();

        res.status(201).json({ 
            message: `Пользователь ${username} успешно создан с ролью ${role}`,
            userId: newUserId 
        });

    } catch (error) {
        // Если произошла ошибка (например, такой username уже есть) — откатываем всё назад
        await connection.rollback();
        
        // Обработка ошибки уникальности (дубликат username или email)
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ message: 'Пользователь с таким логином или email уже существует' });
        }
        
        console.error(error);
        res.status(500).json({ message: 'Ошибка сервера при создании пользователя' });
    } finally {
        connection.release(); // Возвращаем соединение в пул
    }
});

// ============================================
// ПОЛУЧИТЬ СПИСОК ВСЕХ ПОЛЬЗОВАТЕЛЕЙ
// ============================================
router.get('/users', async (req, res) => {
    try {
        // Получаем пользователей вместе с их профилями (JOIN)
        const [users] = await pool.query(`
            SELECT u.id, u.username, u.email, u.phone, u.role, u.is_blocked, u.created_at,
                   s.group_name, s.contract_number,
                   i.categories, i.experience_years
            FROM users u
            LEFT JOIN students s ON u.id = s.user_id
            LEFT JOIN instructors i ON u.id = i.user_id
            ORDER BY u.id
        `);
        res.json(users);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Ошибка при получении списка пользователей' });
    }
});

// ============================================
// ЗАБЛОКИРОВАТЬ / РАЗБЛОКИРОВАТЬ ПОЛЬЗОВАТЕЛЯ
// ============================================
router.put('/users/:id/block', async (req, res) => {
    try {
        const { id } = req.params;
        const { is_blocked } = req.body; // true или false

        // Не даем заблокировать самого себя (опционально, но полезно)
        // Для простоты пока просто обновляем статус
        
        await pool.query(
            'UPDATE users SET is_blocked = ? WHERE id = ?',
            [is_blocked ? 1 : 0, id]
        );

        res.json({ message: `Пользователь ${is_blocked ? 'заблокирован' : 'разблокирован'}` });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Ошибка при изменении статуса пользователя' });
    }
});

// ============================================
// СОЗДАТЬ НОВЫЙ АВТОМОБИЛЬ
// ============================================
router.post('/cars', async (req, res) => {
    try {
        const { brand, plate_number, transmission, instructor_id } = req.body;

        if (!brand || !plate_number || !transmission) {
            return res.status(400).json({ message: 'Заполните марку, госномер и тип КПП' });
        }

        const [result] = await pool.query(
            'INSERT INTO cars (brand, plate_number, transmission, instructor_id) VALUES (?, ?, ?, ?)',
            [brand, plate_number, transmission, instructor_id || null]
        );

        res.status(201).json({ 
            message: 'Автомобиль успешно добавлен', 
            carId: result.insertId 
        });
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ message: 'Автомобиль с таким госномером уже существует' });
        }
        console.error(error);
        res.status(500).json({ message: 'Ошибка при добавлении автомобиля' });
    }
});

module.exports = router;
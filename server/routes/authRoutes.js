const express = require('express');
const router = express.Router();
const pool = require('../db');

router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        // Ищем пользователя и сразу присоединяем данные о студенте или инструкторе
        const [users] = await pool.query(`
            SELECT u.*, 
                   s.id AS student_id, 
                   i.id AS instructor_id
            FROM users u
            LEFT JOIN students s ON u.id = s.user_id
            LEFT JOIN instructors i ON u.id = i.user_id
            WHERE u.username = ?
        `, [username]);

        if (users.length === 0) {
            return res.status(401).json({ message: 'Неверный логин или пароль' });
        }

        const user = users[0];

        if (password !== user.password_hash) {
            return res.status(401).json({ message: 'Неверный логин или пароль' });
        }

        if (user.is_blocked) {
            return res.status(403).json({ message: 'Ваш аккаунт заблокирован администратором' });
        }

        // Убираем пароль из ответа
        const { password_hash, ...userData } = user;
        
        res.json({ 
            message: 'Успешный вход', 
            user: userData 
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Ошибка сервера' });
    }
});

module.exports = router;
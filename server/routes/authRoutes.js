const express = require('express');
const router = express.Router();
const pool = require('../db');

router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        const [users] = await pool.query(
            'SELECT * FROM users WHERE username = ?', 
            [username]
        );

        if (users.length === 0) {
            return res.status(401).json({ message: 'Неверный логин или пароль' });
        }

        const user = users[0];

        // Простое сравнение пароля (для учебного проекта)
        if (password !== user.password_hash) {
            return res.status(401).json({ message: 'Неверный логин или пароль' });
        }

        // Если пользователь заблокирован
        if (user.is_blocked) {
            return res.status(403).json({ message: 'Ваш аккаунт заблокирован администратором' });
        }

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
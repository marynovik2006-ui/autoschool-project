const express = require('express');
const router = express.Router();
const pool = require('../db');
const bcrypt = require('bcrypt');

// Обновление профиля (email, телефон, пароль)
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { email, phone, newPassword } = req.body;

        // 1. Обновляем email и телефон
        await pool.query(
            'UPDATE users SET email = ?, phone = ? WHERE id = ?',
            [email, phone || null, id]
        );

        // 2. Если пользователь ввел новый пароль — хешируем и обновляем
        if (newPassword && newPassword.trim() !== '') {
            const saltRounds = 10;
            const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
            
            await pool.query(
                'UPDATE users SET password_hash = ? WHERE id = ?',
                [hashedPassword, id]
            );
        }

        // 3. Возвращаем обновленные данные (без пароля)
        const [updatedUser] = await pool.query(
            'SELECT id, username, email, phone, role, avatar_url FROM users WHERE id = ?',
            [id]
        );

        res.json({ message: 'Профиль обновлен', user: updatedUser[0] });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Ошибка при обновлении профиля' });
    }
});

module.exports = router;
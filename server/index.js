const express = require('express');
const cors = require('cors');
const pool = require('./db');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json()); // Чтобы сервер понимал JSON в запросах

// Тестовый маршрут
app.get('/', (req, res) => {
    res.send('Сервер автошколы успешно работает!');
});

// Проверка подключения к БД при старте
app.get('/api/test-db', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT NOW() as time');
        res.json({ message: 'БД подключена!', time: rows[0].time });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Ошибка подключения к БД' });
    }
});

// Запуск сервера
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Сервер запущен на порту ${PORT}`);
});
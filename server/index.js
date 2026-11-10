const express = require('express');
const cors = require('cors');
const pool = require('./db');
require('dotenv').config();

// Импортируем маршруты
const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');
const sessionRoutes = require('./routes/sessionRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const instructorRoutes = require('./routes/instructorRoutes');

const app = express();

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.send('Сервер автошколы успешно работает!');
});

// Подключаем маршруты авторизации
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/sessions', sessionRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/instructor', instructorRoutes);



// Проверка БД
app.get('/api/test-db', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT NOW() as time');
        res.json({ message: 'БД подключена!', time: rows[0].time });
    } catch (error) {
        res.status(500).json({ error: 'Ошибка подключения к БД' });
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Сервер запущен на порту ${PORT}`);
});
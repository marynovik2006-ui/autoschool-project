const express = require('express');
const cors = require('cors');
const path = require('path');
const pool = require('./db');
require('dotenv').config();


// Импортируем маршруты
const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');
const sessionRoutes = require('./routes/sessionRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const instructorRoutes = require('./routes/instructorRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const profileRoutes = require('./routes/profileRoutes');

const app = express();

app.use(cors());
// Раздача статических файлов (чтобы мы могли видеть загруженные картинки)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
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
app.use('/api/upload', uploadRoutes);
app.use('/api/profile', profileRoutes);



// Проверка БД
app.get('/api/test-db', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT NOW() as time');
        res.json({ message: 'БД подключена!', time: rows[0].time });
    } catch (error) {
        res.status(500).json({ error: 'Ошибка подключения к БД' });
    }
});

// ВРЕМЕННЫЙ КОД ДЛЯ ГЕНЕРАЦИИ ХЕШЕЙ
const bcrypt = require('bcrypt');
app.get('/generate-hashes', async (req, res) => {
    const adminHash = await bcrypt.hash('admin123', 10);
    const studentHash = await bcrypt.hash('student123', 10);
    const instructorHash = await bcrypt.hash('instructor123', 10);
    res.json({ adminHash, studentHash, instructorHash });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Сервер запущен на порту ${PORT}`);
});
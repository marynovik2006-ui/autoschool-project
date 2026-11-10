const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const pool = require('../db');

// Настройка хранения файлов
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    // Уникальное имя: user_id + timestamp + расширение
    const ext = path.extname(file.originalname);
    cb(null, `user_${req.params.id}_${Date.now()}${ext}`);
  }
});

const upload = multer({ storage });

// Маршрут для загрузки аватара
router.post('/:id/avatar', upload.single('avatar'), async (req, res) => {
  try {
    const { id } = req.params;
    if (!req.file) {
      return res.status(400).json({ message: 'Файл не загружен' });
    }

    // Путь к файлу, который мы будем отдавать клиенту
    const avatarUrl = `/uploads/${req.file.filename}`;

    // Обновляем пользователя в БД
    await pool.query(
      'UPDATE users SET avatar_url = ? WHERE id = ?',
      [avatarUrl, id]
    );

    res.json({ message: 'Аватар обновлен', avatar_url: avatarUrl });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Ошибка при загрузке аватара' });
  }
});

// ============================================
// ЗАГРУЗКА ФОТО ДЛЯ МАШИНЫ
// ============================================
const carStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `car_${req.params.id}_${Date.now()}${ext}`);
  }
});

const uploadCar = multer({ storage: carStorage });

router.post('/cars/:id/photo', uploadCar.single('photo'), async (req, res) => {
  try {
    const { id } = req.params;
    if (!req.file) {
      return res.status(400).json({ message: 'Файл не загружен' });
    }

    const photoUrl = `/uploads/${req.file.filename}`;

    await pool.query(
      'UPDATE cars SET photo_url = ? WHERE id = ?',
      [photoUrl, id]
    );

    res.json({ message: 'Фото машины обновлено', photo_url: photoUrl });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Ошибка при загрузке фото' });
  }
});

module.exports = router;
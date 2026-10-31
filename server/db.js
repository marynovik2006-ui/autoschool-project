const mysql = require('mysql2');
require('dotenv').config();

// Создаем пул подключений (это лучше, чем одно подключение)
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Используем промисы, чтобы можно было писать async/await
const promisePool = pool.promise();

module.exports = promisePool;
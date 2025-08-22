// src/config/db.js

const mysql = require('mysql2/promise');

// Create a connection pool instead of a single connection for better performance
const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

pool.getConnection()
    .then(conn => {
        console.log('Connected to the MySQL database!');
        conn.release(); // release the connection back to the pool
    })
    .catch(err => {
        console.error('Failed to connect to MySQL:', err);
    });

// We export the entire pool. The query method can be called directly on it.
module.exports = pool;

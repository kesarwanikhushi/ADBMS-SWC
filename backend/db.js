// db.js - PostgreSQL Connection Pool (node-postgres)
const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    // Provide a default empty object just in case to prevent crashes if env var is missing during dev
    // Or you can keep the explicit fields as fallbacks
    ...(process.env.DATABASE_URL ? {} : {
        host     : process.env.DB_HOST     || 'localhost',
        port     : process.env.DB_PORT     || 5432,
        user     : process.env.DB_USER     || 'postgres',
        password : process.env.DB_PASSWORD || 'your_password_here',
        database : process.env.DB_NAME     || 'college_erp'
    })
});

// Test connection on startup
pool.connect((err, client, release) => {
    if (err) {
        console.error('PostgreSQL connection error:', err.message);
    } else {
        console.log('  Connected to PostgreSQL database: college_erp');
        release();
    }
});

module.exports = pool;

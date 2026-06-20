// server.js - Main Express Server
require('dotenv').config();
const express = require('express');
const cors    = require('cors');
const path    = require('path');

const app = express();

// -------------------------------------------------------
// Middleware
// -------------------------------------------------------
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static frontend files
app.use(express.static(path.join(__dirname, '..', 'frontend')));

// -------------------------------------------------------
// API Routes
// -------------------------------------------------------
app.use('/api/departments', require('./routes/departments'));
app.use('/api/students',    require('./routes/students'));
app.use('/api/faculty',     require('./routes/faculty'));
app.use('/api/courses',     require('./routes/courses'));
app.use('/api/attendance',  require('./routes/attendance'));
app.use('/api/fees',        require('./routes/fees'));

// -------------------------------------------------------
// Fallback: serve index.html for all non-API routes
// -------------------------------------------------------
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'frontend', 'index.html'));
});

// -------------------------------------------------------
// Start Server
// -------------------------------------------------------
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`\n  College ERP Server running at http://localhost:${PORT}\n`);
});

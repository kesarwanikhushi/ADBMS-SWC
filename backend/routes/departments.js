// routes/departments.js - Department Routes (PostgreSQL)
const express = require('express');
const router  = express.Router();
const db      = require('../db');

// GET all departments
router.get('/', async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM "Department" ORDER BY "DeptName"');
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;

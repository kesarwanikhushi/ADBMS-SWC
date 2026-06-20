// routes/faculty.js - Faculty CRUD Routes (PostgreSQL)
const express = require('express');
const router  = express.Router();
const db      = require('../db');

// GET all faculty (with department name)
router.get('/', async (req, res) => {
    try {
        const result = await db.query(`
            SELECT f."FacultyID", f."Name", f."Email", d."DeptName", f."DeptID"
            FROM "Faculty" f
            JOIN "Department" d ON f."DeptID" = d."DeptID"
            ORDER BY f."FacultyID"
        `);
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET single faculty
router.get('/:id', async (req, res) => {
    try {
        const result = await db.query(
            'SELECT * FROM "Faculty" WHERE "FacultyID" = $1',
            [req.params.id]
        );
        if (result.rows.length === 0) return res.status(404).json({ error: 'Faculty not found' });
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST - Add faculty
router.post('/', async (req, res) => {
    const { Name, Email, DeptID } = req.body;
    if (!Name || !Email || !DeptID) {
        return res.status(400).json({ error: 'Name, Email, and DeptID are required' });
    }
    try {
        const result = await db.query(
            `INSERT INTO "Faculty" ("Name", "Email", "DeptID")
             VALUES ($1, $2, $3) RETURNING "FacultyID"`,
            [Name, Email, DeptID]
        );
        res.status(201).json({
            message: 'Faculty added successfully',
            FacultyID: result.rows[0].FacultyID
        });
    } catch (err) {
        if (err.code === '23505') {
            return res.status(409).json({ error: 'Email already exists' });
        }
        res.status(500).json({ error: err.message });
    }
});

// PUT - Update faculty
router.put('/:id', async (req, res) => {
    const { Name, Email, DeptID } = req.body;
    if (!Name || !Email || !DeptID) {
        return res.status(400).json({ error: 'Name, Email, and DeptID are required' });
    }
    try {
        const result = await db.query(
            `UPDATE "Faculty"
             SET "Name"=$1, "Email"=$2, "DeptID"=$3
             WHERE "FacultyID"=$4`,
            [Name, Email, DeptID, req.params.id]
        );
        if (result.rowCount === 0) return res.status(404).json({ error: 'Faculty not found' });
        res.json({ message: 'Faculty updated successfully' });
    } catch (err) {
        if (err.code === '23505') {
            return res.status(409).json({ error: 'Email already exists' });
        }
        res.status(500).json({ error: err.message });
    }
});

// DELETE - Remove faculty
router.delete('/:id', async (req, res) => {
    try {
        const result = await db.query(
            'DELETE FROM "Faculty" WHERE "FacultyID" = $1',
            [req.params.id]
        );
        if (result.rowCount === 0) return res.status(404).json({ error: 'Faculty not found' });
        res.json({ message: 'Faculty deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;

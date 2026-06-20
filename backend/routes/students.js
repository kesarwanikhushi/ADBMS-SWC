// routes/students.js - Student CRUD Routes (PostgreSQL)
// Key PostgreSQL differences from MySQL:
//   - Placeholders: $1, $2, $3 ... (not ?)
//   - Results: result.rows (array), result.rowCount (affected rows)
//   - INSERT uses RETURNING to get the new ID
//   - Duplicate key error code: '23505' (not 'ER_DUP_ENTRY')

const express = require('express');
const router  = express.Router();
const db      = require('../db');

// GET all students (with department name)
router.get('/', async (req, res) => {
    try {
        const result = await db.query(`
            SELECT s."StudentID", s."Name", s."Email", s."Phone", s."Semester",
                   d."DeptName", s."DeptID"
            FROM "Student" s
            JOIN "Department" d ON s."DeptID" = d."DeptID"
            ORDER BY s."StudentID"
        `);
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET single student
router.get('/:id', async (req, res) => {
    try {
        const result = await db.query(
            'SELECT * FROM "Student" WHERE "StudentID" = $1',
            [req.params.id]
        );
        if (result.rows.length === 0) return res.status(404).json({ error: 'Student not found' });
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST - Add new student
router.post('/', async (req, res) => {
    const { Name, Email, Phone, Semester, DeptID } = req.body;
    if (!Name || !Email || !Semester || !DeptID) {
        return res.status(400).json({ error: 'Name, Email, Semester, and DeptID are required' });
    }
    try {
        const result = await db.query(
            `INSERT INTO "Student" ("Name", "Email", "Phone", "Semester", "DeptID")
             VALUES ($1, $2, $3, $4, $5) RETURNING "StudentID"`,
            [Name, Email, Phone || null, Semester, DeptID]
        );
        res.status(201).json({
            message: 'Student added successfully',
            StudentID: result.rows[0].StudentID
        });
    } catch (err) {
        if (err.code === '23505') {
            return res.status(409).json({ error: 'Email already exists' });
        }
        res.status(500).json({ error: err.message });
    }
});

// PUT - Update student
router.put('/:id', async (req, res) => {
    const { Name, Email, Phone, Semester, DeptID } = req.body;
    if (!Name || !Email || !Semester || !DeptID) {
        return res.status(400).json({ error: 'Name, Email, Semester, and DeptID are required' });
    }
    try {
        const result = await db.query(
            `UPDATE "Student"
             SET "Name"=$1, "Email"=$2, "Phone"=$3, "Semester"=$4, "DeptID"=$5
             WHERE "StudentID"=$6`,
            [Name, Email, Phone || null, Semester, DeptID, req.params.id]
        );
        if (result.rowCount === 0) return res.status(404).json({ error: 'Student not found' });
        res.json({ message: 'Student updated successfully' });
    } catch (err) {
        if (err.code === '23505') {
            return res.status(409).json({ error: 'Email already exists' });
        }
        res.status(500).json({ error: err.message });
    }
});

// DELETE - Remove student
router.delete('/:id', async (req, res) => {
    try {
        const result = await db.query(
            'DELETE FROM "Student" WHERE "StudentID" = $1',
            [req.params.id]
        );
        if (result.rowCount === 0) return res.status(404).json({ error: 'Student not found' });
        res.json({ message: 'Student deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;

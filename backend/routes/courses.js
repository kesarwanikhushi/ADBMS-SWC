// routes/courses.js - Course CRUD Routes (PostgreSQL)
const express = require('express');
const router  = express.Router();
const db      = require('../db');

// GET all courses (with faculty name)
router.get('/', async (req, res) => {
    try {
        const result = await db.query(`
            SELECT c."CourseID", c."CourseName", c."Credits",
                   f."Name" AS "FacultyName", c."FacultyID"
            FROM "Course" c
            LEFT JOIN "Faculty" f ON c."FacultyID" = f."FacultyID"
            ORDER BY c."CourseID"
        `);
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET single course
router.get('/:id', async (req, res) => {
    try {
        const result = await db.query(
            'SELECT * FROM "Course" WHERE "CourseID" = $1',
            [req.params.id]
        );
        if (result.rows.length === 0) return res.status(404).json({ error: 'Course not found' });
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST - Add course
router.post('/', async (req, res) => {
    const { CourseName, Credits, FacultyID } = req.body;
    if (!CourseName || !Credits) {
        return res.status(400).json({ error: 'CourseName and Credits are required' });
    }
    try {
        const result = await db.query(
            `INSERT INTO "Course" ("CourseName", "Credits", "FacultyID")
             VALUES ($1, $2, $3) RETURNING "CourseID"`,
            [CourseName, Credits, FacultyID || null]
        );
        res.status(201).json({
            message: 'Course added successfully',
            CourseID: result.rows[0].CourseID
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// PUT - Update course
router.put('/:id', async (req, res) => {
    const { CourseName, Credits, FacultyID } = req.body;
    if (!CourseName || !Credits) {
        return res.status(400).json({ error: 'CourseName and Credits are required' });
    }
    try {
        const result = await db.query(
            `UPDATE "Course"
             SET "CourseName"=$1, "Credits"=$2, "FacultyID"=$3
             WHERE "CourseID"=$4`,
            [CourseName, Credits, FacultyID || null, req.params.id]
        );
        if (result.rowCount === 0) return res.status(404).json({ error: 'Course not found' });
        res.json({ message: 'Course updated successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// DELETE - Remove course
router.delete('/:id', async (req, res) => {
    try {
        const result = await db.query(
            'DELETE FROM "Course" WHERE "CourseID" = $1',
            [req.params.id]
        );
        if (result.rowCount === 0) return res.status(404).json({ error: 'Course not found' });
        res.json({ message: 'Course deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;

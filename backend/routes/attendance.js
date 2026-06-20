// routes/attendance.js - Attendance Routes (PostgreSQL)
const express = require('express');
const router  = express.Router();
const db      = require('../db');

// GET all attendance records (with student and course names)
router.get('/', async (req, res) => {
    try {
        const result = await db.query(`
            SELECT a."AttendanceID", s."Name" AS "StudentName", c."CourseName",
                   a."Date", a."Status", a."StudentID", a."CourseID"
            FROM "Attendance" a
            JOIN "Student" s ON a."StudentID" = s."StudentID"
            JOIN "Course"  c ON a."CourseID"  = c."CourseID"
            ORDER BY a."Date" DESC, a."AttendanceID" DESC
        `);
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST - Mark attendance
router.post('/', async (req, res) => {
    const { StudentID, CourseID, Date: date, Status } = req.body;
    if (!StudentID || !CourseID || !date || !Status) {
        return res.status(400).json({ error: 'StudentID, CourseID, Date, and Status are required' });
    }
    try {
        const result = await db.query(
            `INSERT INTO "Attendance" ("StudentID", "CourseID", "Date", "Status")
             VALUES ($1, $2, $3, $4) RETURNING "AttendanceID"`,
            [StudentID, CourseID, date, Status]
        );
        res.status(201).json({
            message: 'Attendance marked successfully',
            AttendanceID: result.rows[0].AttendanceID
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// DELETE - Remove attendance record
router.delete('/:id', async (req, res) => {
    try {
        const result = await db.query(
            'DELETE FROM "Attendance" WHERE "AttendanceID" = $1',
            [req.params.id]
        );
        if (result.rowCount === 0) return res.status(404).json({ error: 'Attendance record not found' });
        res.json({ message: 'Attendance record deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;

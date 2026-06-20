// routes/fees.js - Fees Routes (PostgreSQL)
const express = require('express');
const router  = express.Router();
const db      = require('../db');

// GET all fee records (with student name)
router.get('/', async (req, res) => {
    try {
        const result = await db.query(`
            SELECT f."FeeID", s."Name" AS "StudentName", f."Amount",
                   f."PaymentDate", f."Status", f."StudentID"
            FROM "Fees" f
            JOIN "Student" s ON f."StudentID" = s."StudentID"
            ORDER BY f."FeeID" DESC
        `);
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET single fee record
router.get('/:id', async (req, res) => {
    try {
        const result = await db.query(
            'SELECT * FROM "Fees" WHERE "FeeID" = $1',
            [req.params.id]
        );
        if (result.rows.length === 0) return res.status(404).json({ error: 'Fee record not found' });
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST - Add fee record
router.post('/', async (req, res) => {
    const { StudentID, Amount, PaymentDate, Status } = req.body;
    if (!StudentID || !Amount) {
        return res.status(400).json({ error: 'StudentID and Amount are required' });
    }
    try {
        const result = await db.query(
            `INSERT INTO "Fees" ("StudentID", "Amount", "PaymentDate", "Status")
             VALUES ($1, $2, $3, $4) RETURNING "FeeID"`,
            [StudentID, Amount, PaymentDate || null, Status || 'Pending']
        );
        res.status(201).json({
            message: 'Fee record added successfully',
            FeeID: result.rows[0].FeeID
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// PUT - Update fee record
router.put('/:id', async (req, res) => {
    const { StudentID, Amount, PaymentDate, Status } = req.body;
    if (!StudentID || !Amount || !Status) {
        return res.status(400).json({ error: 'StudentID, Amount, and Status are required' });
    }
    try {
        const result = await db.query(
            `UPDATE "Fees"
             SET "StudentID"=$1, "Amount"=$2, "PaymentDate"=$3, "Status"=$4
             WHERE "FeeID"=$5`,
            [StudentID, Amount, PaymentDate || null, Status, req.params.id]
        );
        if (result.rowCount === 0) return res.status(404).json({ error: 'Fee record not found' });
        res.json({ message: 'Fee record updated successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// DELETE - Remove fee record
router.delete('/:id', async (req, res) => {
    try {
        const result = await db.query(
            'DELETE FROM "Fees" WHERE "FeeID" = $1',
            [req.params.id]
        );
        if (result.rowCount === 0) return res.status(404).json({ error: 'Fee record not found' });
        res.json({ message: 'Fee record deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;

const express = require('express');
const router = express.Router();
const db = require('../database');

router.get('/', (req, res) => {
    db.all('SELECT * FROM expenses ORDER BY date DESC', [], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(rows);
    });
});

router.post('/', (req, res) => {
    const { amount, description, category, date } = req.body;
    
    if (!amount || !description || !category || !date) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    const sql = 'INSERT INTO expenses (amount, description, category, date) VALUES (?, ?, ?, ?)';
    db.run(sql, [amount, description, category, date], function(err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json({ id: this.lastID });
    });
});

router.delete('/:id', (req, res) => {
    const { id } = req.params;
    
    db.run('DELETE FROM expenses WHERE id = ?', [id], function(err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (this.changes === 0) {
            return res.status(404).json({ error: 'Expense not found' });
        }
        res.json({ message: 'Expense deleted' });
    });
});

module.exports = router;
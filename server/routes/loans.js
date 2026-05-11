const router = require('express').Router();
const { query } = require('../db');

const toClient = r => ({
  id: r.id, employeeId: r.employee_id, amount: parseFloat(r.amount || 0),
  date: r.date, note: r.note
});

router.get('/', async (_req, res, next) => {
  try {
    const { rows } = await query('SELECT * FROM loans ORDER BY date DESC');
    res.json(rows.map(toClient));
  } catch (e) { next(e); }
});

router.post('/', async (req, res, next) => {
  try {
    const { id, employeeId, amount, date, note } = req.body;
    await query(
      'INSERT INTO loans (id, employee_id, amount, date, note) VALUES ($1,$2,$3,$4,$5) ON CONFLICT (id) DO NOTHING',
      [id, employeeId, amount, date, note||null]
    );
    res.json(req.body);
  } catch (e) { next(e); }
});

router.delete('/:id', async (req, res, next) => {
  try {
    await query('DELETE FROM loans WHERE id=$1', [req.params.id]);
    res.json({ ok: true });
  } catch (e) { next(e); }
});

module.exports = router;

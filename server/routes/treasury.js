const router = require('express').Router();
const { query } = require('../db');

const toClient = r => ({
  id: r.id, type: r.type, category: r.category, amount: parseFloat(r.amount || 0),
  date: r.date, description: r.description, referenceId: r.reference_id, performedBy: r.performed_by
});

router.get('/', async (_req, res, next) => {
  try {
    const { rows } = await query('SELECT * FROM treasury_transactions ORDER BY date DESC');
    res.json(rows.map(toClient));
  } catch (e) { next(e); }
});

router.post('/', async (req, res, next) => {
  try {
    const { id, type, category, amount, date, description, referenceId, performedBy } = req.body;
    await query(
      `INSERT INTO treasury_transactions (id, type, category, amount, date, description, reference_id, performed_by)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8) ON CONFLICT (id) DO NOTHING`,
      [id, type, category, amount, date, description, referenceId||null, JSON.stringify(performedBy||null)]
    );
    res.json(req.body);
  } catch (e) { next(e); }
});

router.put('/:id', async (req, res, next) => {
  try {
    const { type, category, amount, date, description, referenceId, performedBy } = req.body;
    await query(
      `UPDATE treasury_transactions SET type=$2, category=$3, amount=$4, date=$5, description=$6, reference_id=$7, performed_by=$8, updated_at=NOW() WHERE id=$1`,
      [req.params.id, type, category, amount, date, description, referenceId||null, JSON.stringify(performedBy||null)]
    );
    res.json({ ...req.body, id: req.params.id });
  } catch (e) { next(e); }
});

router.delete('/:id', async (req, res, next) => {
  try {
    await query('DELETE FROM treasury_transactions WHERE id=$1', [req.params.id]);
    res.json({ ok: true });
  } catch (e) { next(e); }
});

module.exports = router;

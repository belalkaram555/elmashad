const router = require('express').Router();
const { query } = require('../db');

const toClient = r => ({
  id: r.id, itemId: r.item_id, warehouseId: r.warehouse_id,
  type: r.type, quantity: parseFloat(r.quantity), date: r.date, notes: r.notes
});

router.get('/', async (_req, res, next) => {
  try {
    const { rows } = await query('SELECT * FROM stock_movements ORDER BY date DESC');
    res.json(rows.map(toClient));
  } catch (e) { next(e); }
});

router.post('/', async (req, res, next) => {
  try {
    const { id, itemId, warehouseId, type, quantity, date, notes } = req.body;
    await query(
      'INSERT INTO stock_movements (id, item_id, warehouse_id, type, quantity, date, notes) VALUES ($1,$2,$3,$4,$5,$6,$7) ON CONFLICT (id) DO NOTHING',
      [id, itemId, warehouseId, type, quantity, date, notes || null]
    );
    res.json(req.body);
  } catch (e) { next(e); }
});

router.delete('/:id', async (req, res, next) => {
  try {
    await query('DELETE FROM stock_movements WHERE id=$1', [req.params.id]);
    res.json({ ok: true });
  } catch (e) { next(e); }
});

module.exports = router;

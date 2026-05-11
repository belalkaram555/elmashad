const router = require('express').Router();
const { query } = require('../db');

const toClient = r => ({
  id: r.id, name: r.name, phone: r.phone, address: r.address,
  balance: parseFloat(r.balance || 0)
});

router.get('/', async (_req, res, next) => {
  try {
    const { rows } = await query('SELECT * FROM customers ORDER BY name');
    res.json(rows.map(toClient));
  } catch (e) { next(e); }
});

router.post('/', async (req, res, next) => {
  try {
    const { id, name, phone, address, balance } = req.body;
    await query(
      'INSERT INTO customers (id, name, phone, address, balance) VALUES ($1,$2,$3,$4,$5) ON CONFLICT (id) DO UPDATE SET name=$2, phone=$3, address=$4, balance=$5, updated_at=NOW()',
      [id, name, phone || null, address || null, balance || 0]
    );
    res.json(req.body);
  } catch (e) { next(e); }
});

router.put('/:id', async (req, res, next) => {
  try {
    const { name, phone, address, balance } = req.body;
    await query(
      'UPDATE customers SET name=$2, phone=$3, address=$4, balance=$5, updated_at=NOW() WHERE id=$1',
      [req.params.id, name, phone || null, address || null, balance || 0]
    );
    res.json({ ...req.body, id: req.params.id });
  } catch (e) { next(e); }
});

router.delete('/:id', async (req, res, next) => {
  try {
    await query('DELETE FROM customers WHERE id=$1', [req.params.id]);
    res.json({ ok: true });
  } catch (e) { next(e); }
});

module.exports = router;

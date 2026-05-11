const router = require('express').Router();
const { query } = require('../db');

const toClient = r => ({ id: r.id, name: r.name, location: r.location });

router.get('/', async (_req, res, next) => {
  try {
    const { rows } = await query('SELECT * FROM warehouses ORDER BY name');
    res.json(rows.map(toClient));
  } catch (e) { next(e); }
});

router.post('/', async (req, res, next) => {
  try {
    const { id, name, location } = req.body;
    await query(
      'INSERT INTO warehouses (id, name, location) VALUES ($1,$2,$3) ON CONFLICT (id) DO UPDATE SET name=$2, location=$3, updated_at=NOW()',
      [id, name, location || null]
    );
    res.json(req.body);
  } catch (e) { next(e); }
});

router.put('/:id', async (req, res, next) => {
  try {
    const { name, location } = req.body;
    await query('UPDATE warehouses SET name=$2, location=$3, updated_at=NOW() WHERE id=$1', [req.params.id, name, location || null]);
    res.json({ ...req.body, id: req.params.id });
  } catch (e) { next(e); }
});

router.delete('/:id', async (req, res, next) => {
  try {
    await query('DELETE FROM warehouses WHERE id=$1', [req.params.id]);
    res.json({ ok: true });
  } catch (e) { next(e); }
});

module.exports = router;

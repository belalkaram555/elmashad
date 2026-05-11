const router = require('express').Router();
const { query } = require('../db');

const toClient = r => ({
  id: r.id, name: r.name, capacity: r.capacity, status: r.status, x: r.x, y: r.y
});

router.get('/', async (_req, res, next) => {
  try {
    const { rows } = await query('SELECT * FROM tables ORDER BY name');
    res.json(rows.map(toClient));
  } catch (e) { next(e); }
});

router.post('/', async (req, res, next) => {
  try {
    const { id, name, capacity, status, x, y } = req.body;
    await query(
      'INSERT INTO tables (id, name, capacity, status, x, y) VALUES ($1,$2,$3,$4,$5,$6) ON CONFLICT (id) DO UPDATE SET name=$2, capacity=$3, status=$4, x=$5, y=$6, updated_at=NOW()',
      [id, name, capacity||4, status||'available', x??null, y??null]
    );
    res.json(req.body);
  } catch (e) { next(e); }
});

router.put('/:id', async (req, res, next) => {
  try {
    const { name, capacity, status, x, y } = req.body;
    await query(
      'UPDATE tables SET name=$2, capacity=$3, status=$4, x=$5, y=$6, updated_at=NOW() WHERE id=$1',
      [req.params.id, name, capacity||4, status||'available', x??null, y??null]
    );
    res.json({ ...req.body, id: req.params.id });
  } catch (e) { next(e); }
});

router.delete('/:id', async (req, res, next) => {
  try {
    await query('DELETE FROM tables WHERE id=$1', [req.params.id]);
    res.json({ ok: true });
  } catch (e) { next(e); }
});

module.exports = router;

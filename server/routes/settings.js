const router = require('express').Router();
const { query } = require('../db');

router.get('/', async (_req, res, next) => {
  try {
    const { rows } = await query('SELECT data FROM app_settings WHERE id=1');
    if (rows.length === 0) {
      return res.json({});
    }
    res.json(rows[0].data);
  } catch (e) { next(e); }
});

router.post('/', async (req, res, next) => {
  try {
    const data = req.body;
    await query(
      `INSERT INTO app_settings (id, data) VALUES (1, $1)
       ON CONFLICT (id) DO UPDATE SET data=$1, updated_at=NOW()`,
      [JSON.stringify(data)]
    );
    res.json(data);
  } catch (e) { next(e); }
});

module.exports = router;

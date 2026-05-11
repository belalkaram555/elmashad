const router = require('express').Router();
const { query } = require('../db');

router.get('/next-order-number', async (_req, res, next) => {
  try {
    const { rows } = await query(
      `INSERT INTO app_counters (key, value) VALUES ('next_order_number', 1)
       ON CONFLICT (key) DO NOTHING RETURNING value`
    );
    if (rows.length > 0) return res.json({ value: rows[0].value });
    const { rows: existing } = await query('SELECT value FROM app_counters WHERE key=$1', ['next_order_number']);
    res.json({ value: existing[0]?.value || 1 });
  } catch (e) { next(e); }
});

router.post('/next-order-number/increment', async (_req, res, next) => {
  try {
    const { rows } = await query(
      `INSERT INTO app_counters (key, value) VALUES ('next_order_number', 2)
       ON CONFLICT (key) DO UPDATE SET value = app_counters.value + 1, updated_at=NOW()
       RETURNING value`
    );
    res.json({ value: rows[0].value });
  } catch (e) { next(e); }
});

module.exports = router;

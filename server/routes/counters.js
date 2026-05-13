const router = require('express').Router();
const { query } = require('../db');

router.get('/next-order-number', async (_req, res, next) => {
  try {
    const { rows: existing } = await query('SELECT value, updated_at FROM app_counters WHERE key=$1', ['next_order_number']);
    if (existing.length === 0) {
      const { rows } = await query(
        `INSERT INTO app_counters (key, value, updated_at) VALUES ('next_order_number', 1, NOW()) RETURNING value`
      );
      return res.json({ value: rows[0].value });
    }

    const counter = existing[0];
    const lastUpdateDate = new Date(counter.updated_at).toDateString();
    const todayDate = new Date().toDateString();

    if (lastUpdateDate !== todayDate) {
      const { rows } = await query(
        `UPDATE app_counters SET value = 1, updated_at = NOW() WHERE key = 'next_order_number' RETURNING value`
      );
      return res.json({ value: rows[0].value });
    }

    res.json({ value: counter.value });
  } catch (e) { next(e); }
});

router.post('/next-order-number/increment', async (_req, res, next) => {
  try {
    const { rows: existing } = await query('SELECT value, updated_at FROM app_counters WHERE key=$1', ['next_order_number']);
    if (existing.length === 0) {
      const { rows } = await query(
        `INSERT INTO app_counters (key, value, updated_at) VALUES ('next_order_number', 2, NOW()) RETURNING value`
      );
      return res.json({ value: rows[0].value });
    }

    const counter = existing[0];
    const lastUpdateDate = new Date(counter.updated_at).toDateString();
    const todayDate = new Date().toDateString();

    if (lastUpdateDate !== todayDate) {
      // It's a new day! Order #1 was just created, so next is #2
      const { rows } = await query(
        `UPDATE app_counters SET value = 2, updated_at = NOW() WHERE key = 'next_order_number' RETURNING value`
      );
      return res.json({ value: rows[0].value });
    }

    const { rows } = await query(
      `UPDATE app_counters SET value = value + 1, updated_at = NOW() WHERE key = 'next_order_number' RETURNING value`
    );
    res.json({ value: rows[0].value });
  } catch (e) { next(e); }
});

module.exports = router;

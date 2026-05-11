const router = require('express').Router();
const { query } = require('../db');

const toClient = r => ({
  id: r.id, userId: r.user_id, userName: r.user_name,
  startTime: r.start_time, endTime: r.end_time,
  startBalance: parseFloat(r.start_balance || 0),
  endBalance: r.end_balance !== null ? parseFloat(r.end_balance) : undefined,
  expectedBalance: r.expected_balance !== null ? parseFloat(r.expected_balance) : undefined,
  totalSales: parseFloat(r.total_sales || 0), status: r.status
});

router.get('/', async (_req, res, next) => {
  try {
    const { rows } = await query('SELECT * FROM shifts ORDER BY start_time DESC');
    res.json(rows.map(toClient));
  } catch (e) { next(e); }
});

router.post('/', async (req, res, next) => {
  try {
    const d = req.body;
    await query(
      `INSERT INTO shifts (id, user_id, user_name, start_time, end_time, start_balance, end_balance, expected_balance, total_sales, status)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
       ON CONFLICT (id) DO UPDATE SET user_id=$2, user_name=$3, start_time=$4, end_time=$5, start_balance=$6, end_balance=$7, expected_balance=$8, total_sales=$9, status=$10, updated_at=NOW()`,
      [d.id, d.userId, d.userName, d.startTime, d.endTime||null,
       d.startBalance||0, d.endBalance??null, d.expectedBalance??null, d.totalSales||0, d.status||'open']
    );
    res.json(req.body);
  } catch (e) { next(e); }
});

router.put('/:id', async (req, res, next) => {
  try {
    const d = req.body;
    await query(
      `UPDATE shifts SET end_time=$2, end_balance=$3, expected_balance=$4, total_sales=$5, status=$6, updated_at=NOW() WHERE id=$1`,
      [req.params.id, d.endTime||null, d.endBalance??null, d.expectedBalance??null, d.totalSales||0, d.status||'open']
    );
    res.json({ ...d, id: req.params.id });
  } catch (e) { next(e); }
});

module.exports = router;

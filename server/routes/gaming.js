const router = require('express').Router();
const { query } = require('../db');

const toDevice = r => ({
  id: r.id, name: r.name, type: r.type,
  hourlyRate: parseFloat(r.hourly_rate || 0), status: r.status
});

const toSession = r => ({
  id: r.id, deviceId: r.device_id, deviceName: r.device_name, deviceType: r.device_type,
  hourlyRate: parseFloat(r.hourly_rate || 0),
  startTime: r.start_time, endTime: r.end_time,
  durationMinutes: r.duration_minutes,
  totalAmount: r.total_amount ? parseFloat(r.total_amount) : undefined,
  status: r.status, customerId: r.customer_id, customerName: r.customer_name,
  paymentMethod: r.payment_method, notes: r.notes
});

router.get('/devices', async (_req, res, next) => {
  try {
    const { rows } = await query('SELECT * FROM gaming_devices ORDER BY type, name');
    res.json(rows.map(toDevice));
  } catch (e) { next(e); }
});

router.post('/devices', async (req, res, next) => {
  try {
    const { id, name, type, hourlyRate, status } = req.body;
    await query(
      'INSERT INTO gaming_devices (id, name, type, hourly_rate, status) VALUES ($1,$2,$3,$4,$5) ON CONFLICT (id) DO UPDATE SET name=$2, type=$3, hourly_rate=$4, status=$5, updated_at=NOW()',
      [id, name, type, hourlyRate||0, status||'available']
    );
    res.json(req.body);
  } catch (e) { next(e); }
});

router.put('/devices/:id', async (req, res, next) => {
  try {
    const { name, type, hourlyRate, status } = req.body;
    await query(
      'UPDATE gaming_devices SET name=$2, type=$3, hourly_rate=$4, status=$5, updated_at=NOW() WHERE id=$1',
      [req.params.id, name, type, hourlyRate||0, status||'available']
    );
    res.json({ ...req.body, id: req.params.id });
  } catch (e) { next(e); }
});

router.delete('/devices/:id', async (req, res, next) => {
  try {
    await query('DELETE FROM gaming_devices WHERE id=$1', [req.params.id]);
    res.json({ ok: true });
  } catch (e) { next(e); }
});

router.get('/sessions', async (_req, res, next) => {
  try {
    const { rows } = await query('SELECT * FROM gaming_sessions ORDER BY start_time DESC');
    res.json(rows.map(toSession));
  } catch (e) { next(e); }
});

router.post('/sessions', async (req, res, next) => {
  try {
    const d = req.body;
    await query(
      `INSERT INTO gaming_sessions (id, device_id, device_name, device_type, hourly_rate, start_time, end_time, duration_minutes, total_amount, status, customer_id, customer_name, payment_method, notes)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)
       ON CONFLICT (id) DO UPDATE SET status=$10, end_time=$7, duration_minutes=$8, total_amount=$9, payment_method=$13, updated_at=NOW()`,
      [d.id, d.deviceId, d.deviceName, d.deviceType, d.hourlyRate||0,
       d.startTime, d.endTime||null, d.durationMinutes||null, d.totalAmount??null,
       d.status||'active', d.customerId||null, d.customerName||null, d.paymentMethod||null, d.notes||null]
    );
    res.json(req.body);
  } catch (e) { next(e); }
});

router.put('/sessions/:id', async (req, res, next) => {
  try {
    const d = req.body;
    await query(
      `UPDATE gaming_sessions SET status=$2, end_time=$3, duration_minutes=$4, total_amount=$5, payment_method=$6, updated_at=NOW() WHERE id=$1`,
      [req.params.id, d.status, d.endTime||null, d.durationMinutes||null, d.totalAmount??null, d.paymentMethod||null]
    );
    res.json({ ...d, id: req.params.id });
  } catch (e) { next(e); }
});

module.exports = router;

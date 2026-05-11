const router = require('express').Router();
const { query } = require('../db');

const toClient = r => ({
  id: r.id, items: r.items || [], subtotal: parseFloat(r.subtotal || 0),
  discount: parseFloat(r.discount || 0), tax: parseFloat(r.tax || 0),
  serviceCharge: parseFloat(r.service_charge || 0), total: parseFloat(r.total || 0),
  paymentMethod: r.payment_method, amountReceived: r.amount_received ? parseFloat(r.amount_received) : undefined,
  changeAmount: r.change_amount ? parseFloat(r.change_amount) : undefined,
  customerId: r.customer_id, customerName: r.customer_name,
  type: r.type, status: r.status,
  createdAt: r.created_at, completedAt: r.completed_at,
  shiftId: r.shift_id, performedBy: r.performed_by
});

router.get('/', async (_req, res, next) => {
  try {
    const { rows } = await query('SELECT * FROM orders ORDER BY created_at DESC');
    res.json(rows.map(toClient));
  } catch (e) { next(e); }
});

router.post('/', async (req, res, next) => {
  try {
    const d = req.body;
    await query(
      `INSERT INTO orders (id, items, subtotal, discount, tax, service_charge, total, payment_method, amount_received, change_amount, customer_id, customer_name, type, status, created_at, completed_at, shift_id, performed_by)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18)
       ON CONFLICT (id) DO UPDATE SET items=$2, subtotal=$3, discount=$4, tax=$5, service_charge=$6, total=$7, payment_method=$8, amount_received=$9, change_amount=$10, customer_id=$11, customer_name=$12, type=$13, status=$14, completed_at=$16, shift_id=$17, performed_by=$18, updated_at=NOW()`,
      [d.id, JSON.stringify(d.items||[]), d.subtotal, d.discount, d.tax, d.serviceCharge, d.total,
       d.paymentMethod, d.amountReceived||null, d.changeAmount||null, d.customerId||null, d.customerName||null,
       d.type, d.status, d.createdAt||new Date().toISOString(), d.completedAt||null, d.shiftId||null,
       JSON.stringify(d.performedBy||null)]
    );
    res.json(req.body);
  } catch (e) { next(e); }
});

router.put('/:id', async (req, res, next) => {
  try {
    const d = req.body;
    const fields = [];
    const vals = [req.params.id];
    let i = 2;
    if (d.status !== undefined) { fields.push(`status=$${i++}`); vals.push(d.status); }
    if (d.completedAt !== undefined) { fields.push(`completed_at=$${i++}`); vals.push(d.completedAt); }
    if (d.items !== undefined) { fields.push(`items=$${i++}`); vals.push(JSON.stringify(d.items)); }
    if (d.paymentMethod !== undefined) { fields.push(`payment_method=$${i++}`); vals.push(d.paymentMethod); }
    if (d.customerId !== undefined) { fields.push(`customer_id=$${i++}`); vals.push(d.customerId); }
    if (d.customerName !== undefined) { fields.push(`customer_name=$${i++}`); vals.push(d.customerName); }
    if (d.total !== undefined) { fields.push(`total=$${i++}`); vals.push(d.total); }
    if (d.discount !== undefined) { fields.push(`discount=$${i++}`); vals.push(d.discount); }
    if (fields.length === 0) return res.json({ ok: true });
    fields.push('updated_at=NOW()');
    await query(`UPDATE orders SET ${fields.join(',')} WHERE id=$1`, vals);
    res.json({ ...d, id: req.params.id });
  } catch (e) { next(e); }
});

router.delete('/:id', async (req, res, next) => {
  try {
    await query('DELETE FROM orders WHERE id=$1', [req.params.id]);
    res.json({ ok: true });
  } catch (e) { next(e); }
});

module.exports = router;

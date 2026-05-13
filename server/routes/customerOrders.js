const router = require('express').Router();
const { query } = require('../db');

const toClient = r => ({
  id: r.id,
  customerName: r.customer_name,
  customerPhone: r.customer_phone,
  tableNumber: r.table_number,
  items: r.items || [],
  subtotal: parseFloat(r.subtotal || 0),
  tax: parseFloat(r.tax || 0),
  total: parseFloat(r.total || 0),
  status: r.status,
  sessionToken: r.session_token,
  createdAt: r.created_at,
  updatedAt: r.updated_at
});

// GET all active customer orders (for Cashier POS)
router.get('/', async (_req, res, next) => {
  try {
    const { rows } = await query("SELECT * FROM customer_orders WHERE status != 'completed' ORDER BY created_at DESC");
    res.json(rows.map(toClient));
  } catch (e) { next(e); }
});

// GET order by session token
router.get('/session/:token', async (req, res, next) => {
  try {
    const { rows } = await query("SELECT * FROM customer_orders WHERE session_token = $1 ORDER BY created_at DESC LIMIT 1", [req.params.token]);
    if (rows.length === 0) return res.json(null);
    res.json(toClient(rows[0]));
  } catch (e) { next(e); }
});

// POST new customer order
router.post('/', async (req, res, next) => {
  try {
    const d = req.body;
    
    // Validate table existence
    if (d.tableNumber) {
      const tableRes = await query('SELECT id FROM tables WHERE name = $1 OR id = $1', [d.tableNumber]);
      if (tableRes.rows.length === 0) {
        return res.status(400).json({ ok: false, error: 'رقم الترابيزة غير موجود بالنظام.' });
      }
    }

    // Check spam / recent completed orders from this session
    if (d.sessionToken) {
      const recentRes = await query(
        "SELECT COUNT(*) as cnt FROM customer_orders WHERE session_token = $1 AND status = 'completed' AND created_at > NOW() - INTERVAL '30 minutes'",
        [d.sessionToken]
      );
      if (parseInt(recentRes.rows[0].cnt) >= 2) {
        return res.status(429).json({ ok: false, error: 'لقد قمت بإتمام طلبات مؤخراً. يرجى التوجه للكاشير لطلب المزيد.' });
      }
    }

    const orderId = d.id || `co_${Date.now()}`;
    await query(
      `INSERT INTO customer_orders (id, customer_name, customer_phone, table_number, items, subtotal, tax, total, status, session_token)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
       ON CONFLICT (id) DO UPDATE SET items=$5, subtotal=$6, tax=$7, total=$8, status=$9, updated_at=NOW()`,
      [
        orderId,
        d.customerName || 'عميل',
        d.customerPhone || '',
        d.tableNumber || '',
        JSON.stringify(d.items || []),
        d.subtotal || 0,
        d.tax || 0,
        d.total || 0,
        d.status || 'pending',
        d.sessionToken || ''
      ]
    );

    const { rows } = await query('SELECT * FROM customer_orders WHERE id = $1', [orderId]);
    res.json(toClient(rows[0]));
  } catch (e) { next(e); }
});

// PUT update customer order
router.put('/:id', async (req, res, next) => {
  try {
    const d = req.body;
    const fields = [];
    const vals = [req.params.id];
    let i = 2;

    if (d.status !== undefined) { fields.push(`status=$${i++}`); vals.push(d.status); }
    if (d.items !== undefined) { fields.push(`items=$${i++}`); vals.push(JSON.stringify(d.items)); }
    if (d.subtotal !== undefined) { fields.push(`subtotal=$${i++}`); vals.push(d.subtotal); }
    if (d.tax !== undefined) { fields.push(`tax=$${i++}`); vals.push(d.tax); }
    if (d.total !== undefined) { fields.push(`total=$${i++}`); vals.push(d.total); }
    if (d.customerName !== undefined) { fields.push(`customer_name=$${i++}`); vals.push(d.customerName); }
    if (d.customerPhone !== undefined) { fields.push(`customer_phone=$${i++}`); vals.push(d.customerPhone); }
    if (d.tableNumber !== undefined) { fields.push(`table_number=$${i++}`); vals.push(d.tableNumber); }

    if (fields.length === 0) return res.json({ ok: true });
    fields.push('updated_at=NOW()');

    await query(`UPDATE customer_orders SET ${fields.join(',')} WHERE id=$1`, vals);

    const { rows } = await query('SELECT * FROM customer_orders WHERE id = $1', [req.params.id]);
    res.json(toClient(rows[0]));
  } catch (e) { next(e); }
});

// DELETE customer order
router.delete('/:id', async (req, res, next) => {
  try {
    await query('DELETE FROM customer_orders WHERE id=$1', [req.params.id]);
    res.json({ ok: true });
  } catch (e) { next(e); }
});

module.exports = router;

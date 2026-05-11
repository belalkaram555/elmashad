const router = require('express').Router();
const { query } = require('../db');

const toClient = r => ({
  id: r.id, supplierId: r.supplier_id, supplierName: r.supplier_name,
  warehouseId: r.warehouse_id, invoiceNumber: r.invoice_number, date: r.date,
  items: r.items || [], totalAmount: parseFloat(r.total_amount || 0),
  paymentMethod: r.payment_method, notes: r.notes, performedBy: r.performed_by
});

router.get('/', async (_req, res, next) => {
  try {
    const { rows } = await query('SELECT * FROM purchases ORDER BY date DESC');
    res.json(rows.map(toClient));
  } catch (e) { next(e); }
});

router.post('/', async (req, res, next) => {
  try {
    const d = req.body;
    await query(
      `INSERT INTO purchases (id, supplier_id, supplier_name, warehouse_id, invoice_number, date, items, total_amount, payment_method, notes, performed_by)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
       ON CONFLICT (id) DO NOTHING`,
      [d.id, d.supplierId||null, d.supplierName||null, d.warehouseId, d.invoiceNumber,
       d.date, JSON.stringify(d.items||[]), d.totalAmount, d.paymentMethod,
       d.notes||null, JSON.stringify(d.performedBy||null)]
    );
    res.json(req.body);
  } catch (e) { next(e); }
});

router.delete('/:id', async (req, res, next) => {
  try {
    await query('DELETE FROM purchases WHERE id=$1', [req.params.id]);
    res.json({ ok: true });
  } catch (e) { next(e); }
});

module.exports = router;

const router = require('express').Router();
const { query } = require('../db');

const toClient = r => ({
  id: r.id, name: r.name, phone: r.phone, address: r.address,
  companyName: r.company_name, balance: parseFloat(r.balance || 0)
});

router.get('/', async (_req, res, next) => {
  try {
    const { rows } = await query('SELECT * FROM suppliers ORDER BY name');
    res.json(rows.map(toClient));
  } catch (e) { next(e); }
});

router.post('/', async (req, res, next) => {
  try {
    const { id, name, phone, address, companyName, balance } = req.body;
    await query(
      'INSERT INTO suppliers (id, name, phone, address, company_name, balance) VALUES ($1,$2,$3,$4,$5,$6) ON CONFLICT (id) DO UPDATE SET name=$2, phone=$3, address=$4, company_name=$5, balance=$6, updated_at=NOW()',
      [id, name, phone || null, address || null, companyName || null, balance || 0]
    );
    res.json(req.body);
  } catch (e) { next(e); }
});

router.put('/:id', async (req, res, next) => {
  try {
    const { name, phone, address, companyName, balance } = req.body;
    await query(
      'UPDATE suppliers SET name=$2, phone=$3, address=$4, company_name=$5, balance=$6, updated_at=NOW() WHERE id=$1',
      [req.params.id, name, phone || null, address || null, companyName || null, balance || 0]
    );
    res.json({ ...req.body, id: req.params.id });
  } catch (e) { next(e); }
});

router.delete('/:id', async (req, res, next) => {
  try {
    await query('DELETE FROM suppliers WHERE id=$1', [req.params.id]);
    res.json({ ok: true });
  } catch (e) { next(e); }
});

module.exports = router;

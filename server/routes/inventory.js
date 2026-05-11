const router = require('express').Router();
const { query } = require('../db');

const toClient = r => ({
  id: r.id, nameAr: r.name_ar, nameEn: r.name_en, unit: r.unit,
  minLevel: parseFloat(r.min_level || 0), costPerUnit: parseFloat(r.cost_per_unit || 0),
  warehouseQuantities: r.warehouse_quantities || {}
});

router.get('/', async (_req, res, next) => {
  try {
    const { rows } = await query('SELECT * FROM inventory_items ORDER BY name_ar');
    res.json(rows.map(toClient));
  } catch (e) { next(e); }
});

router.post('/', async (req, res, next) => {
  try {
    const { id, nameAr, nameEn, unit, minLevel, costPerUnit, warehouseQuantities } = req.body;
    await query(
      `INSERT INTO inventory_items (id, name_ar, name_en, unit, min_level, cost_per_unit, warehouse_quantities)
       VALUES ($1,$2,$3,$4,$5,$6,$7)
       ON CONFLICT (id) DO UPDATE SET name_ar=$2, name_en=$3, unit=$4, min_level=$5, cost_per_unit=$6, warehouse_quantities=$7, updated_at=NOW()`,
      [id, nameAr, nameEn, unit, minLevel || 0, costPerUnit || 0, JSON.stringify(warehouseQuantities || {})]
    );
    res.json(req.body);
  } catch (e) { next(e); }
});

router.put('/:id', async (req, res, next) => {
  try {
    const { nameAr, nameEn, unit, minLevel, costPerUnit, warehouseQuantities } = req.body;
    await query(
      `UPDATE inventory_items SET name_ar=$2, name_en=$3, unit=$4, min_level=$5, cost_per_unit=$6, warehouse_quantities=$7, updated_at=NOW() WHERE id=$1`,
      [req.params.id, nameAr, nameEn, unit, minLevel || 0, costPerUnit || 0, JSON.stringify(warehouseQuantities || {})]
    );
    res.json({ ...req.body, id: req.params.id });
  } catch (e) { next(e); }
});

router.delete('/:id', async (req, res, next) => {
  try {
    await query('DELETE FROM inventory_items WHERE id=$1', [req.params.id]);
    res.json({ ok: true });
  } catch (e) { next(e); }
});

module.exports = router;

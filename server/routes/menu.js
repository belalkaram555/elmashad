const router = require('express').Router();
const { query } = require('../db');

const toClient = r => ({
  id: r.id, nameAr: r.name_ar, nameEn: r.name_en, basePrice: parseFloat(r.base_price),
  cost: parseFloat(r.cost), categoryId: r.category_id, image: r.image || '',
  available: r.available, variants: r.variants || [], addons: r.addons || [], recipe: r.recipe || []
});

router.get('/', async (_req, res, next) => {
  try {
    const { rows } = await query('SELECT * FROM menu_items ORDER BY name_ar');
    res.json(rows.map(toClient));
  } catch (e) { next(e); }
});

router.post('/', async (req, res, next) => {
  try {
    const { id, nameAr, nameEn, basePrice, cost, categoryId, image, available, variants, addons, recipe } = req.body;
    await query(
      `INSERT INTO menu_items (id, name_ar, name_en, base_price, cost, category_id, image, available, variants, addons, recipe)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
       ON CONFLICT (id) DO UPDATE SET name_ar=$2, name_en=$3, base_price=$4, cost=$5, category_id=$6, image=$7, available=$8, variants=$9, addons=$10, recipe=$11, updated_at=NOW()`,
      [id, nameAr, nameEn, basePrice, cost, categoryId, image || '', available !== false,
       JSON.stringify(variants || []), JSON.stringify(addons || []), JSON.stringify(recipe || [])]
    );
    res.json(req.body);
  } catch (e) { next(e); }
});

router.put('/:id', async (req, res, next) => {
  try {
    const { nameAr, nameEn, basePrice, cost, categoryId, image, available, variants, addons, recipe } = req.body;
    await query(
      `UPDATE menu_items SET name_ar=$2, name_en=$3, base_price=$4, cost=$5, category_id=$6, image=$7, available=$8, variants=$9, addons=$10, recipe=$11, updated_at=NOW() WHERE id=$1`,
      [req.params.id, nameAr, nameEn, basePrice, cost, categoryId, image || '', available !== false,
       JSON.stringify(variants || []), JSON.stringify(addons || []), JSON.stringify(recipe || [])]
    );
    res.json({ ...req.body, id: req.params.id });
  } catch (e) { next(e); }
});

router.delete('/:id', async (req, res, next) => {
  try {
    await query('DELETE FROM menu_items WHERE id=$1', [req.params.id]);
    res.json({ ok: true });
  } catch (e) { next(e); }
});

module.exports = router;

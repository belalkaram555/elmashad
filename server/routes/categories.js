const router = require('express').Router();
const { query } = require('../db');

router.get('/', async (_req, res, next) => {
  try {
    const { rows } = await query('SELECT * FROM categories ORDER BY name_ar');
    res.json(rows.map(r => ({ id: r.id, nameAr: r.name_ar, nameEn: r.name_en, icon: r.icon })));
  } catch (e) { next(e); }
});

router.post('/', async (req, res, next) => {
  try {
    const { id, nameAr, nameEn, icon } = req.body;
    await query(
      'INSERT INTO categories (id, name_ar, name_en, icon) VALUES ($1,$2,$3,$4) ON CONFLICT (id) DO UPDATE SET name_ar=$2, name_en=$3, icon=$4, updated_at=NOW()',
      [id, nameAr, nameEn, icon || null]
    );
    res.json(req.body);
  } catch (e) { next(e); }
});

router.put('/:id', async (req, res, next) => {
  try {
    const { nameAr, nameEn, icon } = req.body;
    await query(
      'UPDATE categories SET name_ar=$2, name_en=$3, icon=$4, updated_at=NOW() WHERE id=$1',
      [req.params.id, nameAr, nameEn, icon || null]
    );
    res.json({ ...req.body, id: req.params.id });
  } catch (e) { next(e); }
});

router.delete('/:id', async (req, res, next) => {
  try {
    await query('DELETE FROM categories WHERE id=$1', [req.params.id]);
    res.json({ ok: true });
  } catch (e) { next(e); }
});

module.exports = router;

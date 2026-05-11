const router = require('express').Router();
const { query } = require('../db');

const toClient = r => ({
  id: r.id, titleAr: r.title_ar, titleEn: r.title_en,
  messageAr: r.message_ar, messageEn: r.message_en,
  type: r.type, createdAt: r.created_at, isRead: r.is_read
});

router.get('/', async (_req, res, next) => {
  try {
    const { rows } = await query('SELECT * FROM notifications ORDER BY created_at DESC LIMIT 100');
    res.json(rows.map(toClient));
  } catch (e) { next(e); }
});

router.post('/', async (req, res, next) => {
  try {
    const { id, titleAr, titleEn, messageAr, messageEn, type, createdAt, isRead } = req.body;
    await query(
      `INSERT INTO notifications (id, title_ar, title_en, message_ar, message_en, type, created_at, is_read)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8) ON CONFLICT (id) DO NOTHING`,
      [id, titleAr, titleEn, messageAr, messageEn, type, createdAt||new Date().toISOString(), isRead||false]
    );
    res.json(req.body);
  } catch (e) { next(e); }
});

router.put('/:id', async (req, res, next) => {
  try {
    await query('UPDATE notifications SET is_read=$2, updated_at=NOW() WHERE id=$1', [req.params.id, req.body.isRead]);
    res.json({ ...req.body, id: req.params.id });
  } catch (e) { next(e); }
});

router.delete('/', async (_req, res, next) => {
  try {
    await query('DELETE FROM notifications');
    res.json({ ok: true });
  } catch (e) { next(e); }
});

module.exports = router;

const router = require('express').Router();
const { query } = require('../db');

const toClient = r => ({
  id: r.id, nameAr: r.name_ar, nameEn: r.name_en, role: r.role,
  baseSalary: parseFloat(r.base_salary || 0), penaltyDays: r.penalty_days || 0,
  absenceDays: r.absence_days || 0, bonuses: parseFloat(r.bonuses || 0),
  insurance: parseFloat(r.insurance || 0), status: r.status,
  joinDate: r.join_date, leftDate: r.left_date, shiftStart: r.shift_start,
  shiftEnd: r.shift_end, phone: r.phone, username: r.username, password: r.password
});

router.get('/', async (_req, res, next) => {
  try {
    const { rows } = await query('SELECT * FROM employees ORDER BY name_ar');
    res.json(rows.map(toClient));
  } catch (e) { next(e); }
});

router.post('/', async (req, res, next) => {
  try {
    const d = req.body;
    await query(
      `INSERT INTO employees (id, name_ar, name_en, role, base_salary, penalty_days, absence_days, bonuses, insurance, status, join_date, left_date, shift_start, shift_end, phone, username, password)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17)
       ON CONFLICT (id) DO UPDATE SET name_ar=$2, name_en=$3, role=$4, base_salary=$5, penalty_days=$6, absence_days=$7, bonuses=$8, insurance=$9, status=$10, join_date=$11, left_date=$12, shift_start=$13, shift_end=$14, phone=$15, username=$16, password=$17, updated_at=NOW()`,
      [d.id, d.nameAr, d.nameEn, d.role, d.baseSalary||0, d.penaltyDays||0, d.absenceDays||0,
       d.bonuses||0, d.insurance||0, d.status||'active', d.joinDate||null, d.leftDate||null,
       d.shiftStart||null, d.shiftEnd||null, d.phone||null, d.username||null, d.password||null]
    );
    res.json(req.body);
  } catch (e) { next(e); }
});

router.put('/:id', async (req, res, next) => {
  try {
    const d = req.body;
    await query(
      `UPDATE employees SET name_ar=$2, name_en=$3, role=$4, base_salary=$5, penalty_days=$6, absence_days=$7, bonuses=$8, insurance=$9, status=$10, join_date=$11, left_date=$12, shift_start=$13, shift_end=$14, phone=$15, username=$16, password=$17, updated_at=NOW() WHERE id=$1`,
      [req.params.id, d.nameAr, d.nameEn, d.role, d.baseSalary||0, d.penaltyDays||0, d.absenceDays||0,
       d.bonuses||0, d.insurance||0, d.status||'active', d.joinDate||null, d.leftDate||null,
       d.shiftStart||null, d.shiftEnd||null, d.phone||null, d.username||null, d.password||null]
    );
    res.json({ ...req.body, id: req.params.id });
  } catch (e) { next(e); }
});

router.delete('/:id', async (req, res, next) => {
  try {
    await query('DELETE FROM employees WHERE id=$1', [req.params.id]);
    res.json({ ok: true });
  } catch (e) { next(e); }
});

module.exports = router;

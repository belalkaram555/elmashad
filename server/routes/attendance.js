const router = require('express').Router();
const { query } = require('../db');

const toClient = r => ({
  id: r.id, employeeId: r.employee_id, date: r.date,
  checkIn: r.check_in, checkOut: r.check_out,
  hoursWorked: parseFloat(r.hours_worked || 0), status: r.status
});

router.get('/', async (_req, res, next) => {
  try {
    const { rows } = await query('SELECT * FROM attendance_records ORDER BY date DESC');
    res.json(rows.map(toClient));
  } catch (e) { next(e); }
});

router.post('/', async (req, res, next) => {
  try {
    const { id, employeeId, date, checkIn, checkOut, hoursWorked, status } = req.body;
    await query(
      `INSERT INTO attendance_records (id, employee_id, date, check_in, check_out, hours_worked, status)
       VALUES ($1,$2,$3,$4,$5,$6,$7)
       ON CONFLICT (id) DO UPDATE SET employee_id=$2, date=$3, check_in=$4, check_out=$5, hours_worked=$6, status=$7, updated_at=NOW()`,
      [id, employeeId, date, checkIn, checkOut||null, hoursWorked||0, status||'present']
    );
    res.json(req.body);
  } catch (e) { next(e); }
});

router.put('/:id', async (req, res, next) => {
  try {
    const { employeeId, date, checkIn, checkOut, hoursWorked, status } = req.body;
    await query(
      `UPDATE attendance_records SET employee_id=$2, date=$3, check_in=$4, check_out=$5, hours_worked=$6, status=$7, updated_at=NOW() WHERE id=$1`,
      [req.params.id, employeeId, date, checkIn, checkOut||null, hoursWorked||0, status||'present']
    );
    res.json({ ...req.body, id: req.params.id });
  } catch (e) { next(e); }
});

router.delete('/:id', async (req, res, next) => {
  try {
    await query('DELETE FROM attendance_records WHERE id=$1', [req.params.id]);
    res.json({ ok: true });
  } catch (e) { next(e); }
});

module.exports = router;

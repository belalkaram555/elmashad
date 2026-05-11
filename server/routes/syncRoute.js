const router = require('express').Router();
const { query } = require('../db');

// GET /api/sync/pull?since=ISO_TIMESTAMP
// Returns all records updated after the given timestamp
router.get('/pull', async (req, res, next) => {
  try {
    const since = req.query.since || new Date(0).toISOString();

    const [
      categories, menuItems, orders, warehouses, inventory, stockMovements,
      customers, suppliers, purchases, treasury, employees, attendance,
      loans, shifts, tables, notifications, gamingDevices, gamingSessions
    ] = await Promise.all([
      query('SELECT * FROM categories WHERE updated_at > $1', [since]),
      query('SELECT * FROM menu_items WHERE updated_at > $1', [since]),
      query('SELECT * FROM orders WHERE updated_at > $1', [since]),
      query('SELECT * FROM warehouses WHERE updated_at > $1', [since]),
      query('SELECT * FROM inventory_items WHERE updated_at > $1', [since]),
      query('SELECT * FROM stock_movements WHERE updated_at > $1', [since]),
      query('SELECT * FROM customers WHERE updated_at > $1', [since]),
      query('SELECT * FROM suppliers WHERE updated_at > $1', [since]),
      query('SELECT * FROM purchases WHERE updated_at > $1', [since]),
      query('SELECT * FROM treasury_transactions WHERE updated_at > $1', [since]),
      query('SELECT * FROM employees WHERE updated_at > $1', [since]),
      query('SELECT * FROM attendance_records WHERE updated_at > $1', [since]),
      query('SELECT * FROM loans WHERE updated_at > $1', [since]),
      query('SELECT * FROM shifts WHERE updated_at > $1', [since]),
      query('SELECT * FROM tables WHERE updated_at > $1', [since]),
      query('SELECT * FROM notifications WHERE updated_at > $1', [since]),
      query('SELECT * FROM gaming_devices WHERE updated_at > $1', [since]),
      query('SELECT * FROM gaming_sessions WHERE updated_at > $1', [since]),
    ]);

    res.json({
      categories: categories.rows.map(r => ({ id: r.id, nameAr: r.name_ar, nameEn: r.name_en, icon: r.icon })),
      menuItems: menuItems.rows.map(r => ({
        id: r.id, nameAr: r.name_ar, nameEn: r.name_en, basePrice: parseFloat(r.base_price),
        cost: parseFloat(r.cost), categoryId: r.category_id, image: r.image,
        available: r.available, variants: r.variants, addons: r.addons, recipe: r.recipe
      })),
      orders: orders.rows,
      warehouses: warehouses.rows.map(r => ({ id: r.id, name: r.name, location: r.location })),
      inventory: inventory.rows.map(r => ({
        id: r.id, nameAr: r.name_ar, nameEn: r.name_en, unit: r.unit,
        minLevel: parseFloat(r.min_level), costPerUnit: parseFloat(r.cost_per_unit),
        warehouseQuantities: r.warehouse_quantities
      })),
      stockMovements: stockMovements.rows.map(r => ({
        id: r.id, itemId: r.item_id, warehouseId: r.warehouse_id,
        type: r.type, quantity: parseFloat(r.quantity), date: r.date, notes: r.notes
      })),
      customers: customers.rows.map(r => ({ id: r.id, name: r.name, phone: r.phone, address: r.address, balance: parseFloat(r.balance) })),
      suppliers: suppliers.rows.map(r => ({ id: r.id, name: r.name, phone: r.phone, address: r.address, companyName: r.company_name, balance: parseFloat(r.balance) })),
      purchases: purchases.rows,
      treasury: treasury.rows.map(r => ({
        id: r.id, type: r.type, category: r.category, amount: parseFloat(r.amount),
        date: r.date, description: r.description, referenceId: r.reference_id, performedBy: r.performed_by
      })),
      employees: employees.rows.map(r => ({
        id: r.id, nameAr: r.name_ar, nameEn: r.name_en, role: r.role,
        baseSalary: parseFloat(r.base_salary), penaltyDays: r.penalty_days, absenceDays: r.absence_days,
        bonuses: parseFloat(r.bonuses), insurance: parseFloat(r.insurance), status: r.status,
        joinDate: r.join_date, leftDate: r.left_date, shiftStart: r.shift_start, shiftEnd: r.shift_end,
        phone: r.phone, username: r.username, password: r.password
      })),
      attendance: attendance.rows.map(r => ({
        id: r.id, employeeId: r.employee_id, date: r.date, checkIn: r.check_in,
        checkOut: r.check_out, hoursWorked: parseFloat(r.hours_worked), status: r.status
      })),
      loans: loans.rows.map(r => ({ id: r.id, employeeId: r.employee_id, amount: parseFloat(r.amount), date: r.date, note: r.note })),
      shifts: shifts.rows.map(r => ({
        id: r.id, userId: r.user_id, userName: r.user_name, startTime: r.start_time, endTime: r.end_time,
        startBalance: parseFloat(r.start_balance), endBalance: r.end_balance ? parseFloat(r.end_balance) : undefined,
        expectedBalance: r.expected_balance ? parseFloat(r.expected_balance) : undefined,
        totalSales: parseFloat(r.total_sales), status: r.status
      })),
      tables: tables.rows.map(r => ({ id: r.id, name: r.name, capacity: r.capacity, status: r.status, x: r.x, y: r.y })),
      notifications: notifications.rows.map(r => ({
        id: r.id, titleAr: r.title_ar, titleEn: r.title_en, messageAr: r.message_ar, messageEn: r.message_en,
        type: r.type, createdAt: r.created_at, isRead: r.is_read
      })),
      gamingDevices: gamingDevices.rows.map(r => ({ id: r.id, name: r.name, type: r.type, hourlyRate: parseFloat(r.hourly_rate), status: r.status })),
      gamingSessions: gamingSessions.rows.map(r => ({
        id: r.id, deviceId: r.device_id, deviceName: r.device_name, deviceType: r.device_type,
        hourlyRate: parseFloat(r.hourly_rate), startTime: r.start_time, endTime: r.end_time,
        durationMinutes: r.duration_minutes, totalAmount: r.total_amount ? parseFloat(r.total_amount) : undefined,
        status: r.status, customerId: r.customer_id, customerName: r.customer_name,
        paymentMethod: r.payment_method, notes: r.notes
      })),
    });
  } catch (e) { next(e); }
});

module.exports = router;

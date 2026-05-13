require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { query } = require('./db');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// ── Routes ──────────────────────────────────────────────
app.use('/api/categories', require('./routes/categories'));
app.use('/api/menu', require('./routes/menu'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/warehouses', require('./routes/warehouses'));
app.use('/api/inventory', require('./routes/inventory'));
app.use('/api/stock-movements', require('./routes/stockMovements'));
app.use('/api/customers', require('./routes/customers'));
app.use('/api/suppliers', require('./routes/suppliers'));
app.use('/api/purchases', require('./routes/purchases'));
app.use('/api/treasury', require('./routes/treasury'));
app.use('/api/employees', require('./routes/employees'));
app.use('/api/attendance', require('./routes/attendance'));
app.use('/api/loans', require('./routes/loans'));
app.use('/api/shifts', require('./routes/shifts'));
app.use('/api/settings', require('./routes/settings'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/tables', require('./routes/tables'));
app.use('/api/gaming', require('./routes/gaming'));
app.use('/api/counters', require('./routes/counters'));
app.use('/api/sync', require('./routes/syncRoute'));
app.use('/api/customer-orders', require('./routes/customerOrders'));

// ── Health ───────────────────────────────────────────────
app.get('/api/health', async (_req, res) => {
  try {
    await query('SELECT 1');
    res.json({ ok: true, timestamp: new Date().toISOString() });
  } catch (err) {
    res.status(503).json({ ok: false, error: err.message });
  }
});

app.use('/api', (_req, res) => {
  res.status(404).json({ ok: false, error: 'API endpoint not found' });
});

app.use((err, _req, res, _next) => {
  console.error('API error:', err);
  res.status(500).json({ ok: false, error: err.message || 'Database/API error' });
});

// ── Init DB ──────────────────────────────────────────────
async function initDB() {
  const schemaPath = path.join(__dirname, 'schema.sql');
  const schema = fs.readFileSync(schemaPath, 'utf8');
  const statements = schema
    .split(';')
    .map(s => s.trim())
    .filter(s => s.length > 0);
  for (const stmt of statements) {
    await query(stmt);
  }
  console.log('✅ Database schema initialized');

  // Seed if empty
  const { rows } = await query('SELECT COUNT(*) FROM categories');
  if (parseInt(rows[0].count) === 0) {
    await require('./seed').seedDatabase();
    console.log('✅ Database seeded with initial data');
  }
}

const PORT = process.env.SERVER_PORT || 3001;

if (process.env.NODE_ENV !== 'production' || process.env.VERCEL !== '1') {
  app.listen(PORT, '0.0.0.0', async () => {
    console.log(`🚀 API server running on port ${PORT}`);
    try {
      await initDB();
    } catch (err) {
      console.error('❌ DB init failed:', err.message);
    }
  });
}

module.exports = app;

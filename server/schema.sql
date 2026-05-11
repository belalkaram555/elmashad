-- M4D CAFE POS — PostgreSQL Schema (Neon)

CREATE TABLE IF NOT EXISTS categories (
  id VARCHAR(100) PRIMARY KEY,
  name_ar VARCHAR(255) NOT NULL,
  name_en VARCHAR(255) NOT NULL,
  icon VARCHAR(20),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS menu_items (
  id VARCHAR(100) PRIMARY KEY,
  name_ar VARCHAR(255) NOT NULL,
  name_en VARCHAR(255) NOT NULL,
  base_price DECIMAL(12,2) DEFAULT 0,
  cost DECIMAL(12,2) DEFAULT 0,
  category_id VARCHAR(100),
  image TEXT DEFAULT '',
  available BOOLEAN DEFAULT TRUE,
  variants JSONB DEFAULT '[]',
  addons JSONB DEFAULT '[]',
  recipe JSONB DEFAULT '[]',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS orders (
  id VARCHAR(100) PRIMARY KEY,
  items JSONB DEFAULT '[]',
  subtotal DECIMAL(12,2) DEFAULT 0,
  discount DECIMAL(12,2) DEFAULT 0,
  tax DECIMAL(12,2) DEFAULT 0,
  service_charge DECIMAL(12,2) DEFAULT 0,
  total DECIMAL(12,2) DEFAULT 0,
  payment_method VARCHAR(30),
  amount_received DECIMAL(12,2),
  change_amount DECIMAL(12,2),
  customer_id VARCHAR(100),
  customer_name VARCHAR(255),
  type VARCHAR(30),
  status VARCHAR(30) DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  shift_id VARCHAR(100),
  performed_by JSONB,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS warehouses (
  id VARCHAR(100) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  location VARCHAR(255),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS inventory_items (
  id VARCHAR(100) PRIMARY KEY,
  name_ar VARCHAR(255) NOT NULL,
  name_en VARCHAR(255) NOT NULL,
  unit VARCHAR(50),
  min_level DECIMAL(12,2) DEFAULT 0,
  cost_per_unit DECIMAL(12,2) DEFAULT 0,
  warehouse_quantities JSONB DEFAULT '{}',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS stock_movements (
  id VARCHAR(100) PRIMARY KEY,
  item_id VARCHAR(100),
  warehouse_id VARCHAR(100),
  type VARCHAR(50),
  quantity DECIMAL(12,3),
  date DATE,
  notes TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS customers (
  id VARCHAR(100) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  address TEXT,
  balance DECIMAL(12,2) DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS suppliers (
  id VARCHAR(100) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  address TEXT,
  company_name VARCHAR(255),
  balance DECIMAL(12,2) DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS purchases (
  id VARCHAR(100) PRIMARY KEY,
  supplier_id VARCHAR(100),
  supplier_name VARCHAR(255),
  warehouse_id VARCHAR(100),
  invoice_number VARCHAR(100),
  date DATE,
  items JSONB DEFAULT '[]',
  total_amount DECIMAL(12,2) DEFAULT 0,
  payment_method VARCHAR(30),
  notes TEXT,
  performed_by JSONB,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS treasury_transactions (
  id VARCHAR(100) PRIMARY KEY,
  type VARCHAR(20),
  category VARCHAR(50),
  amount DECIMAL(12,2),
  date DATE,
  description TEXT,
  reference_id VARCHAR(100),
  performed_by JSONB,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS employees (
  id VARCHAR(100) PRIMARY KEY,
  name_ar VARCHAR(255),
  name_en VARCHAR(255),
  role VARCHAR(50),
  base_salary DECIMAL(12,2) DEFAULT 0,
  penalty_days INTEGER DEFAULT 0,
  absence_days INTEGER DEFAULT 0,
  bonuses DECIMAL(12,2) DEFAULT 0,
  insurance DECIMAL(12,2) DEFAULT 0,
  status VARCHAR(20) DEFAULT 'active',
  join_date DATE,
  left_date DATE,
  shift_start VARCHAR(10),
  shift_end VARCHAR(10),
  phone VARCHAR(50),
  username VARCHAR(100),
  password VARCHAR(200),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS attendance_records (
  id VARCHAR(100) PRIMARY KEY,
  employee_id VARCHAR(100),
  date DATE,
  check_in VARCHAR(30),
  check_out VARCHAR(30),
  hours_worked DECIMAL(8,2) DEFAULT 0,
  status VARCHAR(20),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS loans (
  id VARCHAR(100) PRIMARY KEY,
  employee_id VARCHAR(100),
  amount DECIMAL(12,2),
  date DATE,
  note TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS shifts (
  id VARCHAR(100) PRIMARY KEY,
  user_id VARCHAR(100),
  user_name VARCHAR(255),
  start_time TIMESTAMPTZ,
  end_time TIMESTAMPTZ,
  start_balance DECIMAL(12,2) DEFAULT 0,
  end_balance DECIMAL(12,2),
  expected_balance DECIMAL(12,2),
  total_sales DECIMAL(12,2) DEFAULT 0,
  status VARCHAR(20) DEFAULT 'open',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS tables (
  id VARCHAR(100) PRIMARY KEY,
  name VARCHAR(100),
  capacity INTEGER,
  status VARCHAR(20) DEFAULT 'available',
  x INTEGER,
  y INTEGER,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS app_settings (
  id INTEGER PRIMARY KEY DEFAULT 1,
  data JSONB NOT NULL DEFAULT '{}',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS notifications (
  id VARCHAR(100) PRIMARY KEY,
  title_ar VARCHAR(255),
  title_en VARCHAR(255),
  message_ar TEXT,
  message_en TEXT,
  type VARCHAR(20),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  is_read BOOLEAN DEFAULT FALSE,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS gaming_devices (
  id VARCHAR(100) PRIMARY KEY,
  name VARCHAR(100),
  type VARCHAR(30),
  hourly_rate DECIMAL(12,2),
  status VARCHAR(30) DEFAULT 'available',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS gaming_sessions (
  id VARCHAR(100) PRIMARY KEY,
  device_id VARCHAR(100),
  device_name VARCHAR(100),
  device_type VARCHAR(30),
  hourly_rate DECIMAL(12,2),
  start_time TIMESTAMPTZ,
  end_time TIMESTAMPTZ,
  duration_minutes INTEGER,
  total_amount DECIMAL(12,2),
  status VARCHAR(20) DEFAULT 'active',
  customer_id VARCHAR(100),
  customer_name VARCHAR(255),
  payment_method VARCHAR(20),
  notes TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS app_counters (
  key VARCHAR(50) PRIMARY KEY,
  value INTEGER DEFAULT 1,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

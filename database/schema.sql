-- M4D CAFE POS Database Schema
-- SQLite Database

-- Categories Table
CREATE TABLE IF NOT EXISTS categories (
    id TEXT PRIMARY KEY,
    name_ar TEXT NOT NULL,
    name_en TEXT NOT NULL,
    icon TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
);

-- Menu Items Table
CREATE TABLE IF NOT EXISTS menu_items (
    id TEXT PRIMARY KEY,
    name_ar TEXT NOT NULL,
    name_en TEXT NOT NULL,
    base_price REAL NOT NULL DEFAULT 0,
    cost REAL NOT NULL DEFAULT 0,
    category_id TEXT,
    image TEXT,
    available INTEGER DEFAULT 1,
    variants TEXT, -- JSON array
    addons TEXT, -- JSON array
    recipe TEXT, -- JSON array
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (category_id) REFERENCES categories(id)
);

-- Orders Table
CREATE TABLE IF NOT EXISTS orders (
    id TEXT PRIMARY KEY,
    items TEXT NOT NULL, -- JSON array of cart items
    subtotal REAL NOT NULL,
    discount REAL DEFAULT 0,
    tax REAL NOT NULL,
    service_charge REAL DEFAULT 0,
    total REAL NOT NULL,
    payment_method TEXT NOT NULL, -- 'cash', 'card', 'credit'
    amount_received REAL,
    change_amount REAL,
    customer_id TEXT,
    type TEXT NOT NULL, -- 'dine-in', 'takeaway', 'delivery'
    table_id TEXT,
    status TEXT DEFAULT 'pending', -- 'pending', 'preparing', 'ready', 'completed', 'cancelled'
    shift_id TEXT,
    performed_by TEXT, -- JSON object
    created_at TEXT DEFAULT (datetime('now')),
    completed_at TEXT,
    FOREIGN KEY (customer_id) REFERENCES customers(id),
    FOREIGN KEY (table_id) REFERENCES tables(id)
);

-- Tables (Restaurant)
CREATE TABLE IF NOT EXISTS tables (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    capacity INTEGER DEFAULT 4,
    status TEXT DEFAULT 'available', -- 'available', 'occupied', 'reserved', 'bill_requested'
    current_order_id TEXT,
    x REAL,
    y REAL,
    created_at TEXT DEFAULT (datetime('now'))
);

-- Inventory Items
CREATE TABLE IF NOT EXISTS inventory_items (
    id TEXT PRIMARY KEY,
    name_ar TEXT NOT NULL,
    name_en TEXT NOT NULL,
    unit TEXT NOT NULL,
    min_level REAL DEFAULT 0,
    cost_per_unit REAL DEFAULT 0,
    warehouse_quantities TEXT, -- JSON object {warehouseId: quantity}
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
);

-- Warehouses
CREATE TABLE IF NOT EXISTS warehouses (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    location TEXT,
    created_at TEXT DEFAULT (datetime('now'))
);

-- Stock Movements
CREATE TABLE IF NOT EXISTS stock_movements (
    id TEXT PRIMARY KEY,
    item_id TEXT NOT NULL,
    warehouse_id TEXT NOT NULL,
    type TEXT NOT NULL, -- 'purchase', 'sale', 'transfer_in', 'transfer_out', 'adjustment', 'production'
    quantity REAL NOT NULL,
    date TEXT NOT NULL,
    notes TEXT,
    FOREIGN KEY (item_id) REFERENCES inventory_items(id),
    FOREIGN KEY (warehouse_id) REFERENCES warehouses(id)
);

-- Customers
CREATE TABLE IF NOT EXISTS customers (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    phone TEXT,
    address TEXT,
    balance REAL DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
);

-- Suppliers
CREATE TABLE IF NOT EXISTS suppliers (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    phone TEXT,
    address TEXT,
    company_name TEXT,
    balance REAL DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
);

-- Purchases
CREATE TABLE IF NOT EXISTS purchases (
    id TEXT PRIMARY KEY,
    supplier_id TEXT,
    supplier_name TEXT,
    warehouse_id TEXT NOT NULL,
    invoice_number TEXT,
    date TEXT NOT NULL,
    items TEXT NOT NULL, -- JSON array
    total_amount REAL NOT NULL,
    payment_method TEXT NOT NULL, -- 'cash', 'credit'
    notes TEXT,
    performed_by TEXT, -- JSON object
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (supplier_id) REFERENCES suppliers(id),
    FOREIGN KEY (warehouse_id) REFERENCES warehouses(id)
);

-- Treasury Transactions
CREATE TABLE IF NOT EXISTS treasury_transactions (
    id TEXT PRIMARY KEY,
    type TEXT NOT NULL, -- 'income', 'expense'
    category TEXT NOT NULL, -- 'sales', 'purchases', 'salary', 'general', 'debt_payment'
    amount REAL NOT NULL,
    date TEXT NOT NULL,
    description TEXT,
    reference_id TEXT,
    performed_by TEXT, -- JSON object
    created_at TEXT DEFAULT (datetime('now'))
);

-- Employees
CREATE TABLE IF NOT EXISTS employees (
    id TEXT PRIMARY KEY,
    name_ar TEXT NOT NULL,
    name_en TEXT NOT NULL,
    role TEXT NOT NULL,
    base_salary REAL DEFAULT 0,
    penalty_days INTEGER DEFAULT 0,
    absence_days INTEGER DEFAULT 0,
    bonuses TEXT, -- JSON array for bonus details
    insurance REAL DEFAULT 0,
    status TEXT DEFAULT 'active', -- 'active', 'inactive'
    join_date TEXT,
    left_date TEXT,
    shift_start TEXT,
    shift_end TEXT,
    phone TEXT,
    username TEXT,
    password_encrypted TEXT, -- Encrypted password
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
);

-- Attendance Records
CREATE TABLE IF NOT EXISTS attendance_records (
    id TEXT PRIMARY KEY,
    employee_id TEXT NOT NULL,
    date TEXT NOT NULL,
    check_in TEXT,
    check_out TEXT,
    hours_worked REAL DEFAULT 0,
    status TEXT DEFAULT 'present', -- 'present', 'absent', 'late'
    FOREIGN KEY (employee_id) REFERENCES employees(id)
);

-- Loans
CREATE TABLE IF NOT EXISTS loans (
    id TEXT PRIMARY KEY,
    employee_id TEXT NOT NULL,
    amount REAL NOT NULL,
    date TEXT NOT NULL,
    note TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (employee_id) REFERENCES employees(id)
);

-- Shifts
CREATE TABLE IF NOT EXISTS shifts (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    user_name TEXT NOT NULL,
    start_time TEXT NOT NULL,
    end_time TEXT,
    start_balance REAL DEFAULT 0,
    end_balance REAL,
    expected_balance REAL,
    total_sales REAL DEFAULT 0,
    status TEXT DEFAULT 'open' -- 'open', 'closed'
);

-- Notifications
CREATE TABLE IF NOT EXISTS notifications (
    id TEXT PRIMARY KEY,
    title_ar TEXT NOT NULL,
    title_en TEXT NOT NULL,
    message_ar TEXT NOT NULL,
    message_en TEXT NOT NULL,
    type TEXT DEFAULT 'info', -- 'info', 'success', 'warning', 'error'
    is_read INTEGER DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now'))
);

-- Settings (Single row table)
CREATE TABLE IF NOT EXISTS settings (
    id INTEGER PRIMARY KEY DEFAULT 1,
    restaurant_name_en TEXT DEFAULT 'M4D CAFE',
    restaurant_name_ar TEXT DEFAULT 'M4D CAFE',
    branch_name_ar TEXT DEFAULT 'الفرع الرئيسي',
    tax_id TEXT,
    address_ar TEXT,
    phone TEXT,
    tax_rate REAL DEFAULT 0.14,
    service_rate REAL DEFAULT 0.12,
    currency_en TEXT DEFAULT 'EGP',
    currency_ar TEXT DEFAULT 'ج.م',
    printer_name TEXT DEFAULT 'Default',
    print_format TEXT DEFAULT 'thermal',
    auto_backup INTEGER DEFAULT 1,
    default_auto_print INTEGER DEFAULT 1,
    default_compact_view INTEGER DEFAULT 0,
    admin_username TEXT DEFAULT 'elmashad',
    admin_password_encrypted TEXT, -- Encrypted
    updated_at TEXT DEFAULT (datetime('now'))
);

-- Insert default settings if not exists
INSERT OR IGNORE INTO settings (id) VALUES (1);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_shift_id ON orders(shift_id);
CREATE INDEX IF NOT EXISTS idx_menu_items_category ON menu_items(category_id);
CREATE INDEX IF NOT EXISTS idx_purchases_date ON purchases(date);
CREATE INDEX IF NOT EXISTS idx_treasury_date ON treasury_transactions(date);
CREATE INDEX IF NOT EXISTS idx_attendance_employee ON attendance_records(employee_id);
CREATE INDEX IF NOT EXISTS idx_attendance_date ON attendance_records(date);

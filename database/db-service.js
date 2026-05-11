
const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');
const { app } = require('electron');

let db = null;

function initDatabase() {
    try {
        const userDataPath = app.getPath('userData');
        if (!fs.existsSync(userDataPath)) {
            fs.mkdirSync(userDataPath, { recursive: true });
        }
        const dbPath = path.join(userDataPath, 'pos_system.db');
        const schemaPath = path.join(__dirname, 'schema.sql');

        // Create DB connection
        db = new Database(dbPath, { verbose: console.log });
        db.pragma('journal_mode = WAL');

        // Load Schema if new DB
        const isNew = !fs.existsSync(dbPath) || fs.statSync(dbPath).size === 0;

        // Always run schema to ensure tables exist (IF NOT EXISTS is used)
        if (fs.existsSync(schemaPath)) {
            const schema = fs.readFileSync(schemaPath, 'utf8');
            db.exec(schema);
        }

        console.log('Database initialized at:', dbPath);
        return true;
    } catch (error) {
        console.error('Database initialization failed:', error);
        return false;
    }
}

// Generic Query Helper
function query(sql, params = []) {
    return db.prepare(sql).all(...params);
}

function run(sql, params = []) {
    return db.prepare(sql).run(...params);
}

function get(sql, params = []) {
    return db.prepare(sql).get(...params);
}

// Data Loader (Loads everything into one object for React Context)
function loadAllData() {
    if (!db) initDatabase();

    try {
        const data = {
            categories: query('SELECT * FROM categories'),
            menuItems: query('SELECT * FROM menu_items').map(i => ({ ...i, variants: JSON.parse(i.variants || '[]'), addons: JSON.parse(i.addons || '[]'), recipe: JSON.parse(i.recipe || '[]'), available: !!i.available })),
            orders: query('SELECT * FROM orders').map(o => ({ ...o, items: JSON.parse(o.items || '[]'), performedBy: JSON.parse(o.performed_by || 'null') })),
            tables: query('SELECT * FROM tables'),
            inventory: query('SELECT * FROM inventory_items').map(i => ({ ...i, warehouseQuantities: JSON.parse(i.warehouse_quantities || '{}') })),
            warehouses: query('SELECT * FROM warehouses'),
            stockMovements: query('SELECT * FROM stock_movements'),
            customers: query('SELECT * FROM customers'),
            suppliers: query('SELECT * FROM suppliers'),
            treasury: query('SELECT * FROM treasury_transactions').map(t => ({ ...t, performedBy: JSON.parse(t.performed_by || 'null') })),
            employees: query('SELECT * FROM employees').map(e => ({
                ...e,
                password: e.password_encrypted,
                bonuses: JSON.parse(e.bonuses || '[]') // Parse back to array
            })),
            attendance: query('SELECT * FROM attendance_records'),
            loans: query('SELECT * FROM loans'),
            purchases: query('SELECT * FROM purchases').map(p => ({ ...p, items: JSON.parse(p.items || '[]'), performedBy: JSON.parse(p.performed_by || 'null') })),
            settings: get('SELECT * FROM settings WHERE id = 1'),
            notifications: query('SELECT * FROM notifications'),
            shifts: query('SELECT * FROM shifts').map(s => ({ ...s })),
            // Derived states like activeShift need logic, but for raw data dump:
            activeShift: get("SELECT * FROM shifts WHERE status = 'open' LIMIT 1"),
            shiftHistory: query("SELECT * FROM shifts WHERE status = 'closed'")
        };
        return data;
    } catch (err) {
        console.error("Error loading data", err);
        return null; // Return null to fallback to other storage
    }
}

// Bulk Save (Dirty Sync: Delete All -> Insert All)
// Warning: This is inefficient but necessary for the current "Save All" React Architecture.
// Bulk Save (Dirty Sync: Delete All -> Insert All)
// Crucial: Must include ALL tables from DataContext
function saveBulk(data) {
    if (!db) return false;

    const transaction = db.transaction((data) => {
        // 1. Settings (Update only, usually ID=1)
        if (data.settings) {
            // Check if settings exists, if not insert, else update
            const exists = db.prepare('SELECT 1 FROM settings WHERE id = 1').get();
            if (!exists) {
                db.prepare(`INSERT INTO settings (id, restaurant_name_en, restaurant_name_ar, tax_rate) VALUES (1, 'Pos System', 'نظام الكاشير', 0)`).run();
            }

            const stmt = db.prepare(`UPDATE settings SET 
                restaurant_name_en = @restaurantNameEn, 
                restaurant_name_ar = @restaurantNameAr, 
                branch_name_ar = @branchNameAr,
                tax_id = @taxId, 
                address_ar = @addressAr, 
                phone = @phone, 
                tax_rate = @taxRate, 
                service_rate = @serviceRate, 
                currency_en = @currencyEn, 
                currency_ar = @currencyAr, 
                printer_name = @printerName, 
                print_format = @printFormat, 
                auto_backup = @autoBackup, 
                default_auto_print = @defaultAutoPrint, 
                default_compact_view = @defaultCompactView, 
                admin_username = @adminUsername
                WHERE id = 1`);

            stmt.run({
                ...data.settings,
                autoBackup: data.settings.autoBackup ? 1 : 0,
                defaultAutoPrint: data.settings.defaultAutoPrint ? 1 : 0,
                defaultCompactView: data.settings.defaultCompactView ? 1 : 0
            });
        }

        // 2. Categories
        if (data.categories && data.categories.length > 0) {
            db.prepare('DELETE FROM categories').run();
            const stmt = db.prepare('INSERT INTO categories (id, name_ar, name_en, icon) VALUES (@id, @nameAr, @nameEn, @icon)');
            for (const item of data.categories) stmt.run(item);
        }

        // 3. Menu Items
        if (data.menuItems && data.menuItems.length > 0) {
            db.prepare('DELETE FROM menu_items').run();
            const stmt = db.prepare(`INSERT INTO menu_items (id, name_ar, name_en, base_price, cost, category_id, image, available, variants, addons, recipe) 
                                     VALUES (@id, @nameAr, @nameEn, @basePrice, @cost, @categoryId, @image, @available, @variants, @addons, @recipe)`);
            for (const item of data.menuItems) {
                stmt.run({
                    ...item,
                    available: item.available ? 1 : 0,
                    variants: JSON.stringify(item.variants || []),
                    addons: JSON.stringify(item.addons || []),
                    recipe: JSON.stringify(item.recipe || [])
                });
            }
        }

        // 4. Orders
        if (data.orders && data.orders.length > 0) {
            db.prepare('DELETE FROM orders').run();
            const stmt = db.prepare(`INSERT INTO orders (id, items, subtotal, discount, tax, service_charge, total, payment_method, amount_received, change_amount, customer_id, type, table_id, status, shift_id, performed_by, created_at, completed_at)
                                     VALUES (@id, @items, @subtotal, @discount, @tax, @serviceCharge, @total, @paymentMethod, @amountReceived, @changeAmount, @customerId, @type, @tableId, @status, @shiftId, @performedBy, @createdAt, @completedAt)`);
            for (const item of data.orders) {
                stmt.run({
                    ...item,
                    items: JSON.stringify(item.items),
                    performedBy: JSON.stringify(item.performedBy),
                    completedAt: item.completedAt || null
                });
            }
        }

        // 5. Employees
        if (data.employees && data.employees.length > 0) {
            db.prepare('DELETE FROM employees').run();
            const stmt = db.prepare(`INSERT INTO employees (id, name_ar, name_en, role, base_salary, penalty_days, absence_days, bonuses, insurance, status, join_date, left_date, shift_start, shift_end, phone, username, password_encrypted)
                                     VALUES (@id, @nameAr, @nameEn, @role, @baseSalary, @penaltyDays, @absenceDays, @bonuses, @insurance, @status, @joinDate, @leftDate, @shiftStart, @shiftEnd, @phone, @username, @passwordEncrypted)`);
            for (const item of data.employees) {
                stmt.run({
                    ...item,
                    // Ensure passwordEncrypted is mapped correctly. 
                    passwordEncrypted: item.passwordEncrypted || item.password,
                    bonuses: JSON.stringify(item.bonuses || []) // Convert array to string for Schema (TEXT)
                });
            }
        }

        // 6. Customers
        if (data.customers && data.customers.length > 0) {
            db.prepare('DELETE FROM customers').run();
            const stmt = db.prepare(`INSERT INTO customers (id, name, phone, address, notes, total_spent, last_visit)
                                     VALUES (@id, @name, @phone, @address, @notes, @totalSpent, @lastVisit)`);
            for (const item of data.customers) stmt.run(item);
        }

        // 7. Suppliers
        if (data.suppliers && data.suppliers.length > 0) {
            db.prepare('DELETE FROM suppliers').run();
            const stmt = db.prepare(`INSERT INTO suppliers (id, name, contact_person, phone, email, address, notes)
                                     VALUES (@id, @name, @contactPerson, @phone, @email, @address, @notes)`);
            for (const item of data.suppliers) stmt.run(item);
        }

        // 8. Warehouses
        if (data.warehouses && data.warehouses.length > 0) {
            db.prepare('DELETE FROM warehouses').run();
            const stmt = db.prepare(`INSERT INTO warehouses (id, name, location, manager, contact)
                                     VALUES (@id, @name, @location, @manager, @contact)`);
            for (const item of data.warehouses) stmt.run(item);
        }

        // 9. Inventory
        if (data.inventory && data.inventory.length > 0) {
            db.prepare('DELETE FROM inventory_items').run();
            const stmt = db.prepare(`INSERT INTO inventory_items (id, name_ar, name_en, unit, quantity, min_quantity, cost_price, selling_price, supplier_id, warehouse_quantities, last_updated)
                                     VALUES (@id, @nameAr, @nameEn, @unit, @quantity, @minQuantity, @costPrice, @sellingPrice, @supplierId, @warehouseQuantities, @lastUpdated)`);
            for (const item of data.inventory) {
                stmt.run({
                    ...item,
                    warehouseQuantities: JSON.stringify(item.warehouseQuantities || {})
                });
            }
        }

        // 10. Treasury
        if (data.treasury && data.treasury.length > 0) {
            db.prepare('DELETE FROM treasury_transactions').run();
            const stmt = db.prepare(`INSERT INTO treasury_transactions (id, type, amount, category, description, date, performed_by, related_entity_id, related_entity_type)
                                     VALUES (@id, @type, @amount, @category, @description, @date, @performedBy, @relatedEntityId, @relatedEntityType)`);
            for (const item of data.treasury) {
                stmt.run({
                    ...item,
                    performedBy: JSON.stringify(item.performedBy)
                });
            }
        }

        // 11. Shifts
        // Note: activeShift is derived, but shiftHistory contains closed shifts.
        // We should save ALL shifts from shiftHistory AND activeShift if present.
        if (data.shiftHistory && data.shiftHistory.length > 0) {
            db.prepare('DELETE FROM shifts').run(); // Clear all shifts to rebuild history
            const stmt = db.prepare(`INSERT INTO shifts (id, start_time, end_time, start_cash, end_cash, actual_cash, difference, status, performed_by_id, notes)
                                      VALUES (@id, @startTime, @endTime, @startCash, @endCash, @actualCash, @difference, @status, @performedById, @notes)`);

            // Insert history
            for (const item of data.shiftHistory) stmt.run(item);

            // Insert active shift if exists
            if (data.activeShift) {
                // Check if not already in history (by ID) to avoid dupes
                const exists = data.shiftHistory.find(s => s.id === data.activeShift.id);
                if (!exists) stmt.run(data.activeShift);
            }
        } else if (data.activeShift) {
            // Only active shift exists
            db.prepare('DELETE FROM shifts').run();
            db.prepare(`INSERT INTO shifts (id, start_time, end_time, start_cash, end_cash, actual_cash, difference, status, performed_by_id, notes)
                         VALUES (@id, @startTime, @endTime, @startCash, @endCash, @actualCash, @difference, @status, @performedById, @notes)`)
                .run(data.activeShift);
        }
    });

    try {
        transaction(data);
        console.log('Bulk save completed successfully for all tables.');
        return true;
    } catch (err) {
        console.error("Bulk Save Error", err);
        return false;
    }
}

module.exports = {
    initDatabase,
    loadAllData,
    saveBulk,
    db
};

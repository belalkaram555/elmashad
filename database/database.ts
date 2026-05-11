/**
 * Database Service for M4D CAFE POS
 * Handles all database operations using better-sqlite3
 */

// This file runs in Electron main process or via IPC
// This file is shared but primarily legacy for direct access.
// In Renderer, we should use IPC. To prevent crashes, we disable direct loading here.
const Database = null;
// formerly: require('better-sqlite3') - removed to prevent Renderer crash

const path = typeof window !== 'undefined' && (window as any).require
    ? (window as any).require('path')
    : null;

const fs = typeof window !== 'undefined' && (window as any).require
    ? (window as any).require('fs')
    : null;

const { app } = typeof window !== 'undefined' && (window as any).require
    ? (window as any).require('electron').remote || {}
    : {};

import { encrypt, decrypt } from '../utils/encryption';

let db: any = null;

/**
 * Get the database file path
 */
function getDbPath(): string {
    if (app && app.getPath) {
        const userDataPath = app.getPath('userData');
        return path.join(userDataPath, 'pos_database.db');
    }
    // Fallback for development
    return './pos_database.db';
}

/**
 * Initialize the database
 */
export function initDatabase(): boolean {
    if (!Database) {
        console.warn('Database not available (running in browser mode)');
        return false;
    }

    try {
        const dbPath = getDbPath();

        // Ensure directory exists
        const dir = path.dirname(dbPath);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }

        db = new Database(dbPath);
        db.pragma('journal_mode = WAL');

        // Read and execute schema
        const schemaPath = path.join(__dirname, 'schema.sql');
        if (fs.existsSync(schemaPath)) {
            const schema = fs.readFileSync(schemaPath, 'utf8');
            db.exec(schema);
        }

        console.log('Database initialized at:', dbPath);
        return true;
    } catch (error) {
        console.error('Failed to initialize database:', error);
        return false;
    }
}

/**
 * Check if database is available
 */
export function isDatabaseAvailable(): boolean {
    return db !== null;
}

/**
 * Close the database connection
 */
export function closeDatabase(): void {
    if (db) {
        db.close();
        db = null;
    }
}

// ==================== GENERIC CRUD HELPERS ====================

function runQuery(sql: string, params: any[] = []): any {
    if (!db) return null;
    return db.prepare(sql).run(...params);
}

function getOne(sql: string, params: any[] = []): any {
    if (!db) return null;
    return db.prepare(sql).get(...params);
}

function getAll(sql: string, params: any[] = []): any[] {
    if (!db) return [];
    return db.prepare(sql).all(...params);
}

// ==================== CATEGORIES ====================

export const categoriesDb = {
    getAll: () => getAll('SELECT * FROM categories ORDER BY created_at DESC'),

    getById: (id: string) => getOne('SELECT * FROM categories WHERE id = ?', [id]),

    create: (category: { id: string; nameAr: string; nameEn: string; icon?: string }) => {
        return runQuery(
            'INSERT INTO categories (id, name_ar, name_en, icon) VALUES (?, ?, ?, ?)',
            [category.id, category.nameAr, category.nameEn, category.icon || null]
        );
    },

    update: (category: { id: string; nameAr: string; nameEn: string; icon?: string }) => {
        return runQuery(
            'UPDATE categories SET name_ar = ?, name_en = ?, icon = ?, updated_at = datetime("now") WHERE id = ?',
            [category.nameAr, category.nameEn, category.icon || null, category.id]
        );
    },

    delete: (id: string) => runQuery('DELETE FROM categories WHERE id = ?', [id])
};

// ==================== MENU ITEMS ====================

export const menuItemsDb = {
    getAll: () => {
        const items = getAll('SELECT * FROM menu_items ORDER BY created_at DESC');
        return items.map((item: any) => ({
            ...item,
            nameAr: item.name_ar,
            nameEn: item.name_en,
            basePrice: item.base_price,
            categoryId: item.category_id,
            variants: JSON.parse(item.variants || '[]'),
            addons: JSON.parse(item.addons || '[]'),
            recipe: JSON.parse(item.recipe || '[]'),
            available: !!item.available
        }));
    },

    create: (item: any) => {
        return runQuery(
            `INSERT INTO menu_items (id, name_ar, name_en, base_price, cost, category_id, image, available, variants, addons, recipe)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                item.id, item.nameAr, item.nameEn, item.basePrice, item.cost,
                item.categoryId, item.image, item.available ? 1 : 0,
                JSON.stringify(item.variants || []),
                JSON.stringify(item.addons || []),
                JSON.stringify(item.recipe || [])
            ]
        );
    },

    update: (item: any) => {
        return runQuery(
            `UPDATE menu_items SET 
        name_ar = ?, name_en = ?, base_price = ?, cost = ?, category_id = ?,
        image = ?, available = ?, variants = ?, addons = ?, recipe = ?, updated_at = datetime("now")
       WHERE id = ?`,
            [
                item.nameAr, item.nameEn, item.basePrice, item.cost, item.categoryId,
                item.image, item.available ? 1 : 0,
                JSON.stringify(item.variants || []),
                JSON.stringify(item.addons || []),
                JSON.stringify(item.recipe || []),
                item.id
            ]
        );
    },

    delete: (id: string) => runQuery('DELETE FROM menu_items WHERE id = ?', [id])
};

// ==================== ORDERS ====================

export const ordersDb = {
    getAll: () => {
        const orders = getAll('SELECT * FROM orders ORDER BY created_at DESC');
        return orders.map((order: any) => ({
            ...order,
            items: JSON.parse(order.items || '[]'),
            serviceCharge: order.service_charge,
            amountReceived: order.amount_received,
            changeAmount: order.change_amount,
            customerId: order.customer_id,
            tableId: order.table_id,
            shiftId: order.shift_id,
            performedBy: JSON.parse(order.performed_by || 'null'),
            createdAt: order.created_at,
            completedAt: order.completed_at
        }));
    },

    create: (order: any) => {
        return runQuery(
            `INSERT INTO orders (id, items, subtotal, discount, tax, service_charge, total, payment_method,
        amount_received, change_amount, customer_id, type, table_id, status, shift_id, performed_by, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                order.id, JSON.stringify(order.items), order.subtotal, order.discount, order.tax,
                order.serviceCharge, order.total, order.paymentMethod, order.amountReceived,
                order.changeAmount, order.customerId, order.type, order.tableId, order.status,
                order.shiftId, JSON.stringify(order.performedBy), order.createdAt
            ]
        );
    },

    updateStatus: (id: string, status: string) => {
        const completedAt = status === 'completed' ? new Date().toISOString() : null;
        return runQuery(
            'UPDATE orders SET status = ?, completed_at = ? WHERE id = ?',
            [status, completedAt, id]
        );
    },

    delete: (id: string) => runQuery('DELETE FROM orders WHERE id = ?', [id])
};

// ==================== EMPLOYEES ====================

export const employeesDb = {
    getAll: () => {
        const employees = getAll('SELECT * FROM employees ORDER BY created_at DESC');
        return employees.map((emp: any) => ({
            id: emp.id,
            nameAr: emp.name_ar,
            nameEn: emp.name_en,
            role: emp.role,
            baseSalary: emp.base_salary,
            penaltyDays: emp.penalty_days,
            absenceDays: emp.absence_days,
            bonuses: emp.bonuses,
            insurance: emp.insurance,
            status: emp.status,
            joinDate: emp.join_date,
            leftDate: emp.left_date,
            shiftStart: emp.shift_start,
            shiftEnd: emp.shift_end,
            phone: emp.phone,
            username: emp.username,
            // Password is not returned for security
        }));
    },

    create: (emp: any) => {
        const encryptedPassword = emp.password ? encrypt(emp.password) : null;
        return runQuery(
            `INSERT INTO employees (id, name_ar, name_en, role, base_salary, penalty_days, absence_days,
        bonuses, insurance, status, join_date, left_date, shift_start, shift_end, phone, username, password_encrypted)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                emp.id, emp.nameAr, emp.nameEn, emp.role, emp.baseSalary, emp.penaltyDays,
                emp.absenceDays, emp.bonuses, emp.insurance, emp.status, emp.joinDate,
                emp.leftDate, emp.shiftStart, emp.shiftEnd, emp.phone, emp.username, encryptedPassword
            ]
        );
    },

    verifyCredentials: (username: string, password: string) => {
        const emp = getOne('SELECT * FROM employees WHERE username = ?', [username.toLowerCase()]);
        if (!emp || !emp.password_encrypted) return null;

        try {
            const decryptedPassword = decrypt(emp.password_encrypted);
            if (decryptedPassword === password) {
                return {
                    id: emp.id,
                    nameAr: emp.name_ar,
                    nameEn: emp.name_en,
                    role: emp.role
                };
            }
        } catch (e) {
            console.error('Password verification failed:', e);
        }
        return null;
    },

    update: (emp: any) => {
        let sql = `UPDATE employees SET 
      name_ar = ?, name_en = ?, role = ?, base_salary = ?, penalty_days = ?,
      absence_days = ?, bonuses = ?, insurance = ?, status = ?, join_date = ?,
      left_date = ?, shift_start = ?, shift_end = ?, phone = ?, username = ?, updated_at = datetime("now")`;

        const params = [
            emp.nameAr, emp.nameEn, emp.role, emp.baseSalary, emp.penaltyDays,
            emp.absenceDays, emp.bonuses, emp.insurance, emp.status, emp.joinDate,
            emp.leftDate, emp.shiftStart, emp.shiftEnd, emp.phone, emp.username
        ];

        // Only update password if provided
        if (emp.password) {
            sql += ', password_encrypted = ?';
            params.push(encrypt(emp.password));
        }

        sql += ' WHERE id = ?';
        params.push(emp.id);

        return runQuery(sql, params);
    },

    delete: (id: string) => runQuery('DELETE FROM employees WHERE id = ?', [id])
};

// ==================== SETTINGS ====================

export const settingsDb = {
    get: () => {
        const settings = getOne('SELECT * FROM settings WHERE id = 1');
        if (!settings) return null;

        return {
            restaurantNameEn: settings.restaurant_name_en,
            restaurantNameAr: settings.restaurant_name_ar,
            branchNameAr: settings.branch_name_ar,
            taxId: settings.tax_id,
            addressAr: settings.address_ar,
            phone: settings.phone,
            taxRate: settings.tax_rate,
            serviceRate: settings.service_rate,
            currencyEn: settings.currency_en,
            currencyAr: settings.currency_ar,
            printerName: settings.printer_name,
            printFormat: settings.print_format,
            autoBackup: !!settings.auto_backup,
            defaultAutoPrint: !!settings.default_auto_print,
            defaultCompactView: !!settings.default_compact_view,
            adminUsername: settings.admin_username,
            // adminPassword is not returned
        };
    },

    update: (settings: any) => {
        let sql = `UPDATE settings SET 
      restaurant_name_en = ?, restaurant_name_ar = ?, branch_name_ar = ?,
      tax_id = ?, address_ar = ?, phone = ?, tax_rate = ?, service_rate = ?,
      currency_en = ?, currency_ar = ?, printer_name = ?, print_format = ?,
      auto_backup = ?, default_auto_print = ?, default_compact_view = ?,
      admin_username = ?, updated_at = datetime("now")`;

        const params = [
            settings.restaurantNameEn, settings.restaurantNameAr, settings.branchNameAr,
            settings.taxId, settings.addressAr, settings.phone, settings.taxRate, settings.serviceRate,
            settings.currencyEn, settings.currencyAr, settings.printerName, settings.printFormat,
            settings.autoBackup ? 1 : 0, settings.defaultAutoPrint ? 1 : 0, settings.defaultCompactView ? 1 : 0,
            settings.adminUsername
        ];

        if (settings.adminPassword) {
            sql += ', admin_password_encrypted = ?';
            params.push(encrypt(settings.adminPassword));
        }

        sql += ' WHERE id = 1';

        return runQuery(sql, params);
    },

    verifyAdminPassword: (password: string): boolean => {
        const settings = getOne('SELECT admin_password_encrypted FROM settings WHERE id = 1');
        if (!settings || !settings.admin_password_encrypted) {
            // No password set, use default
            return password === '123456';
        }

        try {
            const decrypted = decrypt(settings.admin_password_encrypted);
            return decrypted === password;
        } catch {
            return false;
        }
    }
};

// ==================== EXPORT ALL DATA (for backup) ====================

export function exportAllData(): object {
    return {
        categories: categoriesDb.getAll(),
        menuItems: menuItemsDb.getAll(),
        orders: ordersDb.getAll(),
        employees: employeesDb.getAll(),
        settings: settingsDb.get(),
        exportedAt: new Date().toISOString(),
        version: '2.5.0'
    };
}

// ==================== IMPORT DATA (restore backup) ====================

export function importAllData(data: any): boolean {
    if (!db) return false;

    try {
        const transaction = db.transaction(() => {
            // Clear existing data
            db.exec('DELETE FROM categories');
            db.exec('DELETE FROM menu_items');
            db.exec('DELETE FROM orders');
            // Note: Not deleting employees and settings to preserve credentials

            // Import categories
            if (data.categories) {
                for (const cat of data.categories) {
                    categoriesDb.create(cat);
                }
            }

            // Import menu items
            if (data.menuItems) {
                for (const item of data.menuItems) {
                    menuItemsDb.create(item);
                }
            }

            // Import orders
            if (data.orders) {
                for (const order of data.orders) {
                    ordersDb.create(order);
                }
            }
        });

        transaction();
        return true;
    } catch (error) {
        console.error('Import failed:', error);
        return false;
    }
}

export default {
    initDatabase,
    isDatabaseAvailable,
    closeDatabase,
    categories: categoriesDb,
    menuItems: menuItemsDb,
    orders: ordersDb,
    employees: employeesDb,
    settings: settingsDb,
    exportAllData,
    importAllData
};

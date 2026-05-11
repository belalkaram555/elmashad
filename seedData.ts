// Seed Data - محاكاة لبيانات حقيقية مترابطة
// هذا الملف يحتوي على بيانات تجريبية واقعية لاختبار النظام

import {
    Category, MenuItem, InventoryItem, Employee, Customer, Supplier,
    Warehouse, Order, Purchase, TreasuryTransaction, AttendanceRecord, StockMovement, Table
} from './types';

// =================== المخازن ===================
export const SEED_WAREHOUSES: Warehouse[] = [
    { id: 'wh-001', name: 'المخزن الرئيسي', location: 'الدور الأول' },
    { id: 'wh-002', name: 'مخزن المطبخ', location: 'المطبخ الرئيسي' },
    { id: 'wh-003', name: 'مخزن التبريد', location: 'غرفة التبريد' },
];

// =================== الأقسام ===================
export const SEED_CATEGORIES: Category[] = [
    { id: 'cat-001', nameAr: 'المشروبات الساخنة', nameEn: 'Hot Drinks', icon: '☕' },
    { id: 'cat-002', nameAr: 'المشروبات الباردة', nameEn: 'Cold Drinks', icon: '🥤' },
    { id: 'cat-003', nameAr: 'السندويتشات', nameEn: 'Sandwiches', icon: '🥪' },
    { id: 'cat-004', nameAr: 'الوجبات الرئيسية', nameEn: 'Main Dishes', icon: '🍽️' },
    { id: 'cat-005', nameAr: 'الحلويات', nameEn: 'Desserts', icon: '🍰' },
    { id: 'cat-006', nameAr: 'المقبلات', nameEn: 'Appetizers', icon: '🥗' },
];

// =================== المواد الخام ===================
export const SEED_INVENTORY: InventoryItem[] = [
    { id: 'inv-001', nameAr: 'بن عربي', nameEn: 'Arabic Coffee', unit: 'kg', minLevel: 5, costPerUnit: 250, warehouseQuantities: { 'wh-001': 20, 'wh-002': 5 } },
    { id: 'inv-002', nameAr: 'حليب طازج', nameEn: 'Fresh Milk', unit: 'l', minLevel: 10, costPerUnit: 25, warehouseQuantities: { 'wh-003': 50, 'wh-002': 10 } },
    { id: 'inv-003', nameAr: 'سكر', nameEn: 'Sugar', unit: 'kg', minLevel: 20, costPerUnit: 15, warehouseQuantities: { 'wh-001': 100, 'wh-002': 15 } },
    { id: 'inv-004', nameAr: 'دجاج طازج', nameEn: 'Fresh Chicken', unit: 'kg', minLevel: 10, costPerUnit: 85, warehouseQuantities: { 'wh-003': 30, 'wh-002': 10 } },
    { id: 'inv-005', nameAr: 'لحم بقري', nameEn: 'Beef', unit: 'kg', minLevel: 8, costPerUnit: 220, warehouseQuantities: { 'wh-003': 20, 'wh-002': 5 } },
    { id: 'inv-006', nameAr: 'خبز صامولي', nameEn: 'Sandwich Bread', unit: 'piece', minLevel: 50, costPerUnit: 2, warehouseQuantities: { 'wh-001': 200, 'wh-002': 50 } },
    { id: 'inv-007', nameAr: 'جبنة شيدر', nameEn: 'Cheddar Cheese', unit: 'kg', minLevel: 5, costPerUnit: 180, warehouseQuantities: { 'wh-003': 15, 'wh-002': 3 } },
    { id: 'inv-008', nameAr: 'طماطم', nameEn: 'Tomatoes', unit: 'kg', minLevel: 10, costPerUnit: 20, warehouseQuantities: { 'wh-003': 25, 'wh-002': 8 } },
    { id: 'inv-009', nameAr: 'خيار', nameEn: 'Cucumber', unit: 'kg', minLevel: 8, costPerUnit: 15, warehouseQuantities: { 'wh-003': 20, 'wh-002': 5 } },
    { id: 'inv-010', nameAr: 'زيت زيتون', nameEn: 'Olive Oil', unit: 'l', minLevel: 5, costPerUnit: 120, warehouseQuantities: { 'wh-001': 20, 'wh-002': 5 } },
    { id: 'inv-011', nameAr: 'أرز بسمتي', nameEn: 'Basmati Rice', unit: 'kg', minLevel: 20, costPerUnit: 45, warehouseQuantities: { 'wh-001': 80, 'wh-002': 15 } },
    { id: 'inv-012', nameAr: 'بطاطس', nameEn: 'Potatoes', unit: 'kg', minLevel: 15, costPerUnit: 18, warehouseQuantities: { 'wh-003': 40, 'wh-002': 10 } },
    { id: 'inv-013', nameAr: 'شاي سيلاني', nameEn: 'Ceylon Tea', unit: 'kg', minLevel: 3, costPerUnit: 180, warehouseQuantities: { 'wh-001': 10, 'wh-002': 2 } },
    { id: 'inv-014', nameAr: 'كريمة طبخ', nameEn: 'Cooking Cream', unit: 'l', minLevel: 5, costPerUnit: 35, warehouseQuantities: { 'wh-003': 20, 'wh-002': 5 } },
    { id: 'inv-015', nameAr: 'دقيق', nameEn: 'Flour', unit: 'kg', minLevel: 25, costPerUnit: 12, warehouseQuantities: { 'wh-001': 100, 'wh-002': 20 } },
];

// =================== قائمة الطعام ===================
export const SEED_MENU: MenuItem[] = [
    { id: 'menu-001', nameAr: 'قهوة عربية', nameEn: 'Arabic Coffee', basePrice: 25, cost: 8, categoryId: 'cat-001', image: '', available: true, variants: [{ id: 'v1', nameAr: 'صغير', nameEn: 'Small', price: 0 }, { id: 'v2', nameAr: 'كبير', nameEn: 'Large', price: 10 }], addons: [], recipe: [{ inventoryItemId: 'inv-001', quantity: 0.02 }] },
    { id: 'menu-002', nameAr: 'لاتيه', nameEn: 'Latte', basePrice: 35, cost: 12, categoryId: 'cat-001', image: '', available: true, variants: [{ id: 'v1', nameAr: 'صغير', nameEn: 'Small', price: 0 }, { id: 'v2', nameAr: 'كبير', nameEn: 'Large', price: 12 }], addons: [{ id: 'a1', nameAr: 'شوكولاتة', nameEn: 'Chocolate', price: 5 }], recipe: [{ inventoryItemId: 'inv-001', quantity: 0.015 }, { inventoryItemId: 'inv-002', quantity: 0.2 }] },
    { id: 'menu-003', nameAr: 'كابتشينو', nameEn: 'Cappuccino', basePrice: 32, cost: 11, categoryId: 'cat-001', image: '', available: true, variants: [], addons: [{ id: 'a1', nameAr: 'كريمة', nameEn: 'Cream', price: 8 }], recipe: [{ inventoryItemId: 'inv-001', quantity: 0.015 }, { inventoryItemId: 'inv-002', quantity: 0.15 }] },
    { id: 'menu-004', nameAr: 'شاي بالحليب', nameEn: 'Milk Tea', basePrice: 18, cost: 5, categoryId: 'cat-001', image: '', available: true, variants: [], addons: [], recipe: [{ inventoryItemId: 'inv-013', quantity: 0.01 }, { inventoryItemId: 'inv-002', quantity: 0.1 }] },
    { id: 'menu-005', nameAr: 'عصير برتقال', nameEn: 'Orange Juice', basePrice: 28, cost: 10, categoryId: 'cat-002', image: '', available: true, variants: [], addons: [], recipe: [] },
    { id: 'menu-006', nameAr: 'سموذي فراولة', nameEn: 'Strawberry Smoothie', basePrice: 38, cost: 15, categoryId: 'cat-002', image: '', available: true, variants: [], addons: [], recipe: [{ inventoryItemId: 'inv-002', quantity: 0.2 }] },
    { id: 'menu-007', nameAr: 'ساندويتش دجاج', nameEn: 'Chicken Sandwich', basePrice: 45, cost: 18, categoryId: 'cat-003', image: '', available: true, variants: [], addons: [{ id: 'a1', nameAr: 'جبنة إضافية', nameEn: 'Extra Cheese', price: 10 }], recipe: [{ inventoryItemId: 'inv-004', quantity: 0.15 }, { inventoryItemId: 'inv-006', quantity: 1 }, { inventoryItemId: 'inv-007', quantity: 0.03 }] },
    { id: 'menu-008', nameAr: 'برجر لحم', nameEn: 'Beef Burger', basePrice: 65, cost: 28, categoryId: 'cat-003', image: '', available: true, variants: [{ id: 'v1', nameAr: 'عادي', nameEn: 'Regular', price: 0 }, { id: 'v2', nameAr: 'دبل', nameEn: 'Double', price: 25 }], addons: [{ id: 'a1', nameAr: 'بيض', nameEn: 'Egg', price: 8 }], recipe: [{ inventoryItemId: 'inv-005', quantity: 0.15 }, { inventoryItemId: 'inv-006', quantity: 1 }] },
    { id: 'menu-009', nameAr: 'مشاوي مشكلة', nameEn: 'Mixed Grill', basePrice: 150, cost: 65, categoryId: 'cat-004', image: '', available: true, variants: [], addons: [], recipe: [{ inventoryItemId: 'inv-004', quantity: 0.2 }, { inventoryItemId: 'inv-005', quantity: 0.2 }, { inventoryItemId: 'inv-011', quantity: 0.15 }] },
    { id: 'menu-010', nameAr: 'فتة دجاج', nameEn: 'Chicken Fattah', basePrice: 85, cost: 35, categoryId: 'cat-004', image: '', available: true, variants: [], addons: [], recipe: [{ inventoryItemId: 'inv-004', quantity: 0.25 }, { inventoryItemId: 'inv-011', quantity: 0.2 }] },
    { id: 'menu-011', nameAr: 'سلطة خضراء', nameEn: 'Green Salad', basePrice: 25, cost: 8, categoryId: 'cat-006', image: '', available: true, variants: [], addons: [], recipe: [{ inventoryItemId: 'inv-008', quantity: 0.1 }, { inventoryItemId: 'inv-009', quantity: 0.1 }] },
    { id: 'menu-012', nameAr: 'كنافة', nameEn: 'Kunafa', basePrice: 35, cost: 12, categoryId: 'cat-005', image: '', available: true, variants: [], addons: [{ id: 'a1', nameAr: 'آيس كريم', nameEn: 'Ice Cream', price: 15 }], recipe: [{ inventoryItemId: 'inv-015', quantity: 0.1 }, { inventoryItemId: 'inv-003', quantity: 0.05 }] },
];

// =================== الموظفين ===================
export const SEED_EMPLOYEES: Employee[] = [
    { id: 'emp-001', nameAr: 'أحمد محمد علي', nameEn: 'Ahmed Mohamed Ali', role: 'manager', baseSalary: 12000, penaltyDays: 0, absenceDays: 1, bonuses: 500, insurance: 800, status: 'active', joinDate: '2023-01-15', shiftStart: '08:00', shiftEnd: '17:00', phone: '01012345678', username: 'ahmed', password: '123456' },
    { id: 'emp-002', nameAr: 'محمد أحمد سالم', nameEn: 'Mohamed Ahmed Salem', role: 'cashier', baseSalary: 6000, penaltyDays: 1, absenceDays: 2, bonuses: 200, insurance: 400, status: 'active', joinDate: '2023-03-01', shiftStart: '09:00', shiftEnd: '18:00', phone: '01123456789', username: 'mohamed', password: '123456' },
    { id: 'emp-003', nameAr: 'علي حسن إبراهيم', nameEn: 'Ali Hassan Ibrahim', role: 'chef', baseSalary: 8000, penaltyDays: 0, absenceDays: 0, bonuses: 300, insurance: 500, status: 'active', joinDate: '2023-02-10', shiftStart: '07:00', shiftEnd: '16:00', phone: '01234567890', username: 'ali', password: '123456' },
    { id: 'emp-004', nameAr: 'خالد عبدالله محمود', nameEn: 'Khaled Abdullah Mahmoud', role: 'cashier', baseSalary: 5500, penaltyDays: 2, absenceDays: 3, bonuses: 0, insurance: 350, status: 'active', joinDate: '2023-06-15', shiftStart: '14:00', shiftEnd: '23:00', phone: '01098765432', username: 'khaled', password: '123456' },
    { id: 'emp-005', nameAr: 'حسام الدين عمر', nameEn: 'Hossam El-Din Omar', role: 'accountant', baseSalary: 9000, penaltyDays: 0, absenceDays: 1, bonuses: 400, insurance: 600, status: 'active', joinDate: '2023-04-01', shiftStart: '09:00', shiftEnd: '17:00', phone: '01156789012', username: 'hossam', password: '123456' },
];

// =================== العملاء ===================
export const SEED_CUSTOMERS: Customer[] = [
    { id: 'cust-001', name: 'شركة الفجر للتموين', phone: '01000000001', address: '15 شارع الجمهورية، القاهرة', balance: 5500 },
    { id: 'cust-002', name: 'مطعم النيل', phone: '01000000002', address: '25 شارع النيل، الجيزة', balance: 3200 },
    { id: 'cust-003', name: 'محمد عبدالرحمن', phone: '01000000003', address: '10 شارع المعز، القاهرة', balance: 850 },
    { id: 'cust-004', name: 'فندق الأهرامات', phone: '01000000004', address: '1 ميدان الأهرامات، الجيزة', balance: 15000 },
    { id: 'cust-005', name: 'كافيه الوادي', phone: '01000000005', address: '5 شارع الحرية، مدينة نصر', balance: 0 },
    { id: 'cust-006', name: 'أحمد سعيد', phone: '01000000006', address: '30 شارع الثورة، المعادي', balance: 1200 },
    { id: 'cust-007', name: 'نادي سبورتنج', phone: '01000000007', address: '50 طريق الإسكندرية الصحراوي', balance: 8500 },
];

// =================== الموردين ===================
export const SEED_SUPPLIERS: Supplier[] = [
    { id: 'sup-001', name: 'شركة الأمل للحوم', phone: '01100000001', address: '10 شارع السلام، العبور', companyName: 'الأمل للحوم المجمدة', balance: 12000 },
    { id: 'sup-002', name: 'مزارع الوادي', phone: '01100000002', address: '5 طريق الإسماعيلية', companyName: 'خضروات الوادي الطازجة', balance: 3500 },
    { id: 'sup-003', name: 'شركة النسيم للألبان', phone: '01100000003', address: '20 شارع الصناعات، 6 أكتوبر', companyName: 'ألبان النسيم', balance: 8000 },
    { id: 'sup-004', name: 'مطاحن مصر', phone: '01100000004', address: '1 شارع الجلاء، شبرا', companyName: 'مطاحن مصر العليا', balance: 4500 },
    { id: 'sup-005', name: 'شركة القهوة العربية', phone: '01100000005', address: '15 شارع محمد علي، الموسكي', companyName: 'القهوة العربية الفاخرة', balance: 6000 },
];

// =================== الطاولات ===================
export const SEED_TABLES: Table[] = [
    { id: 'table-001', name: 'طاولة 1', capacity: 4, status: 'available', x: 50, y: 50 },
    { id: 'table-002', name: 'طاولة 2', capacity: 4, status: 'occupied', x: 150, y: 50 },
    { id: 'table-003', name: 'طاولة 3', capacity: 6, status: 'available', x: 250, y: 50 },
    { id: 'table-004', name: 'طاولة 4', capacity: 2, status: 'reserved', x: 50, y: 150 },
    { id: 'table-005', name: 'طاولة 5', capacity: 8, status: 'available', x: 150, y: 150 },
    { id: 'table-006', name: 'طاولة VIP', capacity: 10, status: 'available', x: 250, y: 150 },
];

// =================== الطلبات ===================
const today = new Date().toISOString().split('T')[0];
const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
const twoDaysAgo = new Date(Date.now() - 172800000).toISOString().split('T')[0];

export const SEED_ORDERS: Order[] = [
    { id: 'ord-001', items: [{ ...SEED_MENU[0], quantity: 2, selectedAddons: [], totalItemPrice: 50 }, { ...SEED_MENU[6], quantity: 1, selectedAddons: [], totalItemPrice: 45 }], subtotal: 95, discount: 0, tax: 13.3, serviceCharge: 11.4, total: 119.7, paymentMethod: 'cash', amountReceived: 120, changeAmount: 0.3, type: 'takeaway', status: 'completed', createdAt: `${today}T09:30:00`, completedAt: `${today}T10:00:00`, performedBy: { name: 'محمد أحمد', role: 'cashier' } },
    { id: 'ord-002', items: [{ ...SEED_MENU[8], quantity: 1, selectedAddons: [], totalItemPrice: 150 }], subtotal: 150, discount: 10, tax: 19.6, serviceCharge: 16.8, total: 176.4, paymentMethod: 'instapay', customerId: 'cust-001', customerName: 'أحمد خالد', type: 'customer', status: 'completed', createdAt: `${today}T12:15:00`, completedAt: `${today}T13:00:00`, performedBy: { name: 'محمد أحمد', role: 'cashier' } },
    { id: 'ord-003', items: [{ ...SEED_MENU[7], quantity: 2, selectedAddons: [], totalItemPrice: 130 }, { ...SEED_MENU[4], quantity: 2, selectedAddons: [], totalItemPrice: 56 }], subtotal: 186, discount: 0, tax: 26.04, serviceCharge: 22.32, total: 234.36, paymentMethod: 'cash', amountReceived: 250, changeAmount: 15.64, type: 'takeaway', status: 'completed', createdAt: `${today}T14:30:00`, completedAt: `${today}T14:45:00`, performedBy: { name: 'خالد عبدالله', role: 'cashier' } },
    { id: 'ord-004', items: [{ ...SEED_MENU[1], quantity: 3, selectedAddons: [], totalItemPrice: 105 }, { ...SEED_MENU[11], quantity: 2, selectedAddons: [], totalItemPrice: 70 }], subtotal: 175, discount: 15, tax: 22.4, serviceCharge: 19.2, total: 201.6, paymentMethod: 'credit', customerId: 'cust-002', customerName: 'سارة محمد', type: 'customer', status: 'completed', createdAt: `${yesterday}T11:00:00`, completedAt: `${yesterday}T11:45:00`, performedBy: { name: 'محمد أحمد', role: 'cashier' } },
    { id: 'ord-005', items: [{ ...SEED_MENU[9], quantity: 1, selectedAddons: [], totalItemPrice: 85 }, { ...SEED_MENU[10], quantity: 1, selectedAddons: [], totalItemPrice: 25 }], subtotal: 110, discount: 0, tax: 15.4, serviceCharge: 13.2, total: 138.6, paymentMethod: 'cash', amountReceived: 150, changeAmount: 11.4, type: 'takeaway', status: 'completed', createdAt: `${yesterday}T19:30:00`, completedAt: `${yesterday}T20:15:00`, performedBy: { name: 'خالد عبدالله', role: 'cashier' } },
    { id: 'ord-006', items: [{ ...SEED_MENU[2], quantity: 4, selectedAddons: [], totalItemPrice: 128 }], subtotal: 128, discount: 0, tax: 17.92, serviceCharge: 15.36, total: 161.28, paymentMethod: 'instapay', type: 'takeaway', status: 'completed', createdAt: `${twoDaysAgo}T10:00:00`, completedAt: `${twoDaysAgo}T10:15:00`, performedBy: { name: 'محمد أحمد', role: 'cashier' } },
];

// =================== المشتريات ===================
export const SEED_PURCHASES: Purchase[] = [
    { id: 'pur-001', supplierId: 'sup-001', supplierName: 'شركة الأمل للحوم', warehouseId: 'wh-003', invoiceNumber: 'INV-2025-001', date: `${yesterday}`, items: [{ inventoryItemId: 'inv-004', itemName: 'دجاج طازج', quantity: 20, cost: 85, total: 1700 }, { inventoryItemId: 'inv-005', itemName: 'لحم بقري', quantity: 10, cost: 220, total: 2200 }], totalAmount: 3900, paymentMethod: 'credit', notes: 'توريد أسبوعي', performedBy: { name: 'أحمد محمد', role: 'manager' } },
    { id: 'pur-002', supplierId: 'sup-002', supplierName: 'مزارع الوادي', warehouseId: 'wh-003', invoiceNumber: 'INV-2025-002', date: `${yesterday}`, items: [{ inventoryItemId: 'inv-008', itemName: 'طماطم', quantity: 15, cost: 20, total: 300 }, { inventoryItemId: 'inv-009', itemName: 'خيار', quantity: 10, cost: 15, total: 150 }, { inventoryItemId: 'inv-012', itemName: 'بطاطس', quantity: 25, cost: 18, total: 450 }], totalAmount: 900, paymentMethod: 'cash', performedBy: { name: 'أحمد محمد', role: 'manager' } },
    { id: 'pur-003', supplierId: 'sup-003', supplierName: 'شركة النسيم للألبان', warehouseId: 'wh-003', invoiceNumber: 'INV-2025-003', date: `${twoDaysAgo}`, items: [{ inventoryItemId: 'inv-002', itemName: 'حليب طازج', quantity: 40, cost: 25, total: 1000 }, { inventoryItemId: 'inv-014', itemName: 'كريمة طبخ', quantity: 15, cost: 35, total: 525 }], totalAmount: 1525, paymentMethod: 'credit', performedBy: { name: 'أحمد محمد', role: 'manager' } },
    { id: 'pur-004', supplierId: 'sup-005', supplierName: 'شركة القهوة العربية', warehouseId: 'wh-001', invoiceNumber: 'INV-2025-004', date: `${twoDaysAgo}`, items: [{ inventoryItemId: 'inv-001', itemName: 'بن عربي', quantity: 10, cost: 250, total: 2500 }, { inventoryItemId: 'inv-013', itemName: 'شاي سيلاني', quantity: 5, cost: 180, total: 900 }], totalAmount: 3400, paymentMethod: 'cash', performedBy: { name: 'أحمد محمد', role: 'manager' } },
];

// =================== حركات الخزينة ===================
export const SEED_TREASURY: TreasuryTransaction[] = [
    { id: 'trx-001', type: 'income', category: 'sales', amount: 119.7, date: `${today}`, description: 'مبيعات نقدية - طلب #ord-001', referenceId: 'ord-001', performedBy: { name: 'محمد أحمد', role: 'cashier' } },
    { id: 'trx-002', type: 'income', category: 'sales', amount: 234.36, date: `${today}`, description: 'مبيعات نقدية - طلب #ord-003', referenceId: 'ord-003', performedBy: { name: 'خالد عبدالله', role: 'cashier' } },
    { id: 'trx-003', type: 'expense', category: 'purchases', amount: 900, date: `${yesterday}`, description: 'فاتورة شراء خضروات - مزارع الوادي', referenceId: 'pur-002', performedBy: { name: 'أحمد محمد', role: 'manager' } },
    { id: 'trx-004', type: 'expense', category: 'purchases', amount: 3400, date: `${twoDaysAgo}`, description: 'فاتورة شراء قهوة وشاي', referenceId: 'pur-004', performedBy: { name: 'أحمد محمد', role: 'manager' } },
    { id: 'trx-005', type: 'expense', category: 'salaries', amount: 6000, date: `${twoDaysAgo}`, description: 'راتب موظف - محمد أحمد سالم', performedBy: { name: 'حسام الدين عمر', role: 'accountant' } },
    { id: 'trx-006', type: 'expense', category: 'utilities', amount: 2500, date: `${twoDaysAgo}`, description: 'فاتورة كهرباء شهر ديسمبر', performedBy: { name: 'أحمد محمد', role: 'manager' } },
    { id: 'trx-007', type: 'income', category: 'sales', amount: 138.6, date: `${yesterday}`, description: 'مبيعات نقدية - طلب #ord-005', referenceId: 'ord-005', performedBy: { name: 'خالد عبدالله', role: 'cashier' } },
    { id: 'trx-008', type: 'expense', category: 'maintenance', amount: 800, date: `${yesterday}`, description: 'صيانة ماكينة القهوة', performedBy: { name: 'أحمد محمد', role: 'manager' } },
];

// =================== حركات المخزون ===================
export const SEED_STOCK_MOVEMENTS: StockMovement[] = [
    { id: 'mov-001', itemId: 'inv-004', warehouseId: 'wh-003', type: 'purchase', quantity: 20, date: `${yesterday}`, notes: 'توريد من شركة الأمل للحوم' },
    { id: 'mov-002', itemId: 'inv-005', warehouseId: 'wh-003', type: 'purchase', quantity: 10, date: `${yesterday}`, notes: 'توريد من شركة الأمل للحوم' },
    { id: 'mov-003', itemId: 'inv-008', warehouseId: 'wh-003', type: 'purchase', quantity: 15, date: `${yesterday}`, notes: 'توريد من مزارع الوادي' },
    { id: 'mov-004', itemId: 'inv-001', warehouseId: 'wh-001', type: 'purchase', quantity: 10, date: `${twoDaysAgo}`, notes: 'توريد قهوة' },
    { id: 'mov-005', itemId: 'inv-001', warehouseId: 'wh-002', type: 'transfer_in', quantity: 2, date: `${today}`, notes: 'نقل للمطبخ' },
    { id: 'mov-006', itemId: 'inv-001', warehouseId: 'wh-001', type: 'transfer_out', quantity: 2, date: `${today}`, notes: 'نقل للمطبخ' },
    { id: 'mov-007', itemId: 'inv-004', warehouseId: 'wh-002', type: 'sale', quantity: 0.6, date: `${today}`, notes: 'استخدام للطلبات' },
];

// =================== سجل الحضور ===================
export const SEED_ATTENDANCE: AttendanceRecord[] = [
    { id: 'att-001', employeeId: 'emp-001', date: `${today}`, checkIn: '08:05', checkOut: '17:10', hoursWorked: 9, status: 'present' },
    { id: 'att-002', employeeId: 'emp-002', date: `${today}`, checkIn: '09:15', checkOut: '18:00', hoursWorked: 8.75, status: 'late' },
    { id: 'att-003', employeeId: 'emp-003', date: `${today}`, checkIn: '06:55', checkOut: '16:05', hoursWorked: 9.17, status: 'present' },
    { id: 'att-004', employeeId: 'emp-004', date: `${today}`, checkIn: '14:00', hoursWorked: 0, status: 'present' },
    { id: 'att-005', employeeId: 'emp-001', date: `${yesterday}`, checkIn: '08:00', checkOut: '17:00', hoursWorked: 9, status: 'present' },
    { id: 'att-006', employeeId: 'emp-002', date: `${yesterday}`, checkIn: '09:00', checkOut: '18:00', hoursWorked: 9, status: 'present' },
    { id: 'att-007', employeeId: 'emp-003', date: `${yesterday}`, checkIn: '07:00', checkOut: '16:00', hoursWorked: 9, status: 'present' },
];

// =================== بيانات إضافية للصفحات الأخرى ===================
export const SEED_BANKS = [
    { id: 'bank-001', nameAr: 'البنك الأهلي المصري', nameEn: 'National Bank of Egypt', accountNumber: '1234567890', balance: 150000, branch: 'فرع مدينة نصر' },
    { id: 'bank-002', nameAr: 'بنك مصر', nameEn: 'Banque Misr', accountNumber: '9876543210', balance: 85000, branch: 'فرع المعادي' },
];

export const SEED_AGENTS = [
    { id: 'agent-001', nameAr: 'خالد المندوب', nameEn: 'Khaled Agent', phone: '01200000001', target: 50000, commission: 5, sales: 35000 },
    { id: 'agent-002', nameAr: 'محمود المندوب', nameEn: 'Mahmoud Agent', phone: '01200000002', target: 40000, commission: 4, sales: 42000 },
];

export const SEED_PRICE_LISTS = [
    { id: 'pl-001', nameAr: 'قائمة أسعار الجملة', nameEn: 'Wholesale Price List', discount: 15, customerId: 'cust-001' },
    { id: 'pl-002', nameAr: 'قائمة أسعار VIP', nameEn: 'VIP Price List', discount: 10, customerId: 'cust-004' },
];

export const SEED_VEHICLES = [
    { id: 'veh-001', nameAr: 'سيارة النقل 1', nameEn: 'Delivery Van 1', plateNumber: 'أ ب ت 1234', driver: 'سعيد محمد' },
    { id: 'veh-002', nameAr: 'سيارة النقل 2', nameEn: 'Delivery Van 2', plateNumber: 'أ ب ت 5678', driver: 'أحمد علي' },
];

export const SEED_CHART_OF_ACCOUNTS = [
    { id: 'acc-001', code: '1100', nameAr: 'النقدية', nameEn: 'Cash', type: 'asset', balance: 25000 },
    { id: 'acc-002', code: '1200', nameAr: 'البنوك', nameEn: 'Banks', type: 'asset', balance: 235000 },
    { id: 'acc-003', code: '1300', nameAr: 'الذمم المدينة', nameEn: 'Accounts Receivable', type: 'asset', balance: 34250 },
    { id: 'acc-004', code: '1400', nameAr: 'المخزون', nameEn: 'Inventory', type: 'asset', balance: 45000 },
    { id: 'acc-005', code: '2100', nameAr: 'الذمم الدائنة', nameEn: 'Accounts Payable', type: 'liability', balance: 34000 },
    { id: 'acc-006', code: '3100', nameAr: 'رأس المال', nameEn: 'Capital', type: 'equity', balance: 200000 },
    { id: 'acc-007', code: '4100', nameAr: 'إيرادات المبيعات', nameEn: 'Sales Revenue', type: 'revenue', balance: 150000 },
    { id: 'acc-008', code: '5100', nameAr: 'تكلفة المبيعات', nameEn: 'Cost of Sales', type: 'expense', balance: 75000 },
    { id: 'acc-009', code: '5200', nameAr: 'مصروفات الرواتب', nameEn: 'Salaries Expense', type: 'expense', balance: 40500 },
    { id: 'acc-010', code: '5300', nameAr: 'مصروفات المرافق', nameEn: 'Utilities Expense', type: 'expense', balance: 7500 },
];

export const SEED_EXPENSES = [
    { id: 'exp-001', date: `${yesterday}`, category: 'utilities', description: 'فاتورة كهرباء', amount: 2500 },
    { id: 'exp-002', date: `${yesterday}`, category: 'maintenance', description: 'صيانة ماكينة القهوة', amount: 800 },
    { id: 'exp-003', date: `${twoDaysAgo}`, category: 'rent', description: 'إيجار شهر يناير', amount: 15000 },
    { id: 'exp-004', date: `${twoDaysAgo}`, category: 'supplies', description: 'مستلزمات نظافة', amount: 500 },
];

// =================== دالة تحميل البيانات ===================
export function loadSeedData() {
    // تحميل البيانات في localStorage
    // المفاتيح يجب أن تتطابق مع ما يستخدمه DataContext
    const dataToLoad = {
        'categories': SEED_CATEGORIES,
        'menuItems': SEED_MENU,
        'inventory': SEED_INVENTORY,
        'employees': SEED_EMPLOYEES,
        'customers': SEED_CUSTOMERS,
        'suppliers': SEED_SUPPLIERS,
        'warehouses': SEED_WAREHOUSES,
        'tables': SEED_TABLES,
        'orders': SEED_ORDERS,
        'purchases': SEED_PURCHASES,
        'treasury': SEED_TREASURY,
        'attendance': SEED_ATTENDANCE,
        'stockMovements': SEED_STOCK_MOVEMENTS,
        'banks': SEED_BANKS,
        'agents': SEED_AGENTS,
        'price_lists': SEED_PRICE_LISTS,
        'vehicles': SEED_VEHICLES,
        'chart_of_accounts': SEED_CHART_OF_ACCOUNTS,
        'expenses': SEED_EXPENSES,
        'cash_balance': 25000,
        'bank_balance': 235000,
    };

    for (const [key, value] of Object.entries(dataToLoad)) {
        localStorage.setItem(key, JSON.stringify(value));
    }

    console.log('✅ تم تحميل البيانات التجريبية بنجاح');
    return true;
}

// =================== دالة مسح البيانات ===================
export function clearSeedData() {
    const keys = [
        'categories', 'menuItems', 'inventory', 'employees',
        'customers', 'suppliers', 'warehouses', 'tables',
        'orders', 'purchases', 'treasury', 'attendance',
        'stockMovements', 'banks', 'agents', 'price_lists', 'vehicles',
        'chart_of_accounts', 'expenses', 'cash_balance', 'bank_balance',
        'seed_data_initialized'
    ];

    keys.forEach(key => localStorage.removeItem(key));
    console.log('🗑️ تم مسح البيانات التجريبية');
    return true;
}

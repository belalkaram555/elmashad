const { query } = require('./db');

async function seedDatabase() {
  // Settings
  await query(`
    INSERT INTO app_settings (id, data) VALUES (1, $1)
    ON CONFLICT (id) DO NOTHING
  `, [JSON.stringify({
    restaurantNameEn: "M4D CAFE",
    restaurantNameAr: "M4D CAFE",
    branchNameAr: "الفرع الرئيسي",
    taxId: "123-456-789",
    addressAr: "15 شارع الجمهورية، القاهرة",
    phone: "02-12345678",
    taxRate: 0,
    serviceRate: 0.12,
    currencyEn: "EGP",
    currencyAr: "ج.م",
    printerName: "Default",
    printFormat: "thermal",
    autoBackup: true,
    defaultAutoPrint: true,
    defaultCompactView: false,
    adminUsername: "elmashad",
    adminPassword: "elmashad@123"
  })]);

  // Categories
  const categories = [
    { id: 'cat-001', nameAr: 'المشروبات الساخنة', nameEn: 'Hot Drinks', icon: '☕' },
    { id: 'cat-002', nameAr: 'المشروبات الباردة', nameEn: 'Cold Drinks', icon: '🥤' },
    { id: 'cat-003', nameAr: 'السندويتشات', nameEn: 'Sandwiches', icon: '🥪' },
    { id: 'cat-004', nameAr: 'الوجبات الرئيسية', nameEn: 'Main Dishes', icon: '🍽️' },
    { id: 'cat-005', nameAr: 'الحلويات', nameEn: 'Desserts', icon: '🍰' },
    { id: 'cat-006', nameAr: 'المقبلات', nameEn: 'Appetizers', icon: '🥗' },
  ];
  for (const c of categories) {
    await query('INSERT INTO categories (id, name_ar, name_en, icon) VALUES ($1,$2,$3,$4) ON CONFLICT DO NOTHING',
      [c.id, c.nameAr, c.nameEn, c.icon]);
  }

  // Warehouses
  const warehouses = [
    { id: 'wh-001', name: 'المخزن الرئيسي', location: 'الدور الأول' },
    { id: 'wh-002', name: 'مخزن المطبخ', location: 'المطبخ الرئيسي' },
    { id: 'wh-003', name: 'مخزن التبريد', location: 'غرفة التبريد' },
  ];
  for (const w of warehouses) {
    await query('INSERT INTO warehouses (id, name, location) VALUES ($1,$2,$3) ON CONFLICT DO NOTHING',
      [w.id, w.name, w.location]);
  }

  // Inventory
  const inventory = [
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
  for (const item of inventory) {
    await query(
      'INSERT INTO inventory_items (id, name_ar, name_en, unit, min_level, cost_per_unit, warehouse_quantities) VALUES ($1,$2,$3,$4,$5,$6,$7) ON CONFLICT DO NOTHING',
      [item.id, item.nameAr, item.nameEn, item.unit, item.minLevel, item.costPerUnit, JSON.stringify(item.warehouseQuantities)]
    );
  }

  // Menu Items
  const menuItems = [
    { id: 'menu-001', nameAr: 'قهوة عربية', nameEn: 'Arabic Coffee', basePrice: 25, cost: 8, categoryId: 'cat-001', available: true, variants: [{ id: 'v1', nameAr: 'صغير', nameEn: 'Small', price: 0 }, { id: 'v2', nameAr: 'كبير', nameEn: 'Large', price: 10 }], addons: [], recipe: [{ inventoryItemId: 'inv-001', quantity: 0.02 }] },
    { id: 'menu-002', nameAr: 'لاتيه', nameEn: 'Latte', basePrice: 35, cost: 12, categoryId: 'cat-001', available: true, variants: [{ id: 'v1', nameAr: 'صغير', nameEn: 'Small', price: 0 }, { id: 'v2', nameAr: 'كبير', nameEn: 'Large', price: 12 }], addons: [{ id: 'a1', nameAr: 'شوكولاتة', nameEn: 'Chocolate', price: 5 }], recipe: [{ inventoryItemId: 'inv-001', quantity: 0.015 }, { inventoryItemId: 'inv-002', quantity: 0.2 }] },
    { id: 'menu-003', nameAr: 'كابتشينو', nameEn: 'Cappuccino', basePrice: 32, cost: 11, categoryId: 'cat-001', available: true, variants: [], addons: [{ id: 'a1', nameAr: 'كريمة', nameEn: 'Cream', price: 8 }], recipe: [{ inventoryItemId: 'inv-001', quantity: 0.015 }, { inventoryItemId: 'inv-002', quantity: 0.15 }] },
    { id: 'menu-004', nameAr: 'شاي بالحليب', nameEn: 'Milk Tea', basePrice: 18, cost: 5, categoryId: 'cat-001', available: true, variants: [], addons: [], recipe: [{ inventoryItemId: 'inv-013', quantity: 0.01 }, { inventoryItemId: 'inv-002', quantity: 0.1 }] },
    { id: 'menu-005', nameAr: 'عصير برتقال', nameEn: 'Orange Juice', basePrice: 28, cost: 10, categoryId: 'cat-002', available: true, variants: [], addons: [], recipe: [] },
    { id: 'menu-006', nameAr: 'سموذي فراولة', nameEn: 'Strawberry Smoothie', basePrice: 38, cost: 15, categoryId: 'cat-002', available: true, variants: [], addons: [], recipe: [{ inventoryItemId: 'inv-002', quantity: 0.2 }] },
    { id: 'menu-007', nameAr: 'ساندويتش دجاج', nameEn: 'Chicken Sandwich', basePrice: 45, cost: 18, categoryId: 'cat-003', available: true, variants: [], addons: [{ id: 'a1', nameAr: 'جبنة إضافية', nameEn: 'Extra Cheese', price: 10 }], recipe: [{ inventoryItemId: 'inv-004', quantity: 0.15 }, { inventoryItemId: 'inv-006', quantity: 1 }, { inventoryItemId: 'inv-007', quantity: 0.03 }] },
    { id: 'menu-008', nameAr: 'برجر لحم', nameEn: 'Beef Burger', basePrice: 65, cost: 28, categoryId: 'cat-003', available: true, variants: [{ id: 'v1', nameAr: 'عادي', nameEn: 'Regular', price: 0 }, { id: 'v2', nameAr: 'دبل', nameEn: 'Double', price: 25 }], addons: [{ id: 'a1', nameAr: 'بيض', nameEn: 'Egg', price: 8 }], recipe: [{ inventoryItemId: 'inv-005', quantity: 0.15 }, { inventoryItemId: 'inv-006', quantity: 1 }] },
    { id: 'menu-009', nameAr: 'مشاوي مشكلة', nameEn: 'Mixed Grill', basePrice: 150, cost: 65, categoryId: 'cat-004', available: true, variants: [], addons: [], recipe: [{ inventoryItemId: 'inv-004', quantity: 0.2 }, { inventoryItemId: 'inv-005', quantity: 0.2 }, { inventoryItemId: 'inv-011', quantity: 0.15 }] },
    { id: 'menu-010', nameAr: 'فتة دجاج', nameEn: 'Chicken Fattah', basePrice: 85, cost: 35, categoryId: 'cat-004', available: true, variants: [], addons: [], recipe: [{ inventoryItemId: 'inv-004', quantity: 0.25 }, { inventoryItemId: 'inv-011', quantity: 0.2 }] },
    { id: 'menu-011', nameAr: 'سلطة خضراء', nameEn: 'Green Salad', basePrice: 25, cost: 8, categoryId: 'cat-006', available: true, variants: [], addons: [], recipe: [{ inventoryItemId: 'inv-008', quantity: 0.1 }, { inventoryItemId: 'inv-009', quantity: 0.1 }] },
    { id: 'menu-012', nameAr: 'كنافة', nameEn: 'Kunafa', basePrice: 35, cost: 12, categoryId: 'cat-005', available: true, variants: [], addons: [{ id: 'a1', nameAr: 'آيس كريم', nameEn: 'Ice Cream', price: 15 }], recipe: [{ inventoryItemId: 'inv-015', quantity: 0.1 }, { inventoryItemId: 'inv-003', quantity: 0.05 }] },
  ];
  for (const item of menuItems) {
    await query(
      'INSERT INTO menu_items (id, name_ar, name_en, base_price, cost, category_id, image, available, variants, addons, recipe) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) ON CONFLICT DO NOTHING',
      [item.id, item.nameAr, item.nameEn, item.basePrice, item.cost, item.categoryId, '', item.available, JSON.stringify(item.variants), JSON.stringify(item.addons), JSON.stringify(item.recipe)]
    );
  }

  // Employees
  const employees = [
    { id: 'emp-001', nameAr: 'أحمد محمد علي', nameEn: 'Ahmed Mohamed Ali', role: 'manager', baseSalary: 12000, penaltyDays: 0, absenceDays: 1, bonuses: 500, insurance: 800, status: 'active', joinDate: '2023-01-15', shiftStart: '08:00', shiftEnd: '17:00', phone: '01012345678', username: 'ahmed', password: '123456' },
    { id: 'emp-002', nameAr: 'محمد أحمد سالم', nameEn: 'Mohamed Ahmed Salem', role: 'cashier', baseSalary: 6000, penaltyDays: 1, absenceDays: 2, bonuses: 200, insurance: 400, status: 'active', joinDate: '2023-03-01', shiftStart: '09:00', shiftEnd: '18:00', phone: '01123456789', username: 'mohamed', password: '123456' },
    { id: 'emp-003', nameAr: 'علي حسن إبراهيم', nameEn: 'Ali Hassan Ibrahim', role: 'chef', baseSalary: 8000, penaltyDays: 0, absenceDays: 0, bonuses: 300, insurance: 500, status: 'active', joinDate: '2023-02-10', shiftStart: '07:00', shiftEnd: '16:00', phone: '01234567890', username: 'ali', password: '123456' },
    { id: 'emp-004', nameAr: 'خالد عبدالله محمود', nameEn: 'Khaled Abdullah Mahmoud', role: 'cashier', baseSalary: 5500, penaltyDays: 2, absenceDays: 3, bonuses: 0, insurance: 350, status: 'active', joinDate: '2023-06-15', shiftStart: '14:00', shiftEnd: '23:00', phone: '01098765432', username: 'khaled', password: '123456' },
    { id: 'emp-005', nameAr: 'حسام الدين عمر', nameEn: 'Hossam El-Din Omar', role: 'accountant', baseSalary: 9000, penaltyDays: 0, absenceDays: 1, bonuses: 400, insurance: 600, status: 'active', joinDate: '2023-04-01', shiftStart: '09:00', shiftEnd: '17:00', phone: '01156789012', username: 'hossam', password: '123456' },
  ];
  for (const e of employees) {
    await query(
      'INSERT INTO employees (id, name_ar, name_en, role, base_salary, penalty_days, absence_days, bonuses, insurance, status, join_date, shift_start, shift_end, phone, username, password) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16) ON CONFLICT DO NOTHING',
      [e.id, e.nameAr, e.nameEn, e.role, e.baseSalary, e.penaltyDays, e.absenceDays, e.bonuses, e.insurance, e.status, e.joinDate, e.shiftStart, e.shiftEnd, e.phone, e.username, e.password]
    );
  }

  // Customers
  const customers = [
    { id: 'cust-001', name: 'شركة الفجر للتموين', phone: '01000000001', address: '15 شارع الجمهورية، القاهرة', balance: 5500 },
    { id: 'cust-002', name: 'مطعم النيل', phone: '01000000002', address: '25 شارع النيل، الجيزة', balance: 3200 },
    { id: 'cust-003', name: 'محمد عبدالرحمن', phone: '01000000003', address: '10 شارع المعز، القاهرة', balance: 850 },
    { id: 'cust-004', name: 'فندق الأهرامات', phone: '01000000004', address: '1 ميدان الأهرامات، الجيزة', balance: 15000 },
    { id: 'cust-005', name: 'كافيه الوادي', phone: '01000000005', address: '5 شارع الحرية، مدينة نصر', balance: 0 },
    { id: 'cust-006', name: 'أحمد سعيد', phone: '01000000006', address: '30 شارع الثورة، المعادي', balance: 1200 },
    { id: 'cust-007', name: 'نادي سبورتنج', phone: '01000000007', address: '50 طريق الإسكندرية الصحراوي', balance: 8500 },
  ];
  for (const c of customers) {
    await query('INSERT INTO customers (id, name, phone, address, balance) VALUES ($1,$2,$3,$4,$5) ON CONFLICT DO NOTHING',
      [c.id, c.name, c.phone, c.address, c.balance]);
  }

  // Suppliers
  const suppliers = [
    { id: 'sup-001', name: 'شركة الأمل للحوم', phone: '01100000001', address: '10 شارع السلام', companyName: 'الأمل للحوم المجمدة', balance: 12000 },
    { id: 'sup-002', name: 'مزارع الوادي', phone: '01100000002', address: '5 طريق الإسماعيلية', companyName: 'خضروات الوادي الطازجة', balance: 3500 },
    { id: 'sup-003', name: 'شركة النسيم للألبان', phone: '01100000003', address: '20 شارع الصناعات', companyName: 'ألبان النسيم', balance: 8000 },
    { id: 'sup-004', name: 'مطاحن مصر', phone: '01100000004', address: '1 شارع الجلاء', companyName: 'مطاحن مصر العليا', balance: 4500 },
    { id: 'sup-005', name: 'شركة القهوة العربية', phone: '01100000005', address: '15 شارع محمد علي', companyName: 'القهوة العربية الفاخرة', balance: 6000 },
  ];
  for (const s of suppliers) {
    await query('INSERT INTO suppliers (id, name, phone, address, company_name, balance) VALUES ($1,$2,$3,$4,$5,$6) ON CONFLICT DO NOTHING',
      [s.id, s.name, s.phone, s.address, s.companyName, s.balance]);
  }

  // Gaming devices
  const gamingDevices = [
    { id: 'ps1', name: 'PlayStation 1', type: 'playstation', hourlyRate: 20, status: 'available' },
    { id: 'ps2', name: 'PlayStation 2', type: 'playstation', hourlyRate: 20, status: 'available' },
    { id: 'ps3', name: 'PlayStation 3', type: 'playstation', hourlyRate: 25, status: 'available' },
    { id: 'bil1', name: 'طاولة البينج 1', type: 'billiard', hourlyRate: 30, status: 'available' },
    { id: 'bil2', name: 'طاولة البينج 2', type: 'billiard', hourlyRate: 30, status: 'available' },
  ];
  for (const d of gamingDevices) {
    await query('INSERT INTO gaming_devices (id, name, type, hourly_rate, status) VALUES ($1,$2,$3,$4,$5) ON CONFLICT DO NOTHING',
      [d.id, d.name, d.type, d.hourlyRate, d.status]);
  }

  // Counter
  await query('INSERT INTO app_counters (key, value) VALUES ($1, $2) ON CONFLICT DO NOTHING', ['next_order_number', 1]);

  console.log('✅ Seed completed');
}

module.exports = { seedDatabase };

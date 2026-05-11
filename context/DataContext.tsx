import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import {
  MenuItem, Order, InventoryItem, Employee, AppSettings, AttendanceRecord,
  Loan, Purchase, Warehouse, Customer, Supplier, TreasuryTransaction,
  StockMovement, Notification, Category, Shift, Table, GamingDevice, GamingSession
} from '../types';
import { api, isOnline } from '../services/api';
import {
  getAllOfflineData, saveAllToOfflineDB,
  idbPut, idbDelete, idbGetAll, idbClear, idbGetMeta, idbSetMeta
} from '../services/offlineDB';
import { queueOperation, initSyncService, onSyncStatusChange, SyncStatus } from '../services/syncService';

const DEFAULT_SETTINGS: AppSettings = {
  restaurantNameEn: "M4D CAFE",
  restaurantNameAr: "M4D CAFE",
  branchNameAr: "الفرع الرئيسي",
  taxId: "123-456-789",
  addressAr: "15 شارع الجمهورية، القاهرة",
  phone: "02-12345678",
  taxRate: 0.14,
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
};

interface DataContextType {
  categories: Category[];
  addCategory: (c: Category) => void;
  updateCategory: (c: Category) => void;
  deleteCategory: (id: string) => void;

  menuItems: MenuItem[];
  setMenuItems: React.Dispatch<React.SetStateAction<MenuItem[]>>;
  addMenuItem: (item: MenuItem) => void;
  updateMenuItem: (item: MenuItem) => void;
  deleteMenuItem: (id: string) => void;

  orders: Order[];
  setOrders: React.Dispatch<React.SetStateAction<Order[]>>;
  addOrder: (order: Order) => void;
  updateOrder: (id: string, updates: Partial<Order>) => void;
  deleteOrder: (id: string) => void;
  updateOrderStatus: (id: string, status: Order['status']) => void;
  recallLastOrder: () => void;
  lastCompletedOrderId: string | null;
  nextOrderNumber: number;

  tables: Table[];
  addTable: (t: Table) => void;
  updateTable: (t: Table) => void;
  deleteTable: (id: string) => void;

  inventory: InventoryItem[];
  setInventory: React.Dispatch<React.SetStateAction<InventoryItem[]>>;
  addInventoryItem: (item: InventoryItem) => void;
  editInventoryItem: (item: InventoryItem) => void;
  deleteInventoryItem: (id: string) => void;
  transferStock: (itemId: string, from: string, to: string, qty: number, notes?: string) => void;

  warehouses: Warehouse[];
  addWarehouse: (w: Warehouse) => void;
  updateWarehouse: (w: Warehouse) => void;
  deleteWarehouse: (id: string) => void;

  stockMovements: StockMovement[];

  customers: Customer[];
  addCustomer: (c: Customer) => void;
  updateCustomer: (c: Customer) => void;
  deleteCustomer: (id: string) => void;

  suppliers: Supplier[];
  addSupplier: (s: Supplier) => void;
  updateSupplier: (s: Supplier) => void;
  deleteSupplier: (id: string) => void;

  treasury: TreasuryTransaction[];
  addTransaction: (t: TreasuryTransaction) => void;
  updateTransaction: (t: TreasuryTransaction) => void;
  deleteTransaction: (id: string) => void;

  purchases: Purchase[];
  addPurchase: (p: Purchase) => void;
  deletePurchase: (id: string) => void;

  employees: Employee[];
  setEmployees: React.Dispatch<React.SetStateAction<Employee[]>>;
  addEmployee: (e: Employee) => void;
  updateEmployee: (e: Employee) => void;
  deleteEmployee: (id: string) => void;

  attendance: AttendanceRecord[];
  setAttendance: React.Dispatch<React.SetStateAction<AttendanceRecord[]>>;
  checkIn: (employeeId: string) => void;
  checkOut: (employeeId: string) => void;
  addManualAttendance: (record: AttendanceRecord) => void;

  loans: Loan[];
  addLoan: (loan: Loan) => void;
  deleteLoan: (id: string) => void;

  settings: AppSettings;
  setSettings: React.Dispatch<React.SetStateAction<AppSettings>>;
  updateSettings: (s: AppSettings) => void;

  notifications: Notification[];
  addNotification: (n: Omit<Notification, 'id' | 'createdAt' | 'isRead'>) => void;
  markAsRead: (id: string) => void;
  clearNotifications: () => void;

  activeShift: Shift | null;
  shiftHistory: Shift[];
  openShift: (userId: string, userName: string, startBalance: number) => void;
  closeShift: (endBalance: number) => void;

  gamingDevices: GamingDevice[];
  setGamingDevices: React.Dispatch<React.SetStateAction<GamingDevice[]>>;
  gamingSessions: GamingSession[];
  setGamingSessions: React.Dispatch<React.SetStateAction<GamingSession[]>>;

  syncStatus: SyncStatus;
  isLoading: boolean;
  loadError: string | null;
  isUsingOfflineData: boolean;
  refreshData: () => Promise<void>;

  restoreData: (data: unknown) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

// ── Helper: write + queue ──────────────────────────────────────────────────────
async function writeAndSync<T extends { id: string }>(
  store: Parameters<typeof idbPut>[0],
  entity: string,
  operation: 'create' | 'update' | 'delete',
  item: T | { id: string }
): Promise<void> {
  if (operation === 'delete') {
    await idbDelete(store, (item as { id: string }).id);
  } else {
    await idbPut(store, item as T);
  }

  if (isOnline()) {
    try {
      if (entity === 'orders' && operation === 'update') {
        await api.orders.update((item as { id: string }).id, item as Partial<Order>);
      } else if (entity === 'categories') {
        if (operation === 'create') await api.categories.create(item as Category);
        else if (operation === 'update') await api.categories.update(item as Category);
        else await api.categories.remove((item as { id: string }).id);
      } else if (entity === 'menuItems') {
        if (operation === 'create') await api.menu.create(item as MenuItem);
        else if (operation === 'update') await api.menu.update(item as MenuItem);
        else await api.menu.remove((item as { id: string }).id);
      } else if (entity === 'orders') {
        if (operation === 'create') await api.orders.create(item as Order);
        else await api.orders.remove((item as { id: string }).id);
      } else if (entity === 'warehouses') {
        if (operation === 'create') await api.warehouses.create(item as Warehouse);
        else if (operation === 'update') await api.warehouses.update(item as Warehouse);
        else await api.warehouses.remove((item as { id: string }).id);
      } else if (entity === 'inventory') {
        if (operation === 'create') await api.inventory.create(item as InventoryItem);
        else if (operation === 'update') await api.inventory.update(item as InventoryItem);
        else await api.inventory.remove((item as { id: string }).id);
      } else if (entity === 'stockMovements') {
        if (operation === 'create') await api.stockMovements.create(item as StockMovement);
        else await api.stockMovements.remove((item as { id: string }).id);
      } else if (entity === 'customers') {
        if (operation === 'create') await api.customers.create(item as Customer);
        else if (operation === 'update') await api.customers.update(item as Customer);
        else await api.customers.remove((item as { id: string }).id);
      } else if (entity === 'suppliers') {
        if (operation === 'create') await api.suppliers.create(item as Supplier);
        else if (operation === 'update') await api.suppliers.update(item as Supplier);
        else await api.suppliers.remove((item as { id: string }).id);
      } else if (entity === 'purchases') {
        if (operation === 'create') await api.purchases.create(item as Purchase);
        else await api.purchases.remove((item as { id: string }).id);
      } else if (entity === 'treasury') {
        if (operation === 'create') await api.treasury.create(item as TreasuryTransaction);
        else if (operation === 'update') await api.treasury.update(item as TreasuryTransaction);
        else await api.treasury.remove((item as { id: string }).id);
      } else if (entity === 'employees') {
        if (operation === 'create') await api.employees.create(item as Employee);
        else if (operation === 'update') await api.employees.update(item as Employee);
        else await api.employees.remove((item as { id: string }).id);
      } else if (entity === 'attendance') {
        if (operation === 'create') await api.attendance.create(item as AttendanceRecord);
        else if (operation === 'update') await api.attendance.update(item as AttendanceRecord);
        else await api.attendance.remove((item as { id: string }).id);
      } else if (entity === 'loans') {
        if (operation === 'create') await api.loans.create(item as Loan);
        else await api.loans.remove((item as { id: string }).id);
      } else if (entity === 'shifts') {
        if (operation === 'create') await api.shifts.create(item as Shift);
        else if (operation === 'update') await api.shifts.update(item as Shift);
      } else if (entity === 'tables') {
        if (operation === 'create') await api.tables.create(item as Table);
        else if (operation === 'update') await api.tables.update(item as Table);
        else await api.tables.remove((item as { id: string }).id);
      } else if (entity === 'notifications') {
        if (operation === 'create') await api.notifications.create(item as Notification);
        else if (operation === 'update') await api.notifications.update(item as Notification);
      } else if (entity === 'gamingDevices') {
        if (operation === 'create') await api.gaming.createDevice(item as GamingDevice);
        else if (operation === 'update') await api.gaming.updateDevice(item as GamingDevice);
        else await api.gaming.removeDevice((item as { id: string }).id);
      } else if (entity === 'gamingSessions') {
        if (operation === 'create') await api.gaming.createSession(item as GamingSession);
        else if (operation === 'update') await api.gaming.updateSession(item as GamingSession);
      } else if (entity === 'settings') {
        await api.settings.update(item as unknown as AppSettings);
      }
    } catch {
      await queueOperation(entity, operation, item);
    }
  } else {
    await queueOperation(entity, operation, item);
  }
}

// ── Provider ───────────────────────────────────────────────────────────────────
export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isUsingOfflineData, setIsUsingOfflineData] = useState(false);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>({
    online: navigator.onLine, syncing: false, pendingCount: 0, lastSyncAt: null, error: null
  });

  const [categories, setCategories] = useState<Category[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [tables, setTables] = useState<Table[]>([]);
  const [nextOrderNumber, setNextOrderNumber] = useState(1);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [stockMovements, setStockMovements] = useState<StockMovement[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [treasury, setTreasury] = useState<TreasuryTransaction[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [loans, setLoans] = useState<Loan[]>([]);
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [activeShift, setActiveShift] = useState<Shift | null>(null);
  const [shiftHistory, setShiftHistory] = useState<Shift[]>([]);
  const [gamingDevices, setGamingDevices] = useState<GamingDevice[]>([]);
  const [gamingSessions, setGamingSessions] = useState<GamingSession[]>([]);
  const [lastCompletedOrderId, setLastCompletedOrderId] = useState<string | null>(null);

  // ── Init sync service ──────────────────────────────────────────────────────
  useEffect(() => {
    initSyncService();
    const unsub = onSyncStatusChange(setSyncStatus);
    return unsub;
  }, []);

  // ── Keep employees + settings in localStorage for AuthContext ─────────────
  useEffect(() => {
    if (employees.length > 0) localStorage.setItem('employees', JSON.stringify(employees));
  }, [employees]);
  useEffect(() => {
    localStorage.setItem('settings', JSON.stringify(settings));
  }, [settings]);

  // ── Load data on mount ─────────────────────────────────────────────────────
  const refreshData = useCallback(async () => {
      setIsLoading(true);
      setLoadError(null);
      try {
        if (isOnline()) {
          // Load from API (source of truth)
          const [
            cats, menu, ords, whs, inv, smov, custs, sups, purs, treas,
            emps, att, lns, shfts, tbls, notifs, gDevices, gSessions,
            settingsData, orderNum
          ] = await Promise.all([
            api.categories.list(),
            api.menu.list(),
            api.orders.list(),
            api.warehouses.list(),
            api.inventory.list(),
            api.stockMovements.list(),
            api.customers.list(),
            api.suppliers.list(),
            api.purchases.list(),
            api.treasury.list(),
            api.employees.list(),
            api.attendance.list(),
            api.loans.list(),
            api.shifts.list(),
            api.tables.list(),
            api.notifications.list(),
            api.gaming.listDevices(),
            api.gaming.listSessions(),
            api.settings.get(),
            api.counters.getOrderNumber(),
          ]);

          setCategories(cats);
          setMenuItems(menu);
          setOrders(ords);
          setWarehouses(whs);
          setInventory(inv);
          setStockMovements(smov);
          setCustomers(custs);
          setSuppliers(sups);
          setPurchases(purs);
          setTreasury(treas);
          setEmployees(emps);
          setAttendance(att);
          setLoans(lns);
          setTables(tbls);
          setNotifications(notifs);
          setGamingDevices(gDevices);
          setGamingSessions(gSessions);
          if (settingsData && Object.keys(settingsData).length > 0) {
          setSettings({ ...DEFAULT_SETTINGS, ...settingsData });
          }
          setNextOrderNumber(orderNum.value);
          setIsUsingOfflineData(false);

          const openShiftData = shfts.find(s => s.status === 'open') || null;
          const closedShifts = shfts.filter(s => s.status === 'closed');
          setActiveShift(openShiftData);
          setShiftHistory(closedShifts);

          // Persist to IndexedDB for offline use
          await saveAllToOfflineDB({
            categories: cats as unknown[],
            menuItems: menu as unknown[],
            orders: ords as unknown[],
            warehouses: whs as unknown[],
            inventory: inv as unknown[],
            stockMovements: smov as unknown[],
            customers: custs as unknown[],
            suppliers: sups as unknown[],
            purchases: purs as unknown[],
            treasury: treas as unknown[],
            employees: emps as unknown[],
            attendance: att as unknown[],
            loans: lns as unknown[],
            shifts: shfts as unknown[],
            tables: tbls as unknown[],
            notifications: notifs as unknown[],
            gamingDevices: gDevices as unknown[],
            gamingSessions: gSessions as unknown[],
            settings: settingsData,
            nextOrderNumber: orderNum.value,
          });
        } else {
          throw new Error('offline');
        }
      } catch (error) {
        // Fallback to IndexedDB
        console.log('ℹ️ Loading from IndexedDB (offline mode)');
        const data = await getAllOfflineData();
        setIsUsingOfflineData(true);
        setLoadError(error instanceof Error ? error.message : 'تعذر تحميل البيانات من قاعدة البيانات.');
        setCategories(data.categories as Category[]);
        setMenuItems(data.menuItems as MenuItem[]);
        setOrders(data.orders as Order[]);
        setWarehouses(data.warehouses as Warehouse[]);
        setInventory(data.inventory as InventoryItem[]);
        setStockMovements(data.stockMovements as StockMovement[]);
        setCustomers(data.customers as Customer[]);
        setSuppliers(data.suppliers as Supplier[]);
        setPurchases(data.purchases as Purchase[]);
        setTreasury(data.treasury as TreasuryTransaction[]);
        setEmployees(data.employees as Employee[]);
        setAttendance(data.attendance as AttendanceRecord[]);
        setLoans(data.loans as Loan[]);
        setTables(data.tables as Table[]);
        setNotifications(data.notifications as Notification[]);
        setGamingDevices(data.gamingDevices as GamingDevice[]);
        setGamingSessions(data.gamingSessions as GamingSession[]);
        setNextOrderNumber(data.nextOrderNumber || 1);

        const shifts = data.shifts as Shift[];
        setActiveShift(shifts.find(s => s.status === 'open') || null);
        setShiftHistory(shifts.filter(s => s.status === 'closed'));

        if (data.settings && Object.keys(data.settings as object).length > 0) {
          setSettings({ ...DEFAULT_SETTINGS, ...(data.settings as unknown as AppSettings) });
        }
      } finally {
        setIsLoading(false);
      }
  }, []);

  useEffect(() => {
    void refreshData();
  }, [refreshData]);

  // ── Categories ─────────────────────────────────────────────────────────────
  const addCategory = useCallback((c: Category) => {
    setCategories(prev => [...prev, c]);
    void writeAndSync('categories', 'categories', 'create', c);
  }, []);
  const updateCategory = useCallback((c: Category) => {
    setCategories(prev => prev.map(x => x.id === c.id ? c : x));
    void writeAndSync('categories', 'categories', 'update', c);
  }, []);
  const deleteCategory = useCallback((id: string) => {
    setCategories(prev => prev.filter(x => x.id !== id));
    void writeAndSync('categories', 'categories', 'delete', { id });
  }, []);

  // ── Menu ───────────────────────────────────────────────────────────────────
  const addMenuItem = useCallback((item: MenuItem) => {
    setMenuItems(prev => [...prev, item]);
    void writeAndSync('menuItems', 'menuItems', 'create', item);
  }, []);
  const updateMenuItem = useCallback((item: MenuItem) => {
    setMenuItems(prev => prev.map(x => x.id === item.id ? item : x));
    void writeAndSync('menuItems', 'menuItems', 'update', item);
  }, []);
  const deleteMenuItem = useCallback((id: string) => {
    setMenuItems(prev => prev.filter(x => x.id !== id));
    void writeAndSync('menuItems', 'menuItems', 'delete', { id });
  }, []);

  // ── Orders ────────────────────────────────────────────────────────────────
  const addOrder = useCallback((order: Order) => {
    const normalizedStatus: Order['status'] = order.status === 'pending' ? 'completed' : order.status;
    const finalOrder: Order = {
      ...order,
      status: normalizedStatus,
      completedAt: normalizedStatus === 'completed' ? (order.completedAt || new Date().toISOString()) : order.completedAt,
      shiftId: activeShift ? activeShift.id : undefined,
    };
    setOrders(prev => [finalOrder, ...prev]);
    setNextOrderNumber(prev => {
      const next = prev + 1;
      void idbSetMeta('nextOrderNumber', next);
      if (isOnline()) void api.counters.incrementOrderNumber();
      return next;
    });
    if (activeShift) {
      const updatedShift = { ...activeShift, totalSales: activeShift.totalSales + order.total };
      setActiveShift(updatedShift);
      void writeAndSync('shifts', 'shifts', 'update', updatedShift);
    }
    const txn: TreasuryTransaction = {
      id: Date.now().toString(),
      type: 'income',
      category: 'sales',
      amount: order.total,
      date: new Date().toISOString(),
      description: `Order #${order.id}`,
      referenceId: order.id,
      performedBy: order.performedBy,
    };
    setTreasury(prev => [txn, ...prev]);
    void writeAndSync('treasury', 'treasury', 'create', txn);
    void writeAndSync('orders', 'orders', 'create', finalOrder);
  }, [activeShift]);

  const updateOrder = useCallback((id: string, updates: Partial<Order>) => {
    setOrders(prev => prev.map(o => o.id === id ? { ...o, ...updates } : o));
    void writeAndSync('orders', 'orders', 'update', { id, ...updates });
  }, []);

  const deleteOrder = useCallback((id: string) => {
    setOrders(prev => prev.filter(o => o.id !== id));
    setTreasury(prev => prev.filter(t => t.referenceId !== id));
    void writeAndSync('orders', 'orders', 'delete', { id });
  }, []);

  const updateOrderStatus = useCallback((id: string, status: Order['status']) => {
    if (status === 'completed') setLastCompletedOrderId(id);
    setOrders(prev => prev.map(o => o.id === id ? { ...o, status, completedAt: status === 'completed' ? new Date().toISOString() : o.completedAt } : o));
    void writeAndSync('orders', 'orders', 'update', { id, status });
  }, []);

  const recallLastOrder = useCallback(() => {
    if (!lastCompletedOrderId) return;
    setOrders(prev => prev.map(o => o.id === lastCompletedOrderId ? { ...o, status: 'ready' } : o));
    void writeAndSync('orders', 'orders', 'update', { id: lastCompletedOrderId, status: 'ready' });
    setLastCompletedOrderId(null);
  }, [lastCompletedOrderId]);

  // ── Tables ────────────────────────────────────────────────────────────────
  const addTable = useCallback((t: Table) => {
    setTables(prev => [...prev, t]);
    void writeAndSync('tables', 'tables', 'create', t);
  }, []);
  const updateTable = useCallback((t: Table) => {
    setTables(prev => prev.map(x => x.id === t.id ? t : x));
    void writeAndSync('tables', 'tables', 'update', t);
  }, []);
  const deleteTable = useCallback((id: string) => {
    setTables(prev => prev.filter(x => x.id !== id));
    void writeAndSync('tables', 'tables', 'delete', { id });
  }, []);

  // ── Inventory ─────────────────────────────────────────────────────────────
  const addInventoryItem = useCallback((item: InventoryItem) => {
    setInventory(prev => [...prev, item]);
    void writeAndSync('inventory', 'inventory', 'create', item);
  }, []);
  const editInventoryItem = useCallback((item: InventoryItem) => {
    setInventory(prev => prev.map(x => x.id === item.id ? item : x));
    void writeAndSync('inventory', 'inventory', 'update', item);
  }, []);
  const deleteInventoryItem = useCallback((id: string) => {
    setInventory(prev => prev.filter(x => x.id !== id));
    void writeAndSync('inventory', 'inventory', 'delete', { id });
  }, []);

  const transferStock = useCallback((itemId: string, fromWarehouseId: string, toWarehouseId: string, quantity: number, notes?: string) => {
    setInventory(prev => prev.map(item => {
      if (item.id !== itemId) return item;
      const fromQty = item.warehouseQuantities[fromWarehouseId] || 0;
      const toQty = item.warehouseQuantities[toWarehouseId] || 0;
      if (fromQty < quantity) return item;
      const updated = {
        ...item,
        warehouseQuantities: {
          ...item.warehouseQuantities,
          [fromWarehouseId]: fromQty - quantity,
          [toWarehouseId]: toQty + quantity,
        }
      };
      void writeAndSync('inventory', 'inventory', 'update', updated);
      return updated;
    }));
    const movOut: StockMovement = { id: `mov-out-${Date.now()}`, itemId, warehouseId: fromWarehouseId, type: 'transfer_out', quantity, date: new Date().toISOString().split('T')[0], notes };
    const movIn: StockMovement = { id: `mov-in-${Date.now()}`, itemId, warehouseId: toWarehouseId, type: 'transfer_in', quantity, date: new Date().toISOString().split('T')[0], notes };
    setStockMovements(prev => [movOut, movIn, ...prev]);
    void writeAndSync('stockMovements', 'stockMovements', 'create', movOut);
    void writeAndSync('stockMovements', 'stockMovements', 'create', movIn);
  }, []);

  // ── Warehouses ────────────────────────────────────────────────────────────
  const addWarehouse = useCallback((w: Warehouse) => {
    setWarehouses(prev => [...prev, w]);
    void writeAndSync('warehouses', 'warehouses', 'create', w);
  }, []);
  const updateWarehouse = useCallback((w: Warehouse) => {
    setWarehouses(prev => prev.map(x => x.id === w.id ? w : x));
    void writeAndSync('warehouses', 'warehouses', 'update', w);
  }, []);
  const deleteWarehouse = useCallback((id: string) => {
    setWarehouses(prev => prev.filter(x => x.id !== id));
    void writeAndSync('warehouses', 'warehouses', 'delete', { id });
  }, []);

  // ── Customers ─────────────────────────────────────────────────────────────
  const addCustomer = useCallback((c: Customer) => {
    setCustomers(prev => [...prev, c]);
    void writeAndSync('customers', 'customers', 'create', c);
  }, []);
  const updateCustomer = useCallback((c: Customer) => {
    setCustomers(prev => prev.map(x => x.id === c.id ? c : x));
    void writeAndSync('customers', 'customers', 'update', c);
  }, []);
  const deleteCustomer = useCallback((id: string) => {
    setCustomers(prev => prev.filter(x => x.id !== id));
    void writeAndSync('customers', 'customers', 'delete', { id });
  }, []);

  // ── Suppliers ─────────────────────────────────────────────────────────────
  const addSupplier = useCallback((s: Supplier) => {
    setSuppliers(prev => [...prev, s]);
    void writeAndSync('suppliers', 'suppliers', 'create', s);
  }, []);
  const updateSupplier = useCallback((s: Supplier) => {
    setSuppliers(prev => prev.map(x => x.id === s.id ? s : x));
    void writeAndSync('suppliers', 'suppliers', 'update', s);
  }, []);
  const deleteSupplier = useCallback((id: string) => {
    setSuppliers(prev => prev.filter(x => x.id !== id));
    void writeAndSync('suppliers', 'suppliers', 'delete', { id });
  }, []);

  // ── Treasury ──────────────────────────────────────────────────────────────
  const addTransaction = useCallback((t: TreasuryTransaction) => {
    setTreasury(prev => [t, ...prev]);
    void writeAndSync('treasury', 'treasury', 'create', t);
  }, []);
  const updateTransaction = useCallback((t: TreasuryTransaction) => {
    setTreasury(prev => prev.map(x => x.id === t.id ? t : x));
    void writeAndSync('treasury', 'treasury', 'update', t);
  }, []);
  const deleteTransaction = useCallback((id: string) => {
    setTreasury(prev => prev.filter(x => x.id !== id));
    void writeAndSync('treasury', 'treasury', 'delete', { id });
  }, []);

  // ── Purchases ─────────────────────────────────────────────────────────────
  const addPurchase = useCallback((purchase: Purchase) => {
    setPurchases(prev => [purchase, ...prev]);
    purchase.items.forEach(pItem => {
      setInventory(prev => prev.map(inv => {
        if (inv.id !== pItem.inventoryItemId) return inv;
        const currentQty = inv.warehouseQuantities[purchase.warehouseId] || 0;
        const updated = { ...inv, warehouseQuantities: { ...inv.warehouseQuantities, [purchase.warehouseId]: currentQty + pItem.quantity } };
        void writeAndSync('inventory', 'inventory', 'update', updated);
        return updated;
      }));
    });
    const txn: TreasuryTransaction = {
      id: Date.now().toString(),
      type: 'expense',
      category: 'purchases',
      amount: purchase.totalAmount,
      date: new Date().toISOString(),
      description: `Purchase Inv #${purchase.invoiceNumber}`,
      referenceId: purchase.id,
      performedBy: purchase.performedBy,
    };
    setTreasury(prev => [txn, ...prev]);
    void writeAndSync('treasury', 'treasury', 'create', txn);
    void writeAndSync('purchases', 'purchases', 'create', purchase);
  }, []);

  const deletePurchase = useCallback((id: string) => {
    setPurchases(prev => prev.filter(x => x.id !== id));
    void writeAndSync('purchases', 'purchases', 'delete', { id });
  }, []);

  // ── Employees ─────────────────────────────────────────────────────────────
  const addEmployee = useCallback((e: Employee) => {
    setEmployees(prev => [...prev, e]);
    void writeAndSync('employees', 'employees', 'create', e);
  }, []);
  const updateEmployee = useCallback((e: Employee) => {
    setEmployees(prev => prev.map(x => x.id === e.id ? e : x));
    void writeAndSync('employees', 'employees', 'update', e);
  }, []);
  const deleteEmployee = useCallback((id: string) => {
    setEmployees(prev => prev.filter(x => x.id !== id));
    void writeAndSync('employees', 'employees', 'delete', { id });
  }, []);

  // ── Attendance ────────────────────────────────────────────────────────────
  const checkIn = useCallback((employeeId: string) => {
    const today = new Date().toISOString().split('T')[0];
    const rec: AttendanceRecord = {
      id: Date.now().toString(),
      employeeId,
      date: today,
      checkIn: new Date().toISOString(),
      hoursWorked: 0,
      status: 'present'
    };
    setAttendance(prev => [rec, ...prev]);
    void writeAndSync('attendance', 'attendance', 'create', rec);
  }, []);

  const checkOut = useCallback((employeeId: string) => {
    setAttendance(prev => prev.map(record => {
      const today = new Date().toISOString().split('T')[0];
      if (record.employeeId === employeeId && record.date === today && !record.checkOut) {
        const checkOutTime = new Date();
        const checkInTime = new Date(record.checkIn);
        const hours = (checkOutTime.getTime() - checkInTime.getTime()) / (1000 * 60 * 60);
        const updated = { ...record, checkOut: checkOutTime.toISOString(), hoursWorked: parseFloat(hours.toFixed(2)) };
        void writeAndSync('attendance', 'attendance', 'update', updated);
        return updated;
      }
      return record;
    }));
  }, []);

  const addManualAttendance = useCallback((record: AttendanceRecord) => {
    setAttendance(prev => [record, ...prev]);
    void writeAndSync('attendance', 'attendance', 'create', record);
  }, []);

  // ── Loans ─────────────────────────────────────────────────────────────────
  const addLoan = useCallback((loan: Loan) => {
    setLoans(prev => [loan, ...prev]);
    void writeAndSync('loans', 'loans', 'create', loan);
  }, []);
  const deleteLoan = useCallback((id: string) => {
    setLoans(prev => prev.filter(x => x.id !== id));
    void writeAndSync('loans', 'loans', 'delete', { id });
  }, []);

  // ── Settings ──────────────────────────────────────────────────────────────
  const updateSettings = useCallback((newSettings: AppSettings) => {
    setSettings(newSettings);
    void idbPut('settings', { ...(newSettings as object), id: 'main' } as { id: string });
    if (isOnline()) {
      void api.settings.update(newSettings).catch(() => {
        void queueOperation('settings', 'update', newSettings);
      });
    } else {
      void queueOperation('settings', 'update', newSettings);
    }
  }, []);

  // ── Notifications ─────────────────────────────────────────────────────────
  const addNotification = useCallback((n: Omit<Notification, 'id' | 'createdAt' | 'isRead'>) => {
    const newNotif: Notification = { ...n, id: Date.now().toString(), createdAt: new Date().toISOString(), isRead: false };
    setNotifications(prev => [newNotif, ...prev].slice(0, 50));
    void writeAndSync('notifications', 'notifications', 'create', newNotif);
  }, []);

  const markAsRead = useCallback((id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
    void writeAndSync('notifications', 'notifications', 'update', { id, isRead: true });
  }, []);

  const clearNotifications = useCallback(() => {
    setNotifications([]);
    void idbClear('notifications');
    if (isOnline()) void api.notifications.clear().catch(() => {});
  }, []);

  // ── Shifts ────────────────────────────────────────────────────────────────
  const openShift = useCallback((userId: string, userName: string, startBalance: number) => {
    const newShift: Shift = {
      id: `SH-${Date.now()}`,
      userId,
      userName,
      startTime: new Date().toISOString(),
      startBalance,
      totalSales: 0,
      status: 'open'
    };
    setActiveShift(newShift);
    void writeAndSync('shifts', 'shifts', 'create', newShift);
    addNotification({ titleAr: 'تم فتح الوردية', titleEn: 'Shift Opened', messageAr: `تم بدء وردية جديدة للمستخدم: ${userName}`, messageEn: `New shift started by: ${userName}`, type: 'info' });
  }, [addNotification]);

  const closeShift = useCallback((endBalance: number) => {
    if (!activeShift) return;
    const closedShift: Shift = {
      ...activeShift,
      endTime: new Date().toISOString(),
      endBalance,
      expectedBalance: activeShift.startBalance + activeShift.totalSales,
      status: 'closed'
    };
    setShiftHistory(prev => [closedShift, ...prev]);
    setActiveShift(null);
    void writeAndSync('shifts', 'shifts', 'update', closedShift);
    addNotification({ titleAr: 'تم إغلاق الوردية', titleEn: 'Shift Closed', messageAr: `تم إغلاق وردية المستخدم: ${closedShift.userName}`, messageEn: `Shift closed for: ${closedShift.userName}`, type: 'success' });
  }, [activeShift, addNotification]);

  // ── Restore ───────────────────────────────────────────────────────────────
  const restoreData = useCallback((data: unknown) => {
    const d = data as Record<string, unknown>;
    if (d.categories) setCategories(d.categories as Category[]);
    if (d.menuItems) setMenuItems(d.menuItems as MenuItem[]);
    if (d.orders) setOrders(d.orders as Order[]);
    if (d.inventory) setInventory(d.inventory as InventoryItem[]);
    if (d.warehouses) setWarehouses(d.warehouses as Warehouse[]);
    if (d.stockMovements) setStockMovements(d.stockMovements as StockMovement[]);
    if (d.customers) setCustomers(d.customers as Customer[]);
    if (d.suppliers) setSuppliers(d.suppliers as Supplier[]);
    if (d.treasury) setTreasury(d.treasury as TreasuryTransaction[]);
    if (d.employees) setEmployees(d.employees as Employee[]);
    if (d.attendance) setAttendance(d.attendance as AttendanceRecord[]);
    if (d.loans) setLoans(d.loans as Loan[]);
    if (d.purchases) setPurchases(d.purchases as Purchase[]);
    if (d.settings) setSettings(d.settings as AppSettings);
    if (d.notifications) setNotifications(d.notifications as Notification[]);
  }, []);

  return (
    <DataContext.Provider value={{
      categories, addCategory, updateCategory, deleteCategory,
      menuItems, setMenuItems, addMenuItem, updateMenuItem, deleteMenuItem,
      orders, setOrders, addOrder, updateOrder, deleteOrder, updateOrderStatus, recallLastOrder,
      lastCompletedOrderId, nextOrderNumber,
      tables, addTable, updateTable, deleteTable,
      inventory, setInventory, addInventoryItem, editInventoryItem, deleteInventoryItem, transferStock,
      warehouses, addWarehouse, updateWarehouse, deleteWarehouse,
      stockMovements,
      customers, addCustomer, updateCustomer, deleteCustomer,
      suppliers, addSupplier, updateSupplier, deleteSupplier,
      treasury, addTransaction, updateTransaction, deleteTransaction,
      purchases, addPurchase, deletePurchase,
      employees, setEmployees, addEmployee, updateEmployee, deleteEmployee,
      attendance, setAttendance, checkIn, checkOut, addManualAttendance,
      loans, addLoan, deleteLoan,
      settings, setSettings, updateSettings,
      notifications, addNotification, markAsRead, clearNotifications,
      activeShift, shiftHistory, openShift, closeShift,
      gamingDevices, setGamingDevices, gamingSessions, setGamingSessions,
      syncStatus, isLoading, loadError, isUsingOfflineData, refreshData,
      restoreData,
    }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useData must be used within DataProvider');
  return ctx;
};

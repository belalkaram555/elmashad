import {
  Category, MenuItem, Order, InventoryItem, Warehouse, StockMovement,
  Customer, Supplier, Purchase, TreasuryTransaction, Employee,
  AttendanceRecord, Loan, Shift, AppSettings, Notification, Table,
  GamingDevice, GamingSession
} from '../types';

const BASE = '/api';

async function http<T>(path: string, options?: RequestInit): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${BASE}${path}`, {
      headers: { 'Content-Type': 'application/json' },
      ...options,
    });
  } catch (error) {
    throw new Error(navigator.onLine
      ? 'تعذر الاتصال بالسيرفر. تأكد من تشغيل الباك اند وقاعدة البيانات.'
      : 'لا يوجد اتصال بالإنترنت. سيتم استخدام البيانات المحفوظة إن وجدت.');
  }
  if (!res.ok) {
    const err = await res.text();
    if (res.status === 401) throw new Error('انتهت الجلسة أو غير مصرح بالدخول.');
    if (res.status === 403) throw new Error('غير مصرح لك بالدخول لهذه الصفحة.');
    if (res.status >= 500) throw new Error('حدث خطأ أثناء جلب البيانات من قاعدة البيانات.');
    throw new Error(`HTTP ${res.status}: ${err}`);
  }
  return res.json();
}

const get = <T>(path: string) => http<T>(path);
const post = <T>(path: string, body: unknown) => http<T>(path, { method: 'POST', body: JSON.stringify(body) });
const put = <T>(path: string, body: unknown) => http<T>(path, { method: 'PUT', body: JSON.stringify(body) });
const del = <T>(path: string) => http<T>(path, { method: 'DELETE' });

export const api = {
  health: () => get<{ ok: boolean; timestamp: string }>('/health'),

  categories: {
    list: () => get<Category[]>('/categories'),
    create: (d: Category) => post<Category>('/categories', d),
    update: (d: Category) => put<Category>(`/categories/${d.id}`, d),
    remove: (id: string) => del<void>(`/categories/${id}`),
  },

  menu: {
    list: () => get<MenuItem[]>('/menu'),
    create: (d: MenuItem) => post<MenuItem>('/menu', d),
    update: (d: MenuItem) => put<MenuItem>(`/menu/${d.id}`, d),
    remove: (id: string) => del<void>(`/menu/${id}`),
  },

  orders: {
    list: () => get<Order[]>('/orders'),
    create: (d: Order) => post<Order>('/orders', d),
    update: (id: string, d: Partial<Order>) => put<Order>(`/orders/${id}`, d),
    remove: (id: string) => del<void>(`/orders/${id}`),
  },

  warehouses: {
    list: () => get<Warehouse[]>('/warehouses'),
    create: (d: Warehouse) => post<Warehouse>('/warehouses', d),
    update: (d: Warehouse) => put<Warehouse>(`/warehouses/${d.id}`, d),
    remove: (id: string) => del<void>(`/warehouses/${id}`),
  },

  inventory: {
    list: () => get<InventoryItem[]>('/inventory'),
    create: (d: InventoryItem) => post<InventoryItem>('/inventory', d),
    update: (d: InventoryItem) => put<InventoryItem>(`/inventory/${d.id}`, d),
    remove: (id: string) => del<void>(`/inventory/${id}`),
  },

  stockMovements: {
    list: () => get<StockMovement[]>('/stock-movements'),
    create: (d: StockMovement) => post<StockMovement>('/stock-movements', d),
    remove: (id: string) => del<void>(`/stock-movements/${id}`),
  },

  customers: {
    list: () => get<Customer[]>('/customers'),
    create: (d: Customer) => post<Customer>('/customers', d),
    update: (d: Customer) => put<Customer>(`/customers/${d.id}`, d),
    remove: (id: string) => del<void>(`/customers/${id}`),
  },

  suppliers: {
    list: () => get<Supplier[]>('/suppliers'),
    create: (d: Supplier) => post<Supplier>('/suppliers', d),
    update: (d: Supplier) => put<Supplier>(`/suppliers/${d.id}`, d),
    remove: (id: string) => del<void>(`/suppliers/${id}`),
  },

  purchases: {
    list: () => get<Purchase[]>('/purchases'),
    create: (d: Purchase) => post<Purchase>('/purchases', d),
    remove: (id: string) => del<void>(`/purchases/${id}`),
  },

  treasury: {
    list: () => get<TreasuryTransaction[]>('/treasury'),
    create: (d: TreasuryTransaction) => post<TreasuryTransaction>('/treasury', d),
    update: (d: TreasuryTransaction) => put<TreasuryTransaction>(`/treasury/${d.id}`, d),
    remove: (id: string) => del<void>(`/treasury/${id}`),
  },

  employees: {
    list: () => get<Employee[]>('/employees'),
    create: (d: Employee) => post<Employee>('/employees', d),
    update: (d: Employee) => put<Employee>(`/employees/${d.id}`, d),
    remove: (id: string) => del<void>(`/employees/${id}`),
  },

  attendance: {
    list: () => get<AttendanceRecord[]>('/attendance'),
    create: (d: AttendanceRecord) => post<AttendanceRecord>('/attendance', d),
    update: (d: AttendanceRecord) => put<AttendanceRecord>(`/attendance/${d.id}`, d),
    remove: (id: string) => del<void>(`/attendance/${id}`),
  },

  loans: {
    list: () => get<Loan[]>('/loans'),
    create: (d: Loan) => post<Loan>('/loans', d),
    remove: (id: string) => del<void>(`/loans/${id}`),
  },

  shifts: {
    list: () => get<Shift[]>('/shifts'),
    create: (d: Shift) => post<Shift>('/shifts', d),
    update: (d: Shift) => put<Shift>(`/shifts/${d.id}`, d),
  },

  settings: {
    get: () => get<AppSettings>('/settings'),
    update: (d: AppSettings) => post<AppSettings>('/settings', d),
  },

  notifications: {
    list: () => get<Notification[]>('/notifications'),
    create: (d: Notification) => post<Notification>('/notifications', d),
    update: (d: Notification) => put<Notification>(`/notifications/${d.id}`, d),
    clear: () => del<void>('/notifications'),
  },

  tables: {
    list: () => get<Table[]>('/tables'),
    create: (d: Table) => post<Table>('/tables', d),
    update: (d: Table) => put<Table>(`/tables/${d.id}`, d),
    remove: (id: string) => del<void>(`/tables/${id}`),
  },

  gaming: {
    listDevices: () => get<GamingDevice[]>('/gaming/devices'),
    createDevice: (d: GamingDevice) => post<GamingDevice>('/gaming/devices', d),
    updateDevice: (d: GamingDevice) => put<GamingDevice>(`/gaming/devices/${d.id}`, d),
    removeDevice: (id: string) => del<void>(`/gaming/devices/${id}`),
    listSessions: () => get<GamingSession[]>('/gaming/sessions'),
    createSession: (d: GamingSession) => post<GamingSession>('/gaming/sessions', d),
    updateSession: (d: GamingSession) => put<GamingSession>(`/gaming/sessions/${d.id}`, d),
  },

  counters: {
    getOrderNumber: () => get<{ value: number }>('/counters/next-order-number'),
    incrementOrderNumber: () => post<{ value: number }>('/counters/next-order-number/increment', {}),
  },

  sync: {
    pull: (since: string) => get<Record<string, unknown[]>>(`/sync/pull?since=${encodeURIComponent(since)}`),
    push: (queue: SyncQueueItem[]) => post<{ processed: number }>('/sync/push', { queue }),
  },
};

export interface SyncQueueItem {
  id: string;
  entity: string;
  operation: 'create' | 'update' | 'delete';
  data: unknown;
  timestamp: number;
  retries: number;
}

export function isOnline(): boolean {
  return navigator.onLine;
}

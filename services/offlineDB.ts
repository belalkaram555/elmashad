import { openDB, DBSchema, IDBPDatabase } from 'idb';
import { SyncQueueItem } from './api';

interface PosDB extends DBSchema {
  categories: { key: string; value: Record<string, unknown> };
  menuItems: { key: string; value: Record<string, unknown> };
  orders: { key: string; value: Record<string, unknown> };
  warehouses: { key: string; value: Record<string, unknown> };
  inventory: { key: string; value: Record<string, unknown> };
  stockMovements: { key: string; value: Record<string, unknown> };
  customers: { key: string; value: Record<string, unknown> };
  suppliers: { key: string; value: Record<string, unknown> };
  purchases: { key: string; value: Record<string, unknown> };
  treasury: { key: string; value: Record<string, unknown> };
  employees: { key: string; value: Record<string, unknown> };
  attendance: { key: string; value: Record<string, unknown> };
  loans: { key: string; value: Record<string, unknown> };
  shifts: { key: string; value: Record<string, unknown> };
  tables: { key: string; value: Record<string, unknown> };
  notifications: { key: string; value: Record<string, unknown> };
  gamingDevices: { key: string; value: Record<string, unknown> };
  gamingSessions: { key: string; value: Record<string, unknown> };
  settings: { key: string; value: Record<string, unknown> };
  syncQueue: { key: string; value: SyncQueueItem };
  meta: { key: string; value: { id: string; key: string; value: unknown } };
}

const DB_NAME = 'elmashad-cafe-offline';
const DB_VERSION = 1;

let dbPromise: Promise<IDBPDatabase<PosDB>> | null = null;

function getDB(): Promise<IDBPDatabase<PosDB>> {
  if (!dbPromise) {
    dbPromise = openDB<PosDB>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        const stores: Array<keyof PosDB> = [
          'categories', 'menuItems', 'orders', 'warehouses', 'inventory',
          'stockMovements', 'customers', 'suppliers', 'purchases', 'treasury',
          'employees', 'attendance', 'loans', 'shifts', 'tables', 'notifications',
          'gamingDevices', 'gamingSessions', 'settings', 'syncQueue', 'meta'
        ];
        for (const store of stores) {
          if (!db.objectStoreNames.contains(store as any)) {
            db.createObjectStore(store as any, { keyPath: 'id' });
          }
        }
      },
    });
  }
  return dbPromise;
}

export async function idbGetAll<T>(store: keyof PosDB): Promise<T[]> {
  const db = await getDB();
  return (db as any).getAll(store) as Promise<T[]>;
}

export async function idbPut<T extends { id: string }>(store: keyof PosDB, value: T): Promise<void> {
  const db = await getDB();
  await (db as any).put(store, value);
}

export async function idbDelete(store: keyof PosDB, id: string): Promise<void> {
  const db = await getDB();
  await (db as any).delete(store, id);
}

export async function idbClear(store: keyof PosDB): Promise<void> {
  const db = await getDB();
  await (db as any).clear(store);
}

export async function idbBulkPut<T extends { id: string }>(store: keyof PosDB, items: T[]): Promise<void> {
  const db = await getDB();
  const tx = (db as any).transaction(store, 'readwrite');
  await Promise.all([
    ...items.map((item: T) => tx.store.put(item)),
    tx.done,
  ]);
}

export async function idbGetMeta(key: string): Promise<unknown> {
  const db = await getDB();
  const rec = await db.get('meta', key);
  return rec?.value;
}

export async function idbSetMeta(key: string, value: unknown): Promise<void> {
  const db = await getDB();
  await db.put('meta', { id: key, key, value });
}

export async function idbGetAllSyncQueue(): Promise<SyncQueueItem[]> {
  const db = await getDB();
  return db.getAll('syncQueue') as Promise<SyncQueueItem[]>;
}

export async function idbAddToSyncQueue(item: SyncQueueItem): Promise<void> {
  const db = await getDB();
  await db.put('syncQueue', item);
}

export async function idbRemoveFromSyncQueue(id: string): Promise<void> {
  const db = await getDB();
  await db.delete('syncQueue', id);
}

export async function idbClearSyncQueue(): Promise<void> {
  const db = await getDB();
  await db.clear('syncQueue');
}

export async function getAllOfflineData() {
  const [
    categories, menuItems, orders, warehouses, inventory, stockMovements,
    customers, suppliers, purchases, treasury, employees, attendance,
    loans, shifts, tables, notifications, gamingDevices, gamingSessions,
  ] = await Promise.all([
    idbGetAll('categories'),
    idbGetAll('menuItems'),
    idbGetAll('orders'),
    idbGetAll('warehouses'),
    idbGetAll('inventory'),
    idbGetAll('stockMovements'),
    idbGetAll('customers'),
    idbGetAll('suppliers'),
    idbGetAll('purchases'),
    idbGetAll('treasury'),
    idbGetAll('employees'),
    idbGetAll('attendance'),
    idbGetAll('loans'),
    idbGetAll('shifts'),
    idbGetAll('tables'),
    idbGetAll('notifications'),
    idbGetAll('gamingDevices'),
    idbGetAll('gamingSessions'),
  ]);

  const settingsArr = await idbGetAll<Record<string, unknown>>('settings');
  const settings = settingsArr[0] || null;
  const nextOrderNumber = (await idbGetMeta('nextOrderNumber') as number) || 1;

  return {
    categories, menuItems, orders, warehouses, inventory, stockMovements,
    customers, suppliers, purchases, treasury, employees, attendance,
    loans, shifts, tables, notifications, gamingDevices, gamingSessions,
    settings, nextOrderNumber,
  };
}

export async function saveAllToOfflineDB(data: {
  categories?: unknown[];
  menuItems?: unknown[];
  orders?: unknown[];
  warehouses?: unknown[];
  inventory?: unknown[];
  stockMovements?: unknown[];
  customers?: unknown[];
  suppliers?: unknown[];
  purchases?: unknown[];
  treasury?: unknown[];
  employees?: unknown[];
  attendance?: unknown[];
  loans?: unknown[];
  shifts?: unknown[];
  tables?: unknown[];
  notifications?: unknown[];
  gamingDevices?: unknown[];
  gamingSessions?: unknown[];
  settings?: unknown;
  nextOrderNumber?: number;
}): Promise<void> {
  const saves: Promise<void>[] = [];

  const bulkSave = async (store: keyof PosDB, items?: unknown[]) => {
    if (items && items.length > 0) {
      await idbBulkPut(store, items as { id: string }[]);
    }
  };

  saves.push(
    bulkSave('categories', data.categories),
    bulkSave('menuItems', data.menuItems),
    bulkSave('orders', data.orders),
    bulkSave('warehouses', data.warehouses),
    bulkSave('inventory', data.inventory),
    bulkSave('stockMovements', data.stockMovements),
    bulkSave('customers', data.customers),
    bulkSave('suppliers', data.suppliers),
    bulkSave('purchases', data.purchases),
    bulkSave('treasury', data.treasury),
    bulkSave('employees', data.employees),
    bulkSave('attendance', data.attendance),
    bulkSave('loans', data.loans),
    bulkSave('shifts', data.shifts),
    bulkSave('tables', data.tables),
    bulkSave('notifications', data.notifications),
    bulkSave('gamingDevices', data.gamingDevices),
    bulkSave('gamingSessions', data.gamingSessions),
  );

  if (data.settings) {
    saves.push(idbPut('settings', { ...(data.settings as object), id: 'main' }));
  }
  if (data.nextOrderNumber !== undefined) {
    saves.push(idbSetMeta('nextOrderNumber', data.nextOrderNumber));
  }

  await Promise.all(saves);
}

import { api, SyncQueueItem, isOnline } from './api';
import {
  idbGetAllSyncQueue, idbAddToSyncQueue, idbRemoveFromSyncQueue,
  idbGetMeta, idbSetMeta, idbBulkPut, saveAllToOfflineDB
} from './offlineDB';

const MAX_RETRIES = 5;
let isSyncing = false;
let syncListeners: Array<(status: SyncStatus) => void> = [];

export interface SyncStatus {
  online: boolean;
  syncing: boolean;
  pendingCount: number;
  lastSyncAt: string | null;
  error: string | null;
}

let currentStatus: SyncStatus = {
  online: navigator.onLine,
  syncing: false,
  pendingCount: 0,
  lastSyncAt: null,
  error: null,
};

function notifyListeners() {
  for (const listener of syncListeners) {
    listener({ ...currentStatus });
  }
}

export function onSyncStatusChange(fn: (status: SyncStatus) => void) {
  syncListeners.push(fn);
  fn({ ...currentStatus });
  return () => {
    syncListeners = syncListeners.filter(l => l !== fn);
  };
}

export async function queueOperation(
  entity: string,
  operation: 'create' | 'update' | 'delete',
  data: unknown
): Promise<void> {
  const item: SyncQueueItem = {
    id: `sq-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    entity,
    operation,
    data,
    timestamp: Date.now(),
    retries: 0,
  };
  await idbAddToSyncQueue(item);
  const queue = await idbGetAllSyncQueue();
  currentStatus.online = isOnline();
  currentStatus.pendingCount = queue.length;
  notifyListeners();

  if (isOnline()) {
    void processSyncQueue();
  }
}

export async function processSyncQueue(): Promise<void> {
  if (isSyncing || !isOnline()) return;
  isSyncing = true;
  currentStatus.syncing = true;
  currentStatus.error = null;
  notifyListeners();

  try {
    const queue = await idbGetAllSyncQueue();
    if (queue.length === 0) {
      currentStatus.pendingCount = 0;
      return;
    }

    const sorted = [...queue].sort((a, b) => a.timestamp - b.timestamp);

    for (const item of sorted) {
      try {
        await executeQueueItem(item);
        await idbRemoveFromSyncQueue(item.id);
      } catch (err) {
        item.retries += 1;
        if (item.retries >= MAX_RETRIES) {
          console.error(`Dropping sync item after ${MAX_RETRIES} retries:`, item.entity, item.operation);
          await idbRemoveFromSyncQueue(item.id);
        } else {
          await idbAddToSyncQueue(item);
        }
      }
    }

    const remaining = await idbGetAllSyncQueue();
    currentStatus.pendingCount = remaining.length;
    currentStatus.lastSyncAt = new Date().toISOString();
    await idbSetMeta('lastSyncAt', currentStatus.lastSyncAt);
  } catch (err) {
    currentStatus.error = (err as Error).message;
  } finally {
    isSyncing = false;
    currentStatus.syncing = false;
    notifyListeners();
  }
}

async function executeQueueItem(item: SyncQueueItem): Promise<void> {
  const { entity, operation, data } = item;

  const entityMap: Record<string, Record<string, (d: unknown) => Promise<unknown>>> = {
    categories: {
      create: (d) => api.categories.create(d as Parameters<typeof api.categories.create>[0]),
      update: (d) => api.categories.update(d as Parameters<typeof api.categories.update>[0]),
      delete: (d) => api.categories.remove((d as { id: string }).id),
    },
    menuItems: {
      create: (d) => api.menu.create(d as Parameters<typeof api.menu.create>[0]),
      update: (d) => api.menu.update(d as Parameters<typeof api.menu.update>[0]),
      delete: (d) => api.menu.remove((d as { id: string }).id),
    },
    orders: {
      create: (d) => api.orders.create(d as Parameters<typeof api.orders.create>[0]),
      update: (d) => {
        const o = d as { id: string } & Record<string, unknown>;
        return api.orders.update(o.id, o);
      },
      delete: (d) => api.orders.remove((d as { id: string }).id),
    },
    warehouses: {
      create: (d) => api.warehouses.create(d as Parameters<typeof api.warehouses.create>[0]),
      update: (d) => api.warehouses.update(d as Parameters<typeof api.warehouses.update>[0]),
      delete: (d) => api.warehouses.remove((d as { id: string }).id),
    },
    inventory: {
      create: (d) => api.inventory.create(d as Parameters<typeof api.inventory.create>[0]),
      update: (d) => api.inventory.update(d as Parameters<typeof api.inventory.update>[0]),
      delete: (d) => api.inventory.remove((d as { id: string }).id),
    },
    stockMovements: {
      create: (d) => api.stockMovements.create(d as Parameters<typeof api.stockMovements.create>[0]),
      delete: (d) => api.stockMovements.remove((d as { id: string }).id),
    },
    customers: {
      create: (d) => api.customers.create(d as Parameters<typeof api.customers.create>[0]),
      update: (d) => api.customers.update(d as Parameters<typeof api.customers.update>[0]),
      delete: (d) => api.customers.remove((d as { id: string }).id),
    },
    suppliers: {
      create: (d) => api.suppliers.create(d as Parameters<typeof api.suppliers.create>[0]),
      update: (d) => api.suppliers.update(d as Parameters<typeof api.suppliers.update>[0]),
      delete: (d) => api.suppliers.remove((d as { id: string }).id),
    },
    purchases: {
      create: (d) => api.purchases.create(d as Parameters<typeof api.purchases.create>[0]),
      delete: (d) => api.purchases.remove((d as { id: string }).id),
    },
    treasury: {
      create: (d) => api.treasury.create(d as Parameters<typeof api.treasury.create>[0]),
      update: (d) => api.treasury.update(d as Parameters<typeof api.treasury.update>[0]),
      delete: (d) => api.treasury.remove((d as { id: string }).id),
    },
    employees: {
      create: (d) => api.employees.create(d as Parameters<typeof api.employees.create>[0]),
      update: (d) => api.employees.update(d as Parameters<typeof api.employees.update>[0]),
      delete: (d) => api.employees.remove((d as { id: string }).id),
    },
    attendance: {
      create: (d) => api.attendance.create(d as Parameters<typeof api.attendance.create>[0]),
      update: (d) => api.attendance.update(d as Parameters<typeof api.attendance.update>[0]),
      delete: (d) => api.attendance.remove((d as { id: string }).id),
    },
    loans: {
      create: (d) => api.loans.create(d as Parameters<typeof api.loans.create>[0]),
      delete: (d) => api.loans.remove((d as { id: string }).id),
    },
    shifts: {
      create: (d) => api.shifts.create(d as Parameters<typeof api.shifts.create>[0]),
      update: (d) => api.shifts.update(d as Parameters<typeof api.shifts.update>[0]),
    },
    tables: {
      create: (d) => api.tables.create(d as Parameters<typeof api.tables.create>[0]),
      update: (d) => api.tables.update(d as Parameters<typeof api.tables.update>[0]),
      delete: (d) => api.tables.remove((d as { id: string }).id),
    },
    notifications: {
      create: (d) => api.notifications.create(d as Parameters<typeof api.notifications.create>[0]),
      update: (d) => api.notifications.update(d as Parameters<typeof api.notifications.update>[0]),
    },
    gamingDevices: {
      create: (d) => api.gaming.createDevice(d as Parameters<typeof api.gaming.createDevice>[0]),
      update: (d) => api.gaming.updateDevice(d as Parameters<typeof api.gaming.updateDevice>[0]),
      delete: (d) => api.gaming.removeDevice((d as { id: string }).id),
    },
    gamingSessions: {
      create: (d) => api.gaming.createSession(d as Parameters<typeof api.gaming.createSession>[0]),
      update: (d) => api.gaming.updateSession(d as Parameters<typeof api.gaming.updateSession>[0]),
    },
    settings: {
      update: (d) => api.settings.update(d as Parameters<typeof api.settings.update>[0]),
    },
  };

  const entityHandlers = entityMap[entity];
  if (!entityHandlers) throw new Error(`Unknown entity: ${entity}`);
  const handler = entityHandlers[operation];
  if (!handler) throw new Error(`Unknown operation ${operation} for entity ${entity}`);
  await handler(data);
}

export async function pullServerChanges(): Promise<boolean> {
  if (!isOnline()) return false;
  try {
    const lastSync = (await idbGetMeta('lastSyncAt') as string) || new Date(0).toISOString();
    const changes = await api.sync.pull(lastSync);

    const storeMap: Record<string, string> = {
      categories: 'categories',
      menuItems: 'menuItems',
      orders: 'orders',
      warehouses: 'warehouses',
      inventory: 'inventory',
      stockMovements: 'stockMovements',
      customers: 'customers',
      suppliers: 'suppliers',
      purchases: 'purchases',
      treasury: 'treasury',
      employees: 'employees',
      attendance: 'attendance',
      loans: 'loans',
      shifts: 'shifts',
      tables: 'tables',
      notifications: 'notifications',
      gamingDevices: 'gamingDevices',
      gamingSessions: 'gamingSessions',
    };

    for (const [key, store] of Object.entries(storeMap)) {
      const items = changes[key] as { id: string }[] | undefined;
      if (items && items.length > 0) {
        await idbBulkPut(store as Parameters<typeof idbBulkPut>[0], items);
      }
    }

    currentStatus.lastSyncAt = new Date().toISOString();
    await idbSetMeta('lastSyncAt', currentStatus.lastSyncAt);
    return true;
  } catch (err) {
    console.error('Pull failed:', err);
    return false;
  }
}

export function initSyncService() {
  idbGetAllSyncQueue().then(q => {
    currentStatus.pendingCount = q.length;
    currentStatus.online = navigator.onLine;
    notifyListeners();
  });

  idbGetMeta('lastSyncAt').then(v => {
    currentStatus.lastSyncAt = (v as string) || null;
    notifyListeners();
  });

  window.addEventListener('online', async () => {
    currentStatus.online = true;
    notifyListeners();
    await processSyncQueue();
  });

  window.addEventListener('offline', () => {
    currentStatus.online = false;
    notifyListeners();
  });

  if (isOnline()) {
    void processSyncQueue();
  }
}

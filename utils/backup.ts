/**
 * Backup Service for M4D CAFE POS
 * Handles export and import of data via IPC (Electron) or browser download
 */

/**
 * Get all data from localStorage for backup
 */
function getDataFromLocalStorage(): object {
    const keys = [
        'categories', 'menuItems', 'orders', 'tables', 'inventory',
        'warehouses', 'stockMovements', 'customers', 'suppliers',
        'treasury', 'employees', 'attendance', 'loans', 'purchases',
        'settings', 'notifications', 'activeShift', 'shiftHistory'
    ];

    const data: any = {};

    for (const key of keys) {
        const value = localStorage.getItem(key);
        if (value) {
            try {
                data[key] = JSON.parse(value);
            } catch {
                data[key] = value;
            }
        }
    }

    return data;
}

/**
 * Download data as a file in the browser (fallback)
 */
function downloadAsFile(data: object, filename: string): void {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

/**
 * Prompt for file input in browser mode
 */
function promptFileInput(): Promise<string> {
    return new Promise((resolve) => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';

        input.onchange = (e: any) => {
            const file = e.target.files?.[0];
            if (!file) {
                resolve('');
                return;
            }

            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = () => resolve('');
            reader.readAsText(file);
        };

        input.click();
    });
}

/**
 * Create a backup - uses IPC in Electron, browser download otherwise
 */
export async function createBackup(): Promise<string | null> {
    const data = getDataFromLocalStorage();

    // Check if running in Electron
    const ipc = (window as any).ipcRenderer;

    if (ipc) {
        try {
            const result = await ipc.invoke('backup-export', data);
            if (result.success) {
                console.log('✅ Backup exported:', result.path);
                return result.path;
            } else if (result.canceled) {
                return null; // User canceled
            } else {
                console.error('Backup export failed:', result.error);
                return null;
            }
        } catch (error) {
            console.error('Backup IPC error:', error);
            return null;
        }
    } else {
        // Browser fallback
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
        const filename = `pos_backup_${timestamp}.json`;

        const backupData = {
            ...data,
            backupMeta: {
                version: '2.5.0',
                createdAt: new Date().toISOString(),
                source: 'browser'
            }
        };

        downloadAsFile(backupData, filename);
        return filename;
    }
}

/**
 * Restore from a backup - uses IPC in Electron, file input otherwise
 */
export async function restoreBackup(): Promise<boolean> {
    // Check if running in Electron
    const ipc = (window as any).ipcRenderer;

    if (ipc) {
        try {
            const result = await ipc.invoke('backup-restore');
            if (result.success && result.data) {
                // Restore to localStorage
                return restoreToLocalStorage(result.data);
            } else if (result.canceled) {
                return false; // User canceled
            } else {
                console.error('Backup restore failed:', result.error);
                return false;
            }
        } catch (error) {
            console.error('Restore IPC error:', error);
            return false;
        }
    } else {
        // Browser fallback
        const fileContent = await promptFileInput();
        if (!fileContent) return false;

        try {
            const data = JSON.parse(fileContent);
            return restoreToLocalStorage(data);
        } catch (error) {
            console.error('Failed to parse backup file:', error);
            return false;
        }
    }
}

/**
 * Restore data to localStorage
 */
function restoreToLocalStorage(data: any): boolean {
    try {
        const keys = [
            'categories', 'menuItems', 'orders', 'tables', 'inventory',
            'warehouses', 'stockMovements', 'customers', 'suppliers',
            'treasury', 'employees', 'attendance', 'loans', 'purchases',
            'settings', 'notifications', 'activeShift', 'shiftHistory'
        ];

        for (const key of keys) {
            if (data[key] !== undefined) {
                localStorage.setItem(key, JSON.stringify(data[key]));
            }
        }

        console.log('✅ Data restored to localStorage');
        return true;
    } catch (error) {
        console.error('LocalStorage restore failed:', error);
        return false;
    }
}

export default {
    createBackup,
    restoreBackup
};

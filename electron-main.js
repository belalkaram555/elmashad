
const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs');

// Setup Logging
const logPath = path.join(app.getPath('userData'), 'startup_log.txt');
function writeLog(message) {
  try {
    const time = new Date().toISOString();
    fs.appendFileSync(logPath, `[${time}] ${message} \n`);
  } catch (e) {
    console.error('Failed to write log:', e);
  }
}

// Clear log on start
try { fs.writeFileSync(logPath, '--- App Started ---\n'); } catch (e) { }

writeLog(`App Path: ${app.getAppPath()} `);
writeLog(`UserData Path: ${app.getPath('userData')} `);

function autoBackup() {
  try {
    const userDataPath = app.getPath('userData');
    const backupDir = path.join(userDataPath, 'backups');

    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    const backupPath = path.join(backupDir, `auto_backup_${timestamp}.json`);

    // Get data from localStorage via IPC (will be implemented in renderer)
    console.log('Auto backup would be saved to:', backupPath);
    writeLog(`Auto backup would be saved to: ${backupPath} `); // Added logging

    // Cleanup old backups (keep last 5)
    const backups = fs.readdirSync(backupDir)
      .filter(f => f.startsWith('auto_backup_') && f.endsWith('.json'))
      .sort()
      .reverse();

    for (let i = 5; i < backups.length; i++) {
      fs.unlinkSync(path.join(backupDir, backups[i]));
      writeLog(`Cleaned up old backup: ${backups[i]} `); // Added logging
    }
  } catch (error) {
    console.error('Auto backup failed:', error);
    writeLog(`Auto backup failed: ${error.message} \n${error.stack} `); // Added logging
  }
}

function createWindow() {
  writeLog('Creating Window...');

  // Determine preload path - in production it's in resources folder, in dev it's in project root
  const isDev = process.env.NODE_ENV === 'development' || process.argv.includes('--dev');
  const preloadPath = isDev
    ? path.join(__dirname, 'preload.js')
    : path.join(process.resourcesPath, 'preload.js');

  writeLog(`Preload path: ${preloadPath}`);

  const win = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 1024,
    minHeight: 768,
    icon: path.join(__dirname, 'icon.png'),
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      preload: preloadPath
    },
    backgroundColor: '#141416',
    show: false, // Will show later
    autoHideMenuBar: true,
    title: 'ElmashadCafePOS'
  });

  writeLog('Window Created. Loading Content...');

  // In production, load the built files
  // In development, load from vite dev server
  if (process.env.NODE_ENV === 'development' || process.argv.includes('--dev')) {
    win.loadURL('http://localhost:3000');
  } else {
    // In production, load the built file from dist folder
    const indexPath = path.join(__dirname, 'dist', 'index.html');
    writeLog(`Loading file from: ${indexPath} `);

    win.loadFile(indexPath).then(() => {
      writeLog('File Loaded Successfully');
    }).catch(e => {
      writeLog(`FAILED to load file: ${e.message} `);
    });
  }
  // Open the DevTools.
  win.webContents.openDevTools();

  win.once('ready-to-show', () => {
    writeLog('Window Ready to Show');
    win.show();
    win.maximize();
  });

  // Auto backup when window is about to close
  win.on('close', () => {
    writeLog('Window Closing...');
    // autoBackup calls here if needed
  });

  return win;
}

// IPC handlers for backup operations
function setupIpcHandlers() {
  writeLog('Setting up IPC Handlers...');
  ipcMain.handle('backup-create', async (event, data) => {
    try {
      const userDataPath = app.getPath('userData');
      const backupDir = path.join(userDataPath, 'backups');

      if (!fs.existsSync(backupDir)) {
        fs.mkdirSync(backupDir, { recursive: true });
      }

      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
      const backupPath = path.join(backupDir, `backup_${timestamp}.json`);

      fs.writeFileSync(backupPath, JSON.stringify(data, null, 2), 'utf8');
      writeLog(`Backup created: ${backupPath} `); // Added logging
      return { success: true, path: backupPath };
    } catch (error) {
      writeLog(`Backup creation failed: ${error.message} `); // Added logging
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('get-app-path', async () => {
    writeLog('IPC: get-app-path called'); // Added logging
    return app.getPath('userData');
  });

  ipcMain.handle('open-data-folder', async () => {
    const { shell } = require('electron');
    await shell.openPath(app.getPath('userData'));
  });

  // Database Handlers (SQLite)
  let dbService = null;
  try {
    writeLog('Requiring db-service...');
    dbService = require('./database/db-service');

    writeLog('Initializing Database...');
    dbService.initDatabase();
    writeLog('Database initialized successfully.');
  } catch (err) {
    writeLog(`FATAL: DB Service Failed: ${err.message} \n${err.stack} `);

    // Show error box
    setTimeout(() => {
      dialog.showErrorBox('Database Failure', `Error details in: ${logPath} \n\n` + err.message);
    }, 1000);
  }

  // Register handlers regardless of success (to meaningful errors to renderer)
  ipcMain.handle('db-read', async () => {
    if (!dbService) throw new Error("DB Service not initialized");
    writeLog('IPC: db-read called');
    return dbService.loadAllData();
  });

  ipcMain.handle('db-write', async (event, data) => {
    if (!dbService) throw new Error("DB Service not initialized");

    try {
      writeLog('IPC: db-write called');
      return dbService.saveBulk(data);
    } catch (e) {
      writeLog(`IPC: db - write ERROR: ${e.message} `);
      return false;
    }
  });

  // Backup Export Handler
  ipcMain.handle('backup-export', async (event, data) => {
    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
      const defaultPath = `pos_backup_${timestamp}.json`;

      const result = await dialog.showSaveDialog({
        title: 'حفظ النسخة الاحتياطية',
        defaultPath: defaultPath,
        filters: [
          { name: 'JSON Files', extensions: ['json'] },
          { name: 'All Files', extensions: ['*'] }
        ]
      });

      if (result.canceled || !result.filePath) {
        return { success: false, canceled: true };
      }

      // Add metadata
      const backupData = {
        ...data,
        backupMeta: {
          version: '2.5.0',
          createdAt: new Date().toISOString(),
          source: 'electron-app'
        }
      };

      fs.writeFileSync(result.filePath, JSON.stringify(backupData, null, 2), 'utf8');
      writeLog(`Backup exported to: ${result.filePath}`);
      return { success: true, path: result.filePath };
    } catch (error) {
      writeLog(`Backup export failed: ${error.message}`);
      return { success: false, error: error.message };
    }
  });

  // Backup Restore Handler
  ipcMain.handle('backup-restore', async () => {
    try {
      const result = await dialog.showOpenDialog({
        title: 'استعادة من نسخة احتياطية',
        filters: [
          { name: 'JSON Files', extensions: ['json'] },
          { name: 'All Files', extensions: ['*'] }
        ],
        properties: ['openFile']
      });

      if (result.canceled || result.filePaths.length === 0) {
        return { success: false, canceled: true };
      }

      const filePath = result.filePaths[0];
      const fileContent = fs.readFileSync(filePath, 'utf8');
      const data = JSON.parse(fileContent);

      writeLog(`Backup restored from: ${filePath}`);
      return { success: true, data: data };
    } catch (error) {
      writeLog(`Backup restore failed: ${error.message}`);
      return { success: false, error: error.message };
    }
  });
}

app.whenReady().then(() => {
  writeLog('App Ready Event Fired');
  // Setup IPC handlers
  setupIpcHandlers();

  // Create window
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  writeLog('Window All Closed');
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  writeLog(`Uncaught Exception: ${error.message} \n${error.stack} `);
});


const { ipcRenderer } = require('electron');

// Expose ipcRenderer to the renderer process
window.ipcRenderer = ipcRenderer;

console.log('✅ Preload script loaded successfully!');
console.log('✅ ipcRenderer exposed to window:', !!window.ipcRenderer);

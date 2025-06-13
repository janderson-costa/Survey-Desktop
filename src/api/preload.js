const { contextBridge, ipcRenderer } = require('electron');

// shared: Objeto compartilhado entre o frontend e o backend.
contextBridge.exposeInMainWorld('shared', {
	constants: () => ipcRenderer.invoke('constants'),
	appData: ({ key, value }) => ipcRenderer.invoke('appData', { key, value }),
	actions: {
		showMessageBox: options => ipcRenderer.invoke('showMessageBox', options),
		showOpenDialog: options => ipcRenderer.invoke('showOpenDialog', options),
		readFile: options => ipcRenderer.invoke('readFile', options),
		writeFile: options => ipcRenderer.invoke('writeFile', options),
		renameFile: options => ipcRenderer.invoke('renameFile', options),
		copyFile: options => ipcRenderer.invoke('copyFile', options),
		openFile: options => ipcRenderer.invoke('openFile', options),
		zipFile: options => ipcRenderer.invoke('zipFile', options),
		unzipFile: options => ipcRenderer.invoke('unzipFile', options),
		clearFolder: options => ipcRenderer.invoke('clearFolder', options),
		window: options => ipcRenderer.invoke('window', options),
		execute: options => ipcRenderer.invoke('execute', options),
	},
});

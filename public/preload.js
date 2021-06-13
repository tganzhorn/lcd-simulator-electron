const { contextBridge, remote, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("api", {
    close: () => ipcRenderer.send('close-window'),
    minimize: () => ipcRenderer.send('minimize-window'),
    maximize: () => ipcRenderer.send('maximize-window'),
    restore: () => ipcRenderer.send('restore-window'), 
    devTools: () => ipcRenderer.send('open-devtools') 
});

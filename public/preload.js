const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("api", {
    devTools: () => ipcRenderer.send('open-devtools')
});

const { contextBridge, shell } = require("electron");

contextBridge.exposeInMainWorld("API", {
    beep: () => shell.beep(),
    // add your custom functions or variables here.
});

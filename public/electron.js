const { app, BrowserWindow, dialog } = require("electron");
const isDev = require("electron-is-dev");
const path = require("path");

// Conditionally include the dev tools installer to load React Dev Tools
let installExtension, REACT_DEVELOPER_TOOLS;

app.commandLine.appendSwitch('enable-features', 'ElectronSerialChooser');

if (isDev) {
  const devTools = require("electron-devtools-installer");
  installExtension = devTools.default;
  REACT_DEVELOPER_TOOLS = devTools.REACT_DEVELOPER_TOOLS;
}

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 490,
    height: 640,
    resizable: false,
    icon: __dirname + '/favicon.ico',
    webPreferences: {
      contextIsolation: true,
      enableBlinkFeatures: 'Serial',
      webSecurity: true,
      preload: path.join(__dirname, "preload.js"),
    },
  });

  mainWindow.setMenu(null);

  mainWindow.webContents.session.on('select-serial-port', (event, portList, webContents, callback) => {
    event.preventDefault();
    const selectedPort = portList.find((device) => {
      return device.productId === '24597' && device.vendorId === '1027'
    });
    if (!selectedPort) {
      callback('');
    } else {
      callback(selectedPort.portId);
    }
  })

  // Load from localhost if in development
  // Otherwise load index.html file
  mainWindow.loadURL(
    isDev
      ? "http://localhost:3000"
      : `file://${path.join(__dirname, "../build/index.html")}`
  );

  // Open DevTools if in dev mode
  if (isDev) {
    mainWindow.webContents.openDevTools({ mode: "detach" });
  }
}

// Create a new browser window by invoking the createWindow
// function once the Electron application is initialized.
// Install REACT_DEVELOPER_TOOLS as well if isDev
app.whenReady().then(() => {
  if (isDev) {
    installExtension(REACT_DEVELOPER_TOOLS)
      .then((name) => console.log(`Added Extension:  ${name}`))
      .catch((error) => console.log(`An error occurred: , ${error}`));
  }

  createWindow();
});

// Add a new listener that tries to quit the application when
// it no longer has any open windows. This listener is a no-op
// on macOS due to the operating system's window management behavior.
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

// Add a new listener that creates a new browser window only if
// when the application has no visible windows after being activated.
// For example, after launching the application for the first time,
// or re-launching the already running application.
app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// The code above has been adapted from a starter example in the Electron docs:
// https://www.electronjs.org/docs/tutorial/quick-start#create-the-main-script-file

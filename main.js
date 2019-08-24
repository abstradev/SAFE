const {app, BrowserWindow, Tray, Menu} = require('electron')
const path = require('path')

let mainWindow
let tray

function createWindow () {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    title: 'Safe',
    webPreferences: {
      nodeIntegration: true,
      webviewTag: true
    }
  })

  mainWindow.setMenu(null);

  mainWindow.loadFile('index.html')

  mainWindow.on('close', function (event) {
    if (!app.isQuitting) {
      event.preventDefault();
      mainWindow.hide();
    }
    return false;
  });
}

app.on('browser-window-created', function (e, window) {
    window.setMenu(null);
});

app.on('ready', createWindow)

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit()
})

app.on('activate', function () {
  if (mainWindow === null) createWindow()
})

app.on('ready', () => {
  tray = new Tray('./build/icon.png');
  const contextMenu = Menu.buildFromTemplate([
    { label: 'Open', click: function () {
      mainWindow.show();
    }},
    { label: 'Close', click: function () {
      app.isQuitting = true;
      app.quit();
    }}
  ]);
  tray.setToolTip('SAFE');
  tray.setContextMenu(contextMenu);
});

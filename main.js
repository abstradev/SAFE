const {app, BrowserWindow, Tray, Menu, nativeImage, shell } = require('electron')
const contextMenu = require('electron-context-menu');
const openAboutWindow = require('about-window').default;
const path = require('path')

let mainWindow
let tray


contextMenu({});

// Enforce single instance
if (!app.requestSingleInstanceLock()) {
  // If already running, quit and exit.
  app.quit();
  process.exit();
}

function createWindow () {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    title: 'SAFE',
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

app.on('second-instance', (event, commandLine, workingDirectory) => {
  if (mainWindow) {
    mainWindow.show();
  }
});

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
  const imgPath = path.join(__dirname, 'resources', 'icon.png');
  const img = nativeImage.createFromPath(imgPath);

  // Menu Bar
  const menuBar = Menu.buildFromTemplate([
    {
      label: 'App',
      submenu: [
        {
          label: 'Minimize',
          click: async () => {
            mainWindow.minimize();
          }
        },
        {
          label: 'Quit',
          click: async () => {
            app.isQuitting = true;
            app.quit();
          }
        }
      ]
    },
    {
      role: 'editMenu'
    },
    {
      label: 'Tools',
      submenu: [
        { 
          role: 'reload' 
        },
        { 
          role: 'forcereload' 
        }
      ]
    },
    {
      label: 'Help',
      submenu: [
        {
          label: 'About SAFE',
          click: () => openAboutWindow({
            icon_path: imgPath,
            product_name: 'SAFE',
            copyright: 'Abstra LLC',
            description: 'Single App For Everything',
            win_options: {
              autoHideMenuBar: true
            },
            use_version_info: true
          })
        },
        {
          label: 'Abstra LLC',
          click: async () => {
            const { shell } = require('electron');
            await shell.openExternal('https://abstraconsulting.com')
          }
        }
      ]
    }
  ]);
  Menu.setApplicationMenu(menuBar);

  // Tray
  tray = new Tray(img);
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

app.on('web-contents-created', (e, contents) => {
  if (contents.getType() == 'webview') {
    contents.on('new-window', (e, url) => {
      //Quickfix for Slack Calling
      if (!url.includes('app.slack.com')) {
        e.preventDefault()
        shell.openExternal(url);
      }
    });

    contextMenu({
      window: contents
    });
  }
});

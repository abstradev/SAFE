const AppGroup = require('./safe-switcher/index');
const Config = require('./config');
const { ipcMain } = require('electron');

//Read/load config or default config
const config = new Config({
  configName: 'config',
  defaults: {
    version: 1,
    apps: [
      {
        app: 'gmail'
      },
      {
        app: 'google-calendar',
      },
      {
        app: 'slack'
      },
      {
        app: 'android-messages'
      },
      {
        custom: 'google-example'
      }
    ]
  }
});

//Create initial app group
let appGroup = new AppGroup({ newApp: {
    name: 'SAFE'
  }
});

//Integrate each app
config.get('apps').forEach(app => {
  if (app.app) {
    //Built-in
    const bApp = require(`./apps/${app.app}`);
    const icon = bApp.icon ? `./apps/${app.app}/icon.svg` : '';
    const { title, src, preload } = bApp;
    appGroup.addApp({
      path: `./apps/${app.app}`,
      title,
      src,
      icon,
      preload
    });
  } else if (app.custom) {
    //Custom
    const cApp = require(`${config.getCustomPath()}/${app.custom}`);
    const icon = cApp.icon ? `${config.getCustomPath()}/${app.custom}/icon.svg` : '';
    const { title, src, preload } = cApp;
    appGroup.addApp({
      pathName: `${config.getCustomPath()}/${app.custom}`,
      title,
      src,
      icon,
      preload
    });
  }
});

ipcMain.on('notification', (event, arg) => {
  console.log(event);
  console.log(arg);
});

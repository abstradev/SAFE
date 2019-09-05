const AppGroup = require('./safe-switcher/index');
const Config = require('./config');
const { ipcRenderer } = require('electron');
const path = require('path');

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
    const icon = bApp.icon ? `./apps/${app.app}/icon.${bApp.icon}` : '';
    const { title, handler } = bApp;
    const src = app.url ? app.url : bApp.src;
    const appPath = __dirname + `/apps/${app.app}/`;
    appGroup.addApp({
      path: appPath,
      title,
      src,
      icon,
      handler
    });
  } else if (app.custom) {
    //Custom
    const cApp = require(`${config.getCustomPath()}/${app.custom}`);
    const icon = cApp.icon ? `${config.getCustomPath()}/${app.custom}/icon.${cApp.icon}` : '';
    const { title, handler } = cApp;
    const src = app.url ? app.url : cApp.src;
    appGroup.addApp({
      path: `${config.getCustomPath()}/${app.custom}`,
      title,
      src,
      icon,
      handler
    });
  }
});

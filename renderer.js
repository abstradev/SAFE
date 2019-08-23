const AppGroup = require('./safe-switcher/index');
const Config = require('./config');

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
        title: 'YouTube',
        src: 'https://youtube.com',
        icon: {
          path: ''
        }
      }
    ]
  }
});

//Create initial app group
let appGroup = new AppGroup({
  newApp: {
    name: 'SAFE'
  }
});

//Integrate each app
config.get('apps').forEach(app => {
  if (app.app) {
    //Built-in
    const bApp = require(`./apps/${app.app}`);
    const icon = `./apps/${bApp.icon.name}/icon.svg`;
    const { title, src } = bApp;
    appGroup.addApp({
      title,
      src,
      icon
    });
  } else if (app.custom) {
    const icon = app.icon.name ? `./apps/${app.icon.name}/icon.svg` : app.icon.path;
    const { title, src } = app;
    appGroup.addApp({
      title,
      src,
      icon
    });
  }
});

const AppGroup = require('./safe-switcher/index');
const Config = require('./config');

//Read/load config or default config
const config = new Config({
  configName: 'config',
  defaults: {
    version: 1,
    apps: [
      {
        title: 'Google Calendar',
        src: 'https://calendar.google.com',
        icon: {
          name: 'google-calendar',
          path: ''
        }
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
  const icon = app.icon.name ? `./apps/${app.icon.name}/icon.svg` : app.icon.path;
  const { title, src } = app;
  appGroup.addApp({
    title,
    src,
    icon
  });
});

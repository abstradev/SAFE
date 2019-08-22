const AppGroup = require('./safe-switcher/index');

let appGroup = new AppGroup({
  newApp: {
    name: 'Test App'
  }
});

appGroup.addApp({
  title: 'Google Calendar',
  src: 'https://calendar.google.com',
  icon: './apps/google-calendar/icon.svg'
});

appGroup.addApp({
  title: 'YouTube',
  src: 'https://youtube.com'
});

appGroup.getAppByPosition(0).activate();


// Source Switcher
const EventEmitter = require('events');
const hash = require('object-hash');

if (!document) {
  throw Error("Must be in a renderer");
}

class AppGroup extends EventEmitter {
  constructor (args = {}) {
    super();
    let options = {
      appContainerSelector: '.safe-apps',
      viewsContainerSelector: '.safe-views',
      appClass: 'safe-app',
      viewClass: 'safe-view',
      ready: args.ready
    };
    this.options = options;
    this.appContainer = document.querySelector(options.appContainerSelector);
    this.viewContainer = document.querySelector(options.viewsContainerSelector);
    this.apps = [];
    this.newAppId = 0;
    if (typeof this.options.ready === 'function') {
      this.options.ready(this);
    }
  }

  addApp (args) {
    let id = this.newAppId;
    this.newAppId++;
    let app = new App(this, id, args);
    this.apps.push(app);
    if (args.active === true) {
      this.activate();
    }
    this.emit('app-added', app, this);
    return app;
  }

  getApp (id) {
    for (let i in this.apps) {
      if (this.apps[i].id === id) {
        return this.apps[i];
      }
    }
    return null;
  }

  getAppByPosition (position) {
    let fromRight = position < 0;
    for (let i in this.apps) {
      if (this.apps[i].getPosition(fromRight) === position) {
        return this.apps[i];
      }
    }
  }

  getAppByRelPosition (position) {
    position = this.getActiveApp().getPosition() + position;
    if (position <= 0) {
      return null;
    }
    return this.getAppByPosition(position);
  }

  getNextApp () {
    this.getAppByRelPosition(1);
  }

  getPreviousApp () {
    return this.getAppByRelPosition(-1);
  }

  getApps () {
    return this.apps.slice();
  }

  eachApp (fn) {
    this.getApps().forEach(fn);
    return this;
  }

  getActiveApp () {
    if (this.apps.length === 0) return null;
    return this.apps[0];
  }

}

const AppGroupPrivate = {
  setActiveApp: function (app) {
    this.apps.unshift(app);
    this.emit('app-active', app, this);
    return this;
  },
  activateRecentApp: function (app)  {
    if (this.apps.length > 0) {
      this.apps[0].activate();
    }
    return this;
  }
}

class App extends EventEmitter {
  constructor (appGroup, id, args) { 
    super();
    this.appGroup = appGroup;
    this.id = id;
    this.title = args.title;
    this.icon = args.icon;
    this.src = args.src;
    this.appElements = {};
    const appHash = hash(args);
    this.webviewAttributes = {
      autosize: 'on',
      useragent: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) safe/0.0.1 Chrome/69.0.3497.128 Electron/4.2.8 Safari/537.36',
      allowpopups: 'on',
      partition: `persist:${appHash}`,
      preload: './webview/perload.js'
    };
    this.webviewAttributes.src = args.src;
    this.webviewAttributes.id = args.title;
    this.path = args.path;
    this.preload = args.preload;
    AppPrivate.initApp.bind(this)();
    AppPrivate.initWebview.bind(this)();
    if (args.visible !== false) {
      this.show();
    }
    if (typeof args.ready === 'function') {
      args.ready(this);
    }
  }

  getTitle () {
    return this.title;
  }

  setTitle (title) {
    this.title = title;
  }

  getIcon () {
    return this.icon;
  }

  setIcon (icon) {
    this.icon = icon;
  }

  setPosition (newPosition) {
    let appContainer = this.appGroup.appContainer;
    let apps = appContainer.children;
    let oldPosition = this.getPosition() - 1;

    if (newPosition < 0) {
      newPosition += appContainer.childElementCount;

      if (newPosition < 0) {
        newPosition = 0;
      }
    } else {
      if (newPosition > appContainer.childElementCount) {
        newPosition = appContainer.childElementCount;
      }

      newPosition--;
    }

    if (newPosition > oldPosition) {
      newPosition++;
    }

    appContainer.insertBefore(apps[oldPosition], apps[newPosition]);

    return this;
  }

  getPosition (fromRight) {
    let position = 0;
    let app = this.app;
    while ((app = app.previousSibling) != null) position++;

    if (fromRight === true) {
      position -= this.appGroup.appContainer.childElementCount;
    }

    if (position >= 0) {
      position++;
    }
  }

  activate () {
    let activeApp = this.appGroup.getActiveApp();
    let safeOverlay = document.getElementById('safe-overlay');
    if (activeApp) {
      activeApp.app.classList.remove('active');
      activeApp.webviewWrapper.classList.remove('visible');
    }
    safeOverlay.classList.remove('not-selected');
    AppGroupPrivate.setActiveApp.bind(this.appGroup)(this);
    this.app.classList.add('active');
    this.webviewWrapper.classList.add('visible');
    this.webview.focus();
    this.emit('active', this);
    return this;
  }

  show (flag) {
    if (flag !== false) {
      this.app.classList.add('visible');
      this.emit('visible', this);
    } else {
      this.app.classList.remove('visible');
      this.emit('hidden', this);
    }
    return this;
  }

  hide () {
    return this.show(false);
  }

  flash (flag) {
    if (flag !== false) {
      this.app.classList.add('flash');
      this.emit('flash', this);
    } else {
      this.app.classList.remove('flash');
      this.emit('unflash', this);
    }
    return this;
  }

  unflash () {
    return this.flash(false);
  }
}

const AppPrivate = {
  initApp: function () {
    let appClass = this.appGroup.options.appClass;

    //Create app
    let app = this.app = document.createElement('li');
    app.classList.add(appClass);
    for (let el of ['icon', 'title']) {
      let span = app.appendChild(document.createElement('span'));
      span.classList.add(`${appClass}-${el}`);
      this.appElements[el] = span;
    }
    let iconEle = app.appendChild(document.createElement('img'));
    iconEle.classList.add('safe-app-icon');
    iconEle.src = this.icon;

    this.setTitle(this.title);
    this.setIcon(this.icon);

    AppPrivate.initAppClickHandler.bind(this)();
    this.appGroup.appContainer.appendChild(this.app);
  },
  initAppClickHandler: function() {
    const appMouseDownHandler = function (e) {
      if (e.which === 1) {
        this.activate();
      }
    };
    this.app.addEventListener('mousedown', appMouseDownHandler.bind(this), false);
  },
  initWebview: function() {
    this.webviewWrapper = document.createElement('div');
    this.webviewWrapper.classList.add('safe-view-wrapper');
    this.webview = document.createElement('webview');

    const appWebviewDidFinishLoadHandler = function (e) {
      this.emit('webview-ready', this);
    };

    const appWebviewDidStartLoadingHandler = function (e) {
      this.webviewWrapper.classList.add('loading');
    }

    const appWebviewDidStopLoadingHandler = function (e) {
      this.webviewWrapper.classList.remove('loading');
    }

    this.webview.classList.add(this.appGroup.options.viewClass);
    if (this.webviewAttributes) {
      let attrs = this.webviewAttributes;
      for (let key in attrs) {
        this.webview.setAttribute(key, attrs[key]);
      }
    }
    this.webviewWrapper.appendChild(this.webview);
    this.appGroup.viewContainer.appendChild(this.webviewWrapper);
    this.webview.addEventListener('did-finish-load', appWebviewDidFinishLoadHandler.bind(this));
    this.webview.addEventListener('did-start-loading', appWebviewDidStartLoadingHandler.bind(this));
    this.webview.addEventListener('did-stop-loading', appWebviewDidStopLoadingHandler.bind(this));
    this.webview.addEventListener('dom-ready', () => {
      if (this.preload) {
        this.webview.executeJavaScript(`${this.path}/preload.js`);
      }
    });
  }
};

module.exports = AppGroup;

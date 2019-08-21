// Source Switcher
const EventEmitter = require('events');

if (!document) {
  throw Error("Must be in a renderer");
}

// Global styles for apps
(() => {
  const styles = `
    webview {
      width: 0px;
      height: 0px;
    }

    webview.visible {
      width: 100%;
      height: 100%;
      top: 0;
      right: 0;
      bottom: 0;
      left: 0;
    }
  `;
  let tag = document.createElement('style');
  tag.innerHTML = styles;
  document.getElementsByTagName('head')[0].appendChild(tag);
})();

class AppGroup extends EventEmitter {
  constructor (args = {}) {
    super();
    let options = this.options = {
      appContainerSelector: '.safe-apps',
      viewsContainerSelector: '.safe-views',
      appClass: 'safe-app',
      viewClass: 'safe-view',
      ready: args.ready
    };
    this.appContainer = document.querySelector(options.appContainerSelector);
    this.viewContainer = document.querySelector(options.viewsContainerSelector);
    this.apps = [];
    this.currentApp = 0;
    if (typeof this.options.ready === 'function') {
      this.options.ready(this);
    }
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

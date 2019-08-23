const { ipcRenderer } = require('electron');
const path = require('path');

class BaseController {
  constructor() {
    this.badgeCount = 0;
    this.initialize();
  }

  loop = () => null;

  setLoop(newLoop) {
    this.loop = newLoop;
  }

  setBadgeCount(newCount = 0) {
    if (this.badgeCount === newCount) return;

    //Can't go below 0...
    const count = newCount > 0 ? newCount : 0;

    ipcRenderer.sendToHost('badge', count);
    this.badgeCount = count;
  }

  onNotify(fn) {
    if (typeof fn === 'function') {
      window.Notification.prototype.onNotify = fn;
    }
  }

  initialize() {
    this.onNotify(this.handleNotification);
  }

  handleNotification (title, options) {
    ipcRenderer.sendToHost('notification', { title, options });
  }

}

new BaseController();

//Swap new window functions
// const oldWindowOpen = window.open;

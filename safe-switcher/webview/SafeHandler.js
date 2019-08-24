const { ipcRenderer } = require('electron');
const fs = require('fs-extra');

class SafeHandler {
  constructor() {
    this.badgeCount = 0;

    ipcRenderer.on('poll', () => {
      this.loop();
    });
  }

  loop = () => null;

  setLoop(fn) {
    this.loop = fn;
  }

  setBadgeCount(newCount = 0) {
    if (this.badgeCount === newCount) return;

    //Not greater than 0;
    const count = newCount > 0 ? newCount : 0;

    ipcRenderer.sendToHost('badge', count);
    this.badgeCount = count;
  }

  applyCSS(file) {
    const data = fs.readFileSync(file);
    const styles = document.createElement('style');
    styles.innerHTML = data.toString();
    document.querySelector('head').appendChild(styles);
  }
}

module.exports = SafeHandler;

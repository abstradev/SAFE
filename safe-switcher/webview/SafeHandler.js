const { ipcRenderer } = require('electron');
const fs = require('fs-extra');

class SafeHandler {
  constructor() {
    this.badgeCount = 0;
    this.timer = null;

    ipcRenderer.on('poll', () => {
      this.loop();
    });
  }

  loop = () => null;

  setLoop(fn) {
    this.loop = fn;
  }

  setUserAgent(agent) {
    ipcRenderer.sendToHost('user-agent', agent);
  }

  executeJavaScript(script) {
    ipcRenderer.sendToHost('execute-javascript', script);
  }

  setBadgeCount(newCount = 0) {
    if (this.badgeCount === newCount) return;

    //Not greater than 0;
    const count = newCount > 0 ? newCount : 0;

    ipcRenderer.sendToHost('badge', count);
    this.badgeCount = count;
  }

  setTimer(timer = null) {
    if (this.timer === timer) return;
    ipcRenderer.sendToHost('timer', timer);
    this.timer = timer;
  }

  applyCSS(file) {
    const data = fs.readFileSync(file);
    const styles = document.createElement('style');
    styles.innerHTML = data.toString();
    document.querySelector('head').appendChild(styles);
  }

  log(msg) {
    console.log(msg);
  }
}

module.exports = SafeHandler;

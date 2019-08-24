const { ipcRenderer } = require('electron');
const path = require('path');
const SafeHandler = require('./SafeHandler');

class SafeController {
  constructor() {
    this.initialize();
  }

  async initialize() {
    ipcRenderer.on('load', (event, args) => {
      this.loadHandler(event, args);
    });
    setTimeout(() => ipcRenderer.sendToHost('load-ready'), 100);
  }

  loadHandler(event, appPath) {
    const handlerPath = path.join(appPath, 'handler.js');
    try {
      require(handlerPath)(new SafeHandler());
    } catch (err) {
      console.log('Failed to load custom handler');
    }
  }
}

new SafeController();

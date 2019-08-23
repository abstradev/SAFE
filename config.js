const electron = require('electron');
const path = require('path');
const fs = require('fs');
const ncp = require('ncp').ncp;

class Config {
  constructor(opts) {
    const homePath = (electron.app || electron.remote.app).getPath('home');
    this.safePath = path.join(homePath, '.safe');
    this.safeCustomPath = path.join(this.safePath, 'custom');
    this.safeConfigPath = path.join(this.safePath, opts.configName + '.json');
    this.data = parseDataFile(this.safeConfigPath, opts.defaults);
    this.save();
  }
  
  get(key) {
    return this.data[key];
  }
  
  set(key, val) {
    this.data[key] = val;
    fs.writeFileSync(this.safeConfigPath, JSON.stringify(this.data, null, 4));
  }

  save() {
    if (!fs.existsSync(this.safePath)) {
      //First run
      fs.mkdirSync(this.safePath);
      fs.mkdirSync(this.safeCustomPath);
      ncp('./custom/', this.safeCustomPath, err => {
        fs.writeFileSync(this.safeConfigPath, JSON.stringify(this.data, null, 4));
      });
    } else {
        fs.writeFileSync(this.safeConfigPath, JSON.stringify(this.data, null, 4));
    }
  }

  getSafePath() {
    return this.safePath;
  }

  getCustomPath() {
    return this.safeCustomPath;
  }
}

function parseDataFile(filePath, defaults) {
  try {
    return JSON.parse(fs.readFileSync(filePath));
  } catch(error) {
    return defaults;
  }
}

module.exports = Config;

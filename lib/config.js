const fs = require('fs');
const path = require('path');
const os = require('os');

const KIT_DIR = 'shopify-cli-kit-nodejs';
const ACCOUNT_INFO_DIR = 'shopify-app-account-info-nodejs';
const CONFIG_FILE = 'config.json';

function getConfigDir() {
  const platform = process.platform;

  if (platform === 'darwin') {
    return path.join(os.homedir(), 'Library', 'Preferences');
  }

  if (platform === 'win32') {
    return process.env.APPDATA || path.join(os.homedir(), 'AppData', 'Roaming');
  }

  // Linux and others — respect XDG_CONFIG_HOME
  return process.env.XDG_CONFIG_HOME || path.join(os.homedir(), '.config');
}

function getKitConfigPath() {
  return path.join(getConfigDir(), KIT_DIR, CONFIG_FILE);
}

function getAccountInfoPath() {
  return path.join(getConfigDir(), ACCOUNT_INFO_DIR, CONFIG_FILE);
}

function readJSON(filePath) {
  if (!fs.existsSync(filePath)) {
    return null;
  }
  const raw = fs.readFileSync(filePath, 'utf8');
  return JSON.parse(raw);
}

function writeJSON(filePath, data) {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
}

function readKitConfig() {
  const configPath = getKitConfigPath();
  const config = readJSON(configPath);
  if (!config) {
    throw new Error(
      `Shopify CLI config not found at ${configPath}\n` +
      'Make sure Shopify CLI is installed: npm install -g @shopify/cli'
    );
  }
  return config;
}

function writeKitConfig(config) {
  writeJSON(getKitConfigPath(), config);
}

function readAccountInfo() {
  const configPath = getAccountInfoPath();
  const config = readJSON(configPath);
  if (!config) {
    return {};
  }
  return config;
}

function writeAccountInfo(data) {
  writeJSON(getAccountInfoPath(), data);
}

function getSessionStore(kitConfig) {
  if (!kitConfig.sessionStore) {
    return {};
  }
  // sessionStore is a JSON-encoded string
  const parsed = JSON.parse(kitConfig.sessionStore);
  return parsed['accounts.shopify.com'] || {};
}

function setSessionStore(kitConfig, sessions) {
  const store = { 'accounts.shopify.com': sessions };
  kitConfig.sessionStore = JSON.stringify(store);
  return kitConfig;
}

module.exports = {
  getConfigDir,
  getKitConfigPath,
  getAccountInfoPath,
  readKitConfig,
  writeKitConfig,
  readAccountInfo,
  writeAccountInfo,
  getSessionStore,
  setSessionStore,
};

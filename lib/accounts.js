const { execSync } = require('child_process');
const config = require('./config');

function getAllAccounts() {
  const kitConfig = config.readKitConfig();
  const accountInfo = config.readAccountInfo();
  const sessions = config.getSessionStore(kitConfig);
  const currentId = kitConfig.currentSessionId;

  // Merge UUIDs from both session store and account info
  const allUUIDs = new Set([
    ...Object.keys(sessions),
    ...Object.keys(accountInfo),
  ]);

  if (allUUIDs.size === 0) {
    return [];
  }

  return Array.from(allUUIDs).map((uuid) => {
    const info = accountInfo[uuid];
    const hasSession = uuid in sessions;
    return {
      uuid,
      email: info?.info?.email || null,
      isActive: uuid === currentId,
      hasSession,
    };
  });
}

function getCurrentAccount() {
  const kitConfig = config.readKitConfig();
  const accountInfo = config.readAccountInfo();
  const currentId = kitConfig.currentSessionId;

  if (!currentId) {
    return null;
  }

  const info = accountInfo[currentId];
  return {
    uuid: currentId,
    email: info?.info?.email || null,
  };
}

function switchAccount(email) {
  const accounts = getAllAccounts();

  if (accounts.length === 0) {
    throw new Error(
      'No Shopify accounts found. Run "shopify auth login" first.'
    );
  }

  const target = accounts.find(
    (a) => a.email && a.email.toLowerCase() === email.toLowerCase()
  );

  if (!target) {
    const available = accounts
      .map((a) => a.email || a.uuid)
      .join('\n  ');
    throw new Error(
      `Account "${email}" not found.\nAvailable accounts:\n  ${available}`
    );
  }

  if (target.isActive) {
    return { alreadyActive: true, email: target.email, hasSession: target.hasSession };
  }

  if (!target.hasSession) {
    throw new Error(
      `Session for "${email}" has expired.\n` +
      'Run "shopify-accounts add" to re-authenticate this account.'
    );
  }

  const kitConfig = config.readKitConfig();
  kitConfig.currentSessionId = target.uuid;
  config.writeKitConfig(kitConfig);

  return { alreadyActive: false, email: target.email, hasSession: true };
}

function addAccount() {
  // Check that shopify CLI is available
  try {
    execSync('which shopify', { stdio: 'ignore' });
  } catch {
    throw new Error(
      'Shopify CLI not found. Install it with: npm install -g @shopify/cli'
    );
  }

  const kitConfigBefore = config.readKitConfig();
  const previousId = kitConfigBefore.currentSessionId;

  // Run shopify auth login interactively
  console.log('Opening Shopify login in your browser...\n');
  try {
    execSync('shopify auth login', { stdio: 'inherit' });
  } catch {
    throw new Error('Login was cancelled or failed.');
  }

  // Read the updated config
  const kitConfigAfter = config.readKitConfig();
  const newId = kitConfigAfter.currentSessionId;

  if (!newId) {
    throw new Error('Login completed but no session ID was set.');
  }

  // Check if this is a new or existing account
  const accountInfo = config.readAccountInfo();
  const info = accountInfo[newId];
  const email = info?.info?.email || null;

  const sessionsBefore = config.getSessionStore(kitConfigBefore);
  const isNew = !sessionsBefore[newId];

  return {
    uuid: newId,
    email,
    isNew,
    previousId,
  };
}

function removeAccount(email) {
  const accounts = getAllAccounts();

  const target = accounts.find(
    (a) => a.email && a.email.toLowerCase() === email.toLowerCase()
  );

  if (!target) {
    const available = accounts
      .map((a) => a.email || a.uuid)
      .join('\n  ');
    throw new Error(
      `Account "${email}" not found.\nAvailable accounts:\n  ${available}`
    );
  }

  if (target.isActive) {
    throw new Error(
      `Cannot remove the active account. Switch to another account first.`
    );
  }

  // Remove from session store
  const kitConfig = config.readKitConfig();
  const sessions = config.getSessionStore(kitConfig);
  delete sessions[target.uuid];
  config.setSessionStore(kitConfig, sessions);
  config.writeKitConfig(kitConfig);

  // Remove from account info
  const accountInfo = config.readAccountInfo();
  delete accountInfo[target.uuid];
  config.writeAccountInfo(accountInfo);

  return { email: target.email, uuid: target.uuid };
}

module.exports = {
  getAllAccounts,
  getCurrentAccount,
  switchAccount,
  addAccount,
  removeAccount,
};

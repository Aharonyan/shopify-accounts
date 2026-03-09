const { getCurrentAccount } = require('../accounts');

function run() {
  const account = getCurrentAccount();

  if (!account) {
    console.log('No active Shopify account.');
    console.log('Run "shopify-accounts add" to log in.');
    return;
  }

  console.log(account.email || account.uuid);
}

module.exports = { run };

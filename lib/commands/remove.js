const { removeAccount } = require('../accounts');

function run(args) {
  const email = args[0];

  if (!email) {
    console.error('Usage: shopify-accounts remove <email>');
    process.exit(1);
  }

  const result = removeAccount(email);
  console.log(`\x1b[32mRemoved account: ${result.email}\x1b[0m`);
}

module.exports = { run };

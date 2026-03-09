const { switchAccount } = require('../accounts');

function run(args) {
  const email = args[0];

  if (!email) {
    console.error('Usage: shopify-accounts switch <email>');
    process.exit(1);
  }

  const result = switchAccount(email);

  if (result.alreadyActive) {
    console.log(`Already on ${result.email}`);
  } else {
    console.log(`\x1b[32mSwitched to ${result.email}\x1b[0m`);
  }
}

module.exports = { run };

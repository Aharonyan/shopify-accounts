const { addAccount } = require('../accounts');

function run() {
  const result = addAccount();

  if (result.isNew) {
    console.log(`\n\x1b[32mNew account added: ${result.email || result.uuid}\x1b[0m`);
  } else {
    console.log(`\n\x1b[33mAccount already exists: ${result.email || result.uuid}\x1b[0m`);
    console.log('Switched to this account.');
  }
}

module.exports = { run };

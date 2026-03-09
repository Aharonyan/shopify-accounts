const readline = require('readline');
const { getAllAccounts, switchAccount } = require('../accounts');

function run() {
  const accounts = getAllAccounts();

  if (accounts.length === 0) {
    console.log('No Shopify accounts found.');
    console.log('Run "shopify auth login" to add your first account.');
    return;
  }

  const switchable = accounts.filter((a) => !a.isActive && a.hasSession);

  if (switchable.length === 0) {
    printList(accounts);
    return;
  }

  printList(accounts);
  promptSelect(accounts);
}

function printList(accounts) {
  console.log('Shopify accounts:\n');
  let index = 1;
  for (const account of accounts) {
    const label = account.email || account.uuid;
    const expired = !account.hasSession ? ' \x1b[33m(expired)\x1b[0m' : '';
    if (account.isActive) {
      console.log(`  \x1b[32m* ${label}\x1b[0m (active)`);
      account._index = null;
    } else if (!account.hasSession) {
      console.log(`    ${label}${expired}`);
      account._index = null;
    } else {
      console.log(`  \x1b[36m[${index}]\x1b[0m ${label}`);
      account._index = index;
      index++;
    }
  }
  console.log('');
}

function promptSelect(accounts) {
  const selectable = accounts.filter((a) => a._index !== null);

  if (selectable.length === 0) {
    return;
  }

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  rl.question('Switch to account [number]: ', (answer) => {
    rl.close();

    const trimmed = answer.trim();
    if (!trimmed) {
      return;
    }

    const num = parseInt(trimmed, 10);
    const target = selectable.find((a) => a._index === num);

    if (!target) {
      console.error(`\x1b[31mError:\x1b[0m Invalid selection: ${trimmed}`);
      process.exit(1);
    }

    try {
      const result = switchAccount(target.email);
      if (result.alreadyActive) {
        console.log(`Already on ${result.email}`);
      } else {
        console.log(`\x1b[32mSwitched to ${result.email}\x1b[0m`);
      }
    } catch (err) {
      console.error(`\x1b[31mError:\x1b[0m ${err.message}`);
      process.exit(1);
    }
  });
}

module.exports = { run };

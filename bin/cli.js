#!/usr/bin/env node

const VERSION = require('../package.json').version;

const HELP = `
shopify-accounts v${VERSION}

Switch between multiple Shopify CLI accounts without logging out.

Usage:
  shopify-accounts                   List all accounts (default)
  shopify-accounts list              List all accounts
  shopify-accounts switch <email>    Switch to an account
  shopify-accounts <email>           Switch to an account (shorthand)
  shopify-accounts add               Log in and add a new account
  shopify-accounts remove <email>    Remove an account
  shopify-accounts whoami            Show the active account
  shopify-accounts help [command]    Show help for a command

Options:
  -h, --help       Show this help message
  -v, --version    Show version number

Run "shopify-accounts help <command>" for details on a specific command.
`.trim();

const COMMAND_HELP = {
  list: `
Usage: shopify-accounts list

List all Shopify CLI accounts discovered from your local config.

Accounts are auto-discovered from Shopify CLI's session store and account
info files. The active account is marked with an asterisk (*). Accounts
with expired sessions are marked accordingly.

This is the default command when no arguments are given.

Examples:
  shopify-accounts list
  shopify-accounts
`.trim(),

  switch: `
Usage: shopify-accounts switch <email>

Switch the active Shopify CLI account. After switching, all shopify
commands (theme dev, theme push, app dev, etc.) will use the new account.

You can also pass the email directly without the "switch" keyword:
  shopify-accounts user@example.com

The account must have an active session. If the session has expired,
use "shopify-accounts add" to re-authenticate.

Examples:
  shopify-accounts switch user@example.com
  shopify-accounts user@example.com
`.trim(),

  add: `
Usage: shopify-accounts add

Add a new Shopify account by opening the Shopify login flow in your
browser. After authentication completes, the new account is automatically
discovered and becomes the active account.

If the account was previously logged in, this refreshes the session.

Examples:
  shopify-accounts add
`.trim(),

  remove: `
Usage: shopify-accounts remove <email>

Remove an account's session and info from Shopify CLI's local config.
This does not affect your Shopify account itself — it only removes
the local session data.

You cannot remove the currently active account. Switch to another
account first.

Examples:
  shopify-accounts remove user@example.com
`.trim(),

  whoami: `
Usage: shopify-accounts whoami

Print the email address of the currently active Shopify CLI account.
Useful for scripting or verifying which account is active before
running shopify commands.

Examples:
  shopify-accounts whoami
`.trim(),
};

function main() {
  const args = process.argv.slice(2);
  const command = args[0];
  const commandArgs = args.slice(1);

  if (!command || command === 'list') {
    require('../lib/commands/list').run();
  } else if (command === 'switch') {
    require('../lib/commands/switch').run(commandArgs);
  } else if (command === 'add') {
    require('../lib/commands/add').run();
  } else if (command === 'remove') {
    require('../lib/commands/remove').run(commandArgs);
  } else if (command === 'whoami') {
    require('../lib/commands/whoami').run();
  } else if (command === 'help' || command === '-h' || command === '--help') {
    const subcommand = commandArgs[0];
    if (subcommand && COMMAND_HELP[subcommand]) {
      console.log(COMMAND_HELP[subcommand]);
    } else if (subcommand) {
      console.error(`Unknown command: ${subcommand}`);
      console.error('Run "shopify-accounts help" for available commands.');
      process.exit(1);
    } else {
      console.log(HELP);
    }
  } else if (command === '-v' || command === '--version' || command === 'version') {
    console.log(VERSION);
  } else if (command.includes('@')) {
    // Treat as email for quick switching
    // e.g. `shopify-accounts user@example.com` === `shopify-accounts switch user@example.com`
    require('../lib/commands/switch').run([command]);
  } else {
    console.error(`Unknown command: ${command}`);
    console.error('Run "shopify-accounts --help" for usage.');
    process.exit(1);
  }
}

try {
  main();
} catch (err) {
  console.error(`\x1b[31mError:\x1b[0m ${err.message}`);
  process.exit(1);
}

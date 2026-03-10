# shopify-accounts

Switch between multiple Shopify CLI accounts without logging out.

Shopify CLI only supports one active account at a time. Switching requires `shopify auth logout` + `shopify auth login` with browser OAuth each time. This tool reads Shopify CLI's config files to auto-discover all logged-in accounts and switch between them instantly.

## Install

```bash
npm install -g shopify-accounts
```

## Usage

```bash
# List all accounts (default command)
shopify-accounts list

# Switch to an account
shopify-accounts switch user@example.com

# Shorthand — just pass the email directly
shopify-accounts user@example.com

# Show the active account
shopify-accounts whoami

# Add a new account (opens browser login)
shopify-accounts add

# Remove an account
shopify-accounts remove user@example.com

# Show help
shopify-accounts help

# Show help for a specific command
shopify-accounts help switch
```

## How it works

Shopify CLI stores authentication data in local config files:

- **Session store** — contains OAuth tokens for each logged-in account, identified by a UUID
- **Account info** — maps each UUID to an email address

This tool reads those files to discover your accounts and switches the active one by updating the `currentSessionId` field. No tokens are created, modified, or transmitted — it simply tells Shopify CLI which existing session to use.

### Config file locations

| Platform | Path |
|----------|------|
| macOS    | `~/Library/Preferences/shopify-cli-kit-nodejs/config.json` |
| Linux    | `$XDG_CONFIG_HOME/shopify-cli-kit-nodejs/config.json` (defaults to `~/.config/`) |
| Windows  | `%APPDATA%\shopify-cli-kit-nodejs\config.json` |

## Commands

### `shopify-accounts list`

Lists all discovered accounts and marks the active one. This is the default command when no arguments are given.

### `shopify-accounts switch <email>`

Switches the active Shopify CLI account. After switching, all `shopify` commands (`theme dev`, `theme push`, etc.) will use the new account.

### `shopify-accounts add`

Runs `shopify auth login` interactively to authenticate a new account. After login completes, the new account is automatically discovered from the updated config.

### `shopify-accounts remove <email>`

Removes an account's session data from Shopify CLI's config. You cannot remove the currently active account — switch to another one first.

### `shopify-accounts whoami`

Prints the email of the currently active account.

## Best practices

### Keep sessions alive

Each time you run a Shopify CLI command (`theme dev`, `theme push`, etc.), the CLI refreshes the active session's tokens. If you don't use an account for a long time, the session may expire. Run `shopify-accounts list` periodically to check session status, and use `shopify-accounts add` to re-authenticate expired accounts.

### Verify before pushing

Always confirm you're on the right account before running destructive commands:

```bash
shopify-accounts whoami
shopify theme push --store mystore.myshopify.com
```

### Use in scripts and CI

`shopify-accounts whoami` outputs just the email with no formatting, making it safe for scripting:

```bash
if [ "$(shopify-accounts whoami)" != "production@company.com" ]; then
  echo "Wrong account! Switch before deploying."
  exit 1
fi
shopify theme push --store production-store.myshopify.com
```

### One account per responsibility

Avoid using a single Shopify account for everything. Use separate accounts for:
- **Development** — day-to-day theme work on dev stores
- **Production** — deploying to live stores
- **Client work** — each client's store under its own partner account

This reduces the risk of pushing to the wrong store and keeps permissions scoped.

### Pair with `--store` flag

After switching accounts, always pass the `--store` flag to target the correct store:

```bash
shopify-accounts switch dev@company.com
shopify theme dev --store dev-store.myshopify.com
```

This avoids accidentally connecting to the wrong store if a previous session had a different store cached.

## Requirements

- [Shopify CLI](https://shopify.dev/docs/api/shopify-cli) must be installed
- Node.js >= 16

## License

MIT

# Privy `smart-wallets` Starter

This is a template for using smart wallets with [**Privy Auth**](https://www.privy.io/) in a [NextJS](https://nextjs.org/) project.

## Prerequisites

Before you begin, make sure you have a [Privy account](https://privy.io), have created an app, and [configured smart wallets](https://docs.privy.io/guide/react/wallets/smart-wallets/configuration) in the dashboard.

## Setup

1. Clone this repository and open it in your terminal.

```sh
git clone https://github.com/privy-io/smart-wallets-starter
```

2. Install the necessary dependencies (including [Privy Auth](https://www.npmjs.com/package/@privy-io/react-auth)) with `npm`.

```sh
npm i
```

3. Initialize your environment variables by copying the `.env.example` file to an `.env.local` file. Then, in `.env.local`, [paste your Privy App ID from the dashboard](https://docs.privy.io/guide/dashboard/api-keys).

```sh
# In your terminal, create .env.local from .env.example
cp .env.example .env.local

# Add your Privy App ID to .env.local
NEXT_PUBLIC_PRIVY_APP_ID=<your-privy-app-id>
```

## Building locally

In your project directory, run `npm run dev`. You can now visit http://localhost:3000 to see your app and login using smart wallets with Privy!

## Check out:

- `pages/_app.tsx` for how to use the `SmartWalletsProvider` within the `PrivyProvider`
- `pages/dashboard.tsx` for how to use the `client` provided by `useSmartWallets` hook to make smart wallet transactions, including a batch transaction

**Check out [our smart wallet docs](https://docs.privy.io/guide/react/wallets/smart-wallets/) for more guidance around using smart wallets with Privy in your app!**

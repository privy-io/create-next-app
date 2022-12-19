# Privy Auth NextJS Starter

This is a simple demo app to get you started building with [**Privy Auth**](https://www.privy.io/) on [NextJS](https://nextjs.org/). 

Take a look at the deployed version at https://init.privy.io/!

## Setup

1. Clone this repository and open it in your terminal. 
```sh
git clone https://github.com/privy-io/next-starter.git
```

2. Install the necessary dependencies (including [Privy Auth](https://www.npmjs.com/package/@privy-io/react-auth)) with `npm`.
```sh
npm i 
```

3. Copy the example `.env.example` file to an `.env.local` file, and [add in your Privy App ID from the console](https://docs.privy.io/guide/console/api-keys). 
```sh
# Create the .env.local file in terminal
cp .env.example .env.local

# Add your Privy App ID in .env.local
NEXT_PUBLIC_PRIVY_APP_ID=<your-privy-app-id>
```

4. Run this application with `npm run dev` and open http://localhost:3000 in your browser to see it in action!

## Integration Points

These are some specific points of integration with Privy Auth, which you may find helpful:

### `pages/_app.tsx`
- The `PrivyProvider` wraps all components that will use the Privy Auth SDK. 
- In the `PrivyProvider`, we also pass in:
  - our Privy `appId` (retrieved from the Privy Console)
  - an (optional) `onSuccess` callback that redirects the user to the dashboard page upon login. 

### `pages/index.tsx`
- The login button invokes Privy's `login` hook when clicked, prompting a user to login with an email or crypto wallet

### `pages/dashboard.tsx`
- If a user is not `authenticated`, we redirect them back to our landing page. Note that we first check if `ready` is true before taking any actions based off of the `authenticated` hook. This ensures we do not take any actions based off of outdated authentication state that will soon be updated.
- We use the `user` object to show the user's DID and linked accounts.
- The `linkEmail`, `linkWallet`, `linkPhone`, `linkGoogle`, `linkTwitter`, and `linkDiscord` hooks allow to user to link additional accounts. 
- The `logout` hook allows the user to logout. 

Check out the [Privy Auth docs](https://docs.privy.io/) for more guidance around using Privy in your app!

# Privy Auth Demo

This is a simple starter app built with [Privy Auth](https://www.privy.io/) on [NextJS](https://nextjs.org/). 

## Setup

1. First, clone this repository locally and open it in your terminal. 
```sh
git clone https://github.com/privy-io/next-starter.git
cd auth-demo
```

2. Next, install the necessary dependencies (including [Privy Auth](https://www.npmjs.com/package/@privy-io/react-auth)!) with `npm`
```SH
npm i 
```

3. Create a `.env` file from the example, and then add in your Privy App ID.
```sh
# In your terminal
cp .env.example .env.local

# In your .env.file
NEXT_PUBLIC_PRIVY_APP_ID=<your-privy-app-id>
```

4. Run locally!
Run this application with `npm` and open http://localhost:3000 in your browser to see it in action.
```sh
npm run dev
```

## Useful Code Snippets
These are the specific points of integration:

### `pages/_app.tsx`
- The `PrivyProvider` is our top-level component in the hierarchy.
- In the `PrivyProvider`, we also pass in:
  - our Privy `appId` (retrieved from the Privy Console)
  - an (optional) `onSuccess` callback that redirects the user to the dashboard page upon login. 

### `pages/index.tsx`
- This landing page includes a button that invokes Privy Auth's `login` hook when clicked. This prompts the user to sign-in with a wallet or their email address. 

### `pages/dashboard.tsx`
- If a user is not `authenticated`, we redirect them back to our landing page. Note that we first check if `ready` is true before taking any actions based off of the `authenticated` hook. This ensures we do not take any actions based off of outdated authentication state that will soon be updated.
- We use the `user` object to show the user's DID and linked accounts.
- The `linkEmail` and `linkWallet` hooks to allow a user to link those accounts if they have not already connected them.
- The `logout` hook to allow the user to logout. 

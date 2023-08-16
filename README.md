# Privy x ZeroDev Starter

This is a template for integrating [**Privy**](https://www.privy.io/) and [**ZeroDev**](https://zerodev.app/) into a [NextJS](https://nextjs.org/) project. Check out the deployed app [here](https://zerodev-example.privy.io/)!

In this demo app, a user can login with their email, Google account, Discord account, Twitter account, or Apple account, and get a Privy embedded wallet. Once the user has logged in and created an embedded wallet, ZeroDev will create a **smart wallet** for the user behind the scenes, which can then be used to incorporate gas sponsorship, batched transactions, and more into your app. 

You can test this by logging into the app and attempting to mint an NFT with your smart wallet; it should cost you no gas!

## Setup

1. Fork this repository, clone it, and open it in your terminal.
```sh
git clone https://github.com/<your-github-handle>/zerodev-example
```

2. Install the necessary dependencies (including [Privy](https://www.npmjs.com/package/@privy-io/react-auth) and [ZeroDev](https://www.npmjs.com/package/@zerodev/privy)) with `npm`.
```sh
npm i 
```

3. Initialize your environment variables by copying the `.env.example` file to an `.env.local` file. Then, in `.env.local`, paste your **Privy App ID** from the [Privy console](https://console.privy.io) and your **ZeroDev Project ID** from the [ZeroDev dashboard](https://dashboard.zerodev.app/). This app uses Polygon's [Mumbai testnet](https://www.alchemy.com/overviews/mumbai-testnet); you should make sure to apply the same settings to your **ZeroDev Project ID**. 

```sh
# In your terminal, create .env.local from .env.example
cp .env.example .env.local

# Add your Privy App ID to .env.local
NEXT_PUBLIC_PRIVY_APP_ID=<your-privy-app-id>
NEXT_PUBLIC_ZERODEV_PROJECT_ID=<your-zerodev-project-id>
```

## Building locally

In your project directory, run `npm run dev`. You can now visit http://localhost:3000 to see your app and login with Privy!


## Check out:
- `pages/_app.tsx` for how to set your app up with the `PrivyProvider` and `ZeroDevProvider`
- `pages/dashboard.tsx` for how to use the `useSmartPrivy` hook from ZeroDev to take actions like `sendTransaction`

**Check out our [ZeroDev integration guide](https://docs.privy.io/guide/guides/zerodev) for more guidance!**

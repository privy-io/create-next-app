# Traveland Photologue

This is a demo app that teaches how to use [Privy](https://www.privy.io/) and [Irys](https://irys.xyz/) to create a mobile photo-sharing website. The app is a fork of the [Privy NextJS template](https://github.com/privy-io/create-next-app), and is packaged as a PWA for easy mobile delivery.

## Setup

1. Clone this repository and open it in your terminal.

```sh
git clone TODO
```

1. Install the necessary dependencies

```sh
npm install
```

3. Initialize your environment variables by copying the `.env.example` file to an `.env.local` file. Then, in `.env.local`, [paste your Privy App ID from the console](https://docs.privy.io/guide/console/api-keys).

```sh
# In your terminal, create .env.local from .env.example
cp .env.example .env.local

# Add your Privy App ID to .env.local
NEXT_PUBLIC_PRIVY_APP_ID=<your-privy-app-id>
```

## Building locally

In your project directory, run `npm run dev`. You can now visit http://localhost:3000 to see your app and login with Privy!

## Irys

[Irys](https://irys.xyz/) is a provenance layer built on top of [Arweave](https://arweave.org/). [Uploads to Irys](https://docs.irys.xyz/learn/transaction-lifecycle) are

-   **Permanent**
    Data stored on [Irys is censorship-resistant and immutable, forever](https://docs.irys.xyz/overview/permanent-data). There's no counterparty risk of data being removed.

-   **Precise**
    Each piece of data is [timestamped with a high-precision timestamp](https://docs.irys.xyz/learn/receipts), providing a reliable sequence of events.

-   **Unconstrained**
    Users can always read, write, and easily discover data at any scale, making the data fully composable. Irys is permissionless and offers limitless permanent data, enabling it to provide provenance for all information.

### Free uploads

When you upload to Irys, you pay a single fee at upload time and that's it. Also, uploads under 100Kib are free. To enhance reduce friction in this demo app, we automatically resize images below 100Kib before uploading.

> For more information on how this fee model works, [check out our FAQ](https://docs.irys.xyz/faqs/dev-faq#how-does-the-arweave-endowment-help-ensure-data-permanence).

### 3 Lines to permanence

```js
const irys = new Irys({ url, token, key });
const fundTx = await irys.fund(irys.utils.toAtomic(0.05));
const receipt = await irys.uploadFile("./myImage.png");
```

### Irys functions

All Irys functions are contained in `utils/irysFunctions.ts`.

-   `getWebIrys`: Connects to an Irys node using the injected provider from Privy
-   `uploadImage`: Permanently uploads an image
-   `fetchImages`: Uses the [Irys Query package](https://docs.irys.xyz/developer-docs/querying/query-package) to retrieve uploaded images
-   `resizeImage`: Resizes the image to be <100Kib

## Check out:

-   `pages/_app.tsx` for how to use the `PrivyProvider` and initialize it with your Privy App ID
-   `pages/index.tsx` for how to use the `usePrivy` hook and implement a simple `login` button
-   `pages/dashboard.tsx` for how to use the `usePrivy` hook, fields like `ready`, `authenticated`, and `user`, and methods like `linkWallet` and `logout`

**Check out [our docs](https://docs.privy.io/) for more guidance around using Privy in your app!**

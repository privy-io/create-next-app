# Privy Auth `create-next-app` Starter

A production-ready template for integrating [**Privy Auth**](https://www.privy.io/) into a [NextJS](https://nextjs.org/) project. View the live demo [here](https://create-next-app.privy.io/)!

## 🚀 Quick Overview

This starter kit uses NextJS's [Pages Router](https://nextjs.org/docs/pages/building-your-application/routing). For the [App Router](https://nextjs.org/docs/app) version, check out the [`app-router`](https://github.com/privy-io/create-next-app/tree/app-router) branch.

### Key Features
- 🔐 Secure authentication with Privy
- ⚡ Next.js integration
- 🎨 Clean, minimal UI
- 📱 Mobile-responsive design

## 🛠️ Setup

1. Clone this repository:
```sh
git clone https://github.com/privy-io/create-next-app
cd create-next-app
```

2. Install dependencies:
```sh
npm install
```

3. Configure environment variables:
```sh
# Copy the example environment file
cp .env.example .env.local

# Add your Privy App ID to .env.local
# Get your App ID from https://docs.privy.io/guide/dashboard/api-keys
NEXT_PUBLIC_PRIVY_APP_ID=<your-privy-app-id>
```

## 🚀 Development

Start the development server:
```sh
npm run dev
```
Visit http://localhost:3000 to see your app in action!

## 📁 Project Structure

Key files to explore:
- `pages/_app.tsx` - PrivyProvider configuration and initialization
- `pages/index.tsx` - Implementation of login functionality using usePrivy hook
- `pages/dashboard.tsx` - Example of authenticated routes with wallet linking and logout

## 📚 Documentation

For detailed implementation guides and API references:
- [Privy Documentation](https://docs.privy.io/)
- [Integration Guides](https://docs.privy.io/guide/)
- [API Reference](https://docs.privy.io/reference/)

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📝 License

This project is MIT licensed.

import "../styles/globals.css";
import type { AppProps } from "next/app";
import Head from "next/head";
import { PrivyProvider } from "@privy-io/react-auth";
import {toSolanaWalletConnectors} from '@privy-io/react-auth/solana';

function MyApp({ Component, pageProps }: AppProps) {
  const solanaConnectors = toSolanaWalletConnectors();

  const handleLogin = () => {
    console.log('Privy login successful');
    console.log('Cookies:', document.cookie);
  };

  return (
    <>
      <Head>
        <link rel="icon" href="/favicons/favicon.ico" sizes="any" />
        <link rel="icon" href="/favicons/icon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/favicons/apple-touch-icon.png" />
        <link rel="manifest" href="/favicons/manifest.json" />

        <title>Privy Auth Starter</title>
        <meta name="description" content="Privy Auth Starter" />
      </Head>
      <PrivyProvider
        appId={process.env.NEXT_PUBLIC_PRIVY_APP_ID || ""}
        onSuccess={handleLogin}
        config={{
          appearance: {
            // Defaults to true
            showWalletLoginFirst: true,
            walletChainType: 'solana-only',
            theme: 'light',
            accentColor: '#676FFF',
          },
          identityTokens: {
            enabled: true,
          },
          solanaClusters: [{
            name: 'mainnet-beta', 
            rpcUrl: 'https://mainnet.helius-rpc.com/?api-key=3951525f-0f9c-4aab-b67b-7dbe9d79e547'
          }],
          externalWallets: {
            solana: {connectors: solanaConnectors}
          }
        }}
        
      >
        <Component {...pageProps} />
      </PrivyProvider>
    </>
  );
}

export default MyApp;

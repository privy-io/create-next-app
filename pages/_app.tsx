import "../styles/globals.css";
import type { AppProps } from "next/app";
import Head from "next/head";
import { PrivyProvider, usePrivy } from "@privy-io/react-auth";
import { toSolanaWalletConnectors } from '@privy-io/react-auth/solana';
import Header from '@/components/Header';
import { isSolanaWallet } from '@/utils/wallet';

function AppContent({ Component, pageProps }: AppProps) {
  const { user, logout, unlinkWallet } = usePrivy();
  const solanaWallet = user?.linkedAccounts?.find(isSolanaWallet);
  const numAccounts = user?.linkedAccounts?.length || 0;
  const canRemoveAccount = numAccounts > 1;

  return (
    <>
      {/* Fixed position header */}
      <div className="fixed top-0 left-0 right-0 z-50">
        <Header
          solanaWallet={solanaWallet}
          onLogout={logout}
          onUnlinkWallet={unlinkWallet}
          canRemoveAccount={canRemoveAccount}
        />
      </div>
      
      <Component {...pageProps} />
    </>
  );
}

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
        <AppContent Component={Component} pageProps={pageProps} />
      </PrivyProvider>
    </>
  );
}

export default MyApp;

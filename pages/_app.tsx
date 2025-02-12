import "../styles/globals.css";
import type { AppProps } from "next/app";
import Head from "next/head";
import { PrivyProvider } from "@privy-io/react-auth";
import { toSolanaWalletConnectors } from "@privy-io/react-auth/solana";

function AppContent({ Component, pageProps }: AppProps) {
  return (
    <>
      <Component {...pageProps} />
    </>
  );
}

function MyApp({ Component, pageProps }: AppProps) {
  const solanaConnectors = toSolanaWalletConnectors();

  const handleLogin = () => {
    console.log("Privy login successful");
    console.log("Cookies:", document.cookie);
  };

  return (
    <>
      <Head>
        <link rel="icon" href="/favicons/icon.svg" type="image/svg+xml" />
        <link rel="manifest" href="/favicons/manifest.json" />
        <title>Page.fun</title>
        <meta name="description" content="Tokenize yourself" />
      </Head>
      <PrivyProvider
        appId={process.env.NEXT_PUBLIC_PRIVY_APP_ID || ""}
        onSuccess={handleLogin}
        config={{
          appearance: {
            // Defaults to true
            showWalletLoginFirst: true,
            walletChainType: "solana-only",
            theme: "light",
            accentColor: "#676FFF",
          },
          identityTokens: {
            enabled: true,
          },
          solanaClusters: [
            {
              name: "mainnet-beta",
              rpcUrl:
                "https://mainnet.helius-rpc.com/?api-key=3951525f-0f9c-4aab-b67b-7dbe9d79e547",
            },
          ],
          externalWallets: {
            solana: { connectors: solanaConnectors },
          },
        }}
      >
        <AppContent Component={Component} pageProps={pageProps} />
      </PrivyProvider>
    </>
  );
}

export default MyApp;

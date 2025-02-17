import type { AppProps } from "next/app";
import Head from "next/head";
import { PrivyProvider } from "@privy-io/react-auth";
import { toSolanaWalletConnectors } from "@privy-io/react-auth/solana";
import { GlobalProvider } from "@/lib/context";
import AppMenu from "@/components/AppMenu";
import "../styles/globals.css";
import "../styles/page.css";

function AppContent({ Component, pageProps }: AppProps) {
  return (
    <GlobalProvider>
      <div className="fixed top-2 left-2 z-20">
        <AppMenu />
      </div>
      <Component {...pageProps} />
    </GlobalProvider>
  );
}

function MyApp(props: AppProps) {
  const solanaConnectors = toSolanaWalletConnectors();

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
        config={{
          appearance: {
            // Defaults to true
            showWalletLoginFirst: true,
            walletChainType: "solana-only",
            theme: "light",
            accentColor: "#676FFF",
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
        }}>
        <AppContent {...props} />
      </PrivyProvider>
    </>
  );
}

export default MyApp;

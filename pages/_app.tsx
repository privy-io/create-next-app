import "../styles/globals.css";
import type { AppProps } from "next/app";
import Head from "next/head";
import { PrivyProvider } from "@privy-io/react-auth";
import { useRouter } from "next/router";
import { ZeroDevProvider } from "@zerodev/privy";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function MyApp({ Component, pageProps }: AppProps) {
  const router = useRouter();

  return (
    <>
      <Head>
        <link
          rel="preload"
          href="/fonts/AdelleSans-Regular.woff"
          as="font"
          crossOrigin=""
        />
        <link
          rel="preload"
          href="/fonts/AdelleSans-Regular.woff2"
          as="font"
          crossOrigin=""
        />
        <link
          rel="preload"
          href="/fonts/AdelleSans-Semibold.woff"
          as="font"
          crossOrigin=""
        />
        <link
          rel="preload"
          href="/fonts/AdelleSans-Semibold.woff2"
          as="font"
          crossOrigin=""
        />

        <link rel="icon" href="/favicons/favicon.ico" sizes="any" />
        <link rel="icon" href="/favicons/icon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/favicons/apple-touch-icon.png" />
        <link rel="manifest" href="/favicons/manifest.json" />

        <title>Privy ZeroDev Integration</title>
        <meta name="description" content="Privy ZeroDev Integration" />
      </Head>
      <ZeroDevProvider
        projectId={process.env.NEXT_PUBLIC_ZERODEV_PROJECT_ID || ""}
      >
        <PrivyProvider
          appId={process.env.NEXT_PUBLIC_PRIVY_APP_ID || ""}
          onSuccess={() => router.push("/dashboard")}
          config={{
            embeddedWallets: {
              createOnLogin: "users-without-wallets",
              noPromptOnSignature: true,
            },
            loginMethods: ["email", "google", "twitter", "discord", "apple"],
          }}
        >
          <ToastContainer position="top-right" />
          <Component {...pageProps} />
        </PrivyProvider>
      </ZeroDevProvider>
    </>
  );
}

export default MyApp;

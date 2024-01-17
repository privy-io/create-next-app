import "../styles/globals.css";
import type { AppProps } from "next/app";
import Head from "next/head";
import { PrivyProvider } from "@privy-io/react-auth";
import { useRouter } from "next/router";
import { polygonMumbai } from "viem/chains";

function MyApp({ Component, pageProps }: AppProps) {
	const router = useRouter();

	return (
		<>
			<Head>
				<link rel="preload" href="/fonts/AdelleSans-Regular.woff" as="font" crossOrigin="" />
				<link rel="preload" href="/fonts/AdelleSans-Regular.woff2" as="font" crossOrigin="" />
				<link rel="preload" href="/fonts/AdelleSans-Semibold.woff" as="font" crossOrigin="" />
				<link rel="preload" href="/fonts/AdelleSans-Semibold.woff2" as="font" crossOrigin="" />

				<link rel="icon" href="/favicons/favicon.ico" sizes="any" />
				<link rel="icon" href="/favicons/icon.svg" type="image/svg+xml" />
				<link rel="apple-touch-icon" href="/favicons/apple-touch-icon.png" />

				<meta
					name="viewport"
					content="minimum-scale=1, initial-scale=1, width=device-width, shrink-to-fit=no, user-scalable=no, viewport-fit=cover"
				/>

				<meta name="pwa-demo" content="pwa-demo" />
				<meta name="apple-mobile-web-app-capable" content="yes" />
				<meta name="apple-mobile-web-app-status-bar-style" content="default" />
				<meta name="apple-mobile-web-app-title" content="pwa-demo" />
				<meta name="description" content="pwa-demo" />
				<meta name="format-detection" content="telephone=no" />
				<meta name="mobile-web-app-capable" content="yes" />
				<meta name="msapplication-TileColor" content="#2B5797" />
				<meta name="msapplication-tap-highlight" content="no" />
				<meta name="theme-color" content="#000000" />

				<link rel="apple-touch-icon" href="/apple-touch-icon.png" />
				<link rel="manifest" href="/manifest.json" />
				<link rel="shortcut icon" href="/favicon.ico" />

				<title>Traveland Photologue</title>
				<meta name="description" content="Traveland Photologue" />
			</Head>
			<PrivyProvider
				appId={process.env.NEXT_PUBLIC_PRIVY_APP_ID || ""}
				onSuccess={() => router.push("/feed")}
				config={{
					//@ts-ignore
					defaultChain: polygonMumbai,
					embeddedWallets: {
						noPromptOnSignature: false, // defaults to false
						createOnLogin: "users-without-wallets",
					},
				}}
			>
				<Component {...pageProps} />
			</PrivyProvider>
		</>
	);
}

export default MyApp;

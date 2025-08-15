import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { usePrivy, WalletWithMetadata } from "@privy-io/react-auth";
import Head from "next/head";
import WalletCard from "../components/WalletCard";
import SigningPerformanceTest from "../components/SigningPerformanceTest";
import { Keypair } from "@solana/web3.js";

// Fixed entropy for deterministic key generation across all methods
// This ensures fair comparison by eliminating randomness in key generation
const FIXED_ENTROPY = new Uint8Array([
  174, 47, 154, 16, 202, 193, 206, 113, 199, 190, 53, 133, 169, 175, 31, 56,
  222, 53, 138, 189, 224, 216, 117, 173, 10, 149, 53, 45, 73, 251, 237, 246, 15,
  185, 186, 82, 177, 240, 148, 69, 241, 227, 167, 80, 141, 89, 240, 121, 121,
  35, 172, 247, 68, 251, 226, 218, 48, 63, 176, 109, 168, 89, 238, 135,
]);

// Create Solana keypair from the same entropy
const LOCAL_WALLET = Keypair.fromSecretKey(FIXED_ENTROPY);

export default function DashboardPage() {
  const router = useRouter();
  const { ready, authenticated, user, logout } = usePrivy();
  const [webCryptoKeyPair, setWebCryptoKeyPair] =
    useState<CryptoKeyPair | null>(null);

  useEffect(() => {
    // Generate Web Crypto keypair once at startup for consistent testing
    async function generateKeyPair() {
      const keyPair = await crypto.subtle.generateKey(
        {
          name: "ECDSA",
          namedCurve: "P-256", // Use P-256 curve for ECDSA
        },
        true, // Extractable (for testing purposes)
        ["sign", "verify"]
      );
      setWebCryptoKeyPair(keyPair);
    }

    generateKeyPair();
  }, []);

  useEffect(() => {
    if (ready && !authenticated) {
      router.push("/");
    }
  }, [ready, authenticated, router]);

  const privyWalletAddress: WalletWithMetadata | undefined =
    user?.linkedAccounts.find(
      (account) =>
        account.type === "wallet" &&
        account.walletClientType === "privy" &&
        account.chainType === "solana"
    ) as WalletWithMetadata | undefined;

  if (!privyWalletAddress || !webCryptoKeyPair) return null;

  return (
    <>
      <Head>
        <title>Privy Auth Demo</title>
      </Head>

      <main className="flex flex-col min-h-screen px-4 sm:px-20 py-6 sm:py-10 bg-privy-light-blue">
        {ready && authenticated ? (
          <>
            <div className="flex flex-row justify-between">
              <h1 className="text-2xl font-semibold">Privy Auth Demo</h1>
              <button
                onClick={logout}
                className="text-sm bg-violet-200 hover:text-violet-900 py-2 px-4 rounded-md text-violet-700"
              >
                Logout
              </button>
            </div>
            <div className="space-y-6 max-w-4xl mt-6">
              <h2 className="text-xl font-bold">Connected Wallets</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <WalletCard
                  walletAddress={privyWalletAddress.address}
                  walletType="privy"
                />
                <WalletCard
                  walletAddress={LOCAL_WALLET.publicKey.toBase58()}
                  walletType="local"
                />
                <WalletCard
                  walletAddress="Web Crypto API (P-256)"
                  walletType="web-crypto"
                />
              </div>

              <h2 className="text-xl font-bold pt-6">
                Signing Performance Comparison
              </h2>
              <SigningPerformanceTest
                localWallet={LOCAL_WALLET}
                webCryptoKeyPair={webCryptoKeyPair}
                privyWalletAddress={privyWalletAddress.address}
              />
            </div>
            <p className="mt-6 font-bold uppercase text-sm text-gray-600">
              User object
            </p>
            <pre className="max-w-4xl bg-slate-700 text-slate-50 font-mono p-4 text-xs sm:text-sm rounded-md mt-2">
              {JSON.stringify(user, null, 2)}
            </pre>
          </>
        ) : null}
      </main>
    </>
  );
}

import { useRouter } from "next/router";
import React, { useCallback, useState, useEffect } from "react";
import { useWallets } from "@privy-io/react-auth";
import Head from "next/head";
import { encodeFunctionData } from "viem";
import abi from "../lib/nft.json";
import { usePrivySmartAccount } from "@zerodev/privy";
import { ToastContainer, toast } from "react-toastify";
const NFT_CONTRACT_ADDRESS = "0x34bE7f35132E97915633BC1fc020364EA5134863";
const MUMBAI_SCAN_URL = "https://mumbai.polygonscan.com";

export default function DashboardPage() {
  const router = useRouter();
  const { ready, authenticated, user, zeroDevReady, sendTransaction, logout } =
    usePrivySmartAccount();
  const { wallets } = useWallets();
  const [isLoading, setIsLoading] = useState(false);

  const eoa =
    wallets.find((wallet) => wallet.walletClientType === "privy") || wallets[0];

  useEffect(() => {
    if (ready && !authenticated) {
      router.push("/");
    }
  }, [ready, authenticated, router]);

  const onMint = useCallback(async () => {
    if (!user?.wallet?.address || !sendTransaction) {
      console.error("Wallet has not fully initialized yet");
      return;
    }

    setIsLoading(true);
    const toastId = toast.loading("Minting...");
    try {
      const txHash = await sendTransaction({
        to: NFT_CONTRACT_ADDRESS,
        data: encodeFunctionData({
          abi,
          functionName: "mint",
          args: [user.wallet.address],
        }),
      });
      toast.update(toastId, {
        render: (
          <a
            href={`${MUMBAI_SCAN_URL}/tx/${txHash}`}
            target="_blank"
            color="#FF8271"
          >
            Click here to see your mint transaction.
          </a>
        ),
        type: "success",
        isLoading: false,
        autoClose: 5000,
      });
    } catch (error) {
      toast.update(toastId, {
        render:
          "Failed to mint NFT. Please see the developer console for more information.",
        type: "error",
        isLoading: false,
        autoClose: 3000,
      });
      console.error(`Failed to mint with error: ${error}`);
    }
    setIsLoading(false);
  }, [sendTransaction]);

  return (
    <>
      <Head>
        <title>Privy x ZeroDev Demo</title>
      </Head>

      <main className="flex flex-col min-h-screen px-4 sm:px-20 py-6 sm:py-10 bg-privy-light-blue">
        <ToastContainer />
        {ready && authenticated ? (
          <>
            <div className="flex flex-row justify-between">
              <h1 className="text-2xl font-semibold">Privy x ZeroDev Demo</h1>
              <button
                onClick={logout}
                className="text-sm bg-violet-200 hover:text-violet-900 py-2 px-4 rounded-md text-violet-700"
              >
                Logout
              </button>
            </div>
            <div className="mt-12 flex gap-4 flex-wrap">
              <button
                onClick={onMint}
                disabled={isLoading || !ready || !zeroDevReady}
                className="text-sm bg-violet-600 hover:bg-violet-700 disabled:bg-violet-400 py-2 px-4 rounded-md text-white"
              >
                {!isLoading ? "Mint NFT to Smart Wallet" : "Minting..."}
              </button>
            </div>

            <p className="mt-6 font-bold uppercase text-sm text-gray-600">
              Your Smart Wallet Address
            </p>
            <a
              className="mt-2 text-sm text-gray-500 hover:text-violet-600"
              href={`${MUMBAI_SCAN_URL}/address/${user?.wallet?.address}`}
            >
              {user?.wallet?.address}
            </a>
            <p className="mt-6 font-bold uppercase text-sm text-gray-600">
              Your Signer Address
            </p>
            <a
              className="mt-2 text-sm text-gray-500 hover:text-violet-600"
              href={`${MUMBAI_SCAN_URL}/address/${eoa?.address}`}
            >
              {eoa?.address}
            </a>
          </>
        ) : null}
      </main>
    </>
  );
}

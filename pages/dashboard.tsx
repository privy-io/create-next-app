import {useRouter} from 'next/router';
import React, {useCallback, useState, useEffect} from 'react';
import {usePrivy, useWallets} from '@privy-io/react-auth';
import Head from 'next/head';
import { encodeFunctionData } from "viem";
import abi from '../lib/nft.json';
import {useSmartPrivy} from '@zerodevapp/privy';

const contractAddress = '0x34bE7f35132E97915633BC1fc020364EA5134863';

export default function DashboardPage() {
  const router = useRouter();
  // Replace with useSmartPrivy
  const {
    ready,
    authenticated,
    user,
    sendTransaction,
    logout
  } = useSmartPrivy();
  const {wallets} = useWallets();
  const [isLoading, setIsLoading] = useState(false);

  const eoa = wallets.find((wallet) => (wallet.walletClientType === 'privy')) || wallets[0];

  useEffect(() => {
    if (ready && !authenticated) {
      router.push('/');
    }
  }, [ready, authenticated, router]);

  const onMint = useCallback(async () => {
    if (!user?.wallet?.address || !sendTransaction) {
      console.error('Wallet has not fully initialized yet');
      return;
    }

    setIsLoading(true);
    const txHash = await sendTransaction({
      to: contractAddress,
      data: encodeFunctionData({
        abi,
        functionName: 'mint',
        args: [user.wallet.address],
      })
    });

    console.log(`Minted with transaction hash: ${txHash}`);
    setIsLoading(false);
  }, [sendTransaction])

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
            <div className="mt-12 flex gap-4 flex-wrap">
              <button
                onClick={onMint}
                // Replace with useSmartPrivy ready state
                disabled={isLoading || !ready}
                className="text-sm bg-violet-600 hover:bg-violet-700 py-2 px-4 rounded-md text-white"
              >
                Mint NFT to Smart Wallet
              </button>
            </div>

            <p className="mt-6 font-bold uppercase text-sm text-gray-600">Your Smart Wallet Address</p>
            {/* Replace with smart wallet address */}
            <p className="mt-2 text-sm text-gray-500">{user?.wallet?.address}</p>
            <p className="mt-6 font-bold uppercase text-sm text-gray-600">Your EOA Address</p>
            <p className="mt-2 text-sm text-gray-500">{eoa?.address}</p>
          </>
        ) : null}
      </main>
    </>
  );
}

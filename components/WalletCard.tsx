import { useWallets, WalletWithMetadata } from "@privy-io/react-auth";
import { useState } from "react";
import { Account, Key, RelayActions, WalletActions } from "porto/viem";
import { encodeFunctionData, Hex, createClient, http } from "viem";
import { Chains } from "porto";

// Instantiate a Viem Client with Porto-compatible Chain.
const client = createClient({
  chain: Chains.baseSepolia,
  transport: http("https://rpc.porto.sh"),
});

interface WalletCardProps {
  wallet: WalletWithMetadata;
}

// NFT contract details
const NFT_ADDRESS = "0x3331AfB9805ccF5d6cb1657a8deD0677884604A7";
const ABI = [
  {
    inputs: [
      {
        internalType: "address",
        name: "to",
        type: "address",
      },
    ],
    name: "mint",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
] as const;

export default function WalletCard({ wallet }: WalletCardProps) {
  const [upgraded, setUpgraded] = useState(false);
  const [loading, setLoading] = useState(false);

  const [txHash, setTxHash] = useState<string | null>(null);
  const { wallets } = useWallets();

  const privyWallet = wallets.find((w) => w.address === wallet.address);

  if (!privyWallet) return null;

  const account = Account.from({
    source: "privateKey",
    address: wallet.address as Hex,
    async sign({ hash }) {
      const provider = await privyWallet.getEthereumProvider();
      const signature = await provider.request({
        method: "secp256k1_sign",
        params: [hash],
      });
      return signature;
    },
  });

  return (
    <div className="flex flex-col gap-4 p-4 border border-gray-200 rounded-lg">
      <div className="text-sm text-violet-700">
        {wallet.walletClientType === "privy" ? "Embedded " : ""}Wallet:{" "}
        {wallet.address.slice(0, 6)}...
        {wallet.address.slice(-4)}
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex flex-row gap-2">
          <button
            onClick={async () => {
              setLoading(true);
              try {
                // Create Porto account
                const upgradedAccount = await RelayActions.upgradeAccount(
                  client,
                  { account }
                );
                setUpgraded(true);
                console.log("Upgraded account:", upgradedAccount);
              } catch (error) {
                console.error("Error upgrading to Porto account:", error);
              } finally {
                setLoading(false);
              }
            }}
            disabled={upgraded || loading}
            className={`text-sm py-2 px-4 rounded-md text-white ${
              upgraded || loading
                ? "bg-blue-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {loading
              ? "Upgrading..."
              : upgraded
              ? "Upgraded account"
              : "Upgrade to Porto"}
          </button>
          <button
            onClick={async () => {
              setLoading(true);
              try {
                // Create Porto account
                const result = await RelayActions.sendCalls(client, {
                  account,
                  chain: Chains.baseSepolia,
                  calls: [
                    {
                      to: NFT_ADDRESS,
                      data: encodeFunctionData({
                        abi: ABI,
                        functionName: "mint",
                        args: [account.address],
                      }),
                    },
                  ],
                });

                console.log("Transaction result:", result);

                const status = await RelayActions.getCallsStatus(client, {
                  id: result.id, // Bundle ID from sendCalls
                });
                console.log("Transaction status:", status);

                // await 10 seconds for transaction to be indexed
                await new Promise((resolve) => setTimeout(resolve, 10000));

                const finalStatus = await RelayActions.getCallsStatus(client, {
                  id: result.id, // Bundle ID from sendCalls
                });

                console.log("Final transaction status:", finalStatus);

                // setTxHash(result);
              } catch (error) {
                console.error("Error minting NFT:", error);
              } finally {
                setLoading(false);
              }
            }}
            disabled={!upgraded || loading}
            className={`text-sm py-2 px-4 rounded-md text-white ${
              !upgraded || loading
                ? "bg-blue-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {loading ? "Sending transaction..." : "Mint NFT with Porto"}
          </button>
        </div>

        {txHash && (
          <div className="text-sm mt-2">
            <p>Transaction sent! Hash:</p>
            <a
              href={`https://sepolia.basescan.org/tx/${txHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline break-all"
            >
              {txHash}
            </a>
          </div>
        )}
      </div>
    </div>
  );
}

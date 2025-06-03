import {
  useCreateWallet,
  useSolanaWallets,
  WalletWithMetadata,
  useUser,
} from "@privy-io/react-auth";
import { useCallback, useMemo, useState } from "react";
import WalletCard from "./WalletCard";

export default function WalletList() {
  const { user } = useUser();
  const { createWallet: createEthereumWallet } = useCreateWallet();
  const { createWallet: createSolanaWallet } = useSolanaWallets();
  const [isCreating, setIsCreating] = useState(false);

  const ethereumEmbeddedWallets = useMemo<WalletWithMetadata[]>(
    () =>
      (user?.linkedAccounts.filter(
        (account) =>
          account.type === "wallet" &&
          account.walletClientType === "privy" &&
          account.chainType === "ethereum"
      ) as WalletWithMetadata[]) ?? [],
    [user]
  );

  const solanaEmbeddedWallets = useMemo<WalletWithMetadata[]>(
    () =>
      (user?.linkedAccounts.filter(
        (account) =>
          account.type === "wallet" &&
          account.walletClientType === "privy" &&
          account.chainType === "solana"
      ) as WalletWithMetadata[]) ?? [],
    [user]
  );

  const handleCreateWallet = useCallback(
    async (type: "ethereum" | "solana") => {
      setIsCreating(true);
      try {
        if (type === "ethereum") {
          await createEthereumWallet();
        } else if (type === "solana") {
          await createSolanaWallet();
        }
      } catch (error) {
        console.error("Error creating wallet:", error);
      } finally {
        setIsCreating(false);
      }
    },
    [createEthereumWallet, createSolanaWallet]
  );

  return (
    <div className="space-y-4">
      {ethereumEmbeddedWallets.length === 0 ? (
        <div className="p-4 border border-gray-200 rounded-lg text-center">
          <p className="text-gray-600 mb-4">
            No Ethereum embedded wallets found.
          </p>
          <button
            onClick={() => handleCreateWallet("ethereum")}
            disabled={isCreating}
            className="text-sm bg-violet-600 hover:bg-violet-700 py-2 px-4 rounded-md text-white disabled:bg-violet-400 disabled:cursor-not-allowed"
          >
            {isCreating ? "Creating..." : "Create Ethereum Embedded Wallet"}
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {ethereumEmbeddedWallets.map((wallet) => (
            <WalletCard key={wallet.address} wallet={wallet} />
          ))}
        </div>
      )}
      {solanaEmbeddedWallets.length === 0 ? (
        <div className="p-4 border border-gray-200 rounded-lg text-center">
          <p className="text-gray-600 mb-4">
            No Solana embedded wallets found.
          </p>
          <button
            onClick={() => handleCreateWallet("solana")}
            disabled={isCreating}
            className="text-sm bg-violet-600 hover:bg-violet-700 py-2 px-4 rounded-md text-white disabled:bg-violet-400 disabled:cursor-not-allowed"
          >
            {isCreating ? "Creating..." : "Create Solana Embedded Wallet"}
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {solanaEmbeddedWallets.map((wallet) => (
            <WalletCard key={wallet.address} wallet={wallet} />
          ))}
        </div>
      )}
    </div>
  );
}

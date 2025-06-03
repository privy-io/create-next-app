import {
  useCreateWallet,
  WalletWithMetadata,
  useUser,
  useSolanaWallets,
} from "@privy-io/react-auth";
import { useCallback, useMemo, useState } from "react";
import WalletCard from "./WalletCard";

export default function WalletList() {
  const { user } = useUser();
  const { createWallet } = useCreateWallet();
  const { createWallet: createSolanaWallet } = useSolanaWallets();
  const [isCreating, setIsCreating] = useState(false);

  // Filter and cast the wallets to our custom type
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

  const handleCreateEthereumWallet = useCallback(async () => {
    setIsCreating(true);
    try {
      await createWallet();
    } catch (error) {
      console.error("Error creating wallet:", error);
    } finally {
      setIsCreating(false);
    }
  }, [createWallet]);

  const handleCreateSolanaWallet = useCallback(async () => {
    setIsCreating(true);
    try {
      await createSolanaWallet();
    } catch (error) {
      console.error("Error creating wallet:", error);
    } finally {
      setIsCreating(false);
    }
  }, [createSolanaWallet]);

  return (
    <div className="space-y-4">
      {ethereumEmbeddedWallets.length === 0 ? (
        <div className="p-4 border border-gray-200 rounded-lg text-center">
          <p className="text-gray-600 mb-4">
            No Ethereum embedded wallets found.
          </p>
          <button
            onClick={handleCreateEthereumWallet}
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
            onClick={handleCreateSolanaWallet}
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

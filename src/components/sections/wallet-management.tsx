"use client";
import { useState, useMemo, useEffect } from "react";
import {
  useImportWallet as useImportWalletEvm,
  usePrivy,
  useSolanaWallets,
  useWallets,
} from "@privy-io/react-auth";
import {
  useImportWallet as useImportWalletSolana,
  useExportWallet as useExportWalletSolana,
} from "@privy-io/react-auth/solana";
import Section from "../reusables/section";
import { showSuccessToast, showErrorToast } from "@/components/ui/custom-toast";

type WalletInfo = {
  address: string;
  type: "ethereum" | "solana";
  name: string;
  isPrivy?: boolean;
};

const WalletManagement = () => {
  const { wallets: walletsEvm } = useWallets();
  const { wallets: walletsSolana } = useSolanaWallets();
  const { exportWallet: exportWalletEvm } = usePrivy();
  const { importWallet: importWalletEvm } = useImportWalletEvm();
  const { exportWallet: exportWalletSolana } = useExportWalletSolana();
  const { importWallet: importWalletSolana } = useImportWalletSolana();

  const allWallets = useMemo((): WalletInfo[] => {
    const evmWallets: WalletInfo[] = walletsEvm.map((wallet) => ({
      address: wallet.address,
      type: "ethereum" as const,
      name: wallet.address,
      isPrivy: wallet.walletClientType === "privy",
    }));

    const solanaWallets: WalletInfo[] = walletsSolana.map((wallet) => ({
      address: wallet.address,
      type: "solana" as const,
      name: wallet.address,
      isPrivy: wallet.walletClientType === "privy",
    }));

    return [...evmWallets, ...solanaWallets];
  }, [walletsEvm, walletsSolana]);

  const [selectedWallet, setSelectedWallet] = useState<WalletInfo | null>(null);
  const [privateKey, setPrivateKey] = useState<string>("");

  useEffect(() => {
    if (allWallets.length > 0 && !selectedWallet) {
      setSelectedWallet(allWallets[0]);
    }
  }, [allWallets, selectedWallet]);

  const handleExportWallet = async () => {
    if (!selectedWallet) {
      showErrorToast("Please select a wallet to export");
      return;
    }

    if (!selectedWallet.isPrivy) {
      showErrorToast("Only Privy wallets can be exported");
      return;
    }

    try {
      if (selectedWallet.type === "ethereum") {
        await exportWalletEvm({ address: selectedWallet.address });
        showSuccessToast("Ethereum wallet exported");
      } else {
        await exportWalletSolana({ address: selectedWallet.address });
        showSuccessToast("Solana wallet exported");
      }
    } catch (error) {
      const message = error?.toString?.() ?? "Failed to export wallet";
      showErrorToast(message);
    }
  };

  const handleImportEthereum = async () => {
    if (!privateKey) {
      showErrorToast("Please enter a private key");
      return;
    }
    try {
      await importWalletEvm({ privateKey });
      showSuccessToast("Ethereum wallet imported successfully");
      setPrivateKey("");
    } catch (error) {
      const message = error?.toString?.() ?? "Failed to import Ethereum wallet";
      showErrorToast(message);
    }
  };

  const handleImportSolana = async () => {
    if (!privateKey) {
      showErrorToast("Please enter a private key");
      return;
    }
    try {
      await importWalletSolana({ privateKey });
      showSuccessToast("Solana wallet imported successfully");
      setPrivateKey("");
    } catch (error) {
      const message = error?.toString?.() ?? "Failed to import Solana wallet";
      showErrorToast(message);
    }
  };

  const isPrivateKeyEmpty = !privateKey.trim();

  const availableActions = [
    {
      name: "Export Selected Wallet",
      function: handleExportWallet,
      disabled: !selectedWallet || !selectedWallet.isPrivy,
    },
    {
      name: "Import Wallet (EVM)",
      function: handleImportEthereum,
      disabled: isPrivateKeyEmpty,
    },
    {
      name: "Import Wallet (Solana)",
      function: handleImportSolana,
      disabled: isPrivateKeyEmpty,
    },
  ];

  return (
    <Section
      name="Wallet Management"
      description={
        "Export your embedded wallet or import an external private key for both Ethereum and Solana networks."
      }
      filepath="src/components/sections/wallet-management"
      actions={availableActions}
    >
      <div className="mb-4">
        <label
          htmlFor="wallet-management-select"
          className="block text-sm font-medium mb-2"
        >
          Select Wallet to Export:
        </label>
        <div className="relative">
          <select
            id="wallet-management-select"
            value={selectedWallet?.address || ""}
            onChange={(e) => {
              const wallet = allWallets.find(
                (w) => w.address === e.target.value
              );
              setSelectedWallet(wallet || null);
            }}
            className="w-full pl-3 pr-8 py-2 border border-[#E2E3F0] rounded-md bg-white text-black focus:outline-none focus:ring-1 focus:ring-black appearance-none"
          >
            {allWallets.length === 0 ? (
              <option value="">No wallets available</option>
            ) : (
              <>
                <option value="">Select a wallet</option>
                {allWallets.map((wallet) => (
                  <option key={wallet.address} value={wallet.address}>
                    {wallet.address} [
                    {wallet.type === "ethereum" ? "ethereum" : "solana"}]
                  </option>
                ))}
              </>
            )}
          </select>
          <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
            <svg
              className="w-4 h-4 text-gray-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </div>
        </div>
      </div>

      <div className="mt-4">
        <label className="block text-sm font-medium mb-2">
          Private key for wallet import (hex for EVM, base58 for Solana)
        </label>
        <input
          value={privateKey}
          onChange={(e) => setPrivateKey(e.target.value)}
          placeholder="Enter private key to import wallet: 0x... (EVM) or base58... (Solana)"
          className="w-full px-3 py-2 border border-[#E2E3F0] rounded-md bg-white text-black focus:outline-none focus:ring-1 focus:ring-black"
        />
      </div>
    </Section>
  );
};

export default WalletManagement;

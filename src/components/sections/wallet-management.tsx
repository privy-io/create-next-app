"use client";
import { useState } from "react";
import {
  useImportWallet as useImportWalletEvm,
  usePrivy,
  useWallets,
} from "@privy-io/react-auth";
import {
  useImportWallet as useImportWalletSolana,
  useExportWallet as useExportWalletSolana,
  useConnectedStandardWallets,
} from "@privy-io/react-auth/solana";
import Section from "../reusables/section";
import { toast } from "react-toastify";

const WalletManagement = () => {
  const { wallets: walletsEvm } = useWallets();
  const { wallets: walletsSolana } = useConnectedStandardWallets();
  const { exportWallet: exportWalletEvm } = usePrivy();
  const { importWallet: importWalletEvm } = useImportWalletEvm();
  const { exportWallet: exportWalletSolana } = useExportWalletSolana();
  const { importWallet: importWalletSolana } = useImportWalletSolana();

  const [privateKey, setPrivateKey] = useState<string>("");

  const handleExportEthereum = async () => {
    try {
      const privyWallet = walletsEvm.find(
        (wallet) => wallet.walletClientType === "privy"
      );
      await exportWalletEvm({ address: privyWallet?.address as string });
      toast.success("Ethereum wallet exported");
    } catch (error) {
      const message = error?.toString?.() ?? "Failed to export Ethereum wallet";
      toast.error(message);
    }
  };

  const handleExportSolana = async () => {
    try {
      await exportWalletSolana({
        address: walletsSolana[0]?.address as string,
      });
      toast.success("Solana wallet exported");
    } catch (error) {
      const message = error?.toString?.() ?? "Failed to export Solana wallet";
      toast.error(message);
    }
  };

  const handleImportEthereum = async () => {
    if (!privateKey) {
      toast.error("Please enter a private key");
      return;
    }
    try {
      await importWalletEvm({ privateKey });
      toast.success("Ethereum wallet imported successfully");
      setPrivateKey("");
    } catch (error) {
      const message = error?.toString?.() ?? "Failed to import Ethereum wallet";
      toast.error(message);
    }
  };

  const handleImportSolana = async () => {
    if (!privateKey) {
      toast.error("Please enter a private key");
      return;
    }
    try {
      await importWalletSolana({ privateKey });
      toast.success("Solana wallet imported successfully");
      setPrivateKey("");
    } catch (error) {
      const message = error?.toString?.() ?? "Failed to import Solana wallet";
      toast.error(message);
    }
  };

  const isPrivateKeyEmpty = !privateKey.trim();

  const availableActions = [
    {
      name: "Export Wallet (EVM)",
      function: handleExportEthereum,
    },
    {
      name: "Export Wallet (Solana)",
      function: handleExportSolana,
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
    <div>
      <Section
        name="Wallet Management"
        description={
          "Export your embedded wallet or import an external private key for both Ethereum and Solana networks."
        }
        filepath="src/components/sections/wallet-management"
        actions={availableActions}
      />

      <div className="mt-4">
        <label className="block text-sm font-medium mb-2">
          Private key (hex for EVM, base58 for Solana)
        </label>
        <input
          value={privateKey}
          onChange={(e) => setPrivateKey(e.target.value)}
          placeholder="0x... (EVM) or base58... (Solana)"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
    </div>
  );
};

export default WalletManagement;

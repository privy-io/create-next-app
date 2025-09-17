"use client";

import { useState, useMemo, useEffect } from "react";
import { useSessionSigners, useWallets } from "@privy-io/react-auth";
import Section from "../reusables/section";
import { showSuccessToast, showErrorToast } from "@/components/ui/custom-toast";

type WalletInfo = {
  address: string;
  type: "ethereum";
  name: string;
};

const SessionSigners = () => {
  const { wallets } = useWallets();
  const { addSessionSigners, removeSessionSigners } = useSessionSigners();

  const allWallets = useMemo((): WalletInfo[] => {
    return wallets.map((wallet) => ({
      address: wallet.address,
      type: "ethereum" as const,
      name: wallet.address,
    }));
  }, [wallets]);

  const [selectedWallet, setSelectedWallet] = useState<WalletInfo | null>(null);

  useEffect(() => {
    if (allWallets.length > 0 && !selectedWallet) {
      setSelectedWallet(allWallets[0]);
    }
  }, [allWallets, selectedWallet]);

  const handleAddSessionSigners = async () => {
    if (!selectedWallet) {
      showErrorToast("Please select a wallet");
      return;
    }
    try {
      await addSessionSigners({
        address: selectedWallet.address,
        signers: [
          {
            signerId: process.env.NEXT_PUBLIC_PRIVY_SIGNER_ID!,
            policyIds: [],
          },
        ],
      });
      showSuccessToast("Session signer added");
    } catch (error) {
      const message = error?.toString?.() ?? "Failed to add session signer";
      showErrorToast(message);
    }
  };

  const handleRemoveSessionSigners = async () => {
    if (!selectedWallet) {
      showErrorToast("Please select a wallet");
      return;
    }
    try {
      await removeSessionSigners({
        address: selectedWallet.address,
      });
      showSuccessToast("Session signer removed");
    } catch (error) {
      const message = error?.toString?.() ?? "Failed to remove session signer";
      showErrorToast(message);
    }
  };

  const availableActions = [
    {
      name: "Add Session Signer",
      function: handleAddSessionSigners,
      disabled: !selectedWallet,
    },
    {
      name: "Remove Session Signer",
      function: handleRemoveSessionSigners,
      disabled: !selectedWallet,
    },
  ];

  return (
    <Section
      name="Session Signers"
      description={
        "Delegate signing to a trusted service for actions like limit orders or scheduled transactions when the user is offline."
      }
      filepath="src/components/sections/session-signers"
      actions={availableActions}
    >
      <div className="mb-4">
        <label
          htmlFor="session-wallet-select"
          className="block text-sm font-medium mb-2"
        >
          Select Wallet:
        </label>
        <div className="relative">
          <select
            id="session-wallet-select"
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
                    {wallet.address} [ethereum]
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
    </Section>
  );
};

export default SessionSigners;

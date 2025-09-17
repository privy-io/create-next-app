"use client";

import { useState, useMemo, useEffect } from "react";
import {
  useWallets,
  useSendTransaction as useSendTransactionEvm,
  useSignMessage as useSignMessageEvm,
  useSignTransaction as useSignTransactionEvm,
  useSignTypedData,
} from "@privy-io/react-auth";
import {
  useSendTransaction as useSendTransactionSolana,
  useSignMessage as useSignMessageSolana,
  useSignTransaction as useSignTransactionSolana,
  useConnectedStandardWallets,
} from "@privy-io/react-auth/solana";
import bs58 from "bs58";
import {
  Connection,
  PublicKey,
  SystemProgram,
  Transaction,
} from "@solana/web3.js";
import Section from "../reusables/section";
import { showSuccessToast, showErrorToast } from "@/components/ui/custom-toast";

type WalletInfo = {
  address: string;
  type: "ethereum" | "solana";
  name: string;
};

const WalletActions = () => {
  const { signMessage: signMessageEvm } = useSignMessageEvm();
  const { signTransaction: signTransactionEvm } = useSignTransactionEvm();
  const { sendTransaction: sendTransactionEvm } = useSendTransactionEvm();
  const { signTypedData } = useSignTypedData();
  const { wallets: walletsEvm } = useWallets();
  const { signMessage: signMessageSolana } = useSignMessageSolana();
  const { signTransaction: signTransactionSolana } = useSignTransactionSolana();
  const { sendTransaction: sendTransactionSolana } = useSendTransactionSolana();
  const { wallets: walletsSolana } = useConnectedStandardWallets();

  const allWallets = useMemo((): WalletInfo[] => {
    const evmWallets: WalletInfo[] = walletsEvm.map((wallet) => ({
      address: wallet.address,
      type: "ethereum" as const,
      name: wallet.address,
    }));

    const solanaWallets: WalletInfo[] = walletsSolana.map((wallet) => ({
      address: wallet.address,
      type: "solana" as const,
      name: wallet.address,
    }));

    return [...evmWallets, ...solanaWallets];
  }, [walletsEvm, walletsSolana]);

  const [selectedWallet, setSelectedWallet] = useState<WalletInfo | null>(null);

  useEffect(() => {
    if (allWallets.length > 0 && !selectedWallet) {
      setSelectedWallet(allWallets[0]);
    }
  }, [allWallets, selectedWallet]);

  const isEvmWallet = selectedWallet?.type === "ethereum";
  const isSolanaWallet = selectedWallet?.type === "solana";

  const handleSignMessageEvm = async () => {
    if (!isEvmWallet || !selectedWallet) {
      showErrorToast("Please select an Ethereum wallet");
      return;
    }
    try {
      const message = "Hello, world!";
      const { signature } = await signMessageEvm(
        { message },
        { address: selectedWallet.address }
      );
      showSuccessToast(`EVM Message signed: ${signature.slice(0, 10)}...`);
    } catch (error) {
      console.log(error);
      showErrorToast("Failed to sign EVM message");
    }
  };

  const handleSignMessageSolana = async () => {
    if (!isSolanaWallet || !selectedWallet) {
      showErrorToast("Please select a Solana wallet");
      return;
    }
    try {
      const message = "Hello world";
      const signatureUint8Array = await signMessageSolana({
        message: new TextEncoder().encode(message),
        options: {
          address: selectedWallet.address,
          uiOptions: {
            title: "Sign this message",
          },
        },
      });
      const signature = bs58.encode(signatureUint8Array);
      showSuccessToast(`Solana Message signed: ${signature.slice(0, 10)}...`);
    } catch (error) {
      console.log(error);
      showErrorToast("Failed to sign Solana message");
    }
  };

  const handleSignTransactionEvm = async () => {
    if (!isEvmWallet || !selectedWallet) {
      showErrorToast("Please select an Ethereum wallet");
      return;
    }
    try {
      const transaction = await signTransactionEvm(
        { to: "0xE3070d3e4309afA3bC9a6b057685743CF42da77C", value: 10000 },
        { address: selectedWallet.address }
      );
      const result =
        typeof transaction === "string"
          ? transaction
          : JSON.stringify(transaction);
      showSuccessToast(`EVM Transaction signed: ${result.slice(0, 20)}...`);
    } catch (error) {
      console.log(error);
      showErrorToast("Failed to sign EVM transaction");
    }
  };

  const handleSignTransactionSolana = async () => {
    if (!isSolanaWallet || !selectedWallet) {
      showErrorToast("Please select a Solana wallet");
      return;
    }
    try {
      const connection = new Connection("https://api.mainnet-beta.solana.com");
      const transaction = new Transaction();

      const signedTransaction = await signTransactionSolana({
        transaction: transaction,
        connection: connection,
        address: selectedWallet.address,
      });
      console.log(signedTransaction);
      showSuccessToast("Solana Transaction signed successfully");
    } catch (error) {
      console.log(error);
      showErrorToast("Failed to sign Solana transaction");
    }
  };

  const handleSendTransactionEvm = async () => {
    if (!isEvmWallet || !selectedWallet) {
      showErrorToast("Please select an Ethereum wallet");
      return;
    }
    try {
      const transaction = await sendTransactionEvm(
        { to: "0xE3070d3e4309afA3bC9a6b057685743CF42da77C", value: 10000 },
        { address: selectedWallet.address }
      );
      const result =
        typeof transaction === "string"
          ? transaction
          : JSON.stringify(transaction);
      showSuccessToast(`EVM Transaction sent: ${result.slice(0, 20)}...`);
    } catch (error) {
      console.log(error);
      showErrorToast("Failed to send EVM transaction");
    }
  };

  const handleSendTransactionSolana = async () => {
    if (!isSolanaWallet || !selectedWallet) {
      showErrorToast("Please select a Solana wallet");
      return;
    }
    try {
      const connection = new Connection("https://api.devnet.solana.com");
      const transaction = new Transaction();

      const transferInstruction = SystemProgram.transfer({
        fromPubkey: new PublicKey(selectedWallet.address),
        toPubkey: new PublicKey(selectedWallet.address),
        lamports: 1000000,
      });
      transaction.add(transferInstruction);

      const latestBlockhash = await connection.getLatestBlockhash();
      transaction.recentBlockhash = latestBlockhash.blockhash;
      transaction.feePayer = new PublicKey(selectedWallet.address);

      const receipt = await sendTransactionSolana({
        transaction: transaction,
        connection: connection,
        address: selectedWallet.address,
      });
      console.log(receipt);

      showSuccessToast("Solana Transaction sent successfully");
    } catch (error) {
      console.log(error);
      showErrorToast("Failed to send Solana transaction");
    }
  };

  const handleSignTypedData = async () => {
    if (!isEvmWallet || !selectedWallet) {
      showErrorToast("Please select an Ethereum wallet");
      return;
    }
    try {
      const typedData = {
        domain: {
          name: "Example App",
          version: "1",
          chainId: 1,
          verifyingContract: "0xCcCCccccCCCCcCCCCCCcCcCccCcCCCcCcccccccC",
        },
        types: {
          Person: [
            { name: "name", type: "string" },
            { name: "wallet", type: "address" },
          ],
          Mail: [
            { name: "from", type: "Person" },
            { name: "to", type: "Person" },
            { name: "contents", type: "string" },
          ],
        },
        primaryType: "Mail",
        message: {
          from: {
            name: "Cow",
            wallet: "0xCD2a3d9F938E13CD947Ec05AbC7FE734Df8DD826",
          },
          to: {
            name: "Bob",
            wallet: "0xbBbBBBBbbBBBbbbBbbBbbbbBBbBbbbbBbBbbBBbB",
          },
          contents: "Hello, Bob!",
        },
      };

      const { signature } = await signTypedData(typedData, {
        address: selectedWallet?.address,
      });
      showSuccessToast(`Typed Data signed: ${signature.slice(0, 10)}...`);
    } catch (error) {
      console.log(error);
      showErrorToast("Failed to sign typed data");
    }
  };

  const handleSignRawHash = async () => {
    if (!isEvmWallet || !selectedWallet) {
      showErrorToast("Please select an Ethereum wallet");
      return;
    }
    try {
      // Find an embedded wallet that supports getProvider
      const embeddedWallet = walletsEvm.find(
        (wallet) =>
          wallet.walletClientType === "privy" &&
          wallet.address === selectedWallet.address
      );

      if (!embeddedWallet) {
        showErrorToast(
          "Selected wallet must be an embedded Privy wallet for raw hash signing"
        );
        return;
      }

      // Type assertion for embedded wallet provider access
      const provider = await (embeddedWallet as any).getProvider();
      const rawHash =
        "0x6503b027a625549f7be691646404f275f149d17a119a6804b855bac3030037aa";

      const signature = await provider.request({
        method: "secp256k1_sign",
        params: [rawHash],
      });

      showSuccessToast(`Raw Hash signed: ${signature.slice(0, 10)}...`);
    } catch (error) {
      console.log(error);
      showErrorToast("Failed to sign raw hash");
    }
  };

  const availableActions = [
    {
      name: "Sign Message (EVM)",
      function: handleSignMessageEvm,
      disabled: !isEvmWallet,
    },
    {
      name: "Sign Message (Solana)",
      function: handleSignMessageSolana,
      disabled: !isSolanaWallet,
    },
    {
      name: "Sign Typed Data (EVM)",
      function: handleSignTypedData,
      disabled: !isEvmWallet,
    },
    {
      name: "Sign Raw Hash (EVM)",
      function: handleSignRawHash,
      disabled: !isEvmWallet,
    },
    {
      name: "Sign Transaction (EVM)",
      function: handleSignTransactionEvm,
      disabled: !isEvmWallet,
    },
    {
      name: "Sign Transaction (Solana)",
      function: handleSignTransactionSolana,
      disabled: !isSolanaWallet,
    },
    {
      name: "Send Transaction (EVM)",
      function: handleSendTransactionEvm,
      disabled: !isEvmWallet,
    },
    {
      name: "Send Transaction (Solana)",
      function: handleSendTransactionSolana,
      disabled: !isSolanaWallet,
    },
  ];

  return (
    <Section
      name="Wallet Actions"
      description={
        "Sign messages, typed data, raw hashes, and transactions, send transactions for both EVM and Solana wallets. Seamless experience with Privy embedded wallets."
      }
      filepath="src/components/sections/wallet-actions"
      actions={availableActions}
    >
      <div className="mb-4">
        <label
          htmlFor="wallet-select"
          className="block text-sm font-medium mb-2"
        >
          Select Wallet:
        </label>
        <div className="relative">
          <select
            id="wallet-select"
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
    </Section>
  );
};

export default WalletActions;

"use client";

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
import { toast } from "react-toastify";

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

  const handleSignMessageEvm = async () => {
    try {
      const message = "Hello, world!";
      const { signature } = await signMessageEvm(
        { message },
        { address: walletsEvm[0]?.address }
      );
      toast.success(`EVM Message signed: ${signature.slice(0, 10)}...`);
    } catch (error) {
      console.log(error);
      toast.error("Failed to sign EVM message");
    }
  };

  const handleSignMessageSolana = async () => {
    try {
      const message = "Hello world";
      const signatureUint8Array = await signMessageSolana({
        message: new TextEncoder().encode(message),
        options: {
          address: walletsSolana[0]?.address,
          uiOptions: {
            title: "Sign this message",
          },
        },
      });
      const signature = bs58.encode(signatureUint8Array);
      toast.success(`Solana Message signed: ${signature.slice(0, 10)}...`);
    } catch (error) {
      console.log(error);
      toast.error("Failed to sign Solana message");
    }
  };

  const handleSignTransactionEvm = async () => {
    try {
      const transaction = await signTransactionEvm(
        { to: "0xE3070d3e4309afA3bC9a6b057685743CF42da77C", value: 10000 },
        { address: walletsEvm[0]?.address }
      );
      const result =
        typeof transaction === "string"
          ? transaction
          : JSON.stringify(transaction);
      toast.success(`EVM Transaction signed: ${result.slice(0, 20)}...`);
    } catch (error) {
      console.log(error);
      toast.error("Failed to sign EVM transaction");
    }
  };

  const handleSignTransactionSolana = async () => {
    try {
      const connection = new Connection("https://api.mainnet-beta.solana.com");
      const transaction = new Transaction();

      const signedTransaction = await signTransactionSolana({
        transaction: transaction,
        connection: connection,
        address: walletsSolana[0]?.address,
      });
      console.log(signedTransaction);
      toast.success("Solana Transaction signed successfully");
    } catch (error) {
      console.log(error);
      toast.error("Failed to sign Solana transaction");
    }
  };

  const handleSendTransactionEvm = async () => {
    try {
      const transaction = await sendTransactionEvm(
        { to: "0xE3070d3e4309afA3bC9a6b057685743CF42da77C", value: 10000 },
        { address: walletsEvm[0]?.address }
      );
      const result =
        typeof transaction === "string"
          ? transaction
          : JSON.stringify(transaction);
      toast.success(`EVM Transaction sent: ${result.slice(0, 20)}...`);
    } catch (error) {
      console.log(error);
      toast.error("Failed to send EVM transaction");
    }
  };

  const handleSendTransactionSolana = async () => {
    try {
      const connection = new Connection("https://api.devnet.solana.com");
      const transaction = new Transaction();

      const transferInstruction = SystemProgram.transfer({
        fromPubkey: new PublicKey(walletsSolana[0]?.address),
        toPubkey: new PublicKey(walletsSolana[0]?.address),
        lamports: 1000000,
      });
      transaction.add(transferInstruction);

      const latestBlockhash = await connection.getLatestBlockhash();
      transaction.recentBlockhash = latestBlockhash.blockhash;
      transaction.feePayer = new PublicKey(walletsSolana[0]?.address);

      const receipt = await sendTransactionSolana({
        transaction: transaction,
        connection: connection,
        address: walletsSolana[0]?.address,
      });
      console.log(receipt);

      toast.success("Solana Transaction sent successfully");
    } catch (error) {
      console.log(error);
      toast.error("Failed to send Solana transaction");
    }
  };

  const handleSignTypedData = async () => {
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
        address: walletsEvm[0]?.address,
      });
      toast.success(`Typed Data signed: ${signature.slice(0, 10)}...`);
    } catch (error) {
      console.log(error);
      toast.error("Failed to sign typed data");
    }
  };

  const handleSignRawHash = async () => {
    try {
      // Find an embedded wallet that supports getProvider
      const embeddedWallet = walletsEvm.find(
        (wallet) => wallet.walletClientType === "privy"
      );

      if (!embeddedWallet) {
        toast.error("No embedded wallet available for raw hash signing");
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

      toast.success(`Raw Hash signed: ${signature.slice(0, 10)}...`);
    } catch (error) {
      console.log(error);
      toast.error("Failed to sign raw hash");
    }
  };

  const availableActions = [
    {
      name: "Sign Message (EVM)",
      function: handleSignMessageEvm,
    },
    {
      name: "Sign Message (Solana)",
      function: handleSignMessageSolana,
    },
    {
      name: "Sign Typed Data (EVM)",
      function: handleSignTypedData,
    },
    {
      name: "Sign Raw Hash (EVM)",
      function: handleSignRawHash,
    },
    {
      name: "Sign Transaction (EVM)",
      function: handleSignTransactionEvm,
    },
    {
      name: "Sign Transaction (Solana)",
      function: handleSignTransactionSolana,
    },
    {
      name: "Send Transaction (EVM)",
      function: handleSendTransactionEvm,
    },
    {
      name: "Send Transaction (Solana)",
      function: handleSendTransactionSolana,
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
    />
  );
};

export default WalletActions;

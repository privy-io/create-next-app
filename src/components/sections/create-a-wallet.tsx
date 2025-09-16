"use client";

import {
  useCreateWallet as useCreateEvmWallet,
  useSolanaWallets,
} from "@privy-io/react-auth";
import { useCreateWallet as useCreateWalletExtendedChains } from "@privy-io/react-auth/extended-chains";
import Section from "../reusables/section";
import { toast } from "react-toastify";

type SupportedExtendedChains =
  | "cosmos"
  | "stellar"
  | "sui"
  | "tron"
  | "bitcoin-segwit"
  | "near"
  | "ton"
  | "starknet"
  | "spark";

const CreateAWallet = () => {
  const { createWallet: createWalletExtendedChains } =
    useCreateWalletExtendedChains();
  const { createWallet: createWalletSolana } = useSolanaWallets();
  const { createWallet: createWalletEvm } = useCreateEvmWallet({
    onSuccess: ({ wallet }) => {
      toast.success("EVM wallet created successfully.");
      console.log("Created wallet ", wallet);
    },
    onError: (error) => {
      console.log(error);
      toast.error("EVM wallet creation failed.");
    },
  });

  const createWalletEvmHandler = async () => {
    await createWalletEvm({
      createAdditional: true,
    });
  };
  const createWalletSolanaHandler = async () => {
    try {
      await createWalletSolana({
        createAdditional: true,
      });
      toast.success("Solana wallet created successfully.");
    } catch (error) {
      console.log(error);
      toast.error("Solana wallet creation failed.");
    }
  };
  const createWalletExtendedChainHandler = async (
    chain: SupportedExtendedChains
  ) => {
    try {
      await createWalletExtendedChains({
        chainType: chain,
      });
      toast.success(`${chain} wallet successfully created`);
    } catch (error) {
      console.log(error);
      toast.error(`${chain} wallet creation failed.`);
    }
  };

  const supportedChains: SupportedExtendedChains[] = [
    "cosmos",
    "stellar",
    "sui",
    "tron",
    "bitcoin-segwit",
    "near",
    "ton",
    "starknet",
    "spark",
  ];

  const availableActions = [
    {
      name: "Create Ethereum Wallet",
      function: createWalletEvmHandler,
    },
    {
      name: "Create Solana Wallet",
      function: createWalletSolanaHandler,
    },
    ...supportedChains.map((chain) => ({
      name: `Create ${
        chain.charAt(0).toUpperCase() + chain.slice(1).replace("-", " ")
      } Wallet`,
      function: () => createWalletExtendedChainHandler(chain),
    })),
  ];
  return (
    <Section
      name="Create a Wallet"
      description={
        "Creates a new wallet for the user. To limit to a single wallet per user, remove the createAdditional flag from createWallet"
      }
      filepath="src/components/sections/create-a-wallet"
      actions={availableActions}
    />
  );
};

export default CreateAWallet;

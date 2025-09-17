"use client";

import {
  useCreateWallet as useCreateEvmWallet,
  useSolanaWallets,
} from "@privy-io/react-auth";
import { useCreateWallet as useCreateWalletExtendedChains } from "@privy-io/react-auth/extended-chains";
import Section from "../reusables/section";
import { showSuccessToast, showErrorToast } from "../ui/custom-toast";

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
      showSuccessToast("EVM wallet created successfully.");
      console.log("Created wallet ", wallet);
    },
    onError: (error) => {
      console.log(error);
      showErrorToast("EVM wallet creation failed.");
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
      showSuccessToast("Solana wallet created successfully.");
    } catch (error) {
      console.log(error);
      showErrorToast("Solana wallet creation failed.");
    }
  };
  const createWalletExtendedChainHandler = async (
    chain: SupportedExtendedChains
  ) => {
    try {
      await createWalletExtendedChains({
        chainType: chain,
      });
      showSuccessToast(`${chain} wallet successfully created`);
    } catch (error) {
      console.log(error);
      showErrorToast(`${chain} wallet creation failed.`);
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
      name: "Create Ethereum wallet",
      function: createWalletEvmHandler,
    },
    {
      name: "Create Solana wallet",
      function: createWalletSolanaHandler,
    },
    ...supportedChains.map((chain) => ({
      name: `Create ${
        chain.charAt(0).toUpperCase() + chain.slice(1).replace("-", " ")
      } wallet`,
      function: () => createWalletExtendedChainHandler(chain),
    })),
  ];
  return (
    <Section
      name="Create a wallet"
      description={
        "Creates a new wallet for the user. To limit to a single wallet per user, remove the createAdditional flag from createWallet"
      }
      filepath="src/components/sections/create-a-wallet"
      actions={availableActions}
    />
  );
};

export default CreateAWallet;

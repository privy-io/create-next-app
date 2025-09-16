"use client";

import {
  useFundWallet as useFundWalletEvm,
  useSolanaWallets as useWalletsSolana,
  useWallets as useWalletsEvm,
} from "@privy-io/react-auth";
import Section from "../reusables/section";

import { useFundWallet as useFundWalletSolana } from "@privy-io/react-auth/solana";
import type { Hex } from "viem";
import { toast } from "react-toastify";

const FundWallet = () => {
  const { wallets: walletsEvm } = useWalletsEvm();
  const { wallets: walletsSolana } = useWalletsSolana();
  const { fundWallet: fundWalletEvm } = useFundWalletEvm();
  const { fundWallet: fundWalletSolana } = useFundWalletSolana();
  const fundWalletEvmHandler = (
    asset?:
      | {
          erc20: Hex;
        }
      | "USDC"
      | "native-currency"
  ) => {
    try {
      fundWalletEvm(walletsEvm[0]?.address as string, {
        amount: "1",
        ...(asset && { asset }),
      });
    } catch (error) {
      console.log(error);
      toast.error("Wallet funding action failed.");
    }
  };
  const fundWalletSolanaHandler = (asset?: "USDC" | "native-currency") => {
    try {
      fundWalletSolana(walletsSolana[0]?.address as string, {
        amount: "1",
        ...(asset && { asset }),
      });
    } catch (error) {
      console.log(error);
      toast.error("Wallet funding action failed.");
    }
  };

  const availableActions = [
    {
      name: "Fund ETH",
      function: fundWalletEvmHandler,
    },
    {
      name: "Fund USDC",
      function: () => {
        fundWalletEvmHandler("USDC");
      },
    },
    {
      name: "Fund SOL",
      function: fundWalletSolanaHandler,
    },
    {
      name: "Fund USDC",
      function: () => {
        fundWalletSolanaHandler("USDC");
      },
    },
  ];
  return (
    <Section
      name="Fund Wallet"
      description={
        "Fund wallet by using Card, Exchange or an external wallet. Privy has briding integration out of the box powered by Relay resorvoir."
      }
      filepath="src/components/sections/fund-wallet"
      actions={availableActions}
    />
  );
};

export default FundWallet;

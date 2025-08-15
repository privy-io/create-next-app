import { useSignMessage } from "@privy-io/react-auth/solana";
import { useEffect } from "react";

interface WalletCardProps {
  walletAddress: string;
  walletType: "privy" | "local" | "web-crypto";
}

export default function WalletCard({
  walletAddress,
  walletType,
}: WalletCardProps) {
  const { signMessage } = useSignMessage();

  useEffect(() => {
    if (walletType === "privy") {
      signMessage({
        message: new TextEncoder().encode(
          "Caching wallet data for future signatures"
        ),
      });
    }
  }, [walletType]);

  const getWalletTitle = () => {
    switch (walletType) {
      case "privy":
        return "Privy Embedded Wallet";
      case "local":
        return "Local Solana Wallet";
      case "web-crypto":
        return "Web Crypto API Wallet";
      default:
        return "Wallet";
    }
  };

  const getWalletDescription = () => {
    switch (walletType) {
      case "privy":
        return "Embedded wallet managed by Privy";
      case "local":
        return "Local keypair using @solana/web3.js";
      case "web-crypto":
        return "Browser Web Crypto API (ECDSA P-256)";
      default:
        return "";
    }
  };

  return (
    <div className="flex flex-col gap-4 p-4 border border-gray-200 rounded-lg">
      <div className="text-sm text-violet-700">{getWalletTitle()}</div>

      <div className="space-y-2">
        <div className="text-sm">
          <span className="font-medium text-gray-600">Address:</span>
          <div className="font-mono text-xs mt-1 break-all">
            {walletAddress}
          </div>
        </div>

        <div className="text-sm">
          <span className="font-medium text-gray-600">Type:</span>
          <span className="ml-2">{getWalletDescription()}</span>
        </div>

        <div className="text-sm">
          <span className="font-medium text-gray-600">Chain:</span>
          <span className="ml-2">
            {walletType === "web-crypto" ? "Browser Crypto" : "Solana"}
          </span>
        </div>
      </div>
    </div>
  );
}

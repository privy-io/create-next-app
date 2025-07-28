import { WalletWithMetadata } from "@privy-io/react-auth";

interface WalletCardProps {
  wallet: WalletWithMetadata;
}

export default function WalletCard({ wallet }: WalletCardProps) {
  return (
    <div className="flex flex-col gap-4 p-4 border border-gray-200 rounded-lg">
      <div className="text-sm text-violet-700">
        {wallet.walletClientType === "privy" ? "Embedded " : ""}Wallet:{" "}
        {wallet.address.slice(0, 6)}...
        {wallet.address.slice(-4)}
      </div>
    </div>
  );
}

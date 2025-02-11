import { useRouter } from "next/router";
import { WalletWithMetadata } from "@privy-io/react-auth";
import { Button } from "@/components/ui/button";

interface SolanaWallet extends WalletWithMetadata {
  type: 'wallet';
  chainType: 'solana';
  address: string;
}

type HeaderProps = {
  solanaWallet: SolanaWallet | undefined;
  onLogout: () => void;
  onLinkWallet: () => void;
  onUnlinkWallet: (address: string) => void;
  canRemoveAccount: boolean;
};

// Helper function to get wallet display address
const getDisplayAddress = (address: string) => {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

export default function Header({
  solanaWallet,
  onLogout,
  onLinkWallet,
  onUnlinkWallet,
  canRemoveAccount,
}: HeaderProps) {
  return (
    <div className="bg-white border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <a 
              href="/dashboard" 
              className="text-xl font-semibold hover:text-violet-600 transition-colors"
            >
              Page.fun
            </a>
          </div>
          
          <div className="flex items-center space-x-4">
            {solanaWallet ? (
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">
                  {getDisplayAddress(solanaWallet.address)}
                </span>
                {canRemoveAccount && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onUnlinkWallet(solanaWallet.address)}
                  >
                    Disconnect
                  </Button>
                )}
              </div>
            ) : (
              <Button onClick={onLinkWallet}>
                Connect Wallet
              </Button>
            )}
            
            <Button 
              variant="ghost"
              size="sm"
              onClick={onLogout}
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              Logout
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
} 
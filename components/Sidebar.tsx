import { useSolanaWallets, usePrivy } from "@privy-io/react-auth";
import Spinner from './Spinner';
import { useEffect, useState, useCallback } from 'react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react"; // You may need to install lucide-react
import SetupWizard from './SetupWizard';
import DeleteConfirmationModal from './DeleteConfirmationModal';

// Types
type PageMapping = {
  [slug: string]: {
    walletAddress: string;
    connectedToken?: string;
  }
}

// Update the type guard at the top of the file
type WalletAccount = {
  type: 'wallet';
  chainType: string;
  address: string;
  walletClientType: string;
}

function isWalletAccount(account: any): account is WalletAccount {
  return account?.type === 'wallet' && 
         account?.chainType === 'solana' && 
         'address' in account;
}

// Add helper function to check if page is incomplete
const isPageIncomplete = (mapping: any) => {
  return !mapping.title || !mapping.description || !mapping.socials || mapping.socials.length === 0;
};

interface SidebarProps {
  selectedWallet: string | null;
  setSelectedWallet: (wallet: string | null) => void;
  selectedToken: string | null;
  setSelectedToken: (token: string | null) => void;
  isLoadingMappings: boolean;
  mappedSlugs: string[];
  mappings: PageMapping;
  setMappedSlugs: (slugs: string[]) => void;
  setMappings: (mappings: PageMapping) => void;
}

export default function Sidebar({
  selectedWallet,
  setSelectedWallet,
  setSelectedToken,
  isLoadingMappings,
  mappedSlugs,
  mappings,
  setMappedSlugs,
  setMappings
}: SidebarProps) {
  const { wallets } = useSolanaWallets();
  const { linkWallet, user } = usePrivy();
  
  // Handle wallet change - move this before the useEffect
  const handleWalletChange = useCallback(async (walletAddress: string) => {
    // Reset states
    setSelectedToken(null);
    setSelectedWallet(walletAddress);
    
    // Fetch new mappings for the selected wallet
    try {
      const response = await fetch('/api/page-mapping');
      const { mappings: fetchedMappings } = await response.json();
      setMappings(fetchedMappings);
      
      const walletSlugs = Object.entries(fetchedMappings)
        .filter(([_, data]) => {
          if (typeof data === 'object' && data !== null && 'walletAddress' in data) {
            return (data as { walletAddress: string }).walletAddress === walletAddress;
          }
          return false;
        })
        .map(([slug]) => slug);
      setMappedSlugs(walletSlugs);
    } catch (error) {
      console.error('Error fetching mappings for new wallet:', error);
    }
  }, [setSelectedToken, setSelectedWallet, setMappings, setMappedSlugs]);

  // Update the wallet change watcher
  useEffect(() => {
    if (!user) return;
    
    const solanaWallets = wallets?.filter(isWalletAccount) || [];
    
    if (solanaWallets.length === 0) return;

    // If selected wallet is no longer in the list of wallets, select the first available wallet
    if (selectedWallet && !solanaWallets.find(w => w.address === selectedWallet)) {
      handleWalletChange(solanaWallets[0].address);
      return;
    }

    // If no wallet is selected but wallets are available, select the first one
    if (!selectedWallet && solanaWallets.length > 0) {
      handleWalletChange(solanaWallets[0].address);
    }
  }, [user, selectedWallet, wallets, handleWalletChange]);

  // Update the debugging useEffect
  useEffect(() => {
    console.log('Solana Wallets from hook:', wallets);
    console.log('All linked accounts:', user?.linkedAccounts);
    
    // Filter Solana wallets from linked accounts using type guard
    const solanaAccounts = user?.linkedAccounts?.filter(isWalletAccount) || [];
    console.log('Solana accounts from user:', solanaAccounts);
  }, [wallets, user]);

  // Update the wallet filtering to use the type guard
  const connectedSolanaWallets = user?.linkedAccounts?.filter(isWalletAccount) || [];

  // Get currently selected wallet details
  const selectedWalletDetails = connectedSolanaWallets.find(
    wallet => wallet.address === selectedWallet
  );

  const [showSetupWizard, setShowSetupWizard] = useState(false);
  const [slugToDelete, setSlugToDelete] = useState<string | null>(null);

  // Update the delete handler to return a Promise
  const handleDelete = async (slug: string): Promise<void> => {
    try {
      const response = await fetch('/api/page-mapping', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ slug }),
        credentials: 'same-origin',
      });
      
      if (response.ok) {
        setMappedSlugs(mappedSlugs.filter((s: string) => s !== slug));
        setSlugToDelete(null); // Close modal after successful deletion
      } else {
        const error = await response.json();
        console.error('Error response:', error);
        alert(error.error || 'Failed to remove URL');
      }
    } catch (error) {
      console.error('Error deleting mapping:', error);
      alert('Failed to remove URL');
    }
  };

  return (
    <div className="w-64 bg-white shadow-lg">
      <div className="p-4">
        <h2 className="text-lg font-semibold mb-4">Your Wallets</h2>
        
        {/* Wallet Dropdown Menu */}
        <div className="relative mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Select Wallet
          </label>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="outline" 
                className="w-full justify-between"
                disabled={connectedSolanaWallets.length === 0}
              >
                {selectedWalletDetails ? (
                  <div className="flex flex-col items-start">
                    <span className="text-sm">
                      {selectedWalletDetails.address.slice(0, 6)}...
                      {selectedWalletDetails.address.slice(-4)}
                    </span>
                    <span className="text-xs text-gray-500">
                      {selectedWalletDetails.walletClientType}
                    </span>
                  </div>
                ) : (
                  <span>Select a wallet</span>
                )}
                <ChevronDown className="h-4 w-4 ml-2 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-[calc(100%-2rem)]">
              {connectedSolanaWallets.map((wallet) => (
                <DropdownMenuItem
                  key={wallet.address}
                  onClick={() => handleWalletChange(wallet.address)}
                  className="flex flex-col items-start"
                >
                  <span className="text-sm">
                    {wallet.address.slice(0, 6)}...{wallet.address.slice(-4)}
                  </span>
                  <span className="text-xs text-gray-500">
                    {wallet.walletClientType}
                  </span>
                </DropdownMenuItem>
              ))}
              <DropdownMenuItem
                onClick={linkWallet}
                className="border-t"
              >
                <span className="text-violet-600">Connect another wallet</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          {connectedSolanaWallets.length === 0 && (
            <button
              onClick={linkWallet}
              className="w-full mt-2 bg-violet-600 hover:bg-violet-700 text-white py-2 px-4 rounded-md text-sm"
            >
              Connect a Wallet
            </button>
          )}
        </div>

        {/* Page.fun Address Section */}
        {selectedWallet && (
          <div className="mt-6">
            <h3 className="text-sm font-medium mb-2">Your Pages</h3>
            <div className="space-y-2">
              {/* Custom mapped URLs */}
              {isLoadingMappings ? (
                <div className="p-3 bg-gray-50 rounded-md">
                  <Spinner className="h-4 w-4" />
                </div>
              ) : mappedSlugs.length > 0 ? (
                mappedSlugs.map(slug => (
                  <div key={slug} className="p-3 bg-gray-50 rounded-md space-y-2">
                    <div className="flex justify-between items-center">
                      <a 
                        href={`/${slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-violet-600 hover:text-violet-800"
                      >
                        page.fun/{slug}
                      </a>
                      <button
                        onClick={() => setSlugToDelete(slug)}
                        className="text-xs text-red-500 hover:text-red-700"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500 p-3 bg-gray-50 rounded-md">
                  No custom pages created yet
                </p>
              )}
            </div>
          </div>
        )}

        {/* Show Setup Wizard button when no pages exist or when page is incomplete */}
        {selectedWallet && !isLoadingMappings && (
          <>
            {mappedSlugs.length === 0 || (
              mappedSlugs.length > 0 && 
              mappings[mappedSlugs[0]] && 
              isPageIncomplete(mappings[mappedSlugs[0]])
            ) ? (
              <div className="mb-6">
                <Button
                  onClick={() => setShowSetupWizard(true)}
                  className="w-full"
                >
                  {mappedSlugs.length === 0 ? 'Setup Your Page' : 'Complete Your Page Setup'}
                </Button>
              </div>
            ) : null}
          </>
        )}

        {showSetupWizard && (
          <SetupWizard
            walletAddress={selectedWallet!}
            onClose={() => setShowSetupWizard(false)}
            onComplete={() => {
              setShowSetupWizard(false);
              // Refresh mappings
              if (selectedWallet) {
                handleWalletChange(selectedWallet);
              }
            }}
          />
        )}

        {/* Add the confirmation modal */}
        {slugToDelete && (
          <DeleteConfirmationModal
            slug={slugToDelete}
            onConfirm={() => handleDelete(slugToDelete)}
            onCancel={() => setSlugToDelete(null)}
          />
        )}
      </div>
    </div>
  );
} 
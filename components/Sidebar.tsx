import { usePrivy, WalletWithMetadata } from "@privy-io/react-auth";
import Spinner from './Spinner';
import { useState } from 'react';
import SetupWizard from './SetupWizard';
import DeleteConfirmationModal from './DeleteConfirmationModal';

// Types
type PageData = {
  slug: string;
  walletAddress: string;
  connectedToken?: string;
  title?: string;
  description?: string;
  socials?: any[];
}

type PageMapping = {
  [slug: string]: PageData;
}

// Type guard for Solana wallets
function isSolanaWallet(account: any): account is WalletWithMetadata {
  return (
    account?.type === 'wallet' &&
    account?.chainType === 'solana'
  );
}

// Add helper function to check if page is incomplete
const isPageIncomplete = (mapping: PageData | undefined) => {
  if (!mapping) return true;
  return !mapping.title || !mapping.description || !mapping.socials || mapping.socials.length === 0;
};

interface SidebarProps {
  isLoadingMappings: boolean;
  mappedSlugs: string[];
  mappings: PageMapping;
  setMappedSlugs: (slugs: string[]) => void;
  setMappings: (mappings: PageMapping) => void;
}

export default function Sidebar({
  isLoadingMappings,
  mappedSlugs,
  mappings,
  setMappedSlugs,
  setMappings
}: SidebarProps) {
  const { user, linkWallet, unlinkWallet } = usePrivy();
  
  // Get the first Solana wallet if one exists
  const solanaWallet = user?.linkedAccounts?.find(isSolanaWallet);

  const [showSetupWizard, setShowSetupWizard] = useState(false);
  const [slugToDelete, setSlugToDelete] = useState<string | null>(null);

  // Update the delete handler to return a Promise
  const handleDelete = async (slug: string): Promise<void> => {
    try {
      const response = await fetch('/api/page-store', {
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

  // Helper function to get wallet display address
  const getDisplayAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  // Helper function to safely get the first mapped slug's data
  const getFirstMappedSlugData = () => {
    const firstSlug = mappedSlugs[0];
    if (!firstSlug || !(firstSlug in mappings)) return undefined;
    return mappings[firstSlug];
  };

  // Helper function to handle wallet disconnection
  const handleDisconnectWallet = async () => {
    if (!solanaWallet) return;
    try {
      await unlinkWallet(solanaWallet.address);
    } catch (error) {
      console.error('Error disconnecting wallet:', error);
    }
  };

  return (
    <div className="w-64 bg-white shadow-lg">
      <div className="p-4">
        <h2 className="text-lg font-semibold mb-4">Your Wallet</h2>
        
        {/* Wallet Section */}
        <div className="relative mb-6">
          {solanaWallet ? (
            <div className="space-y-2">
              <div className="p-3 bg-gray-50 rounded-md">
                <div className="flex flex-col">
                  <span className="text-sm">
                    {getDisplayAddress(solanaWallet.address)}
                  </span>
                </div>
              </div>
              <button
                onClick={handleDisconnectWallet}
                className="w-full text-red-600 hover:text-red-700 text-sm py-2 px-4 rounded-md border border-red-600 hover:border-red-700"
              >
                Disconnect Wallet
              </button>
            </div>
          ) : (
            <button
              onClick={linkWallet}
              className="w-full bg-violet-600 hover:bg-violet-700 text-white py-2 px-4 rounded-md text-sm"
            >
              Connect Wallet
            </button>
          )}
        </div>

        {/* Page.fun Address Section */}
        {solanaWallet && (
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
        {solanaWallet && !isLoadingMappings && (
          <>
            {mappedSlugs.length === 0 || isPageIncomplete(getFirstMappedSlugData()) ? (
              <div className="mb-6">
                <button
                  onClick={() => setShowSetupWizard(true)}
                  className="w-full bg-violet-600 hover:bg-violet-700 text-white py-2 px-4 rounded-md text-sm"
                >
                  {mappedSlugs.length === 0 ? 'Setup Your Page' : 'Complete Your Page Setup'}
                </button>
              </div>
            ) : null}
          </>
        )}

        {showSetupWizard && solanaWallet && (
          <SetupWizard
            walletAddress={solanaWallet.address}
            onClose={() => setShowSetupWizard(false)}
            onComplete={() => {
              setShowSetupWizard(false);
              // Refresh mappings after setup
              const fetchMappings = async () => {
                try {
                  const response = await fetch(`/api/page-store?walletAddress=${solanaWallet.address}`);
                  const { pages = [] } = await response.json();
                  setMappedSlugs(pages.map((page: any) => page.slug));
                  
                  // Also get full mappings
                  const mappingsResponse = await fetch('/api/page-store');
                  const { mappings: fetchedMappings } = await mappingsResponse.json();
                  setMappings(fetchedMappings);
                } catch (error) {
                  console.error('Error fetching mappings:', error);
                }
              };
              fetchMappings();
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
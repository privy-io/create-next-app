import { usePrivy, WalletWithMetadata } from "@privy-io/react-auth";
import Spinner from "./Spinner";
import { useState } from "react";
import DeleteConfirmationModal from "./DeleteConfirmationModal";
import CreatePageModal from "./CreatePageModal";
import { isPageIncomplete } from './AppMenu';

// Types
type PageData = {
  slug: string;
  walletAddress: string;
  connectedToken?: string;
  title?: string;
  description?: string;
  socials?: any[];
};

type PageMapping = {
  [slug: string]: PageData;
};

// Type guard for Solana wallets
function isSolanaWallet(account: any): account is WalletWithMetadata {
  return account?.type === "wallet" && account?.chainType === "solana";
}

// Add helper function to check if page is incomplete
const isPageIncomplete = (mapping: PageData | undefined) => {
  if (!mapping) return true;
  return (
    !mapping.title ||
    !mapping.description ||
    !mapping.socials ||
    mapping.socials.length === 0
  );
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
  setMappings,
}: SidebarProps) {
  const { user, linkWallet, unlinkWallet } = usePrivy();

  // Get the first Solana wallet if one exists
  const solanaWallet = user?.linkedAccounts?.find(isSolanaWallet);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [slugToDelete, setSlugToDelete] = useState<string | null>(null);

  // Update the delete handler to return a Promise
  const handleDelete = async (slug: string): Promise<void> => {
    try {
      const response = await fetch("/api/page-store", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ slug }),
        credentials: "same-origin",
      });

      if (response.ok) {
        setMappedSlugs(mappedSlugs.filter((s: string) => s !== slug));
        setSlugToDelete(null); // Close modal after successful deletion
      } else {
        const error = await response.json();
        console.error("Error response:", error);
        alert(error.error || "Failed to remove URL");
      }
    } catch (error) {
      console.error("Error deleting mapping:", error);
      alert("Failed to remove URL");
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
      console.error("Error disconnecting wallet:", error);
    }
  };

  return (
    <div className="h-screen border-r border-gray-100">
      <div className="p-4">
        {/* Wallet Connection */}
        {solanaWallet ? (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm text-gray-600">
                {getDisplayAddress(solanaWallet.address)}
              </div>
              <button
                onClick={handleDisconnectWallet}
                className="text-xs text-red-600 hover:text-red-700"
              >
                Disconnect
              </button>
            </div>
          </div>
        ) : (
          <div className="mb-6">
            <button
              onClick={linkWallet}
              className="w-full bg-violet-600 hover:bg-violet-700 text-white py-2 px-4 rounded-md text-sm"
            >
              Connect Wallet
            </button>
          </div>
        )}

        {/* Loading State */}
        {isLoadingMappings && (
          <div className="flex items-center justify-center py-4">
            <Spinner className="h-5 w-5" />
          </div>
        )}

        {/* Create Page Button */}
        {solanaWallet && !isLoadingMappings && (
          <div className="mb-6">
            <button
              onClick={() => setShowCreateModal(true)}
              className="w-full bg-violet-600 hover:bg-violet-700 text-white py-2 px-4 rounded-md text-sm"
            >
              Create New Page
            </button>
          </div>
        )}

        {/* Create Page Modal */}
        {showCreateModal && solanaWallet && (
          <CreatePageModal
            walletAddress={solanaWallet.address}
            onClose={() => setShowCreateModal(false)}
          />
        )}

        {/* Delete Confirmation Modal */}
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

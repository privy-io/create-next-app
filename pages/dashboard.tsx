import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { usePrivy, WalletWithMetadata } from "@privy-io/react-auth";
import Head from "next/head";
import SetupWizard from '../components/SetupWizard';
import PagePreview from '../components/PagePreview';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { GripVertical, Trash2 } from 'lucide-react';
import { PageData, PageItem, ItemType } from '../types';

// Types
type PageMapping = {
  [key: string]: PageData;
}

type PageDetails = {
  title: string;
  description: string;
  items: PageItem[];
  image?: string;
}

// Update Solana wallet type
interface SolanaWallet extends WalletWithMetadata {
  type: 'wallet';
  chainType: 'solana';
  address: string;
}

function isSolanaWallet(account: WalletWithMetadata | any): account is SolanaWallet {
  return (
    account?.type === 'wallet' &&
    account?.chainType === 'solana' &&
    typeof account?.address === 'string'
  );
}

// Helper function to check if page is incomplete
const isPageIncomplete = (mapping: PageData | undefined) => {
  if (!mapping) return true;
  return !mapping.title || !mapping.items || mapping.items.length === 0;
};

// SortableItem component
function SortableItem({ 
  id,
  item, 
  isEditingPage, 
  onUrlChange, 
  onDelete 
}: { 
  id: string;
  item: PageItem;
  isEditingPage: boolean;
  onUrlChange?: (url: string) => void;
  onDelete: () => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center space-x-4 bg-white p-4 rounded-lg border"
    >
      {isEditingPage && (
        <button
          className="cursor-grab"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="h-5 w-5 text-gray-400 flex-shrink-0" />
        </button>
      )}
      <div className="flex-1">
        <div className="font-medium capitalize mb-1">
          {item.type}
        </div>
        {!item.isPlugin && (
          <Input
            type="text"
            value={item.url || ''}
            onChange={(e) => onUrlChange?.(e.target.value)}
            disabled={!isEditingPage}
            placeholder={`Enter ${item.type} URL`}
          />
        )}
      </div>
      {isEditingPage && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onDelete}
        >
          <Trash2 className="h-4 w-4 text-red-500" />
        </Button>
      )}
    </div>
  );
}

export default function DashboardPage() {
  const router = useRouter();
  const {
    ready,
    authenticated,
    user,
    logout,
    linkWallet,
    unlinkWallet,
  } = usePrivy();

  const [mappedSlugs, setMappedSlugs] = useState<string[]>([]);
  const [isLoadingMappings, setIsLoadingMappings] = useState(false);
  const [mappings, setMappings] = useState<PageMapping>({});
  const [pageDetails, setPageDetails] = useState<PageDetails | null>(null);
  const [isEditingPage, setIsEditingPage] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showSetupWizard, setShowSetupWizard] = useState(false);
  const [pageToSetup, setPageToSetup] = useState<string | null>(null);
  const [previewData, setPreviewData] = useState<PageData | null>(null);
  const [currentEditingSlug, setCurrentEditingSlug] = useState<string | null>(null);

  // Add sensors for drag and drop
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    if (ready && !authenticated) {
      router.push("/");
    }
  }, [ready, authenticated, router]);

  // Update the wallet finder to use type guard
  const solanaWallet = user?.linkedAccounts?.find(isSolanaWallet);

  // Helper function to get wallet display address
  const getDisplayAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  // Add numAccounts calculation
  const numAccounts = user?.linkedAccounts?.length || 0;
  const canRemoveAccount = numAccounts > 1;

  // Handle saving page details
  const handleSavePageDetails = async () => {
    if (!pageDetails || !currentEditingSlug || !solanaWallet?.address) return;
    
    setIsSaving(true);
    try {
      // Prepare items array with order preserved
      const items = pageDetails.items.map((item, index) => ({
        ...item,
        order: index  // Update order based on current position
      }));

      const response = await fetch('/api/page-mapping', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          slug: currentEditingSlug,
          walletAddress: solanaWallet.address,
          title: pageDetails.title,
          description: pageDetails.description,
          image: pageDetails.image,
          items: items,
          isSetupWizard: false
        }),
        credentials: 'same-origin'
      });

      if (!response.ok) {
        throw new Error('Failed to save page details');
      }

      // Update local state with new mappings
      const currentMapping = mappings[currentEditingSlug] as PageData | undefined;
      const updatedMapping: PageData = {
        ...currentMapping,
        slug: currentEditingSlug,
        walletAddress: solanaWallet.address,
        title: pageDetails.title,
        description: pageDetails.description,
        image: pageDetails.image,
        items: items,
        createdAt: currentMapping?.createdAt || new Date().toISOString()
      };

      setMappings(prev => {
        if (!(currentEditingSlug in prev)) return prev;
        return {
          ...prev,
          [currentEditingSlug]: updatedMapping
        };
      });

      setIsEditingPage(false);
      setCurrentEditingSlug(null);
    } catch (error) {
      console.error('Error saving page details:', error);
    } finally {
      setIsSaving(false);
    }
  };

  // Update the drag end handler
  const handleDragEnd = (event: any) => {
    const { active, over } = event;

    if (active.id !== over.id && pageDetails) {
      const oldIndex = pageDetails.items.findIndex((item) => item.id === active.id);
      const newIndex = pageDetails.items.findIndex((item) => item.id === over.id);

      setPageDetails(prevDetails => {
        if (!prevDetails) return null;
        
        const newItems = arrayMove(prevDetails.items, oldIndex, newIndex).map(
          (item, index) => ({ ...item, order: index })
        );

        return {
          ...prevDetails,
          items: newItems
        };
      });
    }
  };

  // Update the fetchMappings effect
  useEffect(() => {
    if (solanaWallet) {
      const fetchMappings = async () => {
        setIsLoadingMappings(true);
        try {
          const response = await fetch(`/api/page-mapping?walletAddress=${solanaWallet.address}`);
          const data = await response.json();
          const { pages: { pages = [], mappings = {} } = { pages: [], mappings: {} } } = data;
          setMappedSlugs(pages.map((page: any) => page.slug));
          setMappings(mappings);
        } catch (error) {
          console.error('Error fetching mappings:', error);
          setMappedSlugs([]);
          setMappings({});
        } finally {
          setIsLoadingMappings(false);
        }
      };
      fetchMappings();
    } else {
      setMappedSlugs([]);
      setMappings({});
    }
  }, [solanaWallet]);

  // Update the incomplete page check
  const firstSlug = mappedSlugs[0];
  const firstPageMapping = firstSlug ? mappings[firstSlug] : undefined;

  // Update preview data whenever pageDetails changes
  useEffect(() => {
    if (pageDetails && currentEditingSlug && solanaWallet?.address) {
      setPreviewData({
        slug: currentEditingSlug,
        walletAddress: solanaWallet.address,
        title: pageDetails.title,
        description: pageDetails.description,
        items: pageDetails.items,
        image: pageDetails.image,
        createdAt: new Date().toISOString(),
      });
    }
  }, [pageDetails, currentEditingSlug, solanaWallet?.address]);

  return (
    <>
      <Head>
        <title>Page.fun Dashboard</title>
      </Head>

      <main className="min-h-screen bg-privy-light-blue p-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column - Settings */}
            <div>
              {/* Wallet Section */}
              <div className="bg-white p-6 rounded-lg shadow-sm mb-8">
                <div className="flex justify-between items-center">
                  <h2 className="text-lg font-semibold">Your Wallet</h2>
                  <div className="flex items-center space-x-4">
                    {solanaWallet ? (
                      <>
                        <span className="text-sm text-gray-600">
                          {getDisplayAddress(solanaWallet.address)}
                        </span>
                        {canRemoveAccount ? (
                          <Button
                            variant="outline"
                            onClick={() => unlinkWallet(solanaWallet.address)}
                          >
                            Disconnect Wallet
                          </Button>
                        ) : null}
                      </>
                    ) : (
                      <Button onClick={linkWallet}>
                        Connect Wallet
                      </Button>
                    )}
                    <Button 
                      variant="ghost" 
                      onClick={logout}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      Logout
                    </Button>
                  </div>
                </div>
              </div>

              {/* Pages List */}
              {solanaWallet && (
                <div className="bg-white p-6 rounded-lg shadow-sm mb-8">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-semibold">Your Pages</h2>
                    <Button
                      onClick={() => setShowSetupWizard(true)}
                      variant="outline"
                    >
                      Create New Page
                    </Button>
                  </div>
                  
                  {isLoadingMappings ? (
                    <div className="text-center py-4">
                      Loading your pages...
                    </div>
                  ) : mappedSlugs.length > 0 ? (
                    <div className="space-y-4">
                      {mappedSlugs.map(slug => {
                        const pageData = mappings[slug];
                        const needsSetup = isPageIncomplete(pageData);
                        
                        return (
                          <div 
                            key={slug}
                            className="border rounded-lg p-4 hover:border-violet-300 transition-colors"
                          >
                            <div className="flex justify-between items-start">
                              <div>
                                <a 
                                  href={`/${slug}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-lg font-medium text-violet-600 hover:text-violet-800"
                                >
                                  page.fun/{slug}
                                </a>
                                {pageData?.title && (
                                  <p className="text-sm text-gray-600 mt-1">
                                    {pageData.title}
                                  </p>
                                )}
                              </div>
                              <div className="flex items-center space-x-2">
                                {needsSetup ? (
                                  <Button
                                    size="sm"
                                    onClick={() => {
                                      setPageToSetup(slug);
                                      setShowSetupWizard(true);
                                    }}
                                  >
                                    Complete Setup
                                  </Button>
                                ) : (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => {
                                      const pageData = mappings[slug];
                                      if (!pageData) return;
                                      
                                      setCurrentEditingSlug(slug);
                                      setPageDetails({
                                        title: pageData.title || '',
                                        description: pageData.description || '',
                                        items: pageData.items || [],
                                        image: pageData.image
                                      });
                                      setIsEditingPage(true);
                                    }}
                                  >
                                    Edit
                                  </Button>
                                )}
                              </div>
                            </div>
                            {needsSetup && (
                              <div className="mt-2 text-sm bg-amber-50 text-amber-600 p-2 rounded border border-amber-200">
                                This page needs to be set up
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      You haven't created any pages yet
                    </div>
                  )}
                </div>
              )}

              {/* Setup Wizard Button - Only show if no pages exist */}
              {solanaWallet && !isLoadingMappings && mappedSlugs.length === 0 && (
                <div className="bg-white p-6 rounded-lg shadow-sm mb-8">
                  <Button
                    onClick={() => setShowSetupWizard(true)}
                    className="w-full"
                  >
                    Setup Your First Page
                  </Button>
                </div>
              )}

              {/* Page Settings - Only show when editing a complete page */}
              {ready && authenticated && pageDetails && mappedSlugs.length > 0 && !isPageIncomplete(firstPageMapping) && (
                <div className="bg-white p-6 rounded-lg shadow-sm space-y-8">
                  <div className="flex justify-between items-center">
                    <h1 className="text-2xl font-semibold">Page Settings</h1>
                    {isEditingPage ? (
                      <div className="space-x-2">
                        <Button
                          variant="outline"
                          onClick={() => {
                            setIsEditingPage(false);
                            setCurrentEditingSlug(null);
                          }}
                          disabled={isSaving}
                        >
                          Cancel
                        </Button>
                        <Button
                          onClick={handleSavePageDetails}
                          disabled={isSaving}
                        >
                          {isSaving ? 'Saving...' : 'Save Changes'}
                        </Button>
                      </div>
                    ) : (
                      <Button onClick={() => setIsEditingPage(true)}>
                        Edit Page
                      </Button>
                    )}
                  </div>

                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Image
                      </label>
                      <div className="space-y-4">
                        {pageDetails.image && (
                          <div className="relative w-32 h-32 rounded-lg overflow-hidden">
                            <img
                              src={pageDetails.image}
                              alt={pageDetails.title}
                              className="object-cover w-full h-full"
                              onError={(e) => {
                                // Hide image on error
                                (e.target as HTMLImageElement).style.display = 'none';
                              }}
                            />
                          </div>
                        )}
                        <Input
                          type="text"
                          value={pageDetails.image || ''}
                          onChange={(e) => setPageDetails(prev => ({
                            ...prev!,
                            image: e.target.value
                          }))}
                          disabled={!isEditingPage}
                          placeholder="Enter image URL"
                          className="max-w-md"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Title
                      </label>
                      <Input
                        type="text"
                        value={pageDetails.title}
                        onChange={(e) => setPageDetails({
                          ...pageDetails,
                          title: e.target.value
                        })}
                        disabled={!isEditingPage}
                        maxLength={100}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Description
                      </label>
                      <textarea
                        value={pageDetails.description}
                        onChange={(e) => setPageDetails({
                          ...pageDetails,
                          description: e.target.value
                        })}
                        disabled={!isEditingPage}
                        className="w-full p-2 border rounded-md"
                        rows={3}
                        maxLength={500}
                      />
                    </div>

                    <div>
                      <h2 className="text-lg font-semibold mb-4">Social Links</h2>
                      <DndContext
                        sensors={sensors}
                        collisionDetection={closestCenter}
                        onDragEnd={handleDragEnd}
                      >
                        <SortableContext
                          items={pageDetails.items.map(i => i.id)}
                          strategy={verticalListSortingStrategy}
                        >
                          <div className="space-y-2">
                            {pageDetails.items.map((item) => (
                              <SortableItem
                                key={item.id}
                                id={item.id}
                                item={item}
                                isEditingPage={isEditingPage}
                                onUrlChange={!item.isPlugin ? (url) => {
                                  setPageDetails(prev => ({
                                    ...prev!,
                                    items: prev!.items.map(i =>
                                      i.id === item.id ? { ...i, url } : i
                                    )
                                  }));
                                } : undefined}
                                onDelete={() => {
                                  setPageDetails(prev => ({
                                    ...prev!,
                                    items: prev!.items.filter(i => i.id !== item.id)
                                  }));
                                }}
                              />
                            ))}
                          </div>
                        </SortableContext>
                      </DndContext>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Right Column - Live Preview */}
            {isEditingPage && previewData && (
              <div className="sticky top-8">
                <div className="bg-white p-4 rounded-lg shadow-sm mb-4">
                  <h2 className="text-lg font-semibold mb-2">Live Preview</h2>
                  <p className="text-sm text-gray-600 mb-4">
                    This preview updates in real-time as you make changes
                  </p>
                </div>
                <div className="bg-white rounded-lg shadow-sm overflow-hidden" style={{ height: 'calc(100vh - 12rem)' }}>
                  <PagePreview pageData={previewData} />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Setup Wizard Modal */}
        {showSetupWizard && solanaWallet && (
          <SetupWizard
            walletAddress={solanaWallet.address}
            onClose={() => {
              setShowSetupWizard(false);
              setPageToSetup(null);
            }}
            existingSlug={pageToSetup}
            existingData={pageToSetup ? mappings[pageToSetup] : undefined}
            onComplete={async () => {
              setShowSetupWizard(false);
              setPageToSetup(null);
              
              // Refresh mappings after setup
              if (solanaWallet) {
                setIsLoadingMappings(true);
                try {
                  const response = await fetch(`/api/page-mapping?walletAddress=${solanaWallet.address}`);
                  const data = await response.json();
                  
                  // Debug the response structure
                  console.log('API Response:', data);
                  
                  // The API returns { pages: { pages, mappings } }
                  const { pages: { pages = [], mappings: newMappings = {} } } = data;
                  
                  // Update the slugs list
                  const newSlugs = Array.isArray(pages) ? pages.map((page: any) => page.slug) : [];
                  setMappedSlugs(newSlugs);
                  
                  // Update mappings if we have them
                  if (newMappings && typeof newMappings === 'object') {
                    setMappings(newMappings);

                    // If this was a new page setup, set it as the active page
                    if (newSlugs.length === 1) {
                      const pageData = newMappings[newSlugs[0]];
                      if (pageData) {
                        setPageDetails({
                          title: pageData.title || '',
                          description: pageData.description || '',
                          items: pageData.items || [],
                          image: pageData.image
                        });
                      }
                    }
                  }
                } catch (error) {
                  console.error('Error fetching mappings:', error);
                } finally {
                  setIsLoadingMappings(false);
                }
              }
            }}
          />
        )}
      </main>
    </>
  );
}

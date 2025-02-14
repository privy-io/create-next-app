import { GetServerSideProps } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import { PrivyClient } from "@privy-io/server-auth";
import PagePreview from '@/components/PagePreview';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, Pencil } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Toaster } from '@/components/ui/toaster';
import { isSolanaWallet } from '@/utils/wallet';
import { SettingsTabs } from '@/components/SettingsTabs';
import { GOOGLE_FONTS } from '@/lib/fonts';
import { PageData, PageItem } from '@/types';
import { LINK_CONFIGS, validateLinkUrl } from '@/lib/links';

interface PageProps {
  slug: string;
  pageData: PageData | null;
  error?: string;
}

const PRIVY_APP_ID = process.env.NEXT_PUBLIC_PRIVY_APP_ID;
const PRIVY_APP_SECRET = process.env.PRIVY_APP_SECRET;
const privyClient = new PrivyClient(PRIVY_APP_ID!, PRIVY_APP_SECRET!);

export const getServerSideProps: GetServerSideProps<PageProps> = async ({ params, req }) => {
  const slug = params?.page as string;

  try {
    // First get the page data
    const pageResponse = await fetch(`${process.env.NODE_ENV === 'development' ? 'http://localhost:3000' : ''}/api/page-store?slug=${slug}`);
    const { mapping } = await pageResponse.json();

    if (!mapping) {
      return {
        props: {
          slug,
          pageData: null,
          error: 'Page not found'
        }
      };
    }

    // Check authentication and ownership
    const idToken = req.cookies['privy-id-token'];
    if (!idToken) {
      return {
        redirect: {
          destination: `/${slug}`,
          permanent: false,
        },
      };
    }

    try {
      const user = await privyClient.getUser({ idToken });
      
      // Check if the wallet is in user's linked accounts
      const hasWallet = user.linkedAccounts.some(account => {
        if (account.type === 'wallet' && account.chainType === 'solana') {
          const walletAccount = account as { address?: string };
          return walletAccount.address?.toLowerCase() === mapping.walletAddress.toLowerCase();
        }
        return false;
      });

      if (!hasWallet) {
        return {
          redirect: {
            destination: `/${slug}`,
            permanent: false,
          },
        };
      }
    } catch (error) {
      console.error('Auth verification error:', error);
      return {
        redirect: {
          destination: `/${slug}`,
          permanent: false,
        },
      };
    }

    return {
      props: {
        slug,
        pageData: mapping
      }
    };
  } catch (error) {
    console.error('Error fetching page data:', error);
    return {
      props: {
        slug,
        pageData: null,
        error: 'Failed to fetch page data'
      }
    };
  }
};

export default function EditPage({ slug, pageData, error }: PageProps) {
  const router = useRouter();
  const { authenticated, user, linkWallet } = usePrivy();
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const [pageDetails, setPageDetails] = useState<PageData | null>(null);
  const [previewData, setPreviewData] = useState<PageData | null>(null);
  const [validationErrors, setValidationErrors] = useState<{ [key: string]: string }>({});
  const [selectedTab, setSelectedTab] = useState('general');
  const [openLinkId, setOpenLinkId] = useState<string | null>(null);
  const [isMobilePanelOpen, setIsMobilePanelOpen] = useState(false);

  // Handle ESC key to close mobile panel
  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsMobilePanelOpen(false);
      }
    };
    window.addEventListener('keydown', handleEsc);

    return () => {
      window.removeEventListener('keydown', handleEsc);
    };
  }, []);

  // Check ownership and redirect if not owner
  useEffect(() => {
    if (pageData && authenticated) {
      const solanaWallet = user?.linkedAccounts?.find(isSolanaWallet);
      const isOwner = solanaWallet?.address?.toLowerCase() === pageData.walletAddress?.toLowerCase();
      
      if (!isOwner) {
        router.replace(`/${slug}`);
      }
    }
  }, [pageData, authenticated, user, slug, router]);

  // Initialize state after component mounts to prevent hydration mismatch
  useEffect(() => {
    if (pageData) {
      const fonts = {
        global: pageData.fonts?.global || undefined,
        heading: pageData.fonts?.heading || undefined,
        paragraph: pageData.fonts?.paragraph || undefined,
        links: pageData.fonts?.links || undefined
      };
      
      const initialPageData: PageData = {
        ...pageData,
        fonts
      };
      
      setPageDetails(initialPageData);
      setPreviewData(initialPageData);
    }
  }, [pageData]);

  // Update preview data whenever pageDetails changes
  useEffect(() => {
    if (pageDetails) {
      setPreviewData({
        ...pageDetails,
        fonts: {
          ...pageDetails.fonts
        }
      });
    }
  }, [pageDetails]);

  const validateLinks = (items: PageItem[] = []): { [key: string]: string } => {
    const errors: { [key: string]: string } = {};
    
    items.forEach(item => {
      const linkConfig = LINK_CONFIGS[item.type];
      if (linkConfig?.options?.requiresUrl) {
        if (!item.url) {
          errors[item.id] = `${linkConfig.label} URL is required`;
        } else if (!validateLinkUrl(item.type, item.url)) {
          errors[item.id] = `Invalid ${linkConfig.label} URL format`;
        }
      }
    });

    return errors;
  };

  const handleSavePageDetails = async () => {
    if (!pageDetails) return;

    if (!authenticated) {
      toast({
        title: "Authentication required",
        description: "Please connect your wallet to save changes.",
        variant: "destructive",
      });
      return;
    }

    const solanaWallet = user?.linkedAccounts?.find(isSolanaWallet);
    if (!solanaWallet || solanaWallet.address !== pageDetails.walletAddress) {
      toast({
        title: "Unauthorized",
        description: "You don't have permission to edit this page.",
        variant: "destructive",
      });
      return;
    }

    // Validate links before saving
    const validationErrors = validateLinks(pageDetails.items);
    if (Object.keys(validationErrors).length > 0) {
      setValidationErrors(validationErrors);
      toast({
        title: "Validation Error",
        description: "Please fix the highlighted errors in your links before saving.",
        variant: "destructive",
      });
      return;
    }
    
    setIsSaving(true);
    try {
      const items = pageDetails.items?.map((item, index) => {
        // Ensure each item has an id
        const id = item.id || `item-${index}`;
        
        // Format URL based on item type
        let url = item.url;
        if (item.type === 'email' && url && !url.startsWith('mailto:')) {
          url = `mailto:${url}`;
        }
        
        // For plugins, make sure url is undefined/null
        if (item.isPlugin) {
          url = undefined;
        }
        
        return {
          ...item,
          id,
          url,
          order: index,
          // Ensure boolean fields are properly set
          isPlugin: !!item.isPlugin,
          tokenGated: !!item.tokenGated,
          // Only include requiredTokens if tokenGated is true
          ...(item.tokenGated ? { requiredTokens: item.requiredTokens || ["1"] } : {})
        };
      }) || [];

      const fonts = {
        global: pageDetails.fonts?.global === 'system' ? undefined : pageDetails.fonts?.global,
        heading: pageDetails.fonts?.heading === 'inherit' ? undefined : pageDetails.fonts?.heading,
        paragraph: pageDetails.fonts?.paragraph === 'inherit' ? undefined : pageDetails.fonts?.paragraph,
        links: pageDetails.fonts?.links === 'inherit' ? undefined : pageDetails.fonts?.links
      };

      const requestBody = {
        slug,
        walletAddress: pageDetails.walletAddress,
        title: pageDetails.title,
        description: pageDetails.description,
        image: pageDetails.image,
        items,
        designStyle: pageDetails.designStyle,
        fonts,
        // Only include token-related fields if there's a non-empty connected token
        ...(pageDetails.connectedToken && pageDetails.connectedToken.length > 0 ? {
          connectedToken: pageDetails.connectedToken,
          tokenSymbol: pageDetails.tokenSymbol,
        } : {
          connectedToken: null,  // Explicitly set to null to remove it
          tokenSymbol: null,
        }),
        isSetupWizard: false
      };

      const response = await fetch('/api/page-store', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
        credentials: 'same-origin'
      });

      if (!response.ok) {
        const errorData = await response.json();
        if (errorData.details) {
          // Handle validation errors
          const validationErrors: { [key: string]: string } = {};
          
          errorData.details.forEach((issue: any) => {
            const [itemsStr, index, field] = issue.path;
            if (itemsStr === 'items' && typeof index === 'number') {
              const item = items[index];
              if (item) {
                validationErrors[item.id] = issue.message;
              }
            }
          });

          if (Object.keys(validationErrors).length > 0) {
            // Update validation errors in LinksTab
            setValidationErrors((prev: { [key: string]: string }) => ({
              ...prev,
              ...validationErrors
            }));
            toast({
              title: "Validation Error",
              description: "Please fix the highlighted errors in your links.",
              variant: "destructive",
            });
            return;
          }
        }
        throw new Error(errorData.error || 'Failed to save page details');
      }

      toast({
        title: "Changes saved",
        description: "Your page has been updated successfully.",
      });
    } catch (error) {
      console.error('Error saving page details:', error);
      toast({
        title: "Error saving changes",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleLinkClick = (itemId: string) => {
    setSelectedTab('links');
    setOpenLinkId(itemId);
    setIsMobilePanelOpen(true);
  };

  const handleTitleClick = () => {
    setSelectedTab('general');
    setIsMobilePanelOpen(true);
    // Focus will be handled in GeneralSettingsTab
    window.dispatchEvent(new CustomEvent('focusPageTitle'));
  };

  const handleDescriptionClick = () => {
    setSelectedTab('general');
    setIsMobilePanelOpen(true);
    // Focus will be handled in GeneralSettingsTab
    window.dispatchEvent(new CustomEvent('focusPageDescription'));
  };

  if (error) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-6">
          <h1 className="text-2xl font-semibold text-red-600">{error}</h1>
          <p className="mt-2 text-gray-600">The page &quot;{slug}&quot; could not be found.</p>
          <Button
            className="mt-4"
            onClick={() => router.push('/dashboard')}
          >
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  // Check if user has permission to edit
  const solanaWallet = user?.linkedAccounts?.find(isSolanaWallet);
  const canEdit = authenticated && solanaWallet?.address === pageDetails?.walletAddress;

  return (
    <>
      <Head>
        <title>Edit {pageDetails?.title || slug} - Page.fun</title>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link 
          href={`https://fonts.googleapis.com/css2?family=${GOOGLE_FONTS.map(font => font.replace(' ', '+')).join('&family=')}&display=swap`}
          rel="stylesheet"
        />
      </Head>

      <main className="min-h-screen">
        <div className="flex h-screen overflow-scroll">
          <div className="w-full h-full overflow-auto lg:w-2/3">
            {/* Mobile edit button */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsMobilePanelOpen(true)}
              className="fixed top-4 right-4 h-7 px-3 py-0 gap-1.5 border-primary z-30 lg:hidden"
            >
              <Pencil className="h-3.5 w-3.5" />
              <span className="font-medium">Settings</span>
            </Button>

            {previewData && (
              <PagePreview 
                pageData={previewData} 
                onLinkClick={handleLinkClick}
                onTitleClick={handleTitleClick}
                onDescriptionClick={handleDescriptionClick}
                isEditMode={true}
              />
            )}
          </div>

          {/* Mobile overlay */}
          {isMobilePanelOpen && (
            <div 
              className="fixed inset-0 bg-black/50 z-40 lg:hidden"
              onClick={() => setIsMobilePanelOpen(false)}
            />
          )}

          {/* Settings panel */}
          <div className={`
            fixed right-0 h-screen overflow-scroll top-0 sm:w-[500px] h-full z-50 
            bg-background border-l border-gray-500 transform transition-transform duration-300 ease-in-out
            lg:static lg:transform-none lg:w-1/2 lg:z-0
            ${isMobilePanelOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'}
          `}>
            <Button 
              variant="ghost" 
              size="icon" 
              className="absolute top-4 right-4 lg:hidden"
              onClick={() => setIsMobilePanelOpen(false)}
            >
              <Menu className="h-4 w-4" />
            </Button>

            <SettingsTabs
              pageDetails={pageDetails}
              setPageDetails={setPageDetails}
              isSaving={isSaving}
              isAuthenticated={authenticated}
              canEdit={true}
              onSave={handleSavePageDetails}
              onConnect={linkWallet}
              selectedTab={selectedTab}
              onTabChange={setSelectedTab}
              openLinkId={openLinkId}
              onLinkOpen={setOpenLinkId}
            />
          </div>
        </div>
      </main>

      <Toaster />
    </>
  );
} 
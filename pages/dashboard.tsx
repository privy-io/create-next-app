import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { usePrivy } from "@privy-io/react-auth";
import Head from "next/head";
import { Button } from "@/components/ui/button";
import { PageData } from '@/types';
import Header from '@/components/Header';
import { Toaster } from '@/components/ui/toaster';
import { isSolanaWallet } from '@/utils/wallet';

// Types
type PageMapping = {
  [key: string]: PageData;
}

// Helper function to check if page is incomplete
const isPageIncomplete = (mapping: PageData | undefined) => {
  if (!mapping) return true;
  return !mapping.title || !mapping.items || mapping.items.length === 0;
};

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

  useEffect(() => {
    if (ready && !authenticated) {
      router.push("/");
    }
  }, [ready, authenticated, router]);

  // Update the wallet finder to use type guard
  const solanaWallet = user?.linkedAccounts?.find(isSolanaWallet);

  // Add numAccounts calculation
  const numAccounts = user?.linkedAccounts?.length || 0;
  const canRemoveAccount = numAccounts > 1;

  // Update the fetchMappings effect
  useEffect(() => {
    if (solanaWallet) {
      const fetchMappings = async () => {
        setIsLoadingMappings(true);
        try {
          const response = await fetch(`/api/page-mapping?walletAddress=${solanaWallet.address}`);
          const data = await response.json();
          const { pages: { pages = [], mappings = {} } } = data;
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

  return (
    <>
      <Head>
        <title>Page.fun Dashboard</title>
      </Head>

      <Header
        solanaWallet={solanaWallet}
        onLogout={logout}
        onLinkWallet={linkWallet}
        onUnlinkWallet={unlinkWallet}
        canRemoveAccount={canRemoveAccount}
      />

      {/* Main Content */}
      <div className="min-h-screen bg-privy-light-blue">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {solanaWallet ? (
            isLoadingMappings ? (
              <div className="text-center py-12">
                <p className="text-gray-600">Loading your pages...</p>
              </div>
            ) : mappedSlugs.length === 0 ? (
              <div className="text-center py-12">
                <h2 className="text-xl font-semibold mb-4">Welcome to Page.fun!</h2>
                <p className="text-gray-600 mb-8">Get started by creating your first page</p>
                <Button onClick={() => router.push('/edit/setup')}>
                  Create Your First Page
                </Button>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h1 className="text-2xl font-semibold">Your Pages</h1>
                  <Button onClick={() => router.push('/edit/setup')}>
                    Create New Page
                  </Button>
                </div>

                <div className="grid gap-4">
                  {mappedSlugs.map(slug => {
                    const pageData = mappings[slug];
                    const needsSetup = isPageIncomplete(pageData);
                    
                    return (
                      <div 
                        key={slug}
                        className="bg-white rounded-lg shadow-sm border border-gray-200 hover:border-violet-300 transition-colors"
                      >
                        <div className="p-6">
                          <div className="flex justify-between items-start">
                            <div className="space-y-1">
                              <h2 className="text-lg font-medium">
                                <a 
                                  href={`/${slug}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-violet-600 hover:text-violet-800"
                                >
                                  page.fun/{slug}
                                </a>
                              </h2>
                              {pageData?.title && (
                                <p className="text-gray-600">
                                  {pageData.title}
                                </p>
                              )}
                              {pageData?.description && (
                                <p className="text-sm text-gray-500">
                                  {pageData.description}
                                </p>
                              )}
                            </div>
                            <div className="flex items-center space-x-2">
                              {needsSetup ? (
                                <Button
                                  size="sm"
                                  onClick={() => router.push(`/edit/setup?slug=${slug}`)}
                                >
                                  Complete Setup
                                </Button>
                              ) : (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => router.push(`/edit/${slug}`)}
                                >
                                  Edit
                                </Button>
                              )}
                            </div>
                          </div>
                          {needsSetup && (
                            <div className="mt-4 text-sm bg-amber-50 text-amber-600 p-2 rounded border border-amber-200">
                              This page needs to be set up
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )
          ) : (
            <div className="text-center py-12">
              <h2 className="text-xl font-semibold mb-4">Welcome to Page.fun!</h2>
              <p className="text-gray-600 mb-8">Connect your wallet to get started</p>
              <Button onClick={linkWallet}>
                Connect Wallet
              </Button>
            </div>
          )}
        </div>
      </div>

      <Toaster />
    </>
  );
}

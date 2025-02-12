import { useRouter } from "next/router";
import { WalletWithMetadata, usePrivy, useLogin } from "@privy-io/react-auth";
import { Button } from "@/components/ui/button";
import { ChevronDown, Plus } from "lucide-react";
import Link from "next/link";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageData } from "@/types";
import { useEffect, useState } from "react";
import { Logo } from "./logo";
import { isSolanaWallet } from "@/utils/wallet";
import { cn } from "@/lib/utils";

interface SolanaWallet extends WalletWithMetadata {
  type: "wallet";
  chainType: "solana";
  address: string;
}

type AppMenuProps = {
  className?: string;
  showLogoName?: boolean;
};

// Helper function to check if page is incomplete
const isPageIncomplete = (mapping: PageData | undefined) => {
  if (!mapping) return true;
  return !mapping.title || !mapping.items || mapping.items.length === 0;
};

// Helper function to get wallet display address
const getDisplayAddress = (address: string) => {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

export default function AppMenu({ className, showLogoName = false }: AppMenuProps) {
  const { ready, authenticated, linkWallet, user, logout, unlinkWallet } = usePrivy();
  const { login } = useLogin({
    onComplete: () => {
      // Refresh the page to update the state
      router.replace(router.asPath);
    },
  });
  const router = useRouter();
  const [mappedSlugs, setMappedSlugs] = useState<string[]>([]);
  const [isLoadingMappings, setIsLoadingMappings] = useState(false);
  const [mappings, setMappings] = useState<{ [key: string]: PageData }>({});
  const [open, setOpen] = useState(false);

  const solanaWallet = user?.linkedAccounts?.find(isSolanaWallet);
  const numAccounts = user?.linkedAccounts?.length || 0;
  const canRemoveAccount = numAccounts > 1;

  // Close sheet on route change
  useEffect(() => {
    const handleRouteChange = () => {
      setOpen(false);
    };

    router.events.on("routeChangeStart", handleRouteChange);

    return () => {
      router.events.off("routeChangeStart", handleRouteChange);
    };
  }, [router]);

  // Fetch pages when wallet is connected
  useEffect(() => {
    if (solanaWallet) {
      const fetchMappings = async () => {
        setIsLoadingMappings(true);
        try {
          const response = await fetch(
            `/api/page-store?walletAddress=${solanaWallet.address}`
          );
          const data = await response.json();
          const {
            pages: { pages = [], mappings = {} },
          } = data;
          setMappedSlugs(pages.map((page: any) => page.slug));
          setMappings(mappings);
        } catch (error) {
          console.error("Error fetching mappings:", error);
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
    <div className={className}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            className={cn(
              "h-7 px-1 py-0 gap-1 bg-background text-foreground hover:bg-foreground hover:text-background"
            )}>
            <Logo />
            {showLogoName && <span>Built with Page.fun</span>}
            <ChevronDown className="h-4 w-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[300px] p-0" align="center">
          <div className="p-4 pb-0">
            <div className="flex items-center justify-between mb-4">
              <div>Page.fun</div>
              <div>Simple website for tokens</div>
            </div>
            {ready ? (
              authenticated ? (
                <>
                  {solanaWallet ? (
                    <div className="space-y-2">
                      <div className="text-sm text-gray-600">
                        {getDisplayAddress(solanaWallet.address)}
                      </div>
                      {canRemoveAccount && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => unlinkWallet(solanaWallet.address)}
                          className="w-full">
                          Disconnect Wallet
                        </Button>
                      )}
                    </div>
                  ) : (
                    <Button onClick={linkWallet} className="w-full">
                      Connect Wallet
                    </Button>
                  )}
                </>
              ) : (
                <Button onClick={login}>Sign In</Button>
              )
            ) : (
              <div className="text-sm text-gray-600">Loading...</div>
            )}
          </div>

          <div className="p-4">
            {ready && authenticated && (
              <div className="space-y-4">
                <Tabs defaultValue="my-pages" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="my-pages">My Pages</TabsTrigger>
                    <TabsTrigger value="following">Following</TabsTrigger>
                  </TabsList>
                  <TabsContent value="my-pages" className="mt-4">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-medium">Your Pages</h3>
                      <Button
                        size="sm"
                        onClick={() => router.push("/edit/setup")}
                        className="gap-1">
                        <Plus className="h-4 w-4" />
                        New Page
                      </Button>
                    </div>

                    <div className="space-y-3 max-h-[300px] overflow-y-auto">
                      {isLoadingMappings ? (
                        <div className="text-sm text-gray-600">
                          Loading pages...
                        </div>
                      ) : mappedSlugs.length === 0 ? (
                        <div className="text-sm text-gray-600">
                          No pages created yet
                        </div>
                      ) : (
                        mappedSlugs.map((slug) => {
                          const pageData = mappings[slug];
                          const needsSetup = isPageIncomplete(pageData);

                          return (
                            <div
                              key={slug}
                              className="p-3 bg-gray-50 rounded-lg space-y-2">
                              <div className="flex items-start justify-between gap-2">
                                <div className="space-y-1 min-w-0">
                                  <Link
                                    href={`/${slug}`}
                                    className="block text-sm font-medium text-violet-600 hover:text-violet-800 truncate">
                                    page.fun/{slug}
                                  </Link>
                                  {pageData?.title && (
                                    <p className="text-xs text-gray-600 truncate">
                                      {pageData.title}
                                    </p>
                                  )}
                                </div>
                                <Link
                                  href={
                                    needsSetup
                                      ? `/edit/setup?slug=${slug}`
                                      : `/edit/${slug}`
                                  }
                                  passHref>
                                  <Button
                                    size="sm"
                                    variant={needsSetup ? "default" : "outline"}
                                    className="shrink-0">
                                    {needsSetup ? "Setup" : "Edit"}
                                  </Button>
                                </Link>
                              </div>
                              {needsSetup && (
                                <div className="text-xs bg-amber-50 text-amber-600 p-2 rounded border border-amber-200">
                                  This page needs to be set up
                                </div>
                              )}
                            </div>
                          );
                        })
                      )}
                    </div>
                  </TabsContent>
                  <TabsContent value="following" className="mt-4">
                    <div className="text-sm text-gray-600">
                      Coming soon - You'll be able to follow other pages and see
                      them here.
                    </div>
                  </TabsContent>
                </Tabs>
                <Button
                  variant="outline"
                  onClick={logout}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50">
                  Logout
                </Button>
              </div>
            )}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}

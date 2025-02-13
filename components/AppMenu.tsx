import { useRouter } from "next/router";
import { usePrivy, useLogin } from "@privy-io/react-auth";
import { Button } from "@/components/ui/button";
import { ChevronDown, Plus, Home } from "lucide-react";
import Link from "next/link";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { PageData } from "@/types";
import { useEffect, useState } from "react";
import { Logo } from "./logo";
import { isSolanaWallet } from "@/utils/wallet";
import { cn } from "@/lib/utils";
import CreatePageModal from "./CreatePageModal";

type AppMenuProps = {
  className?: string;
  showLogoName?: boolean;
};

// Helper function to check if page is incomplete
export const isPageIncomplete = (mapping: PageData | undefined) => {
  if (!mapping) return true;
  return !mapping.title || !mapping.items || mapping.items.length === 0;
};

export default function AppMenu({
  className,
  showLogoName = false,
}: AppMenuProps) {
  const { ready, authenticated, linkWallet, user, logout, unlinkWallet } =
    usePrivy();
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
  const [showCreateModal, setShowCreateModal] = useState(false);

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
            `/api/page-store?walletAddress=${solanaWallet.address}`,
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

  useEffect(() => {
    const handleOpenMenu = () => {
      setOpen(true);
    };

    window.addEventListener("openAppMenu", handleOpenMenu);
    return () => {
      window.removeEventListener("openAppMenu", handleOpenMenu);
    };
  }, []);

  return (
    <div className={className}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            className={cn(
              "h-7 px-1 py-0 gap-1 bg-background border border-primary text-foreground hover:bg-foreground hover:text-background",
            )}
          >
            <Logo />
            {showLogoName && <span>Built with Page.fun</span>}
            <ChevronDown className="h-4 w-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[300px] p-0" align="center">
          <div className="p-4 pb-0">
            <div>
              <Link href="/" className="flex items-center gap-1.5">
                <Home size={16} />
                <div>Page.fun</div>
              </Link>
              <div className="text-sm text-gray-600">
                Simple, fun tokenized websites
              </div>
            </div>
          </div>

          <div className="p-4">
            {ready && authenticated ? (
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <Button
                      size="sm"
                      onClick={() => {
                        setShowCreateModal(true);
                        setOpen(false);
                      }}
                      className="w-full"
                    >
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
                      // Sort pages so current page is first
                      [...mappedSlugs]
                        .sort((a, b) => {
                          const isCurrentA =
                            router.asPath === `/${a}` ||
                            router.asPath === `/edit/${a}`;
                          const isCurrentB =
                            router.asPath === `/${b}` ||
                            router.asPath === `/edit/${b}`;
                          if (isCurrentA) return -1;
                          if (isCurrentB) return 1;
                          return 0;
                        })
                        .map((slug) => {
                          const pageData = mappings[slug];
                          const isCurrentPage =
                            router.asPath === `/${slug}` ||
                            router.asPath === `/edit/${slug}`;

                          return (
                            <div
                              key={slug}
                              className={cn(
                                "p-3 rounded-lg space-y-2",
                                isCurrentPage
                                  ? "bg-primary/5 ring-1 ring-primary/10"
                                  : "bg-muted",
                              )}
                            >
                              <div className="flex items-start justify-between gap-2">
                                <div className="space-y-1 min-w-0">
                                  <Link
                                    href={`/${slug}`}
                                    className={cn(
                                      "block text-sm font-medium truncate",
                                      isCurrentPage
                                        ? "text-primary"
                                        : "text-primary hover:text-primary/80",
                                    )}
                                  >
                                    page.fun/{slug}
                                  </Link>
                                  {pageData?.title && (
                                    <p className="text-xs text-muted-foreground truncate">
                                      {pageData.title}
                                    </p>
                                  )}
                                </div>
                                <Link
                                  href={`/edit/${slug}`}
                                  passHref
                                >
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="shrink-0"
                                  >
                                    Edit
                                  </Button>
                                </Link>
                              </div>
                            </div>
                          );
                        })
                    )}
                  </div>
                </div>
                {ready ? (
                  authenticated ? (
                    <>
                      {solanaWallet ? (
                        <div className="space-y-2">
                          <div className="flex gap-2 items-center">
                            <input
                              type="text"
                              value={solanaWallet.address}
                              disabled
                              className="flex-1 text-sm text-muted-foreground bg-muted px-2 py-1 rounded-md border"
                            />
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={logout}
                              className="shrink-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                            >
                              Logout
                            </Button>
                          </div>
                          {canRemoveAccount && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => unlinkWallet(solanaWallet.address)}
                              className="w-full"
                            >
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
                  <div className="text-sm text-muted-foreground">Loading...</div>
                )}
              </div>
            ) : ready ? (
                <Button onClick={login} className="w-full">
                  Sign In
                </Button>
            ) : (
              <div className="text-sm text-gray-600">Loading...</div>
            )}
          </div>
        </PopoverContent>
      </Popover>

      {showCreateModal && solanaWallet && (
        <CreatePageModal
          walletAddress={solanaWallet.address}
          onClose={() => setShowCreateModal(false)}
          open={showCreateModal}
        />
      )}
    </div>
  );
}

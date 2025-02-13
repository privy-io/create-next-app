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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { PageData } from "@/types";
import { useEffect, useState } from "react";
import { Logo } from "./logo";
import { isSolanaWallet } from "@/utils/wallet";
import { cn } from "@/lib/utils";
import CreatePageModal from "./CreatePageModal";
import { useGlobalContext } from "@/lib/context";

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
  const [open, setOpen] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const { userPages, isLoadingPages } = useGlobalContext();
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
            variant="outline"
            className={cn(
              "h-7 px-1 py-0 gap-1 border-primary",
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
                  <div className="flex flex-col gap-2 mb-4">
                    {userPages.some(page => 
                      router.asPath === `/${page.slug}` || 
                      router.asPath === `/edit/${page.slug}`
                    ) && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          const currentPage = userPages.find(page => 
                            router.asPath === `/${page.slug}` || 
                            router.asPath === `/edit/${page.slug}`
                          );
                          if (currentPage) {
                            const isEditPage = router.asPath === `/edit/${currentPage.slug}`;
                            router.push(isEditPage ? `/${currentPage.slug}` : `/edit/${currentPage.slug}`);
                            setOpen(false);
                          }
                        }}
                        className="w-full"
                      >
                        {router.asPath.startsWith('/edit/') ? 'Exit to page' : 'Edit Page'}
                      </Button>
                    )}
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
                    {isLoadingPages ? (
                      <div className="text-sm text-gray-600">
                        Loading pages...
                      </div>
                    ) : userPages.length === 0 ? (
                      <div className="text-sm text-gray-600">
                        No pages created yet
                      </div>
                    ) : (
                      userPages
                        .sort((a, b) => {
                          const isCurrentA = router.asPath === `/${a.slug}` || router.asPath === `/edit/${a.slug}`;
                          const isCurrentB = router.asPath === `/${b.slug}` || router.asPath === `/edit/${b.slug}`;
                          if (isCurrentA) return -1;
                          if (isCurrentB) return 1;
                          return a.title?.localeCompare(b.title || '') || 0;
                        })
                        .map((page) => {
                          const isCurrentPage =
                            router.asPath === `/${page.slug}` ||
                            router.asPath === `/edit/${page.slug}`;

                          return (
                            <div
                              key={page.slug}
                              className={cn(
                                "p-3 rounded-lg space-y-2",
                                isCurrentPage
                                  ? "bg-primary/10 ring-1 ring-primary/20"
                                  : "bg-muted hover:bg-muted/80",
                              )}
                            >
                              <div className="flex items-start justify-between gap-2">
                                <div className="space-y-1 min-w-0">
                                  <Link
                                    href={`/${page.slug}`}
                                    className={cn(
                                      "block text-sm font-medium truncate",
                                      isCurrentPage
                                        ? "text-primary"
                                        : "text-primary hover:text-primary/80",
                                    )}
                                  >
                                    page.fun/{page.slug}
                                  </Link>
                                  {page.title && (
                                    <p className="text-xs text-muted-foreground truncate">
                                      {page.title}
                                    </p>
                                  )}
                                </div>
                                <Link
                                  href={`/edit/${page.slug}`}
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
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <input
                                    type="text"
                                    value={solanaWallet.address}
                                    disabled
                                    className="flex-1 text-sm text-muted-foreground bg-muted px-2 py-1 rounded-md border"
                                  />
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Your wallet address is hidden to visitors and kept private</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
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

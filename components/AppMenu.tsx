import { useRouter } from "next/router";
import { usePrivy, useLogin } from "@privy-io/react-auth";
import { Button } from "@/components/ui/button";
import { ChevronDown, Plus, Menu } from "lucide-react";
import Link from "next/link";
import { Drawer, DrawerContent, DrawerTrigger } from "@/components/ui/drawer";
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
      <Drawer open={open} onOpenChange={setOpen} direction="left">
        <DrawerTrigger asChild>
          <Button variant="outline" className={cn("px-2")}>
            <Menu className="h-5 w-5" />
          </Button>
        </DrawerTrigger>
        <DrawerContent direction="left">
          <div className="h-full flex flex-col">
            <div className="flex-1 overflow-y-auto">
              <div className="space-y-4">
                <div>
                  <Link href="/" className="flex items-center gap-1.5">
                    <Logo className="w-5 h-5" />
                    <div className="font-bold">page.fun</div>
                    <div className="text-xs text-green-500">beta</div>
                  </Link>
                  <div className="text-sm text-gray-600">
                    Tokenize yourself, memes and AI bots.
                  </div>
                </div>

                {ready && authenticated ? (
                  <div className="space-y-4">
                    <div>
                      <div className="flex flex-col gap-2 mb-4">
                        <Button
                          size="sm"
                          onClick={() => {
                            setShowCreateModal(true);
                            setOpen(false);
                          }}
                          className="w-full">
                          <Plus className="h-4 w-4" />
                          New Page
                        </Button>
                      </div>

                      <div className="space-y-3">
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
                            .sort(
                              (a, b) =>
                                a.title?.localeCompare(b.title || "") || 0
                            )
                            .map((page) => (
                              <div
                                key={page.slug}
                                className="p-3 rounded-lg space-y-2 bg-muted border border-primary">
                                <div className="flex items-start justify-between gap-2">
                                  <div className="space-y-1 min-w-0">
                                    <Link
                                      href={`/${page.slug}`}
                                      className="block text-sm font-medium truncate text-primary hover:text-primary/80">
                                      page.fun/{page.slug}
                                    </Link>
                                    {page.title && (
                                      <p className="text-xs text-muted-foreground truncate">
                                        {page.title}
                                      </p>
                                    )}
                                  </div>
                                  <Link href={`/edit/${page.slug}`} passHref>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      className="shrink-0">
                                      Edit
                                    </Button>
                                  </Link>
                                </div>
                              </div>
                            ))
                        )}
                      </div>
                    </div>
                  </div>
                ) : ready ? (
                  <Button onClick={login} className="w-full">
                    Sign In
                  </Button>
                ) : (
                  <div className="text-sm text-gray-600">Loading...</div>
                )}
              </div>
            </div>

            {ready && authenticated && (
              <div className="border-t pt-3 bg-background">
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
                            <p>
                              Your wallet address is hidden to visitors and kept
                              private
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={logout}
                        className="shrink-0 text-destructive hover:text-destructive hover:bg-destructive/10">
                        Logout
                      </Button>
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
              </div>
            )}
          </div>
        </DrawerContent>
      </Drawer>

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

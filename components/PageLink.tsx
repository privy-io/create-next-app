import { Fragment } from "react";
import { PageItem, PageData } from "@/types";
import { LINK_CONFIGS } from "@/lib/links";
import { usePrivy } from "@privy-io/react-auth";
import { Button } from "./ui/button";
import { JupiterLogo } from "./icons/JupiterLogo";
import { Loader2 } from "lucide-react";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
} from "./ui/drawer";

// Helper to format token amounts
function formatTokenAmount(amount: string): string {
  const num = parseInt(amount, 10);
  if (isNaN(num)) return amount;

  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + "m";
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + "k";
  }
  return num.toString();
}

interface PageLinkProps {
  item: PageItem;
  pageData: PageData;
  openDrawer: string | null;
  setOpenDrawer: (id: string | null) => void;
  verifying: string | null;
  accessStates: Map<string, boolean>;
  tokenGatedUrls: Map<string, string>;
  onTokenGatedClick: (item: PageItem) => void;
  onVerifyAccess: (
    itemId: string,
    tokenAddress: string,
    requiredAmount: string
  ) => void;
  onLinkClick?: (itemId: string) => void;
  isPreview?: boolean;
}

export default function PageLink({
  item,
  pageData,
  openDrawer,
  setOpenDrawer,
  verifying,
  accessStates,
  tokenGatedUrls,
  onTokenGatedClick,
  onVerifyAccess,
  onLinkClick,
  isPreview = false,
}: PageLinkProps) {
  const { login, authenticated } = usePrivy();
  const linkConfig = LINK_CONFIGS[item.type];
  if (!linkConfig) return null;

  const hasAccess = accessStates.get(item.id) === true;

  const handleLogin = async () => {
    await login();
    // Reopen the drawer after login
    if (openDrawer) {
      onTokenGatedClick(item);
    }
  };

  const handleClick = (e: React.MouseEvent) => {
    if (isPreview && onLinkClick) {
      e.preventDefault();
      onLinkClick(item.id);
      return;
    }

    if (item.tokenGated && openDrawer !== item.id) {
      onTokenGatedClick(item);
    }
  };

  const itemContent = (
    <div className={`pf-link`}>
      <div className="pf-link__inner">
        <div className="pf-link__icon-container">
          <div className="pf-link__icon">
            {linkConfig.icon.modern && (
              <linkConfig.icon.modern
                className="pf-link__icon"
                aria-hidden="true"
              />
            )}
          </div>
        </div>
        <div className="pf-link__title">
          <span className="pf-link__title-text">
            {item.title || linkConfig.label}
          </span>
        </div>
        <div className="pf-link__icon-container">
          {item.tokenGated && (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 16 16"
              fill="currentColor"
              className="pf-link__icon-lock">
              <path
                fillRule="evenodd"
                d="M8 1a3.5 3.5 0 0 0-3.5 3.5V7A1.5 1.5 0 0 0 3 8.5v5A1.5 1.5 0 0 0 4.5 15h7a1.5 1.5 0 0 0 1.5-1.5v-5A1.5 1.5 0 0 0 11.5 7V4.5A3.5 3.5 0 0 0 8 1Zm2 6V4.5a2 2 0 1 0-4 0V7h4Z"
                clipRule="evenodd"
              />
            </svg>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <Fragment>
      {item.tokenGated ? (
        <button
          onClick={handleClick}
          className="w-full text-left"
          disabled={verifying === item.id}>
          {itemContent}
        </button>
      ) : item.url ? (
        <a
          href={item.url}
          target="_blank"
          rel="noopener noreferrer"
          onClick={handleClick}>
          {itemContent}
        </a>
      ) : (
        <a href="#" onClick={handleClick} className="w-full">
          {itemContent}
        </a>
      )}

      {item.tokenGated && (
        <Drawer
          open={openDrawer === item.id}
          onOpenChange={(open) => {
            // Only allow manual closing
            if (open === false) {
              setOpenDrawer(null);
            }
          }}>
          <DrawerContent>
              <DrawerHeader>
                <DrawerDescription className="mt-4">
                  <div className="flex flex-col gap-2">
                    <div className="flex flex-col gap-4 items-center">
                      {pageData.image && (
                        <div className="relative w-16 h-16 [transform-style:preserve-3d] animate-rotate3d">
                          <img
                            src={pageData.image}
                            alt={pageData.tokenSymbol || "Token"}
                            className="w-full h-full object-contain rounded-full [backface-visibility:visible]"
                          />
                        </div>
                      )}
                      <div className="text-center">
                        <div className="text-base">
                          You need to hold{" "}
                          <span className="font-bolder">
                            {formatTokenAmount(item.requiredTokens?.[0] || "0")}
                          </span>{" "}
                          ${pageData.tokenSymbol} tokens to access this content.
                        </div>
                      </div>
                    </div>

                    {!authenticated ? (
                      <div className="text-center mt-4">
                        Please connect your wallet to verify token access.
                      </div>
                    ) : hasAccess ? (
                      <div className="flex flex-col gap-2 items-center mt-4">
                        <div className="text-green-500">
                          Access verified!
                        </div>
                      </div>
                    ) : hasAccess === false ? (
                      <div className="text-red-500 text-center mt-4">
                        Insufficient token balance.
                      </div>
                    ) : (
                      <div className="text-center mt-4">
                        Click the button below to check if you can access this content
                      </div>
                    )}
                  </div>
                </DrawerDescription>
              </DrawerHeader>
              <DrawerFooter className="gap-3">
                {!authenticated ? (
                  <Button onClick={handleLogin} className="w-full">
                    Connect Wallet
                  </Button>
                ) : hasAccess ? (
                  tokenGatedUrls.get(item.id) && (
                    <Button asChild className="w-full">
                      <a
                        href={tokenGatedUrls.get(item.id)}
                        target="_blank"
                        rel="noopener noreferrer">
                        Open Link
                      </a>
                    </Button>
                  )
                ) : hasAccess === false ? (
                  <>
                    <Button variant="outline" asChild className="w-full">
                      <a
                        href={`https://jup.ag/swap/SOL-${pageData.connectedToken}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-2">
                        <JupiterLogo className="w-4 h-4" />
                        Get ${pageData.tokenSymbol} on Jupiter
                      </a>
                    </Button>
                    <Button
                      onClick={() =>
                        onVerifyAccess(
                          item.id,
                          pageData.connectedToken!,
                          item.requiredTokens?.[0] || "0"
                        )
                      }
                      disabled={verifying === item.id}
                      className="w-full">
                      {verifying === item.id ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          Verifying...
                        </>
                      ) : (
                        "Check Balance"
                      )}
                    </Button>
                  </>
                ) : (
                  !hasAccess && (
                    <Button
                      onClick={() =>
                        onVerifyAccess(
                          item.id,
                          pageData.connectedToken!,
                          item.requiredTokens?.[0] || "0"
                        )
                      }
                      disabled={verifying === item.id}
                      className="w-full">
                      {verifying === item.id ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          Verifying...
                        </>
                      ) : (
                        "Check Balance"
                      )}
                    </Button>
                  )
                )}
              </DrawerFooter>
          </DrawerContent>
        </Drawer>
      )}
    </Fragment>
  );
}

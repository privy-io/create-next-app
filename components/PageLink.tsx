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
  onVerifyAccess: (itemId: string, tokenAddress: string, requiredAmount: string) => void;
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

  const itemContent = (
    <div className={`pf-link`}>
      <div className="pf-link__header">
        <div className="pf-link__info">
          {linkConfig.icon.modern && <linkConfig.icon.modern className="pf-link__icon" aria-hidden="true" />}
          <span className="pf-link__type">{item.title || linkConfig.label}</span>
        </div>
        {item.tokenGated && (
          <span className="pf-link__token-badge">
            {item.requiredTokens?.[0] && pageData.tokenSymbol && formatTokenAmount(item.requiredTokens[0])}
            {pageData.image && (
              <img src={pageData.image} alt={pageData.tokenSymbol || "Token"} className="pf-token-image" />
            )}
          </span>
        )}
      </div>
    </div>
  );

  return (
    <Fragment>
      {item.tokenGated ? (
        hasAccess && tokenGatedUrls.get(item.id) ? (
          <a href={tokenGatedUrls.get(item.id)} target="_blank" rel="noopener noreferrer">
            {itemContent}
          </a>
        ) : (
          <button 
            onClick={() => onTokenGatedClick(item)} 
            className="w-full text-left" 
            disabled={verifying === item.id}
          >
            {itemContent}
          </button>
        )
      ) : (
        item.url ? (
          <a href={item.url} target="_blank" rel="noopener noreferrer">
            {itemContent}
          </a>
        ) : itemContent
      )}

      {item.tokenGated && (
        <Drawer
          open={openDrawer === item.id}
          onOpenChange={(open) => !open && setOpenDrawer(null)}>
          <DrawerContent>
            <div className="mx-auto w-full max-w-sm">
              <DrawerHeader>
                <DrawerDescription className="mt-4">
                  <div className="flex flex-col gap-2">
                    {!authenticated ? (
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
                          <div className="text-lg">
                            You need to hold{" "}
                            <span className="font-medium">
                              {formatTokenAmount(
                                item.requiredTokens?.[0] || "0"
                              )}
                            </span>{" "}
                            ${pageData.tokenSymbol} tokens to
                            access this content.
                          </div>
                          <div className="mt-2">
                            Please connect your wallet to verify token access.
                          </div>
                        </div>
                      </div>
                    ) : hasAccess ? (
                      <div className="text-green-500 py-2 text-center">
                        Access verified! You can now access the
                        content.
                      </div>
                    ) : hasAccess === false ? (
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
                          <div className="text-lg">
                            You need to hold{" "}
                            <span className="font-medium">
                              {formatTokenAmount(
                                item.requiredTokens?.[0] || "0"
                              )}
                            </span>{" "}
                            ${pageData.tokenSymbol} tokens to
                            access this content.
                          </div>
                          <div className="text-red-500 mt-2">
                            Insufficient token balance.
                          </div>
                        </div>
                      </div>
                    ) : (
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
                          <div className="text-lg">
                            Click the button below to check if you can access this content
                          </div>
                        </div>
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
                ) : hasAccess === false ? (
                  <>
                    <Button
                      variant="outline"
                      asChild
                      className="w-full">
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
                ) : !hasAccess && (
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
                )}
                {hasAccess && tokenGatedUrls.get(item.id) && (
                  <Button asChild className="w-full">
                    <a
                      href={tokenGatedUrls.get(item.id)}
                      target="_blank"
                      rel="noopener noreferrer">
                      Open Content
                    </a>
                  </Button>
                )}
              </DrawerFooter>
            </div>
          </DrawerContent>
        </Drawer>
      )}
    </Fragment>
  );
} 
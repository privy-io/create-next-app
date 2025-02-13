"use client";

import { useState, useEffect } from "react";
import { PageData, PageItem } from "@/types";
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
  DrawerTitle,
} from "./ui/drawer";
import { useGlobalContext } from "@/lib/context";

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

export default function PageContent({ pageData }: { pageData: PageData }) {
  const { login, authenticated } = usePrivy();
  const { tokenHoldings, isLoadingTokens } = useGlobalContext();
  const [openDrawer, setOpenDrawer] = useState<string | null>(null);
  const [verifying, setVerifying] = useState<string | null>(null);
  const [accessStates, setAccessStates] = useState<Map<string, boolean>>(new Map());

  // Add debug logging
  useEffect(() => {
    console.log('PageContent token holdings:', {
      isLoadingTokens,
      tokenCount: tokenHoldings.length,
      tokens: tokenHoldings,
      pageToken: pageData.connectedToken,
      hasAccess: tokenHoldings.some(t => 
        t.tokenAddress === pageData.connectedToken && parseInt(t.balance) > 0
      )
    });
  }, [tokenHoldings, isLoadingTokens, pageData.connectedToken]);

  const verifyAccess = async (itemId: string, tokenAddress: string, requiredAmount: string) => {
    setVerifying(itemId);
    try {
      const response = await fetch('/api/verify-token-access', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tokenAddress,
          requiredAmount,
        }),
      });

      const data = await response.json();
      console.log('Access verification response:', data);
      
      setAccessStates(prev => new Map(prev).set(itemId, data.hasAccess));
      
      // Close drawer if access is granted
      if (data.hasAccess) {
        setOpenDrawer(null);
      }
    } catch (error) {
      console.error('Error verifying access:', error);
      setAccessStates(prev => new Map(prev).set(itemId, false));
      setOpenDrawer(itemId);
    } finally {
      setVerifying(null);
    }
  };

  const handleTokenGatedClick = async (item: PageItem) => {
    if (!authenticated) {
      login();
      return;
    }

    if (item.requiredTokens?.[0] && pageData.connectedToken) {
      // Only open drawer if we haven't verified access yet or if access was previously denied
      const currentAccess = accessStates.get(item.id);
      if (currentAccess !== true) {
        setOpenDrawer(item.id);
      }
      await verifyAccess(item.id, pageData.connectedToken, item.requiredTokens[0]);
    }
  };

  const hasAccessToItem = (requiredAmount: string, tokenAddress: string) => {
    if (!authenticated || !tokenAddress || !requiredAmount) {
      console.log('Access check failed:', { authenticated, tokenAddress, requiredAmount });
      return false;
    }
    
    const holding = tokenHoldings.find(t => t.tokenAddress === tokenAddress);
    console.log('Token holding check:', {
      tokenAddress,
      requiredAmount,
      foundHolding: holding,
      balance: holding?.balance,
      hasEnough: holding ? parseInt(holding.balance) >= parseInt(requiredAmount) : false
    });

    if (!holding) return false;

    return parseInt(holding.balance) >= parseInt(requiredAmount);
  };

  return (
    <div className="pf-page">
      <div className="pf-page__container">
        {/* Page Header */}
        <div className="pf-page__header">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          {pageData?.image && (
            <img
              className="pf-page__image"
              src={pageData.image}
              alt={pageData.title}
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = "none";
              }}
            />
          )}
          <h1 className="pf-page__title">
            {pageData?.title || "Untitled Page"}
          </h1>
          {pageData?.description && (
            <p className="pf-page__description">{pageData.description}</p>
          )}
          {(pageData?.showToken || pageData?.showSymbol) &&
            pageData?.connectedToken && (
              <div className="pf-page__token">
                {pageData.showToken && (
                  <code>
                    {pageData.connectedToken}
                    {pageData.showSymbol && pageData.tokenSymbol && (
                      <span>({pageData.tokenSymbol})</span>
                    )}
                  </code>
                )}
              </div>
            )}
        </div>

        {/* Social Links & Plugins */}
        {pageData?.items && pageData.items.length > 0 && (
          <div className="pf-links">
            <div className="pf-links__grid">
              {pageData.items
                .sort((a, b) => a.order - b.order)
                .map((item) => {
                  const linkConfig = LINK_CONFIGS[item.type];
                  if (!linkConfig) return null;

                  const Icon = linkConfig.icon.modern;
                  const hasAccess = accessStates.get(item.id);

                  if (item.tokenGated) {
                    const itemContent = (
                      <div className="pf-link-item pf-link-item--token-gated">
                        <div className="pf-link-item__header">
                          <div className="pf-link-item__info">
                            <Icon
                              className="pf-link-item__icon"
                              aria-hidden="true"
                            />
                            <span className="pf-link-item__type">
                              {item.title || linkConfig.label}
                            </span>
                          </div>
                          <span className="pf-link-item__token-badge">
                            {item.requiredTokens?.[0] &&
                              pageData.tokenSymbol &&
                              `${formatTokenAmount(item.requiredTokens[0])}`}

                            {pageData.image && (
                              <div className="pf-token-image">
                                <img
                                  src={pageData.image}
                                  alt={pageData.tokenSymbol || "Token"}
                                />
                              </div>
                            )}
                          </span>
                        </div>
                        
                        {!authenticated ? (
                          <div className="pf-link-item__status mt-2 text-sm text-center">
                            Connect Wallet to Access
                          </div>
                        ) : verifying === item.id ? (
                          <div className="pf-link-item__status mt-2 text-sm text-center flex items-center justify-center gap-2">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Verifying access...
                          </div>
                        ) : !hasAccess && (
                          <div className="pf-link-item__status mt-2 text-sm text-center">
                            {hasAccess === undefined ? 'Click to View Content' : 'Click to Verify Access'}
                          </div>
                        )}
                      </div>
                    );

                    return (
                      <div key={item.id}>
                        {hasAccess === true && item.url ? (
                          <a
                            href={item.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block"
                          >
                            {itemContent}
                          </a>
                        ) : (
                          <div 
                            className="cursor-pointer" 
                            onClick={() => handleTokenGatedClick(item)}
                          >
                            {itemContent}
                          </div>
                        )}

                        <Drawer open={openDrawer === item.id} onOpenChange={(open) => !open && setOpenDrawer(null)}>
                          <DrawerContent>
                            <div className="mx-auto w-full max-w-sm">
                              <DrawerHeader>
                                <DrawerTitle>Token Access Required</DrawerTitle>
                                <DrawerDescription className="mt-4">
                                  <div className="flex flex-col gap-2">
                                    <span>You need <span className="font-medium">{formatTokenAmount(item.requiredTokens?.[0] || "0")}</span> {pageData.tokenSymbol} tokens to access this content.</span>
                                    {hasAccess === false && (
                                      <span className="text-red-500">Insufficient token balance.</span>
                                    )}
                                  </div>
                                </DrawerDescription>
                              </DrawerHeader>
                              <DrawerFooter className="gap-3">
                                <Button 
                                  variant="outline" 
                                  asChild
                                  className="w-full"
                                >
                                  <a
                                    href={`https://jup.ag/swap/SOL-${pageData.connectedToken}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center justify-center gap-2"
                                  >
                                    <JupiterLogo className="w-4 h-4" />
                                    Buy ${pageData.tokenSymbol} on Jupiter
                                  </a>
                                </Button>
                                <Button 
                                  onClick={() => verifyAccess(item.id, pageData.connectedToken!, item.requiredTokens?.[0] || "0")}
                                  disabled={verifying === item.id}
                                  className="w-full"
                                >
                                  {verifying === item.id ? (
                                    <>
                                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                      Checking Balance...
                                    </>
                                  ) : (
                                    'Refresh Balance'
                                  )}
                                </Button>
                              </DrawerFooter>
                            </div>
                          </DrawerContent>
                        </Drawer>
                      </div>
                    );
                  }

                  return (
                    <div key={item.id} className="pf-link-item">
                      <div className="pf-link-item__header">
                        <div className="pf-link-item__info">
                          <Icon
                            className="pf-link-item__icon"
                            aria-hidden="true"
                          />
                          <span className="pf-link-item__type">
                            {item.title || linkConfig.label}
                          </span>
                        </div>
                      </div>
                      {item.url && (
                        <a
                          href={item.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="pf-link-item__url"
                        >
                          {item.url}
                        </a>
                      )}
                    </div>
                  );
                })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

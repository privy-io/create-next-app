import { Fragment } from "react";
import { usePrivy } from "@privy-io/react-auth";
import { Button } from "@/components/ui/button";
import Loader from "@/components/ui/loader";
import {
  Drawer,
  DrawerContent,
  DrawerFooter,
} from "@/components/ui/drawer";
import { JupiterLogo } from "./icons/JupiterLogo";
import { PageItem, PageData } from "@/types";
import { LINK_PRESETS } from "@/lib/linkPresets";

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

// Helper to track link clicks
async function trackClick(slug: string, itemId: string, isGated: boolean) {
  try {
    await fetch('/api/analytics/track-click', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        slug,
        itemId,
        isGated,
      }),
    });
  } catch (error) {
    console.error('Failed to track click:', error);
  }
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
  const preset = LINK_PRESETS[item.presetId];
  if (!preset) return null;

  const hasAccess = accessStates.get(item.id) === true;

  const handleLogin = async () => {
    await login();
    // Reopen the drawer after login
    if (openDrawer) {
      onTokenGatedClick(item);
    }
  };

  const handleClick = async (e: React.MouseEvent) => {
    if (isPreview && onLinkClick) {
      e.preventDefault();
      onLinkClick(item.id);
      return;
    }

    // Get the page slug from the URL
    const slug = window.location.pathname.split('/').pop();
    if (!slug) return;

    // Only track non-gated links immediately
    if (!item.tokenGated) {
      await trackClick(slug, item.id, false);
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
            <preset.icon className="pf-link__icon" aria-hidden="true" />
          </div>
        </div>
        <div className="pf-link__title">
          <span className="pf-link__title-text">
            {item.title || preset.title}
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
            <DrawerFooter className="gap-3 text-center">
              {pageData.image && (
                <div className="flex justify-center mb-4">
                  <img
                    src={pageData.image}
                    alt={`${pageData.tokenSymbol} token`}
                    className="w-12 h-12 rounded-full animate-rotate3d"
                  />
                </div>
              )}
              {!authenticated ? (
                <Button onClick={handleLogin} className="w-full">
                  Connect Wallet
                </Button>
              ) : hasAccess ? (
                <>
                  <div className="inline-flex items-center justify-center gap-2 text-sm text-green-700 bg-green-50 px-3 py-1.5 rounded-full mx-auto mb-3">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 16 16"
                      fill="currentColor"
                      className="w-4 h-4 text-green-600">
                      <path
                        fillRule="evenodd"
                        d="M12.416 3.376a.75.75 0 0 1 .208 1.04l-5 7.5a.75.75 0 0 1-1.154.114l-3-3a.75.75 0 0 1 1.06-1.06l2.353 2.353 4.493-6.74a.75.75 0 0 1 1.04-.207Z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Access Verified
                  </div>
                  {tokenGatedUrls.get(item.id) ? (
                    <Button 
                      asChild 
                      className="w-full"
                      onClick={async () => {
                        // Track click when user clicks the actual gated link
                        const slug = window.location.pathname.split('/').pop();
                        if (slug) {
                          await trackClick(slug, item.id, true);
                        }
                      }}
                    >
                      <a
                        href={tokenGatedUrls.get(item.id)}
                        target="_blank"
                        rel="noopener noreferrer">
                        Open Link
                      </a>
                    </Button>
                  ) : (
                    <Button disabled className="w-full">
                      <Loader className="h-4 w-4 mr-2" />
                      Fetching Link...
                    </Button>
                  )}
                </>
              ) : hasAccess === false ? (
                <>
                  <div className="inline-flex items-center justify-center gap-2 text-sm text-orange-700 bg-orange-50 px-3 py-1.5 rounded-full mx-auto mb-3">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 16 16"
                      fill="currentColor"
                      className="w-4 h-4 text-orange-600">
                      <path
                        fillRule="evenodd"
                        d="M8 15A7 7 0 1 0 8 1a7 7 0 0 0 0 14ZM8 4a.75.75 0 0 1 .75.75v3.5a.75.75 0 0 1-1.5 0v-3.5A.75.75 0 0 1 8 4Zm0 8a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z"
                        clipRule="evenodd"
                      />
                    </svg>
                    You need {item.requiredTokens?.[0] || "0"}{" "}
                    ${pageData.tokenSymbol}{" "}
                    to access
                  </div>
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
                        <Loader className="h-4 w-4 mr-2" />
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
                        <Loader className="h-4 w-4 mr-2" />
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

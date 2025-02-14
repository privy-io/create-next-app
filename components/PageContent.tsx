"use client";

import { useState } from "react";
import { PageData, PageItem } from "@/types";
import PageLink from "./PageLink";

interface PageContentProps {
  pageData: PageData;
  items?: PageItem[];
  themeStyle?: Record<string, any>;
}

export default function PageContent({
  pageData,
  items = pageData.items || [],
  themeStyle,
}: PageContentProps) {
  const [openDrawer, setOpenDrawer] = useState<string | null>(null);
  const [verifying, setVerifying] = useState<string | null>(null);
  const [accessStates, setAccessStates] = useState<Map<string, boolean>>(
    new Map()
  );
  const [tokenGatedUrls, setTokenGatedUrls] = useState<Map<string, string>>(
    new Map()
  );

  const fetchTokenGatedContent = async (itemId: string) => {
    try {
      const response = await fetch("/api/token-gated-content", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          slug: window.location.pathname.slice(1),
          itemId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        console.error("Token gated content error:", {
          status: response.status,
          data,
          itemId,
          slug: window.location.pathname.slice(1),
        });
        return;
      }

      if (data.url) {
        setTokenGatedUrls((prev) => new Map(prev).set(itemId, data.url));
      }
    } catch (error) {
      console.error("Error fetching token gated content:", error);
    }
  };

  const verifyAccess = async (
    itemId: string,
    tokenAddress: string,
    requiredAmount: string
  ) => {
    setVerifying(itemId);
    try {
      const response = await fetch("/api/verify-token-access", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          tokenAddress,
          requiredAmount,
          slug: window.location.pathname.slice(1),
        }),
      });

      const data = await response.json();

      setAccessStates((prev) => new Map(prev).set(itemId, data.hasAccess));

      if (data.hasAccess) {
        await fetchTokenGatedContent(itemId);
        setTimeout(() => setOpenDrawer(null), 1500);
      }
    } catch (error) {
      console.error("Error verifying access:", error);
      setAccessStates((prev) => new Map(prev).set(itemId, false));
    } finally {
      setVerifying(null);
    }
  };

  const handleTokenGatedClick = async (item: PageItem) => {
    if (!item.requiredTokens?.[0] || !pageData.connectedToken) return;

    setOpenDrawer(item.id);
    await verifyAccess(
      item.id,
      pageData.connectedToken,
      item.requiredTokens[0]
    );
  };

  return (
    <div
      className="pf-page"
      style={
        {
          "--pf-font-family-global": pageData.fonts?.global
            ? `'${pageData.fonts.global}', sans-serif`
            : "var(--pf-font-family-default)",
          "--pf-font-family-heading": pageData.fonts?.heading
            ? `'${pageData.fonts.heading}', sans-serif`
            : "var(--pf-font-family-global)",
          "--pf-font-family-paragraph": pageData.fonts?.paragraph
            ? `'${pageData.fonts.paragraph}', sans-serif`
            : "var(--pf-font-family-global)",
          "--pf-font-family-links": pageData.fonts?.links
            ? `'${pageData.fonts.links}', sans-serif`
            : "var(--pf-font-family-global)",
          ...(themeStyle || {}),
        } as React.CSSProperties
      }>
      <div className="pf-page__container">
        {/* Page Header */}
        <div className="pf-page__header">
          <div className="pf-page__header-inner">
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
          </div>
        </div>

        {/* Social Links & Plugins */}
        {items && items.length > 0 && (
          <div className="pf-links">
            <div className="pf-links__grid">
              {items
                .filter((item) => item && item.id && item.type)
                .sort((a, b) => a.order - b.order)
                .map((item) => (
                  <PageLink
                    key={item.id}
                    item={item}
                    pageData={pageData}
                    openDrawer={openDrawer}
                    setOpenDrawer={setOpenDrawer}
                    verifying={verifying}
                    accessStates={accessStates}
                    tokenGatedUrls={tokenGatedUrls}
                    onTokenGatedClick={handleTokenGatedClick}
                    onVerifyAccess={verifyAccess}
                  />
                ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

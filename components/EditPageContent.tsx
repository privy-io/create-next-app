import { useState } from "react";
import { PageData, PageItem } from "@/types";
import EditPageLink from "./EditPageLink";

interface EditPageContentProps {
  pageData: PageData;
  items?: PageItem[];
  themeStyle?: Record<string, any>;
  onLinkClick?: (itemId: string) => void;
  onTitleClick?: () => void;
  onDescriptionClick?: () => void;
}

export default function EditPageContent({
  pageData,
  items = pageData.items || [],
  themeStyle,
  onLinkClick,
  onTitleClick,
  onDescriptionClick,
}: EditPageContentProps) {
  const [openDrawer, setOpenDrawer] = useState<string | null>(null);
  const [verifying, setVerifying] = useState<string | null>(null);
  const [accessStates, setAccessStates] = useState<Map<string, boolean>>(
    new Map()
  );
  const [tokenGatedUrls, setTokenGatedUrls] = useState<Map<string, string>>(
    new Map()
  );

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
            <h1
              className="pf-page__title cursor-pointer hover:opacity-80"
              onClick={onTitleClick}>
              {pageData?.title || "Untitled Page"}
            </h1>
            {pageData?.description && (
              <p
                className="pf-page__description cursor-pointer hover:opacity-80"
                onClick={onDescriptionClick}>
                {pageData.description}
              </p>
            )}
          </div>
        </div>

        {/* Social Links & Plugins */}
        {items && items.length > 0 && (
          <div className="pf-links">
            <div className="pf-links__grid">
              {items
                .filter((item) => item && item.id && item.presetId)
                .sort((a, b) => a.order - b.order)
                .map((item) => (
                  <EditPageLink
                    key={item.id}
                    item={item}
                    pageData={pageData}
                    openDrawer={openDrawer}
                    setOpenDrawer={setOpenDrawer}
                    verifying={verifying}
                    accessStates={accessStates}
                    tokenGatedUrls={tokenGatedUrls}
                    onLinkClick={onLinkClick}
                    isPreview={true}
                  />
                ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

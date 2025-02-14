import { Fragment } from "react";
import { PageItem, PageData } from "@/types";
import { LINK_CONFIGS } from "@/lib/links";

interface EditPageLinkProps {
  item: PageItem;
  pageData: PageData;
  onLinkClick?: (itemId: string) => void;
}

export default function EditPageLink({
  item,
  pageData,
  onLinkClick,
}: EditPageLinkProps) {
  const linkConfig = LINK_CONFIGS[item.type];
  if (!linkConfig) return null;

  const Icon = linkConfig.icon.modern;

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (onLinkClick) {
      onLinkClick(item.id);
    }
  };

  const itemContent = (
    <div className={`pf-link`}>
      <div className="pf-link__inner">
        <div className="pf-link__icon-container">
          <div className="pf-link__icon">
            {Icon && (
              <Icon
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
        <div className="pf-link__token-container">
          {item.tokenGated && (
            <span className="pf-link__token-badge">
              {item.requiredTokens?.[0] &&
                pageData.tokenSymbol &&
                formatTokenAmount(item.requiredTokens[0])}
              {pageData.image && (
                <img
                  src={pageData.image}
                  alt={pageData.tokenSymbol || "Token"}
                  className="pf-token-image"
                />
              )}
            </span>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <button
      onClick={handleClick}
      className="w-full text-left cursor-pointer hover:opacity-80"
    >
      {itemContent}
    </button>
  );
}

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
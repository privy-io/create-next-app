import { Fragment } from "react";
import { PageItem, PageData } from "@/types";
import { LINK_PRESETS } from "@/lib/linkPresets";

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
  const preset = LINK_PRESETS[item.presetId];
  if (!preset) return null;

  const Icon = preset.icon.classic;

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
            <Icon className="pf-link__icon" aria-hidden="true" />
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
    <button
      onClick={handleClick}
      className="w-full text-left cursor-pointer hover:opacity-80">
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

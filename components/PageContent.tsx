import { ItemType } from "../types";

interface PageData {
  walletAddress: string;
  createdAt: string;
  title?: string;
  description?: string;
  items?: PageItem[];
  updatedAt?: string;
  image?: string;
  slug: string;
  connectedToken?: string;
  tokenSymbol?: string;
  showToken?: boolean;
  showSymbol?: boolean;
  designStyle?: "default" | "minimal" | "modern";
  fonts?: {
    global?: string;
    heading?: string;
    paragraph?: string;
    links?: string;
  };
}

interface PageItem {
  id: string;
  type: ItemType;
  url?: string;
  order: number;
  isPlugin?: boolean;
  tokenGated?: boolean;
}

type TokenMetadata = {
  name: string;
  description?: string;
  symbol?: string;
  image?: string;
};

// Helper function to get icon for social link
const getSocialIcon = (type: ItemType) => {
  switch (type) {
    case "twitter":
      return "𝕏";
    case "telegram":
      return "📱";
    case "dexscreener":
      return "📊";
    case "tiktok":
      return "🎵";
    case "instagram":
      return "📸";
    case "email":
      return "📧";
    case "discord":
      return "💬";
    case "private-chat":
      return "🔒";
    case "terminal":
      return "💻";
    case "filesystem":
      return "📁";
    default:
      return "🔗";
  }
};

export default function PageContent({ pageData }: { pageData: PageData }) {
  return (
    <div className="pf-page">
      <div className="pf-page__container">
        {/* Page Header */}
        <div className="pf-page__header">
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
                      <span className="font-medium">
                        (${pageData.tokenSymbol})
                      </span>
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
                .sort((a: PageItem, b: PageItem) => a.order - b.order)
                .map((item: PageItem) => (
                  <div
                    key={item.id}
                    className={`pf-link-item ${
                      item.tokenGated ? "pf-link-item--token-gated" : ""
                    }`}>
                    <div className="pf-link-item__header">
                      <div className="pf-link-item__info">
                        <span className="pf-link-item__icon">
                          {getSocialIcon(item.type)}
                        </span>
                        <span className="pf-link-item__type">
                          {item.type.replace("-", " ")}
                        </span>
                      </div>
                      {item.tokenGated && (
                        <span className="pf-link-item__token-badge">
                          Token Required
                        </span>
                      )}
                    </div>
                    {item.url && (
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="pf-link-item__url">
                        {item.url}
                      </a>
                    )}
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

import { ItemType } from '../types';

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
  designStyle?: 'default' | 'minimal' | 'modern';
}

interface PageItem {
  id: string;
  type: ItemType;
  url?: string;
  order: number;
  isPlugin?: boolean;
  tokenGated?: boolean;
}

// Helper function to get icon for social link
const getSocialIcon = (type: ItemType) => {
  switch (type) {
    case 'twitter':
      return '𝕏';
    case 'telegram':
      return '📱';
    case 'dexscreener':
      return '📊';
    case 'tiktok':
      return '🎵';
    case 'instagram':
      return '📸';
    case 'email':
      return '📧';
    case 'discord':
      return '💬';
    case 'private-chat':
      return '🔒';
    case 'terminal':
      return '💻';
    case 'filesystem':
      return '📁';
    default:
      return '🔗';
  }
};

export default function PageContent({ pageData }: { pageData: PageData }) {
  return (
    <div className="pf-page">
      <div className="pf-page__container">
        {/* Page Header */}
        <div className="pf-page__header">
          <h1 className="pf-page__title">
            {pageData?.title || 'Untitled Page'}
          </h1>
          {pageData?.description && (
            <p className="pf-page__description">{pageData.description}</p>
          )}
        </div>

        {/* Social Links & Plugins */}
        {pageData?.items && pageData.items.length > 0 && (
          <div className="pf-links">
            <h2 className="pf-links__title">Links & Features</h2>
            <div className="pf-links__grid">
              {pageData.items
                .sort((a: PageItem, b: PageItem) => a.order - b.order)
                .map((item: PageItem) => (
                  <div
                    key={item.id}
                    className={`pf-link-item ${item.tokenGated ? 'pf-link-item--token-gated' : ''}`}
                  >
                    <div className="pf-link-item__header">
                      <div className="pf-link-item__info">
                        <span className="pf-link-item__icon">{getSocialIcon(item.type)}</span>
                        <span className="pf-link-item__type">{item.type.replace('-', ' ')}</span>
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
                        className="pf-link-item__url"
                      >
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
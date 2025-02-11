import { PageData, PageItem, ItemType } from '../types';

export default function PagePreview({ pageData }: { pageData: PageData }) {
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

  return (
    <div className="min-h-screen bg-privy-light-blue p-6">
      <div className="max-w-2xl mx-auto">
        {/* Page Header */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h1 className="text-3xl font-bold mb-2">
            {pageData?.title || 'Untitled Page'}
          </h1>
          {pageData?.description && (
            <p className="text-gray-600 mb-4">{pageData.description}</p>
          )}
        </div>

        {/* Social Links & Plugins */}
        {pageData?.items && pageData.items.length > 0 && (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Links & Features</h2>
            <div className="grid gap-4">
              {pageData.items
                .sort((a: PageItem, b: PageItem) => a.order - b.order)
                .map((item: PageItem) => (
                  <div
                    key={item.id}
                    className={`p-4 rounded-lg border ${
                      item.tokenGated 
                        ? 'bg-violet-50 border-violet-200' 
                        : 'bg-gray-50 border-gray-200'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <span className="text-2xl">{getSocialIcon(item.type)}</span>
                        <span className="font-medium capitalize">{item.type.replace('-', ' ')}</span>
                      </div>
                      {item.tokenGated && (
                        <span className="text-sm bg-violet-100 text-violet-800 px-2 py-1 rounded">
                          Token Required
                        </span>
                      )}
                    </div>
                    {item.url && (
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-2 text-violet-600 hover:text-violet-800 block"
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
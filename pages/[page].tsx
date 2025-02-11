import { GetServerSideProps } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

type ItemType = 'twitter' | 'telegram' | 'dexscreener' | 'tiktok' | 'instagram' | 'email' | 'discord' | 'private-chat' | 'terminal' | 'filesystem';

type PageItem = {
  id: string;
  type: ItemType;
  url?: string;
  order: number;
  isPlugin?: boolean;
  tokenGated?: boolean;
};

type PageData = {
  walletAddress: string;
  createdAt: string;
  title?: string;
  description?: string;
  items?: PageItem[];
  updatedAt?: string;
};

type PageProps = {
  slug: string;
  walletAddress: string | null;
  pageData: PageData | null;
  error?: string;
};

type TokenBalance = {
  mint: string;
  amount: number;
  decimals: number;
  tokenName?: string;
  symbol?: string;
  isPumpToken?: boolean;
};

export const getServerSideProps: GetServerSideProps<PageProps> = async ({ params, query }) => {
  const slug = params?.page as string;
  const isPreview = query.preview === 'true';
  const previewData = query.data ? JSON.parse(query.data as string) : null;

  // If preview mode and preview data exists, return it directly
  if (isPreview && previewData) {
    return {
      props: {
        slug,
        walletAddress: previewData.walletAddress,
        pageData: previewData,
      }
    };
  }

  // Otherwise, fetch data as normal
  try {
    const response = await fetch(`${process.env.NODE_ENV === 'development' ? 'http://localhost:3000' : ''}/api/page-mapping?slug=${slug}`);
    const { mapping } = await response.json();

    if (!mapping) {
      return {
        props: {
          slug,
          walletAddress: null,
          pageData: null,
          error: 'Page not found'
        }
      };
    }

    return {
      props: {
        slug,
        walletAddress: mapping.walletAddress,
        pageData: mapping
      }
    };
  } catch (error) {
    console.error('Error fetching page data:', error);
    return {
      props: {
        slug,
        walletAddress: null,
        pageData: null,
        error: 'Failed to fetch page data'
      }
    };
  }
};

export default function PageView({ slug, pageData, error }: PageProps) {
  const router = useRouter();
  const isPreview = router.query.preview === 'true';

  if (error && !isPreview) {
    return (
      <div className="min-h-screen bg-privy-light-blue p-6">
        <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-6">
          <h1 className="text-2xl font-semibold text-red-600">{error}</h1>
          <p className="mt-2 text-gray-600">The page "{slug}" could not be found.</p>
        </div>
      </div>
    );
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

  return (
    <>
      <Head>
        <title>{pageData?.title || slug} - Token Page</title>
        {pageData?.description && (
          <meta name="description" content={pageData.description} />
        )}
      </Head>

      <div className="min-h-screen bg-privy-light-blue p-6">
        <div className="max-w-2xl mx-auto">
          {/* Page Header */}
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <h1 className="text-3xl font-bold mb-2">
              {pageData?.title || slug}
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
                  .sort((a, b) => a.order - b.order)
                  .map((item) => (
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
    </>
  );
} 
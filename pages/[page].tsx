import { GetServerSideProps } from 'next';
import Head from 'next/head';
import { useEffect, useState } from 'react';
import Spinner from '../components/Spinner';

type PageProps = {
  slug: string;
  walletAddress: string | null;
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

export const getServerSideProps: GetServerSideProps<PageProps> = async ({ params }) => {
  const slug = params?.page as string;

  try {
    // Make the URL relative instead of using NEXT_PUBLIC_BASE_URL
    const response = await fetch(`${process.env.NODE_ENV === 'development' ? 'http://localhost:3000' : ''}/api/page-mapping?slug=${slug}`);
    const { mapping } = await response.json();

    if (!mapping) {
      return {
        props: {
          slug,
          walletAddress: null,
          error: 'Page not found'
        }
      };
    }

    return {
      props: {
        slug,
        walletAddress: mapping.walletAddress
      }
    };
  } catch (error) {
    console.error('Error fetching page data:', error);
    return {
      props: {
        slug,
        walletAddress: null,
        error: 'Failed to fetch page data'
      }
    };
  }
};

export default function PageView({ slug, walletAddress, error }: PageProps) {
  const [tokens, setTokens] = useState<TokenBalance[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchTokens() {
      if (!walletAddress) return;

      try {
        const response = await fetch(`/api/tokens?address=${walletAddress}`);
        const data = await response.json();
        setTokens(data.tokens.filter(token => token.amount > 0));
      } catch (error) {
        console.error('Error fetching tokens:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchTokens();
  }, [walletAddress]);

  if (error) {
    return (
      <div className="min-h-screen bg-privy-light-blue p-6">
        <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-6">
          <h1 className="text-2xl font-semibold text-red-600">{error}</h1>
          <p className="mt-2 text-gray-600">The page "{slug}" could not be found.</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>{slug} - Token Page</title>
      </Head>

      <div className="min-h-screen bg-privy-light-blue p-6">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h1 className="text-2xl font-semibold mb-4">{slug}</h1>
            
            {isLoading ? (
              <div className="flex justify-center py-12">
                <Spinner className="h-8 w-8" />
              </div>
            ) : tokens.length > 0 ? (
              <div className="space-y-4">
                {tokens.map((token) => (
                  <div 
                    key={token.mint}
                    className="p-4 bg-gray-50 rounded-lg"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium">
                          {token.tokenName || 'Unknown Token'}
                          {token.symbol && (
                            <span className="ml-2 text-sm text-gray-500">
                              ({token.symbol})
                            </span>
                          )}
                        </p>
                      </div>
                      {token.isPumpToken && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-violet-100 text-violet-800">
                          Pump.fun
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mt-2">
                      Balance: {(token.amount / Math.pow(10, token.decimals)).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-600">No tokens found in this wallet.</p>
            )}
          </div>
        </div>
      </div>
    </>
  );
} 
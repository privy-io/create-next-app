import { GetServerSideProps } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { usePrivy } from '@privy-io/react-auth';
import { useEffect, useState } from 'react';
import PageContent from '../components/PageContent';
import { ItemType } from '../types';
import { Button } from '@/components/ui/button';
import { isSolanaWallet } from '@/utils/wallet';

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

interface PageProps {
  pageData: PageData;
  slug: string;
  error?: string;
}

interface AccessStatus {
  isOwner: boolean;
  hasTokenAccess: boolean;
  tokenRequired: boolean;
  gatedLinks: PageItem[];
}

export const getServerSideProps: GetServerSideProps<PageProps> = async ({ params, query }) => {
  const slug = params?.page as string;
  
  try {
    const response = await fetch(`${process.env.NODE_ENV === 'development' ? 'http://localhost:3000' : ''}/api/page-mapping?slug=${slug}`);
    const { mapping } = await response.json();
    
    if (!mapping) {
      throw new Error('Page not found');
    }
    
    return {
      props: {
        slug,
        pageData: mapping,
      },
    };
  } catch (error) {
    return {
      props: {
        slug,
        pageData: {
          walletAddress: '',
          createdAt: new Date().toISOString(),
          slug,
        },
        error: 'Page not found',
      },
    };
  }
};

export default function Page({ pageData }: PageProps) {
  const router = useRouter();
  const { user, authenticated } = usePrivy();
  const [accessStatus, setAccessStatus] = useState<AccessStatus | null>(null);
  
  const solanaWallet = user?.linkedAccounts?.find(isSolanaWallet);

  useEffect(() => {
    async function checkAccess() {
      if (authenticated && solanaWallet) {
        try {
          const response = await fetch('/api/verify-page-access', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              slug: pageData.slug,
              walletAddress: solanaWallet.address,
            }),
          });

          if (response.ok) {
            const data = await response.json();
            setAccessStatus(data);
          }
        } catch (error) {
          console.error('Error checking access:', error);
        }
      }
    }

    checkAccess();
  }, [authenticated, solanaWallet, pageData.slug]);

  return (
    <>
      <Head>
        <title>{pageData?.title || pageData.slug} - Page.fun</title>
        {pageData?.description && (
          <meta name="description" content={pageData.description} />
        )}
        <link 
          rel="stylesheet" 
          href={`/${pageData.designStyle ? `page-${pageData.designStyle}.css` : 'page.css'}`} 
        />
      </Head>
      
      {/* Edit Button for page owner */}
      {accessStatus?.isOwner && (
        <div className="fixed top-4 right-4 z-50">
          <Button
            onClick={() => router.push(`/edit/${pageData.slug}`)}
            className="bg-violet-600 hover:bg-violet-700 text-white"
          >
            Edit Page
          </Button>
        </div>
      )}

      {/* Token Access Warning */}
      {accessStatus?.tokenRequired && !accessStatus?.hasTokenAccess && (
        <div className="fixed top-4 left-4 z-50 bg-amber-100 text-amber-800 px-4 py-2 rounded-lg shadow-sm">
          Some content on this page requires token access
        </div>
      )}

      <PageContent pageData={pageData} />
    </>
  );
} 
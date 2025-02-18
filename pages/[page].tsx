import { GetServerSideProps } from "next";
import Head from "next/head";
import { useEffect } from "react";
import PageContent from "../components/PageContent";
import { PageData, PageItem } from "@/types";
import { themes } from "@/lib/themes";
import { useRouter } from 'next/router';
import { useGlobalContext } from '@/lib/context';
import { Button } from '@/components/ui/button';
import { Pencil } from 'lucide-react';
import { PrivyClient } from "@privy-io/server-auth";
import { Redis } from "@upstash/redis";

interface PageProps {
  pageData: PageData;
  slug: string;
  error?: string;
  isOwner: boolean;
}

const PRIVY_APP_ID = process.env.NEXT_PUBLIC_PRIVY_APP_ID;
const PRIVY_APP_SECRET = process.env.PRIVY_APP_SECRET;
const privyClient = new PrivyClient(PRIVY_APP_ID!, PRIVY_APP_SECRET!);

// Initialize Redis client
const redis = new Redis({
  url: process.env.KV_REST_API_URL!,
  token: process.env.KV_REST_API_TOKEN!,
});

const getRedisKey = (slug: string) => `page:${slug}`;
const getWalletPagesKey = (walletAddress: string) => `wallet:${walletAddress.toLowerCase()}:pages`;

// Helper to generate a visitor ID
function generateVisitorId() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

// Helper to get or create visitor ID
function getVisitorId() {
  if (typeof window === 'undefined') return null;
  
  let visitorId = localStorage.getItem('visitorId');
  if (!visitorId) {
    visitorId = generateVisitorId();
    localStorage.setItem('visitorId', visitorId);
  }
  return visitorId;
}

export const getServerSideProps: GetServerSideProps<PageProps> = async ({
  params,
  req,
}) => {
  const slug = params?.page as string;

  try {
    // Get page data from Redis
    const pageData = await redis.get<PageData>(getRedisKey(slug));

    if (!pageData) {
      return {
        props: {
          slug,
          pageData: {
            walletAddress: "",
            createdAt: new Date().toISOString(),
            slug,
          },
          isOwner: false,
          error: "Page not found",
        },
      };
    }

    // Check ownership if we have an identity token
    let isOwner = false;
    const idToken = req.cookies["privy-id-token"];
    
    if (idToken) {
      try {
        const user = await privyClient.getUser({ idToken });
        
        // Check if the wallet is in user's linked accounts
        let userWallet = null;
        for (const account of user.linkedAccounts) {
          if (account.type === "wallet" && account.chainType === "solana") {
            const walletAccount = account as { address?: string };
            if (walletAccount.address?.toLowerCase() === pageData.walletAddress.toLowerCase()) {
              userWallet = walletAccount;
              break;
            }
          }
        }

        if (userWallet) {
          // Check if the page exists in the user's wallet:id set
          const pagesKey = getWalletPagesKey(userWallet.address!);
          const hasPage = await redis.zscore(pagesKey, slug);
          
          if (hasPage !== null) {
            isOwner = true;
          }
        }
      } catch (error) {
        // Ignore verification errors - just means user doesn't own the page
        console.log("User does not own page:", error);
      }
    }

    // If not owner, remove URLs from token-gated items
    const processedData = { ...pageData };
    if (!isOwner && processedData.items) {
      processedData.items = processedData.items.map((item: PageItem) => {
        if (item.tokenGated) {
          return {
            ...item,
            url: null // Use null for token-gated content
          };
        }
        return item;
      });
    }

    return {
      props: {
        slug,
        pageData: processedData,
        isOwner,
      },
    };
  } catch (error) {
    console.error("Error fetching page data:", error);
    return {
      props: {
        slug,
        pageData: {
          walletAddress: "",
          createdAt: new Date().toISOString(),
          slug,
        },
        isOwner: false,
        error: "Failed to fetch page data",
      },
    };
  }
};

export default function Page({ pageData, slug, error, isOwner }: PageProps) {
  const router = useRouter();
  const currentTheme = pageData.designStyle || 'default';
  const themeStyle = themes[currentTheme].colors;

  // Track page visit
  useEffect(() => {
    const trackVisit = async () => {
      const visitorId = getVisitorId();
      if (!visitorId) return;

      try {
        await fetch('/api/analytics/track-visit', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            slug,
            visitorId,
          }),
        });
      } catch (error) {
        console.error('Failed to track visit:', error);
      }
    };

    trackVisit();
  }, [slug]); // Only run when slug changes

  // Replace placeholders in URLs
  const processedPageData: PageData = {
    ...pageData,
    items: pageData.items?.map(item => ({
      ...item,
      url: item.url?.replace('[token]', pageData.connectedToken || '')
    }))
  };

  if (error) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-6">
          <h1 className="text-2xl font-semibold text-red-600">{error}</h1>
          <p className="mt-2 text-gray-600">
            The page &quot;{slug}&quot; could not be found.
          </p>
          <Button className="mt-4" onClick={() => router.push("/dashboard")}>
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <>
      {isOwner && (
        <Button
          onClick={() => router.push(`/edit/${slug}`)}
          className="fixed top-2 right-2 z-50 gap-2"
        >
          <Pencil className="h-4 w-4" />
          Edit Page
        </Button>
      )}
      
      <Head>
        <title>{processedPageData?.title || slug} - Page.fun</title>
        {processedPageData?.description && (
          <meta name="description" content={processedPageData.description} />
        )}
     
        {(processedPageData.fonts?.global ||
          processedPageData.fonts?.heading ||
          processedPageData.fonts?.paragraph ||
          processedPageData.fonts?.links) && (
          <>
            <link rel="preconnect" href="https://fonts.googleapis.com" />
            <link
              rel="preconnect"
              href="https://fonts.gstatic.com"
              crossOrigin="anonymous"
            />
            {/* Create a single link element for all fonts */}
            {[
              processedPageData.fonts.global,
              processedPageData.fonts.heading,
              processedPageData.fonts.paragraph,
              processedPageData.fonts.links,
            ]
              .filter(Boolean)
              .map((font) => font?.replace(" ", "+"))
              .join("&family=") && (
              <link
                href={`https://fonts.googleapis.com/css2?family=${[
                  processedPageData.fonts.global,
                  processedPageData.fonts.heading,
                  processedPageData.fonts.paragraph,
                  processedPageData.fonts.links,
                ]
                  .filter(Boolean)
                  .map((font) => font?.replace(" ", "+"))
                  .join("&family=")}&display=swap`}
                rel="stylesheet"
              />
            )}
          </>
        )}
      </Head>

      <PageContent 
        pageData={processedPageData} 
        items={processedPageData.items}
        themeStyle={themeStyle}
      />
    </>
  );
}

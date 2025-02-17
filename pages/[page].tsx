import { GetServerSideProps } from "next";
import Head from "next/head";
import PageContent from "../components/PageContent";
import { PageData, PageItem } from "@/types";
import { themes } from "@/lib/themes";
import { useRouter } from 'next/router';
import { useGlobalContext } from '@/lib/context';
import { Button } from '@/components/ui/button';
import { Pencil } from 'lucide-react';

interface PageProps {
  pageData: PageData;
  slug: string;
  error?: string;
}

export const getServerSideProps: GetServerSideProps<PageProps> = async ({
  params,
  req,
}) => {
  const slug = params?.page as string;

  try {
    const response = await fetch(
      `${
        process.env.NODE_ENV === "development" ? "http://localhost:3000" : ""
      }/api/page-store?slug=${slug}`,
    );
    const { mapping, isOwner } = await response.json();

    if (!mapping) {
      throw new Error("Page not found");
    }

    // If we're not the owner, remove URLs from token-gated items
    if (!isOwner && mapping.items) {
      mapping.items = mapping.items.map((item: PageItem) => {
        if (item.tokenGated) {
          return {
            ...item,
            url: null // Use null instead of undefined for serialization
          };
        }
        return item;
      });
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
          walletAddress: "",
          createdAt: new Date().toISOString(),
          slug,
        },
        error: "Page not found",
      },
    };
  }
};

export default function Page({ pageData, slug, error }: PageProps) {
  const router = useRouter();
  const { walletAddress, isAuthenticated } = useGlobalContext();
  const isOwner = isAuthenticated && walletAddress?.toLowerCase() === pageData?.walletAddress?.toLowerCase();

  const currentTheme = pageData.designStyle || 'default';
  const themeStyle = themes[currentTheme].colors;

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
      <div>Error: {error}</div>
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

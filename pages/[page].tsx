import { GetServerSideProps } from "next";
import Head from "next/head";
import { useRouter } from "next/router";
import { usePrivy } from "@privy-io/react-auth";
import { useEffect, useState } from "react";
import PageContent from "../components/PageContent";
import { ItemType } from "../types";
import { Button } from "@/components/ui/button";
import { isSolanaWallet } from "@/utils/wallet";
import AppMenu from "@/components/AppMenu";

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

export const getServerSideProps: GetServerSideProps<PageProps> = async ({
  params,
}) => {
  const slug = params?.page as string;

  try {
    const response = await fetch(
      `${
        process.env.NODE_ENV === "development" ? "http://localhost:3000" : ""
      }/api/page-store?slug=${slug}`,
    );
    const { mapping } = await response.json();

    if (!mapping) {
      throw new Error("Page not found");
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

export default function Page({ pageData }: PageProps) {
  const router = useRouter();
  const { user, authenticated } = usePrivy();
  const [accessStatus, setAccessStatus] = useState<AccessStatus | null>(null);

  const solanaWallet = user?.linkedAccounts?.find(isSolanaWallet);

  useEffect(() => {
    async function checkAccess() {
      if (authenticated && solanaWallet) {
        try {
          const response = await fetch("/api/verify-page-access", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
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
          console.error("Error checking access:", error);
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
        <link rel="stylesheet" href="/base.css" />
        <link
          rel="stylesheet"
          href={`/${
            pageData.designStyle
              ? `page-${pageData.designStyle}.css`
              : "page.css"
          }`}
        />
        {(pageData.fonts?.global ||
          pageData.fonts?.heading ||
          pageData.fonts?.paragraph ||
          pageData.fonts?.links) && (
          <>
            <link rel="preconnect" href="https://fonts.googleapis.com" />
            <link
              rel="preconnect"
              href="https://fonts.gstatic.com"
              crossOrigin="anonymous"
            />
            <link
              href={`https://fonts.googleapis.com/css2?family=${[
                pageData.fonts.global,
                pageData.fonts.heading,
                pageData.fonts.paragraph,
                pageData.fonts.links,
              ]
                .filter(Boolean)
                .map((font) => font?.replace(" ", "+"))
                .join("&family=")}&display=swap`}
              rel="stylesheet"
            />
            <style>{`
              ${
                pageData.fonts?.global
                  ? `.pf-page { font-family: '${pageData.fonts.global}', sans-serif; }`
                  : ""
              }
              ${
                pageData.fonts?.heading
                  ? `.pf-page__title { font-family: '${pageData.fonts.heading}', sans-serif; }`
                  : ""
              }
              ${
                pageData.fonts?.paragraph
                  ? `.pf-page__description { font-family: '${pageData.fonts.paragraph}', sans-serif; }`
                  : ""
              }
              ${
                pageData.fonts?.links
                  ? `.pf-link-item { font-family: '${pageData.fonts.links}', sans-serif; }`
                  : ""
              }
            `}</style>
          </>
        )}
      </Head>

      <div className="fixed top-2 left-2 z-50">
        <AppMenu />
      </div>

      <PageContent pageData={pageData} />
    </>
  );
}

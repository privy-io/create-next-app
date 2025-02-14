import { GetServerSideProps } from "next";
import Head from "next/head";
import PageContent from "../components/PageContent";
import { PageData, PageItem } from "@/types";
import { LinkType } from "@/lib/links";
import AppMenu from "@/components/AppMenu";
import { themes } from "@/lib/themes";

interface PageProps {
  pageData: PageData;
  slug: string;
  error?: string;
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
  const currentTheme = pageData.designStyle || 'default';
  const themeStyle = themes[currentTheme].colors;

  return (
    <>
      <Head>
        <title>{pageData?.title || pageData.slug} - Page.fun</title>
        {pageData?.description && (
          <meta name="description" content={pageData.description} />
        )}
     
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
          </>
        )}
      </Head>

      <div className="fixed top-2 left-2 z-50">
        <AppMenu />
      </div>

      <PageContent 
        pageData={pageData} 
        items={pageData.items}
        themeStyle={themeStyle}
        isPreview={true}
      />
    </>
  );
}

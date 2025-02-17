import { GetServerSideProps } from "next";
import Head from "next/head";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { usePrivy } from "@privy-io/react-auth";
import { PrivyClient } from "@privy-io/server-auth";
import { Button } from "@/components/ui/button";
import { Drawer, DrawerContent } from "@/components/ui/drawer";
import { useToast } from "@/hooks/use-toast";
import { Toaster } from "@/components/ui/toaster";
import { isSolanaWallet } from "@/utils/wallet";
import { GOOGLE_FONTS } from "@/lib/fonts";
import { PageData, PageItem } from "@/types";
import { validateLinkUrl } from "@/lib/links";
import { LINK_PRESETS } from "@/lib/linkPresets";
import EditPageContent from "@/components/EditPageContent";
import { ActionBar } from "@/components/ActionBar";
import { LinkSettingsDrawer } from "@/components/LinkSettingsDrawer";
import { LinksDrawer } from "@/components/drawers/LinksDrawer";
import { SettingsDrawer } from "@/components/drawers/SettingsDrawer";

interface PageProps {
  slug: string;
  pageData: PageData | null;
  error?: string;
}

const PRIVY_APP_ID = process.env.NEXT_PUBLIC_PRIVY_APP_ID;
const PRIVY_APP_SECRET = process.env.PRIVY_APP_SECRET;
const privyClient = new PrivyClient(PRIVY_APP_ID!, PRIVY_APP_SECRET!);

export const getServerSideProps: GetServerSideProps<PageProps> = async ({
  params,
  req,
}) => {
  const slug = params?.page as string;

  try {
    // First get the page data
    const pageResponse = await fetch(
      `${
        process.env.NODE_ENV === "development" ? "http://localhost:3000" : ""
      }/api/page-store?slug=${slug}`
    );
    const { mapping } = await pageResponse.json();

    if (!mapping) {
      return {
        props: {
          slug,
          pageData: null,
          error: "Page not found",
        },
      };
    }

    // Check authentication and ownership
    const idToken = req.cookies["privy-id-token"];
    if (!idToken) {
      return {
        redirect: {
          destination: `/${slug}`,
          permanent: false,
        },
      };
    }

    try {
      const user = await privyClient.getUser({ idToken });

      // Check if the wallet is in user's linked accounts
      const hasWallet = user.linkedAccounts.some((account) => {
        if (account.type === "wallet" && account.chainType === "solana") {
          const walletAccount = account as { address?: string };
          return (
            walletAccount.address?.toLowerCase() ===
            mapping.walletAddress.toLowerCase()
          );
        }
        return false;
      });

      if (!hasWallet) {
        return {
          redirect: {
            destination: `/${slug}`,
            permanent: false,
          },
        };
      }
    } catch (error) {
      console.error("Auth verification error:", error);
      return {
        redirect: {
          destination: `/${slug}`,
          permanent: false,
        },
      };
    }

    return {
      props: {
        slug,
        pageData: mapping,
      },
    };
  } catch (error) {
    console.error("Error fetching page data:", error);
    return {
      props: {
        slug,
        pageData: null,
        error: "Failed to fetch page data",
      },
    };
  }
};

export default function EditPage({ slug, pageData, error }: PageProps) {
  const router = useRouter();
  const { authenticated, user, linkWallet } = usePrivy();
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const [pageDetails, setPageDetails] = useState<PageData | null>(null);
  const [previewData, setPreviewData] = useState<PageData | null>(null);
  const [validationErrors, setValidationErrors] = useState<{
    [key: string]: string;
  }>({});
  const [settingsDrawerOpen, setSettingsDrawerOpen] = useState(false);
  const [linkSettingsDrawerOpen, setLinkSettingsDrawerOpen] = useState(false);
  const [selectedLinkId, setSelectedLinkId] = useState<string | null>(null);
  const [linksDrawerOpen, setLinksDrawerOpen] = useState(false);

  // Handle ESC key to close drawer
  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setSettingsDrawerOpen(false);
        setLinkSettingsDrawerOpen(false);
      }
    };
    window.addEventListener("keydown", handleEsc);

    return () => {
      window.removeEventListener("keydown", handleEsc);
    };
  }, []);

  // Check ownership and redirect if not owner
  useEffect(() => {
    if (pageData && authenticated) {
      const solanaWallet = user?.linkedAccounts?.find(isSolanaWallet);
      const isOwner =
        solanaWallet?.address?.toLowerCase() ===
        pageData.walletAddress?.toLowerCase();

      if (!isOwner) {
        router.replace(`/${slug}`);
      }
    }
  }, [pageData, authenticated, user, slug, router]);

  // Initialize state after component mounts to prevent hydration mismatch
  useEffect(() => {
    if (pageData) {
      const fonts = {
        global: pageData.fonts?.global || undefined,
        heading: pageData.fonts?.heading || undefined,
        paragraph: pageData.fonts?.paragraph || undefined,
        links: pageData.fonts?.links || undefined,
      };

      const initialPageData: PageData = {
        ...pageData,
        fonts,
      };

      setPageDetails(initialPageData);
      setPreviewData(initialPageData);
    }
  }, [pageData]);

  // Update preview data whenever pageDetails changes
  useEffect(() => {
    if (pageDetails) {
      setPreviewData({
        ...pageDetails,
        fonts: {
          ...pageDetails.fonts,
        },
      });
    }
  }, [pageDetails]);

  const validateLinks = (items: PageItem[] = []): { [key: string]: string } => {
    const errors: { [key: string]: string } = {};

    items.forEach((item) => {
      if (!item.presetId) {
        return;
      }

      const preset = LINK_PRESETS[item.presetId];
      if (!preset) {
        return;
      }

      // Skip validation for plugins
      if (item.isPlugin) {
        return;
      }

      // If URL is required but not provided
      if (preset.options?.requiresUrl && !item.url) {
        errors[item.id] = "URL is required";
        return;
      }

      // If URL is provided, validate it
      if (item.url) {
        const isValid = validateLinkUrl(item.url, item.presetId);
        if (!isValid) {
          errors[item.id] = `Invalid ${preset.title} URL format`;
        }
      }
    });

    return errors;
  };

  const handleSavePageDetails = async () => {
    if (!pageDetails) return;

    if (!authenticated) {
      toast({
        title: "Authentication required",
        description: "Please connect your wallet to save changes.",
        variant: "destructive",
      });
      return;
    }

    const solanaWallet = user?.linkedAccounts?.find(isSolanaWallet);
    if (!solanaWallet || solanaWallet.address !== pageDetails.walletAddress) {
      toast({
        title: "Unauthorized",
        description: "You don't have permission to edit this page.",
        variant: "destructive",
      });
      return;
    }

    // Add detailed logging before validation
    console.log("About to validate items:", {
      items: pageDetails.items?.map((item) => ({
        id: item.id,
        presetId: item.presetId,
        url: item.url,
        title: item.title,
        isPlugin: item.isPlugin,
      })),
    });

    // Validate links before saving
    const validationErrors = validateLinks(pageDetails.items);
    if (Object.keys(validationErrors).length > 0) {
      console.log("Validation errors found:", {
        errors: validationErrors,
        items: pageDetails.items?.map((item) => ({
          id: item.id,
          presetId: item.presetId,
          title: item.title,
          url: item.url,
          isPlugin: item.isPlugin,
        })),
      });

      setValidationErrors(validationErrors);
      toast({
        title: "Validation Error",
        description:
          "Please fix the highlighted errors in your links before saving.",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    try {
      // Log the original items
      console.log("Original items:", pageDetails.items);

      const items = pageDetails.items?.map((item, index) => {
        const mappedItem = {
          id: item.id || `item-${index}`,
          presetId: item.presetId,
          title: item.title || "",
          url: item.url || "",
          order: index,
          isPlugin: !!item.isPlugin,
          tokenGated: !!item.tokenGated,
          requiredTokens: item.requiredTokens || [],
        };

        // Log each mapped item
        console.log(`Mapped item ${index}:`, {
          original: item,
          mapped: mappedItem,
        });

        return mappedItem;
      });

      // Add detailed logging for the actual save request
      const savePayload = {
        slug,
        walletAddress: pageDetails.walletAddress,
        connectedToken: pageDetails.connectedToken,
        tokenSymbol: pageDetails.tokenSymbol,
        title: pageDetails.title,
        description: pageDetails.description,
        image: pageDetails.image,
        designStyle: pageDetails.designStyle,
        fonts: pageDetails.fonts,
        items: items?.filter((item) => item.presetId), // Only include items with a valid presetId
      };
      console.log(
        "Sending save request with payload:",
        JSON.stringify(savePayload, null, 2)
      );

      const response = await fetch("/api/page-store", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(savePayload),
        credentials: "same-origin",
      });

      const data = await response.json();
      console.log("Save response:", data);

      if (!response.ok) {
        console.error("Save error details:", data);
        if (data.details) {
          // Log the full validation error details
          console.error("Validation error details:", data.details);
          throw new Error(
            `Validation error: ${JSON.stringify(data.details, null, 2)}`
          );
        }
        throw new Error(data.error || "Failed to save changes");
      }

      toast({
        title: "Changes saved",
        description: "Your page has been updated successfully.",
      });
    } catch (error) {
      console.error("Error saving page:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to save changes",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddLink = () => {
    setLinksDrawerOpen(true);
  };

  const handleLinkClick = (itemId: string) => {
    setSelectedLinkId(itemId);
    setLinkSettingsDrawerOpen(true);
  };

  const handleItemsReorder = (newItems: PageItem[]) => {
    setPageDetails((prev) => (prev ? { ...prev, items: newItems } : null));
  };

  const selectedLink = selectedLinkId
    ? pageDetails?.items?.find((item) => item.id === selectedLinkId)
    : undefined;

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

  // Check if user has permission to edit
  const solanaWallet = user?.linkedAccounts?.find(isSolanaWallet);
  const canEdit =
    authenticated && solanaWallet?.address === pageDetails?.walletAddress;

  return (
    <>
      <Head>
        <title>Edit {pageDetails?.title || slug} - Page.fun</title>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        {/* Create a single link element for all fonts */}
        {GOOGLE_FONTS.length > 0 && (
          <link
            href={`https://fonts.googleapis.com/css2?family=${GOOGLE_FONTS.map(
              (font) => font.replace(" ", "+")
            ).join("&family=")}&display=swap`}
            rel="stylesheet"
          />
        )}
      </Head>

      <main className="min-h-screen">
        <ActionBar
          isSaving={isSaving}
          onSave={handleSavePageDetails}
          onSettingsClick={() => setSettingsDrawerOpen(true)}
          onLinksClick={() => setLinksDrawerOpen(true)}
        />

        {/* Main content */}
        {previewData && (
          <EditPageContent
            pageData={previewData}
            onLinkClick={handleLinkClick}
            onTitleClick={() => setSettingsDrawerOpen(true)}
            onDescriptionClick={() => setSettingsDrawerOpen(true)}
            onItemsReorder={handleItemsReorder}
            validationErrors={validationErrors}
            onAddLinkClick={handleAddLink}
          />
        )}

        {/* Settings Drawer */}
        <SettingsDrawer
          open={settingsDrawerOpen}
          onOpenChange={setSettingsDrawerOpen}
          pageDetails={pageDetails}
          setPageDetails={setPageDetails}
        />

        {/* Links Drawer */}
        <LinksDrawer
          pageDetails={pageDetails}
          setPageDetails={setPageDetails}
          open={linksDrawerOpen}
          onOpenChange={setLinksDrawerOpen}
          onLinkAdd={(linkId) => {
            setLinksDrawerOpen(false);
          }}
        />

        {/* Link Settings Drawer */}
        <Drawer open={linkSettingsDrawerOpen} onOpenChange={setLinkSettingsDrawerOpen}>
          <DrawerContent className="max-h-[95vh]">
            <LinkSettingsDrawer
              item={selectedLink}
              error={selectedLinkId ? validationErrors[selectedLinkId] : undefined}
              tokenSymbol={pageDetails?.tokenSymbol || undefined}
              setPageDetails={setPageDetails}
              onDelete={() => {
                if (!selectedLinkId) return;
                
                const newErrors = { ...validationErrors };
                delete newErrors[selectedLinkId];
                setValidationErrors(newErrors);

                setPageDetails((prev) => ({
                  ...prev!,
                  items: prev!.items!.filter((i) => i.id !== selectedLinkId),
                }));
                setLinkSettingsDrawerOpen(false);
              }}
              onUrlChange={(url) => {
                if (!selectedLinkId) return;

                setPageDetails((prev) => {
                  if (!prev?.items) return prev;

                  const updatedItems = prev.items.map((i) =>
                    i.id === selectedLinkId ? { ...i, url } : i
                  );

                  return {
                    ...prev,
                    items: updatedItems,
                  };
                });
              }}
              onValidationChange={(itemId, error) => {
                setValidationErrors((prev) => {
                  const newErrors = { ...prev };
                  if (error) {
                    newErrors[itemId] = error;
                  } else {
                    delete newErrors[itemId];
                  }
                  return newErrors;
                });
              }}
            />
          </DrawerContent>
        </Drawer>
      </main>

      <Toaster />
    </>
  );
}

import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import Spinner from "./Spinner";
import { useRouter } from "next/router";
import TokenSelector from "./TokenSelector";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Card } from "./ui/card";

interface CreatePageModalProps {
  walletAddress: string;
  onClose: () => void;
  open: boolean;
}

export default function CreatePageModal({
  walletAddress,
  onClose,
  open,
}: CreatePageModalProps) {
  const router = useRouter();
  const [slug, setSlug] = useState("");
  const [isCheckingSlug, setIsCheckingSlug] = useState(false);
  const [slugError, setSlugError] = useState("");
  const [selectedToken, setSelectedToken] = useState<string | null>(null);
  const [tokenMetadata, setTokenMetadata] = useState<any>(null);

  const checkSlug = async () => {
    if (!slug) {
      setSlugError("Please enter a custom URL");
      return false;
    }

    setIsCheckingSlug(true);
    try {
      const checkResponse = await fetch(
        `/api/page-store?slug=${encodeURIComponent(slug)}`
      );
      const checkData = await checkResponse.json();

      if (checkData.mapping) {
        // If user owns this page, redirect to edit
        if (checkData.isOwner) {
          router.push(`/edit/${slug}`);
          return false;
        }
        setSlugError("This URL is already taken");
        return false;
      }
      return true;
    } catch (error) {
      console.error("Error:", error);
      setSlugError("An error occurred. Please try again.");
      return false;
    } finally {
      setIsCheckingSlug(false);
    }
  };

  const handleSubmit = async () => {
    const isAvailable = await checkSlug();
    if (!isAvailable) return;

    setIsCheckingSlug(true);
    try {
      const response = await fetch("/api/page-store", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          slug,
          walletAddress,
          isSetupWizard: false,
          createdAt: new Date().toISOString(),
          items: [],
          title: tokenMetadata?.name || "My Page",
          description: tokenMetadata?.description || "A page for my community",
          image: tokenMetadata?.image || null,
          designStyle: "modern",
          connectedToken: selectedToken,
          tokenSymbol: tokenMetadata?.symbol,
          fonts: {
            global: "Inter",
            heading: "inherit",
            paragraph: "inherit",
            links: "inherit",
          },
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        setSlugError(error.error || "Failed to save custom URL");
        return;
      }

      // Close modal before redirecting
      onClose();

      // Redirect to edit page
      router.push(`/edit/${slug}`);
    } catch (error) {
      console.error("Error:", error);
      setSlugError("An error occurred. Please try again.");
    } finally {
      setIsCheckingSlug(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Create Your Page</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <span className="text-gray-500">page.fun/</span>
                <Input
                  type="text"
                  value={slug}
                  onChange={(e) => {
                    setSlug(e.target.value);
                    setSlugError("");
                  }}
                  placeholder="your-custom-url"
                  pattern="^[a-zA-Z0-9-]+$"
                  title="Only letters, numbers, and hyphens allowed"
                  required
                />
              </div>
              {slugError && <p className="text-sm text-red-500">{slugError}</p>}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Connect a Token (Optional)
            </label>
            <TokenSelector
              walletAddress={walletAddress}
              selectedToken={selectedToken}
              onTokenSelect={(tokenAddress) => {
                setSelectedToken(tokenAddress || null);
                if (!tokenAddress) {
                  setTokenMetadata(null);
                }
              }}
              onMetadataLoad={setTokenMetadata}
            />
          </div>

          {tokenMetadata && (
            <div className="flex gap-5 items-start">
              <div className="space-y-2 flex-1 order-2">
                <div>
                  <label className="block text-xs text-gray-500">Title</label>
                  <p className="text-sm font-medium">
                    {tokenMetadata.name || "My Page"}
                  </p>
                </div>
                <div>
                  <label className="block text-xs text-gray-500">
                    Description
                  </label>
                  <p className="text-sm text-gray-700 line-clamp-3">
                    {tokenMetadata.description || "A page for my community"}
                  </p>
                </div>
                {tokenMetadata.symbol && (
                  <div>
                    <label className="block text-xs text-gray-500">
                      Token Symbol
                    </label>
                    <p className="text-sm font-medium">
                      {tokenMetadata.symbol}
                    </p>
                  </div>
                )}
              </div>
              {tokenMetadata.image && (
                <img
                  src={tokenMetadata.image}
                  alt={tokenMetadata.name}
                  className="object-cover w-24 h-24 shadow"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = "none";
                  }}
                />
              )}
            </div>
          )}

          <div className="flex justify-end pt-4">
            <Button onClick={handleSubmit} disabled={isCheckingSlug || !slug}>
              {isCheckingSlug ? (
                <>
                  <Spinner className="h-4 w-4 mr-2" />
                  Creating...
                </>
              ) : (
                "Create Page"
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

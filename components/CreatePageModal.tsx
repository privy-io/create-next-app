import { useState, useEffect, useCallback } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import Spinner from "./Spinner";
import { useRouter } from "next/router";
import TokenSelector from "./TokenSelector";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Card } from "./ui/card";
import debounce from "lodash/debounce";

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
  const [isSlugValid, setIsSlugValid] = useState(false);
  const [selectedToken, setSelectedToken] = useState<string | null>(null);
  const [tokenMetadata, setTokenMetadata] = useState<any>(null);

  const checkSlug = async (value: string, shouldRedirect = false) => {
    if (!value) {
      setSlugError("Please enter a custom URL");
      setIsSlugValid(false);
      return false;
    }

    setIsCheckingSlug(true);
    try {
      const checkResponse = await fetch(
        `/api/page-store?slug=${encodeURIComponent(value)}`
      );
      const checkData = await checkResponse.json();

      if (checkData.mapping) {
        // If user owns this page, only redirect if explicitly requested
        if (checkData.isOwner) {
          if (shouldRedirect) {
            router.push(`/edit/${value}`);
          }
          setSlugError("You already own this page");
          setIsSlugValid(false);
          return false;
        }
        setSlugError("This URL is already taken");
        setIsSlugValid(false);
        return false;
      }
      setSlugError("");
      setIsSlugValid(true);
      return true;
    } catch (error) {
      console.error("Error:", error);
      setSlugError("An error occurred. Please try again.");
      setIsSlugValid(false);
      return false;
    } finally {
      setIsCheckingSlug(false);
    }
  };

  // Debounced version of checkSlug that never redirects
  const debouncedCheckSlug = useCallback(
    debounce((value: string) => checkSlug(value, false), 300),
    []
  );

  // Check slug on input change
  useEffect(() => {
    if (slug) {
      debouncedCheckSlug(slug);
    } else {
      setSlugError("");
      setIsSlugValid(false);
    }
  }, [slug]);

  const handleBlur = () => {
    if (slug) {
      checkSlug(slug, false);
    }
  };

  const handleSubmit = async () => {
    const isAvailable = await checkSlug(slug, true);
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
          createdAt: new Date().toISOString(),
          items: [],
          title: tokenMetadata?.name || "My Page",
          description: tokenMetadata?.description || "A page for my community",
          image: tokenMetadata?.image || null,
          designStyle: "default",
          connectedToken: selectedToken,
          tokenSymbol: tokenMetadata?.symbol
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
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Connect a Token
            </label>
            <TokenSelector
              walletAddress={walletAddress}
              selectedToken={selectedToken}
              onTokenSelect={(tokenAddress) => {
                setSelectedToken(tokenAddress || null);
                if (!tokenAddress) {
                  setTokenMetadata(null);
                  setSlug("");
                }
              }}
              onMetadataLoad={(metadata) => {
                setTokenMetadata(metadata);
                // Always suggest the token symbol as the slug when metadata changes
                if (metadata?.symbol) {
                  const suggestedSlug = metadata.symbol.toLowerCase();
                  setSlug(suggestedSlug);
                  // Check availability of the suggested slug
                  debouncedCheckSlug(suggestedSlug);
                }
              }}
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

          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <span className="text-gray-500">page.fun/</span>
                <Input
                  type="text"
                  value={slug}
                  onChange={(e) => {
                    const lowercaseValue = e.target.value.toLowerCase();
                    setSlug(lowercaseValue);
                    setSlugError("");
                    setIsSlugValid(false);
                  }}
                  onBlur={handleBlur}
                  placeholder={tokenMetadata?.symbol ? tokenMetadata.symbol.toLowerCase() : "your-custom-url"}
                  pattern="^[a-zA-Z0-9-]+$"
                  title="Only letters, numbers, and hyphens allowed"
                  required
                  className="lowercase"
                />
              </div>
              {slugError && <p className="text-sm text-red-500">{slugError}</p>}
              {isCheckingSlug && <p className="text-sm text-gray-500">Checking availability...</p>}
              {isSlugValid && <p className="text-sm text-green-500">URL is available!</p>}
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <Button 
              onClick={handleSubmit} 
              disabled={isCheckingSlug || !slug || !isSlugValid}
            >
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

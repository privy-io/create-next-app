import { useState, useEffect, useCallback } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import Loader from "./ui/loader";
import { useRouter } from "next/router";
import Link from "next/link";
import TokenSelector from "./TokenSelector";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Card } from "./ui/card";
import debounce from "lodash/debounce";
import { useGlobalContext } from "@/lib/context";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";

type PageType = "personal" | "meme" | "ai-bot";
type Step = "type" | "details";

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
  const { toast } = useToast();
  const { userPages, hasPageTokenAccess } = useGlobalContext();
  const [step, setStep] = useState<Step>("type");
  const [pageType, setPageType] = useState<PageType | null>(null);
  const [slug, setSlug] = useState("");
  const [isCheckingSlug, setIsCheckingSlug] = useState(false);
  const [slugError, setSlugError] = useState("");
  const [isSlugValid, setIsSlugValid] = useState(false);
  const [selectedToken, setSelectedToken] = useState<string | null>(null);
  const [tokenMetadata, setTokenMetadata] = useState<any>(null);

  // Check if user can create more pages
  const canCreatePage = hasPageTokenAccess || userPages.length === 0;

  useEffect(() => {
    if (!canCreatePage) {
      toast({
        title: "Page limit reached",
        description:
          "You need to hold at least 10,000 PAGE.FUN tokens to create more than one page",
        variant: "destructive",
      });
      onClose();
    }
  }, [canCreatePage, onClose]);

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

  const handlePageTypeSelect = (type: PageType) => {
    setPageType(type);
    setStep("details");
  };

  const fadeVariants = {
    enter: {
      opacity: 0,
      scale: 0.98
    },
    center: {
      opacity: 1,
      scale: 1
    },
    exit: {
      opacity: 0,
      scale: 1.02
    }
  };

  // Add this new variant for the container
  const containerVariants = {
    initial: {
      opacity: 1
    },
    animate: {
      opacity: 1,
      transition: {
        duration: 0.15,
        ease: "easeOut"
      }
    },
    exit: {
      opacity: 1,
      transition: {
        duration: 0.15,
        ease: "easeIn"
      }
    }
  };

  const renderPageTypeSelection = () => (
    <div className="space-y-6">
      <div className="grid gap-4">
        <Card
          hasHover
          className="p-4"
          onClick={() => handlePageTypeSelect("meme")}>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-pink-100 rounded-lg">
              <svg
                className="w-5 h-5 text-pink-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div>
              <h4 className="font-medium">Meme</h4>
              <p className="text-sm text-gray-500">
                Perfect for meme tokens and communities. Token gate links and
                more to reward holders.
              </p>
            </div>
          </div>
        </Card>

        <Card
          hasHover
          className="p-4"
          onClick={() => handlePageTypeSelect("ai-bot")}>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <svg
                className="w-5 h-5 text-purple-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
            </div>
            <div>
              <h4 className="font-medium">AI Bot</h4>
              <p className="text-sm text-gray-500">
                Create a page for AI bots. Add a token to connect your bot.
              </p>
            </div>
          </div>
        </Card>

        <Card
          hasHover
          className="p-4"
          onClick={() => handlePageTypeSelect("personal")}>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <svg
                className="w-5 h-5 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
            </div>
            <div>
              <h4 className="font-medium">Personal</h4>
              <p className="text-sm text-gray-500">
                Create a personal landing page for yourself.
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );

  const handleSubmit = async () => {
    if (!canCreatePage) {
      toast({
        title: "Page limit reached",
        description:
          "You need to hold at least 10,000 PAGE.FUN tokens to create more than one page",
        variant: "destructive",
      });
      return;
    }

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
          tokenSymbol: tokenMetadata?.symbol,
          pageType,
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

  if (!canCreatePage) {
    return null;
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen: boolean) => !isOpen && onClose()}>
      <DialogContent className="max-w-md overflow-hidden">
        <DialogHeader className="flex-row items-center gap-2">
          {step === "details" && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setStep("type")}
              className="h-8 w-8 p-0">
              <span className="sr-only">Back</span>
              <svg
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </Button>
          )}
          <DialogTitle>
            {step === "type"
              ? "Create New Page"
              : pageType === "personal"
              ? "Create Personal Page"
              : pageType === "meme"
              ? "Create Meme Page"
              : "Create AI Bot Page"}
          </DialogTitle>
        </DialogHeader>

        {userPages.length > 0 && !hasPageTokenAccess && (
          <p className="text-sm text-amber-600 mt-2">
            Note: You need to hold at least 10,000 PAGE.FUN tokens to create
            more than one page
          </p>
        )}

        <motion.div
          layout
          initial="initial"
          animate="animate"
          exit="exit"
          variants={containerVariants}
          className="relative"
          transition={{
            layout: {
              duration: 0.15,
              ease: "easeInOut"
            }
          }}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              variants={fadeVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{
                opacity: { duration: 0.08 },
                scale: { duration: 0.08 }
              }}
            >
              {step === "type" ? (
                renderPageTypeSelection()
              ) : (
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
                        if (metadata?.symbol) {
                          const suggestedSlug = metadata.symbol.toLowerCase();
                          setSlug(suggestedSlug);
                          debouncedCheckSlug(suggestedSlug);
                        }
                      }}
                    />
                  </div>

                  {tokenMetadata && (
                    <div className="flex gap-5 items-start">
                      <div className="space-y-2 flex-1 order-2">
                        <div>
                          <label className="block text-xs text-gray-500">
                            Title
                          </label>
                          <p className="text-sm font-medium">
                            {tokenMetadata.name || "My Page"}
                          </p>
                        </div>
                        <div>
                          <label className="block text-xs text-gray-500">
                            Description
                          </label>
                          <p className="text-sm text-gray-700 line-clamp-3">
                            {tokenMetadata.description ||
                              "A page for my community"}
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
                          placeholder={
                            tokenMetadata?.symbol
                              ? tokenMetadata.symbol.toLowerCase()
                              : "your-custom-url"
                          }
                          pattern="^[a-zA-Z0-9-]+$"
                          title="Only letters, numbers, and hyphens allowed"
                          required
                          className="lowercase"
                        />
                      </div>
                      {slugError && (
                        <div className="flex items-center gap-2">
                          <p className="text-sm text-red-500">{slugError}</p>
                          {slugError === "You already own this page" && (
                            <Link
                              href={`/edit/${slug}`}
                              className="text-sm text-blue-500 hover:underline">
                              View page →
                            </Link>
                          )}
                        </div>
                      )}
                      {isCheckingSlug && (
                        <p className="text-sm text-gray-500">
                          Checking availability...
                        </p>
                      )}
                      {isSlugValid && (
                        <p className="text-sm text-green-500">
                          URL is available!
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex justify-end pt-4">
                    <Button
                      onClick={handleSubmit}
                      disabled={isCheckingSlug || !slug || !isSlugValid}>
                      {isCheckingSlug ? (
                        <>
                          <Loader className="h-4 w-4 mr-2" />
                          Creating...
                        </>
                      ) : (
                        "Create Page"
                      )}
                    </Button>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}

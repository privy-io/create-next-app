import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import Spinner from "./Spinner";
import { useRouter } from "next/router";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Twitter,
  MessageCircle,
  BarChart3,
  Video,
  Instagram,
  Mail,
  MessageSquare,
  Terminal,
  MessageSquareMore,
} from "lucide-react";
import TokenSelector from "./TokenSelector";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { LINK_CONFIGS, LinkType } from '@/lib/links';

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
  const [step, setStep] = useState(1);
  const [slug, setSlug] = useState("");
  const [isCheckingSlug, setIsCheckingSlug] = useState(false);
  const [slugError, setSlugError] = useState("");
  const [title, setTitle] = useState("My Page");
  const [description, setDescription] = useState("A page for my community");
  const [selectedLinks, setSelectedLinks] = useState<LinkType[]>([]);
  const [selectedToken, setSelectedToken] = useState<string | null>(null);
  const [tokenMetadata, setTokenMetadata] = useState<any>(null);
  const [image, setImage] = useState<string | null>(null);

  const checkSlug = async () => {
    if (!slug) {
      setSlugError("Please enter a custom URL");
      return false;
    }

    setIsCheckingSlug(true);
    try {
      const checkResponse = await fetch(
        `/api/page-store?slug=${encodeURIComponent(slug)}`,
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

  const handleNext = async () => {
    if (step === 1) {
      const isAvailable = await checkSlug();
      if (!isAvailable) return;
    }

    if (step === 3) {
      handleSubmit();
      return;
    }

    setStep(step + 1);
  };

  const handleSubmit = async () => {
    setIsCheckingSlug(true);
    try {
      // Create items array for links
      const items = selectedLinks.map((linkType, index) => ({
        id: `${linkType}-1`,
        type: linkType,
        url: "",
        order: index,
        isPlugin: false,
      }));

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
          items,
          title,
          description,
          image,
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

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
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
        );

      case 2:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Connect a Token (Optional)
              </label>
              <TokenSelector
                walletAddress={walletAddress}
                selectedToken={selectedToken}
                onTokenSelect={(tokenAddress) => {
                  if (!tokenAddress) {
                    setSelectedToken(null);
                    setTokenMetadata(null);
                    setImage(null);
                    return;
                  }
                  setSelectedToken(tokenAddress);
                }}
                onMetadataLoad={(metadata) => {
                  if (!metadata) {
                    setTokenMetadata(null);
                    setImage(null);
                    return;
                  }
                  setTokenMetadata(metadata);
                  // Update title and description with token metadata
                  setTitle(metadata.name);
                  if (metadata.description) {
                    setDescription(metadata.description);
                  }
                  if (metadata.image) {
                    setImage(metadata.image);
                  }
                }}
              />
            </div>

            {selectedToken && tokenMetadata && (
              <div>
                {image && (
                  <div className="relative w-24 h-24 rounded-lg overflow-hidden">
                    <img
                      src={image}
                      alt={tokenMetadata.name}
                      className="object-cover w-full h-full"
                      onError={(e) => {
                        // Hide image on error
                        (e.target as HTMLImageElement).style.display = "none";
                      }}
                    />
                  </div>
                )}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title
                </label>
                <Input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter page title"
                  maxLength={100}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Enter page description"
                  className="w-full p-2 border rounded-md"
                  rows={3}
                  maxLength={500}
                />
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-2">
              {Object.entries(LINK_CONFIGS).map(([type, config]) => (
                <Card
                  key={type}
                  className={`p-3 cursor-pointer transition-colors ${
                    selectedLinks.includes(type as LinkType)
                      ? "bg-violet-50 border-violet-500"
                      : "hover:border-violet-300"
                  }`}
                >
                  <div className="flex items-center space-x-4">
                    <Checkbox
                      checked={selectedLinks.includes(type as LinkType)}
                      onCheckedChange={(checked) => {
                        setSelectedLinks((prev) =>
                          checked
                            ? [...prev, type as LinkType]
                            : prev.filter((t) => t !== type)
                        );
                      }}
                    />
                    {config.icon.modern({ className: "h-4 w-4" })}
                    <span className="text-sm">{config.label}</span>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        );
    }
  };

  return (
    <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Create Your Page</DialogTitle>
          <p className="text-sm text-gray-500 mt-1">Step {step} of 3</p>
        </DialogHeader>

        <div className="space-y-6">
          {renderStep()}

          <div className="flex justify-between pt-4">
            {step > 1 && (
              <Button
                variant="outline"
                onClick={() => setStep(step - 1)}
                disabled={isCheckingSlug}
              >
                Back
              </Button>
            )}
            <div className="flex space-x-3 ml-auto">
              {step < 3 && (
                <Button variant="outline" onClick={() => setStep(step + 1)}>
                  Skip
                </Button>
              )}
              <Button
                onClick={handleNext}
                disabled={isCheckingSlug || (step === 1 && !slug)}
              >
                {isCheckingSlug ? (
                  <>
                    <Spinner className="h-4 w-4 mr-2" />
                    {step === 3 ? "Creating..." : "Checking..."}
                  </>
                ) : step === 3 ? (
                  "Create Page"
                ) : (
                  "Next"
                )}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

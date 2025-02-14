import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import TokenSelector from "@/components/TokenSelector";
import { PageData } from "@/types";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useRouter } from "next/router";
import { AlertCircle } from "lucide-react";

interface GeneralSettingsTabProps {
  pageDetails: PageData | null;
  setPageDetails: (
    data: PageData | ((prev: PageData | null) => PageData | null)
  ) => void;
}

export function GeneralSettingsTab({
  pageDetails,
  setPageDetails,
}: GeneralSettingsTabProps) {
  const router = useRouter();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const handleDelete = async () => {
    if (!pageDetails || deleteConfirmation !== pageDetails.slug) return;

    setIsDeleting(true);
    setDeleteError(null);

    try {
      const response = await fetch("/api/page-store", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ slug: pageDetails.slug }),
        credentials: "same-origin",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to delete page");
      }

      // Redirect to home page after successful deletion
      router.push("/");
    } catch (error) {
      console.error("Error deleting page:", error);
      setDeleteError(
        error instanceof Error ? error.message : "Failed to delete page"
      );
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6 px-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Solana Token
        </label>
        {pageDetails && (
          <div className="space-y-4">
            {pageDetails.connectedToken ? (
              <div className="space-y-4">
                <div>
                  <div className="flex items-center gap-2">
                    <Input
                      type="text"
                      value={pageDetails.connectedToken}
                      readOnly
                    />
                    <Button
                      variant="outline"
                      onClick={() => {
                        setPageDetails((prev) =>
                          prev
                            ? {
                                ...prev,
                                connectedToken: "",
                                tokenSymbol: undefined,
                                showToken: false,
                                showSymbol: false,
                              }
                            : null
                        );
                      }}>
                      Unlink
                    </Button>
                  </div>
                  {pageDetails.tokenSymbol && (
                    <p className="mt-1 text-sm text-gray-500">
                      ${pageDetails.tokenSymbol}
                    </p>
                  )}
                </div>
              </div>
            ) : (
              <TokenSelector
                walletAddress={pageDetails.walletAddress}
                selectedToken={null}
                onTokenSelect={(tokenAddress) => {
                  if (!tokenAddress) return;
                  setPageDetails((prev) =>
                    prev
                      ? {
                          ...prev,
                          connectedToken: tokenAddress,
                          tokenSymbol: undefined, // Clear the symbol when token changes
                        }
                      : null
                  );
                }}
                onMetadataLoad={(metadata) => {
                  if (!metadata) return;
                  setPageDetails((prev) =>
                    prev
                      ? {
                          ...prev,
                          title: metadata.name,
                          description: metadata.description || "",
                          image: metadata.image || "",
                          tokenSymbol: metadata.symbol,
                        }
                      : null
                  );
                }}
              />
            )}
          </div>
        )}
      </div>

      <div className="flex gap-2">
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Image
          </label>
          <div className="flex gap-2">
            <Input
              type="text"
              value={pageDetails?.image || ""}
              onChange={(e) =>
                setPageDetails((prev) =>
                  prev
                    ? {
                        ...prev,
                        image: e.target.value,
                      }
                    : null
                )
              }
              placeholder="Enter image URL"
            />
          </div>
        </div>
        {pageDetails?.image && (
          <div className="relative w-16 h-16">
            <img
              src={pageDetails.image}
              alt={pageDetails.title}
              className=""
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = "none";
              }}
            />
          </div>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Title
        </label>
        <Input
          type="text"
          value={pageDetails?.title || ""}
          onChange={(e) =>
            setPageDetails((prev) =>
              prev
                ? {
                    ...prev,
                    title: e.target.value,
                  }
                : null
            )
          }
          maxLength={100}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Description
        </label>
        <Textarea
          value={pageDetails?.description || ""}
          onChange={(e) =>
            setPageDetails((prev) =>
              prev
                ? {
                    ...prev,
                    description: e.target.value,
                  }
                : null
            )
          }
          rows={3}
          maxLength={500}
        />
        <div className="pt-4 pb-4">
          <Button
            variant="link"
            size="sm"
            className="text-red-600 hover:text-red-700 hover:bg-red-50"
            onClick={() => setShowDeleteDialog(true)}>
            Delete Page
          </Button>
        </div>
      </div>

      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-red-600 flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              Delete Page
            </DialogTitle>
            <DialogDescription>
              This action cannot be undone. This will permanently delete your
              page and remove all data.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <p className="text-sm text-gray-600">
              Please type{" "}
              <span className="font-mono text-gray-900">
                {pageDetails?.slug}
              </span>{" "}
              to confirm.
            </p>
            <Input
              value={deleteConfirmation}
              onChange={(e) => setDeleteConfirmation(e.target.value)}
              placeholder="Enter page name to confirm"
              className={deleteError ? "border-red-500" : ""}
            />
            {deleteError && (
              <p className="text-sm text-red-600">{deleteError}</p>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowDeleteDialog(false);
                setDeleteConfirmation("");
                setDeleteError(null);
              }}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={
                !pageDetails ||
                deleteConfirmation !== pageDetails.slug ||
                isDeleting
              }>
              {isDeleting ? "Deleting..." : "Delete Page"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

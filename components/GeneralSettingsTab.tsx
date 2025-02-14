import React, { useState, useRef, useEffect } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { SettingsTabProps } from '@/types';
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import TokenSelector from "@/components/TokenSelector";
import { PageData } from "@/types";
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

export function GeneralSettingsTab({
  pageDetails,
  setPageDetails,
  onSave,
  isSaving,
  isAuthenticated,
  canEdit,
  onConnect,
}: SettingsTabProps) {
  const router = useRouter();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const titleRef = useRef<HTMLInputElement>(null);
  const descriptionRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const handleFocusTitle = () => {
      if (titleRef.current) {
        titleRef.current.focus();
        // Scroll the input into view with some padding
        titleRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    };

    const handleFocusDescription = () => {
      if (descriptionRef.current) {
        descriptionRef.current.focus();
        // Scroll the textarea into view with some padding
        descriptionRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    };

    window.addEventListener('focusPageTitle', handleFocusTitle);
    window.addEventListener('focusPageDescription', handleFocusDescription);

    return () => {
      window.removeEventListener('focusPageTitle', handleFocusTitle);
      window.removeEventListener('focusPageDescription', handleFocusDescription);
    };
  }, []);

  const handleTitleChange = (value: string) => {
    setPageDetails((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        title: value,
      };
    });
  };

  const handleDescriptionChange = (value: string) => {
    setPageDetails((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        description: value,
      };
    });
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
                            : null,
                        );
                      }}
                    >
                      Unlink
                    </Button>
                  </div>
                  {pageDetails.tokenSymbol && (
                    <p className="mt-1 text-sm text-gray-500">
                      ${pageDetails.tokenSymbol}
                    </p>
                  )}
                </div>

                <div className="space-y-2 border-t pt-4">
                  <h3 className="text-sm font-medium text-gray-700 mb-2">
                    Token Display Options
                  </h3>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="show-token"
                      checked={pageDetails.showToken}
                      onCheckedChange={(checked) => {
                        setPageDetails((prev) =>
                          prev
                            ? {
                                ...prev,
                                showToken: checked as boolean,
                              }
                            : null,
                        );
                      }}
                    />
                    <label
                      htmlFor="show-token"
                      className="text-sm text-gray-700 cursor-pointer"
                    >
                      Show token address on page
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="show-symbol"
                      checked={pageDetails.showSymbol}
                      onCheckedChange={(checked) => {
                        setPageDetails((prev) =>
                          prev
                            ? {
                                ...prev,
                                showSymbol: checked as boolean,
                              }
                            : null,
                        );
                      }}
                    />
                    <label
                      htmlFor="show-symbol"
                      className="text-sm text-gray-700 cursor-pointer"
                    >
                      Show token symbol on page
                    </label>
                  </div>
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
                      : null,
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
                      : null,
                  );
                }}
              />
            )}
          </div>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Image
        </label>
        <div className="space-y-4">
          {pageDetails?.image && (
            <div className="relative w-32 h-32 rounded-lg overflow-hidden">
              <img
                src={pageDetails.image}
                alt={pageDetails.title}
                className="object-cover w-full h-full"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = "none";
                }}
              />
            </div>
          )}
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
                  : null,
              )
            }
            placeholder="Enter image URL"
            className="max-w-md"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Title
        </label>
        <Input
          ref={titleRef}
          type="text"
          value={pageDetails?.title || ""}
          onChange={(e) =>
            setPageDetails((prev) =>
              prev
                ? {
                    ...prev,
                    title: e.target.value,
                  }
                : null,
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
          ref={descriptionRef}
          value={pageDetails?.description || ""}
          onChange={(e) =>
            setPageDetails((prev) =>
              prev
                ? {
                    ...prev,
                    description: e.target.value,
                  }
                : null,
            )
          }
          rows={3}
          maxLength={500}
        />
      </div>

      <div className="pt-4 pb-4">
        <Button
          variant="link"
          size="sm"
          className="text-red-600 hover:text-red-700 hover:bg-red-50"
          onClick={() => setShowDeleteDialog(true)}
        >
          Delete Page
        </Button>
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
              }}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={
                !pageDetails ||
                deleteConfirmation !== pageDetails.slug ||
                isDeleting
              }
            >
              {isDeleting ? "Deleting..." : "Delete Page"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 
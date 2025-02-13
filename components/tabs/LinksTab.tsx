import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus } from "lucide-react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { SortableItem } from "@/components/SortableItem";
import { PageData, PageItem } from "@/types";
import React from "react";
import { LINK_CONFIGS, LinkType, validateLinkUrl } from "@/lib/links";

interface LinksTabProps {
  pageDetails: PageData | null;
  setPageDetails: (
    data: PageData | ((prev: PageData | null) => PageData | null),
  ) => void;
  validationErrors: { [key: string]: string };
  setValidationErrors: React.Dispatch<
    React.SetStateAction<{ [key: string]: string }>
  >;
}

// Helper function to get a consistent item ID
function getItemId(item: PageItem): string {
  return item.id || `${item.type}-${item.order}`;
}

export function LinksTab({
  pageDetails,
  setPageDetails,
  validationErrors = {},
  setValidationErrors,
}: LinksTabProps) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: any) => {
    const { active, over } = event;

    if (active.id !== over.id && pageDetails?.items) {
      const oldIndex = pageDetails.items.findIndex(
        (item) => getItemId(item) === active.id,
      );
      const newIndex = pageDetails.items.findIndex(
        (item) => getItemId(item) === over.id,
      );

      setPageDetails((prevDetails) => {
        if (!prevDetails?.items) return prevDetails;

        const newItems = arrayMove(prevDetails.items, oldIndex, newIndex).map(
          (item, index) => ({
            ...item,
            order: index,
          }),
        );

        return {
          ...prevDetails,
          items: newItems,
        };
      });
    }
  };

  const handleUrlChange = (itemId: string, url: string) => {
    // Clear any existing validation error for this item when URL changes
    if (validationErrors[itemId]) {
      setValidationErrors((prev: { [key: string]: string }) => {
        const newErrors = { ...prev };
        delete newErrors[itemId];
        return newErrors;
      });
    }

    setPageDetails((prev) => {
      if (!prev) return prev;

      // Validate URL before updating
      const item = prev.items?.find(i => getItemId(i) === itemId);
      if (!item) return prev;

      const linkConfig = LINK_CONFIGS[item.type];
      if (!linkConfig?.options?.requiresUrl) return prev;

      // Format URL: Add https:// if missing and not an email
      let formattedUrl = url.trim();
      if (formattedUrl && !formattedUrl.startsWith('mailto:') && !formattedUrl.includes('@') && !formattedUrl.match(/^https?:\/\//)) {
        formattedUrl = `https://${formattedUrl}`;
      }

      // Only validate if URL is not empty
      if (formattedUrl && !validateLinkUrl(item.type, formattedUrl)) {
        setValidationErrors(prev => ({
          ...prev,
          [itemId]: `Invalid ${linkConfig.label} URL format`
        }));
      }

      return {
        ...prev,
        items: prev.items?.map((i) =>
          getItemId(i) === itemId ? { ...i, url: formattedUrl } : i
        ),
      };
    });
  };

  // Get available link types (excluding already added ones)
  const getAvailableLinkTypes = () => {
    const addedTypes = new Set(pageDetails?.items?.map(item => item.type) || []);
    return Object.entries(LINK_CONFIGS)
      .filter(([type]) => !addedTypes.has(type as LinkType))
      .map(([type, config]) => ({
        linkType: type as LinkType,
        ...config,
      }));
  };

  // Only show token gating if a token is connected
  const canShowTokenGating = !!pageDetails?.connectedToken;

  return (
    <div className="space-y-6 px-6">
      <div className="flex justify-between items-center">
        <Dialog>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-2">
              <Plus className="h-4 w-4" />
              Add Link
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Link</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              {getAvailableLinkTypes().map((linkConfig) => {
                const Icon = linkConfig.icon.classic;
                return (
                  <Button
                    key={linkConfig.linkType}
                    variant="outline"
                    className="justify-start gap-2"
                    onClick={() => {
                      const newItem: PageItem = {
                        type: linkConfig.linkType,
                        url: "",
                        id: `${linkConfig.linkType}-${Math.random().toString(36).substr(2, 9)}`,
                        order: pageDetails?.items?.length || 0,
                      };

                      setPageDetails((prev) => {
                        if (!prev) return prev;
                        return {
                          ...prev,
                          items: [...(prev.items || []), newItem],
                        };
                      });
                    }}
                  >
                    <Icon className="h-4 w-4" />
                    {linkConfig.label}
                  </Button>
                );
              })}
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={pageDetails?.items?.map((i) => getItemId(i)) || []}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-2">
            {!canShowTokenGating && pageDetails?.items?.some(item => item.tokenGated) && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
                <p className="text-sm text-yellow-800">
                  Connect a token in the Settings tab to enable token gating for your links.
                </p>
              </div>
            )}
            {pageDetails?.items?.map((item) => {
              const itemId = getItemId(item);
              return (
                <SortableItem
                  key={itemId}
                  id={itemId}
                  item={item}
                  error={validationErrors[itemId]}
                  onUrlChange={(url) => handleUrlChange(itemId, url)}
                  setPageDetails={setPageDetails}
                  tokenSymbol={pageDetails?.tokenSymbol}
                  onDelete={() => {
                    if (validationErrors[itemId]) {
                      setValidationErrors((prev: { [key: string]: string }) => {
                        const newErrors = { ...prev };
                        delete newErrors[itemId];
                        return newErrors;
                      });
                    }

                    setPageDetails((prev) => ({
                      ...prev!,
                      items: prev!.items!.filter((i) =>
                        item.id ? i.id !== item.id : i.type !== item.type,
                      ),
                    }));
                  }}
                />
              );
            })}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
}

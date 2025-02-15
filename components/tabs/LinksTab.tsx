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
import React, { useState, useEffect } from "react";
import { LINK_PRESETS, LinkPreset } from "@/lib/linkPresets";
import { validateLinkUrl } from "@/lib/links";

interface LinksTabProps {
  pageDetails: PageData | null;
  setPageDetails: (data: PageData | ((prev: PageData | null) => PageData | null)) => void;
  isAuthenticated?: boolean;
  canEdit?: boolean;
  onConnect?: () => void;
  openLinkId?: string;
  onLinkOpen?: (id: string | null) => void;
  onValidationErrorsChange?: (errors: { [key: string]: string }) => void;
}

// Helper function to get a consistent item ID
function getItemId(item: PageItem): string {
  return item.id;
}

export function LinksTab({
  pageDetails,
  setPageDetails,
  isAuthenticated,
  canEdit,
  onConnect,
  openLinkId,
  onLinkOpen,
  onValidationErrorsChange,
}: LinksTabProps) {
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Validate URLs when items change
  useEffect(() => {
    validateItems(pageDetails?.items || []);
  }, [pageDetails?.items]);

  const validateItems = (items: PageItem[]) => {
    const newErrors: { [key: string]: string } = {};
    items.forEach((item) => {
      console.log('Validating item:', {
        id: item.id,
        presetId: item.presetId,
        url: item.url
      });
      
      const preset = LINK_PRESETS[item.presetId];
      if (preset?.options?.requiresUrl) {
        if (!item.url) {
          newErrors[item.id] = `${preset.title} URL is required`;
        } else if (!validateLinkUrl(item.url, item.presetId)) {
          console.log('URL validation failed:', {
            id: item.id,
            url: item.url,
            presetId: item.presetId
          });
          newErrors[item.id] = `Invalid ${preset.title} URL format`;
        }
      }
    });
    console.log('Setting validation errors:', newErrors);
    setErrors(newErrors);
    onValidationErrorsChange?.(newErrors);
    return newErrors;
  };

  const handleDragEnd = (event: any) => {
    const { active, over } = event;

    if (active.id !== over?.id && pageDetails?.items) {
      const oldIndex = pageDetails.items.findIndex(
        (item) => getItemId(item) === active.id,
      );
      const newIndex = pageDetails.items.findIndex(
        (item) => getItemId(item) === over?.id,
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
    setPageDetails((prev) => {
      if (!prev?.items) return prev;

      const updatedItems = prev.items.map((i) =>
        i.id === itemId ? { ...i, url } : i
      );

      // Validate all items with the updated URL
      validateItems(updatedItems);

      return {
        ...prev,
        items: updatedItems,
      };
    });
  };

  // Get available link presets
  const getAvailablePresets = () => {
    return Object.values(LINK_PRESETS);
  };

  // Only show token gating if a token is connected
  const canShowTokenGating = !!pageDetails?.connectedToken;

  const handleAccordionToggle = (itemId: string) => {
    // If the clicked item is already open, close it
    if (openLinkId === itemId) {
      onLinkOpen?.(null);
    } else {
      onLinkOpen?.(itemId);
    }
  };

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
              {getAvailablePresets().map((preset) => {
                const Icon = preset.icon.classic;
                return (
                  <Button
                    key={preset.id}
                    variant="outline"
                    className="justify-start gap-2"
                    onClick={() => {
                      const newItem: PageItem = {
                        presetId: preset.id,
                        title: preset.title,
                        url: preset.defaultUrl?.replace('[connectedToken]', pageDetails?.connectedToken || '') || "",
                        id: `${preset.id}-${Math.random().toString(36).substr(2, 9)}`,
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
                    {preset.title}
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
              const preset = LINK_PRESETS[item.presetId];
              if (!preset) return null;
              
              console.log(`Rendering item ${itemId}, error:`, errors[itemId]);
              
              return (
                <SortableItem
                  key={itemId}
                  id={itemId}
                  item={item}
                  preset={preset}
                  error={errors[itemId]}
                  onUrlChange={(url) => handleUrlChange(itemId, url)}
                  setPageDetails={setPageDetails}
                  tokenSymbol={pageDetails?.tokenSymbol || undefined}
                  isOpen={openLinkId === itemId}
                  onOpen={() => handleAccordionToggle(itemId)}
                  onDelete={() => {
                    const newErrors = { ...errors };
                    delete newErrors[itemId];
                    setErrors(newErrors);
                    onValidationErrorsChange?.(newErrors);

                    setPageDetails((prev) => ({
                      ...prev!,
                      items: prev!.items!.filter((i) => i.id !== item.id),
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

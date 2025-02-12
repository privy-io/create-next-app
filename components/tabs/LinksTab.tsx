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
import { ItemType, PageData, PageItem } from "@/types";
import React from "react";
import { useState } from "react";

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
  // Add sensors for drag and drop
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

    setPageDetails((prev) => ({
      ...prev!,
      items: prev!.items!.map((i) =>
        getItemId(i) === itemId ? { ...i, url } : i,
      ),
    }));
  };

  return (
    <div className="space-y-6">
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
              {[
                { type: "twitter", label: "Twitter" },
                { type: "telegram", label: "Telegram" },
                {
                  type: "dexscreener",
                  label: "DexScreener",
                  showIfToken: true,
                },
                { type: "tiktok", label: "TikTok" },
                { type: "instagram", label: "Instagram" },
                { type: "email", label: "Email" },
                { type: "discord", label: "Discord" },
                { type: "private-chat", label: "Private Chat", isPlugin: true },
                { type: "terminal", label: "Terminal", isPlugin: true },
              ].map(({ type, label, showIfToken, isPlugin }) => {
                if (showIfToken && !pageDetails?.connectedToken) return null;
                const isAdded = pageDetails?.items?.some(
                  (item) => item.type === type,
                );
                if (isAdded) return null;

                return (
                  <Button
                    key={type}
                    variant="outline"
                    className="justify-start gap-2"
                    onClick={() => {
                      const newItem: PageItem = isPlugin
                        ? {
                            type: type as ItemType,
                            order: pageDetails?.items?.length || 0,
                            isPlugin: true,
                            tokenGated: false,
                            id: `${type}-${Math.random().toString(36).substr(2, 9)}`,
                          }
                        : {
                            type: type as ItemType,
                            url: "",
                            id: `${type}-${Math.random().toString(36).substr(2, 9)}`,
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
                    <span className="text-xl">{getSocialIcon(type)}</span>
                    {label}
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
            {pageDetails?.items?.map((item) => {
              const itemId = getItemId(item);
              return (
                <SortableItem
                  key={itemId}
                  id={itemId}
                  item={item}
                  error={validationErrors[itemId]}
                  onUrlChange={
                    !item.isPlugin
                      ? (url) => handleUrlChange(itemId, url)
                      : undefined
                  }
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

// Helper function to get icon for social link
function getSocialIcon(type: string) {
  switch (type) {
    case "twitter":
      return "𝕏";
    case "telegram":
      return "📱";
    case "dexscreener":
      return "📊";
    case "tiktok":
      return "🎵";
    case "instagram":
      return "📸";
    case "email":
      return "📧";
    case "discord":
      return "💬";
    case "private-chat":
      return "🔒";
    case "telegram-group":
      return "💬";
    case "terminal":
      return "💻";
    default:
      return "🔗";
  }
}

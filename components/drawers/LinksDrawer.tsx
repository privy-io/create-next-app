import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { PageData, PageItem } from "@/types";
import React, { useState, useEffect } from "react";
import { LINK_PRESETS } from "@/lib/linkPresets";
import { validateLinkUrl } from "@/lib/links";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";

interface LinksDrawerProps {
  pageDetails: PageData | null;
  setPageDetails: (data: PageData | ((prev: PageData | null) => PageData | null)) => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onLinkAdd?: (linkId: string) => void;
}

export function LinksDrawer({
  pageDetails,
  setPageDetails,
  open,
  onOpenChange,
  onLinkAdd,
}: LinksDrawerProps) {
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

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
    return newErrors;
  };

  const handleAddLink = (presetId: string) => {
    const preset = LINK_PRESETS[presetId];
    if (!preset) return;

    const newItem: PageItem = {
      presetId,
      title: preset.title,
      url: preset.defaultUrl?.replace('[connectedToken]', pageDetails?.connectedToken || '') || "",
      id: `${presetId}-${Math.random().toString(36).substr(2, 9)}`,
      order: pageDetails?.items?.length || 0,
      isNew: true,
    };

    setPageDetails((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        items: [...(prev.items || []), newItem],
      };
    });

    // Call onLinkAdd immediately after setting the new item
    onLinkAdd?.(newItem.id);

    // Scroll to bottom of the page after a short delay to ensure content is rendered
    setTimeout(() => {
      window.scrollTo({
        top: document.documentElement.scrollHeight,
        behavior: 'smooth'
      });
    }, 100);
  };

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Add Link</DrawerTitle>
        </DrawerHeader>
        <div className="py-3">
          <div className="grid gap-4 grid-cols-2 sm:grid-cols-3">
            {Object.entries(LINK_PRESETS).map(([id, preset]) => {
              const Icon = preset.icon.classic;
              return (
                <Button
                  key={id}
                  variant="outline"
                  className="justify-start gap-2 h-auto py-3"
                  onClick={() => handleAddLink(id)}
                >
                  <Icon className="h-5 w-5" />
                  <div className="text-left">
                    <div className="font-medium">{preset.title}</div>
                  </div>
                </Button>
              );
            })}
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
} 
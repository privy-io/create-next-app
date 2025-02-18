import { useState } from "react";
import { PageData, PageItem } from "@/types";
import EditPageLink from "./EditPageLink";
import { Button } from "@/components/ui/button";
import { DragDropProvider } from "@dnd-kit/react";
import { Plus } from "lucide-react";

interface EditPageContentProps {
  pageData: PageData;
  items?: PageItem[];
  themeStyle?: Record<string, any>;
  onLinkClick?: (itemId: string) => void;
  onTitleClick?: () => void;
  onDescriptionClick?: () => void;
  onImageClick?: () => void;
  onItemsReorder?: (items: PageItem[]) => void;
  validationErrors?: { [key: string]: string };
  onAddLinkClick?: () => void;
}

export default function EditPageContent({
  pageData,
  items = pageData.items || [],
  themeStyle,
  onLinkClick,
  onTitleClick,
  onDescriptionClick,
  onImageClick,
  onItemsReorder,
  validationErrors = {},
  onAddLinkClick,
}: EditPageContentProps) {
  const handleDragEnd = (event: any) => {
    const { operation, canceled } = event;
    const { source, target } = operation;

    if (canceled) {
      return;
    }

    if (source && target && source.id !== target.id) {
      const oldIndex = items.findIndex((item) => item.id === source.id);
      const newIndex = items.findIndex((item) => item.id === target.id);

      const newItems = [...items];
      const [movedItem] = newItems.splice(oldIndex, 1);
      newItems.splice(newIndex, 0, movedItem);

      const reorderedItems = newItems.map((item, index) => ({
        ...item,
        order: index,
      }));

      onItemsReorder?.(reorderedItems);
    }
  };

  return (
    <div>
      <div
        className="pf-page !pb-[100px]"
        style={
          {
            "--pf-font-family-global": pageData.fonts?.global
              ? `'${pageData.fonts.global}', sans-serif`
              : "var(--pf-font-family-default)",
            "--pf-font-family-heading": pageData.fonts?.heading
              ? `'${pageData.fonts.heading}', sans-serif`
              : "var(--pf-font-family-global)",
            "--pf-font-family-paragraph": pageData.fonts?.paragraph
              ? `'${pageData.fonts.paragraph}', sans-serif`
              : "var(--pf-font-family-global)",
            "--pf-font-family-links": pageData.fonts?.links
              ? `'${pageData.fonts.links}', sans-serif`
              : "var(--pf-font-family-global)",
            ...(themeStyle || {}),
          } as React.CSSProperties
        }>
        <div className="pf-page__container">
          {/* Page Header */}
          <div className="pf-page__header">
            <div className="pf-page__header-inner">
              {pageData?.image && (
                <img
                  className="pf-page__image cursor-pointer hover:opacity-80"
                  src={pageData.image}
                  alt={pageData.title}
                  onClick={onImageClick}
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = "none";
                  }}
                />
              )}
              <h1
                className="pf-page__title cursor-pointer hover:opacity-80"
                onClick={onTitleClick}>
                {pageData?.title || "Untitled Page"}
              </h1>
              {pageData?.description && (
                <p
                  className="pf-page__description cursor-pointer hover:opacity-80"
                  onClick={onDescriptionClick}>
                  {pageData.description}
                </p>
              )}
            </div>
          </div>

          {/* Social Links & Plugins */}
          {items && items.length > 0 && (
            <div className="pf-links">
              <DragDropProvider onDragEnd={handleDragEnd}>
                <div className="pf-links__grid">
                  {items
                    .filter((item): item is PageItem =>
                      Boolean(item && item.id && item.presetId)
                    )
                    .sort((a, b) => a.order - b.order)
                    .map((item, index) => (
                      <EditPageLink
                        key={item.id}
                        item={item}
                        index={index}
                        pageData={pageData}
                        onLinkClick={onLinkClick}
                        error={validationErrors[item.id]}
                      />
                    ))}
                </div>
              </DragDropProvider>
            </div>
          )}
        </div>
      </div>
      {/* Add Link Button */}
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2">
        <div className="animate-slide-up">
          <Button variant={"secondary"} size={"lg"} onClick={onAddLinkClick}>
            <Plus className="h-5 w-5" />
            <span>Add link or Apps</span>
          </Button>
        </div>
      </div>
    </div>
  );
}

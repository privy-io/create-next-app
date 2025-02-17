import { useState } from "react";
import { PageData, PageItem } from "@/types";
import EditPageLink from "./EditPageLink";
import { Button } from "@/components/ui/button";
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
import { Plus } from "lucide-react";

interface EditPageContentProps {
  pageData: PageData;
  items?: PageItem[];
  themeStyle?: Record<string, any>;
  onLinkClick?: (itemId: string) => void;
  onTitleClick?: () => void;
  onDescriptionClick?: () => void;
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
  onItemsReorder,
  validationErrors = {},
  onAddLinkClick,
}: EditPageContentProps) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: any) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      const oldIndex = items.findIndex((item) => item.id === active.id);
      const newIndex = items.findIndex((item) => item.id === over?.id);

      const newItems = arrayMove(items, oldIndex, newIndex).map(
        (item, index) => ({
          ...item,
          order: index,
        })
      );

      onItemsReorder?.(newItems);
    }
  };

  return (
    <div>
      <div
        className="pf-page"
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
                  className="pf-page__image"
                  src={pageData.image}
                  alt={pageData.title}
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
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}>
                <SortableContext
                  items={items.map((i) => i.id)}
                  strategy={verticalListSortingStrategy}>
                  <div className="pf-links__grid">
                    {items
                      .filter((item) => item && item.id && item.presetId)
                      .sort((a, b) => a.order - b.order)
                      .map((item) => (
                        <EditPageLink
                          key={item.id}
                          item={item}
                          pageData={pageData}
                          onLinkClick={onLinkClick}
                          error={validationErrors[item.id]}
                        />
                      ))}
                  </div>
                </SortableContext>
              </DndContext>
            </div>
          )}
        </div>
      </div>
      {/* Add Link Button */}
      <div className="fixed bottom-2 left-1/2 -translate-x-1/2">
        <Button onClick={onAddLinkClick}>
          <Plus className="h-5 w-5" />
          <span>Add link or Apps</span>
        </Button>
      </div>
    </div>
  );
}

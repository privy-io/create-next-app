import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus } from 'lucide-react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { SortableItem } from '@/components/SortableItem';
import { ItemType, PageData, PageItem } from '@/types';

interface LinksTabProps {
  pageDetails: PageData | null;
  setPageDetails: (data: PageData | ((prev: PageData | null) => PageData | null)) => void;
}

export function LinksTab({ pageDetails, setPageDetails }: LinksTabProps) {
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
      const oldIndex = pageDetails.items.findIndex((item) => item.id === active.id);
      const newIndex = pageDetails.items.findIndex((item) => item.id === over.id);

      setPageDetails(prevDetails => {
        if (!prevDetails?.items) return prevDetails;
        
        const newItems = arrayMove(prevDetails.items, oldIndex, newIndex).map(
          (item, index) => ({ 
            ...item,
            order: item.isPlugin ? index : index  // Keep plugin order separate
          })
        );

        return {
          ...prevDetails,
          items: newItems
        };
      });
    }
  };

  return (
    <div className="space-y-4 px-6">
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
                { type: 'twitter', label: 'Twitter' },
                { type: 'telegram', label: 'Telegram' },
                { type: 'dexscreener', label: 'DexScreener', showIfToken: true },
                { type: 'tiktok', label: 'TikTok' },
                { type: 'instagram', label: 'Instagram' },
                { type: 'email', label: 'Email' },
                { type: 'discord', label: 'Discord' },
                { type: 'private-chat', label: 'Private Chat', isPlugin: true },
                { type: 'terminal', label: 'Terminal', isPlugin: true },
              ].map(({ type, label, showIfToken, isPlugin }) => {
                if (showIfToken && !pageDetails?.connectedToken) return null;
                const isAdded = pageDetails?.items?.some(item => item.type === type);
                if (isAdded) return null;

                return (
                  <Button
                    key={type}
                    variant="outline"
                    className="justify-start gap-2"
                    onClick={() => {
                      const newItem: PageItem = isPlugin ? {
                        type: type as ItemType,
                        order: (pageDetails?.items?.length || 0),
                        isPlugin: true,
                        tokenGated: false,
                        id: `${type}-${Math.random().toString(36).substr(2, 9)}`
                      } : {
                        type: type as ItemType,
                        url: '',
                        id: `${type}-${Math.random().toString(36).substr(2, 9)}`,
                        order: (pageDetails?.items?.length || 0)
                      };

                      setPageDetails(prev => {
                        if (!prev) return prev;
                        return {
                          ...prev,
                          items: [...(prev.items || []), newItem]
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
          items={pageDetails?.items?.map(i => i.id || `${i.type}-${i.order}`) || []}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-2">
            {pageDetails?.items?.map((item) => (
              <SortableItem
                key={item.id || `${item.type}-${item.order}`}
                id={item.id || `${item.type}-${item.order}`}
                item={item}
                onUrlChange={!item.isPlugin ? (url) => {
                  setPageDetails(prev => ({
                    ...prev!,
                    items: prev!.items!.map(i =>
                      i.id === item.id ? { ...i, url } : i
                    )
                  }));
                } : undefined}
                onDelete={() => {
                  setPageDetails(prev => ({
                    ...prev!,
                    items: prev!.items!.filter(i => 
                      item.id ? i.id !== item.id : i.type !== item.type
                    )
                  }));
                }}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
}

// Helper function to get icon for social link
function getSocialIcon(type: ItemType | string) {
  switch (type) {
    case 'twitter':
      return '𝕏';
    case 'telegram':
      return '📱';
    case 'dexscreener':
      return '📊';
    case 'tiktok':
      return '🎵';
    case 'instagram':
      return '📸';
    case 'email':
      return '📧';
    case 'discord':
      return '💬';
    case 'private-chat':
      return '🔒';
    case 'terminal':
      return '💻';
    default:
      return '🔗';
  }
} 
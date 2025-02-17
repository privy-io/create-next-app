import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";
import { PageData, PageItem } from "@/types";
import { LINK_PRESETS, LinkPreset } from "@/lib/linkPresets";

interface SortableItemProps {
  id: string;
  item: PageItem;
  preset: LinkPreset;
  onUrlChange?: (url: string) => void;
  onDelete: () => void;
  error?: string;
  tokenSymbol?: string;
  setPageDetails: (data: PageData | ((prev: PageData | null) => PageData | null)) => void;
  isOpen?: boolean;
  onOpen?: (id: string | null) => void;
}

export function SortableItem({
  id,
  item,
  preset,
  onUrlChange,
  onDelete,
  error,
  tokenSymbol,
  setPageDetails,
  isOpen,
  onOpen,
}: SortableItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  if (!preset) return null;

  const Icon = preset.icon.classic;

  return (
    <div ref={setNodeRef} style={style} className="bg-white">
      <button
        className={`w-full flex items-center px-4 py-3 gap-3 hover:bg-gray-50 ${error ? 'border border-red-500 rounded-lg' : ''}`}
        onClick={() => onOpen?.(id)}
      >
        <div
          className="cursor-grab"
          {...attributes}
          {...listeners}
          onClick={(e) => e.stopPropagation()}
        >
          <GripVertical className="h-5 w-5 text-gray-400 flex-shrink-0" />
        </div>
        <div className="flex items-center gap-2 flex-1">
          <Icon className="h-5 w-5" />
          <span className="font-medium">{item.title || preset.title}</span>
          {item.tokenGated && (
            <span className="ml-auto text-xs bg-violet-100 text-violet-800 px-1 py-0.5 rounded">
              Token gated
            </span>
          )}
        </div>
      </button>
    </div>
  );
}

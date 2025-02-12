import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { PageItem } from "@/types";

interface SortableItemProps {
  id: string;
  item: PageItem;
  onUrlChange?: (url: string) => void;
  onDelete: () => void;
  error?: string;
}

// Helper function to validate URL format
function validateUrl(url: string, type: string): string | null {
  const urlRegex = /^https?:\/\/[^\s/$.?#].[^\s]*$/i;

  if (!url) return null;

  if (type === "email") {
    if (!url.includes("@") && !url.startsWith("mailto:")) {
      return "Invalid email format";
    }
    return null;
  }

  if (!urlRegex.test(url)) {
    return "Invalid URL format - must start with http:// or https://";
  }

  return null;
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

export function SortableItem({
  id,
  item,
  onUrlChange,
  onDelete,
  error,
}: SortableItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  // Local URL validation
  const localError = item.url ? validateUrl(item.url, item.type) : null;
  const displayError = error || localError;

  return (
    <div ref={setNodeRef} style={style} className="bg-white">
      <Accordion type="single" collapsible>
        <AccordionItem value="item" className="border rounded-lg">
          <div className="flex items-center px-1">
            <button
              className="cursor-grab py-2 mr-2"
              {...attributes}
              {...listeners}
            >
              <GripVertical className="h-5 w-5 text-gray-400 flex-shrink-0" />
            </button>
            <AccordionTrigger className="hover:no-underline py-2">
              <div className="flex items-center gap-2">
                <span className="text-base">{getSocialIcon(item.type)}</span>
                <span className="font-medium capitalize">
                  {item.type.replace("-", " ")}
                </span>
                {item.tokenGated && (
                  <span className="text-xs bg-violet-100 text-violet-800 px-2 py-1 rounded">
                    Token Required
                  </span>
                )}
              </div>
            </AccordionTrigger>
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              className="ml-auto mr-2"
            >
              <Trash2 className="h-4 w-4 text-red-500" />
            </Button>
          </div>
          <AccordionContent className="px-4 pb-4 border-t">
            {!item.isPlugin && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    URL
                  </label>
                  <Input
                    type="text"
                    value={item.url || ""}
                    onChange={(e) => onUrlChange?.(e.target.value)}
                    placeholder={`Enter ${item.type} URL`}
                    className={displayError ? "border-red-500" : ""}
                  />
                  {displayError && (
                    <p className="mt-1 text-sm text-red-500">{displayError}</p>
                  )}
                  <p className="mt-1 text-xs text-gray-500">
                    {item.type === "email"
                      ? "Enter an email address or mailto: link"
                      : "Must start with http:// or https://"}
                  </p>
                </div>
              </div>
            )}
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}

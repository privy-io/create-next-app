import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Trash2, HelpCircle, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { PageData, PageItem } from "@/types";
import { LINK_CONFIGS, validateLinkUrl } from "@/lib/links";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface SortableItemProps {
  id: string;
  item: PageItem;
  onUrlChange?: (url: string) => void;
  onDelete: () => void;
  error?: string;
  tokenSymbol?: string;
  setPageDetails: (
    data: PageData | ((prev: PageData | null) => PageData | null)
  ) => void;
  isOpen?: boolean;
  onOpen?: (id: string | null) => void;
}

export function SortableItem({
  id,
  item,
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

  const linkConfig = LINK_CONFIGS[item.type];
  if (!linkConfig) return null;

  const Icon = linkConfig.icon.classic;
  const displayError = error || (linkConfig.options?.requiresUrl && (
    !item.url || (item.url && !validateLinkUrl(item.type, item.url))
  ));

  const handleTitleChange = (value: string) => {
    setPageDetails((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        items: prev.items?.map((i) =>
          i.id === item.id
            ? {
                ...i,
                title: value,
              }
            : i
        ),
      };
    });
  };

  const handleTokenGateChange = (checked: boolean) => {
    setPageDetails((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        items: prev.items?.map((i) =>
          i.id === item.id
            ? {
                ...i,
                tokenGated: checked,
                requiredTokens: checked ? ["1"] : undefined, // Default to 1 token when enabled
              }
            : i
        ),
      };
    });
  };

  const handleRequiredTokensChange = (value: string) => {
    // Only allow positive numbers
    if (value && !/^\d+$/.test(value)) return;

    setPageDetails((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        items: prev.items?.map((i) =>
          i.id === item.id
            ? {
                ...i,
                requiredTokens: value ? [value] : undefined,
              }
            : i
        ),
      };
    });
  };

  const handleUrlChange = (value: string) => {
    if (!onUrlChange) return;

    // Format URL based on link type
    let formattedUrl = value.trim();

    if (item.type === 'email') {
      // For email type, add mailto: if it's not already a URL
      if (formattedUrl && !formattedUrl.startsWith('mailto:') && !formattedUrl.match(/^https?:\/\//)) {
        // Remove any existing mailto: prefix to avoid duplication
        const cleanValue = formattedUrl.replace(/^mailto:/, '');
        formattedUrl = `mailto:${cleanValue}`;
      }
    } else {
      // For non-email links, add https:// if missing
      if (formattedUrl && !formattedUrl.match(/^https?:\/\//)) {
        formattedUrl = `https://${formattedUrl}`;
      }
    }

    onUrlChange(formattedUrl);
  };

  return (
    <div ref={setNodeRef} style={style} className="bg-white">
      <Accordion 
        type="single" 
        collapsible
        value={isOpen ? id : ""}
      >
        <AccordionItem value={id} className={`border rounded-lg ${displayError ? 'border-red-500' : 'border-gray-400'}`}>
          <div className="flex items-center px-1">
            <button
              className="cursor-grab py-2 mr-2"
              {...attributes}
              {...listeners}>
              <GripVertical className="h-5 w-5 text-gray-400 flex-shrink-0" />
            </button>
            <AccordionTrigger 
              className="hover:no-underline py-2 flex items-center flex-1"
              onClick={(e) => {
                e.preventDefault();
                onOpen?.(isOpen ? null : id);
              }}
            >
              <div className="flex items-center gap-2 flex-1">
                <div className="flex items-center gap-2">
                  <Icon className="h-5 w-5" />
                  <span className="font-medium">{item.title || linkConfig.label}</span>
                </div>
                {item.tokenGated && (
                  <span className="ml-auto text-xs bg-violet-100 text-violet-800 px-1 py-0.5 rounded">
                    Token gated
                  </span>
                )}
              </div>
            </AccordionTrigger>
          </div>
          <AccordionContent className="px-4 pb-3">
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="block text-sm text-gray-600">Title</label>
                <Input
                  type="text"
                  placeholder={linkConfig.label}
                  value={item.title || ""}
                  onChange={(e) => handleTitleChange(e.target.value)}
                />
              </div>

              {linkConfig.options?.requiresUrl && onUrlChange && (
                <div className="space-y-2">
                  <label className="block text-sm text-gray-600">URL</label>
                  <Input
                    type="text"
                    placeholder={item.type === 'email' ? "Enter email address" : `Enter ${linkConfig.label} URL`}
                    value={item.url ? item.url.replace(/^mailto:/, '') : ''}
                    onChange={(e) => handleUrlChange(e.target.value)}
                    className={displayError ? "border-red-500" : ""}
                  />
                  {displayError && (
                    <p className="text-sm text-red-500 flex items-center gap-1">
                      <AlertCircle className="h-4 w-4" />
                      {error || (!item.url ? `${linkConfig.label} URL is required` : "Invalid URL format")}
                    </p>
                  )}
                </div>
              )}
            </div>
            {linkConfig.options?.canBeTokenGated && (
              <div className="mt-3 space-y-3">
                <div className="flex items-center gap-2">
                  <label className="flex items-center space-x-2">
                    <Checkbox
                      checked={item.tokenGated}
                      onCheckedChange={handleTokenGateChange}
                    />
                    <span className="text-sm text-gray-600">Token gate</span>
                  </label>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <HelpCircle className="h-4 w-4 text-gray-400" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>This requires your visitor to own {tokenSymbol || "tokens"} to get access to this link.</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                {item.tokenGated && (
                  <div className="pl-6 border-l-2 border-violet-200">
                    <label className="block text-sm text-gray-600 mb-1">
                      Required tokens
                    </label>
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        min="1"
                        value={item.requiredTokens?.[0] || "1"}
                        onChange={(e) =>
                          handleRequiredTokensChange(e.target.value)
                        }
                        className="w-24"
                      />
                      {tokenSymbol && (
                        <span className="text-sm text-gray-500">
                          ${tokenSymbol}
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
            <div className="flex justify-end">
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-red-500 hover:bg-red-100">
                    Remove
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will permanently delete this link from your page.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={(e) => {
                        e.stopPropagation();
                        onDelete();
                      }}
                      className="bg-red-500 hover:bg-red-600">
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}

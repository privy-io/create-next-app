import { GetServerSideProps } from "next";
import Head from "next/head";
import { useRouter } from "next/router";
import { useEffect, useState, useRef, useCallback, useMemo } from "react";
import { usePrivy } from "@privy-io/react-auth";
import PagePreview from "../../components/PagePreview";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Trash2, Plus, Menu, X } from "lucide-react";
import { ItemType, PageItem } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { Toaster } from "@/components/ui/toaster";
import { isSolanaWallet } from "@/utils/wallet";

import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";
import TokenSelector from "@/components/TokenSelector";
import { Checkbox } from "@/components/ui/checkbox";

// Add popular Google Fonts
const GOOGLE_FONTS = [
  "Roboto",
  "Open Sans",
  "Lato",
  "Montserrat",
  "Poppins",
  "Raleway",
  "Inter",
  "Nunito",
  "Ubuntu",
  "Playfair Display",
  "Source Sans Pro",
  "Oswald",
  "Merriweather",
  "Quicksand",
  "Rubik",
  "Work Sans",
  "DM Sans",
  "Mulish",
  "Noto Sans",
  "PT Sans",
  "Fira Sans",
  "Josefin Sans",
  "Barlow",
  "Karla",
  "Manrope",
  "Space Grotesk",
  "Outfit",
  "Plus Jakarta Sans",
  "Urbanist",
  "Sora",

  // Adding 50 more fonts
  // Pixel and Retro Style
  "Press Start 2P",
  "VT323",
  "Silkscreen",
  "Pixelify Sans",
  "Minecraft",
  "DotGothic16",

  // Fun and Decorative
  "Pacifico",
  "Comic Neue",
  "Fredoka One",
  "Righteous",
  "Bangers",
  "Permanent Marker",
  "Satisfy",
  "Lobster",
  "Caveat",
  "Dancing Script",
  "Indie Flower",
  "Shadows Into Light",
  "Comfortaa",
  "Abril Fatface",

  // Modern and Trendy
  "Bebas Neue",
  "Dela Gothic One",
  "Exo 2",
  "Orbitron",
  "Chakra Petch",
  "Russo One",
  "Teko",
  "Audiowide",
  "Oxanium",
  "Syncopate",

  // Clean and Professional
  "Albert Sans",
  "Outfit",
  "Cabinet Grotesk",
  "General Sans",
  "Satoshi",
  "Clash Display",
  "Switzer",
  "Supreme",

  // Unique and Stylish
  "Grandstander",
  "Bungee",
  "Monoton",
  "Rubik Mono One",
  "Rubik Glitch",
  "Nabla",
  "Bungee Shade",
  "Londrina Outline",

  // Handwriting
  "Homemade Apple",
  "Kalam",
  "Patrick Hand",
  "Architects Daughter",
  "Rock Salt",
  "Covered By Your Grace",
  "Reenie Beanie",
  "Gloria Hallelujah",

  // Adding 50 more fun fonts
  // Playful & Fun
  "Bubblegum Sans",
  "Luckiest Guy",
  "Bungee Inline",
  "Creepster",
  "Finger Paint",
  "Flavors",
  "Freckle Face",
  "Frijole",
  "Fuzzy Bubbles",
  "Gochi Hand",

  // Quirky & Unique
  "Butcherman",
  "Ewert",
  "Faster One",
  "Fontdiner Swanky",
  "Henny Penny",
  "Jolly Lodger",
  "Kranky",
  "Mystery Quest",
  "Nosifer",
  "Ribeye",

  // Artistic & Decorative
  "Almendra Display",
  "Bonbon",
  "Butterfly Kids",
  "Codystar",
  "Eater",
  "Fascinate",
  "Fleur De Leah",
  "Hanalei",
  "Jacques Francois Shadow",
  "Kirang Haerang",

  // Retro & Vintage
  "Alfa Slab One",
  "Ceviche One",
  "Chela One",
  "Diplomata",
  "Emblema One",
  "Fugaz One",
  "Gorditas",
  "Irish Grover",
  "Kumar One",

  // Whimsical & Cute
  "Annie Use Your Telescope",
  "Cabin Sketch",
  "Chewy",
  "Coming Soon",
  "Cookie",
  "Crafty Girls",
  "Delius Swash Caps",
  "Emilys Candy",
  "Life Savers",
  "Love Ya Like A Sister",
];

// Font categories with their fonts
const FONT_CATEGORIES: Record<string, string[]> = {
  System: ["system"],
  Popular: [
    "Roboto",
    "Open Sans",
    "Lato",
    "Montserrat",
    "Poppins",
    "Inter",
    "Nunito",
    "Ubuntu",
  ],
  "Pixel & Retro": [
    "Press Start 2P",
    "VT323",
    "Silkscreen",
    "Pixelify Sans",
    "DotGothic16",
    "Alfa Slab One",
    "Bungee Shade",
    "Ceviche One",
    "Chela One",
    "Diplomata",
  ],
  "Fun & Decorative": [
    "Pacifico",
    "Comic Neue",
    "Fredoka One",
    "Righteous",
    "Bangers",
    "Permanent Marker",
    "Satisfy",
    "Lobster",
    "Bubblegum Sans",
    "Luckiest Guy",
    "Bungee Inline",
    "Creepster",
  ],
  "Quirky & Unique": [
    "Butcherman",
    "Ewert",
    "Faster One",
    "Fontdiner Swanky",
    "Henny Penny",
    "Jolly Lodger",
    "Kranky",
    "Mystery Quest",
    "Nosifer",
    "Ribeye",
  ],
  Artistic: [
    "Almendra Display",
    "Bonbon",
    "Butterfly Kids",
    "Codystar",
    "Eater",
    "Fascinate",
    "Fleur De Leah",
    "Hanalei",
    "Jacques Francois Shadow",
    "Kirang Haerang",
  ],
  Whimsical: [
    "Annie Use Your Telescope",
    "Cabin Sketch",
    "Chewy",
    "Coming Soon",
    "Cookie",
    "Crafty Girls",
    "Delius Swash Caps",
    "Emilys Candy",
    "Life Savers",
    "Love Ya Like A Sister",
  ],
  "Modern & Trendy": [
    "Bebas Neue",
    "Dela Gothic One",
    "Exo 2",
    "Orbitron",
    "Chakra Petch",
    "Russo One",
    "Teko",
    "Audiowide",
  ],
  "Clean & Professional": [
    "Albert Sans",
    "Outfit",
    "Space Grotesk",
    "Plus Jakarta Sans",
    "Urbanist",
    "Sora",
  ],
  Handwriting: [
    "Homemade Apple",
    "Kalam",
    "Patrick Hand",
    "Architects Daughter",
    "Rock Salt",
    "Dancing Script",
    "Caveat",
    "Gochi Hand",
  ],
};

interface PageData {
  walletAddress: string;
  createdAt: string;
  title?: string;
  description?: string;
  items?: PageItem[];
  updatedAt?: string;
  image?: string;
  slug: string;
  connectedToken?: string;
  tokenSymbol?: string;
  showToken?: boolean;
  showSymbol?: boolean;
  designStyle?: "default" | "minimal" | "modern";
  fonts?: {
    global?: string;
    heading?: string;
    paragraph?: string;
    links?: string;
  };
}

type PageProps = {
  slug: string;
  pageData: PageData | null;
  error?: string;
};

// Helper function to get icon for social link
const getSocialIcon = (type: ItemType | string) => {
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
    case "terminal":
      return "💻";
    default:
      return "🔗";
  }
};

// SortableItem component
function SortableItem({
  id,
  item,
  onUrlChange,
  onDelete,
}: {
  id: string;
  item: PageItem;
  onUrlChange?: (url: string) => void;
  onDelete: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} className="bg-white">
      <Accordion type="single" collapsible>
        <AccordionItem value="item" className="border rounded-lg">
          <div className="flex items-center px-4">
            <button
              className="cursor-grab py-4 mr-2"
              {...attributes}
              {...listeners}>
              <GripVertical className="h-5 w-5 text-gray-400 flex-shrink-0" />
            </button>
            <AccordionTrigger className="hover:no-underline py-4">
              <div className="flex items-center gap-2">
                <span className="text-xl">{getSocialIcon(item.type)}</span>
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
              className="ml-auto mr-2">
              <Trash2 className="h-4 w-4 text-red-500" />
            </Button>
          </div>
          <AccordionContent className="px-4 pb-4 border-t">
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
                />
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}

// Font selector component with lazy loading
function FontSelect({
  value,
  onValueChange,
  defaultValue,
}: {
  value: string;
  onValueChange: (value: string) => void;
  defaultValue: string;
}) {
  const [open, setOpen] = useState(false);
  const [loadedCategories, setLoadedCategories] = useState<string[]>([
    "System",
    "Popular",
  ]);
  const [searchQuery, setSearchQuery] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  const handleScroll = useCallback(
    (e: React.UIEvent<HTMLDivElement>) => {
      const element = e.target as HTMLDivElement;
      const isNearBottom =
        element.scrollHeight - element.scrollTop - element.clientHeight < 200;

      if (isNearBottom && !searchQuery) {
        const unloadedCategories = Object.keys(FONT_CATEGORIES).filter(
          (cat) => !loadedCategories.includes(cat)
        );

        if (unloadedCategories.length > 0) {
          const nextCategory = unloadedCategories[0];
          if (nextCategory) {
            setLoadedCategories((prev) => [...prev, nextCategory]);
          }
        }
      }
    },
    [loadedCategories, searchQuery]
  );

  const displayValue =
    value === defaultValue
      ? defaultValue === "system"
        ? "System Default"
        : "Use global font"
      : value;

  const filteredFonts = useMemo(() => {
    if (!searchQuery) return null;

    const allFonts = Object.values(FONT_CATEGORIES).flat();
    return allFonts.filter((font) =>
      font.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery]);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex w-full h-10 items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
        <span
          style={{ fontFamily: value !== defaultValue ? value : undefined }}>
          {displayValue}
        </span>
        <span className="opacity-50">▼</span>
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-50" onClick={() => setOpen(false)} />
          <div
            className="absolute z-50 w-[300px] max-h-[300px] overflow-auto rounded-md border bg-white shadow-md mt-1"
            ref={scrollRef}
            onScroll={handleScroll}>
            <div className="sticky top-0 bg-white border-b p-2 z-10">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search fonts..."
                className="w-full px-2 py-1 text-sm border rounded"
                onClick={(e) => e.stopPropagation()}
              />
            </div>

            <div className="p-1">
              {/* Default option */}
              <button
                className="relative flex w-full cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-gray-100 text-gray-600"
                onClick={() => {
                  onValueChange(defaultValue);
                  setOpen(false);
                }}>
                {defaultValue === "system"
                  ? "System Default"
                  : "Use global font"}
              </button>

              {searchQuery
                ? // Show search results
                  filteredFonts?.map(
                    (font) =>
                      font !== "system" && (
                        <button
                          key={font}
                          className="relative flex w-full cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-gray-100"
                          onClick={() => {
                            onValueChange(font);
                            setOpen(false);
                          }}>
                          <span style={{ fontFamily: font }}>{font}</span>
                        </button>
                      )
                  )
                : // Show categorized fonts
                  loadedCategories.map((category) => {
                    const fonts = FONT_CATEGORIES[category] || [];
                    return (
                      <div key={category}>
                        <div className="px-2 py-1.5 text-sm font-semibold text-gray-500 bg-gray-50">
                          {category}
                        </div>
                        {fonts.map(
                          (font: string) =>
                            font !== "system" && (
                              <button
                                key={font}
                                className="relative flex w-full cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-gray-100"
                                onClick={() => {
                                  onValueChange(font);
                                  setOpen(false);
                                }}>
                                <span style={{ fontFamily: font }}>{font}</span>
                              </button>
                            )
                        )}
                      </div>
                    );
                  })}

              {!searchQuery &&
                loadedCategories.length <
                  Object.keys(FONT_CATEGORIES).length && (
                  <div className="px-2 py-1.5 text-sm text-gray-400 text-center">
                    Scroll for more fonts...
                  </div>
                )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function GeneralSettingsTab({
  pageDetails,
  setPageDetails,
}: {
  pageDetails: PageData | null;
  setPageDetails: (
    data: PageData | ((prev: PageData | null) => PageData | null)
  ) => void;
}) {
  return (
    <div className="space-y-6 px-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Token
        </label>
        {pageDetails && (
          <div className="space-y-4">
            {pageDetails.connectedToken ? (
              <div className="space-y-4">
                <div>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={pageDetails.connectedToken}
                      readOnly
                      className="flex-1 px-3 py-2 bg-gray-50 border rounded-md text-sm text-gray-600"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setPageDetails((prev) =>
                          prev
                            ? {
                                ...prev,
                                connectedToken: undefined,
                                tokenSymbol: undefined,
                                showToken: false,
                                showSymbol: false,
                              }
                            : null
                        );
                      }}>
                      Disconnect
                    </Button>
                  </div>
                  {pageDetails.tokenSymbol && (
                    <p className="mt-1 text-sm text-gray-500">
                      Symbol: {pageDetails.tokenSymbol}
                    </p>
                  )}
                </div>

                <div className="space-y-2 border-t pt-4">
                  <h3 className="text-sm font-medium text-gray-700 mb-2">
                    Token Display Options
                  </h3>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="show-token"
                      checked={pageDetails.showToken}
                      onCheckedChange={(checked) => {
                        setPageDetails((prev) =>
                          prev
                            ? {
                                ...prev,
                                showToken: checked as boolean,
                              }
                            : null
                        );
                      }}
                    />
                    <label
                      htmlFor="show-token"
                      className="text-sm text-gray-700 cursor-pointer">
                      Show token address on page
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="show-symbol"
                      checked={pageDetails.showSymbol}
                      onCheckedChange={(checked) => {
                        setPageDetails((prev) =>
                          prev
                            ? {
                                ...prev,
                                showSymbol: checked as boolean,
                              }
                            : null
                        );
                      }}
                    />
                    <label
                      htmlFor="show-symbol"
                      className="text-sm text-gray-700 cursor-pointer">
                      Show token symbol on page
                    </label>
                  </div>
                </div>
              </div>
            ) : (
              <TokenSelector
                walletAddress={pageDetails.walletAddress}
                selectedToken={null}
                onTokenSelect={(tokenAddress) => {
                  if (!tokenAddress) return;
                  setPageDetails((prev) =>
                    prev
                      ? {
                          ...prev,
                          connectedToken: tokenAddress,
                          tokenSymbol: undefined, // Clear the symbol when token changes
                        }
                      : null
                  );
                }}
                onMetadataLoad={(metadata) => {
                  if (!metadata) return;
                  setPageDetails((prev) =>
                    prev
                      ? {
                          ...prev,
                          title: metadata.name,
                          description: metadata.description || "",
                          image: metadata.image || "",
                          tokenSymbol: metadata.symbol,
                        }
                      : null
                  );
                }}
              />
            )}
          </div>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Image
        </label>
        <div className="space-y-4">
          {pageDetails?.image && (
            <div className="relative w-32 h-32 rounded-lg overflow-hidden">
              <img
                src={pageDetails.image}
                alt={pageDetails.title}
                className="object-cover w-full h-full"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = "none";
                }}
              />
            </div>
          )}
          <Input
            type="text"
            value={pageDetails?.image || ""}
            onChange={(e) =>
              setPageDetails((prev) =>
                prev
                  ? {
                      ...prev,
                      image: e.target.value,
                    }
                  : null
              )
            }
            placeholder="Enter image URL"
            className="max-w-md"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Title
        </label>
        <Input
          type="text"
          value={pageDetails?.title || ""}
          onChange={(e) =>
            setPageDetails((prev) =>
              prev
                ? {
                    ...prev,
                    title: e.target.value,
                  }
                : null
            )
          }
          maxLength={100}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Description
        </label>
        <textarea
          value={pageDetails?.description || ""}
          onChange={(e) =>
            setPageDetails((prev) =>
              prev
                ? {
                    ...prev,
                    description: e.target.value,
                  }
                : null
            )
          }
          className="w-full p-2 border rounded-md"
          rows={3}
          maxLength={500}
        />
      </div>
    </div>
  );
}

function LinksTab({
  pageDetails,
  setPageDetails,
}: {
  pageDetails: PageData | null;
  setPageDetails: (
    data: PageData | ((prev: PageData | null) => PageData | null)
  ) => void;
}) {
  // Add sensors for drag and drop
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // 8px movement required before drag starts
      }
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    // Add null checks for active/over elements
    if (!active || !over || !pageDetails?.items) return;
    
    if (active.id !== over.id) {
      const oldIndex = pageDetails.items.findIndex((item) => item.id === active.id);
      const newIndex = pageDetails.items.findIndex((item) => item.id === over.id);

      setPageDetails((prevDetails) => {
        if (!prevDetails?.items) return prevDetails;

        const newItems = arrayMove(prevDetails.items, oldIndex, newIndex);

        return {
          ...prevDetails,
          items: newItems,
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
                { type: "private-chat", label: "Private Chat" },
                { type: "terminal", label: "Terminal" }
              ].map(({ type, label, showIfToken }) => {
                if (showIfToken && !pageDetails?.connectedToken) return null;
                const isAdded = pageDetails?.items?.some(
                  (item) => item.type === type
                );
                if (isAdded) return null;

                return (
                  <Button
                    key={type}
                    variant="outline"
                    className="justify-start gap-2"
                    onClick={() => {
                      const newItem: PageItem = {
                        type: type as ItemType,
                        url: "",
                        id: `${type}-${Math.random().toString(36).substr(2, 9)}`,
                      };

                      setPageDetails((prev) => {
                        if (!prev) return prev;
                        return {
                          ...prev,
                          items: [...(prev.items || []), newItem],
                        };
                      });
                    }}>
                    <span className="text-xl">{getSocialIcon(type)}</span>
                    {label}
                  </Button>
                );
              })}
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="mt-4">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}>
          <SortableContext
            items={pageDetails?.items?.map((i) => i.id) || []}
            strategy={verticalListSortingStrategy}>
            <div className="space-y-2">
              {pageDetails?.items?.map((item) => (
                <SortableItem
                  key={item.id}
                  id={item.id}
                  item={item}
                  onUrlChange={(url) => {
                    setPageDetails((prev) => ({
                      ...prev!,
                      items: prev!.items!.map((i) =>
                        i.id === item.id ? { ...i, url } : i
                      ),
                    }));
                  }}
                  onDelete={() => {
                    setPageDetails((prev) => ({
                      ...prev!,
                      items: prev!.items!.filter((i) => i.id !== item.id),
                    }));
                  }}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      </div>
    </div>
  );
}

function DesignTab({
  pageDetails,
  setPageDetails,
}: {
  pageDetails: PageData | null;
  setPageDetails: (
    data: PageData | ((prev: PageData | null) => PageData | null)
  ) => void;
}) {
  return (
    <div className="space-y-6 px-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Style
        </label>
        <Select
          value={pageDetails?.designStyle || "default"}
          onValueChange={(value: "default" | "minimal" | "modern") => {
            setPageDetails((prev) => ({
              ...prev!,
              designStyle: value,
            }));
          }}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Select style" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="default">Default</SelectItem>
            <SelectItem value="minimal">Minimal</SelectItem>
            <SelectItem value="modern">Modern</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-4">
        <h3 className="text-sm font-medium text-gray-700">Typography</h3>

        <div>
          <label className="block text-sm text-gray-600 mb-1">
            Global Font
          </label>
          <FontSelect
            value={pageDetails?.fonts?.global || "system"}
            onValueChange={(value: string) => {
              console.log("Setting global font:", value);
              setPageDetails((prev) => ({
                ...prev!,
                fonts: {
                  ...prev!.fonts,
                  global: value === "system" ? undefined : value,
                },
              }));
            }}
            defaultValue="system"
          />
        </div>

        <div>
          <label className="block text-sm text-gray-600 mb-1">
            Heading Font
          </label>
          <FontSelect
            value={pageDetails?.fonts?.heading || "inherit"}
            onValueChange={(value: string) => {
              console.log("Setting heading font:", value);
              setPageDetails((prev) => ({
                ...prev!,
                fonts: {
                  ...prev!.fonts,
                  heading: value === "inherit" ? undefined : value,
                },
              }));
            }}
            defaultValue="inherit"
          />
        </div>

        <div>
          <label className="block text-sm text-gray-600 mb-1">
            Paragraph Font
          </label>
          <FontSelect
            value={pageDetails?.fonts?.paragraph || "inherit"}
            onValueChange={(value: string) => {
              console.log("Setting paragraph font:", value);
              setPageDetails((prev) => ({
                ...prev!,
                fonts: {
                  ...prev!.fonts,
                  paragraph: value === "inherit" ? undefined : value,
                },
              }));
            }}
            defaultValue="inherit"
          />
        </div>

        <div>
          <label className="block text-sm text-gray-600 mb-1">Links Font</label>
          <FontSelect
            value={pageDetails?.fonts?.links || "inherit"}
            onValueChange={(value: string) => {
              console.log("Setting links font:", value);
              setPageDetails((prev) => ({
                ...prev!,
                fonts: {
                  ...prev!.fonts,
                  links: value === "inherit" ? undefined : value,
                },
              }));
            }}
            defaultValue="inherit"
          />
        </div>
      </div>
    </div>
  );
}

// Shared Components
interface SettingsPanelProps {
  pageDetails: PageData | null;
  setPageDetails: (
    data: PageData | ((prev: PageData | null) => PageData | null)
  ) => void;
  onClose?: () => void;
  isMobile?: boolean;
  isSaving: boolean;
  authenticated: boolean;
  canEdit: boolean;
  linkWallet: () => void;
  handleSavePageDetails: () => void;
  onCancel: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

interface ActionBarProps {
  isSaving: boolean;
  authenticated: boolean;
  canEdit: boolean;
  linkWallet: () => void;
  handleSavePageDetails: () => void;
  onCancel: () => void;
}

function ActionBar({
  isSaving,
  authenticated,
  canEdit,
  linkWallet,
  handleSavePageDetails,
  onCancel,
}: ActionBarProps) {
  return (
    <div className="sticky bottom-0 w-full p-4 bg-background border-t flex justify-end space-x-2">
      <Button
        variant="outline"
        size="sm"
        onClick={onCancel}
        disabled={isSaving}>
        Cancel
      </Button>
      {!authenticated ? (
        <Button onClick={linkWallet} size="sm">
          Connect Wallet to Save
        </Button>
      ) : !canEdit ? (
        <Button disabled>Not Authorized to Edit</Button>
      ) : (
        <Button onClick={handleSavePageDetails} size="sm" disabled={isSaving}>
          {isSaving ? "Saving..." : "Save Changes"}
        </Button>
      )}
    </div>
  );
}

function SettingsPanel({
  pageDetails,
  setPageDetails,
  onClose,
  isMobile,
  isSaving,
  authenticated,
  canEdit,
  linkWallet,
  handleSavePageDetails,
  onCancel,
  activeTab,
  setActiveTab,
}: SettingsPanelProps) {
  return (
    <div className="bg-muted h-screen sticky top-0 right-0 rounded-lg shadow-sm flex flex-col">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="overflow-y-auto flex-1">
        <div className="flex px-5 py-2 gap-4 items-center right-0 z-50 sticky top-0 bg-background border-b">
          <TabsList>
            <TabsTrigger value="general">General Settings</TabsTrigger>
            <TabsTrigger value="links">Links & Features</TabsTrigger>
            <TabsTrigger value="design">Design</TabsTrigger>
          </TabsList>
          {isMobile && onClose && (
            <SheetClose asChild>
              <Button variant="ghost" size="icon" className="ml-auto">
                <X className="h-4 w-4" />
              </Button>
            </SheetClose>
          )}
        </div>

        <TabsContent value="general" className="mt-6 flex-1">
          <GeneralSettingsTab
            pageDetails={pageDetails}
            setPageDetails={setPageDetails}
          />
        </TabsContent>

        <TabsContent value="links" className="mt-6 flex-1">
          <LinksTab pageDetails={pageDetails} setPageDetails={setPageDetails} />
        </TabsContent>

        <TabsContent value="design" className="mt-6 flex-1">
          <DesignTab
            pageDetails={pageDetails}
            setPageDetails={setPageDetails}
          />
        </TabsContent>
        <ActionBar
          isSaving={isSaving}
          authenticated={authenticated}
          canEdit={canEdit}
          linkWallet={linkWallet}
          handleSavePageDetails={handleSavePageDetails}
          onCancel={onCancel}
        />
      </Tabs>
    </div>
  );
}

export const getServerSideProps: GetServerSideProps<PageProps> = async ({
  params,
}) => {
  const slug = params?.page as string;

  try {
    // First fetch the specific page data
    const pageResponse = await fetch(
      `${
        process.env.NODE_ENV === "development" ? "http://localhost:3000" : ""
      }/api/page-store?slug=${slug}`
    );
    const { mapping } = await pageResponse.json();

    if (!mapping) {
      return {
        props: {
          slug,
          pageData: null,
          error: "Page not found",
        },
      };
    }

    return {
      props: {
        slug,
        pageData: mapping,
      },
    };
  } catch (error) {
    console.error("Error fetching page data:", error);
    return {
      props: {
        slug,
        pageData: null,
        error: "Failed to fetch page data",
      },
    };
  }
};

export default function EditPage({ slug, pageData, error }: PageProps) {
  const router = useRouter();
  const { ready, authenticated, user, linkWallet } = usePrivy();
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const [pageDetails, setPageDetails] = useState<PageData | null>(null);
  const [previewData, setPreviewData] = useState<PageData | null>(null);
  const [activeTab, setActiveTab] = useState("general");

  // Initialize state after component mounts to prevent hydration mismatch
  useEffect(() => {
    if (pageData) {
      console.log("Initializing with pageData:", pageData);

      // Initialize fonts object
      const fonts = {
        global: pageData.fonts?.global || undefined,
        heading: pageData.fonts?.heading || undefined,
        paragraph: pageData.fonts?.paragraph || undefined,
        links: pageData.fonts?.links || undefined,
      };

      console.log("Initialized fonts:", fonts);

      const initialPageData: PageData = {
        ...pageData,
        fonts,
      };

      console.log("Initial page data:", initialPageData);
      setPageDetails(initialPageData);
      setPreviewData(initialPageData);
    }
  }, [pageData]);

  // Update preview data whenever pageDetails changes
  useEffect(() => {
    if (pageDetails) {
      setPreviewData({
        ...pageDetails,
        fonts: {
          ...pageDetails.fonts,
        },
      });
    }
  }, [pageDetails]);

  const handleSavePageDetails = async () => {
    if (!pageDetails) return;

    setIsSaving(true);
    try {
      const requestBody = {
        slug,
        walletAddress: pageDetails.walletAddress,
        title: pageDetails.title,
        description: pageDetails.description,
        image: pageDetails.image,
        items: pageDetails.items?.map(item => ({
          id: item.id,
          type: item.type,
          url: item.url,
          tokenGated: item.tokenGated,
          isPlugin: item.isPlugin
        })),
        designStyle: pageDetails.designStyle,
        fonts: pageDetails.fonts,
        connectedToken: pageDetails.connectedToken,
        tokenSymbol: pageDetails.tokenSymbol,
        showToken: pageDetails.showToken,
        showSymbol: pageDetails.showSymbol,
        isSetupWizard: false,
      };

      console.log("Sending request body:", requestBody);

      const response = await fetch("/api/page-store", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
        credentials: "same-origin",
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Save response error:", errorData);
        throw new Error("Failed to save page details");
      }

      const responseData = await response.json();
      console.log("Save response:", responseData);

      toast({
        title: "Changes saved",
        description: "Your page has been updated successfully.",
      });
    } catch (error) {
      console.error("Error saving page details:", error);
      toast({
        title: "Error saving changes",
        description: "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Check if user has permission to edit
  const solanaWallet = user?.linkedAccounts?.find(isSolanaWallet);
  const canEdit =
    authenticated && solanaWallet?.address === pageDetails?.walletAddress;

  // Mobile Sheet Component
  function MobileSheet() {
    return (
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline" size="icon">
            <Menu className="h-4 w-4" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-[500px] p-0">
          <SettingsPanel
            pageDetails={pageDetails}
            setPageDetails={setPageDetails}
            isMobile={true}
            isSaving={isSaving}
            authenticated={authenticated}
            canEdit={canEdit}
            linkWallet={linkWallet}
            handleSavePageDetails={handleSavePageDetails}
            onCancel={() => router.push("/")}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
          />
        </SheetContent>
      </Sheet>
    );
  }

  // Desktop Layout Component
  function DesktopLayout() {
    return (
      <div className="hidden lg:block border-r w-[500px] relative">
        <SettingsPanel
          pageDetails={pageDetails}
          setPageDetails={setPageDetails}
          isMobile={false}
          isSaving={isSaving}
          authenticated={authenticated}
          canEdit={canEdit}
          linkWallet={linkWallet}
          handleSavePageDetails={handleSavePageDetails}
          onCancel={() => router.push("/")}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
        />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-privy-light-blue p-6">
        <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-6">
          <h1 className="text-2xl font-semibold text-red-600">{error}</h1>
          <p className="mt-2 text-gray-600">
            The page "{slug}" could not be found.
          </p>
          <Button className="mt-4" onClick={() => router.push("/dashboard")}>
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Edit {pageDetails?.title || slug} - Page.fun</title>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href={`https://fonts.googleapis.com/css2?family=${GOOGLE_FONTS.map(
            (font) => font.replace(" ", "+")
          ).join("&family=")}&display=swap`}
          rel="stylesheet"
        />
        <link rel="stylesheet" href="/page.css" />
      </Head>

      <main className="min-h-screen">
        <div>
          {/* Mobile Menu Button - Only visible on mobile */}
          <div className="lg:hidden fixed top-4 left-4 z-50">
            <MobileSheet />
          </div>

          <div className="flex">
            {/* Left Column - Settings (Hidden on mobile) */}
            <DesktopLayout />

            {/* Right Column - Live Preview */}
            <div
              className="pf-preview sticky top-0 right-0 flex-1"
              style={{ height: "calc(100vh)" }}>
              {previewData && <PagePreview pageData={previewData} />}
            </div>
          </div>
        </div>
      </main>

      <Toaster />
    </>
  );
}

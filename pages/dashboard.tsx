import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { getAccessToken, usePrivy } from "@privy-io/react-auth";
import Head from "next/head";
import Sidebar from '../components/Sidebar';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { GripVertical, Trash2 } from 'lucide-react';


// Update the PageData type
type PageData = {
  slug: string;
  walletAddress: string;
  connectedToken?: string;
  title?: string;
  description?: string;
  socials?: any[];
}

// Update the PageMapping type
type PageMapping = {
  [slug: string]: PageData;
}

type PageDetails = {
  title: string;
  description: string;
  items: PageItem[];
  image?: string;
}

// Update SortableItem component
function SortableItem({ 
  item, 
  isEditingPage, 
  onUrlChange, 
  onDelete 
}: { 
  item: PageItem;
  isEditingPage: boolean;
  onUrlChange?: (url: string) => void;
  onDelete: () => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center space-x-4 bg-white p-4 rounded-lg border"
    >
      {isEditingPage && (
        <button
          className="cursor-grab"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="h-5 w-5 text-gray-400 flex-shrink-0" />
        </button>
      )}
      <div className="flex-1">
        <div className="font-medium capitalize mb-1">
          {item.type}
        </div>
        {!item.isPlugin && (
          <Input
            type="text"
            value={item.url || ''}
            onChange={(e) => onUrlChange?.(e.target.value)}
            disabled={!isEditingPage}
            placeholder={`Enter ${item.type} URL`}
          />
        )}
      </div>
      {isEditingPage && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onDelete}
        >
          <Trash2 className="h-4 w-4 text-red-500" />
        </Button>
      )}
    </div>
  );
}

// Update the ItemType type
type ItemType = 'twitter' | 'telegram' | 'dexscreener' | 'tiktok' | 'instagram' | 'email' | 'discord' | 'private-chat' | 'terminal' | 'filesystem';

// Update the PageItem type
type PageItem = {
  id: string;
  type: ItemType;
  url?: string;
  order: number;
  isPlugin?: boolean;
}

export default function DashboardPage() {
  const [verifyResult, setVerifyResult] = useState();
  const router = useRouter();
  const {
    ready,
    authenticated,
    user,
    logout,
  } = usePrivy();

  const [selectedToken, setSelectedToken] = useState<string | null>(null);
  // Add state for mappings
  const [mappedSlugs, setMappedSlugs] = useState<string[]>([]);
  const [isLoadingMappings, setIsLoadingMappings] = useState(false);
  const [mappings, setMappings] = useState<PageMapping>({});
  const [pageDetails, setPageDetails] = useState<PageDetails | null>(null);
  const [isEditingPage, setIsEditingPage] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Add sensors for drag and drop
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    if (ready && !authenticated) {
      router.push("/");
    }
  }, [ready, authenticated, router]);

  // Handle saving page details
  const handleSavePageDetails = async () => {
    if (!pageDetails || !mappedSlugs.length) return;

    setIsSaving(true);
    try {
      // Split items back into socials and plugins
      const socials = pageDetails.items
        .filter(item => !item.isPlugin)
        .map(({ isPlugin, ...item }) => item);
      
      const plugins = pageDetails.items
        .filter(item => item.isPlugin)
        .map(({ isPlugin, url, ...item }) => item);

      const response = await fetch('/api/page-mapping', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          slug: mappedSlugs[0],
          title: pageDetails.title,
          description: pageDetails.description,
          image: pageDetails.image,
          socials,
          plugins
        }),
        credentials: 'same-origin'
      });

      if (!response.ok) {
        throw new Error('Failed to save page details');
      }

      setIsEditingPage(false);
    } catch (error) {
      console.error('Error saving page details:', error);
    } finally {
      setIsSaving(false);
    }
  };

  // Update the drag end handler
  const handleDragEnd = (event: any) => {
    const { active, over } = event;

    if (active.id !== over.id && pageDetails) {
      const oldIndex = pageDetails.items.findIndex((item) => item.id === active.id);
      const newIndex = pageDetails.items.findIndex((item) => item.id === over.id);

      setPageDetails(prevDetails => {
        if (!prevDetails) return null;
        
        const newItems = arrayMove(prevDetails.items, oldIndex, newIndex).map(
          (item, index) => ({ ...item, order: index })
        );

        return {
          ...prevDetails,
          items: newItems
        };
      });
    }
  };

  return (
    <>
      <Head>
        <title>Privy Auth Demo</title>
      </Head>

      <main className="flex min-h-screen bg-privy-light-blue">
        {/* Sidebar */}
        <Sidebar 
          isLoadingMappings={isLoadingMappings}
          mappedSlugs={mappedSlugs}
          mappings={mappings}
          setMappedSlugs={setMappedSlugs}
          setMappings={setMappings}
        />

        {/* Main Content */}
        <div className="flex-1 px-4 sm:px-20 py-6 sm:py-10">
        {ready && authenticated && pageDetails && mappedSlugs.length > 0 ? (
          <div className="space-y-8">
            <div className="flex justify-between items-center">
              <h1 className="text-2xl font-semibold">Page Settings</h1>
              {isEditingPage ? (
                <div className="space-x-2">
                  <Button
                    variant="outline"
                    onClick={() => setIsEditingPage(false)}
                    disabled={isSaving}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSavePageDetails}
                    disabled={isSaving}
                  >
                    {isSaving ? 'Saving...' : 'Save Changes'}
                  </Button>
                </div>
              ) : (
                <Button onClick={() => setIsEditingPage(true)}>
                  Edit Page
                </Button>
              )}
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Image
                </label>
                <div className="space-y-4">
                  {pageDetails.image && (
                    <div className="relative w-32 h-32 rounded-lg overflow-hidden">
                      <img
                        src={pageDetails.image}
                        alt={pageDetails.title}
                        className="object-cover w-full h-full"
                        onError={(e) => {
                          // Hide image on error
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    </div>
                  )}
                  <Input
                    type="text"
                    value={pageDetails.image || ''}
                    onChange={(e) => setPageDetails(prev => ({
                      ...prev!,
                      image: e.target.value
                    }))}
                    disabled={!isEditingPage}
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
                  value={pageDetails.title}
                  onChange={(e) => setPageDetails({
                    ...pageDetails,
                    title: e.target.value
                  })}
                  disabled={!isEditingPage}
                  maxLength={100}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={pageDetails.description}
                  onChange={(e) => setPageDetails({
                    ...pageDetails,
                    description: e.target.value
                  })}
                  disabled={!isEditingPage}
                  className="w-full p-2 border rounded-md"
                  rows={3}
                  maxLength={500}
                />
              </div>

              <div>
                <h2 className="text-lg font-semibold mb-4">Social Links</h2>
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleDragEnd}
                >
                  <SortableContext
                    items={pageDetails.items.map(i => i.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    <div className="space-y-2">
                      {pageDetails.items.map((item) => (
                        <SortableItem
                          key={item.id}
                          item={item}
                          isEditingPage={isEditingPage}
                          onUrlChange={!item.isPlugin ? (url) => {
                            setPageDetails(prev => ({
                              ...prev!,
                              items: prev!.items.map(i =>
                                i.id === item.id ? { ...i, url } : i
                              )
                            }));
                          } : undefined}
                          onDelete={() => {
                            setPageDetails(prev => ({
                              ...prev!,
                              items: prev!.items.filter(i => i.id !== item.id)
                            }));
                          }}
                        />
                      ))}
                    </div>
                  </SortableContext>
                </DndContext>
              </div>
            </div>
          </div>
        ) : null}
        </div>
      </main>
    </>
  );
}

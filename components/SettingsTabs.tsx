import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GeneralSettingsTab } from "./tabs/GeneralSettingsTab";
import { LinksDrawer } from "./drawers/LinksDrawer";
import { DesignTab } from "./tabs/DesignTab";
import { PageData } from "@/types";
import { useState } from "react";

interface SettingsTabsProps {
  pageDetails: PageData | null;
  setPageDetails: (
    data: PageData | ((prev: PageData | null) => PageData | null),
  ) => void;
  extraHeaderContent?: React.ReactNode;
  isAuthenticated: boolean;
  canEdit: boolean;
  onConnect: () => void;
  selectedTab?: string;
  onTabChange?: (tab: string) => void;
  onClose?: () => void;
  onLinkAdd?: (linkId: string) => void;
}

export function SettingsTabs({
  pageDetails,
  setPageDetails,
  extraHeaderContent,
  isAuthenticated,
  canEdit,
  onConnect,
  selectedTab = "general",
  onTabChange,
  onClose,
  onLinkAdd,
}: SettingsTabsProps) {
  const [validationErrors, setValidationErrors] = useState<{ [key: string]: string }>({});
  const hasErrors = Object.keys(validationErrors).length > 0;

  return (
    <div className="flex flex-col h-full">
      <Tabs 
        value={selectedTab} 
        onValueChange={onTabChange}
        className="flex-1"
      >
        <div className="flex px-6 py-2 mb-5 gap-4 items-center sticky top-0 right-0 bg-background border-b z-50">
          <TabsList>
            <TabsTrigger value="general">Settings</TabsTrigger>
            <TabsTrigger value="links" className="relative">
              Links & Plugins
              {hasErrors && (
                <span className="ml-2 w-2 h-2 bg-red-500 rounded-full" />
              )}
            </TabsTrigger>
            <TabsTrigger value="design">Design</TabsTrigger>
          </TabsList>
          {extraHeaderContent}
        </div>

        <TabsContent value="general" className="mt-0">
          <GeneralSettingsTab
            pageDetails={pageDetails}
            setPageDetails={setPageDetails}
          />
        </TabsContent>

        <TabsContent value="links" className="mt-0">
          <LinksDrawer
            pageDetails={pageDetails}
            setPageDetails={setPageDetails}
            open={selectedTab === "links"}
            onOpenChange={(open) => {
              if (open) {
                onTabChange?.("links");
              }
            }}
            onLinkAdd={onLinkAdd}
          />
        </TabsContent>

        <TabsContent value="design" className="mt-0">
          <DesignTab
            pageDetails={pageDetails}
            setPageDetails={setPageDetails}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

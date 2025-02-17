import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GeneralSettingsTab } from "./tabs/GeneralSettingsTab";
import { LinksTab } from "./tabs/LinksTab";
import { DesignTab } from "./tabs/DesignTab";
import { SaveBar } from "./SaveBar";
import { PageData } from "@/types";
import { useState } from "react";

interface SettingsTabsProps {
  pageDetails: PageData | null;
  setPageDetails: (
    data: PageData | ((prev: PageData | null) => PageData | null),
  ) => void;
  extraHeaderContent?: React.ReactNode;
  isSaving: boolean;
  isAuthenticated: boolean;
  canEdit: boolean;
  onSave: () => void;
  onConnect: () => void;
  selectedTab?: string;
  onTabChange?: (tab: string) => void;
  openLinkId?: string | null;
  onLinkOpen?: (id: string | null) => void;
}

export function SettingsTabs({
  pageDetails,
  setPageDetails,
  extraHeaderContent,
  isSaving,
  isAuthenticated,
  canEdit,
  onSave,
  onConnect,
  selectedTab = "general",
  onTabChange,
  openLinkId,
  onLinkOpen,
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
          <LinksTab
            pageDetails={pageDetails}
            setPageDetails={setPageDetails}
            isAuthenticated={isAuthenticated}
            canEdit={canEdit}
            onConnect={onConnect}
            openLinkId={openLinkId || undefined}
            onLinkOpen={onLinkOpen}
            onValidationErrorsChange={setValidationErrors}
          />
        </TabsContent>

        <TabsContent value="design" className="mt-0">
          <DesignTab
            pageDetails={pageDetails}
            setPageDetails={setPageDetails}
          />
        </TabsContent>
      </Tabs>

      <SaveBar
        isSaving={isSaving}
        isAuthenticated={isAuthenticated}
        canEdit={canEdit}
        onSave={onSave}
        onConnect={onConnect}
      />
    </div>
  );
}

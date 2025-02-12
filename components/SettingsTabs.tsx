import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GeneralSettingsTab } from "./tabs/GeneralSettingsTab";
import { LinksTab } from "./tabs/LinksTab";
import { DesignTab } from "./tabs/DesignTab";
import { SaveBar } from "./SaveBar";
import { PageData } from "@/types";
import { Logo } from "./logo";
import AppMenu from "./AppMenu";

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
}: SettingsTabsProps) {
  return (
    <div className="flex flex-col h-full">
      <Tabs defaultValue="general" className="flex-1">
        <div className="flex px-4 py-2 mb-5 gap-4 items-center sticky top-0 right-0 bg-background border-b z-50">
          <AppMenu />
          <TabsList>
            <TabsTrigger value="general">Settings</TabsTrigger>
            <TabsTrigger value="links">Links & Features</TabsTrigger>
            <TabsTrigger value="design">Design</TabsTrigger>
          </TabsList>
          {extraHeaderContent}
        </div>

        <TabsContent value="general" className="flex-1">
          <GeneralSettingsTab
            pageDetails={pageDetails}
            setPageDetails={setPageDetails}
          />
        </TabsContent>

        <TabsContent value="links" className="flex-1">
          <LinksTab pageDetails={pageDetails} setPageDetails={setPageDetails} />
        </TabsContent>

        <TabsContent value="design">
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

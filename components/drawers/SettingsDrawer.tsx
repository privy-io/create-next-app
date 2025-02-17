import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GeneralSettingsTab } from "@/components/tabs/GeneralSettingsTab";
import { DesignTab } from "@/components/tabs/DesignTab";
import { PageData } from "@/types";

interface SettingsDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pageDetails: PageData | null;
  setPageDetails: (
    data: PageData | ((prev: PageData | null) => PageData | null)
  ) => void;
}

export function SettingsDrawer({
  open,
  onOpenChange,
  pageDetails,
  setPageDetails,
}: SettingsDrawerProps) {
  return (
    <Drawer open={open} onOpenChange={onOpenChange} direction="right">
      <DrawerContent direction="right" className="h-full">
        <Tabs defaultValue="general" className="h-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="design">Design</TabsTrigger>
          </TabsList>
          <TabsContent value="general">
            <GeneralSettingsTab
              pageDetails={pageDetails}
              setPageDetails={setPageDetails}
            />
          </TabsContent>
          <TabsContent value="design">
            <DesignTab
              pageDetails={pageDetails}
              setPageDetails={setPageDetails}
            />
          </TabsContent>
        </Tabs>
      </DrawerContent>
    </Drawer>
  );
}

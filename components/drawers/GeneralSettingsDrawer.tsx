import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { GeneralSettingsTab } from "@/components/tabs/GeneralSettingsTab";
import { PageData } from "@/types";

interface GeneralSettingsDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pageDetails: PageData | null;
  setPageDetails: (data: PageData | ((prev: PageData | null) => PageData | null)) => void;
}

export function GeneralSettingsDrawer({
  open,
  onOpenChange,
  pageDetails,
  setPageDetails,
}: GeneralSettingsDrawerProps) {
  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="max-h-[95vh]">
        <DrawerHeader>
          <DrawerTitle>Settings</DrawerTitle>
        </DrawerHeader>
        <GeneralSettingsTab
          pageDetails={pageDetails}
          setPageDetails={setPageDetails}
        />
      </DrawerContent>
    </Drawer>
  );
} 
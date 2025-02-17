import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { DesignTab } from "@/components/tabs/DesignTab";
import { PageData } from "@/types";

interface DesignDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pageDetails: PageData | null;
  setPageDetails: (data: PageData | ((prev: PageData | null) => PageData | null)) => void;
}

export function DesignDrawer({
  open,
  onOpenChange,
  pageDetails,
  setPageDetails,
}: DesignDrawerProps) {
  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="max-h-[95vh]">
        <DrawerHeader>
          <DrawerTitle>Design</DrawerTitle>
        </DrawerHeader>
        <DesignTab
          pageDetails={pageDetails}
          setPageDetails={setPageDetails}
        />
      </DrawerContent>
    </Drawer>
  );
} 
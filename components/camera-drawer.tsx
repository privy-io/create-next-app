import { Drawer, DrawerContent, DrawerTrigger } from "./ui/drawer";

import { Camera } from "lucide-react";
import CameraRender from "./camera-render";
import { useState } from "react";

const CameraDrawer = () => {
  const [isOpen, setIsOpen] = useState(false);

  const closeDrawer = () => {
    setIsOpen(false);
  };

  return (
    <Drawer open={isOpen} onOpenChange={(state) => setIsOpen(state)}>
      <DrawerTrigger className="w-full border border-white rounded-full px-4 py-1 flex items-center justify-center text-white hover:ring ring-white">
        <Camera />
      </DrawerTrigger>
      <DrawerContent className="rounded-tr-3xl rounded-tl-3xl w-[450px] left-[calc(50%-225px)] cursor-grab active:cursor-grabbing">
        <div className="mx-auto max-w-full px-8 md:px-0">
          <CameraRender uploadCallback={closeDrawer} />
        </div>
      </DrawerContent>
    </Drawer>
  );
};

export default CameraDrawer;

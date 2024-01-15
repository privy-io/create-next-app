import { Drawer, DrawerContent, DrawerTrigger } from "./ui/drawer";

import { Camera } from "lucide-react";
import CameraRender from "./camera-render";

const CameraDrawer = () => {
  return (
    <Drawer>
      <DrawerTrigger className="w-full border border-white rounded-full px-4 py-1 flex items-center justify-center text-white hover:ring ring-white">
        <Camera />
      </DrawerTrigger>
      <DrawerContent className="rounded-tr-3xl rounded-tl-3xl w-[450px] left-[calc(50%-225px)] cursor-grab active:cursor-grabbing">
        <div className="max-w-lg mx-auto">
          <CameraRender />
        </div>
      </DrawerContent>
    </Drawer>
  );
};

export default CameraDrawer;

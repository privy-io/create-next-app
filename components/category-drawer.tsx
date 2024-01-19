import { CATEGORIES, useCategory } from "./category-context";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "./ui/sheet";

import { GanttChart } from "lucide-react";
import { useState } from "react";

const CategoryDrawer = () => {
  const { setCategory } = useCategory();

  function getUnsplashImageUrl(category: string) {
    return `https://source.unsplash.com/random/335x80/?${encodeURIComponent(
      category
    )}`;
  }

  const [isOpen, setIsOpen] = useState(false);

  const closeSheet = () => {
    setIsOpen(false);
  };

  const handleCategorySelect = (category: CATEGORIES) => {
    setCategory(category);
    closeSheet();
  };

  return (
    <Sheet onOpenChange={(state) => setIsOpen(state)} open={isOpen}>
      <SheetTrigger className="rounded-full px-4 py-1 flex items-center justify-center text-white hover:bg-black/60">
        <GanttChart />
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle className="text-xl font-bold mb-4">Categories</SheetTitle>
          <SheetDescription>
            <div className="flex flex-col gap-4">
              {Object.values(CATEGORIES).map((category, index) => (
                <div
                  key={`category-${index}`}
                  className="category-card relative bg-cover bg-center rounded-xl shadow-md cursor-pointer hover:shadow-lg overflow-hidden"
                  style={{
                    backgroundImage: `url(${getUnsplashImageUrl(category)})`,
                  }}
                  onClick={() => handleCategorySelect(category)}
                >
                  <div className="category-label p-2 bg-black bg-opacity-50 text-white text-xl rounded-b-lg h-20 flex items-center justify-center">
                    {category}
                  </div>
                </div>
              ))}
            </div>
          </SheetDescription>
        </SheetHeader>
      </SheetContent>
    </Sheet>
  );
};

export default CategoryDrawer;

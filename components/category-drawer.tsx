import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "./ui/sheet";

import { GanttChart } from "lucide-react";
import { Label } from "./ui/label";

const CATEGORIES = [
  "People",
  "Nature",
  "Animals",
  "Food",
  "Architecture",
  "Objects",
  "Art",
  "Other",
];

const CategoryDrawer = () => {
  return (
    <Sheet>
      <SheetTrigger className="rounded-full px-4 py-1 flex items-center justify-center text-white hover:bg-black/60">
        <GanttChart />
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle className="text-xl font-bold mb-4">Categories</SheetTitle>
          <SheetDescription>
            <RadioGroup>
              {CATEGORIES.map((category) => (
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value={category} id={category} />
                  <Label
                    htmlFor={category}
                    className="text-xl py-1 text-neutral-900 font-normal"
                  >
                    {category}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </SheetDescription>
        </SheetHeader>
      </SheetContent>
    </Sheet>
  );
};

export default CategoryDrawer;

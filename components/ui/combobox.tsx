"use client";

import * as React from "react";

import { CaretSortIcon, CheckIcon } from "@radix-ui/react-icons";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

import { Button } from "@/components/ui/button";
import { CATEGORIES } from "../category-context";
import { cn } from "@/lib/utils";

const OPTIONS_TO_SELECT = [
  ...Object.values(CATEGORIES).map((c) => ({
    value: c,
    label: c,
  })),
];
console.log("🚀 ~ OPTIONS_TO_SELECT:", OPTIONS_TO_SELECT);

type Props = {
  setValue: (value: string) => void;
  value: string;
};

export function ComboboxDemo({ value, setValue }: Props) {
  console.log("🚀 ~ ComboboxDemo ~ value:", value);
  const [open, setOpen] = React.useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
        >
          {value
            ? OPTIONS_TO_SELECT.find(
                (c) => c.value.toLocaleLowerCase() === value
              )?.label
            : "Select category..."}
          <CaretSortIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0">
        <Command>
          <CommandInput placeholder="Search category..." className="h-9" />
          <CommandEmpty>No category found.</CommandEmpty>
          <CommandGroup>
            {OPTIONS_TO_SELECT.map((category) => (
              <CommandItem
                key={category.value}
                value={category.value}
                onSelect={(currentValue) => {
                  setValue(currentValue === value ? "" : currentValue);
                  setOpen(false);
                }}
              >
                {category.label}
                <CheckIcon
                  className={cn(
                    "ml-auto h-4 w-4",
                    value === category.value ? "opacity-100" : "opacity-0"
                  )}
                />
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

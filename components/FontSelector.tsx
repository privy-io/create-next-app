import { useEffect, useState } from "react";
import { FONT_CATEGORIES } from "@/lib/fonts";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import Head from "next/head";

interface FontSelectProps {
  value: string;
  onValueChange: (value: string) => void;
  defaultValue: string;
}

export function FontSelect({
  value,
  onValueChange,
  defaultValue,
}: FontSelectProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [loadedFonts, setLoadedFonts] = useState<Set<string>>(new Set());

  // Load font for current value if not already loaded
  useEffect(() => {
    if (value && value !== defaultValue && !loadedFonts.has(value)) {
      const link = document.createElement("link");
      link.href = `https://fonts.googleapis.com/css2?family=${value.replace(" ", "+")}`;
      link.rel = "stylesheet";
      document.head.appendChild(link);
      setLoadedFonts((prev) => new Set([...prev, value]));
    }
  }, [value, defaultValue, loadedFonts]);

  // Load all fonts for the category when it's first rendered
  useEffect(() => {
    const allFonts = Object.values(FONT_CATEGORIES).flat();
    const fontsToLoad = allFonts.filter(
      (font) => !loadedFonts.has(font) && font !== "system",
    );

    if (fontsToLoad.length > 0) {
      const link = document.createElement("link");
      link.href = `https://fonts.googleapis.com/css2?family=${fontsToLoad.map((font) => font.replace(" ", "+")).join("&family=")}`;
      link.rel = "stylesheet";
      document.head.appendChild(link);
      setLoadedFonts((prev) => new Set([...prev, ...fontsToLoad]));
    }
  }, [loadedFonts]);

  const displayValue =
    value === defaultValue
      ? defaultValue === "system"
        ? "System Default"
        : "Use global font"
      : value;

  const filteredCategories = Object.entries(FONT_CATEGORIES)
    .map(([category, fonts]) => ({
      category,
      fonts: fonts.filter(
        (font) =>
          !searchQuery ||
          font.toLowerCase().includes(searchQuery.toLowerCase()),
      ),
    }))
    .filter(({ fonts }) => fonts.length > 0);

  return (
    <>
      <Head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
      </Head>
      <Select value={value} onValueChange={onValueChange}>
        <SelectTrigger>
          <SelectValue>
            <span
              style={{ fontFamily: value !== defaultValue ? value : undefined }}
            >
              {displayValue}
            </span>
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          <div className="sticky top-0 bg-white border-b p-2 z-10">
            <Input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search fonts..."
              className="h-8"
            />
          </div>
          <ScrollArea className="h-[200px]">
            <SelectGroup>
              <SelectItem value={defaultValue}>
                {defaultValue === "system"
                  ? "System Default"
                  : "Use global font"}
              </SelectItem>

              {filteredCategories.map(({ category, fonts }) => (
                <SelectGroup key={category}>
                  <SelectLabel className="px-2 py-1.5 text-sm font-semibold text-muted-foreground bg-muted/50">
                    {category}
                  </SelectLabel>
                  {fonts.map(
                    (font) =>
                      font !== "system" && (
                        <SelectItem
                          key={font}
                          value={font}
                          style={{ fontFamily: font }}
                        >
                          {font}
                        </SelectItem>
                      ),
                  )}
                </SelectGroup>
              ))}
            </SelectGroup>
          </ScrollArea>
        </SelectContent>
      </Select>
    </>
  );
}

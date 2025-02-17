import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FontSelect } from "@/components/FontSelector";
import { PageData } from "@/types";
import { ThemeStyle, themes } from "@/lib/themes";

interface DesignTabProps {
  pageDetails: PageData | null;
  setPageDetails: (
    data: PageData | ((prev: PageData | null) => PageData | null),
  ) => void;
}

export function DesignTab({ pageDetails, setPageDetails }: DesignTabProps) {
  const handleThemeChange = (value: ThemeStyle) => {
    const themePreset = themes[value];
    setPageDetails((prev) => ({
      ...prev!,
      designStyle: value,
      fonts: {
        global: themePreset.fonts.global || 'system',
        heading: themePreset.fonts.heading || 'inherit',
        paragraph: themePreset.fonts.paragraph || 'inherit',
        links: themePreset.fonts.links || 'inherit'
      }
    }));
  };

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-base font-bold text-gray-700 mb-1">
          Style
        </label>
        <Select
          value={pageDetails?.designStyle || "default"}
          onValueChange={handleThemeChange}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select style" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="default">Default</SelectItem>
            <SelectItem value="minimal">Minimal</SelectItem>
            <SelectItem value="modern">Modern</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-4 border-t pt-4">
        <h3 className="text-base font-bold text-gray-700">Typography</h3>

        <div>
          <label className="block text-sm text-gray-600 mb-1">
            Global Font
          </label>
          <FontSelect
            value={pageDetails?.fonts?.global || "system"}
            onValueChange={(value: string) => {
              setPageDetails((prev) => ({
                ...prev!,
                fonts: {
                  ...prev!.fonts,
                  global: value === "system" ? undefined : value,
                },
              }));
            }}
            defaultValue="system"
          />
        </div>

        <div>
          <label className="block text-sm text-gray-600 mb-1">
            Heading Font
          </label>
          <FontSelect
            value={pageDetails?.fonts?.heading || "inherit"}
            onValueChange={(value: string) => {
              setPageDetails((prev) => ({
                ...prev!,
                fonts: {
                  ...prev!.fonts,
                  heading: value === "inherit" ? undefined : value,
                },
              }));
            }}
            defaultValue="inherit"
          />
        </div>

        <div>
          <label className="block text-sm text-gray-600 mb-1">
            Paragraph Font
          </label>
          <FontSelect
            value={pageDetails?.fonts?.paragraph || "inherit"}
            onValueChange={(value: string) => {
              setPageDetails((prev) => ({
                ...prev!,
                fonts: {
                  ...prev!.fonts,
                  paragraph: value === "inherit" ? undefined : value,
                },
              }));
            }}
            defaultValue="inherit"
          />
        </div>

        <div>
          <label className="block text-sm text-gray-600 mb-1">Links Font</label>
          <FontSelect
            value={pageDetails?.fonts?.links || "inherit"}
            onValueChange={(value: string) => {
              setPageDetails((prev) => ({
                ...prev!,
                fonts: {
                  ...prev!.fonts,
                  links: value === "inherit" ? undefined : value,
                },
              }));
            }}
            defaultValue="inherit"
          />
        </div>
      </div>
    </div>
  );
}

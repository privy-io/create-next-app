import { Button } from "@/components/ui/button";
import { Settings, Link2 } from "lucide-react";

interface FloatingButtonsProps {
  onSettingsClick: () => void;
  onLinksClick: () => void;
}

export function FloatingButtons({
  onSettingsClick,
  onLinksClick,
}: FloatingButtonsProps) {
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 flex gap-2 bg-background/80 backdrop-blur-sm p-2 rounded-full border shadow-lg">
      <Button
        variant="ghost"
        size="sm"
        className="rounded-full w-10 h-10 p-0"
        onClick={onSettingsClick}
      >
        <Settings className="h-5 w-5" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        className="rounded-full w-10 h-10 p-0"
        onClick={onLinksClick}
      >
        <Link2 className="h-5 w-5" />
      </Button>
    </div>
  );
} 
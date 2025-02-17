import { Button } from "@/components/ui/button";
import { useRouter } from "next/router";

interface ActionBarProps {
  onSettingsClick: () => void;
  onLinksClick: () => void;
  isSaving: boolean;
  onSave: () => void;
}

export function ActionBar({
  onSettingsClick,
  isSaving,
  onSave,
}: ActionBarProps) {
  const router = useRouter();

  return (
    <>
      {/* Top bar with save controls */}
      <div className="fixed top-2 right-2 z-40">
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={onSettingsClick}>
            Settings
          </Button>
          <Button onClick={onSave} disabled={isSaving}>
            {isSaving ? "Saving..." : "Publish"}
          </Button>
        </div>
      </div>
    </>
  );
}

import { Button } from "@/components/ui/button";
import { Settings, Settings2, X } from "lucide-react";
import { useRouter } from "next/router";
import Link from "next/link";
import Loader from "@/components/ui/loader";

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
      <div className="fixed top-2 right-2 z-40 animate-slide-down">
        <div className="flex items-center gap-3">
          <Button onClick={onSave} disabled={isSaving} className="gap-2">
            {isSaving ? (
              <>
                <Loader className="h-4 w-4" />
                <span>Saving...</span>
              </>
            ) : (
              "Publish"
            )}
          </Button>
          <Button variant="outline" size={"icon"} onClick={onSettingsClick}>
            <Settings2 />
          </Button>
          <Link href={`/${router.query.page}`}>
            <Button variant="outline" size={"icon"}>
              <X />
            </Button>
          </Link>
        </div>
      </div>
    </>
  );
}

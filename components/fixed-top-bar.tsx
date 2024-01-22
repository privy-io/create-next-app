import React, { MouseEvent, useEffect, useState } from "react";

import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: Array<string>;
  readonly userChoice: Promise<{
    outcome: "accepted" | "dismissed";
    platform: string;
  }>;
  prompt(): Promise<void>;
}

const InstallPWA: React.FC = () => {
  const [supportsPWA, setSupportsPWA] = useState<boolean>(false);
  const [promptInstall, setPromptInstall] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [close, setClose] = useState<boolean>(false);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      const beforeInstallPromptEvent = e as BeforeInstallPromptEvent;
      setSupportsPWA(true);
      setPromptInstall(beforeInstallPromptEvent);
    };
    window.addEventListener("beforeinstallprompt", handler);

    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const onClick = (evt: MouseEvent<HTMLButtonElement>) => {
    evt.preventDefault();
    if (!promptInstall) {
      return;
    }
    promptInstall.prompt();
  };

  return (
    <div
      className={cn(
        "fixed top-0 inset-x-0 py-3 bg-white/40 z-50 backdrop-blur-md flex items-center justify-center rounded-b-2xl shadow-lg",
        {
          hidden: close,
        }
      )}
    >
      {!supportsPWA ? (
        <p className="text-center text-sm p-5 md:p-0">
          Add our app to your home screen. Click on the share button and then
          click on 'Add to Home Screen'
        </p>
      ) : (
        <button
          onClick={onClick}
          aria-label="Install app"
          title="Install App"
          className="text-sm"
        >
          Click here to add our app to your home screen
        </button>
      )}

      <button
        className="absolute top-0 right-0 p-3"
        onClick={() => setClose(true)}
      >
        <X />
      </button>
    </div>
  );
};

export default InstallPWA;

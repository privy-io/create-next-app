import { ArrowRightIcon, ArrowUpRightIcon } from "@heroicons/react/16/solid";
import { PrivyLogo } from "./privy-logo";

export function Header() {
  return (
    <header className="h-[60px] flex flex-row justify-between items-center px-6 border-b bg-white border-[#E2E3F0]">
      <div className="flex flex-row items-center gap-2 h-[26px]">
        <PrivyLogo className="w-[103.48px] h-[23.24px]" />

        <div className="text-medium flex h-[22px] items-center justify-center rounded-[11px] border border-primary px-[0.375rem] text-[0.75rem] text-primary">
          Next.js Demo
        </div>
      </div>

      <div className="flex flex-row justify-end items-center gap-4 h-9">
        <a
          className="text-primary flex flex-row items-center gap-1 cursor-pointer"
          href="https://docs.privy.io/basics/react/installation"
          target="_blank"
          rel="noreferrer"
        >
          Docs <ArrowUpRightIcon className="h-4 w-4" strokeWidth={2} />
        </a>

        <button className="button-primary rounded-full hidden md:block">
          <a
            className="flex flex-row items-center gap-2"
            href="https://dashboard.privy.io/"
            target="_blank"
            rel="noreferrer"
          >
            <span> Go to dashboard</span>
            <ArrowRightIcon className="h-4 w-4" strokeWidth={2} />
          </a>
        </button>
      </div>
    </header>
  );
}

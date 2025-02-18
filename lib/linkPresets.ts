import {
  MessageSquare,
  Instagram,
  MessageCircle,
  Terminal,
  FolderTree,
  Video,
} from "lucide-react";
import { TikTokIcon, DexScreenerIcon, TwitterIcon, DiscordIcon, TelegramIcon, JupiterIcon, FacebookIcon, GitHubIcon, BubblemapsIcon } from "./icons";

export interface LinkPreset {
  id: string;
  title: string;
  url?: string;
  defaultUrl?: string;
  icon: {
    classic: any; // Using any here since we're directly importing from lucide-react
  };
  options?: {
    requiresUrl?: boolean;
    canBeTokenGated?: boolean;
  };
}

export const LINK_PRESETS: Record<string, LinkPreset> = {
  /*
  bubblemaps: {
    id: "bubblemaps",
    title: "Bubblemaps",
    defaultUrl: "https://app.bubblemaps.io/",
    icon: {
      classic: BubblemapsIcon,
    },
    options: {
      requiresUrl: true,
      canBeTokenGated: true,
    },
  }, */
  jupiter: {
    id: "jupiter",
    title: "Jupiter",
    defaultUrl: "https://jup.ag/tokens/[token]",
    icon: {
      classic: JupiterIcon,
    },
    options: {
      requiresUrl: true,
      canBeTokenGated: false,
    },
  },
  twitter: {
    id: "twitter",
    title: "Twitter",
    defaultUrl: "https://twitter.com/",
    icon: {
      classic: TwitterIcon,
    },
    options: {
      requiresUrl: true,
      canBeTokenGated: true,
    },
  },
  telegram: {
    id: "telegram",
    title: "Telegram",
    defaultUrl: "https://t.me/",
    icon: {
      classic: TelegramIcon,
    },
    options: {
      requiresUrl: true,
      canBeTokenGated: true,
    },
  },
  dexscreener: {
    id: "dexscreener",
    title: "DexScreener",
    defaultUrl: "https://dexscreener.com/solana/[token]",
    icon: {
      classic: DexScreenerIcon,
    },
    options: {
      requiresUrl: true,
      canBeTokenGated: false,
    },
  },
  tiktok: {
    id: "tiktok",
    title: "TikTok",
    defaultUrl: "https://tiktok.com/@username",
    icon: {
      classic: TikTokIcon,
    },
    options: {
      requiresUrl: true,
      canBeTokenGated: true,
    },
  },
  instagram: {
    id: "instagram",
    title: "Instagram",
    defaultUrl: "https://instagram.com/username",
    icon: {
      classic: Instagram,
    },
    options: {
      requiresUrl: true,
      canBeTokenGated: true,
    },
  },
  discord: {
    id: "discord",
    title: "Discord",
    defaultUrl: "https://discord.gg/",
    icon: {
      classic: DiscordIcon,
    },
    options: {
      requiresUrl: true,
      canBeTokenGated: true,
    },
  },
  facebook: {
    id: "facebook",
    title: "Facebook",
    defaultUrl: "https://facebook.com/",
    icon: {
      classic: FacebookIcon,
    },
    options: {
      requiresUrl: true,
      canBeTokenGated: true,
    },
  },
  github: {
    id: "github",
    title: "GitHub",
    defaultUrl: "https://github.com/",
    icon: {
      classic: GitHubIcon,
    },
    options: {
      requiresUrl: true,
      canBeTokenGated: true,
    },
  },
  /*
  "private-chat": {
    id: "private-chat",
    title: "Private Chat",
    defaultUrl: "https://t.me/name",
    icon: {
      classic: MessageCircle,
    },
    options: {
      requiresUrl: true,
      canBeTokenGated: true,
    },
  },
  terminal: {
    id: "terminal",
    title: "Terminal",
    defaultUrl: "https://",
    icon: {
      classic: Terminal,
    },
    options: {
      requiresUrl: true,
      canBeTokenGated: true,
    },
  },
  filesystem: {
    id: "filesystem",
    title: "Filesystem",
    defaultUrl: "https://",
    icon: {
      classic: FolderTree,
    },
    options: {
      requiresUrl: true,
      canBeTokenGated: true,
    },
  }*/
}; 
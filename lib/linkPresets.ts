import {
  Twitter,
  MessageSquare,
  TrendingUp,
  Instagram,
  Mail,
  MessageCircle,
  Terminal,
  FolderTree,
  Video,
} from "lucide-react";

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
  twitter: {
    id: "twitter",
    title: "Twitter",
    defaultUrl: "https://twitter.com/",
    icon: {
      classic: Twitter,
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
      classic: MessageSquare,
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
      classic: TrendingUp,
    },
    options: {
      requiresUrl: true,
      canBeTokenGated: true,
    },
  },
  tiktok: {
    id: "tiktok",
    title: "TikTok",
    defaultUrl: "https://tiktok.com/@",
    icon: {
      classic: Video,
    },
    options: {
      requiresUrl: true,
      canBeTokenGated: true,
    },
  },
  instagram: {
    id: "instagram",
    title: "Instagram",
    defaultUrl: "https://instagram.com/",
    icon: {
      classic: Instagram,
    },
    options: {
      requiresUrl: true,
      canBeTokenGated: true,
    },
  },
  email: {
    id: "email",
    title: "Email",
    defaultUrl: "mailto:",
    icon: {
      classic: Mail,
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
      classic: MessageCircle,
    },
    options: {
      requiresUrl: true,
      canBeTokenGated: true,
    },
  },
  "private-chat": {
    id: "private-chat",
    title: "Private Chat",
    defaultUrl: "https://t.me/",
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
  },
}; 
/** @jsxImportSource react */
import { SVGProps } from 'react';
import { Icons } from '@/components/icons';
import { z } from "zod";

// Link type definition
export type LinkType =
  | 'email'
  | 'sms'
  | 'google'
  | 'apple'
  | 'twitter'
  | 'discord'
  | 'github'
  | 'spotify'
  | 'instagram'
  | 'telegram'
  | 'tiktok'
  | 'farcaster';

// Icon style types
export type IconStyle = 'classic' | 'modern';

// Link configuration interface
export interface LinkConfig {
  type: LinkType;
  label: string;
  description?: string;
  icon: {
    classic: typeof Icons.Email.classic;
    modern: typeof Icons.Email.modern;
  };
  options?: {
    requiresUrl?: boolean;
    urlPattern?: RegExp;
    urlPrefix?: string;
    canBeTokenGated?: boolean;
    canRequireTokens?: boolean;
    canRequireSubscription?: boolean;
  };
}

// Link configurations
export const LINK_CONFIGS: Partial<Record<LinkType, LinkConfig>> = {
  email: {
    type: 'email',
    label: 'Email',
    icon: Icons.Email,
    options: {
      requiresUrl: true,
      urlPattern: /^(mailto:[^\s@]+@[^\s@]+\.[^\s@]+|https?:\/\/.+)$/,
      urlPrefix: 'mailto:',
      canBeTokenGated: true,
      canRequireTokens: true,
      canRequireSubscription: true,
    },
  },
  /*
  google: {
    type: 'google',
    label: 'Google',
    icon: Icons.Google,
    options: {
      requiresUrl: true,
      urlPattern: /^https:\/\/([\w-]+\.)*google\.com/,
      canBeTokenGated: true,
      canRequireTokens: true,
    },
  }, */
  apple: {
    type: 'apple',
    label: 'Apple',
    icon: Icons.Apple,
    options: {
      requiresUrl: true,
      urlPattern: /^https:\/\/([\w-]+\.)*apple\.com/,
      canBeTokenGated: true,
      canRequireTokens: true,
    },
  },
  twitter: {
    type: 'twitter',
    label: 'Twitter',
    icon: Icons.Twitter,
    options: {
      requiresUrl: true,
      urlPattern: /^https?:\/\/(twitter\.com|x\.com)\/.+/,
      canBeTokenGated: true,
      canRequireTokens: true,
    },
  },
  discord: {
    type: 'discord',
    label: 'Discord',
    icon: Icons.Discord,
    options: {
      requiresUrl: true,
      urlPattern: /^https?:\/\/(discord\.gg|discord\.com)\/.+/,
      canBeTokenGated: true,
      canRequireTokens: true,
    },
  },
  github: {
    type: 'github',
    label: 'GitHub',
    icon: Icons.GitHub,
    options: {
      requiresUrl: true,
      urlPattern: /^https?:\/\/github\.com\/.+/,
      canBeTokenGated: true,
      canRequireTokens: true,
    },
  },
  spotify: {
    type: 'spotify',
    label: 'Spotify',
    icon: Icons.Spotify,
    options: {
      requiresUrl: true,
      urlPattern: /^https?:\/\/open\.spotify\.com\/.+/,
      canBeTokenGated: true,
      canRequireTokens: true,
    },
  },
  instagram: {
    type: 'instagram',
    label: 'Instagram',
    icon: Icons.Instagram,
    options: {
      requiresUrl: true,
      urlPattern: /^https?:\/\/([\w-]+\.)*instagram\.com\/.+/,
      canBeTokenGated: true,
      canRequireTokens: true,
    },
  },
  telegram: {
    type: 'telegram',
    label: 'Telegram',
    icon: Icons.Telegram,
    options: {
      requiresUrl: true,
      urlPattern: /^https?:\/\/t\.me\/.+/,
      canBeTokenGated: true,
      canRequireTokens: true,
    },
  },
  tiktok: {
    type: 'tiktok',
    label: 'TikTok',
    icon: Icons.TikTok,
    options: {
      requiresUrl: true,
      urlPattern: /^https?:\/\/([\w-]+\.)*tiktok\.com\/.+/,
      canBeTokenGated: true,
      canRequireTokens: true,
    },
  },
  farcaster: {
    type: 'farcaster',
    label: 'Farcaster',
    icon: Icons.Farcaster,
    options: {
      requiresUrl: true,
      urlPattern: /^https?:\/\/([\w-]+\.)*warpcast\.com\/.+/,
      canBeTokenGated: true,
      canRequireTokens: true,
    },
  },
} as const;

// Helper function to get icon component
export function getLinkIcon(type: LinkType, style: IconStyle = 'classic', props = {}) {
  const config = LINK_CONFIGS[type];
  if (!config) return null;
  return config.icon[style](props);
}

const urlRegex = /^https?:\/\/[^\s/$.?#].[^\s]*$/i;

export function validateLinkUrl(url: string, presetId: string): boolean {
  console.log('Validating URL:', { url, presetId });
  
  if (!url) return false;

  // For email links
  if (presetId === "email") {
    console.log('Validating email link:', { url, presetId });
    
    // Allow both email addresses and mailto: URLs
    if (url.startsWith("mailto:")) {
      const email = url.replace("mailto:", "");
      const isValid = email.includes("@") || email === ""; // Allow empty email after mailto:
      console.log('Email validation (mailto):', { 
        url, 
        email, 
        hasAt: email.includes("@"),
        isEmpty: email === "",
        isValid 
      });
      return isValid;
    }
    
    const isValid = url.includes("@");
    console.log('Email validation (direct):', { 
      url, 
      hasAt: url.includes("@"),
      isValid 
    });
    return isValid;
  }

  // For telegram links
  if (presetId === "telegram" || presetId === "private-chat") {
    const isValid = url.startsWith("https://t.me/");
    console.log('Telegram validation:', { url, isValid });
    return isValid;
  }

  // For discord links
  if (presetId === "discord") {
    const isValid = url.startsWith("https://discord.gg/") || url.startsWith("https://discord.com/");
    console.log('Discord validation:', { url, isValid });
    return isValid;
  }

  // For twitter links
  if (presetId === "twitter") {
    const isValid = url.startsWith("https://twitter.com/") || url.startsWith("https://x.com/");
    console.log('Twitter validation:', { url, isValid });
    return isValid;
  }

  // For tiktok links
  if (presetId === "tiktok") {
    const isValid = url.startsWith("https://tiktok.com/@") || url.startsWith("https://www.tiktok.com/@");
    console.log('TikTok validation:', { url, isValid });
    return isValid;
  }

  // For instagram links
  if (presetId === "instagram") {
    const isValid = url.startsWith("https://instagram.com/") || url.startsWith("https://www.instagram.com/");
    console.log('Instagram validation:', { url, isValid });
    return isValid;
  }

  // For dexscreener links
  if (presetId === "dexscreener") {
    const isValid = url.startsWith("https://dexscreener.com/");
    console.log('DexScreener validation:', { url, isValid });
    return isValid;
  }

  // For general links (terminal, filesystem, etc)
  const isValid = urlRegex.test(url);
  console.log('General URL validation:', { url, isValid });
  return isValid;
}

// Helper function to format link URL with prefix
export function formatLinkUrl(type: LinkType, url: string): string {
  const config = LINK_CONFIGS[type];
  if (!config?.options?.urlPrefix) return url;
  return url.startsWith(config.options.urlPrefix) ? url : `${config.options.urlPrefix}${url}`;
} 
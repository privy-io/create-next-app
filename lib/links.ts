/** @jsxImportSource react */
import { SVGProps } from 'react';
import { Icons } from '@/components/icons';

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
      urlPattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      urlPrefix: 'mailto:',
      canBeTokenGated: true,
      canRequireTokens: true,
      canRequireSubscription: true,
    },
  },
  sms: {
    type: 'sms',
    label: 'SMS',
    icon: Icons.SMS,
    options: {
      requiresUrl: true,
      urlPattern: /^\+?[1-9]\d{1,14}$/,
      urlPrefix: 'sms:',
      canBeTokenGated: true,
      canRequireTokens: true,
      canRequireSubscription: true,
    },
  },
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
  },
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

// Helper function to validate link URL
export function validateLinkUrl(type: LinkType, url: string): boolean {
  const config = LINK_CONFIGS[type];
  if (!config?.options?.urlPattern) return true;
  return config.options.urlPattern.test(url);
}

// Helper function to format link URL with prefix
export function formatLinkUrl(type: LinkType, url: string): string {
  const config = LINK_CONFIGS[type];
  if (!config?.options?.urlPrefix) return url;
  return url.startsWith(config.options.urlPrefix) ? url : `${config.options.urlPrefix}${url}`;
} 
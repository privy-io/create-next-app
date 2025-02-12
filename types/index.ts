export type ItemType = 
  | 'twitter'
  | 'telegram'
  | 'dexscreener'
  | 'tiktok'
  | 'instagram'
  | 'email'
  | 'discord'
  | 'private-chat'
  | 'terminal'
  | 'filesystem';

export interface PageItem {
  id: string;
  type: ItemType;
  url?: string;
  order: number;
  isPlugin?: boolean;
  tokenGated?: boolean;
  requiredAmount?: number;
}

export interface PageData {
  walletAddress: string;
  createdAt: string;
  title?: string;
  description?: string;
  items?: PageItem[];
  updatedAt?: string;
  image?: string;
  slug: string;
  connectedToken?: string;
  tokenSymbol?: string;
  showToken?: boolean;
  showSymbol?: boolean;
  designStyle?: 'default' | 'minimal' | 'modern';
  fonts?: {
    global?: string;
    heading?: string;
    paragraph?: string;
    links?: string;
  };
} 
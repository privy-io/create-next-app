import { LinkType } from '@/lib/links';
import { ThemeStyle } from '@/lib/themes';

export type PageItem = {
  id: string;
  presetId: string;
  title?: string;
  url?: string;
  order: number;
  isPlugin?: boolean;
  tokenGated?: boolean;
  requiredTokens?: string[];
};

export type PageData = {
  walletAddress: string;
  connectedToken?: string | null;
  tokenSymbol?: string | null;
  title?: string;
  description?: string;
  image?: string | null;
  items?: PageItem[];
  designStyle?: "default" | "minimal" | "modern";
  fonts?: {
    global?: string;
    heading?: string;
    paragraph?: string;
    links?: string;
  };
  createdAt?: string;
  updatedAt?: string;
}; 
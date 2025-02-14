import { LinkType } from '@/lib/links';
import { ThemeStyle } from '@/lib/themes';

export interface PageItem {
  id: string;
  type: LinkType;
  url?: string;
  title?: string;
  order: number;
  isPlugin?: boolean;
  tokenGated?: boolean;
  requiredTokens?: string[];
}

export interface PageData {
  walletAddress: string;
  createdAt: string;
  slug: string;
  title?: string;
  description?: string;
  image?: string;
  items?: PageItem[];
  designStyle?: string;
  fonts?: {
    global?: string;
    heading?: string;
    paragraph?: string;
    links?: string;
  };
  connectedToken?: string;
  tokenSymbol?: string;
  isSetupWizard?: boolean;
} 
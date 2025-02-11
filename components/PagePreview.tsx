import { useEffect } from 'react';
import { ItemType } from '../types';
import PageContent from './PageContent';

interface PageData {
  walletAddress: string;
  createdAt: string;
  title?: string;
  description?: string;
  items?: PageItem[];
  updatedAt?: string;
  image?: string;
  slug: string;
  connectedToken?: string;
  designStyle?: 'default' | 'minimal' | 'modern';
}

interface PageItem {
  id: string;
  type: ItemType;
  url?: string;
  order: number;
  isPlugin?: boolean;
  tokenGated?: boolean;
}

export default function PagePreview({ pageData }: { pageData: PageData }) {
  // Load the appropriate CSS file based on design style
  useEffect(() => {
    const styleId = 'page-style';
    const existingStyle = document.getElementById(styleId);
    
    // Create or update style link
    const style = (existingStyle || document.createElement('link')) as HTMLLinkElement;
    style.id = styleId;
    style.rel = 'stylesheet';
    style.href = `/${pageData.designStyle ? `page-${pageData.designStyle}.css` : 'page.css'}`;
    
    if (!existingStyle) {
      document.head.appendChild(style);
    }

    return () => {
      if (existingStyle) {
        existingStyle.remove();
      }
    };
  }, [pageData.designStyle]);

  return <PageContent pageData={pageData} />;
} 
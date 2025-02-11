import { useEffect, useRef } from 'react';
import { ItemType } from '../types';
import PageContent from './PageContent';
import { createRoot } from 'react-dom/client';

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
  // Generate a unique ID for this preview instance
  const iframeId = `preview-iframe-${pageData.slug}`;
  const rootRef = useRef<any>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        ${pageData.designStyle === 'default' || !pageData.designStyle 
          ? '<link rel="stylesheet" href="/page.css">'
          : `<link rel="stylesheet" href="/page-${pageData.designStyle}.css">`
        }
        <style>
          body { margin: 0; }
        </style>
      </head>
      <body>
        <div id="preview-root"></div>
      </body>
    </html>
  `;

  // Set up the iframe once on mount
  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;

    // Write the initial HTML content
    iframe.contentWindow?.document.open();
    iframe.contentWindow?.document.write(htmlContent);
    iframe.contentWindow?.document.close();

    // Set up the React root once the iframe is loaded
    const handleLoad = () => {
      const root = iframe.contentWindow?.document.getElementById('preview-root');
      if (root && !rootRef.current) {
        rootRef.current = createRoot(root);
        rootRef.current.render(<PageContent pageData={pageData} />);
      }
    };

    iframe.addEventListener('load', handleLoad);
    return () => {
      iframe.removeEventListener('load', handleLoad);
      if (rootRef.current) {
        rootRef.current.unmount();
        rootRef.current = null;
      }
    };
  }, []); // Empty dependency array since we only want to set up once

  // Update the preview whenever pageData changes
  useEffect(() => {
    if (rootRef.current) {
      rootRef.current.render(<PageContent pageData={pageData} />);
    }
  }, [pageData]);

  // Update stylesheet when design style changes
  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe?.contentWindow) return;

    const doc = iframe.contentWindow.document;
    const existingStylesheet = doc.querySelector('link[rel="stylesheet"]');
    if (existingStylesheet) {
      const newHref = pageData.designStyle === 'default' || !pageData.designStyle
        ? '/page.css'
        : `/page-${pageData.designStyle}.css`;
      if (existingStylesheet.getAttribute('href') !== newHref) {
        existingStylesheet.setAttribute('href', newHref);
      }
    }
  }, [pageData.designStyle]);

  return (
    <iframe
      ref={iframeRef}
      id={iframeId}
      className="w-full h-full border-0"
      sandbox="allow-same-origin allow-scripts"
      title="Page Preview"
    />
  );
} 
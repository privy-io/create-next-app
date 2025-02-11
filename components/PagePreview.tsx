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
  fonts?: {
    global?: string;
    heading?: string;
    paragraph?: string;
    links?: string;
  };
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
  const iframeId = `preview-iframe-${pageData.slug}`;
  const rootRef = useRef<any>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Set up the iframe once on mount
  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;

    const initialHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <link rel="stylesheet" href="/page.css">
          <link rel="preconnect" href="https://fonts.googleapis.com">
          <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
          <style data-fonts>
            body { margin: 0; }
          </style>
        </head>
        <body>
          <div id="preview-root"></div>
        </body>
      </html>
    `;

    iframe.contentWindow?.document.open();
    iframe.contentWindow?.document.write(initialHtml);
    iframe.contentWindow?.document.close();

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
  }, []); // Only run once on mount

  // Update the preview content and styles
  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe?.contentWindow) return;

    // Update React content
    if (rootRef.current) {
      rootRef.current.render(<PageContent pageData={pageData} />);
    }

    const doc = iframe.contentWindow.document;
    
    // Update stylesheet
    const existingStylesheet = doc.querySelector('link[rel="stylesheet"]');
    if (existingStylesheet) {
      const newHref = pageData.designStyle === 'default' || !pageData.designStyle
        ? '/page.css'
        : `/page-${pageData.designStyle}.css`;
      if (existingStylesheet.getAttribute('href') !== newHref) {
        existingStylesheet.setAttribute('href', newHref);
      }
    }

    // Function to apply font styles
    const applyFontStyles = () => {
      const fontStyles = doc.querySelector('style[data-fonts]');
      if (fontStyles) {
        fontStyles.textContent = `
          body { margin: 0; }
          ${pageData.fonts?.global ? `
            body { 
              font-family: '${pageData.fonts.global}', sans-serif !important;
            }
          ` : ''}
          ${pageData.fonts?.heading ? `
            h1, h2, h3, h4, h5, h6 { 
              font-family: '${pageData.fonts.heading}', sans-serif !important;
            }
          ` : ''}
          ${pageData.fonts?.paragraph ? `
            p, li, td, th, blockquote { 
              font-family: '${pageData.fonts.paragraph}', sans-serif !important;
            }
          ` : ''}
          ${pageData.fonts?.links ? `
            a, .link, .pf-link-item { 
              font-family: '${pageData.fonts.links}', sans-serif !important;
            }
          ` : ''}
        `;
      }
    };

    // Update Google Fonts
    const existingFontsStylesheet = doc.querySelector('link[href*="fonts.googleapis.com"]');
    const fonts = [
      pageData.fonts?.global,
      pageData.fonts?.heading,
      pageData.fonts?.paragraph,
      pageData.fonts?.links
    ].filter(Boolean);

    if (fonts.length > 0) {
      const fontsUrl = `https://fonts.googleapis.com/css2?family=${fonts.map(font => font?.replace(' ', '+')).join('&family=')}&display=swap`;
      
      if (existingFontsStylesheet) {
        if (existingFontsStylesheet.getAttribute('href') !== fontsUrl) {
          // Create new link to trigger font load event
          const newFontsLink = doc.createElement('link');
          newFontsLink.rel = 'stylesheet';
          newFontsLink.href = fontsUrl;
          
          // Apply styles after fonts are loaded
          newFontsLink.onload = applyFontStyles;
          
          // Replace old stylesheet with new one
          existingFontsStylesheet.parentNode?.replaceChild(newFontsLink, existingFontsStylesheet);
        } else {
          // If URL hasn't changed, still apply styles
          applyFontStyles();
        }
      } else {
        const fontsLink = doc.createElement('link');
        fontsLink.rel = 'stylesheet';
        fontsLink.href = fontsUrl;
        fontsLink.onload = applyFontStyles;
        doc.head.appendChild(fontsLink);
      }
    } else {
      if (existingFontsStylesheet) {
        existingFontsStylesheet.remove();
      }
      applyFontStyles(); // Apply styles even if no custom fonts
    }
  }, [pageData]); // Update on any pageData change

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
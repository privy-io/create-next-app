import { useEffect } from 'react';
import { PageData } from '../types';
import PageContent from './PageContent';
import EditPageContent from './EditPageContent';
import { themes } from '@/lib/themes';

interface PagePreviewProps {
  pageData: PageData;
  onLinkClick?: (itemId: string) => void;
  onTitleClick?: () => void;
  onDescriptionClick?: () => void;
  isEditMode?: boolean;
}

export default function PagePreview({ 
  pageData, 
  onLinkClick,
  onTitleClick,
  onDescriptionClick,
  isEditMode = false
}: PagePreviewProps) {
  // Add theme and font styles to the document head
  useEffect(() => {
    // Update Google Fonts
    const fonts = [
      pageData.fonts?.global,
      pageData.fonts?.heading,
      pageData.fonts?.paragraph,
      pageData.fonts?.links
    ].filter(Boolean);

    if (fonts.length > 0) {
      // Add Google Fonts stylesheet if needed
      let googleFontsLink = document.querySelector('link[data-google-fonts]') as HTMLLinkElement;
      const fontsUrl = `https://fonts.googleapis.com/css2?family=${fonts.map(font => font?.replace(' ', '+')).join('&family=')}&display=swap`;
      
      if (googleFontsLink) {
        if (googleFontsLink.getAttribute('href') !== fontsUrl) {
          googleFontsLink.setAttribute('href', fontsUrl);
        }
      } else {
        googleFontsLink = document.createElement('link');
        googleFontsLink.rel = 'stylesheet';
        googleFontsLink.href = fontsUrl;
        googleFontsLink.setAttribute('data-google-fonts', 'true');
        document.head.appendChild(googleFontsLink);
      }
    }

    // Cleanup function
    return () => {
      const googleFontsLink = document.querySelector('link[data-google-fonts]');
      if (googleFontsLink) document.head.removeChild(googleFontsLink);
    };
  }, [pageData.fonts]);

  const currentTheme = pageData.designStyle || 'default';
  const themeStyle = themes[currentTheme].colors;

  return (
    <div className="relative">
      {isEditMode ? (
        <EditPageContent
          pageData={pageData}
          themeStyle={themeStyle}
          onLinkClick={onLinkClick}
          onTitleClick={onTitleClick}
          onDescriptionClick={onDescriptionClick}
        />
      ) : (
        <PageContent
          pageData={pageData}
          themeStyle={themeStyle}
        />
      )}
    </div>
  );
} 
export type ThemeStyle = 'default' | 'dark' | 'modern';

export interface ThemeConfig {
  title: string;
  colors: Record<string, string>;
  fonts: {
    global?: string;
    heading?: string;
    paragraph?: string;
    links?: string;
  };
}

export type Themes = Record<string, ThemeConfig>;

export const themes: Themes = {
  default: {
    title: 'Light',
    colors: {},
    fonts: {
      global: 'Inter',
      heading: 'Inter',
      paragraph: 'Inter',
      links: 'Inter'
    }
  },
  dark: {
    title: 'Dark',
    colors: {
      '--pf-background': '#000',
      '--pf-text': '#fff',
      '--pf-description-color': 'var(--pf-muted)',
      '--pf-link-bg': 'rgba(255, 255, 255, 0.05)',
      '--pf-link-bg-hover': 'rgba(255, 255, 255, 0.1)',
      '--pf-link-border': '1px solid rgba(255, 255, 255, 0.1)',
    },
    fonts: {
      global: 'Inter',
      heading: 'Inter',
      paragraph: 'Inter',
      links: 'Inter'
    }
  },
  
  /* deprecated but keeping for backwards compatibility */
  modern: {
    title: 'Modern Dark',
    colors: {
      '--pf-background': '#000',
      '--pf-text': '#fff',
      '--pf-muted': '#999',
      '--pf-heading-size': '3.5rem',
      '--pf-heading-weight': '800',
      '--pf-description-color': 'var(--pf-muted)',
      '--pf-link-bg': 'rgba(255, 255, 255, 0.05)',
      '--pf-link-bg-hover': 'rgba(255, 255, 255, 0.1)',
      '--pf-link-border': '1px solid rgba(255, 255, 255, 0.1)',
      '--pf-link-radius': '1rem',
      '--pf-link-color': 'var(--pf-text)',
      '--pf-link-hover': 'var(--pf-primary)',
      '--pf-link-shadow': '0 0 0 1px rgba(255, 255, 255, 0.1)',
      '--pf-link-shadow-hover': '0 8px 24px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.2)',
    },
    fonts: {
      global: 'Space Grotesk',
      heading: 'Dela Gothic One',
      paragraph: 'Space Grotesk',
      links: 'Space Grotesk'
    }
  }
}; 
export type ThemeStyle = 'default' | 'minimal' | 'modern';

export interface ThemeConfig {
  colors: Record<string, string>;
  fonts: {
    global?: string;
    heading?: string;
    paragraph?: string;
    links?: string;
  };
}

export type ThemesConfig = {
  [key in ThemeStyle]: ThemeConfig;
};

export const themes: ThemesConfig = {
  default: {
    colors: {},
    fonts: {
      global: 'Inter',
      heading: 'Inter',
      paragraph: 'Inter',
      links: 'Inter'
    }
  },
  minimal: {
    colors: {
      '--pf-background': '#fafafa',
      '--pf-text': '#333',
      '--pf-primary': '#0066cc',
      '--pf-primary-light': '#f5f5f5',
      '--pf-secondary': '#004d99',
      '--pf-muted': '#666',
      '--pf-heading-size': '1.75rem',
      '--pf-heading-weight': '400',
      '--pf-description-color': '#555',
      '--pf-link-bg': '#fff',
      '--pf-link-border': '1px solid #eee',
      '--pf-link-radius': '0.25rem',
      '--pf-link-color': 'var(--pf-muted)',
      '--pf-link-hover': 'var(--pf-primary)',
      '--pf-link-shadow': 'none',
      '--pf-link-shadow-hover': '0 2px 8px rgba(0, 0, 0, 0.05)',
    },
    fonts: {
      global: 'Albert Sans',
      heading: 'Albert Sans',
      paragraph: 'Albert Sans',
      links: 'Albert Sans'
    }
  },
  modern: {
    colors: {
      '--pf-background': '#000',
      '--pf-text': '#fff',
      '--pf-primary': '#4ECDC4',
      '--pf-primary-light': 'rgba(78, 205, 196, 0.1)',
      '--pf-secondary': '#FF6B6B',
      '--pf-muted': '#999',
      '--pf-heading-size': '3.5rem',
      '--pf-heading-weight': '800',
      '--pf-description-color': 'var(--pf-muted)',
      '--pf-link-bg': 'rgba(255, 255, 255, 0.05)',
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
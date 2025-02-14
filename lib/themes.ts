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
    colors: {
      '--pf-background': '#f9f9f9',
      '--pf-text': '#111',
      '--pf-primary': '#7C3AED',
      '--pf-primary-light': 'rgba(124, 58, 237, 0.1)',
      '--pf-secondary': '#6D28D9',
      '--pf-muted': '#6B7280',
      '--pf-heading-size': '2rem',
      '--pf-heading-weight': '300',
      '--pf-description-color': '#374151',
      '--pf-link-bg': '#fff',
      '--pf-link-border': '1px solid rgba(0, 0, 0, 0.1)',
      '--pf-link-radius': '0.5rem',
      '--pf-link-color': 'var(--pf-muted)',
      '--pf-link-hover': 'var(--pf-text)',
      '--pf-link-token-badge-bg': 'var(--pf-primary-light)',
      '--pf-link-token-badge-color': 'var(--pf-secondary)',
      '--pf-link-token-badge-border': 'none',
      '--pf-link-token-badge-radius': 'var(--pf-link-radius)',
      '--pf-shadow': '0 1px 2px rgba(0, 0, 0, 0.05)',
      '--pf-shadow-hover': '0 4px 12px rgba(0, 0, 0, 0.1)',
    },
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
      '--pf-link-token-badge-bg': 'var(--pf-primary-light)',
      '--pf-link-token-badge-color': 'var(--pf-muted)',
      '--pf-link-token-badge-border': 'none',
      '--pf-link-token-badge-radius': 'var(--pf-link-radius)',
      '--pf-shadow': 'none',
      '--pf-shadow-hover': '0 2px 8px rgba(0, 0, 0, 0.05)',
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
      '--pf-link-token-badge-bg': 'linear-gradient(45deg, var(--pf-primary), var(--pf-secondary))',
      '--pf-link-token-badge-color': 'var(--pf-text)',
      '--pf-link-token-badge-border': 'none',
      '--pf-link-token-badge-radius': 'var(--pf-link-radius)',
      '--pf-shadow': '0 0 0 1px rgba(255, 255, 255, 0.1)',
      '--pf-shadow-hover': '0 8px 24px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.2)',
    },
    fonts: {
      global: 'Space Grotesk',
      heading: 'Dela Gothic One',
      paragraph: 'Space Grotesk',
      links: 'Space Grotesk'
    }
  }
}; 
export type Theme = {
  id: string;
  name: string;
  vars: {
    '--lf-bg': string;
    '--lf-card-bg': string;
    '--lf-card-border': string;
    '--lf-card-hover': string;
    '--lf-text-primary': string;
    '--lf-text-secondary': string;
    '--lf-accent': string;
    '--lf-accent-text': string;
    '--lf-name-color': string;
    '--lf-radius': string;
    '--lf-font': string;
    '--lf-shadow': string;
  };
};

export const DEFAULT_THEME_ID = 'default';

export const THEMES: Theme[] = [
  {
    id: 'default',
    name: 'Clean',
    vars: {
      '--lf-bg': '#ffffff',
      '--lf-card-bg': '#f9fafb',
      '--lf-card-border': '#e5e7eb',
      '--lf-card-hover': '#f3f4f6',
      '--lf-text-primary': '#111827',
      '--lf-text-secondary': '#6b7280',
      '--lf-accent': '#ec5c33',
      '--lf-accent-text': '#ffffff',
      '--lf-name-color': '#111827',
      '--lf-radius': '12px',
      '--lf-font': 'Inter, sans-serif',
      '--lf-shadow': '0 1px 3px rgba(0,0,0,0.08)',
    },
  },
  {
    id: 'dark',
    name: 'Midnight',
    vars: {
      '--lf-bg': '#0f0f0f',
      '--lf-card-bg': '#1a1a1a',
      '--lf-card-border': '#2a2a2a',
      '--lf-card-hover': '#242424',
      '--lf-text-primary': '#f9fafb',
      '--lf-text-secondary': '#9ca3af',
      '--lf-accent': '#ec5c33',
      '--lf-accent-text': '#ffffff',
      '--lf-name-color': '#ffffff',
      '--lf-radius': '12px',
      '--lf-font': 'Inter, sans-serif',
      '--lf-shadow': '0 1px 3px rgba(0,0,0,0.4)',
    },
  },
  {
    id: 'warm',
    name: 'Warm',
    vars: {
      '--lf-bg': '#fdf6f0',
      '--lf-card-bg': '#ffffff',
      '--lf-card-border': '#f5dfd0',
      '--lf-card-hover': '#fef2ea',
      '--lf-text-primary': '#3d2010',
      '--lf-text-secondary': '#8c5a3c',
      '--lf-accent': '#c2410c',
      '--lf-accent-text': '#ffffff',
      '--lf-name-color': '#7c2d12',
      '--lf-radius': '16px',
      '--lf-font': 'Georgia, serif',
      '--lf-shadow': '0 2px 8px rgba(194,65,12,0.1)',
    },
  },
  {
    id: 'forest',
    name: 'Forest',
    vars: {
      '--lf-bg': '#f0fdf4',
      '--lf-card-bg': '#ffffff',
      '--lf-card-border': '#bbf7d0',
      '--lf-card-hover': '#dcfce7',
      '--lf-text-primary': '#14532d',
      '--lf-text-secondary': '#166534',
      '--lf-accent': '#16a34a',
      '--lf-accent-text': '#ffffff',
      '--lf-name-color': '#14532d',
      '--lf-radius': '8px',
      '--lf-font': 'Inter, sans-serif',
      '--lf-shadow': '0 1px 4px rgba(22,163,74,0.12)',
    },
  },
  {
    id: 'ocean',
    name: 'Ocean',
    vars: {
      '--lf-bg': '#eff6ff',
      '--lf-card-bg': '#ffffff',
      '--lf-card-border': '#bfdbfe',
      '--lf-card-hover': '#dbeafe',
      '--lf-text-primary': '#1e3a5f',
      '--lf-text-secondary': '#3b82f6',
      '--lf-accent': '#2563eb',
      '--lf-accent-text': '#ffffff',
      '--lf-name-color': '#1e3a5f',
      '--lf-radius': '12px',
      '--lf-font': 'Inter, sans-serif',
      '--lf-shadow': '0 1px 4px rgba(37,99,235,0.1)',
    },
  },
  {
    id: 'minimal',
    name: 'Minimal',
    vars: {
      '--lf-bg': '#ffffff',
      '--lf-card-bg': '#ffffff',
      '--lf-card-border': '#000000',
      '--lf-card-hover': '#f9fafb',
      '--lf-text-primary': '#000000',
      '--lf-text-secondary': '#525252',
      '--lf-accent': '#000000',
      '--lf-accent-text': '#ffffff',
      '--lf-name-color': '#000000',
      '--lf-radius': '0px',
      '--lf-font': 'Inter, sans-serif',
      '--lf-shadow': 'none',
    },
  },
];

export function getTheme(id: string): Theme {
  return THEMES.find((theme) => theme.id === id) || THEMES[0];
}

import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: [
    './src/app/**/*.{ts,tsx}',
    './src/components/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // Design tokens driven by CSS variables (see globals.css) so light and
        // dark modes stay in sync and contrast is controlled in one place.
        bg: 'rgb(var(--bg) / <alpha-value>)',
        surface: 'rgb(var(--surface) / <alpha-value>)',
        'surface-2': 'rgb(var(--surface-2) / <alpha-value>)',
        border: 'rgb(var(--border) / <alpha-value>)',
        fg: 'rgb(var(--fg) / <alpha-value>)',
        'fg-secondary': 'rgb(var(--fg-secondary) / <alpha-value>)',
        muted: 'rgb(var(--muted) / <alpha-value>)',
        accent: 'rgb(var(--accent) / <alpha-value>)',
        'accent-hover': 'rgb(var(--accent-hover) / <alpha-value>)',
        'accent-fg': 'rgb(var(--accent-fg) / <alpha-value>)',
        'accent-soft': 'rgb(var(--accent-soft) / <alpha-value>)',
        // Highlighter: only for marking problems in data.
        mark: 'rgb(var(--mark) / <alpha-value>)',
        'mark-fg': 'rgb(var(--mark-fg) / <alpha-value>)',
        // Semantic colors (meaning only, always paired with icon + label).
        success: 'rgb(var(--success) / <alpha-value>)',
        'success-text': 'rgb(var(--success-text) / <alpha-value>)',
        'success-soft': 'rgb(var(--success-soft) / <alpha-value>)',
        warning: 'rgb(var(--warning) / <alpha-value>)',
        'warning-text': 'rgb(var(--warning-text) / <alpha-value>)',
        'warning-soft': 'rgb(var(--warning-soft) / <alpha-value>)',
        info: 'rgb(var(--info) / <alpha-value>)',
        'info-text': 'rgb(var(--info-text) / <alpha-value>)',
        'info-soft': 'rgb(var(--info-soft) / <alpha-value>)',
        danger: 'rgb(var(--danger) / <alpha-value>)',
        'danger-text': 'rgb(var(--danger-text) / <alpha-value>)',
        'danger-soft': 'rgb(var(--danger-soft) / <alpha-value>)',
        orange: 'rgb(var(--orange) / <alpha-value>)',
        // Back-compat alias: "discovery" now maps to success (green).
        discovery: 'rgb(var(--success) / <alpha-value>)',
        'discovery-soft': 'rgb(var(--success-soft) / <alpha-value>)',
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-mono)', 'ui-monospace', 'monospace'],
      },
      borderRadius: {
        // One radius for controls, one for cards.
        control: '6px',
        card: '8px',
      },
      spacing: {
        // Restrict to the 4/8/12/16/24/32/48 scale via named tokens.
        1: '4px',
        2: '8px',
        3: '12px',
        4: '16px',
        6: '24px',
        8: '32px',
        12: '48px',
      },
      boxShadow: {
        // Subtle shadow allowed only on popovers/dialogs.
        popover: '0 4px 16px -4px rgb(0 0 0 / 0.16)',
      },
      letterSpacing: {
        tightish: '-0.02em',
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0', transform: 'translateY(4px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'scale-in': {
          '0%': { opacity: '0', transform: 'scale(0.98)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
      },
      animation: {
        'fade-in': 'fade-in 180ms ease-out',
        'scale-in': 'scale-in 160ms ease-out',
      },
    },
  },
  plugins: [],
};

export default config;

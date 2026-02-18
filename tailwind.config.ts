import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: ['class'],
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        bg: '#09090b',
        surface: '#111114',
        line: '#2a2a31',
        text: '#f5f5f7',
        muted: '#a1a1ad',
        accent: '#d4d4d8'
      },
      fontFamily: {
        sans: ['Helvetica Neue', 'Helvetica', 'Arial', 'sans-serif'],
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace']
      },
      boxShadow: {
        panel: '0 0 0 1px rgba(255,255,255,0.06)'
      }
    }
  },
  plugins: []
};

export default config;

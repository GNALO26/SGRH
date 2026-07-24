/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        theme: {
          bg: {
            primary: 'var(--color-bg-primary)',
            secondary: 'var(--color-bg-secondary)',
            card: 'var(--color-bg-card)',
            'card-hover': 'var(--color-bg-card-hover)',
            sidebar: 'var(--color-bg-sidebar)',
            header: 'var(--color-bg-header)',
            footer: 'var(--color-bg-footer)',
          },
          text: {
            primary: 'var(--color-text-primary)',
            secondary: 'var(--color-text-secondary)',
            muted: 'var(--color-text-muted)',
            inverse: 'var(--color-text-inverse)',
          },
          border: 'var(--color-border)',
          shadow: 'var(--color-shadow)',
          accent: {
            DEFAULT: 'var(--color-accent)',
            hover: 'var(--color-accent-hover)',
            light: 'var(--color-accent-light)',
          },
          stat: {
            bg: 'var(--color-stat-bg)',
            text: 'var(--color-stat-text)',
          },
          success: 'var(--color-success)',
          warning: 'var(--color-warning)',
          danger: 'var(--color-danger)',
        }
      },
    },
  },
  plugins: [],
}
/** @type {import('tailwindcss').Config} */

const tailwindConfig = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: 'var(--background)',
        foreground: 'var(--foreground)',
      },
      borderColor: {
        border: 'var(--border)',
      },
      boxShadow: {
        'md-custom':
          '0 4px 6px -1px var(--shadow), 0 2px 4px -2px var(--shadow)',
        'lg-custom':
          '0 10px 15px -3px var(--shadow), 0 4px 6px -4px var(--shadow)',
      },
    },
  },
  plugins: [],
};

export default tailwindConfig;

import type { Config } from 'tailwindcss';

export default {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      maxWidth: {
        screen: '100vw', // Match viewport width
      },
      screens: {
        tablet: '640px',
        desktop: '1024px',
      },
      colors: {
        'theme-background': 'var(--background)',
        'theme-foreground': 'var(--foreground)',
        'theme-visited': 'var(--visited)',
        'theme-btn-primary': 'var(--btn-primary)',
        'theme-btn-primary-hover': 'var(--btn-primary-hover)',
        'theme-btn-secondary': 'var(--btn-secondary)',
        'theme-btn-secondary-hover': 'var(--btn-secondary-hover)',
        'theme-btn-error': 'var(--btn-error)',
        'theme-btn-error-hover': 'var(--btn-error-hover)',
        'theme-btn-info': 'var(--btn-info)',
        'theme-btn-info-hover': 'var(--btn-info-hover)',
        'theme-btn-success': 'var(--btn-success)',
        'theme-btn-success-hover': 'var(--btn-success-hover)',
        'theme-btn-text': 'var(--btn-text)',
        'theme-btn-text-hover': 'var(--btn-text-hover)',
      },
      height: {
        'theme-post-image-multi': '200px',
      },
      width: {
        'theme-post-image-multi': '200px',
        'theme-post-image-single': '100%',
      },
    },
  },
  plugins: [require('@tailwindcss/aspect-ratio')],
} satisfies Config;

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
        screen: '100vw',
      },
      maxHeight: {
        screen: '100vh',
      },
      screens: {
        tablet: '640px',
        desktop: '1024px',
      },
      colors: {
        'theme-background': 'var(--background)',
        'theme-foreground': 'var(--foreground)',
        'theme-visited': 'var(--visited)',
        'theme-primary': 'var(---primary)',
        'theme-primary-hover': 'var(---primary-hover)',
        'theme-secondary': 'var(---secondary)',
        'theme-secondary-hover': 'var(---secondary-hover)',
        'theme-error': 'var(---error)',
        'theme-error-hover': 'var(---error-hover)',
        'theme-info': 'var(---info)',
        'theme-info-hover': 'var(---info-hover)',
        'theme-success': 'var(---success)',
        'theme-success-hover': 'var(---success-hover)',
        'theme-text': 'var(---text)',
        'theme-text-hover': 'var(---text-hover)',
        'theme-text-primary': 'var(--text-primary)',
        'theme-text-secondary': 'var(--text-secondary)',
        'theme-text-tertiary': 'var(--text-tertiary)',
        'theme-text-placeholder': 'var(--text-placeholder)',
        'theme-text-link': 'var(--text-link)',
        'theme-text-link-hover': 'var(--text-link-hover)',
        'theme-text-error': 'var(--text-error)',
        'theme-text-info': 'var(--text-info)',
        'theme-text-success': 'var(--text-success)',
        'theme-border-primary': 'var(--border-primary)',
        'theme-border-secondary': 'var(--border-secondary)',
        'theme-border-tertiary': 'var(--border-tertiary)',
        'theme-border-error': 'var(--border-error)',
        'theme-border-info': 'var(--border-info)',
        'theme-border-success': 'var(--border-success)',
      },
      height: {
        'theme-post-image-multi-small': '150px',
        'theme-post-image-single-small': '300px',
      },
      width: {
        'theme-post-image-multi-small': '150px',
        'theme-post-image-single-small': '100%',
      },
    },
  },
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  plugins: [require('@tailwindcss/aspect-ratio')],
} satisfies Config;

import type { Config } from 'tailwindcss';

export default {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      gridTemplateRows: {
        layout: 'auto 1fr', // header and content rows
      },
      gridTemplateColumns: {
        layout: 'repeat(12, minmax(0, 1fr))', // 12 column layout
      },
      maxWidth: {
        screen: '100vw',
      },
      maxHeight: {
        screen: '100vh',
        page: 'calc(100vh - var(--header-height-app))',
      },
      screens: {
        tablet: '640px',
        desktop: '1024px',
      },
      colors: {
        'app-visited': 'var(--visited)',
        'app-primary': 'var(---primary)',
        'app-primary-hover': 'var(---primary-hover)',
        'app-secondary': 'var(---secondary)',
        'app-secondary-hover': 'var(---secondary-hover)',
        'app-error': 'var(---error)',
        'app-error-hover': 'var(---error-hover)',
        'app-info': 'var(---info)',
        'app-info-hover': 'var(---info-hover)',
        'app-success': 'var(---success)',
        'app-success-hover': 'var(---success-hover)',
        'app-text': 'var(---text)',
      },
      backgroundColor: {
        'app-background': 'var(--background)',
        'app-foreground': 'var(--foreground)',
      },
      height: {
        'app-post-image-multi-small': '150px',
        'app-post-image-single-small': '300px',
        'app-page-header': 'var(--header-height-app)',
        'app-page-page': 'var(--page-height-app))',
      },
      width: {
        'app-post-image-multi-small': '150px',
        'app-post-image-single-small': '100%',
      },
      top: {
        'app-to-top-button': 'calc(100vh - 2.5rem)',
      },
    },
  },
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  plugins: [require('@tailwindcss/aspect-ratio')],
} satisfies Config;

import type { Preview } from '@storybook/react-vite';
import '../src/styles/index.css';

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    backgrounds: {
      default: 'app',
      values: [
        { name: 'app', value: 'var(--background, #f8fafc)' },
        { name: 'card', value: 'var(--card, #ffffff)' },
        { name: 'sidebar', value: '#0f172a' },
      ],
    },
    a11y: { test: 'todo' },
  },
};

export default preview;

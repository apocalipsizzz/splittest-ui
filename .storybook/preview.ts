import type { Preview } from '@storybook/react-vite';

import '../src/styles/global.scss';

const preview: Preview = {
  parameters: {
    layout: 'padded',
    a11y: {
      test: 'error',
    },
  },
};

export default preview;

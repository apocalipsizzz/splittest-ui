import '@testing-library/jest-dom/vitest';
import { afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';

/** React Testing Library не чистит DOM между тестами автоматически при globals: true. */
afterEach(() => {
  cleanup();
});

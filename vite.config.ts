import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [react()],
  resolve: {
    tsconfigPaths: true,
  },
  css: {
    preprocessorOptions: {
      scss: {
        silenceDeprecations: ['import'],
      },
    },
  },
  test: {
    environment: 'jsdom',
    // Один jsdom на воркер, не на файл: изоляция поднимала окружение
    // десятки раз и забирала большую часть прогона. DOM между тестами
    // снимает cleanup() в setup.ts. Модульный счётчик useScrollLock
    // живёт в том же воркере и снимается cleanup-ом эффекта при размонтировании.
    isolate: false,
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.test.{ts,tsx}'],
    coverage: {
      provider: 'v8',
      include: ['src/**/*.{ts,tsx}'],
      exclude: [
        'src/**/*.{test,stories}.{ts,tsx}',
        'src/icons/**',
        'src/stories/**',
        'src/test/**',
        'src/**/*.d.ts',
        'src/index.ts',
      ],
      // Пол, а не цель: ниже текущих значений сборка падает.
      thresholds: {
        statements: 90,
        branches: 85,
        functions: 90,
        lines: 90,
      },
    },
  },
});

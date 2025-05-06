import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths'; 

export default defineConfig({
    plugins: [react(), tsconfigPaths()],
  test: {
    include: ['__tests__/unit/**/*.{test,spec}.*'],
    environment: 'jsdom',
    globals: true,
    setupFiles: ['vitest.setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
    },
  },
});

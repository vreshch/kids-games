import path from 'node:path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: { alias: { '@': path.resolve(import.meta.dirname, 'src') } },
  test: {
    include: ['src/**/*.test.ts'],
    environment: 'node',
    coverage: {
      provider: 'v8',
      include: ['src/lib/**/*.ts'],
      // WebAudio/speechSynthesis modules only run in a browser - exercised by the Playwright smoke
      exclude: [
        'src/lib/*.test.ts',
        'src/lib/*-audio.ts',
        'src/lib/*-speech.ts',
        'src/lib/*-sound.ts',
        'src/lib/speak.ts',
      ],
      thresholds: { statements: 70, branches: 70, functions: 70, lines: 70 },
    },
  },
});

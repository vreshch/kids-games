import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    // react-three-fiber: three.js props are not DOM props; refs are mutated per-frame by design
    files: ['src/components/crystal-rooms/**'],
    rules: { 'react/no-unknown-property': 'off', 'react-hooks/immutability': 'off' },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    '.next/**',
    'out/**',
    'build/**',
    'next-env.d.ts',
    // Generated locally by vitest coverage / playwright:
    'coverage/**',
    'test-results/**',
    'playwright-report/**',
  ]),
]);

export default eslintConfig;

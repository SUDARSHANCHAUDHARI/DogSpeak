import js from '@eslint/js'
import tseslint from 'typescript-eslint'
import reactHooks from 'eslint-plugin-react-hooks'

const browserGlobals = {
  window: 'readonly', document: 'readonly', navigator: 'readonly',
  console: 'readonly', fetch: 'readonly', TextDecoder: 'readonly',
  localStorage: 'readonly', sessionStorage: 'readonly',
  setTimeout: 'readonly', clearTimeout: 'readonly',
  setInterval: 'readonly', clearInterval: 'readonly',
  ReadableStream: 'readonly', TextEncoder: 'readonly',
  URL: 'readonly', URLSearchParams: 'readonly',
}

const vitestGlobals = {
  describe: 'readonly', it: 'readonly', test: 'readonly',
  expect: 'readonly', vi: 'readonly', beforeEach: 'readonly',
  afterEach: 'readonly', beforeAll: 'readonly', afterAll: 'readonly',
  global: 'writable',
}

export default tseslint.config(
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['src/**/*.{ts,tsx}'],
    plugins: { 'react-hooks': reactHooks },
    languageOptions: {
      globals: browserGlobals,
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      '@typescript-eslint/no-unused-vars': ['warn', { varsIgnorePattern: '^React$', argsIgnorePattern: '^_' }],
      'no-empty': ['error', { allowEmptyCatch: true }],
    },
  },
  {
    files: ['src/**/*.test.{ts,tsx}'],
    languageOptions: {
      globals: { ...browserGlobals, ...vitestGlobals },
    },
  },
  {
    ignores: ['dist/**', 'node_modules/**'],
  },
)

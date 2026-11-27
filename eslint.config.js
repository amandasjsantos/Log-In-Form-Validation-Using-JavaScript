const js = require('@eslint/js');
const globals = require('globals');

module.exports = [
  {
    // Fora da análise: biblioteca de terceiros, testes e relatórios
    ignores: [
      'node_modules/**',
      'jquery-1.12.3.js',
      'tests/**',
      'playwright.config.js',
      'eslint.config.js',
      'playwright-report/**',
      'test-results/**',
    ],
  },
  js.configs.recommended,
  {
    files: ['**/*.js'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'script',
      globals: { ...globals.browser, ...globals.jquery },
    },
    rules: {
      eqeqeq: 'error',        // exige === em vez de ==
      'no-var': 'warn',       // prefere let/const
      'no-alert': 'warn',     // evita alert()
      'prefer-const': 'warn',
      'no-unused-vars': 'warn',
      semi: ['warn', 'always'],
    },
  },
];

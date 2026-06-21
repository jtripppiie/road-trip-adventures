const globals = require('globals');

// Rules focused on catching real bugs (undefined variables, duplicate keys,
// unreachable code) rather than style. This keeps the static, build-free app
// honest without forcing a heavy lint cleanup.
const bugRules = {
  'no-undef': 'error',
  'no-redeclare': 'error',
  'no-dupe-keys': 'error',
  'no-dupe-args': 'error',
  'no-func-assign': 'error',
  'no-unreachable': 'error',
  'no-cond-assign': ['error', 'except-parens'],
  'no-self-assign': 'error',
  'use-isnan': 'error',
  'no-unused-vars': 'off',
};

module.exports = [
  {
    ignores: ['node_modules/**'],
  },
  {
    // Browser app code and client-side data/game files.
    files: ['script.js', 'js/**/*.js'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'script',
      globals: {
        ...globals.browser,
        RTA_PONG_ART: 'readonly',
        RTA_HIDE_SEEK_ART: 'readonly',
        RTA_TRIVIA_QUESTIONS: 'writable',
      },
    },
    rules: bugRules,
  },
  {
    // Service worker.
    files: ['sw.js'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'script',
      globals: { ...globals.serviceworker },
    },
    rules: bugRules,
  },
  {
    // Node-based audit/build scripts and this config.
    files: ['scripts/**/*.js', 'eslint.config.js'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'commonjs',
      globals: { ...globals.node, window: 'writable' },
    },
    rules: bugRules,
  },
];

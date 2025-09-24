module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  parserOptions: {
    sourceType: 'module',
    ecmaVersion: 2020,
  },
  env: {
    browser: true,
    es2021: true,
  },
  plugins: [
    '@typescript-eslint',
    'react-hooks',
    'react-refresh',
  ],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
  ],
  rules: {
    'react-refresh/only-export-components': 'warn',
  },
  settings: {
    react: {
      version: 'detect',
    },
  },
};

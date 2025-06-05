export default [
  {
    files: ['**/*.{ts,tsx}'],
    extends: ['eslint:recommended', 'plugin:react/recommended'],
    parserOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module'
    },
    env: { browser: true, es2021: true },
  },
];

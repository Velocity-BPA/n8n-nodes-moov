module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: './tsconfig.json',
    sourceType: 'module',
    ecmaVersion: 2020,
  },
  plugins: ['@typescript-eslint', 'n8n-nodes-base'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:n8n-nodes-base/community',
    'prettier',
  ],
  env: {
    node: true,
    es2020: true,
  },
  rules: {
    '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    'n8n-nodes-base/node-param-description-missing-final-period': 'off',
    'n8n-nodes-base/node-param-description-miscased-id': 'off',
    'n8n-nodes-base/node-param-description-excess-final-period': 'off',
    'n8n-nodes-base/node-param-description-unneeded-backticks': 'off',
    'no-console': ['warn', { allow: ['warn', 'error'] }],
  },
  ignorePatterns: ['node_modules/', 'dist/', '*.js'],
};

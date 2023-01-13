process.env.ENABLE_NEW_JSX_TRANSFORM = 'true';

/**
 * @type {import("eslint").Linter.Config}
 */
module.exports = {
  extends: [
    '@commercetools-frontend/eslint-config-mc-app',
    "eslint:recommended",
    "plugin:@typescript-eslint/eslint-recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:import/recommended",
    "plugin:import/typescript",
    "plugin:prettier/recommended"
  ],
  plugins: ['graphql', 'unused-imports'],
  overrides: [
    {
      files: ['**/*.ctp.graphql'],
      rules: {
        'graphql/template-strings': [
          'error',
          {
            env: 'literal',
            schemaJson: require('./schemas/ctp.json'),
          },
        ],
      },
    },
  ],
  ignorePatterns: ['public/', 'node_nodules/', '*.config.js', '.eslintrc.js', '*.d.ts'],
  rules: {
    quotes: ['error', 'single'],
    // we want to force semicolons
    semi: ['error', 'always'],
    // we use 2 spaces to indent our code
    indent: ['error', 2, { "SwitchCase": 1 }],
    
    // we want to avoid extraneous spaces
    'no-multi-spaces': ['error'],
    'react/jsx-uses-react': ['error'],
    'react/jsx-uses-vars': ['error'],
    'import/order': ['error'],
    'import/newline-after-import': ['error'],
    'react/prop-types': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off', //disable for CI
    'no-unused-vars': 'off', // or "@typescript-eslint/no-unused-vars": "off",
    'unused-imports/no-unused-imports': 'error',
    'unused-imports/no-unused-vars': [
      'warn',
      {
        vars: 'all',
        varsIgnorePattern: '^_',
        args: 'after-used',
        argsIgnorePattern: '^_',
      },
    ],
  },
};

require('dotenv').config({ path: ['.env.local', '.env'] });

const { spawnSync } = require('child_process');
const { MC_API_URLS } = require('@commercetools-frontend/application-config');

const mcApiUrl = MC_API_URLS[process.env.CLOUD_IDENTIFIER];

if (!mcApiUrl) {
  throw new Error(
    `Unknown CLOUD_IDENTIFIER "${
      process.env.CLOUD_IDENTIFIER
    }". Known values: ${Object.keys(MC_API_URLS).join(', ')}`
  );
}

const result = spawnSync(
  'mc-scripts',
  [
    'login',
    `--mc-api-url=${mcApiUrl}`,
    '--project-key',
    process.env.INITIAL_PROJECT_KEY,
    '--force',
  ],
  { stdio: 'inherit' }
);

process.exit(result.status ?? 1);

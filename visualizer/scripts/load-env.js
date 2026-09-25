const fs = require('fs');
const os = require('os');
const path = require('path');

require('dotenv').config({ path: ['.env.local', '.env'] });

const credentialsPath = path.join(
  os.homedir(),
  '.commercetools',
  'mc-credentials.json'
);

if (!fs.existsSync(credentialsPath)) {
  throw new Error(
    `No Merchant Center credentials found at ${credentialsPath}. Run "npm run login" first.`
  );
}

const credentials = JSON.parse(fs.readFileSync(credentialsPath, 'utf8'));
const mcApiUrls = Object.keys(credentials);

const mcApiUrl =
  mcApiUrls.find((url) => url === process.env.MC_API_URL) ||
  (mcApiUrls.length === 1 ? mcApiUrls[0] : undefined);

if (!mcApiUrl) {
  throw new Error(
    `Could not determine which Merchant Center API URL to use from ${credentialsPath}. Found: ${mcApiUrls.join(
      ', '
    )}`
  );
}

process.env.MC_API_URL = mcApiUrl;
process.env.MC_ACCESS_TOKEN = credentials[mcApiUrl].token;

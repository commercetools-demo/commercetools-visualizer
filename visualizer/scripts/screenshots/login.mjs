// Opens a headed browser against the local dev server so you can log into the
// Merchant Center by hand, then saves the resulting session (cookies + localStorage)
// to auth-state.json for capture.mjs to reuse headlessly.
//
// Usage: yarn start (in the visualizer/ root, in another terminal), then:
//   npm install && npm run login

import { fileURLToPath } from 'url';
import path from 'path';
import { chromium } from 'playwright';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const PROJECT_KEY = process.env.MC_PROJECT_KEY || 'tech-sales-good-store';
const PORT = process.env.MC_PORT || 3001;
const BASE = `http://localhost:${PORT}/${PROJECT_KEY}/visualizer`;
const AUTH_STATE_PATH = path.join(__dirname, 'auth-state.json');

const browser = await chromium.launch({ headless: false });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

await page.goto(BASE, { waitUntil: 'domcontentloaded', timeout: 30000 }).catch((e) => {
  console.log('goto error:', e.message);
});

// Confirm we actually left for the identity provider before waiting for the return trip,
// otherwise a transient localhost hit during the initial redirect matches immediately.
try {
  await page.waitForURL((url) => url.hostname !== 'localhost', { timeout: 15000 });
  console.log('Redirected to login at', page.url());
} catch {
  console.log('Did not redirect away from localhost — may already be logged in:', page.url());
}

console.log('Please log in now in the opened browser window. Waiting up to 10 minutes ...');

try {
  await page.waitForURL((url) => url.hostname === 'localhost', { timeout: 10 * 60 * 1000 });
} catch (e) {
  console.log('TIMEOUT waiting for login redirect:', e.message);
  await browser.close();
  process.exit(1);
}

// The app shell finishes loading (project selection, shell chrome) a moment after the redirect.
await page.waitForLoadState('networkidle').catch(() => {});
await page.waitForTimeout(3000);
console.log('Back on localhost, current URL:', page.url());
console.log('Title:', await page.title());

await page.context().storageState({ path: AUTH_STATE_PATH });
console.log('Saved storage state to', AUTH_STATE_PATH);

await browser.close();

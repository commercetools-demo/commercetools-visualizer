// Captures the README/docs screenshots against a locally running dev server,
// reusing the session saved by login.mjs. Requires real data to exist in each
// feature area (a state, a subscription, a type, an extension, a custom object
// under CUSTOM_OBJECTS_CONTAINER) — this only navigates the UI, it never creates
// or modifies data itself.
//
// Usage: yarn start (in the visualizer/ root, in another terminal), then:
//   npm install && npm run login && npm run capture

import { fileURLToPath } from 'url';
import path from 'path';
import { chromium } from 'playwright';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const PROJECT_KEY = process.env.MC_PROJECT_KEY || 'tech-sales-good-store';
const PORT = process.env.MC_PORT || 3001;
const BASE = `http://localhost:${PORT}/${PROJECT_KEY}/visualizer`;
const AUTH_STATE_PATH = path.join(__dirname, 'auth-state.json');
const OUTPUT_DIR = path.join(__dirname, '..', '..', 'docs');
const CUSTOM_OBJECTS_CONTAINER = process.env.CUSTOM_OBJECTS_CONTAINER || 'page-editor';

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({
  storageState: AUTH_STATE_PATH,
  viewport: { width: 1440, height: 900 },
});
const page = await context.newPage();
page.on('pageerror', (err) => console.log('[pageerror]', err.message));

async function shot(name) {
  await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {});
  await page.waitForTimeout(800);
  const ext = name.endsWith('.png') ? 'png' : 'jpeg';
  await page.screenshot({
    path: path.join(OUTPUT_DIR, name),
    fullPage: true,
    type: ext,
    quality: ext === 'jpeg' ? 90 : undefined,
  });
  console.log('shot:', name, '| url:', page.url());
}

async function goto(pathname) {
  await page.goto(`${BASE}${pathname}`, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {});
}

// The DataTable component's header row also matches [role="row"], so index 0 is
// the header and index 1 is the first data row.
async function clickFirstDataRow() {
  const row = page.locator('[role="row"]').nth(1);
  await row.waitFor({ state: 'visible', timeout: 10000 });
  await row.click();
}

async function clickFirstFlowNode() {
  const node = page.locator('.react-flow__node').first();
  await node.waitFor({ state: 'visible', timeout: 10000 });
  await node.click();
}

async function clickButtonByText(re) {
  const btn = page.getByRole('button', { name: re }).first();
  await btn.waitFor({ state: 'visible', timeout: 10000 });
  await btn.click();
}

// Prime sessionStorage — a fresh context's very first navigation must be to the app
// root, otherwise a direct deep link (e.g. goto('/types') as the first request) gets
// bounced back to the Welcome screen before the shell's silent-auth bootstrap completes.
await goto('');
await shot('Homescreen.jpg');

// Extensions (no Details view in this app)
await goto('/extensions');
await shot('Extensions-List.jpg');
try {
  await clickButtonByText(/add new extension/i);
  await shot('Extensions-New.jpg');
} catch (e) {
  console.log('Extensions-New FAILED:', e.message);
}

// States (react-flow diagram, not a table — click a node, not a row)
await goto('/states');
await shot('States-List.jpg');
try {
  await clickFirstFlowNode();
  await shot('States-Details.jpg');
} catch (e) {
  console.log('States-Details FAILED:', e.message);
}
try {
  await goto('/states');
  await clickButtonByText(/add new state/i);
  await shot('States-New.jpg');
} catch (e) {
  console.log('States-New FAILED:', e.message);
}

// Subscriptions
await goto('/subscriptions');
await shot('Subscriptions-List.jpg');
try {
  await clickFirstDataRow();
  await shot('Subscriptions-Details.jpg');
} catch (e) {
  console.log('Subscriptions-Details FAILED:', e.message);
}
try {
  await goto('/subscription/new');
  await shot('Subscriptions-New.jpg');
} catch (e) {
  console.log('Subscriptions-New FAILED:', e.message);
}

// Types (row click opens a slide-over panel — give its transition time to settle)
await goto('/types');
await shot('Types-List.jpg');
try {
  await clickFirstDataRow();
  await page.waitForTimeout(2500);
  await shot('Types-Details.jpg');
} catch (e) {
  console.log('Types-Details FAILED:', e.message);
}
try {
  await goto('/types');
  await clickButtonByText(/add new type/i);
  await shot('Types-New.jpg');
} catch (e) {
  console.log('Types-New FAILED:', e.message);
}

// Custom Objects (list requires a real container name typed into the search box)
await goto('/custom-objects');
const search = page.getByPlaceholder(/container name/i);
await search.fill(CUSTOM_OBJECTS_CONTAINER);
await page.waitForTimeout(1500); // debounce in the component
await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {});
await shot('Custom-Objects-List.png');
try {
  await clickFirstDataRow();
  await page.waitForTimeout(1000);
  await shot('Custom-Objects-Edit.png');
} catch (e) {
  console.log('Custom-Objects-Edit FAILED:', e.message);
}

await browser.close();
console.log('DONE');

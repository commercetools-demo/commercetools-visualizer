import fs from 'fs';
import path from 'path';
import { defineConfig } from 'cypress';
import { customApplicationConfig } from '@commercetools-frontend/cypress/task';

export default defineConfig({
  retries: 1,
  video: false,
  viewportWidth: 1440,
  viewportHeight: 900,
  e2e: {
    async setupNodeEvents(on, cypressConfig) {
      // Real environment variables (e.g. from CI) win over .env.local, which wins
      // over .env: dotenv never overrides a variable that is already set, so load
      // the most specific file first. Blank values in .env are treated as unset.
      if (!process.env.CI) {
        const dotenv = await import('dotenv');
        dotenv.config({ path: path.join(__dirname, '.env.local') });
        dotenv.config({ path: path.join(__dirname, '.env') });
      }

      on('task', { customApplicationConfig });

      // The MC shell/Nimbus start a View Transition on startup; in recent Chromium the
      // skipped transition stops frame production and screenshots time out. Same
      // workaround as scripts/screenshots/capture.mjs.
      on('before:browser:launch', (browser, launchOptions) => {
        if (browser.family === 'chromium') {
          launchOptions.args.push(
            '--disable-features=ViewTransition,ViewTransitionOnNavigation'
          );
        }
        if (browser.name === 'electron') {
          // The default Electron window is smaller than the viewport (the screenshot
          // would be cropped) and a retina Mac doubles the pixel density. Match the
          // 1440x900 @1x output the docs were produced with.
          launchOptions.preferences.width = 1440;
          launchOptions.preferences.height = 900;
          launchOptions.args.push('--force-device-scale-factor=1');
        }
        return launchOptions;
      });

      // The README screenshots live in docs/. Move the ones taken by the screenshots
      // spec there (overwriting in place); leave failure screenshots where they are.
      on('after:screenshot', (details) => {
        if (
          !details.specName?.endsWith('screenshots.cy.ts') ||
          details.testFailure
        ) {
          return;
        }
        // Cypress doesn't move the file itself, the hook must, then report the new path.
        const target = path.join(__dirname, 'docs', `${details.name}.png`);
        fs.mkdirSync(path.dirname(target), { recursive: true });
        fs.renameSync(details.path, target);
        return { path: target };
      });

      return {
        ...cypressConfig,
        env: {
          ...cypressConfig.env,
          LOGIN_USER: process.env.CYPRESS_LOGIN_USER,
          LOGIN_PASSWORD: process.env.CYPRESS_LOGIN_PASSWORD,
          PROJECT_KEY: process.env.INITIAL_PROJECT_KEY,
          CUSTOM_OBJECTS_CONTAINER:
            process.env.CYPRESS_CUSTOM_OBJECTS_CONTAINER || 'page-editor',
        },
      };
    },
    baseUrl: 'http://localhost:3001',
  },
});

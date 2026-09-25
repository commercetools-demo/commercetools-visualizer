# Screenshot scripts

Regenerates the screenshots in `visualizer/docs/` (used by the top-level `README.md`)
against a real, logged-in Merchant Center session, headlessly, using Playwright.

## Prerequisites

- Real data in each feature area of the target project: at least one Extension, State,
  Subscription, Type, and a Custom Object under the container passed as
  `CUSTOM_OBJECTS_CONTAINER`. This script only navigates the UI — it never creates or
  modifies data.
- The dev server running in another terminal: `cd visualizer && yarn start` (defaults to
  `http://localhost:3001`).

## Usage

```shell
cd visualizer/scripts/screenshots
npm install
npm run login      # opens a headed browser — log into the MC by hand, then it saves
                    # the session to auth-state.json (gitignored, never commit it)
npm run capture     # headless; writes straight into ../../docs, overwriting in place
```

Override the target project/port/container with env vars if they differ from the
current defaults (`tech-sales-good-store`, port `3001`, container `page-editor`):

```shell
MC_PROJECT_KEY=other-project MC_PORT=3002 CUSTOM_OBJECTS_CONTAINER=other-container npm run capture
```

## Notes

- `playwright` is pinned to `1.61.0` in `package.json` because that's the version
  whose bundled Chromium build was already present in this machine's
  `~/Library/Caches/ms-playwright` cache when these scripts were written — avoids
  re-downloading a ~180MB browser. Bump it freely if you're on a different machine;
  `npx playwright install chromium` will just fetch whatever that version needs.
- `login.mjs` deliberately waits for the browser to leave `localhost` (redirect to the
  identity provider) before it starts waiting for the return trip — otherwise the
  transient `localhost` hit during the *initial* redirect matches immediately and the
  script exits before you've logged in.
- A fresh browser context's very first navigation must be to the app root (`goto('')`),
  not directly to a deep link like `/types` — the shell's silent-auth bootstrap uses
  `sessionStorage` (which `storageState()` does not capture), so a cold deep link gets
  bounced back to the Welcome screen. `capture.mjs` always visits home first.
- The Types list opens detail as a slide-over panel rather than a route change; give its
  CSS transition time to finish before screenshotting or you'll capture it mid-animation.
- The States list renders as a react-flow diagram, not a table — click a
  `.react-flow__node`, not a table row, to reach its detail view.

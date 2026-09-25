# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repo layout

This repo has an unusual nesting: the actual application lives in the **`visualizer/`
subdirectory** (`visualizer/visualizer/` from the repo root), which is its own Yarn
project with its own `package.json`. **Run all commands below from inside `visualizer/`**,
not the repo root. The repo root only holds `connect.yaml` (the commercetools Connect
deployment descriptor), `netlify.toml`, and `specs/` (see "Specs / constitution" below).

## Commands

```shell
cd visualizer
yarn install                # postinstall runs generate-types:chakra automatically
yarn start                  # mc-scripts dev server
yarn build                  # production build
yarn test                   # jest (jest.test.config.js)
yarn test:watch
yarn test path/to/file.spec.tsx   # run a single test file
yarn test -t "test name"          # run tests matching a name
yarn lint                   # eslint . (also lints **/*.ctp.graphql via @graphql-eslint)
yarn format                 # prettier --write
yarn typecheck              # tsc --noEmit
```

CI (`.github/workflows/ci.yml`) only runs `yarn build` and `yarn test` on PRs into
`main` — it does **not** run `lint` or `typecheck`.

`yarn typecheck` currently fails immediately with
`Cannot find type definition file for 'graphql-ctp'` / `'json-stable-stringify'`. This
is a pre-existing environment issue in the base `tsconfig-mc-app.json` `types` list, not
something introduced by your change — it aborts before checking any project file, so it
gives no signal either way about your edits.

### Regenerating GraphQL types (`generate-types:ctp`)

```shell
yarn generate-types:ctp
```

This runs `scripts/login.js` (derives `--mc-api-url` from `CLOUD_IDENTIFIER` via
`@commercetools-frontend/application-config`'s `MC_API_URLS` map, then does an
interactive `mc-scripts login --force`, which opens a browser) and then
`graphql-codegen` against the live schema. **This will hang waiting for interactive
browser login if run non-interactively/headlessly** — don't background it and expect it
to finish.

It regenerates `schemas/ctp.json` (introspection) and `src/types/generated/ctp.ts`
(schema-wide TS types, all prefixed with `T` — `TSubscription`, `TQuery_StatesArgs`,
etc.). There is **no `documents:` config**, so this step does *not* validate or generate
types from the `.graphql` operation files under `src/hooks/*/`. Those are only checked
at request time by the real API — a syntactically-parseable-but-schema-invalid document
(e.g. an unused fragment) will not be caught by lint, typecheck, or this codegen step.
To validate a `.graphql` document against the schema without needing a live login, use
`graphql`'s `parse`/`validate` against the already-checked-in `schemas/ctp.json`.

### Environment / credentials

- `.env` is checked in (tracked, force-included via `!.env` in `.gitignore`) and holds
  non-secret defaults. `.env.local` is gitignored and layered on top (its values win on
  conflicts) — create it per the README's template for local dev.
- `MC_API_URL` and `MC_ACCESS_TOKEN` are **not** read from either `.env` file for
  codegen — `scripts/load-env.js` overwrites them at runtime from
  `~/.commercetools/mc-credentials.json` (populated by `mc-scripts login`), keyed by
  `CLOUD_IDENTIFIER`.

## Architecture

### Merchant Center Custom Application

This is a commercetools Connect-deployed Merchant Center custom application
(`connect.yaml`, `applicationType: merchant-center-custom-application`), not a
storefront. `custom-application-config.mjs` declares the app's `entryPointUriPath`,
`cloudIdentifier`, submenu links, and `oAuthScopes` (view_*/manage_* per resource).
`src/components/entry-point/entry-point.tsx` wraps `ApplicationShell` in `NimbusProvider`
(design system: `@commercetools/nimbus`, not the legacy `commercetools-uikit`) and lazily
loads `src/routes.tsx`, which maps one route per feature area to a top-level `*-list`
component under `src/components/<feature>/`.

Current feature areas: `types`, `states`, `subscriptions`, `extensions`,
`custom-objects`, `welcome`. (Two former visualizations, `entity-diagram` and
`visualize-drilldown`, plus `carts`, were removed and are explicitly **not** being
reimplemented — see `specs/README.md`.)

### Data layer: connector hooks

Every feature owns a `src/hooks/use-<feature>-connector/` directory following the same
shape:

```
fetch.graphql / fetch-all.graphql / create.graphql / update.graphql / delete.graphql
fragments/*.graphql
<feature>-connector.ts   # useMcQuery/useMcMutation wrappers + calculate*UpdateActions
conversion.ts            # form <-> API shape mapping
index.ts                 # re-exports
```

Queries run through `useMcQuery`/`useMcMutation` from
`@commercetools-frontend/application-shell-connectors` with
`context: mcApiContext` (`src/hooks/shared/mc-api-context.ts`), which targets the MC's
`ctp` GraphQL proxy (`GRAPHQL_TARGETS.COMMERCETOOLS_PLATFORM`).

**Fragment convention:** each connector splits fields into a *base fields* fragment
(used by the list/`fetch-all` query — only what the list table actually renders) and a
*detail* fragment that imports and extends the base one with the rest (used by
`fetch`/`update`). Update mutations return the same shape as the detail fetch so
Apollo's normalized cache updates in place after a save — don't reintroduce a manual
`refetch()` after a same-entity update; that only belongs after create/delete, where a
new list page has to be fetched. When splitting/adding fragments, make sure a fragment
spread into a query is *transitively* used by that query's own selection set — a
fragment file containing an unused fragment fails schema validation.

**REST/GraphQL update-action bridge:** `calculate<Feature>UpdateActions` in each
`*-connector.ts` diffs `originalDraft` vs `nextDraft` using `@commercetools/sync-actions`
(`createSyncTypes`/`createSyncStates`/etc.), which only knows the **REST** action shape.
`createGraphQlUpdateActions` (`src/hooks/shared/graphql-helpers.ts`) then converts each
REST action into its GraphQL update-action input equivalent (e.g. `changeDestination`'s
REST payload becomes the GraphQL `TChangeSubscriptionDestination` union). If you add a
new update action that carries a payload shape sync-actions and the GraphQL schema
disagree on, it needs a case in `convertAction`.

Error handling: mutations are wrapped with `graphQLErrorHandler(showNotification,
formikHelpers, errorCodeMapping?)` (`src/hooks/shared/error-handling.ts`). Pass an
`ErrorCodeMapping` (`{ errorCode, errorObject }[]`) when a specific GraphQL error code
(e.g. `DuplicateField`) should surface as a Formik field error instead of a generic
notification — see `subscription-details-page.tsx` for the pattern.

### Specs / constitution

`specs/` is a spec-kit-style reverse-engineered spec set (one dir per feature,
`spec.md` + `data-model.md` + `contracts/*.graphql`), written as part of an in-progress
reimplementation on Nimbus. `specs/README.md` is the project "constitution" and encodes
rules that apply everywhere but aren't repeated per-component: the View/Manage
permission model (forms go read-only + disabled, never hidden, without Manage), the
shared key-validation regex (`^[a-zA-Z0-9-_]+$`, 2–256 chars, immutable after create),
optimistic concurrency via `version` + update-action diffing (no API call if the diff is
empty), and localized-string handling (omit empty translations on save). Check there
before assuming a cross-cutting behavior is a one-off.

### Testing

- `jest.test.config.js` uses the `@commercetools-frontend/jest-preset-mc-app/typescript`
  preset plus two local fixes required for Nimbus: `jest.setup.nimbus.js` polyfills
  browser APIs (`ResizeObserver` etc.) that Nimbus/React Aria need but JSDOM lacks, and
  `jest.resolver.js` patches Nimbus's CJS build (which has broken internal `.cjs.js`
  requires) and forces a few ESM-only transitive deps to their CJS entry point.
- Component tests mock the GraphQL layer with `msw` (`setupServer`/`graphql.query`/
  `graphql.mutation`) rather than mocking the connector hooks — see any
  `*.spec.tsx` next to a `*-page.tsx`/`*-edit.tsx` for the pattern
  (`renderAppWithRedux` + `NimbusProvider` wrapper, `onUnhandledRequest: 'error'` to
  catch un-mocked queries).

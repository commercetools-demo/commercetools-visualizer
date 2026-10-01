# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repo layout

This repo has an unusual nesting: the actual application lives in the **`visualizer/`
subdirectory** (`visualizer/visualizer/` from the repo root), which is its own npm
project with its own `package.json`. **Run all commands below from inside `visualizer/`**,
not the repo root. The repo root only holds `connect.yaml` (the commercetools Connect
deployment descriptor), `netlify.toml`, and `specs/` (see "Specs / constitution" below).

## Commands

```shell
cd visualizer
npm install                 # postinstall runs generate-types:chakra automatically
npm start                    # mc-scripts dev server
npm run build                # production build
npm test                     # jest (jest.test.config.js)
npm run test:watch
npm test -- path/to/file.spec.tsx   # run a single test file
npm test -- -t "test name"          # run tests matching a name
npm run lint                 # eslint . (also lints **/*.ctp.graphql via @graphql-eslint)
npm run format                # prettier --write
npm run typecheck             # tsc --noEmit
```

CI (`.github/workflows/ci.yml`) only runs `npm run build` and `npm run test` on PRs into
`main` — it does **not** run `lint` or `typecheck`.

`npm run typecheck` passes cleanly (`skipLibCheck` is on in `tsconfig.json` because
third-party `.d.ts` files in chakra/react-use/apollo ship their own errors). tsconfig's
`typeRoots` includes `@types-extensions`, and TypeScript loads *every* folder under a type
root as an implicit type library — so a stray empty directory there (e.g. a leftover
`@types-extensions/graphql-ctp/`) aborts `tsc` with `Cannot find type definition file`
before any project file is checked. Delete such empty folders if you see that error.

### Regenerating GraphQL types (`generate-types:ctp`)

```shell
npm run generate-types:ctp
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

`@commercetools/sync-actions` doesn't always *detect* a diff at all, though, regardless
of shape — e.g. its Type enum-value diffing (`actionsMapEnums`) only wires up add/change
handlers, never a remove one, so a deleted enum value is silently dropped rather than
producing `removeEnumValues`/`removeLocalizedEnumValues`. `calculateFieldDefinitionUpdateActions`
(`use-types-connector/types-connector.ts`) works around this with its own
`calculateEnumValueRemovals`, diffing by key and prepending the result before the
sync-actions-produced actions (removal must apply before any `changeEnumValueOrder`,
since that action's `keys` must match the *current* value set). The remaining actions are
then diffed against the field *with those removed values already filtered out*
(`withoutRemovedEnumValues`), because sync-actions pairs enum values by position and would
otherwise report every value after a removed one as a bogus `addEnumValue`.
Subscriptions have the same kind of gap: sync-actions' subscription sync only knows
setKey/setMessages/setChanges/changeDestination, so `setEvents` is diffed in
`subscription-connectors.ts`. And `calculateExtensionsUpdateActions` only sees what its
`convertTExtension*` helpers copy into the compared shape — a destination type or field they
don't convert (as AWS Lambda and `timeoutInMs` once weren't) produces *no action at all*, so
add new fields there and to the update-action spec. Extensions' dependencies, expansion paths
and additional context are not known to sync-actions either and are diffed in
`calculateExtraActions` (same file). Limits the API documents for such fields (max 5
dependencies, no cycles, applicable to every trigger/action, max 3 expansion paths) live in
`extensions-form/restrictions.ts` as pure, unit-tested functions. Before assuming a
change will be picked up automatically, check the installed `sync-actions` version's
source for the relevant `actionsMap*` function rather than just the target schema.

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
  catch un-mocked queries). Capture mutation variables inside the handler (cast
  `req.variables` to the expected shape) and assert on the update actions sent.
- Mock Types data with `@commercetools-test-data/type` through the wrappers in
  `src/test-utils/models/types/` (`buildTypeDefinition`, `buildFieldDefinition`,
  `simpleFieldType`/`enumFieldType`/`localizedEnumFieldType`/`referenceFieldType`/
  `setFieldType`). Nested fields must be passed to the builders as **builders**, not as
  built objects (`buildGraphql` on a built value throws "Builder … does not exist on field"),
  and `random()` adds extra random locales — to test a diff, `JSON.parse(JSON.stringify())`
  a built value and mutate the clone instead of building two independent ones. Only the
  `type`, `channel`, `core` and `commons` test-data packages are installed; other features
  use hand-written fixtures (subscriptions have their own builders in
  `src/test-utils/models/subscriptions/`).
- A field the API treats as *unset* differently from *empty* needs an explicit tri-state in the
  form, not `[]` as the "nothing" value: a state's `transitions` (unset = any transition allowed,
  `[]` = a final state) is `restrictTransitions` + a list, and an unset one is left out of the
  diffed shape so sync-actions can't turn it into `[]`.
- Lookup queries that only feed validation (`FetchTypeFieldTypes`,
  `FetchExtensionDependencyCandidates`) use `fetchPolicy: 'no-cache'`: their narrow selection of
  un-normalized arrays (`fieldDefinitions`, `triggers`) would otherwise overwrite what the open
  page's own query cached.
- Lists that mirror an API enum (Type `resourceTypeIds`, Reference targets, Subscription
  change/message resource types, message types per resource) are pinned by specs next to the
  constants, each holding its own copy of the official values with the docs URL. When a spec
  fails after an API change, update the constant *and* the spec copy. Source for the values:
  the OpenAPI enums (`commercetools-oas-schemata`) or the docs pages; message types come
  from the Messages reference pages, where each message is listed under its owning resource
  (don't group them by name prefix — `CustomerGroupSet` belongs to `customer`, but
  `CustomerGroupAssignmentAdded` to `customer-group`).
- Pure logic (conversions, `calculate*UpdateActions`, column definitions via
  `createIntl`, `graphQLErrorHandler`) has plain unit specs next to the source file.
- Nimbus `Select` has no `isReadOnly`, and an `isDisabled` set on `Select.Root` inside a
  `FormField` is overridden by the field's own state — put `isDisabled` on `FormField.Root`
  (the trigger then gets `disabled`; assert it, the default render silently stays enabled).
- Nimbus injects a theme-bootstrapping `<script>` into the render container, so assert on
  text via `screen`, not `container.textContent`.

### Docs screenshots

`visualizer/scripts/screenshots/` (its own npm project, Playwright) regenerates
`visualizer/docs/*` used by the README. `npm run login` (headed, manual MC login) saves a
gitignored `auth-state.json`; `npm run capture` then needs the dev server on port 3001 and
real data in the target project. `capture.mjs` launches Chromium with
`--disable-features=ViewTransition,ViewTransitionOnNavigation` — without it the app's
startup View Transition stalls frame production and every `page.screenshot()` times out.
`~/.commercetools/mc-credentials.json` (an API token used for codegen) is unrelated to
`auth-state.json` (a browser session) and cannot replace it.

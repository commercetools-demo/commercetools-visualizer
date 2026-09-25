<!--
Sync Impact Report
- Version change: 1.0.0 → 1.1.0
- Modified principles:
  - IV. Localization Completeness — expanded from data-level localized-string fields
    only to also require react-intl for every piece of the app's own UI text (no raw
    JSX string literals), globally-unique message ids, and en/de catalog parity.
    Prompted by a live audit: the Welcome page was entirely hardcoded and never wired
    to react-intl, and 14 message ids collided with different text across components,
    both classes of bug invisible until the German catalog was actually populated.
- Added sections: none this round
- Removed sections: none
- Templates requiring updates: none checked in this run — dependent templates/commands
  read this file at runtime per the Scope Guard and are not modified here.
- Follow-up TODOs: none
-->

# Visualizer Constitution

## Core Principles

### I. Nimbus-First UI Target
The reimplementation targets the commercetools **Nimbus** design system
(`@commercetools/nimbus`), replacing the legacy `commercetools-uikit`. Specs and new
UI work MUST describe behavior and intent, never specific UIKit component names.
Domain concepts (commercetools entities, GraphQL, MC routing, permissions) carry over
and are named freely. Rationale: UIKit is being retired from this app; naming specs in
terms of UIKit components would make them stale the moment the migration lands.

### II. Merchant Center Platform Constraints
This is a commercetools Merchant Center **custom application**
(`applicationType: merchant-center-custom-application`), not a storefront. It MUST use
the MC application shell, the project's `dataLocale` / `projectLanguages`, the MC
notification system, and the MC GraphQL proxy (`ctp` target,
`GRAPHQL_TARGETS.COMMERCETOOLS_PLATFORM`) for data-backed features. Rationale:
these are host-provided integration points; bypassing them (custom auth, ad hoc
notification UI, direct REST calls where GraphQL is available) breaks MC conventions
merchants and reviewers rely on.

### III. View/Manage Permission Model (NON-NEGOTIABLE)
Every feature implicitly requires the **View** permission to render at all. All
create/edit/delete operations additionally require the **Manage** permission
(`PERMISSIONS.Manage`). Without Manage, forms MUST render **read-only** and
create/save/delete affordances MUST be **disabled** — they MUST NEVER be hidden.
Per-resource OAuth scopes are declared in `custom-application-config.mjs`. Rationale:
hiding controls instead of disabling them removes the user's ability to understand
why an action is unavailable, and is explicitly rejected by this project.

### IV. Localization Completeness
This principle covers two distinct localization axes; both are required, and neither
substitutes for the other.

**Data-level:** fields that hold commercetools localized strings (Type names,
descriptions, etc.) MUST render one input per project language. On save, empty
translations MUST be omitted rather than persisted as empty strings. Rationale:
persisting empty translations pollutes the localized-string object and can mask
missing-translation bugs in the merchant-facing UI.

**App-UI-level:** every piece of this app's own UI text — labels, headings, button
text, notification text, `aria-label`s, placeholders, anything visible or exposed to
assistive tech — MUST go through react-intl: a `defineMessages` entry in that
component's `messages.ts`, rendered via `intl.formatMessage(...)` or
`<FormattedMessage {...} />`. A raw string literal in JSX (`<Text>Cancel</Text>`,
`aria-label="Form actions"`) MUST NOT ship, even for a single word. Message `id`s MUST
be globally unique across the whole app, not just within a file or component — id
collisions with *different* `defaultMessage` text are invisible in dev (react-intl
falls back to each call site's own local `defaultMessage` when the compiled catalog
has no matching entry, so nothing breaks until a catalog actually populates that id)
but silently show the wrong text once one does. The catalogs are flat per-locale JSON
files at `src/i18n/data/{core,en,de}.json`, regenerated from every `messages.ts` via
`yarn extract-intl`; `en.json` and `de.json` MUST carry the exact same key set with
matching `{placeholder}` tokens (verify programmatically, not by eye — a full pass is
one `Object.keys` diff plus a placeholder-regex diff, not something to skip). This
project's German locale is the reference: keep it fully in sync whenever messages
change, at least until a wider translation workflow exists. Rationale: this was audited
and found broken in practice — the Welcome page's five feature cards were pure
hardcoded English JSX, never wired to react-intl at all, and 14 message ids across
Extensions/Subscriptions/Types/Custom-Objects/States collided with different text in
different components, both invisible for the same reason (empty/local-fallback
catalogs mask exactly this class of bug) until German translations were actually
populated.

### V. Optimistic Concurrency & Minimal Updates
Every entity carries a `version`. Update and delete operations MUST send the current
version; a version mismatch surfaces as an error notification, and the user must
reload and retry — the app MUST NOT silently retry or overwrite. Updates MUST send
only **changed** fields, computed as commercetools update actions (a diff between the
loaded entity and the form draft). If the diff produces no actions, **no API call is
made**. Rationale: commercetools update actions are the platform's optimistic-locking
mechanism; sending full-document replacements or unconditional calls defeats both the
version check and audit/webhook systems that key off specific update actions.

### VI. Shared Key Validation Rule
A resource `key` (and a Type's field-definition `name`) MUST be 2–256 characters,
matching `^[a-zA-Z0-9-_]+$` (alphanumerics, underscores, hyphens only — no spaces or
other special characters), trimmed before validation. Keys are **immutable after
creation**: the key field MUST be read-only in edit mode. Server-side uniqueness
enforcement is authoritative; the client only pre-validates shape. Rationale: this
regex and immutability rule is a single cross-cutting constraint shared by every
feature — encoding it once here avoids five slightly-different reimplementations
drifting out of sync.

### VII. User Feedback & Error Handling
Every success and error outcome MUST surface a notification through the MC
notification side channel. GraphQL errors MUST be converted to human-readable
messages before display — never surfaced as raw GraphQL/network error objects. List
and detail views MUST show a loading indicator while fetching and an error
notification on failure. Rationale: merchants using this app are non-technical
end users of the Merchant Center; raw error payloads or silent failures are not
acceptable UX in that context.

### VIII. List View Conventions
List views MUST be paginated and, where the underlying API supports it, sortable.
Every list MUST define a "no items available" empty state and support row-click
navigation to the corresponding detail/edit view. Rationale: consistent list behavior
across Types, States, Subscriptions, Extensions, and Custom Objects lets merchants
transfer learned behavior between features instead of relearning per screen.

## Data Layer Conventions

Every feature owns a `src/hooks/use-<feature>-connector/` directory following a fixed
shape: `fetch.graphql` / `fetch-all.graphql` / `create.graphql` / `update.graphql` /
`delete.graphql`, a `fragments/` directory, `<feature>-connector.ts` (query/mutation
wrappers plus `calculate*UpdateActions`), `conversion.ts` (form ↔ API shape mapping),
and `index.ts`.

- **Fragment convention.** Each connector MUST split fields into a *base fields*
  fragment (used by the list/`fetch-all` query — only what the list table renders) and
  a *detail* fragment that imports and extends the base one with the rest (used by
  `fetch`/`update`). Update mutations MUST return the same shape as the detail fetch so
  Apollo's normalized cache updates in place after a save. A manual `refetch()` after a
  same-entity update MUST NOT be reintroduced; `refetch()` is reserved for
  create/delete, where a new list page genuinely has to be fetched. Any fragment
  spread into a query MUST be transitively used by that query's own selection set —
  an unused fragment fails schema validation.
- **REST/GraphQL update-action bridge.** `calculate<Feature>UpdateActions` diffs
  `originalDraft` vs `nextDraft` via `@commercetools/sync-actions`, which only knows
  the REST action shape. `createGraphQlUpdateActions`
  (`src/hooks/shared/graphql-helpers.ts`) converts each REST action into its GraphQL
  update-action input equivalent. A new update action whose payload shape
  sync-actions and the GraphQL schema disagree on MUST add a case to `convertAction`
  rather than special-casing the call site.
- **Error handling.** Mutations MUST be wrapped with `graphQLErrorHandler`
  (`src/hooks/shared/error-handling.ts`). An `ErrorCodeMapping` MUST be passed when a
  specific GraphQL error code (e.g. `DuplicateField`) should surface as a Formik
  field error instead of a generic notification.

Rationale: these mechanics are non-obvious from reading any single connector in
isolation, and re-deriving them per feature (skipping the base/detail fragment split,
reintroducing `refetch()`, or hand-rolling a REST→GraphQL action mapping) has already
happened once in this codebase and been reverted — see commit `07aca33`.

## Development Workflow

- The application lives in the `visualizer/` subdirectory (`visualizer/visualizer/`
  from the repo root) as its own Yarn project. All commands (`yarn install`, `yarn
  start`, `yarn build`, `yarn test`, `yarn lint`, `yarn typecheck`, `yarn format`) MUST
  be run from inside `visualizer/`, not the repo root.
- CI (`.github/workflows/ci.yml`) runs only `yarn build` and `yarn test` on PRs into
  `main`. It does **not** run `lint` or `typecheck` — contributors remain responsible
  for running those locally before requesting review.
- `yarn typecheck` currently fails immediately on a pre-existing environment issue
  (missing type definitions for `graphql-ctp` / `json-stable-stringify` in the base
  `tsconfig-mc-app.json`), unrelated to any specific change. This MUST NOT be treated
  as a regression signal until the underlying `tsconfig` issue is fixed upstream.
- `.graphql` operation documents under `src/hooks/*/` are not covered by
  `generate-types:ctp` codegen (there is no `documents:` config) and are only
  validated by the live API at request time. To validate a document against the
  schema without an interactive login, use `graphql`'s `parse`/`validate` against the
  checked-in `schemas/ctp.json`.
- Component tests MUST mock the GraphQL layer with `msw`
  (`setupServer`/`graphql.query`/`graphql.mutation`) rather than mocking connector
  hooks directly, with `onUnhandledRequest: 'error'` to catch un-mocked queries.
  Rationale: mocking hooks tests the mock, not the query/fragment shape actually sent
  over the wire — the GraphQL-layer approach has caught schema-shape regressions that
  hook mocking would have missed.
- `yarn extract-intl`'s glob MUST exclude `.d.ts` files
  (`src/**/!(*.spec|*.d).(ts|tsx)`). Including them crashes `formatjs`'s TypeScript
  extraction on ambient-only declaration files (`src/globals.d.ts`) with an internal
  "Debug Failure" — the command still exits 0 but silently overwrites
  `src/i18n/data/core.json` with `{}`. Run it and skim the diff before trusting it;
  don't assume a clean exit means it worked.

## Governance

This constitution supersedes ad hoc conventions and prior undocumented practice for
everything it covers. Where `specs/README.md`'s "Constitution (project principles)"
section and this document overlap, this document
(`.specify/memory/constitution.md`) is the canonical, spec-kit-tracked source; update
both together if the underlying principle changes, or reduce `specs/README.md` to a
pointer at this file the next time that section is touched.

**Amendment procedure:** propose the change via `/speckit-constitution` (or a direct
edit reviewed like any other PR). Every amendment MUST update the Sync Impact Report
at the top of this file and bump `CONSTITUTION_VERSION` per semantic versioning:
MAJOR for backward-incompatible principle removals/redefinitions, MINOR for a new
principle or materially expanded guidance, PATCH for wording/clarification fixes.

**Compliance review:** PRs that touch permission gating, key validation, update-action
calculation, localized-string persistence, new/changed UI text and message ids, or
connector fragment structure MUST be checked against the relevant principle above
before merge. Deviations require an explicit rationale in the PR description, not
silent drift.

**Version**: 1.1.0 | **Ratified**: 2026-06-25 | **Last Amended**: 2026-09-25

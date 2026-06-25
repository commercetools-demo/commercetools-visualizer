# Visualizer — Feature Specifications

Spec-driven extraction of the **commercetools Visualizer**, a Merchant Center custom
application that lets merchants view and manage commercetools resources that have no
out-of-the-box Merchant Center UI: **Types, States, Subscriptions, API Extensions,
Custom Objects**, plus two read-only visualizations (**Visualize Drilldown** and
**Entity Diagram**).

These specs were reverse-engineered from the existing implementation so the application
can be **reimplemented**. They follow the [github/spec-kit](https://github.com/github/spec-kit)
convention: one numbered directory per feature, each containing a `spec.md` (the durable
"what") and a `data-model.md` (entities, form shapes, enumerations, API operations).

## How to read these specs

- **`spec.md`** is the source of truth. It describes *behavior and intent* — user
  scenarios, numbered functional requirements (`FR-###`), validation, navigation, edge
  cases. When requirements change, edit `spec.md` and regenerate the implementation.
- **`data-model.md`** captures the entity shapes, form/draft models, enumerations, and
  the GraphQL/REST operations + update-action mapping. These mirror the commercetools API
  (externally owned and stable) and the app's own form models.
- `plan.md` / `tasks.md` are intentionally **omitted** — implementation strategy and
  one-time task lists age badly and become a maintenance burden. The "how" lives in code.

## Constitution (project principles)

These principles apply to every feature and are not repeated in each spec.

1. **Target stack.** Reimplementation targets the commercetools **Nimbus** design system
   (replacing the legacy commercetools UIKit). Specs therefore describe UI *behavior and
   intent*, never specific UIKit component names. Domain concepts (commercetools entities,
   GraphQL, MC routing, permissions) are carried over and named freely.

2. **Platform.** A commercetools Merchant Center **custom application**. It uses the MC
   application shell, the project's `dataLocale` / `projectLanguages`, the MC notification
   system, and the MC GraphQL endpoint (`ctp` target) — except the two visualizations,
   which read via the REST API proxy (`COMMERCETOOLS_PLATFORM` target).

3. **Permissions.** The app implicitly requires the **View** permission to render. All
   create / edit / delete operations additionally require the **Manage** permission
   (`PERMISSIONS.Manage`). Without Manage, forms render **read-only** and create / save /
   delete affordances are **disabled** — never hidden. (Per-resource OAuth scopes are
   listed in `custom-application-config.mjs`.)

4. **Localization.** All user-facing strings are externalized (react-intl style). Fields
   that hold commercetools localized strings render one input per project language and
   **omit empty translations** when persisting.

5. **Optimistic concurrency.** Every entity carries a `version`. Update and delete send
   the current version; a version mismatch surfaces as an error notification and the user
   must reload and retry. Updates send only **changed** fields, computed as commercetools
   update actions (diff between the loaded entity and the form draft); if no actions are
   produced, no API call is made.

6. **Key validation (shared rule).** A resource `key` (and Type field-definition `name`)
   must be **2–256 characters**, matching `^[a-zA-Z0-9-_]+$` (alphanumerics, underscores,
   hyphens; no spaces or special characters). Trimmed before validation. Keys are
   immutable after creation (the key field is read-only in edit mode); uniqueness is
   enforced server-side.

7. **Feedback.** Success and error operations show a notification (MC side channel).
   GraphQL errors are converted to human-readable messages. List and detail views show a
   loading indicator while fetching and an error notification on failure.

8. **List conventions.** List views are paginated and (where supported) sortable, with a
   "no items available" empty state and row-click navigation to the detail/edit view.

## Feature index

| #   | Feature | Entity | Route |
|-----|---------|--------|-------|
| 001 | [Welcome / Home](001-welcome/spec.md) | — | `/` |
| 002 | [Types](002-types/spec.md) | `Type` (custom field definitions) | `/types` |
| 003 | [States](003-states/spec.md) | `State` (finite state machines) | `/states/:type?` |
| 004 | [Subscriptions](004-subscriptions/spec.md) | `Subscription` (event messaging) | `/subscriptions` |
| 005 | [API Extensions](005-extensions/spec.md) | `Extension` (API webhooks) | `/extensions` |
| 006 | [Custom Objects](006-custom-objects/spec.md) | `CustomObject` (arbitrary JSON) | `/custom-objects` |

> The Welcome screen also links to `visualize`, `visualize-drilldown`, and `entity-diagram`
> targets. Those read-only visualizations are **not** being reimplemented and are not
> specified here; drop their cards/routes (see `001-welcome`).

## Per-feature artifacts

Each data-backed feature (002–006) additionally provides:

- **`contracts/<feature>.graphql`** — the concrete commercetools GraphQL query and mutation
  documents (validated against the official commercetools schema), including the update-action
  inputs. This is the API contract the data layer implements.
- **`quickstart.md`** — a step-by-step build guide for reimplementing the feature: routes,
  data layer (wiring the contract documents), views, forms/validation, and the shared
  cross-cutting concerns. Read alongside this README's constitution.

`001-welcome` has a `quickstart.md` but no `contracts/` (it makes no API calls).

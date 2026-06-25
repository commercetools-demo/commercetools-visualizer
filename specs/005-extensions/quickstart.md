# Quickstart: API Extensions

Build guide for reimplementing the **Extension** feature. Read alongside the shared
constitution in [../README.md](../README.md) — permissions, optimistic concurrency, key
validation, notifications, and list conventions live there and are not repeated below.
The API contract is [contracts/extensions.graphql](contracts/extensions.graphql).

## Prerequisites

- A commercetools Merchant Center **custom application** scaffold with the MC application
  shell rendering, and the **Nimbus** design system available.
- The MC GraphQL client wired through the app shell against the **`ctp` target** (project
  schema). The OAuth scopes for `Extension` are declared in `custom-application-config.mjs`.
- Routing in place so this feature can mount under the app root.

## 1. Routes

From `spec.md` §4, mount under the app root:

| View | Route | Presentation |
|------|-------|--------------|
| List | `/extensions` | full page, data table |
| Create | `/extensions/new` | modal form over the list |
| Edit | `/extensions/:id` | modal form (Revert, Save, Delete) over the list |

Create and edit are modal routes layered on the list, so the list stays mounted behind them.

## 2. Data layer

Wire the five documents from `contracts/extensions.graphql`:

- `GetExtensions(limit, offset, sort)` → list (results + total for pagination).
- `GetExtension(id)` → edit-form load (full selection).
- `CreateExtension(draft)`, `UpdateExtension(id, version, actions)`,
  `DeleteExtension(id, version)`.

Expose fetch/mutate hooks over these. Then:

- **Optimistic concurrency** (see ../README.md §5): update and delete send the loaded
  `version`; a mismatch is surfaced as an error notification — user reloads and retries.
- **Update actions = diff.** On save, compute actions by diffing the loaded `Extension`
  against the form draft (`calculateExtensionsUpdateActions`):
  key → `setKey`, destination → `changeDestination`, triggers → `changeTriggers`,
  timeout → `setTimeoutInMs`. Emit an action **only** for changed fields; if none, skip the
  API call entirely.
- **Flat ↔ nested conversion.** The form is flat (see `data-model.md` "Form model"); the API
  is nested. Implement `tExtensionToFormValues` (read → flat) and `formValuesToTExtension`
  (flat → nested `ExtensionDraft` / destination input). Destination conversion reads only the
  fields relevant to the selected `destinationName`, ignoring the other type's stale fields.
  The nested `authentication` maps to the flat `destinationHttpAuthenticationName` + its one
  secret field; `triggers[]` round-trips as-is, including the read-only `condition`.

## 3. List view

Paginated, sortable table (../README.md §8). Columns map to read fields: key, destination
(type, summarized), triggers (summary), timeout, createdAt, lastModifiedAt. Default sort is
`key asc`; also sortable by destination, triggers, timeout, createdAt, lastModifiedAt — pass
the chosen column as the `sort` variable. Row click → `/extensions/:id`. An "Add New
Extension" affordance → `/extensions/new`. Empty state when there are no extensions.

## 4. Create / edit form

One shared form with three collapsible sections. On **create** all sections start expanded;
on **edit** only General Information is expanded.

1. **General Information — Key** (required, shared key rule per ../README.md §6; immutable /
   read-only in edit).
2. **Destination.**
   - **Type** select: `HTTP` (default) | `AWSLambda`. **Immutable in edit** — render
     read-only after creation. (`GoogleCloudFunction` exists in the schema but is **not**
     offered; omit it.) Switching type in create mode need not clear the other type's fields —
     the draft conversion ignores irrelevant fields.
   - **HTTP fields:** **URL** (required). **Authentication** select: None |
     `AuthorizationHeader` (→ header value field) | `AzureFunctions` (→ key field). The
     conditional secret field is required only when its method is selected.
   - **AWS Lambda fields:** **ARN**, **Access key**, **Access secret** (all required).
3. **Triggers.** A matrix of resource type × action (`Create` / `Update`); resource types
   per `data-model.md` (cart, order, payment, customer, quote-request, staged-quote, quote,
   business-unit). Checking a box adds the action to that resource's `actions[]`, creating
   the trigger entry if absent; unchecking removes the action, and removes the trigger entry
   when its `actions[]` becomes empty. Each trigger's optional `condition` (JMESPath) is
   round-tripped (read and written back) but has **no editor UI**.
4. **Timeout** (`timeoutInMs`, optional integer). No client validation — server-enforced.

**Save** is disabled while submitting, when pristine, or without Manage. On create: build the
`ExtensionDraft`, call `CreateExtension`, show a created notification, navigate to the new
`/extensions/:id`. On edit save: send computed actions + current version via
`UpdateExtension`, show an updated notification, refetch. **Revert** resets the form to
loaded values. **Delete** calls `DeleteExtension` (no confirmation) and returns to the list.

## 5. Cross-cutting

- **Permissions** (../README.md §3): View renders the feature; without **Manage** the form is
  **read-only** and create / save / delete affordances are **disabled, not hidden**.
- **Notifications** (../README.md §7): success and error operations show an MC notification;
  GraphQL errors are converted to human-readable messages. List/detail show a loading
  indicator while fetching.

## Verification checklist

- [ ] List paginates and sorts (default `key asc`); row click opens edit; empty state shows.
- [ ] Create builds a nested `ExtensionDraft` and navigates to the new edit view on success.
- [ ] HTTP destination: URL required; auth select toggles the correct required secret field.
- [ ] AWS Lambda destination: ARN, access key, access secret all required.
- [ ] Destination type is read-only in edit; key is read-only in edit.
- [ ] Triggers matrix add/remove keeps `actions[]` correct and prunes empty trigger entries.
- [ ] Existing `condition` survives a load → save round-trip unchanged.
- [ ] Edit emits only changed-field actions; a pristine save makes no API call.
- [ ] Version mismatch on save/delete surfaces an error notification.
- [ ] Without Manage, the form is read-only and Save/Delete are disabled.

# Quickstart: Custom Objects

A step-by-step build guide for reimplementing the **Custom Objects** feature.
Read alongside the shared constitution in [../README.md](../README.md) — permissions,
optimistic concurrency, key validation, notifications, and list conventions are defined
there and are **not** repeated in full here. Behavior intent lives in
[spec.md](./spec.md); shapes and operations in [data-model.md](./data-model.md).

## Prerequisites

- A commercetools **Merchant Center custom-app** scaffold (MC application shell, routing,
  `dataLocale` / `projectLanguages`, MC notification system).
- The **Nimbus** design system for all UI (no legacy UIKit). UI specifics below are
  intentionally framework-neutral — pick the Nimbus equivalents.
- A commercetools **GraphQL client** wired through the MC app shell against the **`ctp`**
  target.
- A **JSON editor** component capable of both tree and raw-text editing, with validation,
  that round-trips a JSON string in and out unchanged.

## 1. Routes

Wire the three views from [spec.md §4](./spec.md):

| View   | Route                  | Presentation                          |
|--------|------------------------|---------------------------------------|
| List   | `/custom-objects`      | full page: data table + container filter |
| Create | `/custom-objects/new`  | modal form                            |
| Edit   | `/custom-objects/:id`  | modal form (Revert, Save, Delete)     |

Create and Edit render over the List route so the table stays mounted behind the modal.

## 2. Data layer

Wire [contracts/custom-objects.graphql](./contracts/custom-objects.graphql) (validated
against the official commercetools schema) into typed fetch/mutate hooks:

| Hook                              | Operation                       |
|-----------------------------------|---------------------------------|
| `useCustomObjectsFetcher`         | `CustomObjects` query           |
| `useCustomObjectFetcher`          | `CustomObject` query            |
| `useCustomObjectCreatorOrUpdater` | `CreateOrUpdateCustomObject`    |
| `useCustomObjectDeleter`          | `DeleteCustomObject`            |

Key points:

- **No update-action / diff model.** Create and edit BOTH call
  `createOrUpdateCustomObject`. There is no action computation between the loaded entity
  and the draft.
- **Optimistic concurrency on update only.** Build the `CustomObjectDraft` from the form
  (`container`, `key`, `value`); on **edit**, also pass the loaded `version`. On **create**,
  omit `version`. A version mismatch surfaces as an error notification (see §5).
- **Scalars.** Read `value` is the `Json` scalar; draft `value` is a serialized JSON
  **string** (`String!`). `version` is `Long`. Delete sends `id` + current `version`.

## 3. List view

- **Container filter is mandatory.** The `customObjects` query requires `container`
  (`String!`). Until the user supplies a container, run **no query** and show the empty
  state — the list is empty by design.
- **Debounce** the container input (~1000ms). Changing it **resets to page 1**. Provide a
  **reset control** that clears the filter (returning to the empty state). Matching is
  exact and case-sensitive at the query level.
- **Pagination** via `limit`/`offset`; surface `total` for the pager.
- **Sorting** via the `sort` variable (e.g. `["key asc"]`). Default sort: **key ascending**.
  Sortable columns: `key`, `createdAt`, `lastModifiedAt`. Value is not sortable.
- **Columns:** Container, Key, and a **"has value"** indicator. `id`, `version`,
  `createdAt`, `lastModifiedAt` are fetched but hidden. **Row click → edit** view
  (`/custom-objects/:id`).
- Loading indicator while fetching; "no items available" empty state.

## 4. Create / edit form

Form model: `{ container, key, value }` where `value` is a **serialized JSON string**.

- **Create:** Container (required, non-empty), Key (required — shared key rule, see
  [../README.md](../README.md) §6), Value (JSON editor, defaults to `"{}"`). On success:
  saved notification, refetch the list, navigate to the new object's edit view.
- **Edit:** Container and Key are **read-only / immutable** (renaming = delete + recreate).
  Only Value is editable. On success: updated notification, refetch list + object, reset
  the form to the saved state (Revert returns to last-saved).
- **JSON round-trip:** on load, stringify the stored `value` (`"{}"` if absent) into the
  form; the editor allows tree or text editing; on submit, serialize the edited JSON (or
  raw text) back to a string for the draft. Any valid JSON round-trips unchanged.
- **Delete (edit only):** call `deleteCustomObject` with `id` + current `version`, refetch
  the list, return to the list.
- **Manage gating:** without `PERMISSIONS.Manage`, render the form **read-only** and
  **disable** (never hide) create / Save / Delete. Save is enabled only when
  **dirty + valid + Manage**; Revert only when **dirty** (see [../README.md](../README.md) §3).

## 5. Cross-cutting

Per [../README.md](../README.md):

- **Permissions** (§3): View to render; Manage to mutate, else read-only + disabled controls.
- **Notifications & errors** (§7): success notifications on create/update/delete; GraphQL
  errors converted to human-readable error notifications. Optimistic-concurrency conflicts
  and external deletes (not-found) surface as errors — reload and retry.
- **Localization** (§4): externalize all user-facing strings. (Custom Objects have no
  commercetools localized-string fields — the JSON value is opaque.)

## Verification checklist

- [ ] All four operations wired from the validated contract; no diff/update-action code.
- [ ] Create and edit both call `createOrUpdateCustomObject`; edit passes `version`.
- [ ] List runs no query and shows empty state until a container is provided.
- [ ] Container filter debounced (~1000ms); changing it resets to page 1; reset clears it.
- [ ] Pagination, sorting (default key asc), and columns (Container, Key, has-value) work.
- [ ] Row click opens edit; create navigates to the new object's edit view.
- [ ] Container + Key immutable in edit; JSON value round-trips unchanged.
- [ ] Without Manage: form read-only, create/Save/Delete disabled (not hidden).
- [ ] Save enabled only when dirty + valid + Manage; Revert only when dirty.
- [ ] Success/error notifications fire; version conflicts surface as errors.

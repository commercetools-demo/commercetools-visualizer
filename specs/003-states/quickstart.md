# Quickstart: States

A practical build guide for (re)implementing the **States** feature on Nimbus.
Read alongside the shared conventions in [../README.md](../README.md) (the
"constitution"): permissions, localization, optimistic concurrency, key
validation, notifications, and list conventions are defined there and only
referenced — not repeated — here. Behavior is specified in
[spec.md](./spec.md); shapes and the update-action mapping in
[data-model.md](./data-model.md).

## Prerequisites

- A Merchant Center **custom application** scaffold (MC app shell, routing,
  `custom-application-config.mjs` with the State OAuth scopes).
- The **Nimbus** design system available for UI (no UIKit component names — see
  README §1).
- A commercetools GraphQL client wired through the MC app shell against the
  **`ctp`** target.
- Access to the project's `dataLocale` and `projectLanguages` (from the app
  context) for rendering and persisting localized strings.

## 1. Routes

Per [spec.md §4](./spec.md):

| View | Route | Presentation |
|------|-------|--------------|
| States list (by type) | `/states/:type?` | full page: tabs + transition graph |
| Create state | `/states/new` | modal form (Cancel, Save) |
| Edit state | `/states/:id` | modal form (Revert, Save, Delete) |

- With no `:type`, redirect to the first state type that has at least one state
  (FR-001).
- "Add New State" opens `/states/new` with the active tab's type pre-selected
  (FR-003).
- A node click in the graph navigates to `/states/:id` (FR-002).

## 2. Data layer

Implement against the validated documents in
[contracts/states.graphql](./contracts/states.graphql) (ctp target):

- **Fetch hooks:** `States` (list) and `State` (single). Build the list `where`
  from the active type, e.g. `type="OrderState"`; in edit mode, also exclude the
  current state so the transitions multi-select can't target itself:
  `type="OrderState" and id != "<current-id>"`. Pass `limit: 100, offset: 0`
  (no pagination — FR-001, edge cases).
- **Mutate hooks:** `CreateState`, `UpdateState`, `DeleteState`.
- **Optimistic concurrency** (README §5): send the loaded `version` on update and
  delete; surface a version-mismatch error as a notification and prompt reload.
- **Update actions = diff** of the loaded `State` vs the form draft
  (`calculateStateUpdateActions`); map per [data-model.md](./data-model.md):
  `changeInitial`, `setName`, `setDescription`, `setTransitions`. Only changed
  fields produce actions, and **if no actions result, do not call `UpdateState`**.
- **Draft assembly** for create: `type`, trimmed `key`, localized `name`/
  `description` with empty translations omitted, `transitions` as references
  `{ typeId: "state", id }`, `initial`. `roles` is not set by the form (FR-005).

## 3. States list

Full-page view for the active type:

- **Type tabs:** one tab per state type that has ≥1 state, each showing the
  count. The active tab drives the `where` filter and the pre-selected type for
  create. Redirect to the first available type when `:type` is absent.
- **Transition graph** (FR-002) — an interactive directed graph of the active
  type's states. This is an implementation detail (the original laid it out with
  a flow-graph + dagre auto-layout); describe the behavior, pick any library:
  - One **node per state**, labelled by the localized name with a fallback chain
    to `key`.
  - States with `initial = true` styled as **entry** nodes; states with no
    outgoing transitions styled as **terminal** nodes.
  - **Animated directed edges** from each state to each of its transition
    targets.
  - A **layout-direction toggle** (vertical ⇄ horizontal).
  - **Clicking a node** navigates to that state's edit view (`/states/:id`).
- Show a loading indicator while fetching and an error notification on failure
  (README §7).

## 4. Create / edit form

A single "General Information" panel (spec.md §4): Key + State type on one row,
Initial + Transitions, then full-width Name and Description.

Fields & validation (spec.md §4–5):

- **Key** — required; shared key rule (README §6: 2–256, `^[a-zA-Z0-9-_]+$`,
  trimmed). **Read-only in edit** (immutable after create).
- **State type** — required. **Read-only in edit** (immutable after create).
- **Initial** — boolean; defaults to `true` on create. Editable.
- **Transitions** — multi-select of **same-type** states. In edit, the option
  list excludes the current state. Editable.
- **Name / Description** — optional localized strings, one input per project
  language; **omit empty translations** on save (README §4).

Behavior:

- **Create:** defaults are `initial = true`, empty key, empty name/description,
  no transitions, `stateType` = active tab. On success: created notification,
  navigate to the new state's edit view (FR-004/005).
- **Edit:** Save computes update actions and calls `UpdateState` only when ≥1
  action results; on success: updated notification + refetch (FR-006).
- **Revert** resets the form to loaded values; disabled when pristine (FR-007).
- **Delete** removes the state with no confirmation dialog, returns to the list,
  and shows a deleted notification (FR-008).
- **No Manage permission:** all fields render **read-only** and Save / Delete are
  **disabled, never hidden** (README §3). Built-in (`builtIn`) states further
  constrain editability.

## 5. Cross-cutting

All per [../README.md](../README.md):

- **Permissions (§3):** View to render; Manage for create/edit/delete. Without
  Manage → read-only form, disabled affordances.
- **Notifications (§7):** success and error notifications via the MC side
  channel; convert GraphQL errors to human-readable messages.
- **Localization (§4):** externalize all UI strings; render localized State
  fields per project language and omit empty translations on persist.
- **Optimistic concurrency (§5):** see §2 above.

## Verification checklist

- [ ] `/states` redirects to the first type with states; tabs show per-type
      counts.
- [ ] Transition graph renders nodes (entry/terminal styling), animated edges,
      a vertical⇄horizontal toggle, and node-click → edit view.
- [ ] Create defaults: `initial = true`, type = active tab, empty fields.
- [ ] Key validation (2–256, pattern, trimmed) and required State type enforced.
- [ ] Edit: Key and State type read-only; transitions exclude the current state.
- [ ] Save issues only the changed update actions; no call when nothing changed.
- [ ] Empty localized translations are omitted on create and update.
- [ ] Version-mismatch on update/delete surfaces an error and prompts reload.
- [ ] Without Manage: form read-only, Save/Delete disabled (not hidden).
- [ ] Created / updated / deleted notifications fire; GraphQL errors are
      human-readable.
- [ ] GraphQL documents in `contracts/states.graphql` validate cleanly against
      the commercetools schema.

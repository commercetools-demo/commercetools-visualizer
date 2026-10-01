# Feature: States

**Status:** Extracted from existing implementation
**Domain:** commercetools `State` (finite state machines)
**Spec version:** 1.1 (2026-10-01) — fixes how transitions are sent (unset ≠ empty), adds
`RecurringOrderState` (9 state types), the roles field, and the built-in state restrictions; the
spec now matches the code for the create default and for which fields are editable. 1.0
(2026-06-25): initial extraction.

> Shared conventions are in [../README.md](../README.md).

## 1. Overview

States let merchants model finite state machines for commercetools resources (orders, line
items, products, payments, quotes, reviews). Merchants create states, mark a state as the
workflow's initial state, and define transitions between states of the same type. The
feature provides CRUD plus an interactive transition graph for each state type.

## 2. User scenarios

- As a merchant, I can view all states grouped by resource type via tabs, with a count per type.
- As a merchant, I can see the transitions of a state type as an interactive directed graph
  (laid out top-to-bottom).
- As a merchant, I can click a state node in the graph to open that state's detail view.
- As a merchant, I can create a state by choosing a state type, entering a unique key, and
  optionally setting a localized name and description.
- As a merchant, I can mark a state as the initial state of its workflow.
- As a merchant, I can configure a state's transitions by selecting target states of the same type.
- As a merchant, I can edit a state's name, description, initial flag, and transitions.
- As a merchant, I can revert unsaved changes and delete a state.

## 3. Functional requirements

### List & visualization

- **FR-001** Fetch states (limit 100, offset 0). Render a tab per state type that has at
  least one state, showing the count; if no `:type` is in the URL, redirect to the first
  available type.
- **FR-002** For the active type, render an interactive transition graph: one node per state
  labelled by localized name (fallback chain → key); states with `initial=true` styled as
  entry nodes; states with no outgoing transitions styled as terminal nodes; animated
  directed edges to each transition target. The layout is fixed top-to-bottom (there is no
  layout-direction toggle). Clicking a node navigates to that state's detail view.
- **FR-003** "Add New State" in the header is disabled without Manage; it opens the create
  view with the state type pre-selected from the active tab.

### Create

- **FR-004** Create a state with defaults: `initial = false`, empty key, empty localized
  name/description, transitions **not restricted** (see FR-004a), no roles, and `stateType` =
  the active type. Fields: **Key** (required, shared key rule); **State type** (required, one
  of the 9 `StateTypeEnum` values); **Initial** (boolean); **Transitions** (FR-004a);
  **Roles** (FR-004b); **Name** and **Description** (localized, optional).
- **FR-004a — Transitions have three states.** The API distinguishes *unset* (validation off:
  the state may move to any state of its type), an *empty list* (a final state: no transition
  allowed) and a *list*. A checkbox **"Only allow transitions to the selected states"** (off by
  default) chooses between "unset" and "list"; the multi-select of same-type states is enabled
  only when it is on, and with it on and nothing selected the state is final. Turning it off on
  a state that had transitions sends `setTransitions` without `transitions`. A state whose
  transitions are unset must **never** be sent `transitions: []` just because something else
  changed (that used to make it a dead end).
- **FR-004b — Roles.** A state can have roles: `Return` (only `LineItemState`, used by orders'
  line-item transitions) and `ReviewIncludedInStatistics` (only `ReviewState`). The form lists
  only the roles that apply to the selected type, and drops a role when the type is changed to
  one it doesn't apply to. Saved with `addRoles` / `removeRoles` (create sends `roles`).
- **FR-005** On save, build a State draft (type, trimmed key, localized name/description with
  empty translations omitted, transitions as references `{ typeId: stateType, id }` only when
  restricted, roles when any, initial). On success show a created notification and navigate
  to the new state's edit view.

### Edit & delete

- **FR-006** In edit, a state that is **not built in** can change everything: Key and State type
  (saved with `changeKey` / `changeType`), Initial, Transitions, Roles, Name and Description.
  A **built-in** state (`builtIn`, e.g. the Line Item states every project has) has a read-only
  Key and State type — the select is really disabled — and shows a note saying it can't be
  deleted. The transitions multi-select lists other states of the same type
  (excludes the current state). Save computes update actions and calls update only if at
  least one action results; on success show an updated notification and refetch.
- **FR-007** Revert resets the form to loaded values (disabled when pristine).
- **FR-008** Delete removes the state (no confirmation dialog) and returns to the list; show
  a deleted notification. The button is **disabled for built-in states**, which the API does not
  allow to be deleted.

## 4. Views & navigation

| View | Route | Presentation |
|------|-------|--------------|
| States list (by type) | `/states/:type?` | full page: tabs + transition graph |
| Create state | `/states/new` | modal form (Cancel, Save) |
| Edit state | `/states/:id` | modal form (Revert, Save, Delete) |

Form layout: a single "General Information" panel with Key + State type, Initial + Transitions,
and full-width Name and Description.

## 5. Validation rules

- Key: shared key rule (required, 2–256, `^[a-zA-Z0-9-_]+$`, trimmed).
- State type: required.
- Name / Description: optional localized; empty translations omitted on save.
- Save disabled when submitting, pristine, or without Manage. Form fields read-only without Manage.

## 6. Edge cases & known limitations

- **No transition-graph validation** — self-transitions, multiple initial states, cycles,
  unreachable states, and deadlocks are not prevented by the UI (the API may reject some).
- Key and State type are editable for states that are not built in (the API has `changeKey` and
  `changeType`); built-in states keep them read-only.
- Whether the API returns `null` or `[]` for unset transitions is assumed to be `null`; if it
  returned `[]` such a state would show as "restricted to none" (but a save would still not
  change it).
- Built-in (system) states are visible; they can't be deleted and keep key and type.
- No pagination (capped at 100 per type), no search; filtering is only by the type tabs.
- The transition graph has a fixed height; very large state machines are hard to read.

## 7. Out of scope / non-goals

- Bulk operations.

## Review checklist

- [ ] All 9 state types covered (see data-model)
- [ ] Initial flag and transitions semantics captured
- [ ] Graph interaction (node click; fixed top-to-bottom layout) captured
- [ ] Built-in restrictions (key, type, delete) and role rules per type stated
- [ ] Update-action mapping present in `data-model.md`

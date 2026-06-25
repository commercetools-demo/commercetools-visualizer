# Feature: Custom Objects

**Status:** Extracted from existing implementation
**Domain:** commercetools `CustomObject` (arbitrary JSON keyed by container + key)
**Spec version:** 1.0 (2026-06-25)

> Shared conventions are in [../README.md](../README.md).

## 1. Overview

Custom Objects store arbitrary JSON keyed by a **container** (namespace) and a **key**
(unique within the container). The feature provides CRUD with a list filtered by container,
a create form with a full JSON editor, and an edit form for the JSON value.

## 2. User scenarios

- As a merchant, I can browse a paginated, sortable list of custom objects and filter it by container.
- As a merchant, I can create a custom object with a container, a key, and a JSON value.
- As a merchant, I can edit a custom object's JSON value (container and key are immutable).
- As a merchant, I can delete a custom object.

## 3. Functional requirements

### List

- **FR-001** List custom objects paginated, default sort by key ascending; sortable by key,
  createdAt, lastModifiedAt. Visible columns: Container, Key, and a "has value" indicator
  (id, version, created/modified available but hidden). Row click opens edit.
- **FR-002** A **container filter** (debounced ~1000ms) scopes the list; the underlying query
  **requires** a container, so the list is empty until a container is provided. Changing the
  filter resets to page 1; a reset control clears it.

### Create

- **FR-003** Fields: **Container** (required, non-empty), **Key** (required, shared key rule),
  **Value** (JSON editor, defaults to `{}`). On success show a saved notification, refetch the
  list, and navigate to the new object's edit view.

### Edit & delete

- **FR-004** Container and Key are read-only; the JSON **Value** is editable. Save persists
  via the create-or-update operation with the current version; on success show an updated
  notification, refetch list and object, and reset the form to the saved state.
- **FR-005** Delete removes the object (with version), refetches the list, and returns to the list.

### JSON value handling

- **FR-006** The form holds the value as a JSON string. Loading stringifies the stored value
  (`{}` if absent); the editor accepts both tree and text editing; on submit the edited JSON
  (or raw text) is serialized back to a string. Any valid JSON round-trips unchanged.

## 4. Views & navigation

| View | Route | Presentation |
|------|-------|--------------|
| List | `/custom-objects` | full page, data table + container filter |
| Create | `/custom-objects/new` | modal form |
| Edit | `/custom-objects/:id` | modal form (Revert, Save, Delete) |

## 5. Validation rules

- Container: required, non-empty (case-sensitive).
- Key: shared key rule.
- Value: optional; must be valid JSON (enforced by the editor). Defaults to `{}`.
- Save enabled only when dirty + valid + Manage; Revert enabled only when dirty.

## 6. Edge cases & known limitations

- Empty container filter ⇒ empty list (container is a required query parameter).
- Container matching is case-sensitive and exact at the query level.
- Container and Key are immutable after creation — "renaming" requires delete + recreate.
- Optimistic-concurrency conflicts and external deletes surface as errors / not-found.
- No filtering by key or value, no bulk operations, no import/export, no version history,
  no sorting by value. The debounced filter intentionally lags rapid typing.

## 7. Out of scope / non-goals

- Editing container/key after creation; schema validation of the JSON value; bulk operations.

## Review checklist

- [ ] Container filtering (debounce, required-container) captured
- [ ] JSON value round-trip behavior captured
- [ ] Container/key immutability stated
- [ ] Create-or-update single-mutation behavior captured in `data-model.md`

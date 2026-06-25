# Feature: Types

**Status:** Extracted from existing implementation
**Domain:** commercetools `Type` (custom field definitions)
**Spec version:** 1.0 (2026-06-25)

> Shared conventions (permissions, localization, optimistic concurrency, key validation,
> notifications, list conventions) are defined in [../README.md](../README.md) and are not
> repeated here.

## 1. Overview

Types let merchants define reusable sets of **custom field definitions** that apply to
commercetools resources (products, customers, orders, …). This feature provides full CRUD
for Type resources and complete management of their field definitions, including primitive
types, date/time variants, enums (plain and localized), references, and `Set` collections.

## 2. User scenarios

- As a merchant, I can browse a paginated, sortable list of all Types.
- As a merchant, I can create a Type by giving it a unique key, a localized name, an
  optional localized description, and selecting which resource types it applies to.
- As a merchant, I can open a Type to edit its name and description (key and resource types
  are immutable) and to manage its field definitions.
- As a merchant, I can delete a Type and all its field definitions.
- As a merchant, I can add, edit, and delete field definitions on an existing Type.
- As a merchant, I can define a field as String (plain or localized, single- or multi-line),
  Number, Boolean, Money, Date/Time/DateTime, Enum, LocalizedEnum, or Reference.
- As a merchant, I can wrap any field type in a `Set` (collection).
- As a merchant, I can mark a field required (mutually exclusive with `Set`).
- As a merchant, I can add and edit enum values (key + label, localized for LocalizedEnum).

## 3. Functional requirements

### Type list

- **FR-001** List all Types, paginated, default sort by key ascending; support sorting by
  key, name, description, createdAt, lastModifiedAt. Columns: Name (localized), Description
  (localized), Key, Resource Types, field-definition count, Created At, Last Modified At.
  Row click opens the Type edit view. "Add New Type" is disabled without Manage.

### Type create

- **FR-002** Create a Type with: **Key** (required, shared key rule); **Name** (localized,
  required — at least one language); **Description** (localized, optional); **Resource type
  IDs** (multi-select, required — at least one). On success, navigate to the new Type's edit
  view. Field definitions are **not** editable during create (added afterward).
- **FR-003** Resource type IDs are chosen from a predefined list (see data-model). The
  selection is immutable after creation.

### Type edit & delete

- **FR-004** In edit, Name and Description are editable; Key and Resource type IDs are
  read-only. Save persists only changed name/description via update actions.
- **FR-005** Delete removes the entire Type. Show a success notification; return to the list.

### Field definitions

- **FR-006** Within a Type's edit view, show the field definitions as a sortable table with
  columns Name, Label (localized), Required, Type (with a `Set` indicator), and a delete
  action. Row click opens the field-definition edit view. "Add Field Definition" is disabled
  without Manage.
- **FR-007** Add a field definition with: **Name** (required, shared key rule, unique within
  the Type); **Label** (localized, required); **Type** (required). On success the field is
  added to the Type (single update action) and a success notification is shown.
- **FR-008** Edit a field definition: **Name** and **Type** are immutable (read-only). Label,
  input hint, and enum values (add only) are editable and persist via field-specific update
  actions. **Required** is shown but **cannot be persisted on an existing field** — see §6.
  `Set` and reference type are fixed once the field exists.
- **FR-009** Delete a field definition removes it from the Type; refetch the Type afterward.

### Field types and their configuration

- **FR-010** **String** — optional "Localized" toggle (becomes LocalizedString) and optional
  "multi-line" toggle (input hint `SingleLine` default / `MultiLine`). Input hint applies
  only to String/LocalizedString.
- **FR-011** **Number**, **Boolean**, **Money** — no additional configuration.
- **FR-012** **Date** type selector offers a format choice: **Date**, **Time**, or
  **DateTime** (maps to the three commercetools field types).
- **FR-013** **Enum** / **LocalizedEnum** — managed via an inline value editor: rows of
  **Key** + **Label** (one label per project language for LocalizedEnum). Add a row via an
  add control; remove a row (disabled when only one row remains). Empty-key rows are filtered
  out on persist. For LocalizedEnum, languages shown = project languages first, then any
  additional languages already present in existing values.
- **FR-014** **Reference** — requires a **Reference type ID** chosen from a predefined list;
  immutable after creation.
- **FR-015** **Set** — a checkbox that wraps the selected element type in a `Set`. Immutable
  after creation. `Set` and **Required** are mutually exclusive: when Required is checked,
  `Set` is disabled with an explanatory tooltip, and vice versa.

## 4. Views & navigation

| View | Route | Presentation |
|------|-------|--------------|
| Types list | `/types` | full page, data table |
| Type create | `/types/new` | modal form |
| Type edit / detail | `/types/:id` | modal form with General Information + Field Definitions panels |
| Field definition create | `/types/:id/:version/new` | modal form |
| Field definition edit | `/types/:id/:fieldDefinitionName` | modal form |

The field-definition list and enum value editor render inline within the Type edit view.

## 5. Validation rules

- Type key, field name: shared key rule (2–256, `^[a-zA-Z0-9-_]+$`, trimmed).
- Type name, field label: at least one non-empty localized value required.
- Resource type IDs: at least one selected.
- Reference type ID: required when field type is Reference.
- Enum: at least one value with a non-empty key (empty-key rows dropped on save).
- Required + Set: mutually exclusive.
- Save/Revert enabled only when the form is dirty (and Manage held); disabled while submitting.

## 6. Edge cases & known limitations

- **Deleting an enum value from an already-persisted enum is not supported** — only unsaved
  (not-yet-persisted) enum rows can be removed. (Documented limitation.)
- **Reordering enum values is not supported** — no reorder action exists. (Documented limitation.)
- **A field definition's `required` flag cannot be changed after creation** — the commercetools
  API exposes no such update action (confirmed against the schema). It is only settable at field
  creation via `FieldDefinitionInput.required`. The edit form may surface the toggle, but a
  change to it will not persist; treat `required` as immutable post-creation.
- Key, Type (of a field), Reference type, and Set/element type are immutable after creation.
- Empty localized translations are omitted on persist.
- Localized display falls back from `dataLocale` to other project languages, then to key/id.
- Empty states: "no types available" on the list; an empty field-definition table with the
  add control still available; an enum field with no values shows one empty row.

## 7. Out of scope / non-goals

- Editing a Type's key or resource type IDs after creation.
- Bulk operations; import/export; version history.

## Review checklist

- [ ] All field-definition types and their config covered
- [ ] Enum/localized-enum add semantics and limitations captured
- [ ] Immutability rules (key, name, type, reference, set) stated
- [ ] Required vs Set mutual exclusion stated
- [ ] Data model and update-action mapping present in `data-model.md`

# Quickstart: Types

A practical build guide for reimplementing the **Types** feature (commercetools
`TypeDefinition` / custom field definitions) on Nimbus. Read alongside the shared
[constitution](../README.md) — permissions, localization, optimistic concurrency,
key validation, notifications, and list conventions live there and are not repeated.

Source artifacts: [spec.md](./spec.md) (behavior), [data-model.md](./data-model.md)
(shapes/enumerations), [contracts/types.graphql](./contracts/types.graphql) (API).

## Prerequisites

- MC custom-app scaffold (application shell, routing, `custom-application-config.mjs`
  with the Type OAuth scopes for View/Manage).
- Nimbus design system available for all UI.
- A commercetools GraphQL client wired through the MC application shell — use
  `useMcQuery` / `useMcMutation` (from `@commercetools-frontend/application-shell`)
  against the `GRAPHQL` / `ctp` target.
- Project context: `dataLocale` and `projectLanguages` (via
  `useApplicationContext`) for localized inputs and display.
- The `Manage` permission flag (per ../README.md §3) for gating writes.

## 1. Routes

Wire these (spec.md §4). List is a full page; the rest are modal forms layered
over the list/edit page.

| View | Route | Presentation |
|------|-------|--------------|
| Types list | `/types` | full page, data table |
| Type create | `/types/new` | modal form |
| Type edit / detail | `/types/:id` | modal: General Information + Field Definitions panels |
| Field definition create | `/types/:id/:version/new` | modal form |
| Field definition edit | `/types/:id/:fieldDefinitionName` | modal form |

The field-definition list and enum value editor render **inline** inside the Type
edit view; their create/edit modals stack on top.

## 2. Data layer

Wire the documents in [contracts/types.graphql](./contracts/types.graphql) and
expose thin hooks:

- **Fetch list** — `TypeDefinitions` via `useMcQuery`; pass `limit`/`offset` from
  the table pagination and `sort` from the active column (commercetools sort
  syntax, e.g. `["key asc"]`, `["name.<dataLocale> desc"]`).
- **Fetch one** — `TypeDefinitionById` for the edit view; `TypeDefinitionFieldDefinition`
  (with `includeNames`) when opening a single field-definition edit form.
- **Mutations** — `useMcMutation` for `CreateTypeDefinition`,
  `UpdateTypeDefinition`, `DeleteTypeDefinition`.

**Optimistic concurrency (../README.md §5):** every mutation sends the loaded
`version`; on a version-mismatch error, surface an error notification and prompt
reload. Refetch the Type after field-definition add/remove.

**Building `updateTypeDefinition` actions** — compute a minimal `actions` array as
a **diff between the loaded Type and the form draft**. If the array is empty, skip
the call. Map (see the contract header for exact payloads):

- Name changed → `changeName`
- Description changed → `setDescription` (omit/empty array clears it)
- Field-definition **label** changed → `changeLabel { fieldName, label }`
- Field-definition **inputHint** changed → `changeInputHint { fieldName, inputHint }`
- Enum value added → `addEnumValue` / `addLocalizedEnumValue`
- Enum value label changed → `changeEnumValueLabel` / `changeLocalizedEnumValueLabel`

**Field-definition edits are single update actions** — adding a field is one
`addFieldDefinition`; removing is one `removeFieldDefinition`; each enum/label/hint
edit is its own action, all batched into the one `UpdateTypeDefinition` call.

> **API limitation:** the public schema has **no `changeFieldDefinitionRequired`**
> action (data-model.md says "or equivalent" — there is none). `required` is only
> set at field-definition creation via `FieldDefinitionInput.required`. Treat
> `required` as effectively immutable on a persisted field definition unless the
> field is removed and re-added.

## 3. Types list view

- Full-page data table fed by `TypeDefinitions`. Columns: Name (localized),
  Description (localized), Key, Resource Types, field-definition **count**
  (`fieldDefinitions.length`), Created At, Last Modified At.
- Default sort `key asc`; sortable on key, name, description, createdAt,
  lastModifiedAt (../README.md §8 list conventions).
- Row click → `/types/:id`. "Add New Type" → `/types/new`, **disabled** (not
  hidden) without Manage.
- Localized cells: render `dataLocale`, falling back to other project languages,
  then key/id (spec.md §6).
- Empty state: "no types available".

## 4. Type create / edit forms

Form values per data-model.md `TFormValues`. Localized name/description render one
input per project language and **omit empty translations** on persist (../README.md §4).

**Create (`/types/new`)** — fields: **Key** (required, shared key rule per
../README.md §6), **Name** (localized, ≥1 language), **Description** (localized,
optional), **Resource type IDs** (multi-select from the predefined list in
data-model.md, ≥1 required). Field definitions are **not** editable during create.
Submit `CreateTypeDefinition`; on success navigate to `/types/:id` (the new Type's
edit view) and notify success.

**Edit (`/types/:id`)** — two panels: *General Information* and *Field Definitions*.

- General Information: **Name** and **Description** editable; **Key** and **Resource
  type IDs** read-only. Save persists only changed name/description (diffed actions,
  step 2).
- **Delete** the whole Type (`DeleteTypeDefinition` with current version) → notify,
  return to `/types`.

**Read-only / Manage:** without Manage, render all inputs read-only and disable
save/revert/delete/add affordances (never hide). Save/Revert enabled only when the
form is dirty, Manage held, and not submitting (spec.md §5).

## 5. Field definitions

Rendered inline in the Type edit view (spec.md §6, FR-006–FR-015).

**List** — sortable table: Name, Label (localized), Required, Type (with a `Set`
indicator), delete action. Row click → `/types/:id/:fieldDefinitionName`. "Add Field
Definition" → `/types/:id/:version/new`, disabled without Manage. Empty table still
shows the add control.

**Create sub-form** — `TFieldDefinitionFormValues` (data-model.md):

- **Name** (required, shared key rule, unique within the Type), **Label**
  (localized, required), **Type** (required) → build a `FieldDefinitionInput` and
  send one `addFieldDefinition` action. Notify; refetch.

**Edit sub-form** — **Name** and **Type** are **immutable** (read-only). Editable:
Label, `Set` (display only — immutable, see below), input hint, enum values (add
only), reference type (display only — immutable). Submit → diffed actions.

**Field-type variants** (FR-010–FR-015), driven by `typeName` + toggles, mapping to
`FieldTypeInput` (data-model.md union):

- **String** — `isLocalized` toggle → `String` vs `LocalizedString`; `isMultiLine`
  toggle → `inputHint` `SingleLine` (default) / `MultiLine`. Input hint applies
  **only** to String/LocalizedString.
- **Number**, **Boolean**, **Money** — no extra config.
- **Date** — `format` selector → maps to `Date` / `Time` / `DateTime`.
- **Enum** / **LocalizedEnum** (`isLocalized` on an Enum) — see enum editor below.
- **Reference** — **Reference type ID** required, from the predefined list
  (data-model.md); immutable after creation.
- **Set** — checkbox wrapping the chosen element type in `Set`; immutable after
  creation.

**Required vs Set mutual exclusion** (FR-015): when Required is checked, disable
`Set` (with an explanatory tooltip), and vice versa.

**Immutability:** Name, Type, Reference type, and Set/element type are read-only in
edit (spec.md §6).

**Enum value editor** (FR-013) — inline rows of **Key** + **Label** (one Label per
project language for LocalizedEnum). Add a row via an add control; remove a row
(disabled when only one row remains). Empty-key rows are filtered out on persist. An
enum field with no values shows one empty row. For LocalizedEnum, show project
languages first, then any extra languages already present in existing values.

> **Documented limitations (spec.md §6):** you **cannot delete a persisted enum
> value** (no remove action) — only unsaved rows can be removed in the UI. You
> **cannot reorder** enum values (no reorder action used). Persist therefore only
> emits `add*EnumValue` (new keys) and `change*EnumValueLabel` (edited labels).

## 6. Cross-cutting

All per [../README.md](../README.md):

- **Permissions (§3):** View to render; Manage to write. Without Manage, forms are
  read-only and write affordances disabled, never hidden.
- **Notifications (§7):** success/error notifications via the MC side channel;
  convert GraphQL errors to human-readable messages; loading indicators on
  list/detail fetch.
- **Localization (§4):** externalize all UI strings; localized commercetools fields
  render one input per project language and **omit empty translations** on persist.
- **Optimistic concurrency (§5):** send `version`; surface version-mismatch errors.

## Verification checklist

- [ ] List paginates and sorts on all specified columns; shows field-def count and
      "no types available" empty state; "Add New Type" disabled without Manage.
- [ ] Create requires Key (shared rule), ≥1 Name language, ≥1 resource type;
      navigates to the new Type's edit view on success.
- [ ] Edit: Key and Resource type IDs read-only; only changed name/description
      persisted (no actions ⇒ no call).
- [ ] Delete removes the Type, notifies, returns to the list.
- [ ] Field definitions: add/edit/delete work; Name and Type read-only in edit;
      add = single `addFieldDefinition`, remove = single `removeFieldDefinition`.
- [ ] All field-type variants build correctly (String ±localized ±multiline;
      Number/Boolean/Money; Date/Time/DateTime; Enum/LocalizedEnum; Reference with
      required referenceTypeId; Set wrapping any element type).
- [ ] Required and Set are mutually exclusive (with tooltip).
- [ ] Enum editor: add/edit values, empty-key rows dropped, one-row floor; cannot
      delete or reorder persisted values.
- [ ] Without Manage everything is read-only/disabled, not hidden.
- [ ] Localized inputs per language; empty translations omitted; version conflicts
      surface an error and prompt reload.
- [ ] All GraphQL matches contracts/types.graphql (validated against the ct schema).

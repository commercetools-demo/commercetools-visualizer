# Feature: API Extensions

**Status:** Extracted from existing implementation
**Domain:** commercetools `Extension` (API webhooks)
**Spec version:** 1.0 (2026-06-25)

> Shared conventions are in [../README.md](../README.md).

## 1. Overview

API Extensions let merchants run custom logic during commercetools API requests. An
extension points at a **destination** (an HTTP endpoint, optionally authenticated, or an AWS
Lambda) and declares **triggers** — combinations of resource type and action (Create /
Update) that invoke it, with an optional condition. The feature provides CRUD with create
and edit in modals over a paginated list.

## 2. User scenarios

- As a merchant, I can browse a paginated, sortable list of extensions.
- As a merchant, I can create an extension with a unique key, a destination, triggers, and an
  optional timeout.
- As a merchant, I can configure an HTTP destination with a URL and optional authentication
  (Authorization header or Azure Functions key).
- As a merchant, I can configure an AWS Lambda destination with ARN, access key, and access secret.
- As a merchant, I can choose triggers as resource-type × action (Create / Update) combinations.
- As a merchant, I can edit an extension (destination type is locked) and revert unsaved changes.
- As a merchant, I can delete an extension.

## 3. Functional requirements

### List

- **FR-001** List extensions, paginated, sortable by key (default ascending) and by
  destination, triggers, timeout, createdAt, lastModifiedAt. Row click opens edit. "Add New
  Extension" opens create.

### Create & edit (shared form)

- **FR-002** The form has three sections: **General Information** (Key), **Destination**
  (type + type-specific fields), **Triggers**. In create, all sections start expanded; in
  edit, only General Information is expanded.
- **FR-003 — Key** (required, shared key rule).
- **FR-004 — Destination type** (`HTTP` | `AWSLambda`, default HTTP). **Immutable in edit**
  (read-only after creation). (A GoogleCloudFunction type exists in the schema but is not
  offered.)
- **FR-005 — HTTP destination**: **URL** (required). **Authentication** (optional select):
  None, `AuthorizationHeader` (→ header value field), or `AzureFunctions` (→ key field). The
  conditional auth field is required when its method is selected.
- **FR-006 — AWS Lambda destination**: **ARN**, **Access key**, **Access secret** (all required).
- **FR-007 — Triggers**: a matrix of resource type × action. Checking a box adds the action
  to that resource's `actions[]` (creating the trigger entry if absent); unchecking removes
  the action, and removes the trigger entry when its `actions[]` becomes empty. An optional
  per-trigger `condition` (JMESPath) is stored and round-tripped but **not editable in the UI**.
- **FR-008 — Timeout** (`timeoutInMs`, optional integer; server enforces limits).
- **FR-009** On create, build an `ExtensionDraft` (rebuilding the nested destination from the
  flat form fields), call create, show a created notification, and navigate to the new
  extension's edit view.
- **FR-010** On edit save, compute update actions (setKey, changeDestination, changeTriggers,
  setTimeoutInMs) and update with the current version; on success show an updated
  notification and refetch. Revert resets to loaded values. Delete removes the extension (no
  confirmation) and returns to the list.

## 4. Views & navigation

| View | Route | Presentation |
|------|-------|--------------|
| List | `/extensions` | full page, data table |
| Create | `/extensions/new` | modal form |
| Edit | `/extensions/:id` | modal form (Revert, Save, Delete) |

## 5. Validation rules

- Key: shared key rule.
- HTTP: URL required; selected auth method's secret field required.
- AWS Lambda: ARN, access key, access secret all required.
- Timeout: no client validation (server-enforced).
- Save disabled while submitting, when pristine, or without Manage.

## 6. Edge cases & known limitations

- Destination type is immutable after creation; switching type in create mode does not clear
  the other type's fields (the draft conversion ignores irrelevant fields).
- HTTP authentication is optional (None is valid).
- The trigger `condition` (JMESPath) is read/written but has no editor UI.
- `GoogleCloudFunction` destination is in the schema but not offered in the UI.
- An extension may be saved with zero triggers (server behavior unspecified).
- No destination reachability test, no bulk operations, no secrets vault — credentials are
  entered as plain text. Key uniqueness and timeout limits are enforced server-side only.

## 7. Out of scope / non-goals

- GoogleCloudFunction destinations; a condition builder UI; bulk operations.

## Review checklist

- [ ] Both destination types and their fields/auth covered
- [ ] Trigger add/remove semantics and condition round-trip captured
- [ ] Destination-type immutability stated
- [ ] Update-action mapping present in `data-model.md`

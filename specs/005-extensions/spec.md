# Feature: API Extensions

**Status:** Extracted from existing implementation
**Domain:** commercetools `Extension` (API webhooks)
**Spec version:** 1.2 (2026-10-01) — adds the trigger **condition** editor, **expansion paths**,
**dependencies** (Extension Chaining) and the **include previous resource state** option, all
validated against the documented restrictions; trigger rows whose resource type has several
triggers are protected from being merged. 1.1 (2026-10-01): offers all three documented destination types (adds
GoogleCloudFunction), all 12 `ExtensionResourceTypeId`s as trigger resources, and a working
**Timeout** field (earlier versions described one but the form had none); fixes AWS Lambda and
timeout edits being silently dropped. 1.0 (2026-06-25): initial extraction.

> Shared conventions are in [../README.md](../README.md).

## 1. Overview

API Extensions let merchants run custom logic during commercetools API requests. An
extension points at a **destination** (an HTTP endpoint, optionally authenticated, or an AWS
Lambda) and declares **triggers** — combinations of resource type and action (Create /
Update) that invoke it, with an optional condition. The feature provides CRUD: create and
edit are their own full pages with collapsible sections, alongside a paginated list.

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

- **FR-002** The form shows **Key** and **Timeout** fields at the top, followed by two
  collapsible sections: **Destination** (type + type-specific fields), **Triggers**, **Expansion
  paths** and **Dependencies**. Between the timeout and the sections sits the **Include the
  previous resource state** checkbox. In create, Destination and Triggers start expanded; in
  edit, all sections start collapsed.
- **FR-003 — Key** (required, shared key rule).
- **FR-004 — Destination type** (`HTTP` | `AWSLambda` | `GoogleCloudFunction`, default HTTP).
  **Immutable in edit**: the select is disabled after creation (and without Manage).
- **FR-005 — HTTP destination**: **URL** (required). **Authentication** (optional select):
  None, `AuthorizationHeader` (→ header value field), or `AzureFunctions` (→ key field). The
  conditional auth field is required when its method is selected.
- **FR-006 — AWS Lambda destination**: **ARN**, **Access key**, **Access secret** (all required).
- **FR-006a — Google Cloud Function destination**: **URL** (required). The API recommends this
  over HTTP for Google Cloud, since invocations can be authorized through GCP IAM.
- **FR-007 — Triggers**: a matrix of the 12 resource types × action (`Create` / `Update`).
  Checking a box adds the action to that resource's `actions[]` (creating the trigger entry,
  at the end, if absent); unchecking removes the action, and removes the trigger entry when
  its `actions[]` becomes empty. Toggling edits the trigger **in place**, keeping its position
  and its optional `condition`, so toggling an action never drops a condition or reorders
  `triggers`.
- **FR-007a — Trigger condition.** Each row has an optional **Condition** (the commercetools
  predicate syntax, e.g. `customerId is defined`; sent as `condition`, omitted when blank). It
  is enabled only once the row has an action selected (a trigger exists only with actions).
  Hint shown: use `is defined` for optional fields — a condition that cannot be evaluated makes
  the whole API call fail.
- **FR-007b — Several triggers for one resource type.** The API allows them (each with its own
  condition); the matrix has one row per resource type. Such a row is shown read-only (checkboxes
  and condition disabled) with a note, and is **kept exactly as it is** when saving — it is never
  merged into one trigger or dropped.
- **FR-008 — Timeout** (`timeoutInMs`, optional). A text field holding a positive whole number
  of milliseconds; empty means "use the default" (the API's limit is 10000 ms unless raised
  for the project). Saved as a number; clearing it on an existing extension sends
  `setTimeoutInMs` without a value.
- **FR-008a — Include previous resource state** (`additionalContext.includeOldResource`): a
  checkbox, off by default and then not sent. When on, Update calls get `oldResource` in the
  payload (not Create). Saved with `setAdditionalContext`; switching it off sends
  `includeOldResource: false`.
- **FR-008b — Expansion paths** (`expansionPaths`): up to **3** (documented limit) free-text
  paths, e.g. `lineItems[*].variant`, in add/remove rows; blank rows are dropped on save;
  duplicates are rejected. Saved with `setExpansionPaths` (the full list; empty list when all
  were removed). Adding is disabled at 3.
- **FR-008c — Dependencies** (`dependencies`, Extension Chaining): pick other extensions that
  must complete first, from the project's other extensions (shown by key, else id). Restrictions
  (documented): at most **5** direct dependencies; no circular dependencies; chain depth at most
  3 layers; each dependency must be triggered for **every** resource type and action of this
  extension. Client-side: the extension itself is never offered; candidates that would close a
  cycle, don't cover all triggers/actions, or would exceed 5 are disabled with the reason shown;
  a *selected* dependency that has become invalid (e.g. after changing triggers, or deleted
  elsewhere) is flagged on load and blocks saving until removed. Chain depth is left to the
  platform (`ExtensionChainTooDeep`, shown as an error notification). Saved with
  `setDependencies` (the full list); sent on create as `{ typeId: 'extension', id }`.
- **FR-009** On create, build an `ExtensionDraft` (rebuilding the nested destination from the
  flat form fields), call create, show a created notification, and navigate back to the list
  (refetched).
- **FR-010** On edit save, compute update actions (setKey, changeDestination, changeTriggers,
  setTimeoutInMs, setAdditionalContext, setExpansionPaths, setDependencies) for **all three
  destination types** and update with the current version; on success show an updated
  notification and refetch. Revert resets to loaded values. Delete removes the extension (no
  confirmation) and returns to the list.

## 4. Views & navigation

| View | Route | Presentation |
|------|-------|--------------|
| List | `/extensions` | full page, data table |
| Create | `/extensions/new` | full page with collapsible sections |
| Edit | `/extensions/:id` | full page with collapsible sections (Revert, Save, Delete) |

## 5. Validation rules

- Key: shared key rule.
- HTTP: URL required; selected auth method's secret field required.
- AWS Lambda: ARN, access key, access secret all required.
- Google Cloud Function: URL required.
- Expansion paths: at most 3 (blank rows ignored), no duplicates.
- Dependencies: at most 5; none may be the extension itself, circular, missing, or fail to cover
  every trigger resource type and action.
- Timeout: empty, or a positive whole number (`/^[1-9]\d*$/`); the maximum is
  server-enforced.
- Save disabled while submitting, when pristine, or without Manage.

## 6. Edge cases & known limitations

- Destination type is immutable after creation; switching type in create mode does not clear
  the other type's fields (the draft conversion ignores irrelevant fields).
- HTTP authentication is optional (None is valid).
- **Secrets are partially hidden on retrieval** (Lambda access key/secret, HTTP authorization
  header, Azure Functions key). The form shows the masked value; saving a change to *another*
  destination field sends the destination with those masked values, so credentials must be
  re-entered when the destination is edited. (Known API/UX limitation.)
- `@commercetools/sync-actions` has no support for dependencies, expansion paths or additional
  context, so `calculateExtensionsUpdateActions` diffs them itself (order-insensitive; missing =
  empty/false).
- Dependency candidates are loaded with one extra query (`FetchExtensionDependencyCandidates`,
  up to 100 extensions; a project has at most 25). If it fails, a message is shown and only
  the count (max 5) is validated.
- Applicability is judged on the extensions' current triggers; the platform ignores
  non-applicable dependencies at request time but rejects them on save
  (`ReferencedResourceNotFound`).
- An extension may be saved with zero triggers (server behavior unspecified).
- No destination reachability test, no bulk operations, no secrets vault — credentials are
  entered as plain text. Key uniqueness and timeout limits are enforced server-side only.

## 7. Out of scope / non-goals

- A condition builder UI; bulk operations.

## Review checklist

- [ ] Both destination types and their fields/auth covered
- [ ] Trigger add/remove semantics and condition round-trip captured
- [ ] Destination-type immutability stated
- [ ] Update-action mapping present in `data-model.md`

# Feature: Subscriptions

**Status:** Extracted from existing implementation
**Domain:** commercetools `Subscription` (event messaging)
**Spec version:** 1.1 (2026-09-25) — re-synced with the create wizard → single-page-form
change (`614a029`); see this file's git history for the 1.0 wizard-era text.

> Shared conventions are in [../README.md](../README.md).

## 1. Overview

Subscriptions deliver commercetools events to an external message broker (GCP Pub/Sub, AWS
SQS, Confluent Cloud, and — declared but not yet configurable — SNS, EventBridge, Azure
Service Bus, Azure Event Grid). Merchants create a subscription on a single page and manage
existing ones on a detail page — both render the same shared form. A subscription listens to
**messages** (specific message types per resource) and/or **changes** (per resource type).

## 2. User scenarios

- As a merchant, I can browse a paginated, sortable list of subscriptions showing key,
  version, created date, and destination type.
- As a merchant, I can create a subscription on a single page with the same collapsible
  sections as the edit view: key, destination, changes, messages.
- As a merchant, I can configure a destination's connection settings specific to its type.
- As a merchant, I can select which resource-type **changes** to listen to.
- As a merchant, I can select specific **message types** per resource to listen to.
- As a merchant, I can open a subscription and edit its key, destination, changes, and
  messages in collapsible sections, then save, revert, or delete it.

## 3. Functional requirements

### List

- **FR-001** List subscriptions, paginated, sortable by key (default ascending). Columns:
  Key, Version, Created At, Destination Type (localized label). Row click opens the detail
  view. "Add new Subscription" opens the create page. A `refetch` navigation state forces
  a reload (used after create/delete).

### Create & edit (shared single-page form)

Create (`/subscription/new`) and edit (`/subscription/:id`) render the same form component
(no stepper/wizard) — they differ only in initial values, which fields are read-only, and
which action buttons are shown.

- **FR-002** The form has four collapsible sections, all present at once (no sequential
  gating): **Key** (expanded), **Destination** = type select + type-specific config
  (expanded), **Changes** (collapsed), **Messages** (collapsed).
- **FR-003 — Key section.** Field **Key** (required, shared key rule). Editable on create;
  read-only on edit (immutable after creation).
- **FR-004 — Destination section, type select.** Field **Destination type** (required,
  clearable, searchable select) from the 7 destination types. Changing it re-initializes the
  type-specific config below.
- **FR-005 — Destination section, type-specific config.** Renders fields specific to the
  chosen type:
  - **Google Cloud Pub/Sub**: Topic (required), Project ID (required).
  - **AWS SQS**: Authentication mode (`IAM` | `Credentials`, required); Access key & Access
    secret (required only when mode = Credentials); Queue URL (required); Region (required).
  - **Confluent Cloud**: Bootstrap server (required), API key (required), API secret
    (required), Acks (`0` | `1` | `all`, required), Topic (required).
  - **SNS / EventBridge / Azure Service Bus / Azure Event Grid**: no configuration form —
    show "No mapping defined so far for {type}" and block Save on create (see §6); existing
    subscriptions of these types cannot have their destination edited.
- **FR-006 — Changes section.** Optional multi-select of resource types (40 options); each
  selection adds `{ resourceTypeId }`. Zero selections allowed.
- **FR-007 — Messages section.** Optional, grouped by resource type; each group is labelled
  with its message-type count and lists individual message-type checkboxes. Checking adds
  the type to that resource's `types[]`; unchecking removes it, and removes the resource
  entry when its `types[]` becomes empty. Zero selections allowed.
- **FR-008** On create, Save builds a `SubscriptionDraft` from the form: key; destination
  (from the chosen type's config + `type`); `changes` only if non-empty; `messages` only if
  non-empty; `format` defaults to Platform. On success show a created notification and
  return to the list with `refetch`.

### Detail / edit

- **FR-009** Fetch the subscription by id and populate the shared form (§FR-002) with its
  current values; the Key field becomes read-only per FR-003.
- **FR-010** Without Manage: on both create and edit, all sections render read-only and
  Save/Delete are disabled; "Add new Subscription" on the list is disabled too.
- **FR-011** Save converts the form to a subscription, computes update actions (changeKey,
  changeDestination, changeMessages/setMessages, changeChanges/setChanges), and updates with
  the current version only when actions exist; on success show an updated notification and
  refetch. Revert resets to loaded values (disabled when pristine). Delete removes the
  subscription and returns to the list with `refetch`.

## 4. Views & navigation

| View | Route | Presentation |
|------|-------|--------------|
| List | `/subscriptions` | full page, data table |
| Create | `/subscription/new` | single page with collapsible sections |
| Detail / edit | `/subscription/:id` | single page with collapsible sections |

## 5. Validation rules

- Key: shared key rule.
- Destination type: required.
- Destination config: all listed fields required and non-empty; SQS credentials required only
  in `Credentials` mode.
- Changes and Messages: optional (zero selections allowed).
- Neither Save button is explicitly disabled on invalidity — Formik still blocks an invalid
  submit and surfaces field errors. Create Save is disabled while submitting or without
  Manage; edit Save is additionally disabled while pristine (unchanged from the loaded values).

## 6. Edge cases & known limitations

- **Only GCP Pub/Sub, AWS SQS, and Confluent Cloud are fully configurable.** SNS,
  EventBridge, Azure Service Bus, and Azure Event Grid appear in the destination-type picker
  but have no configuration UI — selecting one blocks Save on create, and existing
  subscriptions of these types cannot have their destination edited (key/changes/messages
  remain editable).
- **Subscription `format`** (Platform vs CloudEvents) is not exposed; defaults to Platform.
- **Subscription `status`** (Healthy / ConfigurationError / TemporaryError / ManuallySuspended
  / ConfigurationErrorDeliveryStopped) is on the entity but not surfaced in list or detail.
- **No draft persistence on create** — navigating away or refreshing loses progress (there is
  no autosave and no "resume later").
- Changing destination type in the detail view should re-initialize the destination config;
  ensure the change is captured as an update action.
- No bulk operations, no cloning, no search/virtualization in the (large) message-type list.
- Some legacy key-validation copy references "business unit" and should be corrected.

## 7. Out of scope / non-goals

- Configuring SNS/EventBridge/Azure destinations; CloudEvents format; status management;
  bulk operations.

## Review checklist

- [ ] The shared create/edit single-page form (sections, read-only rules, routes) captured
- [ ] All 3 implemented destination configs + their required fields captured
- [ ] Changes vs Messages selection semantics captured
- [ ] Unsupported destination types and "GCP-and-friends only" limitation stated
- [ ] Data model, enums, and update-action mapping present in `data-model.md`

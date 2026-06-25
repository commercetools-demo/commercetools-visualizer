# Feature: Subscriptions

**Status:** Extracted from existing implementation
**Domain:** commercetools `Subscription` (event messaging)
**Spec version:** 1.0 (2026-06-25)

> Shared conventions are in [../README.md](../README.md).

## 1. Overview

Subscriptions deliver commercetools events to an external message broker (GCP Pub/Sub, AWS
SQS, Confluent Cloud, and — declared but not yet configurable — SNS, EventBridge, Azure
Service Bus, Azure Event Grid). Merchants create a subscription through a guided multi-step
wizard and manage existing ones in a detail view. A subscription listens to **messages**
(specific message types per resource) and/or **changes** (per resource type).

## 2. User scenarios

- As a merchant, I can browse a paginated, sortable list of subscriptions showing key,
  version, created date, and destination type.
- As a merchant, I can create a subscription via a 5-step wizard: key → choose provider →
  configure provider → choose changes → choose messages.
- As a merchant, I can configure a destination's connection settings specific to its type.
- As a merchant, I can select which resource-type **changes** to listen to.
- As a merchant, I can select specific **message types** per resource to listen to.
- As a merchant, I can open a subscription and edit its key, destination, changes, and
  messages in collapsible sections, then save, revert, or delete it.

## 3. Functional requirements

### List

- **FR-001** List subscriptions, paginated, sortable by key (default ascending). Columns:
  Key, Version, Created At, Destination Type (localized label). Row click opens the detail
  view. "Add new Subscription" opens the create wizard. A `refetch` navigation state forces
  a reload (used after create/delete).

### Create wizard (5 sequential steps, no skipping)

- **FR-002** The wizard is a horizontal stepper; each step has a route and Next/Previous
  controls (Next disabled until the step is valid), plus Cancel (→ list). The final step's
  primary action is Save. Step values accumulate in a per-step draft.
- **FR-003 — Step 1 "Define key"** (`/subscription/new`). Field **Key** (required, shared
  key rule). Next enabled only when valid.
- **FR-004 — Step 2 "Select provider"** (`/subscription/new/select-provider`). Field
  **Destination type** (required, clearable, searchable select) from the 7 destination types.
- **FR-005 — Step 3 "Configure provider"** (`/subscription/new/configure-provider`). Renders
  fields specific to the chosen type:
  - **Google Cloud Pub/Sub**: Topic (required), Project ID (required).
  - **AWS SQS**: Authentication mode (`IAM` | `Credentials`, required); Access key & Access
    secret (required only when mode = Credentials); Queue URL (required); Region (required).
  - **Confluent Cloud**: Bootstrap server (required), API key (required), API secret
    (required), Acks (`0` | `1` | `all`, required), Topic (required).
  - **SNS / EventBridge / Azure Service Bus / Azure Event Grid**: no configuration form —
    show "No mapping defined so far for {type}" and block progression (see §6).
- **FR-006 — Step 4 "Configure changes"** (`/subscription/new/changes`). Optional multi-select
  of resource types (40 options); each selection adds `{ resourceTypeId }`. Next always enabled.
- **FR-007 — Step 5 "Configure messages"** (`/subscription/new/messages`). Optional, grouped
  by resource type; each group is labelled with its message-type count and lists individual
  message-type checkboxes. Checking adds the type to that resource's `types[]`; unchecking
  removes it, and removes the resource entry when its `types[]` becomes empty. Save always
  enabled.
- **FR-008** On Save, build a `SubscriptionDraft` from the steps: key; destination (from the
  chosen type's config + `type`); `changes` only if non-empty; `messages` only if non-empty;
  `format` defaults to Platform. On success show a created notification and return to the
  list with `refetch`.

### Detail / edit

- **FR-009** Fetch the subscription by id and populate the form. Present four collapsible
  sections: **Key** (expanded), **Destination** = type select + type-specific config
  (expanded), **Changes** (collapsed), **Messages** (collapsed). Fields and validation match
  the wizard steps.
- **FR-010** Without Manage, all sections are read-only and Save/Delete are disabled.
- **FR-011** Save converts the form to a subscription, computes update actions (changeKey,
  changeDestination, changeMessages/setMessages, changeChanges/setChanges), and updates with
  the current version only when actions exist; on success show an updated notification and
  refetch. Revert resets to loaded values (disabled when pristine). Delete removes the
  subscription and returns to the list with `refetch`.

## 4. Views & navigation

| View | Route | Presentation |
|------|-------|--------------|
| List | `/subscriptions` | full page, data table |
| Wizard step 1 | `/subscription/new` | stepper page |
| Wizard steps 2–5 | `/subscription/new/:step` | stepper page |
| Detail / edit | `/subscription/:id` | detail page with collapsible sections |

Step names: `select-provider`, `configure-provider`, `changes`, `messages`.

## 5. Validation rules

- Key: shared key rule.
- Destination type: required (step 2).
- Destination config: all listed fields required and non-empty; SQS credentials required only
  in `Credentials` mode.
- Changes and Messages: optional (zero selections allowed).
- Save/Next gated on the active step's validity; detail-view Save gated on dirty + valid + Manage.

## 6. Edge cases & known limitations

- **Only GCP Pub/Sub, AWS SQS, and Confluent Cloud are fully configurable.** SNS,
  EventBridge, Azure Service Bus, and Azure Event Grid appear in the provider picker but have
  no configuration UI — selecting them blocks the wizard, and existing subscriptions of these
  types cannot have their destination edited (key/changes/messages remain editable).
- **Subscription `format`** (Platform vs CloudEvents) is not exposed; defaults to Platform.
- **Subscription `status`** (Healthy / ConfigurationError / TemporaryError / ManuallySuspended
  / ConfigurationErrorDeliveryStopped) is on the entity but not surfaced in list or detail.
- **No wizard draft persistence** — navigating away or refreshing loses progress.
- Changing destination type in the detail view should re-initialize the destination config;
  ensure the change is captured as an update action.
- No bulk operations, no cloning, no search/virtualization in the (large) message-type list.
- Some legacy key-validation copy references "business unit" and should be corrected.

## 7. Out of scope / non-goals

- Configuring SNS/EventBridge/Azure destinations; CloudEvents format; status management;
  bulk operations.

## Review checklist

- [ ] All 5 wizard steps, routes, and navigation captured
- [ ] All 3 implemented destination configs + their required fields captured
- [ ] Changes vs Messages selection semantics captured
- [ ] Unsupported destination types and "GCP-and-friends only" limitation stated
- [ ] Data model, enums, and update-action mapping present in `data-model.md`

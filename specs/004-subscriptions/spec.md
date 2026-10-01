# Feature: Subscriptions

**Status:** Extracted from existing implementation
**Domain:** commercetools `Subscription` (event messaging)
**Spec version:** 1.4 (2026-10-01) — adds the **Events** section (`checkout` / `import-api`),
the **delivery format** (Platform / CloudEvents, chosen on create, immutable afterwards, shown
right below the key) and an "all of this resource" option for message and event groups.
1.3: change/message resource types now match the API's
enums (4 change types and 5 message resource types added, 2 invalid message groups removed,
the message-type list completed), Confluent Cloud gets its optional record `key`, and the
detail page loads all 7 destination types. 1.2 (2026-09-29): all 7 destination types
configurable; see git history for the 1.1 "3 of 7 configurable" text.

> Shared conventions are in [../README.md](../README.md).

## 1. Overview

Subscriptions deliver commercetools events to an external message broker: GCP Pub/Sub,
AWS SQS, AWS SNS, AWS EventBridge, Confluent Cloud, Azure Service Bus, or Azure Event
Grid. Merchants create a subscription on a single page and manage existing ones on a
detail page — both render the same shared form. A subscription listens to **messages**
(specific message types per resource), **changes** (per resource type) and/or **events**
(Checkout, Import API), delivered in the Platform or CloudEvents format.

## 2. User scenarios

- As a merchant, I can browse a paginated, sortable list of subscriptions showing key,
  version, created date, and destination type.
- As a merchant, I can create a subscription on a single page with the same collapsible
  sections as the edit view: key, delivery format, destination, changes, messages, events.
- As a merchant, I can configure a destination's connection settings specific to its type.
- As a merchant, I can select which resource-type **changes** to listen to.
- As a merchant, I can select specific **message types** per resource to listen to, or all
  messages of a resource.
- As a merchant, I can select specific **event types** (Checkout, Import API) to listen to, or
  all events of a resource.
- As a merchant, I can choose the delivery format (Platform or CloudEvents) when creating a
  subscription.
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

- **FR-002** The form shows the **Key** and **Delivery format** fields at the top (no
  accordion) followed by four collapsible sections, all present at once (no sequential
  gating): **Destination** = type select + type-specific config (expanded), **Changes**
  (collapsed), **Messages** (collapsed), **Events** (collapsed).
- **FR-003 — Key section.** Field **Key** (required, shared key rule). Editable on create;
  read-only on edit (immutable after creation).
- **FR-003a — Delivery format** (directly below the key, not in an accordion). Select
  **Platform** (default) | **CloudEvents**; CloudEvents adds a required **specification
  version** text field, prefilled `1.0`. The format is chosen on create only: neither the REST
  nor the GraphQL API has an update action for it, so on edit the select and version are
  disabled/read-only (and the version is not validated, since it can't be corrected there).
  Platform is the API default, so it is not sent; CloudEvents is sent as
  `format: { CloudEvents: { cloudEventsVersion } }`.
- **FR-004 — Destination section, type select.** Field **Destination type** (required,
  clearable, searchable select) from the 7 destination types. Changing it re-initializes the
  type-specific config below.
- **FR-005 — Destination section, type-specific config.** Renders fields specific to the
  chosen type:
  - **Google Cloud Pub/Sub**: Topic (required), Project ID (required).
  - **AWS SQS**: Authentication mode (`IAM` | `Credentials`, required); Access key & Access
    secret (required only when mode = Credentials); Queue URL (required); Region (required).
  - **Confluent Cloud**: Bootstrap server (required), API key (required), API secret
    (required), Acks (`0` | `1` | `all`, required), Topic (required), Record key (optional;
    omitted from the draft when empty).
  - **AWS SNS**: Authentication mode (`IAM` | `Credentials`, required); Access key & Access
    secret (required only when mode = Credentials); Topic ARN (required).
  - **AWS EventBridge**: Account ID (required), Region (required).
  - **Azure Service Bus**: Connection string (required).
  - **Azure Event Grid**: URI (required), Access key (required).
- **FR-006 — Changes section.** Optional multi-select over all 42 `ChangeSubscriptionResourceTypeId`
  values; each selection adds `{ resourceTypeId }`. Zero selections allowed.
- **FR-007 — Messages section.** Optional, grouped by the 23 `MessageSubscriptionResourceTypeId`
  values (a message is listed under the resource the Messages reference files it under,
  e.g. `CustomerGroupAssignmentAdded` under `customer-group` but `CustomerGroupSet` under
  `customer`); each group is labelled
  with its message-type count and lists individual message-type checkboxes. Checking adds
  the type to that resource's `types[]`; unchecking removes it, and removes the resource
  entry when its `types[]` becomes empty. Each group also has a **"Receive all messages of
  …"** checkbox: an entry with an empty `types` subscribes to *all* messages of that
  resource (the API: "If no types are given, the Subscription will receive all messages"), and
  disables the group's individual checkboxes. A fetched `{ resourceTypeId, types: [] }`
  shows as that checkbox checked. Zero selections allowed.
- **FR-007a — Events section.** Optional, grouped by the 2 `EventSubscriptionResourceTypeId`
  values — **Checkout** (9 event types) and **Import API** (6) — with the same behavior as
  FR-007 (individual types, or the "Receive all events of …" checkbox for an entry without
  `types`).
- **FR-008** On create, Save builds a `SubscriptionDraft` from the form: key; destination
  (from the chosen type's config + `type`); `changes` only if non-empty; `messages` only if
  non-empty; `events` only if non-empty; `format` only for CloudEvents (Platform is the API
  default). On success show a created notification and return to the list with `refetch`.

### Detail / edit

- **FR-009** Fetch the subscription by id and populate the shared form (§FR-002) with its
  current values; the Key field becomes read-only per FR-003. The destination config of
  **every** destination type is loaded into its form (unset optional fields as empty;
  Event Grid's fetched `eventGridAccessKey` alias into its `accessKey` field). Saving a
  change that doesn't touch the destination must not produce a `changeDestination` action.
- **FR-010** Without Manage: on both create and edit, all sections render read-only and
  Save/Delete are disabled; "Add new Subscription" on the list is disabled too.
- **FR-011** Save converts the form to a subscription, computes update actions (setKey,
  changeDestination, setMessages, setChanges, setEvents — the last one diffed by the app
  itself, as `@commercetools/sync-actions` has no events support), and updates with
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
- Destination config: all listed fields required and non-empty; SQS/SNS credentials
  required only in `Credentials` mode.
- Changes and Messages: optional (zero selections allowed).
- Neither Save button is explicitly disabled on invalidity — Formik still blocks an invalid
  submit and surfaces field errors. Create Save is disabled while submitting or without
  Manage; edit Save is additionally disabled while pristine (unchanged from the loaded values).

## 6. Edge cases & known limitations

- **All 7 destination types are configurable.** The destination-type picker's option `id`
  for each type must match the commercetools API's own discriminator string exactly (e.g.
  Azure Event Grid's is `EventGrid`, not `AzureEventGrid`) — a mismatch there silently
  falls through to the "No mapping defined" placeholder for that type, even though its
  label displays correctly. The list's Destination Type column resolves its label by message
  key, which for `EventBridge` (`destinationAWSEventBridge`) and `EventGrid`
  (`destinationAzureEventGrid`) differs from the plain `destination<Type>` pattern, so those
  two are mapped explicitly; an unknown type falls back to the raw API string.
- **No message subscription for some resources.** Messages of Cart, Recurring Order,
  Payment Method, Cart Discount, Discount Code and Discount Group exist in the Messages
  reference, but `MessageSubscriptionResourceTypeId` has no value for them, so the form
  cannot offer them (their *changes* — `cart`, `cart-discount`, `discount-code`,
  `discount-group`, `recurring-order` — can be subscribed to). Offering `cart-discount` /
  `discount-code` message groups, as earlier versions did, sends resource type IDs the API
  rejects.
- **IronMQ is not supported:** it is not among the destinations documented on
  docs.commercetools.com and has no type in the GraphQL schema. Only documented destinations
  are offered.
- With no destination type selected, the destination section shows a "No mapping defined so
  far for" placeholder with an empty type name (known cosmetic gap).
- **Subscription `format`** (Platform vs CloudEvents) is not exposed; defaults to Platform.
- **Subscription `status`** (Healthy / ConfigurationError / TemporaryError / ManuallySuspended
  / ConfigurationErrorDeliveryStopped) is on the entity but not surfaced in list or detail.
- **No draft persistence on create** — navigating away or refreshing loses progress (there is
  no autosave and no "resume later").
- Changing destination type in the detail view should re-initialize the destination config;
  ensure the change is captured as an update action.
- No bulk operations, no cloning, no search/virtualization in the (large) message-type list.

## 7. Out of scope / non-goals

- CloudEvents format; status management; bulk operations.

## Review checklist

- [ ] The shared create/edit single-page form (sections, read-only rules, routes) captured
- [ ] All 7 implemented destination configs + their required fields captured
- [ ] Changes vs Messages selection semantics captured
- [ ] Destination-type `id`-vs-API-discriminator matching noted as a real failure mode
- [ ] Data model, enums, and update-action mapping present in `data-model.md`

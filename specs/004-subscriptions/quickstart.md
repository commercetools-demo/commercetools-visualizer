# Quickstart: Subscriptions

A practical build guide for reimplementing the **Subscriptions** feature on Nimbus.
Read alongside the shared rules in [../README.md](../README.md) (the constitution):
permissions, localization, optimistic concurrency, key validation, feedback, and
list conventions are defined there and are **not** repeated here. Behavior lives in
[spec.md](./spec.md); shapes/enums/operations in [data-model.md](./data-model.md);
the validated API documents in [contracts/subscriptions.graphql](./contracts/subscriptions.graphql).

## Prerequisites

- An MC **custom-application** scaffold already in place (the shared app shell, routing,
  and `custom-application-config.mjs` with the Subscription OAuth scopes).
- **Nimbus** design system available for all UI (no UIKit component names — describe
  behavior, pick Nimbus equivalents).
- A commercetools **GraphQL client** wired through the MC app shell against the **`ctp`**
  target (project-scoped GraphQL). All five operations in the contract use this target.
- Access to the project's **`dataLocale`** and **`projectLanguages`** from the app context
  for any localized labels (destination-type and resource-type display names).

## 1. Routes

From spec.md §4 — register these routes under the app's router:

| View | Route |
|------|-------|
| List | `/subscriptions` |
| Create | `/subscription/new` |
| Detail / edit | `/subscription/:id` |

Create and detail/edit render the same form component — see §4 and §5. A `refetch`
navigation state passed back to `/subscriptions` (after create/delete) forces the list to
reload.

## 2. Data layer

Wire the documents in `contracts/subscriptions.graphql` into thin hooks (names from
data-model.md §API operations):

- `useSubscriptionsFetcher(limit, offset, sort)` → `SubscriptionsList`. Return
  `results` + `total` for pagination. Default `sort: ["key asc"]`.
- `useSubscriptionFetcher(id)` → `SubscriptionById`. Full selection incl. destination
  inline fragments, `format`, `status`.
- `useSubscriptionCreator().execute({ draft })` → `CreateSubscription`.
- `useSubscriptionUpdater().execute({ id, version, actions })` → `UpdateSubscription`.
- `useSubscriptionDeleter().execute({ id, version })` → `DeleteSubscription`.

**Optimistic concurrency** (see ../README.md §5): update/delete send the loaded `version`;
a mismatch surfaces as an error notification — the user reloads and retries.

**Update actions as a diff** (`calculateSubscriptionUpdateActions`): compare the loaded
subscription against the form draft and emit only changed fields. Mapping:

| Changed | Action |
|---------|--------|
| key | `setKey { key }` |
| destination | `changeDestination { destination: <DestinationInput> }` |
| messages | `setMessages { messages }` |
| changes | `setChanges { changes }` |

If the diff is empty, **make no update call**.

**Destination union handling.** On read, `destination.type` is the discriminator; switch on
it to read the type-specific fields from the matching inline fragment. On write, map the
form's destination config into the single matching key of `DestinationInput` (e.g.
`{ GoogleCloudPubSub: { projectId, topic } }`) — exactly one key set. Normalize the read
shape (interface + `type`) and the write shape (input with a discriminating key) in one
place so the form and the diff both speak the same internal model.

## 3. List view

Full-page data table (../README.md §8: paginated, sortable, empty state, row-click → detail).

- Columns: **Key**, **Version**, **Created At**, **Destination Type** (localized label
  derived from `destination.type`).
- Sortable by key, default ascending; paginate via `limit`/`offset`.
- Row click → `/subscription/:id`. "Add new Subscription" → `/subscription/new`.
- "No items available" empty state; loading indicator while fetching; error notification on
  failure. Honor the `refetch` state on return from create/delete.

## 4. Create & edit (shared form)

Create (`/subscription/new`) and detail/edit (`/subscription/:id`) render the same form
component — no stepper, no per-step routes. All sections are visible and editable at once
(see spec.md §3, FR-002…FR-011). They differ only in:

- **Initial values** — create starts empty; edit populates from `SubscriptionById`.
- **Key field** — editable on create; read-only on edit (immutable after creation,
  ../README.md §6).
- **`isReadOnly` gating** — both create and edit pass `isReadOnly={!canManage}` down into
  every section, so without Manage all fields render read-only, not just Save.
- **Actions** — create has Cancel/Save; edit additionally has Revert (resets to loaded
  values, disabled when pristine) and Delete.

**Four collapsible sections**, same in both:

1. **Key** (expanded) — field **Key**, required, shared key rule (../README.md §6).
2. **Destination** (expanded) — **Destination type**: required, clearable, searchable select
   over the 7 types. Changing it re-initializes the type-specific config below. The
   **3 implemented configs** and their **required fields**:
   - **Google Cloud Pub/Sub** — `topic` (required), `projectId` (required).
   - **AWS SQS** — `authenticationMode` (`IAM` | `Credentials`, required); `accessKey` &
     `accessSecret` (required **only** when mode = `Credentials`); `queueUrl` (required);
     `region` (required).
   - **Confluent Cloud** — `bootstrapServer`, `apiKey`, `apiSecret`, `acks` (`0`|`1`|`all`),
     `topic` — all required.
   - **SNS / EventBridge / Azure Service Bus / Azure Event Grid** — no form; show
     "No mapping defined so far for {type}". On create this blocks Save; on edit, existing
     subscriptions of these types can't have their destination edited (key/changes/messages
     remain editable).
3. **Changes** (collapsed) — optional multi-select over the 40 resource types; each
   selection adds `{ resourceTypeId }`. Zero allowed.
4. **Messages** (collapsed) — optional, **grouped by resource type**; each group is labelled
   with its message-type count and lists message-type checkboxes. Checking adds the type to
   that resource's `types[]`; unchecking removes it, and **removes the resource entry when
   its `types[]` becomes empty**.

**Changes vs messages semantics:** *changes* = whole-resource change notifications
(`{ resourceTypeId }` only); *messages* = specific message types per resource
(`{ resourceTypeId, types: [...] }`). A subscription may use either, both, or neither.

**Building the `SubscriptionDraft` on create Save** (FR-008): assemble `key`; `destination`
from the chosen type's config mapped to the `DestinationInput` key; include `changes` only
if non-empty; include `messages` only if non-empty; set `format` to Platform
(`{ Platform: {} }`). On success: created notification, return to `/subscriptions` with
`refetch`. Formik still blocks an invalid submit and surfaces field errors, but the Save
button itself is only disabled while submitting or without Manage — not on invalidity or
read-only state (see the gating note above).

On edit Save: compute the update-action diff (§2) and call update with the current version
only when actions exist → updated notification + refetch. Delete removes the subscription
and returns to the list with `refetch`.

## 5. Cross-cutting

All per ../README.md — do not reinvent:

- **Permissions** (§3): View to render; Manage to create/save/delete. No Manage → read-only,
  disabled affordances — both create and edit follow this.
- **Notifications** (§7): success/error via the MC side-channel; convert GraphQL errors to
  human-readable messages; loading + error states on list and detail.
- **Localization** (§4): externalize all strings (destination-type labels, resource-type
  labels, section labels, validation copy). Subscription fields here are not localized
  commercetools strings, but UI labels still come from the message catalog.

## Known gaps to carry over (spec §6)

- **Only GCP Pub/Sub, AWS SQS, and Confluent Cloud are configurable.** The other 4 types
  appear in the destination-type picker but block Save on create and can't be edited in
  detail.
- **`format`** (Platform vs CloudEvents) is **not surfaced**; always defaults to Platform.
- **`status`** is read but **not surfaced** in list or detail.
- **No draft persistence on create** — navigating away or refreshing loses progress.
- No bulk operations, cloning, or search/virtualization in the (large) message-type list.
- Fix legacy key-validation copy that references "business unit".

## Verification checklist

- [ ] List loads with Key / Version / Created At / Destination Type columns; sortable by key;
      paginated; empty + error + loading states; row-click → detail; `refetch` honored.
- [ ] Create and edit render the same four-section form; no stepper/per-step routes; Cancel
      → list.
- [ ] Destination section renders correct required fields for GCP / SQS / Confluent; SQS
      credentials required only in `Credentials` mode; unsupported types block create Save.
- [ ] Changes (resourceTypeId) and Messages (resourceTypeId + types) selection semantics
      behave as specified, incl. removing an empty message group.
- [ ] Create Save builds a valid `SubscriptionDraft` (omits empty changes/messages;
      format=Platform); created notification; returns with `refetch`.
- [ ] Edit: key read-only; destination type-change → `changeDestination`.
- [ ] Update sends only the diffed actions with the current version; no actions → no call;
      version mismatch → error notification.
- [ ] Revert disabled when pristine; Delete works and returns with `refetch`.
- [ ] Without Manage: both create and edit are fully read-only, Save/Delete disabled (not
      hidden); "Add new Subscription" on the list is disabled too.
- [ ] All five contract operations resolve against the `ctp` target.

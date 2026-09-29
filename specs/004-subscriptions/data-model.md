# Data Model: Subscriptions

## Entity

### Subscription (`TCommercetoolsSubscription`) — read shape

| Field | Type | Notes |
|-------|------|-------|
| `id` | string | |
| `key` | string \| null | shared key rule |
| `version` | number | optimistic concurrency |
| `destination` | Destination (union) | see variants |
| `messages` | MessageSubscription[] | `{ resourceTypeId, types: string[] }` |
| `changes` | ChangeSubscription[] | `{ resourceTypeId }` |
| `format` | `Platform` \| `CloudEvents` | not exposed in UI; defaults Platform |
| `status` | health status enum | not surfaced in UI |
| `createdAt` / `lastModifiedAt` | DateTime | |
| `createdBy` / `lastModifiedBy` | Initiator? | |

### Subscription draft — write shape

```
TSubscriptionDraft {
  key?: string
  destination: DestinationInput            // required
  messages?: { resourceTypeId, types? }[]  // omitted if empty
  changes?: { resourceTypeId }[]           // omitted if empty
  format?: { Platform?: {} | CloudEvents?: {} }
}
```

## Destination variants

All 7 are configurable in the UI. The API's own discriminator string is used as each
type's `id`/`type` value throughout the app (form, diffing, GraphQL mutation input) —
note `EventGrid`, not `AzureEventGrid`, for Azure Event Grid.

```
GoogleCloudPubSub { type:'GoogleCloudPubSub', topic, projectId }
SQS              { type:'SQS', authenticationMode:'IAM'|'Credentials',
                   accessKey?, accessSecret?, queueUrl, region }
ConfluentCloud   { type:'ConfluentCloud', bootstrapServer, apiKey, apiSecret,
                   acks:'0'|'1'|'all', topic }
SNS              { type:'SNS', authenticationMode?:'IAM'|'Credentials',
                   accessKey?, accessSecret?, topicArn }
EventBridge      { type:'EventBridge', accountId, region }
                 // `source` is read-only (server-assigned); not part of the input.
AzureServiceBus  { type:'AzureServiceBus', connectionString }
EventGrid        { type:'EventGrid', uri, accessKey }
                 // Read back aliased as `eventGridAccessKey` (see SubscriptionFragment
                 // in contracts/subscriptions.graphql) to avoid a field-type conflict
                 // with SNS/SQS's `accessKey` under the same `destination` selection;
                 // convertTSubscription renames it back to `accessKey` before diffing.
```

## Form / draft models

### Create/edit form values (shared)

Both the create page and the edit page use the same Formik shape and both set
`isReadOnly={!canManage}` — they differ only in `initialValues` (empty vs the fetched
subscription).

```
TFormValues {
  id, key,
  destinationType,                          // one of the 7 types
  destination?: {
    GoogleCloudPubSub?, SQS?, ConfluentCloud?, SNS?, EventBridge?,
    AzureServiceBus?, EventGrid?,
  },
  changes?: { resourceTypeId }[],
  messages?: { resourceTypeId, types: string[] }[],
}
```

## Enumerations

- **Destination types (7, all configurable)** — `GoogleCloudPubSub`, `SQS`,
  `ConfluentCloud`, `SNS`, `EventBridge`, `AzureServiceBus`, `EventGrid` (these are the
  API's own discriminator strings, used verbatim as each picker option's `id`).
- **SQS / SNS auth mode** — `IAM` | `Credentials`.
- **Confluent acks** — `0` | `1` | `all`.
- **Change resource types (40)** — approval-flow, approval-rule, associate-role,
  attribute-group, business-unit, cart, cart-discount, category, channel, customer,
  customer-email-token, customer-group, customer-password-token, discount-code, extension,
  inventory-entry, key-value-document, order, order-edit, payment, product, product-discount,
  product-selection, product-tailoring, product-type, quote, quote-request, review,
  shipping-method, shopping-list, staged-quote, standalone-price, state, store, subscription,
  tax-category, type, zone.
- **Message types** — 245+ values grouped by ~18 resource types (e.g. ProductCreated,
  OrderStateChanged, BusinessUnit* …). See `subscriptionMessageTypes` in the source for the
  authoritative list.
- **Format** — `Platform` | `CloudEvents`.
- **Status** — `Healthy`, `ConfigurationError`, `TemporaryError`, `ManuallySuspended`,
  `ConfigurationErrorDeliveryStopped`.

## API operations (commercetools GraphQL — `ctp` target)

| Operation | Purpose |
|-----------|---------|
| `useSubscriptionsFetcher(limit, offset, sort)` | list |
| `useSubscriptionFetcher(id)` | fetch one |
| `useSubscriptionCreator().execute({ draft })` | create |
| `useSubscriptionUpdater().execute({ id, version, actions })` | update |
| `useSubscriptionDeleter().execute({ id, version })` | delete |

### Update-action mapping (`calculateSubscriptionUpdateActions`)

| Change | Action |
|--------|--------|
| Key | `setKey { key }` / `changeKey` |
| Destination | `changeDestination { destination }` |
| Messages | `setMessages { messages }` |
| Changes | `setChanges { changes }` |

Only changed fields produce actions; if none, no update call is made.

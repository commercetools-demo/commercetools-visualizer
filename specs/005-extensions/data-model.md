# Data Model: API Extensions

## Entity

### Extension (`TExtension`) — read shape

| Field | Type | Notes |
|-------|------|-------|
| `id` | string | |
| `key` | string? | shared key rule |
| `destination` | Destination (union) | HTTP \| AWSLambda \| GoogleCloudFunction |
| `triggers` | Trigger[] | |
| `timeoutInMs` | number? | server-limited (default 2000 ms; 10000 ms unless raised) |
| `expansionPaths` | string[] | at most 3 |
| `additionalContext` | `{ includeOldResource }`? | `oldResource` for Update calls |
| `dependenciesRef` (draft: `dependencies`) | Reference[] (`ResourceIdentifier[]`) | other extensions; max 5, acyclic, depth ≤ 3, applicable to every trigger/action |
| `version` | number | optimistic concurrency |
| `createdAt` / `lastModifiedAt` | DateTime | |
| `createdBy` / `lastModifiedBy` | Initiator? | |

### Trigger

```
Trigger { resourceTypeId, actions: ('Create'|'Update')[], condition? /* predicate syntax */ }
// An extension may have several triggers for one resource type.
```

### Destination variants

```
HTTP      { type:'HTTP', url, authentication?:
            { type:'AuthorizationHeader', headerValue }
          | { type:'AzureFunctionsAuthentication', key } }
AWSLambda { type:'AWSLambda', arn, accessKey, accessSecret }
GoogleCloudFunction { type:'GoogleCloudFunction', url }
```

### Extension draft — write shape

```
TExtensionDraft {
  key?: string
  destination: DestinationInput
  triggers: { resourceTypeId, actions?, condition? }[]
  timeoutInMs?: number
  expansionPaths?: string[]
  dependencies?: { typeId: 'extension', id }[]
  additionalContext?: { includeOldResource: boolean }
}
```

## Form model (flattened)

```
TFormValues {
  key?: string
  destinationName: 'HTTP' | 'AWSLambda' | 'GoogleCloudFunction'
  destinationHttpUrl?: string
  destinationHttpAuthenticationName?: 'AuthorizationHeader' | 'AzureFunctions' | ''
  destinationHttpAuthenticationAuthorizationHeaderValue?: string
  destinationHttpAuthenticationAuthorizationKey?: string
  destinationAwsArn?: string
  destinationAwsAccessKey?: string
  destinationAwsAccessSecret?: string
  destinationGcfUrl?: string
  timeoutInMs?: string            // text while editing; positive whole number or empty
  includeOldResource?: boolean
  expansionPaths?: string[]       // blank rows allowed while editing, dropped on save
  dependencies?: string[]         // extension ids
  triggers: { resourceTypeId, actions?, condition? }[]
}
```

`tExtensionToFormValues` / `formValuesToTExtension` convert between the flat form and the
nested API shapes.

## Enumerations

- **Destination types (3)** — `HTTP`, `AWSLambda`, `GoogleCloudFunction` (all documented; the full `ExtensionDestination` set).
- **HTTP auth** — None | `AuthorizationHeader` | `AzureFunctions`.
- **Action types** — `Create`, `Update`.
- **Trigger resource types (12)** — the full `ExtensionResourceTypeId` enum: cart, order,
  payment, payment-method, customer, customer-group, quote-request, staged-quote, quote,
  business-unit, shopping-list, product. Pinned to the official values by
  `extensions-triggers-form.spec.ts`.

## API operations (commercetools GraphQL — `ctp` target)

| Operation | Purpose |
|-----------|---------|
| `extensions(limit, offset, sort)` | list |
| `extension(id)` | fetch one |
| `createExtension(draft)` | create |
| `updateExtension(id, version, actions)` | update |
| `deleteExtension(id, version)` | delete |

### Update-action mapping (`calculateExtensionsUpdateActions`)

| Change | Action |
|--------|--------|
| Key | `setKey { key }` |
| Destination | `changeDestination { destination }` |
| Triggers | `changeTriggers { triggers }` |
| Timeout | `setTimeoutInMs { timeoutInMs }` |

Only changed fields produce actions.

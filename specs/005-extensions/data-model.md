# Data Model: API Extensions

## Entity

### Extension (`TExtension`) — read shape

| Field | Type | Notes |
|-------|------|-------|
| `id` | string | |
| `key` | string? | shared key rule |
| `destination` | Destination (union) | HTTP \| AWSLambda (\| GoogleCloudFunction, schema only) |
| `triggers` | Trigger[] | |
| `timeoutInMs` | number? | server-limited |
| `version` | number | optimistic concurrency |
| `createdAt` / `lastModifiedAt` | DateTime | |
| `createdBy` / `lastModifiedBy` | Initiator? | |

### Trigger

```
Trigger { resourceTypeId, actions: ('Create'|'Update')[], condition? /* JMESPath */ }
```

### Destination variants

```
HTTP      { type:'HTTP', url, authentication?:
            { type:'AuthorizationHeader', headerValue }
          | { type:'AzureFunctionsAuthentication', key } }
AWSLambda { type:'AWSLambda', arn, accessKey, accessSecret }
GoogleCloudFunction { type:'GoogleCloudFunction', url }   // schema only, not in UI
```

### Extension draft — write shape

```
TExtensionDraft {
  key?: string
  destination: DestinationInput
  triggers: { resourceTypeId, actions?, condition? }[]
  timeoutInMs?: number
}
```

## Form model (flattened)

```
TFormValues {
  key?: string
  destinationName: 'HTTP' | 'AWSLambda'
  destinationHttpUrl?: string
  destinationHttpAuthenticationName?: 'AuthorizationHeader' | 'AzureFunctions' | ''
  destinationHttpAuthenticationAuthorizationHeaderValue?: string
  destinationHttpAuthenticationAuthorizationKey?: string
  destinationAwsArn?: string
  destinationAwsAccessKey?: string
  destinationAwsAccessSecret?: string
  timeoutInMs?: number
  triggers: { resourceTypeId, actions?, condition? }[]
}
```

`tExtensionToFormValues` / `formValuesToTExtension` convert between the flat form and the
nested API shapes.

## Enumerations

- **Destination types** — `HTTP`, `AWSLambda` (UI); `GoogleCloudFunction` (schema only).
- **HTTP auth** — None | `AuthorizationHeader` | `AzureFunctions`.
- **Action types** — `Create`, `Update`.
- **Trigger resource types** — cart, order, payment, customer, quote-request, staged-quote,
  quote, business-unit.

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

# Data Model: Custom Objects

## Entity

### CustomObject (`TCustomObject`) — read shape

| Field | Type | Notes |
|-------|------|-------|
| `id` | string (UUID) | |
| `container` | string | namespace; immutable after create |
| `key` | string | unique within container; shared key rule; immutable after create |
| `value` | JSON | arbitrary valid JSON |
| `version` | number | optimistic concurrency |
| `createdAt` / `lastModifiedAt` | DateTime | |
| `createdBy` / `lastModifiedBy` | Initiator? | |

### Draft — write shape

```
TCustomObjectDraft {
  container: string
  key: string
  value: string          // serialized JSON
  version?: number        // for updates (optimistic concurrency)
}
```

## Form model

```
TFormValues {
  container: string       // read-only in edit
  key: string             // read-only in edit
  value: string           // serialized JSON, edited via JSON editor
}
```

## API operations (commercetools GraphQL — `ctp` target)

Via `commercetools-demo-shared-data-fetching-hooks`
(`useCustomObjectsFetcher`, `useCustomObjectFetcher`, `useCustomObjectCreatorOrUpdater`,
`useCustomObjectDeleter`).

| Operation | Purpose |
|-----------|---------|
| `customObjects(container!, limit, offset, sort)` | list (container required) |
| `customObject(id)` | fetch one |
| `createOrUpdateCustomObject(draft)` | **create and update share one mutation** |
| `deleteCustomObject(id, version)` | delete |

> There is no diff/update-action model. Create and update both call
> `createOrUpdateCustomObject`; passing `version` enforces optimistic concurrency on update.

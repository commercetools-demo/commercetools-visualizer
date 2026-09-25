# Data Model: States

## Entity

### State (`TState`) — read shape

| Field | Type | Notes |
|-------|------|-------|
| `id` | string (UUID) | |
| `key` | string | shared key rule; immutable after create |
| `type` | StateType | immutable after create |
| `name` / `nameAllLocales` | LocalizedString? | optional |
| `description` / `descriptionAllLocales` | LocalizedString? | optional |
| `initial` | boolean | first step of a workflow |
| `transitions` | State[] (refs) | targets of the same type |
| `roles` | StateRole[] | not editable in UI |
| `builtIn` | boolean | system state; read-only |
| `version` | number | optimistic concurrency |
| `createdAt` / `lastModifiedAt` | DateTime | |

### State draft — write shape

```
TStateDraft {
  type: StateType                       // required
  key: string                           // required
  name?: LocalizedStringItemInput[]     // empty omitted
  description?: LocalizedStringItemInput[]
  initial?: boolean                     // default true
  transitions?: ReferenceInput[]        // { typeId: type, id }
  roles?: StateRole[]                   // not set by form
}
```

## Form model

```
TFormValues {
  id?: string
  key: string
  stateType: StateType
  name: Record<locale, string>
  description: Record<locale, string>
  initial: boolean
  transitions: string[]                 // target state IDs
}
```

## Enumerations

- **StateType** — `LineItemState`, `OrderState`, `PaymentState`, `ProductState`,
  `QuoteRequestState`, `QuoteState`, `ReviewState`, `StagedQuoteState`.
- **StateRole** — `Return`, `ReviewIncludedInStatistics` (not editable in UI).

## API operations (commercetools GraphQL — `ctp` target)

Via `commercetools-demo-shared-data-fetching-hooks`.

| Operation | Purpose |
|-----------|---------|
| `states(limit, offset, where?)` | list (filter by `type="…"`, exclude `id != "…"` in edit) |
| `state(id)` | fetch one |
| `createState(draft)` | create |
| `updateState(id, version, actions)` | update |
| `deleteState(id, version)` | delete |

Fields fetched: id, key, type, name(+AllLocales), description(+AllLocales), initial,
transitions { id }, builtIn, roles, version, createdAt, lastModifiedAt.

### Update-action mapping (`calculateStateUpdateActions`)

| Change | Action |
|--------|--------|
| Initial flag | `changeInitial { initial }` |
| Name | `setName { name }` |
| Description | `setDescription { description }` |
| Transitions | `setTransitions { transitions }` |
| Key (not exposed) | `changeKey { key }` |
| Type (not exposed) | `changeType { type }` |
| Roles (not exposed) | `setRoles` / `addRoles` / `removeRoles` |

Only changed fields produce actions; if none, no update call is made.

# Data Model: States

## Entity

### State (`TState`) — read shape

| Field | Type | Notes |
|-------|------|-------|
| `id` | string (UUID) | |
| `key` | string | shared key rule; immutable after create |
| `type` | StateType | editable unless `builtIn` (`changeType`) |
| `name` / `nameAllLocales` | LocalizedString? | optional |
| `description` / `descriptionAllLocales` | LocalizedString? | optional |
| `initial` | boolean | first step of a workflow |
| `transitions` | State[]? (refs) | targets of the same type; **unset = any, `[]` = final** |
| `roles` | StateRole[] | `Return` for LineItemState, `ReviewIncludedInStatistics` for ReviewState |
| `builtIn` | boolean | system state; can't be deleted, key/type read-only |
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
  transitions?: ReferenceInput[]        // { typeId: type, id }; omitted unless restricted
  roles?: StateRole[]                   // omitted when none
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
  restrictTransitions: boolean          // false = leave transitions unset (any allowed)
  transitions: string[]                 // target state IDs (used when restricted)
  roles: StateRole[]
}
```

## Enumerations

- **StateType (9)** — `LineItemState`, `OrderState`, `PaymentState`, `ProductState`,
  `QuoteRequestState`, `QuoteState`, `RecurringOrderState`, `ReviewState`,
  `StagedQuoteState`. Single source: `state-types.ts`, pinned by `state-types.spec.ts`.
- **StateRole (2)** — `Return` (LineItemState only), `ReviewIncludedInStatistics` (ReviewState
  only).

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
| Transitions | `setTransitions { transitions }` — `transitions` omitted to remove the restriction (unset), `[]` for a final state |
| Key | `changeKey { key }` (not for built-in states) |
| Type | `changeType { type }` (not for built-in states) |
| Roles | `addRoles` / `removeRoles` (sync-actions diffs the sorted arrays) |

Only changed fields produce actions; if none, no update call is made.

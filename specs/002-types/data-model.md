# Data Model: Types

## Entities

### Type (`TTypeDefinition`) — read shape

| Field | Type | Notes |
|-------|------|-------|
| `id` | string (UUID) | |
| `key` | string | shared key rule; immutable after create |
| `name` | LocalizedString | required |
| `description` | LocalizedString? | optional |
| `resourceTypeIds` | string[] | ≥1; immutable after create |
| `fieldDefinitions` | FieldDefinition[] | |
| `version` | number | optimistic concurrency |
| `createdAt` / `lastModifiedAt` | DateTime | |
| `createdBy` / `lastModifiedBy` | Initiator? | |

### FieldDefinition (`TFieldDefinition`)

| Field | Type | Notes |
|-------|------|-------|
| `name` | string | shared key rule; unique within Type; immutable |
| `label` | LocalizedString | required |
| `required` | boolean | default false; mutually exclusive with `Set`; set at creation only — **no update action to change it later** |
| `type` | FieldTypeInput | immutable; see below |
| `inputHint` | `SingleLine` \| `MultiLine` | String types only; default `SingleLine` |

### Field type input (`TFieldTypeInput`) — discriminated union

```
{ Boolean: {} }
{ String: {} }
{ LocalizedString: {} }
{ Number: {} }
{ Money: {} }
{ Date: {} }
{ Time: {} }
{ DateTime: {} }
{ Enum: { values: EnumValue[] } }            // EnumValue: { key, label: string }
{ LocalizedEnum: { values: LocalizedEnumValue[] } } // { key, label: LocalizedString }
{ Reference: { referenceTypeId: string } }
{ Set: { elementType: TFieldTypeInput } }     // wraps any of the above
```

## Form / draft models

### Type form values

```
TFormValues {
  id: string
  key?: string
  name: Record<locale, string>
  description: Record<locale, string>
  resourceTypeIds: string[]
  fieldDefinitions: TFieldDefinition[]
}
```

### Field-definition form values

```
TFieldDefinitionFormValues {
  name: string
  label: Record<locale, string>
  required?: boolean
  isMultiLine: boolean                 // → inputHint SingleLine/MultiLine
  isLocalized: boolean                 // String→LocalizedString, Enum→LocalizedEnum
  isSet: boolean                       // wrap in Set
  typeName: 'Boolean'|'Date'|'Enum'|'Money'|'Number'|'Reference'|'String'
  format: 'date'|'time'|'datetime'     // when typeName === 'Date'
  referenceTypeId: string              // when typeName === 'Reference'
  enumValues?: { key?: string; label?: Record<locale,string> | string }[]
}
```

## Enumerations

- **Resource type IDs** (Type applicability) — the full `ResourceTypeId` enum (38 values):
  address, asset, approval-flow, approval-rule, associate-role, business-unit,
  cart-discount, category, channel, customer, customer-group, custom-line-item,
  discount-code, inventory-entry, line-item, order, order-edit, order-delivery,
  order-parcel, order-return-item, payment, payment-interface-interaction, payment-method,
  payment-method-info, product-price, product-selection, product-tailoring, quote,
  reservation, review, recurring-order, shipping, shipping-method, shopping-list,
  shopping-list-text-line-item, standalone-price, store, transaction. Some only apply to
  B2B-enabled projects (approval-flow, approval-rule, associate-role, business-unit); all
  are offered unconditionally.
- **Reference type IDs** (Reference fields) — the full `CustomFieldReferenceValue` enum
  (19 values): approval-flow, approval-rule, associate-role, business-unit, cart,
  cart-discount, category, channel, customer, customer-group, key-value-document, order,
  product, product-type, review, state, shipping-method, variant, zone. `variant` only
  applies to projects with the Modular product catalog model.
- Both lists are pinned to the official values by `types-form/constants.spec.ts` and
  `field-definition-input/constants.spec.ts`.
- **Input hint** — `SingleLine` | `MultiLine`.
- **Date format** — Date | Time | DateTime.

## API operations (commercetools GraphQL — `ctp` target)

Via `commercetools-demo-shared-data-fetching-hooks` (`useTypeDefinitionUpdater`, etc.).

| Operation | Purpose |
|-----------|---------|
| `typeDefinitions(limit, offset, sort)` | list (results + total) |
| `typeDefinition(id)` | fetch one |
| `typeDefinition(id) { fieldDefinitions(includeNames:[…]) }` | fetch one field definition for edit |
| `createTypeDefinition(draft)` | create (key, name, description?, resourceTypeIds) |
| `updateTypeDefinition(id, version, actions)` | update (see actions) |
| `deleteTypeDefinition(id, version)` | delete |

### Update-action mapping

| Change | Action |
|--------|--------|
| Name | `changeName { name }` |
| Description | `changeDescription { description }` (a.k.a. setDescription) |
| Add field | `addFieldDefinition { fieldDefinition }` |
| Remove field | `removeFieldDefinition { fieldName }` |
| Field label | `changeLabel { fieldName, label }` |
| Field input hint | `changeInputHint { fieldName, inputHint }` |
| Add enum value | `addEnumValue { fieldName, value }` (enum) / `addLocalizedEnumValue` (localized) |
| Change enum label | `changeEnumValueLabel` (enum) / `changeLocalizedEnumValueLabel` (localized) |
| Remove enum value | `removeEnumValues { fieldName, keys }` (enum) / `removeLocalizedEnumValues` (localized) — diffed client-side, since `@commercetools/sync-actions` never emits this action on its own. The remaining update actions are then diffed against the field *after* that removal, otherwise sync-actions pairs values by position and reports every value after the removed one as a new `addEnumValue`/`addLocalizedEnumValue` for a key that already exists |
| Reorder enum values | `changeEnumValueOrder { fieldName, keys }` (enum) / `changeLocalizedEnumValueOrder` (localized) — driven by drag-and-drop in the enum value editor |

> Action names verified against the commercetools schema (see `contracts/types.graphql`).
>
> **No action exists to change a field definition's `required` flag** after creation — it is
> set only at creation via `FieldDefinitionInput.required` (see spec §6).

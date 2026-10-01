export type Fields =
  | 'Boolean'
  | 'Date'
  | 'Enum'
  | 'Money'
  | 'Number'
  | 'Reference'
  | 'String';

// Allowed `referenceTypeId`s for a Reference field — keep in sync with
// `CustomFieldReferenceValue`:
// https://docs.commercetools.com/api/projects/types#customfieldreferencevalue
export const REFERENCE_TYPES = [
  'approval-flow',
  'approval-rule',
  'associate-role',
  'business-unit',
  'cart',
  'cart-discount',
  'category',
  'channel',
  'customer',
  'customer-group',
  'key-value-document',
  'order',
  'product',
  'product-type',
  'review',
  'state',
  'shipping-method',
  'variant',
  'zone',
];

import { REFERENCE_TYPES } from './constants';

// The `CustomFieldReferenceValue` enum from the commercetools Types API:
// https://docs.commercetools.com/api/projects/types#customfieldreferencevalue
// If the API gains a value, add it here *and* in constants.ts.
const OFFICIAL_REFERENCE_TYPE_IDS = [
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

describe('REFERENCE_TYPES', () => {
  it('offers every reference target the API allows', () => {
    const missing = OFFICIAL_REFERENCE_TYPE_IDS.filter(
      (id) => !REFERENCE_TYPES.includes(id)
    );
    expect(missing).toEqual([]);
  });

  it('offers no value the API would reject', () => {
    const unknown = REFERENCE_TYPES.filter(
      (id) => !OFFICIAL_REFERENCE_TYPE_IDS.includes(id)
    );
    expect(unknown).toEqual([]);
  });

  it('has no duplicates', () => {
    expect(new Set(REFERENCE_TYPES).size).toBe(REFERENCE_TYPES.length);
  });

  it('has exactly the 19 official values', () => {
    expect(REFERENCE_TYPES).toHaveLength(19);
  });
});

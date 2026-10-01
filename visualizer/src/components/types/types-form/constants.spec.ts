import { RESOURCE_TYPES } from './constants';

// The `ResourceTypeId` enum from the commercetools Types API:
// https://docs.commercetools.com/api/projects/types#resourcetypeid
// If the API gains a value, add it here *and* in constants.ts.
const OFFICIAL_RESOURCE_TYPE_IDS = [
  'address',
  'asset',
  'approval-flow',
  'approval-rule',
  'associate-role',
  'business-unit',
  'cart-discount',
  'category',
  'channel',
  'customer',
  'customer-group',
  'custom-line-item',
  'discount-code',
  'inventory-entry',
  'line-item',
  'order',
  'order-edit',
  'order-delivery',
  'order-parcel',
  'order-return-item',
  'payment',
  'payment-interface-interaction',
  'payment-method',
  'payment-method-info',
  'product-price',
  'product-selection',
  'product-tailoring',
  'quote',
  'reservation',
  'review',
  'recurring-order',
  'shipping',
  'shipping-method',
  'shopping-list',
  'shopping-list-text-line-item',
  'standalone-price',
  'store',
  'transaction',
];

describe('RESOURCE_TYPES', () => {
  it('offers every ResourceTypeId the API allows', () => {
    const missing = OFFICIAL_RESOURCE_TYPE_IDS.filter(
      (id) => !RESOURCE_TYPES.includes(id)
    );
    expect(missing).toEqual([]);
  });

  it('offers no value the API would reject', () => {
    const unknown = RESOURCE_TYPES.filter(
      (id) => !OFFICIAL_RESOURCE_TYPE_IDS.includes(id)
    );
    expect(unknown).toEqual([]);
  });

  it('has no duplicates', () => {
    expect(new Set(RESOURCE_TYPES).size).toBe(RESOURCE_TYPES.length);
  });

  it('has exactly the 38 official values', () => {
    expect(RESOURCE_TYPES).toHaveLength(38);
    expect([...RESOURCE_TYPES].sort()).toEqual(
      [...OFFICIAL_RESOURCE_TYPE_IDS].sort()
    );
  });
});

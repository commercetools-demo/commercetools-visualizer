import { changes } from './subscription-changes-types';

// The `ChangeSubscriptionResourceTypeId` enum from the commercetools Subscriptions API:
// https://docs.commercetools.com/api/projects/subscriptions#changesubscriptionresourcetypeid
// If the API gains a value, add it here *and* in subscription-changes-types.ts.
const OFFICIAL_CHANGE_RESOURCE_TYPE_IDS = [
  'approval-flow',
  'approval-rule',
  'associate-role',
  'attribute-group',
  'business-unit',
  'cart',
  'cart-discount',
  'category',
  'channel',
  'customer',
  'customer-email-token',
  'customer-group',
  'customer-password-token',
  'discount-code',
  'discount-group',
  'extension',
  'inventory-entry',
  'key-value-document',
  'order',
  'order-edit',
  'payment',
  'product',
  'product-discount',
  'product-selection',
  'product-tailoring',
  'product-type',
  'quote',
  'quote-request',
  'recurrence-policy',
  'recurring-order',
  'review',
  'shipping-method',
  'shopping-list',
  'staged-quote',
  'standalone-price',
  'state',
  'store',
  'subscription',
  'tax-category',
  'type',
  'variant',
  'zone',
];

describe('subscription changes resource types', () => {
  it('offers every ChangeSubscriptionResourceTypeId the API allows', () => {
    expect(
      OFFICIAL_CHANGE_RESOURCE_TYPE_IDS.filter((id) => !changes.includes(id))
    ).toEqual([]);
  });

  it('offers no value the API would reject', () => {
    expect(
      changes.filter((id) => !OFFICIAL_CHANGE_RESOURCE_TYPE_IDS.includes(id))
    ).toEqual([]);
  });

  it('has no duplicates and exactly the 42 official values', () => {
    expect(new Set(changes).size).toBe(changes.length);
    expect(changes).toHaveLength(42);
  });
});

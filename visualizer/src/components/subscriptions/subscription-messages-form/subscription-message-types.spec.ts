import { subscriptionMessageTypesByResource } from './subscription-message-types';
import { messageEntries } from './subscription-messages-form';

// The `MessageSubscriptionResourceTypeId` enum from the commercetools Subscriptions API:
// https://docs.commercetools.com/api/projects/subscriptions#messagesubscriptionresourcetypeid
// If the API gains a value, add it here *and* in subscription-message-types.ts.
const OFFICIAL_MESSAGE_RESOURCE_TYPE_IDS = [
  'approval-flow',
  'approval-rule',
  'associate-role',
  'business-unit',
  'category',
  'customer',
  'customer-email-token',
  'customer-group',
  'customer-password-token',
  'inventory-entry',
  'order',
  'payment',
  'product',
  'product-selection',
  'product-tailoring',
  'quote',
  'quote-request',
  'review',
  'shopping-list',
  'staged-quote',
  'standalone-price',
  'store',
  'variant',
];

// Number of messages the Messages reference
// (https://docs.commercetools.com/api/projects/messages) lists under each resource.
const OFFICIAL_MESSAGE_COUNTS: Record<string, number> = {
  'approval-flow': 4,
  'approval-rule': 8,
  'associate-role': 7,
  'business-unit': 40,
  category: 2,
  customer: 32,
  'customer-email-token': 1,
  'customer-group': 8,
  'customer-password-token': 1,
  'inventory-entry': 7,
  order: 57,
  payment: 18,
  product: 25,
  'product-selection': 7,
  'product-tailoring': 12,
  quote: 6,
  'quote-request': 5,
  review: 3,
  'shopping-list': 2,
  'staged-quote': 6,
  'standalone-price': 15,
  store: 18,
  variant: 9,
};

const all = Object.values(subscriptionMessageTypesByResource).flat();
const owner = (name: string) =>
  Object.entries(subscriptionMessageTypesByResource).find(([, names]) =>
    names.includes(name)
  )?.[0];

describe('subscription message types', () => {
  it('has a group for exactly the allowed MessageSubscriptionResourceTypeIds', () => {
    expect(Object.keys(subscriptionMessageTypesByResource).sort()).toEqual(
      [...OFFICIAL_MESSAGE_RESOURCE_TYPE_IDS].sort()
    );
  });

  it('does not offer resource types the API rejects for message subscriptions', () => {
    const keys = Object.keys(subscriptionMessageTypesByResource);
    [
      'cart',
      'cart-discount',
      'discount-code',
      'discount-group',
      'recurring-order',
      'payment-method',
    ].forEach((id) => expect(keys).not.toContain(id));
  });

  it('lists as many messages per resource as the Messages reference does', () => {
    expect(
      Object.fromEntries(
        Object.entries(subscriptionMessageTypesByResource).map(
          ([id, names]) => [id, names.length]
        )
      )
    ).toEqual(OFFICIAL_MESSAGE_COUNTS);
  });

  it('lists each message type once, across all groups', () => {
    expect(new Set(all).size).toBe(all.length);
    expect(all).toHaveLength(293);
  });

  it('files messages under the resource they belong to, not just by name prefix', () => {
    expect(owner('CustomerGroupSet')).toBe('customer');
    expect(owner('CustomerGroupAssignmentAdded')).toBe('customer-group');
    expect(owner('CustomerGroupCustomFieldAdded')).toBe('customer-group');
    expect(owner('CustomerEmailTokenCreated')).toBe('customer-email-token');
    expect(owner('CustomerPasswordTokenCreated')).toBe(
      'customer-password-token'
    );
    expect(owner('OrderCreated')).toBe('order');
    expect(owner('LineItemStateTransition')).toBe('order');
    expect(owner('DeliveryAdded')).toBe('order');
    expect(owner('ProductVariantTailoringAdded')).toBe('product-tailoring');
    expect(owner('VariantCreated')).toBe('variant');
    expect(owner('ShoppingListLineItemAdded')).toBe('shopping-list');
  });

  it('uses the official AssociateRoleNameSet, not the former AssociateRoleNameChanged', () => {
    expect(all).toContain('AssociateRoleNameSet');
    expect(all).not.toContain('AssociateRoleNameChanged');
  });

  it('does not list messages of resources that cannot be subscribed to', () => {
    expect(
      all.filter((name) =>
        /^(CartDiscount|DiscountCode|DiscountGroup|RecurringOrder|PaymentMethodCreated|Cart(Frozen|Locked|Unfrozen|Unlocked|EstimatedDeliverySet|PurchaseOrderNumberSet))/.test(
          name
        )
      )
    ).toEqual([]);
  });
});

describe('messageEntries (the Messages form groups)', () => {
  const entries = messageEntries();
  const entry = (id: string) => entries.find((e) => e.resourceTypeId === id)!;

  it('has one group per resource type, sorted by id, with the right counts', () => {
    expect(entries.map((e) => e.resourceTypeId)).toEqual(
      [...OFFICIAL_MESSAGE_RESOURCE_TYPE_IDS].sort()
    );
    entries.forEach((e) =>
      expect(e.amountOfMessage).toBe(OFFICIAL_MESSAGE_COUNTS[e.resourceTypeId])
    );
  });

  it('labels groups from the resource type id', () => {
    expect(entry('approval-flow').resourceTypeName).toBe('Approval Flow');
    expect(entry('customer-email-token').resourceTypeName).toBe(
      'Customer Email Token'
    );
    expect(entry('order').resourceTypeName).toBe('Order');
  });

  it('shows names without the resource prefix when every message carries it', () => {
    expect(
      entry('approval-flow').types.map((t) => [t.key, t.value])
    ).toContainEqual(['ApprovalFlowCreated', 'Created']);
    expect(
      entry('customer-email-token').types.map((t) => [t.key, t.value])
    ).toEqual([['CustomerEmailTokenCreated', 'Created']]);
    expect(entry('customer').types.map((t) => [t.key, t.value])).toContainEqual(
      ['CustomerGroupSet', 'Group Set']
    );
  });

  it('shows full names when some messages do not carry the prefix', () => {
    expect(entry('order').types.map((t) => t.value)).toEqual(
      expect.arrayContaining([
        'Order Created',
        'Delivery Added',
        'Line Item State Transition',
      ])
    );
    expect(entry('product-tailoring').types.map((t) => t.value)).toContain(
      'Product Variant Tailoring Added'
    );
  });
});

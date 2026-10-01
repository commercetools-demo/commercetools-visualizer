import {
  subscriptionEventResources,
  subscriptionEventTypesByResource,
} from './subscription-event-types';
import { eventEntries } from './subscription-events-form';

// The `EventSubscriptionResourceTypeId` and `EventType` enums from the commercetools
// Subscriptions API:
// https://docs.commercetools.com/api/projects/subscriptions#eventsubscriptionresourcetypeid
// https://docs.commercetools.com/api/projects/subscriptions#eventtype
// If the API gains a value, add it here *and* in subscription-event-types.ts.
const OFFICIAL_EVENT_RESOURCE_TYPE_IDS = ['checkout', 'import-api'];
const OFFICIAL_EVENT_TYPES = [
  'CheckoutOrderCreationFailed',
  'CheckoutPaymentAuthorizationCancelled',
  'CheckoutPaymentAuthorizationFailed',
  'CheckoutPaymentAuthorized',
  'CheckoutPaymentCancelAuthorizationFailed',
  'CheckoutPaymentCharged',
  'CheckoutPaymentChargeFailed',
  'CheckoutPaymentRefunded',
  'CheckoutPaymentRefundFailed',
  'ImportContainerCreated',
  'ImportContainerDeleted',
  'ImportOperationRejected',
  'ImportUnresolved',
  'ImportValidationFailed',
  'ImportWaitForMasterVariant',
];

const all = Object.values(subscriptionEventTypesByResource).flat();

describe('subscription event types', () => {
  it('has a group for exactly the allowed EventSubscriptionResourceTypeIds', () => {
    expect(Object.keys(subscriptionEventTypesByResource).sort()).toEqual(
      OFFICIAL_EVENT_RESOURCE_TYPE_IDS
    );
    expect(Object.keys(subscriptionEventResources).sort()).toEqual(
      OFFICIAL_EVENT_RESOURCE_TYPE_IDS
    );
  });

  it('lists every EventType the API allows, once, and nothing else', () => {
    expect([...all].sort()).toEqual([...OFFICIAL_EVENT_TYPES].sort());
  });

  it('files events under the resource they belong to', () => {
    expect(
      subscriptionEventTypesByResource.checkout.every((name) =>
        name.startsWith('Checkout')
      )
    ).toBe(true);
    expect(
      subscriptionEventTypesByResource['import-api'].every((name) =>
        name.startsWith('Import')
      )
    ).toBe(true);
    expect(subscriptionEventTypesByResource.checkout).toHaveLength(9);
    expect(subscriptionEventTypesByResource['import-api']).toHaveLength(6);
  });
});

describe('eventEntries (the Events form groups)', () => {
  const entries = eventEntries();

  it('has one group per resource type with the right counts and labels', () => {
    expect(
      entries.map((e) => [
        e.resourceTypeId,
        e.resourceTypeName,
        e.amountOfEvents,
      ])
    ).toEqual([
      ['checkout', 'Checkout', 9],
      ['import-api', 'Import API', 6],
    ]);
  });

  it('shows event names without the resource prefix', () => {
    const checkout = entries.find((e) => e.resourceTypeId === 'checkout')!;
    expect(checkout.types).toContainEqual({
      key: 'CheckoutOrderCreationFailed',
      value: 'Order Creation Failed',
    });
    const imports = entries.find((e) => e.resourceTypeId === 'import-api')!;
    expect(imports.types).toContainEqual({
      key: 'ImportContainerCreated',
      value: 'Container Created',
    });
  });
});

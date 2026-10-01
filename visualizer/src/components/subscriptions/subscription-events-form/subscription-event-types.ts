// Event types a Subscription can listen to, grouped by the `EventSubscriptionResourceTypeId`
// they are subscribed under — keep in sync with `EventType` / `EventSubscriptionResourceTypeId`:
// https://docs.commercetools.com/api/projects/subscriptions#eventtype
// https://docs.commercetools.com/api/events
export const subscriptionEventTypesByResource: Record<string, Array<string>> = {
  checkout: [
    'CheckoutOrderCreationFailed',
    'CheckoutPaymentAuthorizationCancelled',
    'CheckoutPaymentAuthorizationFailed',
    'CheckoutPaymentAuthorized',
    'CheckoutPaymentCancelAuthorizationFailed',
    'CheckoutPaymentCharged',
    'CheckoutPaymentChargeFailed',
    'CheckoutPaymentRefunded',
    'CheckoutPaymentRefundFailed',
  ],
  'import-api': [
    'ImportContainerCreated',
    'ImportContainerDeleted',
    'ImportOperationRejected',
    'ImportUnresolved',
    'ImportValidationFailed',
    'ImportWaitForMasterVariant',
  ],
};

// Label and the name prefix stripped from each event name when displayed.
export const subscriptionEventResources: Record<
  string,
  { label: string; prefix: string }
> = {
  checkout: { label: 'Checkout', prefix: 'Checkout' },
  'import-api': { label: 'Import API', prefix: 'Import' },
};

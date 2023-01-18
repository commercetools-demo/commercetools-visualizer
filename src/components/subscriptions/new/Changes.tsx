import { TChangeSubscriptionInput } from '../../../types/generated/ctp';
import CheckboxGroup from '../../checkbox/CheckboxGroup';

const Changes = () => {
  const possibilities = [
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
    'extension',
    'inventory-entry',
    'key-value-document',
    'order',
    'order-edit',
    'payment',
    'product',
    'product-discount',
    'product-price',
    'product-selection',
    'product-type',
    'quote',
    'quote-request',
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
    'zone',
  ];

  return (
    <CheckboxGroup
      name="changes"
      label="Choose Changes you want to listen to."
      columns={3}
    >
      {possibilities.map((entry, index) => {
        return (
          <CheckboxGroup.Item
            key={index}
            label={entry}
            value={entry}
            isChecked={(
              values: Array<TChangeSubscriptionInput> | undefined,
              value: string
            ) => {
              return Boolean(
                values && values.find((item) => item.resourceTypeId === value)
              );
            }}
            addItem={(
              values: Array<TChangeSubscriptionInput> | undefined,
              value: string
            ) => {
              const toAdd: TChangeSubscriptionInput = { resourceTypeId: value };
              if (values) {
                return [...values, toAdd];
              } else {
                return [toAdd];
              }
            }}
            removeItem={(
              values: Array<TChangeSubscriptionInput> | undefined,
              value: string
            ) => {
              return values
                ? values.filter((item) => {
                    const toRemove: TChangeSubscriptionInput = item as any;
                  return toRemove.resourceTypeId !== value;
                  })
                : [];
            }}
          />
        );
      })}
    </CheckboxGroup>
  );
};

export default Changes;

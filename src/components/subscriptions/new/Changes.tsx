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
        return <CheckboxGroup.Item key={index} label={entry} value={entry} />;
      })}
    </CheckboxGroup>
  );
};

export default Changes;

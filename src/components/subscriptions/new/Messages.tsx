import CheckboxGroup from '../../checkbox/CheckboxGroup';

const Messages = () => {
  const possibilities = [
    'business-unit',
    'category',
    'customer',
    'inventory-entry',
    'order',
    'payment',
    'product',
    'product-selection',
    'quote',
    'quote-request',
    'review',
    'staged-quote',
    'standalone-price',
    'store',
  ];
  return (
    <CheckboxGroup
      name="messages"
      label="Choose Messages you want to listen to."
      columns={3}
    >
      {possibilities.map((entry, index) => {
        return <CheckboxGroup.Item key={index} label={entry} value={entry} />;
      })}
    </CheckboxGroup>
  );
};

export default Messages;

import { defineMessages } from 'react-intl';

export default defineMessages({
  addDiscountCodeLabel: {
    id: 'Orders.Create.DiscountCode.addDiscountCodeLabel',
    description: 'The label for the add discount code section',
    defaultMessage: 'Add Discount Code',
  },
  applyLabel: {
    id: 'Orders.Create.DiscountCode.applyLabel',
    description: 'The apply discount code label',
    defaultMessage: 'Apply',
  },
  missingDiscountCode: {
    id: 'Orders.Create.Step.LineItems.missingDiscountCode',
    description: 'Message when trying to apply an invalid discount code',
    defaultMessage:
      'The discount code that you want to apply to the cart does not exist',
  },
  outdatedDiscountCode: {
    id: 'Orders.Create.Step.LineItems.outdatedDiscountCode',
    description: 'Message when trying to apply an outdated discount code',
    defaultMessage: 'The discount code that you want to apply has expired',
  },
});

import { defineMessages } from 'react-intl';

export default defineMessages({
  addressTitle: {
    id: 'cart.form.address.title',
    description: 'Title for address field',
    defaultMessage: 'Address',
  },
  titleShippingAddress: {
    id: 'Orders.Create.Step.Customer.ShippingAddress.title',
    description: 'The title for the Shipping Address panel',
    defaultMessage: 'Customer Shipping Address',
  },
  titleBillingAddress: {
    id: 'Orders.Create.Step.Customer.BillingAddress.title',
    description: 'The title for the Billing Address panel',
    defaultMessage: 'Customer Billing Address',
  },
  noAddresses: {
    id: 'Orders.Create.Step.Customer.noAddresses',
    description: 'Message when there are no addresses',
    defaultMessage:
      'Sorry, there are no addresses associated to this customer.',
  },
  addAddress: {
    id: 'Orders.Create.Step.Customer.addAddress',
    description: 'Message for the link button of add address',
    defaultMessage: 'Add address',
  },
  updateSuccess: {
    id: 'CreateCart.form.message.success',
    description: 'Success message for create update',
    defaultMessage: 'Your cart has been updated.',
  },
});

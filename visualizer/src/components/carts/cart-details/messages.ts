import { defineMessages } from 'react-intl';

export default defineMessages<string>({
  title: {
    id: 'Cart.title',
    defaultMessage: 'Cart {id}',
  },
  panelCustomerTitle: {
    id: 'Orders.Details.General.Addresses.panelTitle',
    description: 'Header text for the panel label (customer addresses).',
    defaultMessage: 'Customer',
  },
  noCustomer: {
    id: 'Orders.Details.General.Addresses.noCustomer',
    description:
      'tooltip text to display when there is not customer ' +
      'associated with an order',
    defaultMessage: 'There is no customer associated with this order.',
  },
  goToCustomer: {
    id: 'Orders.Details.General.Addresses.goToCustomer',
    description: 'Label of the customer button',
    defaultMessage: 'Go to customer',
  },
  shippingAddress: {
    id: 'Orders.Details.General.Addresses.shippingAddress',
    description: 'The label for the shipping address',
    defaultMessage: 'Shipping to',
  },
  billingAddress: {
    id: 'Orders.Details.General.Addresses.billingAddress',
    description: 'The label for the billing address',
    defaultMessage: 'Billing to',
  },
  labelMissingShippingAddress: {
    id: 'Orders.Details.General.Addresses.labelMissingShippingAddress',
    description: 'The label for a missing address (shipping)',
    defaultMessage: 'No shipping address was provided for this Order.',
  },
  labelMissingBillingAddress: {
    id: 'Orders.Details.General.Addresses.labelMissingBillingAddress',
    description: 'The label for a missing address (billing)',
    defaultMessage: 'No billing address was provided for this Order.',
  },
  deleteSuccess: {
    id: 'EditExtensions.form.message.update.success',
    description: 'Success message for update type',
    defaultMessage: 'Your Cart has been deleted.',
  },
});

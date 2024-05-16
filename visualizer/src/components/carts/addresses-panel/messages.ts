import { defineMessages } from 'react-intl';

export default defineMessages({
  panelTitle: {
    id: 'Orders.Details.General.Addresses.panelTitle',
    description: 'Header text for the panel label (customer addresses).',
    defaultMessage: 'Customer',
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
    defaultMessage: 'No shipping address was provided for this Cart.',
  },
  labelMissingBillingAddress: {
    id: 'Orders.Details.General.Addresses.labelMissingBillingAddress',
    description: 'The label for a missing address (billing)',
    defaultMessage: 'No billing address was provided for this Cart.',
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
  customerEmailLabel: {
    id: 'Orders.Details.General.Addresses.customerEmailAddressLabel',
    description: 'Label of the customer email',
    defaultMessage: 'Customer email:',
  },
  businessUnitLabel: {
    id: 'Orders.Details.General.Addresses.businessUnitLabel',
    description: 'Label of the business unit',
    defaultMessage: 'Business unit:',
  },
  shippingDeliveyTabLink: {
    id: 'Orders.Details.General.Addresses.shippingDeliveyTabLink',
    description: 'Link to the shipping and delivery tab',
    defaultMessage: 'Shipping & delivery',
  },
  multipleShippingMethodsHint: {
    id: 'Orders.Details.General.Addresses.multipleShippingMethodsHint',
    description: 'Hint message when multiple shipping methods are available',
    defaultMessage:
      "This order contains multiple addresses.<newLine></newLine>To see addresses' details go to <shippingAndDeliveryTabLink>Shipping & delivery</shippingAndDeliveryTabLink> tab",
  },
  viewCustomFieldsLabel: {
    id: 'Orders.Details.General.Addresses.viewCustomFields',
    description: 'Label to view customs fields info',
    defaultMessage: 'View {addressType} custom fields',
  },
});

import { defineMessages } from 'react-intl';

export default defineMessages({
  title: {
    id: 'Orders.Create.Step.ShippingMethod.title',
    description: 'The label for the title',
    defaultMessage: 'Shipping',
  },
  subTitle: {
    id: 'Orders.Create.Step.ShippingMethod.subTitle',
    description: 'A subtitle for the shipping step',
    defaultMessage: 'Select a shipping method.',
  },
  shippingMethodSet: {
    id: 'Orders.Create.Step.ShippingMethod.shippingMethodSet',
    description:
      'The confirmation label when a shipping method is succesfully set',
    defaultMessage: 'The shipping method has been successfully set',
  },
  shippingAddressTitle: {
    id: 'Orders.Create.Step.ShippingMethod.shippingAddressTitle',
    description: 'The label for the shipping address panel',
    defaultMessage: 'Shipping address',
  },
  shippingMethodsTitle: {
    id: 'Orders.Create.Step.ShippingMethod.shippingMethodsTitle',
    description: 'The label for the shipping methods panel',
    defaultMessage: 'Shipping methods',
  },
  noAvailableShippingMethods: {
    id: 'Orders.Create.Step.ShippingMethod.noAvailableShippingMethods',
    description: 'The label for no available shippingMethods',
    defaultMessage:
      'There are no available shipping methods for the selected address and the current configuration',
  },
  addShippingMethod: {
    id: 'Orders.Create.Step.ShippingMethod.addShippingMethod',
    description:
      'The label to add a new shipping method when none is available',
    defaultMessage: 'Add shipping method',
  },
  shippingToLabel: {
    id: 'Orders.Create.Step.ShippingMethod.shippingToLabel',
    description: 'The label for the shipping to label',
    defaultMessage: 'Shipping to',
  },
  shippingMethodNameColumn: {
    id: 'Orders.Create.Step.ShippingMethod.shippingMethodNameColumn',
    description: 'The label for the shipping method name column',
    defaultMessage: 'Name',
  },
  shippingMethodDescriptionColumn: {
    id: 'Orders.Create.Step.ShippingMethod.shippingMethodDescriptionColumn',
    description: 'The label for the shipping method description column',
    defaultMessage: 'Description',
  },
  shippingMethodRateColumn: {
    id: 'Orders.Create.Step.ShippingMethod.shippingMethodRateColumn',
    description: 'The label for the shipping method rate column',
    defaultMessage: 'Shipping method rate',
  },
  shippingMethodTaxCategoryColumn: {
    id: 'Orders.Create.Step.ShippingMethod.shippingMethodTaxCategoryColumn',
    description: 'The label for the shipping method tax category column',
    defaultMessage: 'Tax category',
  },
  shippingMethodFreeAboveColumn: {
    id: 'Orders.Create.Step.ShippingMethod.shippingMethodFreeAboveColumn',
    description: 'The label for the shipping method free above column',
    defaultMessage: 'Free above',
  },
  shippingMethodIsDefaultColumn: {
    id: 'Orders.Create.Step.ShippingMethod.shippingMethodIsDefaultColumn',
    description: 'The label for the shipping method is default column',
    defaultMessage: 'Default',
  },
  shippingMethodUpdated: {
    id: 'Orders.Create.Step.ShippingMethod.shippingMethodUpdated',
    description: 'The label for the shipping method updated notification',
    defaultMessage: 'The shipping method has been set to the cart',
  },
  yes: {
    id: 'Orders.Create.Step.ShippingMethod.Default.yes',
    description: 'The label when the shipping method is the default',
    defaultMessage: 'YES',
  },
  no: {
    id: 'Orders.Create.Step.ShippingMethod.Default.no',
    description: 'The label when the shipping method is not the default',
    defaultMessage: 'NO',
  },
  setShippingMethodFailure: {
    id: 'Orders.Create.Step.ShippingMethod.setShippingMethodFailure',
    description: 'Message when setting the shipping method fails',
    defaultMessage:
      'The tax category of the selected shipping method does not have a rate defined for the shipping country of the cart',
  },
});

import { defineMessages } from 'react-intl';

export default defineMessages({
  modalTitle: {
    id: 'Orders.Details.General.OrderItems.MultipleTaxes.modalTitle',
    description:
      'title of the modal when shipping is multi mode and line item has different tax rates',
    defaultMessage: 'Multiple taxes',
  },
  modalDescription: {
    id: 'Orders.Details.General.OrderItems.MultipleTaxes.modalDescription',
    description:
      'description of the modal when shipping is multi mode and line item has different tax rates',
    defaultMessage:
      'The line item tax calculation is based on the tax associated with each specific delivery address. Below the breakdown list of each tax per address:',
  },
  shippingCostBreakdownText: {
    id: 'Orders.Details.General.OrderSummaryPanel.OrderSummaryPricingBreakdown.shippingCostBreakdownText',
    description: 'description of the modal when shipping is multi mode',
    defaultMessage: 'Below, the breakdown of the individual shipping costs:',
  },
  shippingTotalCost: {
    id: 'Orders.Details.General.OrderSummaryPanel.OrderSummaryPricingBreakdown.shippingTotalCost',
    description: 'shipping total cost text',
    defaultMessage: 'Shipping total cost (incl. taxes)',
  },
  multiShippingAddressInfo: {
    id: 'Orders.Details.General.OrderSummaryPanel.OrderSummaryPricingBreakdown.MultiShippingAddressInfo',
    description:
      'Info box describing how shipping methods connect to different addresses and linking to the shipping and delivery tab',
    defaultMessage:
      'The same shipping method can be used multiple times across different addresses. The association between which shipping method is used in each address can be seen in the shipping & delivery tab.',
  },
});

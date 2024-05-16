import { defineMessages } from 'react-intl';

export default defineMessages({
  modalTitle: {
    id: 'Orders.Details.General.OrderSummaryPanel.OrderSummaryPricingBreakdown.modalTitle',
    description: 'title of the modal when shipping is multi mode',
    defaultMessage: 'Shipping total cost',
  },
  modalDescription: {
    id: 'Orders.Details.General.OrderSummaryPanel.OrderSummaryPricingBreakdown.modalDescription',
    description: 'description of the modal when shipping is multi mode',
    defaultMessage:
      'This Order contains mutiple shipping methods. The total shipping cost refers to the sum of all individual shipping costs.',
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
  totalAmountDiscounted: {
    id: 'Orders.Details.General.OrderSummaryPanel.totalAmountDiscounted',
    description: 'Subtotal with applied discounts',
    defaultMessage: 'Subtotal with discount',
  },
  grossTotalDiscount: {
    id: 'Orders.Details.General.OrderSummaryPanel.grossTotalDiscount',
    description: 'Total gross discounts in order summary',
    defaultMessage: '(incl. tax: - {amount})',
  },
  netTotalDiscount: {
    id: 'Orders.Details.General.OrderSummaryPanel.netTotalDiscount',
    description: 'Total net discounts in order summary',
    defaultMessage: 'Discounted (excl. tax)',
  },
  subtotal: {
    id: 'Orders.Details.General.OrderSummaryPanel.subtotal',
    description: 'subtotal label in order summary',
    defaultMessage: 'Subtotal without discount',
  },
  grossSubtotal: {
    id: 'Orders.Details.General.OrderSummaryPanel.grossSubtotal',
    description: 'gross subtotal label in order summary',
    defaultMessage: 'Subtotal (gross)',
  },
  shippingPrice: {
    id: 'Orders.Details.General.OrderSummaryPanel.shippingPrice',
    description: 'Price of in shipping order summary',
    defaultMessage: 'Shipping (incl. tax)',
  },
  shippingDiscount: {
    id: 'Orders.Details.General.OrderSummaryPanel.shippingDiscount',
    description: 'Shipping discount in shipping order summary',
    defaultMessage: 'Shipping discount',
  },
  totalGross: {
    id: 'Orders.Details.General.OrderSummaryPanel.totalGross',
    description: 'Gross Price in order summary',
    defaultMessage: '(gross)',
  },
  totalPrice: {
    id: 'Orders.Details.General.OrderSummaryPanel.totalPrice',
    description: 'Total price in order summary',
    defaultMessage: 'Total',
  },
  discountOnOrderTotal: {
    id: 'Orders.Details.General.OrderSummaryPanel.OrderSummaryPricingBreakdown.discountOnOrderTotal',
    description: 'label for cart discount with cartTotal target',
    defaultMessage: 'Discount on order total',
  },
  taxKey: {
    id: 'Orders.Details.General.OrderSummaryPanel.OrderSummaryPricingBreakdown.taxKey',
    description: 'Tax key',
    defaultMessage: 'Tax:',
  },
});

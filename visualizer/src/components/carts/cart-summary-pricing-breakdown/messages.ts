import { defineMessages } from 'react-intl';

export default defineMessages({
  modalTitle: {
    id: 'Cart.Details.General.OrderSummaryPanel.OrderSummaryPricingBreakdown.modalTitle',
    description: 'title of the modal when shipping is multi mode',
    defaultMessage: 'Shipping total cost',
  },
  modalDescription: {
    id: 'Cart.Details.General.OrderSummaryPanel.OrderSummaryPricingBreakdown.modalDescription',
    description: 'description of the modal when shipping is multi mode',
    defaultMessage:
      'This Cart contains mutiple shipping methods. The total shipping cost refers to the sum of all individual shipping costs.',
  },
  shippingCostBreakdownText: {
    id: 'Cart.Details.General.OrderSummaryPanel.OrderSummaryPricingBreakdown.shippingCostBreakdownText',
    description: 'description of the modal when shipping is multi mode',
    defaultMessage: 'Below, the breakdown of the individual shipping costs:',
  },
  shippingTotalCost: {
    id: 'Cart.Details.General.OrderSummaryPanel.OrderSummaryPricingBreakdown.shippingTotalCost',
    description: 'shipping total cost text',
    defaultMessage: 'Shipping total cost (incl. taxes)',
  },
  multiShippingAddressInfo: {
    id: 'Cart.Details.General.OrderSummaryPanel.OrderSummaryPricingBreakdown.MultiShippingAddressInfo',
    description:
      'Info box describing how shipping methods connect to different addresses and linking to the shipping and delivery tab',
    defaultMessage:
      'The same shipping method can be used multiple times across different addresses. The association between which shipping method is used in each address can be seen in the shipping & delivery tab.',
  },
  totalAmountDiscounted: {
    id: 'Cart.Details.General.OrderSummaryPanel.totalAmountDiscounted',
    description: 'Subtotal with applied discounts',
    defaultMessage: 'Subtotal with discount',
  },
  grossTotalDiscount: {
    id: 'Cart.Details.General.OrderSummaryPanel.grossTotalDiscount',
    description: 'Total gross discounts in cart summary',
    defaultMessage: '(incl. tax: - {amount})',
  },
  netTotalDiscount: {
    id: 'Cart.Details.General.OrderSummaryPanel.netTotalDiscount',
    description: 'Total net discounts in cart summary',
    defaultMessage: 'Discounted (excl. tax)',
  },
  subtotal: {
    id: 'Cart.Details.General.OrderSummaryPanel.subtotal',
    description: 'subtotal label in cart summary',
    defaultMessage: 'Subtotal without discount',
  },
  grossSubtotal: {
    id: 'Cart.Details.General.OrderSummaryPanel.grossSubtotal',
    description: 'gross subtotal label in cart summary',
    defaultMessage: 'Subtotal (gross)',
  },
  shippingPrice: {
    id: 'Cart.Details.General.OrderSummaryPanel.shippingPrice',
    description: 'Price of in shipping cart summary',
    defaultMessage: 'Shipping (incl. tax)',
  },
  shippingDiscount: {
    id: 'Cart.Details.General.OrderSummaryPanel.shippingDiscount',
    description: 'Shipping discount in shipping cart summary',
    defaultMessage: 'Shipping discount',
  },
  totalGross: {
    id: 'Cart.Details.General.OrderSummaryPanel.totalGross',
    description: 'Gross Price in cart summary',
    defaultMessage: '(gross)',
  },
  totalPrice: {
    id: 'Cart.Details.General.OrderSummaryPanel.totalPrice',
    description: 'Total price in cart summary',
    defaultMessage: 'Total',
  },
  discountOnOrderTotal: {
    id: 'Cart.Details.General.OrderSummaryPanel.OrderSummaryPricingBreakdown.discountOnOrderTotal',
    description: 'label for cart discount with cartTotal target',
    defaultMessage: 'Discount on cart total',
  },
  taxKey: {
    id: 'Cart.Details.General.OrderSummaryPanel.OrderSummaryPricingBreakdown.taxKey',
    description: 'Tax key',
    defaultMessage: 'Tax:',
  },
});

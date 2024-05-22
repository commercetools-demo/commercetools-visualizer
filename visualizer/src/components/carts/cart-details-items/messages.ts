import { defineMessages } from 'react-intl';

export default defineMessages({
  panelTitle: {
    id: 'Orders.Details.General.OrderItems.panelTitle',
    description: 'Header text for the panel label (order items).',
    defaultMessage: 'Order Items',
  },
  stateInfoDialogTitle: {
    id: 'Orders.Details.General.OrderItems.stateInfoDialogTitle',
    description: 'Title of the info dialog for the state column',
    defaultMessage: 'Splitting line item states',
  },
  stateInfoDialogIntro: {
    id: 'Orders.Details.General.OrderItems.stateInfoDialogIntro',
    description: 'Description of the info dialog for the state column',
    defaultMessage:
      'Click the {icon} to split off a specific quantity of your line item to transition through your selected Workflow.',
  },
  stateInfoDialogExampleTitle: {
    id: 'Orders.Details.General.OrderItems.stateInfoDialogExampleTitle',
    description: 'Title of Example',
    defaultMessage: 'Example:',
  },
  stateInfoDialogExampleStep1: {
    id: 'Orders.Details.General.OrderItems.stateInfoDialogExampleStep1',
    description: 'Step 1 in the Example',
    defaultMessage:
      "You have 5 pairs of Jeans to deliver but only 2 pairs can be shipped now, you can transition only a quantity of 2 Jeans to the next workflow state 'Shipped'.",
  },
  stateInfoDialogExampleStep2: {
    id: 'Orders.Details.General.OrderItems.stateInfoDialogExampleStep2',
    description: 'Step 2 in the Example',
    defaultMessage:
      'Once you split your line item, you will see the line item workflow state for each quantity of your line item.',
  },
  stateInfoDialogExampleStep3: {
    id: 'Orders.Details.General.OrderItems.stateInfoDialogExampleStep3',
    description: 'Step 3 in the Example',
    defaultMessage:
      "When you can ship your remaining 3 pairs of Jeans, you can transition the 3 pairs of Jeans to the same state, 'Shipped'.",
  },
  stateInfoDialogExampleStep4: {
    id: 'Orders.Details.General.OrderItems.stateInfoDialogExampleStep4',
    description: 'Step 4 in the Example',
    defaultMessage:
      "If all 5 pairs of Jeans are on the same state, the quantities will be recombined to show 5 pairs of Jeans in the state, 'Shipped'.",
  },
  columnProduct: {
    id: 'Orders.Details.General.OrderItems.columnProduct',
    description: 'Column label (product).',
    defaultMessage: 'Product',
  },
  columnCountry: {
    id: 'Orders.Details.General.OrderItems.MultipleTaxes.columnCountry',
    description: 'Column label (Country).',
    defaultMessage: 'Country',
  },
  columnCountryState: {
    id: 'Orders.Details.General.OrderItems.MultipleTaxes.columnCountryState',
    description: 'Column label (State).',
    defaultMessage: 'State',
  },
  columnQuantity: {
    id: 'Orders.Details.General.OrderItems.columnQuantity',
    description: 'Column label (quantity).',
    defaultMessage: 'Qty',
  },
  columnState: {
    id: 'Orders.Details.General.OrderItems.columnState',
    description: 'Column label (state).',
    defaultMessage: 'Line Item State',
  },
  columnNetUnitPrice: {
    id: 'Orders.Details.General.OrderItems.columnNetUnitPrice',
    description: 'Column label (net unit price).',
    defaultMessage: 'Unit price {currencySymbol}',
  },
  columnGrossUnitPrice: {
    id: 'Orders.Details.General.OrderItems.columnGrossUnitPrice',
    description: 'Column label (original unit price).',
    defaultMessage: 'Original unit price {currencySymbol}',
  },
  columnTax: {
    id: 'Orders.Details.General.OrderItems.columnTax',
    description: 'Column label (tax).',
    defaultMessage: 'Tax',
  },
  columnSubtotalPrice: {
    id: 'Orders.Details.General.OrderItems.columnSubtotalPrice',
    description: 'Column label (subtotal price).',
    defaultMessage: 'Subtotal {currencySymbol}',
  },
  columnTotalPrice: {
    id: 'Orders.Details.General.OrderItems.columnTotalPrice',
    description: 'Column label (total price).',
    defaultMessage: 'Total {currencySymbol}',
  },
  stateInfoLabel: {
    id: 'Orders.Details.General.OrderItems.stateInfoLabel',
    description: 'Label for AccessibleButton',
    defaultMessage: 'Splits state for order item',
  },
  inventoryEntryInfoLabel: {
    id: 'Orders.Create.Step.LineItems.search.inventoryEntryInfoLabel',
    description: 'Label for AccessibleButton',
    defaultMessage: 'Inventory entry selection',
  },
  columnInventory: {
    id: 'Orders.Create.Step.LineItems.search.columnInventory',
    description: 'Title of the table column (columnInventory)',
    defaultMessage: 'Inventory entry',
  },
  totalLabel: {
    id: 'OrderTotalsLastRow.totalLabel',
    description: 'Total of table label',
    defaultMessage: 'Total',
  },
});

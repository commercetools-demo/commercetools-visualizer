import { defineMessages } from 'react-intl';

export default defineMessages({
  deleteItemLabel: {
    id: 'Orders.Create.Items.Table.deleteItemLabel',
    description: 'Label for the delete item button',
    defaultMessage: 'Delete item',
  },
  columnProduct: {
    id: 'Orders.Create.Items.Table.columnProduct',
    description: 'Column label (product).',
    defaultMessage: 'Product',
  },
  columnQuantity: {
    id: 'Orders.Create.Items.Table.columnQuantity',
    description: 'Column label (quantity).',
    defaultMessage: 'Qty',
  },
  columnNetUnitPrice: {
    id: 'Orders.Create.Items.Table.columnNetUnitPrice',
    description: 'Column label (net unit price).',
    defaultMessage: 'Unit price {currencySymbol}',
  },
  columnGrossUnitPrice: {
    id: 'Orders.Create.Items.Table.columnGrossUnitPrice',
    description: 'Column label (original unit price).',
    defaultMessage: 'Original unit price {currencySymbol}',
  },
  columnTax: {
    id: 'Orders.Create.Items.Table.columnTax',
    description: 'Column label (tax).',
    defaultMessage: 'Tax',
  },
  columnSubtotalPrice: {
    id: 'Orders.Create.Items.Table.columnSubtotalPrice',
    description: 'Column label (subtotal price).',
    defaultMessage: 'Subtotal {currencySymbol}',
  },
  columnTotalPrice: {
    id: 'Orders.Create.Items.Table.columnTotalPrice',
    description: 'Column label (total price).',
    defaultMessage: 'Total {currencySymbol}',
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
});

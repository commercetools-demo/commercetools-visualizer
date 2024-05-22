import { defineMessages } from 'react-intl';

export default defineMessages({
  inventorySelectPlaceholder: {
    id: 'Orders.Create.Step.LineItems.search.inventorySelectPlaceholder',
    description: 'Text for the inventory select input placeholder',
    defaultMessage: 'Select or enter inventory entry',
  },
  noInventoryDefined: {
    id: 'Orders.Create.Step.LineItems.search.noInventoryDefined',
    description: 'Text for the inventory column when no inventory is defined',
    defaultMessage: 'No inventory entry available/defined',
  },
  inventoryCantBeDefined: {
    id: 'Orders.Create.Step.LineItems.search.inventoryCantBeDefined',
    description: 'Text for the inventory column when showing custom line items',
    defaultMessage: 'Inventory entry cannot be defined',
  },
  inventoryWithNoChannel: {
    id: 'Orders.Create.Step.LineItems.search.inventoryWithNoChannel',
    description:
      'Text for the inventory column when an inventory has no associated channel',
    defaultMessage: "'No channel'",
  },
});

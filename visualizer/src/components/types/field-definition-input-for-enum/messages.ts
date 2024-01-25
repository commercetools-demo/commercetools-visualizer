import { defineMessages } from 'react-intl';

export default defineMessages({
  addEnumButtonLabel: {
    id: 'ProjectSettings.ProductType.AttributeDefinitions.Details.EnumTable.addEnumButton.label',
    description:
      'The label of the button adding a new enum-value in the footer of the enum-table',
    defaultMessage: 'Add New List Item',
  },
  tableHeaderLabelKey: {
    id: 'ProjectSettings.ProductType.AttributeDefinitions.Details.EnumTable.headers.key',
    description:
      'The column title of the enumeration key in the table displaying enums on the attributed-detail page in product-types administration',
    defaultMessage: 'Enumeration Key',
  },
  tableHeaderLocalizedLabelLabel: {
    id: 'ProjectSettings.ProductType.AttributeDefinitions.Details.EnumTable.headers.label.localized',
    description:
      'The column title of the enumeration label for localized enums in the table displaying enums on the attributed-detail page in product-types administration',
    defaultMessage: 'List Item Label ({language})',
  },
  tableHeaderLabelLabel: {
    id: 'ProjectSettings.ProductType.AttributeDefinitions.Details.EnumTable.headers.label',
    description:
      'The column title of the enumeration label for plain enums in the table displaying enums on the attributed-detail page in product-types administration',
    defaultMessage: 'List Item Label',
  },
});

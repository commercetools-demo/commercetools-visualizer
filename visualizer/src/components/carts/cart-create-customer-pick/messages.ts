import { defineMessages } from 'react-intl';

export default defineMessages({
  updateSuccess: {
    id: 'CreateCart.form.message.success',
    description: 'Success message for create update',
    defaultMessage: 'Your cart has been updated.',
  },
  invalidInputError: {
    id: 'Customers.SearchList.invalidInput',
    description:
      'Text for the notification when the query offset limit is exceeded',
    defaultMessage:
      'The maximum query limit has been reached. Please use filters or search terms to narrow down the results if you have more than 10,000 customers.',
  },
  searchServiceNotAvailableError: {
    id: 'Customers.SearchList.searchServiceNotAvailableError',
    description:
      'Text for the notification when error occures with the search service',
    defaultMessage:
      "The Customer Search API isn't reachable. Your data is safe, but our technical staff have been automatically notified and will be looking into this with the utmost urgency. Please try to reload the page.",
  },
  searchBarPlaceholder: {
    id: 'Customers.SearchBar.searchBarPlaceholder',
    description: 'Placeholder to show when no search input has been entered',
    defaultMessage: 'Search customer',
  },
  columnCustomerNumber: {
    id: 'Customers.SearchList.column.customerNumber',
    description: 'Title of the table column (customerNumber)',
    defaultMessage: 'Customer number',
  },
  columnExternalId: {
    id: 'Customers.SearchList.column.externalId',
    description: 'Title of the table column (externalId)',
    defaultMessage: 'External ID',
  },
  columnEmail: {
    id: 'Customers.SearchList.column.email',
    description: 'Title of the table column (email)',
    defaultMessage: 'Email',
  },
  columnFirstName: {
    id: 'Customers.SearchList.column.firstName',
    description: 'Title of the table column (firstName)',
    defaultMessage: 'First name',
  },
  columnLastName: {
    id: 'Customers.SearchList.column.lastName',
    description: 'Title of the table column (lastName)',
    defaultMessage: 'Last name',
  },
  columnCompanyName: {
    id: 'Customers.SearchList.column.companyName',
    description: 'Title of the table column (companyName)',
    defaultMessage: 'Company',
  },
  columnCustomerGroup: {
    id: 'Customers.SearchList.column.customerGroup',
    description: 'Title of the table column (customerGroup)',
    defaultMessage: 'Customer group',
  },
  columnCreatedAt: {
    id: 'Customers.SearchList.column.createdAt',
    description: 'Title of the table column (createdAt)',
    defaultMessage: 'Created on',
  },
  columnLastModifiedAt: {
    id: 'Customers.SearchList.column.lastModifiedAt',
    description: 'Title of the table column (lastModifiedAt)',
    defaultMessage: 'Modified on',
  },
  columnMiddleName: {
    id: 'Customers.SearchList.column.middleName',
    description: 'Title of the table column (middleName)',
    defaultMessage: 'Middle name',
  },
  columnVatId: {
    id: 'Customers.SearchList.column.vatId',
    description: 'Title of the table column (vatId)',
    defaultMessage: 'VAT ID',
  },
  columnDateOfBirth: {
    id: 'Customers.SearchList.column.dateOfBirth',
    description: 'Title of the table column (dateOfBirth)',
    defaultMessage: 'Date of birth',
  },
  columnStores: {
    id: 'Customers.SearchList.column.stores',
    description: 'Title of the table column (stores)',
    defaultMessage: 'Store(s)',
  },
  removeCustomerSelection: {
    id: 'Orders.Create.Step.Customer.removeCustomerSelection',
    description: 'Label for the remove customer selection label',
    defaultMessage: 'Remove customer selection',
  },
  removeCustomerSelectionTooltip: {
    id: 'Orders.Create.Step.Customer.removeCustomerSelectionTooltip',
    description: 'Tooltip for the remove customer selection button',
    defaultMessage: 'Remove customer selection',
  },
});

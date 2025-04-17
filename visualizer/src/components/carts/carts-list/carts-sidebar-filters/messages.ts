import { defineMessages } from 'react-intl';

export default defineMessages({
  productTypeSearchInputPlaceholder: {
    id: 'Products.PimSearchList.SidebarFilter.ProductType.searchInputPlaceholder',
    description:
      'The placeholder text to show in Product Type Filter Search Input',
    defaultMessage: 'Search for a product type to filter',
  },
  productSelectionSearchInputPlaceholder: {
    id: 'Products.PimSearchList.SidebarFilter.ProductSelection.searchInputPlaceholder',
    description:
      'The placeholder text to show in Product Selection Filter Search Input',
    defaultMessage: 'Search for a product selection to filter',
  },
  categorySearchInputPlaceholder: {
    id: 'Products.PimSearchList.SidebarFilter.Category.searchInputPlaceholder',
    description: 'The placeholder text to show in Category Filter Search Input',
    defaultMessage: 'Search by name, externalID...',
  },
  stateSearchInputPlaceholder: {
    id: 'Products.PimSearchList.SidebarFilter.StateFilter.searchInputPlaceholder',
    description: 'The placeholder text to show in State Filter Search Input',
    defaultMessage: 'Search for a state to filter',
  },
  textOrEnumSearchInputPlaceholder: {
    id: 'Products.PimSearchList.SidebarFilter.StateFilter.textOrEnumSearchInputPlaceholder',
    description:
      'The placeholder text to show in Text or Enum Attribute Filter Search Input',
    defaultMessage: 'Search for a value to filter',
  },
  noOptionsMessage: {
    id: 'Products.PimSearchList.SidebarFilter.ProductType.noOptionsMessage',
    description:
      'Message to show in a Product Type dropdown it has no items to choose from',
    defaultMessage: 'No options',
  },
  emptyRangeInputValidationMessage: {
    id: 'Products.PimSearchList.SidebarFilter.emptyRangeInputValidationMessage',
    description: 'Error message when both inputs for a range filter are null',
    defaultMessage: 'Please enter a value in an input',
  },
  duplicateRangeInputValidationMessage: {
    id: 'Products.PimSearchList.SidebarFilter.duplicateRangeInputValidationMessage',
    description:
      'Error message when both inputs for a range filter are the same',
    defaultMessage: 'Please enter different values for "from" and "to" inputs',
  },
  removeEntireFilter: {
    id: 'Products.PimSearchList.SidebarFilter.removeEntireFilter',
    description: 'Label for button that remove entire filter',
    defaultMessage: 'Remove entire filter',
  },
  removeFilterOption: {
    id: 'Products.PimSearchList.SidebarFilter.removeFilterOption',
    description: 'Label for button that removes filter option',
    defaultMessage: 'Remove filter value',
  },
  removeOptionWarningTooltip: {
    id: 'Products.PimSearchList.SidebarFilter.removeOptionWarningTooltip',
    description:
      'Description of the warning icon that is shown next to applied options',
    defaultMessage: 'Filter value currently applied',
  },
  removeAppliedOptionWarningHeader: {
    id: 'Products.PimSearchList.SidebarFilter.removeAppliedOptionWarningHeader',
    description:
      'Header of the message that is shown when attempted to remove an applied filter option',
    defaultMessage: 'Edit filter sidebar',
  },
  removeAppliedOptionWarning: {
    id: 'Products.PimSearchList.SidebarFilter.removeAppliedOptionWarning',
    description:
      'Message that is shown when attempted to remove an applied filter option',
    defaultMessage: `You are about to remove the currently applied filter value "{option}" from the filter "{filter}"! Are you sure you would like to proceed?`,
  },
  removeAppliedFilterWarning: {
    id: 'Products.PimSearchList.SidebarFilter.removeAppliedFilterWarning',
    description:
      'Message that is shown when attempted to remove a filter with applied options',
    defaultMessage: `You're about to remove the filter "{filter}" that currently has filter values applied. Are you sure you would like to proceed?`,
  },
  removeFilterWarningTooltip: {
    id: 'Products.PimSearchList.SidebarFilter.removeFilterWarningTooltip',
    description:
      'Description of the warning icon that is shown next to a filter with applied options',
    defaultMessage: 'Filter currently applied',
  },
  allFiltersRemoved: {
    id: 'Products.PimSearchList.SidebarFilter.allFiltersRemoved',
    description:
      'Message that is shown when all the filters are removed in edit mode',
    defaultMessage: 'All filters removed',
  },
  // Reused the same messages to keep it uniform with sidebar filter titles.
  productTypes: {
    id: 'Products.PimSearchList.SidebarFilter.productTypeHeader',
    description: 'The name of the Sidebar section with ProductType filter',
    defaultMessage: 'Product Type',
  },
  productSelections: {
    id: 'Products.PimSearchList.SidebarFilter.productSelectionHeader',
    description:
      'The name of the Sidebar section with Product Selection filter',
    defaultMessage: 'Product Selections',
  },
  categories: {
    id: 'Products.PimSearchList.SidebarFilter.categoryHeader',
    description: 'The name of the Sidebar section with Category filter',
    defaultMessage: 'Category',
  },
  statuses: {
    id: 'Products.PimSearchList.SidebarFilter.statusHeader',
    description: 'The name of the Sidebar section with Status filter',
    defaultMessage: 'Status',
  },
  states: {
    id: 'Products.PimSearchList.SidebarFilter.stateHeader',
    description: 'The name of the Sidebar section with State filter',
    defaultMessage: 'State',
  },
  lastModifiedAt: {
    id: 'Products.PimSearchList.SidebarFilter.lastModifiedAtHeader',
    description: 'Header for LastModifiedAt filter section',
    defaultMessage: 'Last modified at',
  },
  createdAt: {
    id: 'Products.PimSearchList.SidebarFilter.createdAtHeader',
    description: 'Header for createdAt filter type',
    defaultMessage: 'Created At',
  },
  inventoryPerVariant: {
    id: 'Products.PimSearchList.SidebarFilter.inventoryPerVariantHeader',
    description:
      'The name of the Sidebar section with Inventory per variant filter',
    defaultMessage: 'Inventory per variant',
  },
  emptyFilterSidebarMessage: {
    id: 'Products.PimSearchList.SidebarFilter.emptyFilterSidebarMessage',
    description: 'Message to show when no filters are selected',
    defaultMessage:
      'There are currently no filters selected. {br} Add a filter to this sidebar.',
  },
});

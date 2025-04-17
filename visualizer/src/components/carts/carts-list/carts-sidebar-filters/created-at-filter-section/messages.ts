import { defineMessages } from 'react-intl';

export default defineMessages({
  createdAtHeader: {
    id: 'Products.PimSearchList.SidebarFilter.createdAtHeader',
    description: 'Header for createdAt filter type',
    defaultMessage: 'Created At',
  },
  fromCreatedAtLabel: {
    id: 'Products.PimSearchList.SidebarFilter.fromCreatedAtLabel',
    description:
      'The message to show to user for selecting "from" value for createdAt',
    defaultMessage: 'From (including)',
  },
  fromCreatedAtLabelWithoutRange: {
    id: 'Products.PimSearchList.SidebarFilter.fromCreatedAtLabelWithoutRange',
    description:
      'The message to show to user for selecting "at" value for createdAt',
    defaultMessage: 'At',
  },
  fromCreatedAtPlaceholder: {
    id: 'Products.PimSearchList.SidebarFilter.fromCreatedAtPlaceholder',
    description: 'The placeholder for the "from" createdAt input',
    defaultMessage: 'Oldest date/time (if needed)',
  },
  fromCreatedAtPlaceholderWithoutRange: {
    id: 'Products.PimSearchList.SidebarFilter.fromCreatedAtPlaceholderWithoutRange',
    description:
      'The placeholder for the "from" date input when searching for a single createdAt',
    defaultMessage: 'Choose createdAt',
  },
  toCreatedAtLabel: {
    id: 'Products.PimSearchList.SidebarFilter.toCreatedAtLabel',
    description:
      'The message to show to user for selecting "from" value for createdAt',
    defaultMessage: 'To (including)',
  },
  toCreatedAtPlaceholder: {
    id: 'Products.PimSearchList.SidebarFilter.toCreatedAtPlaceholder',
    description: 'The placeholder for the "to" createdAt input',
    defaultMessage: 'Newest date/time (if needed)',
  },
  searchByCreatedAtRangeOption: {
    id: 'Products.PimSearchList.SidebarFilter.searchByCreatedAtRangeOption',
    description:
      'The message to show to user for choosing to search within a range of two createdAt values instead of "from" one value',
    defaultMessage: 'Search by range',
  },
  applyCreatedAtValue: {
    id: 'Products.PimSearchList.SidebarFilter.applyCreatedAtValue',
    description:
      'Label for button for user to submit createdAt value to filter by',
    defaultMessage: 'Apply value',
  },
  applyCreatedAtValues: {
    id: 'Products.PimSearchList.SidebarFilter.applyCreatedAtValues',
    description:
      'Label for button for user to submit createdAt values to filter by',
    defaultMessage: 'Apply values',
  },
  recentCreatedAtFilterLabelRange: {
    id: 'Products.PimSearchList.SidebarFilter.recentCreatedAtFilterLabelRange',
    description:
      'Label for checkbox for recently applied Date Filters when there is a range defined',
    defaultMessage: 'From {from} to {to}',
  },
  recentCreatedAtFilterLabelNoMinimum: {
    id: 'Products.PimSearchList.SidebarFilter.recentCreatedAtFilterLabelNoMinimum',
    description:
      'Label for checkbox for recently applied createdAt Filters when there is no minimum value defined',
    defaultMessage: 'Until (including) {to}',
  },
  recentCreatedAtFilterLabelNoMaximum: {
    id: 'Products.PimSearchList.SidebarFilter.recentCreatedAtFilterLabelNoMaximum',
    description:
      'Label for checkbox for recently applied createdAt Filters when there is no maximum value defined',
    defaultMessage: 'From (including) {from}',
  },
  recentCreatedAtFilterLabelNoRange: {
    id: 'Products.PimSearchList.SidebarFilter.recentCreatedAtFilterLabelNoRange',
    description:
      'Label for checkbox for recently applied createdAt Filters for a single date',
    defaultMessage: 'At {at}',
  },
});

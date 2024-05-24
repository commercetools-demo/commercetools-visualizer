import { defineMessages } from 'react-intl';

export default defineMessages({
  currencyTitle: {
    id: 'cart.form.currency.title',
    description: 'Title for currency field',
    defaultMessage: 'Currency',
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
});

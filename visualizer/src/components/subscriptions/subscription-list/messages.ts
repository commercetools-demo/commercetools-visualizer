import { defineMessages } from 'react-intl';

export default defineMessages<string>({
  noResults: {
    id: 'Subscriptions.noResults',
    defaultMessage: 'There are no subscriptions available in this project.',
  },
  title: {
    id: 'Subscriptions.title',
    defaultMessage: 'Subscriptions',
  },
  subscriptionUpdated: {
    id: 'Subscriptions.subscriptionUpdated',
    defaultMessage: 'Subscription {subscriptionKey} updated',
  },
  subscriptionAdd: {
    id: 'Subscriptions.subscriptionAdd',
    defaultMessage: 'Add new Subscription',
  },
  columnKey: {
    id: 'Subscriptions.columnKey',
    defaultMessage: 'Key',
  },
  columnVersion: {
    id: 'Subscriptions.columnVersion',
    defaultMessage: 'Version',
  },
  columnCreatedAt: {
    id: 'Subscriptions.columnCreatedAt',
    defaultMessage: 'Created At',
  },
  columnDestinationType: {
    id: 'Subscriptions.columnDestinationType',
    defaultMessage: 'Destination Type',
  },
});

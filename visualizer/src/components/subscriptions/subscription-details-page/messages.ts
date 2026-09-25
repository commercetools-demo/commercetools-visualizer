import { defineMessages } from 'react-intl';

export default defineMessages<string>({
  noResults: {
    id: 'Subscriptions.noResults',
    defaultMessage: 'There are no subscriptions available in this project.',
  },
  subscriptionKeyLabel: {
    id: 'Subscriptions.subscriptionKeyLabel',
    defaultMessage: 'Subscription key',
  },
  title: {
    id: 'Subscriptions.title',
    defaultMessage: 'Subscriptions',
  },
  subscriptionUpdated: {
    id: 'Subscriptions.subscriptionUpdated',
    defaultMessage: 'Subscription {subscriptionKey} updated',
  },
  subscriptionCreated: {
    id: 'Subscriptions.subscriptionCreated',
    defaultMessage: 'Subscription {subscriptionKey} created',
  },
  subscriptionAdd: {
    id: 'Subscriptions.subscriptionAdd',
    defaultMessage: 'Add new Subscription',
  },
  revertButton: {
    id: 'Subscriptions.revertButton',
    defaultMessage: 'Revert',
  },
  saveButton: {
    id: 'Subscriptions.saveButton',
    defaultMessage: 'Save',
  },
  deleteButton: {
    id: 'Subscriptions.deleteButton',
    defaultMessage: 'Delete',
  },
  formActionsLabel: {
    id: 'Subscriptions.formActionsLabel',
    description: 'Accessible label for the form action button group',
    defaultMessage: 'Form actions',
  },
});

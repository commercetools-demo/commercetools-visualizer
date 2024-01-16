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
  stepKey: {
    id: 'Subscriptions.CreateSubscriptionForm.step.key',
    description: 'The label of the tab navigation step',
    defaultMessage: 'Set key',
  },
  stepSelectProvider: {
    id: 'Subscriptions.CreateSubscriptionForm.step.select.provider',
    description: 'The label of the tab navigation step',
    defaultMessage: 'Select Provider',
  },
  stepConfigureProvider: {
    id: 'Subscriptions.CreateSubscriptionForm.step.configure.provider',
    description: 'The label of the tab navigation step',
    defaultMessage: 'Configure Provider',
  },
  stepChanges: {
    id: 'Subscriptions.CreateSubscriptionForm.step.changes',
    description: 'The label of the tab navigation step',
    defaultMessage: 'Configure Changes',
  },
  stepMessages: {
    id: 'Subscriptions.CreateSubscriptionForm.step.messages',
    description: 'The label of the tab navigation step',
    defaultMessage: 'Configure Messages',
  },
});

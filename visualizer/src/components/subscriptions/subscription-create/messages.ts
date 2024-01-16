import { defineMessages } from 'react-intl';

export default defineMessages<string>({
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
    defaultMessage: 'Configure MessageSelector',
  },
  subscriptionCreated: {
    id: 'Subscriptions.subscriptionCreated',
    defaultMessage: 'Subscription {subscriptionKey} created',
  },
  subscriptionAdd: {
    id: 'Subscriptions.subscriptionAdd',
    defaultMessage: 'Add new Subscription',
  },
});

import { defineMessages } from 'react-intl';

export default defineMessages<string>({
  subscriptionCreated: {
    id: 'Subscriptions.subscriptionCreated',
    defaultMessage: 'Subscription {subscriptionKey} created',
  },
  subscriptionAdd: {
    id: 'Subscriptions.subscriptionAdd',
    defaultMessage: 'Add new Subscription',
  },
  backToSubscriptions: {
    id: 'Subscriptions.CreateSubscriptionForm.backToSubscriptions',
    description: 'The back link label to return to the subscriptions list',
    defaultMessage: 'Back to subscriptions',
  },
  cancelButton: {
    id: 'Subscriptions.CreateSubscriptionForm.cancelButton',
    defaultMessage: 'Cancel',
  },
  createButton: {
    id: 'Subscriptions.CreateSubscriptionForm.createButton',
    defaultMessage: 'Create',
  },
  formActionsLabel: {
    id: 'Subscriptions.formActionsLabel',
    description: 'Accessible label for the form action button group',
    defaultMessage: 'Form actions',
  },
});

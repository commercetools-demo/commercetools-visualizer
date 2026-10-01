import { defineMessages } from 'react-intl';

export default defineMessages({
  messagesLabel: {
    id: 'SubscriptionMessagesForm.messagesLabel',
    description: 'messageLabel',
    defaultMessage: 'Choose Messages you want to listen to.',
  },

  resourceTypeLabel: {
    id: 'resourceTypeLabel',
    description: 'resourceTypeLabel',
    defaultMessage: `Messages related to type {label} ({amount}).`,
  },
  allTypesLabel: {
    id: 'SubscriptionMessagesForm.allTypesLabel',
    description:
      'Checkbox subscribing to every message of a resource (an entry without types)',
    defaultMessage: 'Receive all messages of {label}',
  },
});

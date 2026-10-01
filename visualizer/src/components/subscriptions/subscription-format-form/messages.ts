import { defineMessages } from 'react-intl';

export default defineMessages({
  formatLabel: {
    id: 'SubscriptionFormatForm.formatLabel',
    description: 'Label of the delivery format select',
    defaultMessage: 'Delivery format',
  },
  formatDescription: {
    id: 'SubscriptionFormatForm.formatDescription',
    description: 'Description of the delivery format select',
    defaultMessage:
      'Format in which notifications are delivered. It cannot be changed after the subscription is created.',
  },
  formatPlatform: {
    id: 'SubscriptionFormatForm.formatPlatform',
    description: 'The Platform delivery format option',
    defaultMessage: 'Platform',
  },
  formatCloudEvents: {
    id: 'SubscriptionFormatForm.formatCloudEvents',
    description: 'The CloudEvents delivery format option',
    defaultMessage: 'CloudEvents',
  },
  cloudEventsVersionLabel: {
    id: 'SubscriptionFormatForm.cloudEventsVersionLabel',
    description: 'Label of the CloudEvents version input',
    defaultMessage: 'CloudEvents specification version',
  },
  cloudEventsVersionRequired: {
    id: 'SubscriptionFormatForm.cloudEventsVersionRequired',
    description: 'Error when the CloudEvents version is empty',
    defaultMessage: 'This field is required. Provide at least one value.',
  },
});

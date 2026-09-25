import { defineMessages } from 'react-intl';

export default defineMessages({
  subscriptionKeyLabel: {
    id: 'Subscriptions.GeneralInfoForm.keyFieldLabel',
    description:
      'The label for the subscription key field in general info form',
    defaultMessage: 'Subscription key',
  },
  duplicateKey: {
    id: 'Subscriptions.GeneralInfoForm.duplicateKey',
    description: 'The message shown when the subscription key already exists',
    defaultMessage: 'A subscription with this key already exists.',
  },
  requiredKey: {
    id: 'Subscriptions.GeneralInfoForm.requiredKey',
    description: 'The message shown when the subscription key is not provided',
    defaultMessage: 'This field is required. Provide at least one value.',
  },
  invalidKey: {
    id: 'Subscriptions.GeneralInfoForm.invalidKey',
    description:
      'The message shown when the subscription key has invalid characters',
    defaultMessage:
      'Key must contain between 2 and 256 alphanumeric characters, underscores and/or hyphens',
  },
});

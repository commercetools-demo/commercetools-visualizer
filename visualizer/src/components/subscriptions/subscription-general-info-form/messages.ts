import { defineMessages } from 'react-intl';

export default defineMessages({
  generalInformationHeader: {
    id: 'Customers.BusinessUnits.GeneralInfoForm.generalInformationHeader',
    description: 'The header for the collapsible general info panel',
    defaultMessage: 'General information',
  },
  subscriptionKeyLabel: {
    id: 'Customers.BusinessUnits.GeneralInfoForm.keyFieldLabel',
    description:
      'The label for the business unit key field in general info form',
    defaultMessage: 'Subscription key',
  },
  duplicateKey: {
    id: 'Customers.BusinessUnits.GeneralInfoForm.duplicateKey',
    description: 'The message shown when the business unit key already exists',
    defaultMessage: 'A subscription with this key already exists.',
  },
  requiredKey: {
    id: 'Customers.BusinessUnits.GeneralInfoForm.requiredKey',
    description: 'The message shown when the business unit key is not provided',
    defaultMessage: 'This field is required. Provide at least one value.',
  },
  invalidKey: {
    id: 'Customers.BusinessUnits.GeneralInfoForm.invalidKey',
    description:
      'The message shown when the business unit key has invalid characters',
    defaultMessage:
      'Key must contain between 2 and 256 alphanumeric characters, underscores and/or hyphens',
  },
});

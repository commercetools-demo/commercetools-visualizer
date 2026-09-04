import { defineMessages } from 'react-intl';

export default defineMessages({
  generalInformationTitle: {
    id: 'Type.form.panel.general.title',
    description: 'Title for general information panel',
    defaultMessage: 'General Information',
  },
  keyTitle: {
    id: 'Type.form.key.title',
    description: 'Title for key field',
    defaultMessage: 'Key',
  },
  keyHint: {
    id: 'Type.form.key.hint',
    description: 'Hint for key field',
    defaultMessage:
      'May only contain between 2 and 256 alphanumeric characters, underscores, or hyphens (no spaces or special characters like ñ, ü, #, %).',
  },
  duplicateKey: {
    id: 'Type.form.GeneralInfoForm.duplicateKey',
    description: 'The message shown when the business unit key already exists',
    defaultMessage: 'A subscription with this key already exists.',
  },
  requiredKey: {
    id: 'Type.form.GeneralInfoForm.requiredKey',
    description: 'The message shown when the business unit key is not provided',
    defaultMessage: 'This field is required. Provide at least one value.',
  },
  invalidKey: {
    id: 'Type.form.GeneralInfoForm.invalidKey',
    description:
      'The message shown when the business unit key has invalid characters',
    defaultMessage:
      'Key must contain between 2 and 256 alphanumeric characters, underscores and/or hyphens',
  },
  destinationLabel: {
    id: 'Subscription.Destination.destinationLabel',
    description: 'destinationLabel',
    defaultMessage: 'Destination',
  },
  destinationDescription: {
    id: 'Subscription.Destination.destinationDescription',
    description: 'destinationDescription',
    defaultMessage: 'Messaging service to which the messages are sent.',
  },
  destinationHTTP: {
    id: 'Extension.Destination.destinationHTTP',
    description: 'destinationHTTP',
    defaultMessage: 'HTTP',
  },
  destinationGoogleCloudFunction: {
    id: 'Extension.Destination.destinationGoogleCloudFunction',
    description: 'destinationGoogleCloudFunction',
    defaultMessage: 'Google Cloud Function',
  },
  destinationAWSLambda: {
    id: 'Extension.Destination.destinationAWSLambda',
    description: 'destinationAWSLambda',
    defaultMessage: 'AWS Lambda',
  },
  destinationTitle: {
    id: 'Extension.form.panel.destination.title',
    description: 'Title for destination panel',
    defaultMessage: 'Destination',
  },
  triggersTitle: {
    id: 'Extension.form.panel.triggers.title',
    description: 'Title for triggers panel',
    defaultMessage: 'Triggers',
  },
  submitButton: {
    id: 'Extension.form.button.submit',
    description: 'Label for submit button',
    defaultMessage: 'Save',
  },
  revertButton: {
    id: 'Extension.form.button.revert',
    description: 'Label for revert button',
    defaultMessage: 'Revert',
  },
  cancelButton: {
    id: 'Extension.form.button.cancel',
    description: 'Label for cancel button',
    defaultMessage: 'Cancel',
  },
  deleteButton: {
    id: 'Extension.form.button.delete',
    description: 'Label for delete button',
    defaultMessage: 'Delete',
  },
  requiredFieldError: {
    id: 'Extension.form.error.required',
    description: 'The error message for required fields',
    defaultMessage: 'This field is required. Provide a value.',
  },
});

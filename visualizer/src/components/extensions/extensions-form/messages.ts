import { defineMessages } from 'react-intl';

export default defineMessages({
  generalInformationTitle: {
    id: 'Extension.form.panel.general.title',
    description: 'Title for general information panel',
    defaultMessage: 'General Information',
  },
  keyTitle: {
    id: 'Extension.form.key.title',
    description: 'Title for key field',
    defaultMessage: 'Extension Key',
  },
  destinationLabel: {
    id: 'Extension.Destination.destinationLabel',
    description: 'destinationLabel',
    defaultMessage: 'Destination',
  },
  destinationDescription: {
    id: 'Extension.Destination.destinationDescription',
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
    defaultMessage: 'Extension Destination',
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

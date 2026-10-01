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
  timeoutLabel: {
    id: 'Extension.form.timeout.label',
    description: 'Label of the timeout field',
    defaultMessage: 'Timeout (ms)',
  },
  timeoutDescription: {
    id: 'Extension.form.timeout.description',
    description: 'Description of the timeout field',
    defaultMessage:
      'Maximum time in milliseconds the Extension may take to respond. Leave empty to use the default (2000 ms). The API limits it to 10000 ms unless the limit was raised for your project.',
  },
  includeOldResourceLabel: {
    id: 'Extension.form.includeOldResource.label',
    description: 'Label of the includeOldResource checkbox',
    defaultMessage:
      'Include the previous resource state (oldResource) in the payload',
  },
  includeOldResourceDescription: {
    id: 'Extension.form.includeOldResource.description',
    description: 'Description of the includeOldResource checkbox',
    defaultMessage: 'Only applies to Update actions.',
  },
  expansionPathsTitle: {
    id: 'Extension.form.expansionPaths.title',
    description: 'Accordion header of the expansion paths section',
    defaultMessage: 'Expansion Paths',
  },
  dependenciesTitle: {
    id: 'Extension.form.dependencies.title',
    description: 'Accordion header of the dependencies section',
    defaultMessage: 'Dependencies',
  },
  timeoutInvalid: {
    id: 'Extension.form.timeout.invalid',
    description: 'Error when the timeout is not a positive whole number',
    defaultMessage: 'Enter a whole number of milliseconds greater than 0.',
  },
  requiredFieldError: {
    id: 'Extension.form.error.required',
    description: 'The error message for required fields',
    defaultMessage: 'This field is required. Provide a value.',
  },
});

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
  containerTitle: {
    id: 'Type.form.key.title',
    description: 'Title for key field',
    defaultMessage: 'Container',
  },
  containerValue: {
    id: 'Type.form.key.title',
    description: 'Title for key field',
    defaultMessage: 'Value',
  },
  submitButton: {
    id: 'CustomObject.form.button.submit',
    description: 'Label for submit button',
    defaultMessage: 'Save',
  },
  revertButton: {
    id: 'CustomObject.form.button.revert',
    description: 'Label for revert button',
    defaultMessage: 'Revert',
  },
  cancelButton: {
    id: 'CustomObject.form.button.cancel',
    description: 'Label for cancel button',
    defaultMessage: 'Cancel',
  },
  deleteButton: {
    id: 'CustomObject.form.button.delete',
    description: 'Label for delete button',
    defaultMessage: 'Delete',
  },
  requiredFieldError: {
    id: 'CustomObject.form.error.required',
    description: 'The error message for required fields',
    defaultMessage: 'This field is required. Provide a value.',
  },
});

import { defineMessages } from 'react-intl';

export default defineMessages({
  modalTitle: {
    id: 'FieldDefinitions.Details.modalTitle',
    description: 'The title of the modal for field definition (details)',
    defaultMessage: 'Field Definition Details',
  },
  updateButton: {
    id: 'FieldDefinitions.Details.updateButton',
    description: 'Submit button label',
    defaultMessage: 'Update Field Definition',
  },
  newButton: {
    id: 'FieldDefinitions.Details.newButton',
    description: 'Submit button label',
    defaultMessage: 'Create Field Definition',
  },
  revert: {
    id: 'FieldDefinitions.Details.revert',
    description: 'Revert Changes',
    defaultMessage: 'Revert Changes',
  },
  requiredFieldError: {
    id: 'FieldDefinitions.form.error.required',
    description: 'The error message for required fields',
    defaultMessage: 'This field is required. Provide a value.',
  },
  nameTitle: {
    id: 'FieldForm.name.title',
    description: 'Title for fieldDefinitions name field',
    defaultMessage: 'Field Name',
  },
  nameHint: {
    id: 'FieldForm.name.hint',
    description: 'Hint for fieldDefinitions name field',
    defaultMessage:
      'The field name is a unique term used to identify this field.  Min 2, Max 36 alphanumeric characters (a-z, 0-9), hyphens (-) and underscores (_) allowed, no spaces possible.',
  },
  labelTitle: {
    id: 'FieldForm.label.title',
    description: 'Title for fieldDefinitions label field',
    defaultMessage: 'Label',
  },
  typeTitle: {
    id: 'FieldForm.type.title',
    description: 'Title for fieldDefinitions type field',
    defaultMessage: 'Type',
  },
  inputHintTitle: {
    id: 'FieldForm.inputHint.title',
    description: 'Title for fieldDefinitions inputHint field',
    defaultMessage: 'Input Hint',
  },
  requiredTitle: {
    id: 'FieldForm.required.title',
    description: 'Title for fieldDefinitions required field',
    defaultMessage: 'Required Field',
  },
  setTitle: {
    id: 'FieldForm.isSet.title',
    description: 'Title for fieldDefinitions isSet field',
    defaultMessage: 'Set',
  },
  referenceTitle: {
    id: 'FieldForm.reference.title',
    description: 'Title for fieldDefinitions reference field',
    defaultMessage: 'Reference Type',
  },
  fieldDefinitionUpdated: {
    id: 'FieldForm.updated.title',
    description: 'Message for fieldDefinitions update action',
    defaultMessage: 'Field Definition updated',
  },
});

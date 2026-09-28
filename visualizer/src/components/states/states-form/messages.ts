import { defineMessages } from 'react-intl';

export default defineMessages({
  generalInformationTitle: {
    id: 'State.form.panel.general.title',
    description: 'Title for general information panel',
    defaultMessage: 'General Information',
  },
  nameTitle: {
    id: 'State.form.name.title',
    description: 'Title for fieldDefinitions name field',
    defaultMessage: 'Name',
  },
  descriptionTitle: {
    id: 'State.form.description.title',
    description: 'Description for fieldDefinitions description field',
    defaultMessage: 'Description',
  },
  keyTitle: {
    id: 'State.form.key.title',
    description: 'Title for key field',
    defaultMessage: 'Key',
  },
  stateTypeTitle: {
    id: 'State.form.stateType.title',
    description: 'Title for State Type ID field',
    defaultMessage: 'State Type',
  },
  transitionsHint: {
    id: 'State.form.transitions.hint',
    description: 'Hint for the transitions field',
    defaultMessage:
      'The states this state is allowed to move to. Leave empty to make this a final state (no further transitions). This is one-directional — add this state to the other state as well if you need a two-way transition.',
  },
  initialTitle: {
    id: 'State.form.initial.title',
    description: 'Label for the initial state checkbox',
    defaultMessage: 'Set as initial state',
  },
  initialHint: {
    id: 'State.form.initial.hint',
    description: 'Explanation of what the initial state checkbox does',
    defaultMessage:
      'Initial states are automatically assigned to a resource when it is created. Leave unchecked if this State is a later step in the workflow.',
  },
  transitionsTitle: {
    id: 'State.form.transitions.title',
    description: 'Title for transitions field',
    defaultMessage: 'Transitions',
  },
  requiredFieldError: {
    id: 'State.form.error.required',
    description: 'The error message for required fields',
    defaultMessage: 'This field is required. Provide a value.',
  },
  submitButton: {
    id: 'State.form.button.submit',
    description: 'Label for submit button',
    defaultMessage: 'Save',
  },
  revertButton: {
    id: 'State.form.button.revert',
    description: 'Label for revert button',
    defaultMessage: 'Revert',
  },
  cancelButton: {
    id: 'State.form.button.cancel',
    description: 'Label for cancel button',
    defaultMessage: 'Cancel',
  },
  deleteButton: {
    id: 'State.form.button.delete',
    description: 'Label for delete button',
    defaultMessage: 'Delete',
  },
});

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
  keyHint: {
    id: 'State.form.key.hint',
    description: 'Hint for key field',
    defaultMessage:
      'May only contain between 2 and 256 alphanumeric characters, underscores, or hyphens (no spaces or special characters like ñ, ü, #, %).',
  },
  duplicateKey: {
    id: 'State.form.GeneralInfoForm.duplicateKey',
    description: 'The message shown when the state key already exists',
    defaultMessage: 'A state with this key already exists.',
  },
  requiredKey: {
    id: 'State.form.GeneralInfoForm.requiredKey',
    description: 'The message shown when the business unit key is not provided',
    defaultMessage: 'This field is required. Provide at least one value.',
  },
  invalidKey: {
    id: 'State.form.GeneralInfoForm.invalidKey',
    description:
      'The message shown when the business unit key has invalid characters',
    defaultMessage:
      'Key must contain between 2 and 256 alphanumeric characters, underscores and/or hyphens',
  },
  stateTypeTitle: {
    id: 'State.form.stateType.title',
    description: 'Title for State Type ID field',
    defaultMessage: 'State Type',
  },
  transitionsTitle: {
    id: 'State.form.transitions.title',
    description: 'Title for the transitions field',
    defaultMessage: 'Transitions to',
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
});

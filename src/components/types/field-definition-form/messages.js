import { defineMessages } from 'react-intl';

export default defineMessages({
  nameTitle: {
    id: 'FieldForm.name.title',
    description: 'Title for fieldDefinitions name field',
    defaultMessage: 'Field Name',
  },
  nameHint: {
    id: 'FieldForm.name.hint',
    description: 'Hint for fieldDefinitions name field',
    defaultMessage: 'The field name is a unique term used to identify this field.  Min 2, Max 36 alphanumeric characters (a-z, 0-9), hyphens (-) and underscores (_) allowed, no spaces possible.',
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
});

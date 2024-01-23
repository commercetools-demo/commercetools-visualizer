import { defineMessages } from 'react-intl';

export default defineMessages({
  generalInformationTitle: {
    id: 'Type.form.panel.general.title',
    description: 'Title for general information panel',
    defaultMessage: 'General Information',
  },
  typeInformationTitle: {
    id: 'Type.form.panel.type.title',
    description: 'Title for type information panel',
    defaultMessage: 'Field Definitions',
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
  resourceTypeIdsTitle: {
    id: 'Type.form.resourceTypeIds.title',
    description: 'Title for Resource Type IDs field',
    defaultMessage: 'Resource Type IDs',
  },
  fieldsTitle: {
    id: 'Type.form.fieldDefinitions.title',
    description: 'Title for fieldDefinitions field',
    defaultMessage: 'fieldDefinitions',
  },
  addFieldDefinitionButton: {
    id: 'Type.form.button.addFieldDefinition',
    description: 'Label for add field button',
    defaultMessage: 'Add FieldDefinition',
  },
  removeFieldDefinitionButton: {
    id: 'Type.form.button.removeFieldDefinition',
    description: 'Label for remove field button',
    defaultMessage: 'Remove FieldDefinition',
  },
  nameTitle: {
    id: 'Type.form.name.title',
    description: 'Title for fieldDefinitions name field',
    defaultMessage: 'Name',
  },
  descriptionTitle: {
    id: 'Type.form.description.title',
    description: 'Description for fieldDefinitions description field',
    defaultMessage: 'Description',
  },
  labelTitle: {
    id: 'Type.form.label.title',
    description: 'Title for fieldDefinitions label field',
    defaultMessage: 'Label',
  },
  typeTitle: {
    id: 'Type.form.type.title',
    description: 'Title for fieldDefinitions type field',
    defaultMessage: 'Type',
  },
  stringLabel: {
    id: 'Type.form.type.label.string',
    description: 'Label for fieldDefinitions string value',
    defaultMessage: 'Text',
  },
  localizedStringLabel: {
    id: 'Type.form.type.label.i18nString',
    description: 'Label for fieldDefinitions string value',
    defaultMessage: 'Localized Text',
  },
  numberLabel: {
    id: 'Type.form.type.label.number',
    description: 'Label for fieldDefinitions number value',
    defaultMessage: 'Number',
  },
  booleanLabel: {
    id: 'Type.form.type.label.boolean',
    description: 'Label for fieldDefinitions boolean value',
    defaultMessage: 'Boolean',
  },
  moneyLabel: {
    id: 'Type.form.type.label.money',
    description: 'Label for fieldDefinitions money value',
    defaultMessage: 'Money',
  },
  dateLabel: {
    id: 'Type.form.type.label.date',
    description: 'Label for fieldDefinitions date value',
    defaultMessage: 'Date',
  },
  timeLabel: {
    id: 'Type.form.type.label.time',
    description: 'Label for fieldDefinitions time value',
    defaultMessage: 'Time',
  },
  dateTimeLabel: {
    id: 'Type.form.type.label.dateTime',
    description: 'Label for fieldDefinitions date time value',
    defaultMessage: 'Date and Time',
  },
  enumLabel: {
    id: 'Type.form.type.label.enum',
    description: 'Label for fieldDefinitions enum value',
    defaultMessage: 'List (enum)',
  },
  localizedEnumLabel: {
    id: 'Type.form.type.label.i18nEnum',
    description: 'Label for fieldDefinitions localized enum value',
    defaultMessage: 'Localized List (enum)',
  },
  objectLabel: {
    id: 'Type.form.type.label.object',
    description: 'Label for fieldDefinitions object value',
    defaultMessage: 'Object',
  },
  referenceLabel: {
    id: 'Type.form.type.label.reference',
    description: 'Label for fieldDefinitions reference value',
    defaultMessage: 'Reference',
  },
  fieldSettingsTitle: {
    id: 'Type.form.fieldSettings.title',
    description: 'Title for fieldDefinitions settings fields',
    defaultMessage: 'Field Definition Settings',
  },
  setTitle: {
    id: 'Type.form.set.title',
    description: 'Title for fieldDefinitions set field',
    defaultMessage: 'Set',
  },
  requiredTitle: {
    id: 'Type.form.required.title',
    description: 'Title for fieldDefinitions required field',
    defaultMessage: 'Required',
  },
  displayTitle: {
    id: 'Type.form.display.title',
    description: 'Title for fieldDefinitions display field',
    defaultMessage: 'Display in List',
  },
  objectFieldDefinitionsTitle: {
    id: 'Type.form.objectFieldDefinitions.title',
    description: 'Title for object fieldDefinitions fields',
    defaultMessage: 'Object fieldDefinitions: {name}',
  },
  referenceByTitle: {
    id: 'Type.form.reference.by.title',
    description: 'Title for reference by field',
    defaultMessage: 'Reference By',
  },
  referenceTypeTitle: {
    id: 'Type.form.reference.type.title',
    description: 'Title for reference type field',
    defaultMessage: 'Type of Reference',
  },
  referenceByHint: {
    id: 'Type.form.reference.hint',
    description: 'Hint for reference by field',
    defaultMessage: 'Reference by key does not support reference expansion.',
  },
  enumOptionsTitle: {
    id: 'Type.form.enumOptions.title',
    description: 'Title for enum options fields',
    defaultMessage: 'List Options',
  },
  keyLabel: {
    id: 'Type.form.enum.key.label',
    description: 'Label for enum key label',
    defaultMessage: 'Key',
  },
  labelLabel: {
    id: 'Type.form.enum.label.label',
    description: 'Label for enum label label', // ha ha
    defaultMessage: 'Label',
  },
  labelLocalizedLabel: {
    id: 'Type.form.enum.label.i18nLabel',
    description: 'Label for enum localized label label',
    defaultMessage: 'Label ({language})',
  },
  addLabel: {
    id: 'Type.form.add.button',
    description: 'Label for add button',
    defaultMessage: 'Add',
  },
  removeLabel: {
    id: 'Type.form.remove.button',
    description: 'Label for remove button',
    defaultMessage: 'Remove',
  },
  submitButton: {
    id: 'Type.form.button.submit',
    description: 'Label for submit button',
    defaultMessage: 'Save',
  },
  requiredFieldError: {
    id: 'Type.form.error.required',
    description: 'The error message for required fields',
    defaultMessage: 'This field is required. Provide a value.',
  },
});

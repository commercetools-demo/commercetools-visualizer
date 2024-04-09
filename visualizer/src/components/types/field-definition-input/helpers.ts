import {
  TEnumType,
  TEnumValueInput,
  TFieldDefinition,
  TFieldDefinitionInput,
  TFieldTypeInput,
  TLocalizedEnumType,
  TLocalizedEnumValueInput,
  TLocalizedStringItemInputType,
  TReferenceType,
  TSetType,
  TTextInputHint,
} from '../../../types/generated/ctp';
import LocalizedTextInput from '@commercetools-uikit/localized-text-input';
import {
  transformLocalizedFieldToLocalizedString,
  transformLocalizedStringToLocalizedField,
} from '@commercetools-frontend/l10n';
import { Fields } from './constants';
import {
  Item,
  LocalizedString,
} from '../field-definition-input-for-enum/constants';

export type TFormValues = {
  label: Record<string, string>;
  name: string;
  required?: boolean;
  isMultiLine: boolean;
  isLocalized: boolean;
  isSet: boolean;
  typeName: Fields;
  referenceTypeId: string;
  format: 'date' | 'datetime' | 'time';
  enumValues: Array<Item> | undefined;
};
export const fromFormValuesToTFieldDefinitionInput = (
  values: TFormValues
): TFieldDefinitionInput => {
  let type: TFieldTypeInput = { Boolean: {} };
  switch (values.typeName) {
    case 'Boolean': {
      type = { Boolean: {} };
      break;
    }
    case 'Date': {
      if (values.format === 'date') {
        type = { Date: {} };
      } else if (values.format === 'datetime') {
        type = { DateTime: {} };
      } else if (values.format === 'time') {
        type = { Time: {} };
      }
      break;
    }
    case 'Enum': {
      if (values.isLocalized) {
        const newValue: Array<TLocalizedEnumValueInput> =
          values.enumValues
            ?.filter((value) => value.key && value.key.trim().length > 0)
            .map((value) => {
              const label: Array<TLocalizedStringItemInputType> =
                transformLocalizedStringToLocalizedField(
                  LocalizedTextInput.omitEmptyTranslations(
                    value.label as LocalizedString
                  )
                ) || [];
              return { key: value.key || '', label: label };
            }) || [];
        type = { LocalizedEnum: { values: newValue } };
      } else {
        const newValue: Array<TEnumValueInput> =
          values.enumValues
            ?.filter(
              (value) => value.key && value.key.trim().length > 0 && value.label
            )
            .map((value) => {
              const label = value.label as string | undefined;
              return { key: value.key || '', label: label || '' };
            }) || [];
        type = { Enum: { values: newValue } };
      }
      break;
    }
    case 'Money': {
      type = { Money: {} };
      break;
    }
    case 'Number': {
      type = { Number: {} };
      break;
    }
    case 'Reference': {
      type = {
        Reference: {
          referenceTypeId: values.referenceTypeId,
        },
      };
      break;
    }
    case 'String': {
      if (values.isLocalized) {
        type = { LocalizedString: {} };
      } else {
        type = { String: {} };
      }
      break;
    }
  }
  if (values.isSet) {
    type = { Set: { elementType: type } };
  }

  const actionDraft: TFieldDefinitionInput = {
    name: values.name,
    required: values.required || false,
    inputHint: values.isMultiLine
      ? TTextInputHint.MultiLine
      : TTextInputHint.SingleLine,
    type: type,
    label: transformLocalizedStringToLocalizedField(
      LocalizedTextInput.omitEmptyTranslations(values.label)
    ),
  };
  return actionDraft;
};

export const initialValuesFromFieldDefinition = (
  fieldDefinition: TFieldDefinition | undefined,
  projectLanguages: Array<string>
): TFormValues => {
  let isLocalized = false;
  let isSet = false;
  let typeName = fieldDefinition?.type?.name || '';
  let format: 'date' | 'datetime' | 'time' = 'date';
  let enumValues: Array<Item> = [];

  if (fieldDefinition?.type?.name) {
    if (fieldDefinition?.type?.name === 'Set') {
      console.log(fieldDefinition?.type);
      const setType = fieldDefinition?.type as TSetType;
      isSet = true;
      typeName = setType.elementType.name;
    }
    if (typeName === 'DateTime') {
      format = 'datetime';
      typeName = 'Date';
    } else if (typeName === 'Time') {
      format = 'time';
      typeName = 'Date';
    } else if (typeName === 'Date') {
      format = 'date';
      typeName = 'Date';
    } else if (typeName === 'LocalizedEnum') {
      isLocalized = true;
      typeName = 'Enum';
      let type = fieldDefinition?.type as TLocalizedEnumType;
      enumValues = type.values.map(
        (value): Item => ({
          key: value.key,
          label: value.labelAllLocales.reduce(
            (a, v) => ({ ...a, [v.locale]: v.value }),
            {}
          ),
        })
      );
    } else if (typeName === 'Enum') {
      let type = fieldDefinition?.type as TEnumType;
      enumValues = type.values.map(
        (value): Item => ({ key: value.key, label: value.label })
      );
    } else if (typeName === 'LocalizedString') {
      isLocalized = true;
      typeName = 'String';
    }
  }

  return {
    label: LocalizedTextInput.createLocalizedString(
      projectLanguages,
      transformLocalizedFieldToLocalizedString(
        fieldDefinition?.labelAllLocales ?? []
      ) ?? {}
    ),
    name: fieldDefinition?.name || '',
    isMultiLine: (fieldDefinition?.inputHint || 'SingleLine') === 'MultiLine',
    format: format,
    isLocalized: isLocalized,
    typeName: typeName as Fields,
    referenceTypeId:
      typeName === 'Reference'
        ? (fieldDefinition?.type as TReferenceType).referenceTypeId
        : '',
    enumValues: enumValues,
    isSet: isSet,
  };
};

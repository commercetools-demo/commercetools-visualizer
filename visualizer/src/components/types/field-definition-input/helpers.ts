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
      console.log(values.enumValues);
      if (values.isLocalized) {
        const newValue: Array<TLocalizedEnumValueInput> =
          values.enumValues
            ?.filter((value) => value.key && value.key.trim().length > 0)
            .map((value) => {
              const label: Array<TLocalizedStringItemInputType> =
                Object.entries(value.label as LocalizedString).map(
                  ([key, value]) => ({ locale: key, value: value })
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
    // case 'Set': {
    //   type = { Set: {} };
    //   break;
    // }
    case 'String': {
      if (values.isLocalized) {
        type = { LocalizedString: {} };
      } else {
        type = { String: {} };
      }
      break;
    }
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
  let typeName: Fields = (fieldDefinition?.type?.name as Fields) || '';
  let format: 'date' | 'datetime' | 'time' = 'date';
  let enumValues: Array<Item> = [];
  if (fieldDefinition?.type?.name) {
    if (fieldDefinition?.type?.name === 'DateTime') {
      format = 'datetime';
      typeName = 'Date';
    } else if (fieldDefinition?.type?.name === 'Time') {
      format = 'time';
      typeName = 'Date';
    } else if (fieldDefinition?.type?.name === 'Date') {
      format = 'date';
      typeName = 'Date';
    } else if (fieldDefinition?.type?.name === 'LocalizedEnum') {
      isLocalized = true;
      typeName = 'Enum';
      let type = fieldDefinition.type as TLocalizedEnumType;
      enumValues = type.values.map(
        (value): Item => ({
          key: value.key,
          label: value.labelAllLocales.reduce(
            (a, v) => ({ ...a, [v.locale]: v.value }),
            {}
          ),
        })
      );
    } else if (fieldDefinition?.type?.name === 'Enum') {
      let type = fieldDefinition.type as TEnumType;
      enumValues = type.values.map(
        (value): Item => ({ key: value.key, label: value.label })
      );
    } else if (fieldDefinition?.type?.name === 'LocalizedString') {
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
    typeName: typeName,
    referenceTypeId:
      typeName === 'Reference'
        ? (fieldDefinition?.type as TReferenceType).referenceTypeId
        : '',
    enumValues: enumValues,
    // [
    //   { key: 'key1', label: 'label' }, //{ 'en-GB': 'engb' } },
    //   // { key: 'key2', label: { 'en-GB': 'engb' } },
    // ],
  };
};

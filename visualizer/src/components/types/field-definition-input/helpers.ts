import {
  TFieldDefinition,
  TFieldDefinitionInput,
  TFieldTypeInput,
  TReferenceType,
  TTextInputHint,
} from '../../../types/generated/ctp';
import LocalizedTextInput from '@commercetools-uikit/localized-text-input';
import {
  transformLocalizedFieldToLocalizedString,
  transformLocalizedStringToLocalizedField,
} from '@commercetools-frontend/l10n';

export type TFormValues = {
  label: Record<string, string>;
  name: string;
  required?: boolean;
  isMultiLine: boolean;
  isLocalized: boolean;
  type: { name: string; referenceTypeId?: string };
  format: 'date' | 'datetime' | 'time';
};
export const fromFormValuesToTFieldDefinitionInput = (
  values: TFormValues
): TFieldDefinitionInput => {
  let type: TFieldTypeInput = { Boolean: {} };
  switch (values.type.name) {
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
        type = { LocalizedEnum: { values: [] } };
      } else {
        type = { Enum: { values: [] } };
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
          referenceTypeId: values.type.referenceTypeId || 'product',
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
  let typeName = '';
  let format: 'date' | 'datetime' | 'time' = 'date';
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
    }
  } else if (fieldDefinition?.type?.name === 'LocalizedEnum') {
    isLocalized = true;
    typeName = 'Enum';
  } else if (fieldDefinition?.type?.name === 'LocalizedString') {
    isLocalized = true;
    typeName = 'String';
  }

  console.log();
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
    type: {
      name: typeName,
      referenceTypeId:
        fieldDefinition?.type?.name === 'Reference'
          ? (fieldDefinition.type as TReferenceType).referenceTypeId
          : '',
    },
  };
};

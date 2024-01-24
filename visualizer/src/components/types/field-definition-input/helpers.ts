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
      type = { Date: {} };
      break;
    }
    case 'DateTime': {
      type = { DateTime: {} };
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
    case 'Time': {
      type = { Time: {} };
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
  const typeName = fieldDefinition?.type?.name
    ? fieldDefinition?.type?.name === 'LocalizedEnum' ||
      fieldDefinition?.type?.name === 'LocalizedString'
      ? 'String'
      : fieldDefinition?.type?.name
    : '';
  return {
    label: LocalizedTextInput.createLocalizedString(
      projectLanguages,
      transformLocalizedFieldToLocalizedString(
        fieldDefinition?.labelAllLocales ?? []
      ) ?? {}
    ),
    name: fieldDefinition?.name || '',
    isMultiLine: (fieldDefinition?.inputHint || 'SingleLine') === 'MultiLine',
    isLocalized:
      fieldDefinition?.type?.name === 'LocalizedEnum' ||
      fieldDefinition?.type?.name === 'LocalizedString',
    type: {
      name: typeName,
      referenceTypeId:
        fieldDefinition?.type?.name === 'Reference'
          ? (fieldDefinition.type as TReferenceType).referenceTypeId
          : '',
    },
  };
};

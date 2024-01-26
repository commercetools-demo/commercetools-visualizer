import { transformLocalizedFieldToLocalizedString } from '@commercetools-frontend/l10n';
import LocalizedTextInput from '@commercetools-uikit/localized-text-input';
import {
  TEnumType,
  TFieldDefinitionInput,
  TFieldType,
  TFieldTypeInput,
  TLocalizedEnumType,
  TTypeDefinition,
} from '../../types/generated/ctp';
import { TFormValues } from './types-form/types-form';
import { LocalizedString } from './field-definition-input-for-enum/constants';

export interface CustomFieldLocalizedEnumValue {
  key: string;
  label: LocalizedString;
}

export interface CustomFieldEnumValue {
  readonly key: string;
  readonly label: string;
}

const handleTFieldType = (input?: TFieldType) => {
  if (!input) {
    return {};
  }
  if (input.name === 'LocalizedEnum') {
    const type = input as TLocalizedEnumType;
    return {
      type: {
        name: input.name,
        values: type.values.map((value): CustomFieldLocalizedEnumValue => {
          return {
            key: value.key,
            label:
              transformLocalizedFieldToLocalizedString(
                value.labelAllLocales || []
              ) || {},
          };
        }),
      },
    };
  } else if (input.name === 'Enum') {
    const type = input as TEnumType;
    return {
      type: {
        name: input.name,
        values: type.values.map((value): CustomFieldEnumValue => {
          return {
            key: value.key,
            label: value.label,
          };
        }),
      },
    };
  }
  return {};
};
export const convertToActionData = (
  draft: Partial<TTypeDefinition>,
  ignoreFieldDefinitions = false
) => ({
  name: transformLocalizedFieldToLocalizedString(draft.nameAllLocales || []),
  description:
    transformLocalizedFieldToLocalizedString(
      draft.descriptionAllLocales || []
    ) || {},
  key: draft.key,
  fieldDefinitions:
    !ignoreFieldDefinitions && draft.fieldDefinitions
      ? draft.fieldDefinitions?.map((item) => {
          return {
            name: item.name,
            label: transformLocalizedFieldToLocalizedString(
              item.labelAllLocales || []
            ),
            ...handleTFieldType(item.type),
          };
        })
      : undefined,
});

const handleTFieldTypeInput = (input?: TFieldTypeInput) => {
  if (!input) {
    return {};
  }
  if (input.LocalizedEnum) {
    return {
      type: {
        name: 'LocalizedEnum',
        values: input.LocalizedEnum.values.map(
          (value): CustomFieldLocalizedEnumValue => {
            return {
              key: value.key,
              label:
                transformLocalizedFieldToLocalizedString(value.label || []) ||
                {},
            };
          }
        ),
      },
    };
  } else if (input.Enum) {
    return {
      type: {
        name: 'Enum',
        values: input.Enum.values.map((value): CustomFieldEnumValue => {
          return {
            key: value.key,
            label: value.label,
          };
        }),
      },
    };
  }
  return {};
};

export const convertFieldDefinitionToActionData = (
  draft: Partial<TFieldDefinitionInput>
) => ({
  name: draft.name,
  label: transformLocalizedFieldToLocalizedString(draft.label || []),
  ...handleTFieldTypeInput(draft.type),
});

export const formValuesToDoc = (formValues: TFormValues) => ({
  name: LocalizedTextInput.omitEmptyTranslations(formValues.name),
  description: LocalizedTextInput.omitEmptyTranslations(formValues.description),
  key: formValues.key,
});

import {
  TEnumType,
  TFieldDefinition,
  TFieldType,
  TLocalizedEnumType,
  TTypeDefinition,
} from '../../types/generated/ctp';
import { FieldDefinition, Type } from '@commercetools/platform-sdk';
import { transformLocalizedFieldToLocalizedString } from '../shared/graphql-helpers';

type PickedFieldType = TFieldType;
export type PickedFieldDefinition = Partial<
  Pick<TFieldDefinition, 'labelAllLocales' | 'name'>
> & {
  type: PickedFieldType;
};

export type PickedTypeDefinition = Partial<
  Pick<TTypeDefinition, 'key' | 'nameAllLocales' | 'descriptionAllLocales'> & {
    fieldDefinitions: Array<PickedFieldDefinition>;
  }
>;
type PickedReturnType = Partial<
  Pick<Type, 'name' | 'description' | 'key'> & {
    fieldDefinitions: Array<PickedFieldDefinitionResult>;
  }
>;

type PickedFieldDefinitionResult = Partial<
  Pick<FieldDefinition, 'name' | 'label'>
> &
  Partial<Pick<FieldDefinition, 'type'>>;

const mapFieldType = (
  item: PickedFieldDefinition
): PickedFieldDefinitionResult => {
  const base = {
    name: item.name,
    label: transformLocalizedFieldToLocalizedString(item.labelAllLocales),
  };
  if (item.type.name === 'LocalizedEnum') {
    const type = item.type as TLocalizedEnumType;
    return {
      ...base,
      type: {
        name: 'LocalizedEnum',
        values: type.values.map((value) => {
          return {
            key: value.key,
            label: transformLocalizedFieldToLocalizedString(
              value.labelAllLocales
            ),
          };
        }),
      },
    };
  } else if (item.type.name === 'Enum') {
    const type = item.type as TEnumType;
    return {
      ...base,
      type: {
        name: 'Enum',
        values: type.values.map((value) => {
          return {
            key: value.key,
            label: value.label,
          };
        }),
      },
    };
  }
  return base;
};

export const convertToActionData = (
  draft: PickedTypeDefinition,
  ignoreFieldDefinitions = false
): PickedReturnType => {
  return {
    name: transformLocalizedFieldToLocalizedString(draft.nameAllLocales),
    description: transformLocalizedFieldToLocalizedString(
      draft.descriptionAllLocales
    ),
    key: draft.key,
    fieldDefinitions:
      !ignoreFieldDefinitions && draft.fieldDefinitions
        ? draft.fieldDefinitions?.map(mapFieldType)
        : undefined,
  };
};

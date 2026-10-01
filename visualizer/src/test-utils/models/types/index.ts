import {
  CustomFieldEnumValue,
  CustomFieldLocalizedEnumValue,
  FieldDefinition,
  FieldType,
  Type,
} from '@commercetools-test-data/type';
import type { TFieldTypeBuilder } from '@commercetools-test-data/type/dist/declarations/src/field-type/types';
import { LocalizedString } from '@commercetools-test-data/commons';
import type { TFieldDefinitionBuilder } from '@commercetools-test-data/type/dist/declarations/src/field-definition/types';
import type { TTypeDefinition } from '../../../types/generated/ctp';

// Builders from `@commercetools-test-data/type`, wrapped so specs can describe
// a Type / FieldDefinition in one line and get back the GraphQL shape that the
// connector hooks (and msw handlers) deal in.

type FieldTypeName =
  | 'Boolean'
  | 'Date'
  | 'DateTime'
  | 'Money'
  | 'Number'
  | 'String'
  | 'LocalizedString'
  | 'Time';

const localized = (en: string, de?: string) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let builder: any = LocalizedString.random().en(en);
  builder = builder.de(de ?? null);
  return builder;
};

export const buildFieldDefinition = (
  name: string,
  type: TFieldTypeBuilder,
  options: { label?: string; required?: boolean; inputHint?: string } = {}
): TFieldDefinitionBuilder =>
  FieldDefinition.random()
    .name(name)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .label(localized(options.label ?? name) as any)
    .required(options.required ?? false)
    .inputHint(options.inputHint ?? 'SingleLine')
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .type(type as any);

export const simpleFieldType = (name: FieldTypeName) =>
  FieldType.random().name(name);

export const referenceFieldType = (referenceTypeId: string) =>
  FieldType.random().name('Reference').referenceTypeId(referenceTypeId);

export const setFieldType = (elementType: TFieldTypeBuilder) =>
  FieldType.random()
    .name('Set')
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .elementType(elementType as any);

export const enumFieldType = (values: Array<{ key: string; label: string }>) =>
  FieldType.random()
    .name('Enum')
    .values(
      values.map(
        (v) => CustomFieldEnumValue.random().key(v.key).label(v.label)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ) as any
    );

export const localizedEnumFieldType = (
  values: Array<{ key: string; label: string; de?: string }>
) =>
  FieldType.random()
    .name('LocalizedEnum')
    .values(
      values.map(
        (v) =>
          CustomFieldLocalizedEnumValue.random()
            .key(v.key)
            .label(localized(v.label, v.de))
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ) as any
    );

export const buildTypeDefinition = (
  options: {
    id?: string;
    key?: string;
    name?: string;
    description?: string;
    version?: number;
    resourceTypeIds?: string[];
    fieldDefinitions?: TFieldDefinitionBuilder[];
  } = {}
): TTypeDefinition => {
  let builder = Type.random();
  if (options.id) builder = builder.id(options.id);
  if (options.key) builder = builder.key(options.key);
  if (options.version !== undefined) builder = builder.version(options.version);
  if (options.name)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    builder = builder.name(localized(options.name) as any);
  if (options.description)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    builder = builder.description(localized(options.description) as any);
  if (options.resourceTypeIds)
    builder = builder.resourceTypeIds(options.resourceTypeIds);
  if (options.fieldDefinitions)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    builder = builder.fieldDefinitions(options.fieldDefinitions as any);
  return builder.buildGraphql<TTypeDefinition>();
};

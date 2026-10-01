// The API requires that a field definition with the same `name` on another Type for the same
// resource type has the same type:
// https://docs.commercetools.com/api/projects/types#fielddefinition
// This module checks that before a field is added, so the user doesn't have to learn it from
// an API error. Types are compared by their name, a Set by its element type and a Reference by
// the referenced resource; enum values are not compared (the API's exact rule for them is not
// documented, so a mismatch there is left to the API).

export type FieldTypeShape = {
  name: string;
  referenceTypeId?: string | null;
  elementType?: FieldTypeShape | null;
};

export type TypeWithFieldTypes = {
  id: string;
  key?: string | null;
  resourceTypeIds: ReadonlyArray<string>;
  fieldDefinitions: ReadonlyArray<{ name: string; type: FieldTypeShape }>;
};

// e.g. "String", "Reference(product)", "Set<LocalizedEnum>"
export const fieldTypeSignature = (type: FieldTypeShape): string => {
  switch (type.name) {
    case 'Set':
      return `Set<${
        type.elementType ? fieldTypeSignature(type.elementType) : '?'
      }>`;
    case 'Reference':
      return `Reference(${type.referenceTypeId ?? '?'})`;
    default:
      return type.name;
  }
};

type FormFieldType = {
  typeName: string;
  isSet: boolean;
  isLocalized: boolean;
  format: 'date' | 'datetime' | 'time';
  referenceTypeId: string;
};

// The signature of the type the field form describes (it only has a few flags for what the
// API models as separate field types).
export const signatureFromFormValues = (values: FormFieldType): string => {
  // nothing to compare yet
  if (!values.typeName) return '';
  if (values.typeName === 'Reference' && !values.referenceTypeId) return '';
  let base: FieldTypeShape;
  switch (values.typeName) {
    case 'Date':
      base = {
        name:
          values.format === 'datetime'
            ? 'DateTime'
            : values.format === 'time'
            ? 'Time'
            : 'Date',
      };
      break;
    case 'Enum':
      base = { name: values.isLocalized ? 'LocalizedEnum' : 'Enum' };
      break;
    case 'String':
      base = { name: values.isLocalized ? 'LocalizedString' : 'String' };
      break;
    case 'Reference':
      base = { name: 'Reference', referenceTypeId: values.referenceTypeId };
      break;
    default:
      base = { name: values.typeName };
  }
  return fieldTypeSignature(
    values.isSet ? { name: 'Set', elementType: base } : base
  );
};

export type FieldNameConflict = {
  // key (else id) of the other Type
  typeKey: string;
  // signature of the existing field's type
  existingType: string;
};

// The first other Type that applies to a resource type of this one and already has a field
// with this name but a different type.
export const findFieldNameConflict = ({
  typeId,
  fieldName,
  signature,
  types,
}: {
  // id of the Type the field is being added to
  typeId: string;
  fieldName: string;
  signature: string;
  types: ReadonlyArray<TypeWithFieldTypes>;
}): FieldNameConflict | undefined => {
  const current = types.find((type) => type.id === typeId);
  if (!current || !fieldName || !signature) return undefined;
  for (const other of types) {
    if (other.id === typeId) continue;
    const sharesResourceType = other.resourceTypeIds.some((id) =>
      current.resourceTypeIds.includes(id)
    );
    if (!sharesResourceType) continue;
    const existing = other.fieldDefinitions.find(
      (field) => field.name === fieldName
    );
    if (existing && fieldTypeSignature(existing.type) !== signature) {
      return {
        typeKey: other.key || other.id,
        existingType: fieldTypeSignature(existing.type),
      };
    }
  }
  return undefined;
};

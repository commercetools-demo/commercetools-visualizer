export const isDuplicateKeyError = (error) =>
  error.code === 'DuplicateField' &&
  error.field === 'key' &&
  error.action &&
  error.action.type === 'setKey';

export const hasFieldDefinitionAlreadyExistsError = (error) =>
  error.code === 'FieldDefinitionAlreadyExists' &&
  error.action &&
  error.action.type === 'addFieldDefinition';

export const hasFieldDefinitionTypeConflictError = (error) =>
  error.code === 'FieldDefinitionTypeConflict' &&
  error.action &&
  error.action.type === 'addFieldDefinition';

export const hasEnumKeyAlreadyExistsError = (error) =>
  error.code === 'EnumKeyAlreadyExists' &&
  error.action &&
  ['addLocalizedEnumValue', 'addPlainEnumValue', 'changeEnumKey'].includes(
    error.action.type
  );

export const hasEnumKeyUsedByProductsError = (error) =>
  error.code === 'InvalidOperation' &&
  error.action &&
  error.action.type === 'removeEnumValues' &&
  error.message.includes('is used by some products and cannot be deleted');

export const mapEnumKeyAlreadyExistsError = (error) => ({
  failedUpdateAction: error.action.type,
  conflictingKey: error.conflictingEnumKey,
});

export const mapEnumKeyUsedByProductsError = (error) => ({
  failedUpdateAction: error.action.type,
  conflictingKeys: error.action.keys || [],
});

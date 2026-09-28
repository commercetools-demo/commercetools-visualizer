// Shared across resource keys and Type field-definition names — see
// specs/README.md's "Key validation (shared rule)" convention: 2–256
// characters, alphanumerics/underscores/hyphens only, trimmed before
// validation.
export const KEY_VALIDATION_REGEX = /^[a-zA-Z0-9-_]+$/;

export type TKeyValidationError = {
  missing?: boolean;
  invalidInput?: boolean;
};

export const validateKey = (
  key: string | null | undefined
): TKeyValidationError => {
  if (!key || key.length === 0) {
    return { missing: true };
  }
  const trimmedKey = key.trim();
  if (
    trimmedKey.length < 2 ||
    trimmedKey.length > 256 ||
    !KEY_VALIDATION_REGEX.test(trimmedKey)
  ) {
    return { invalidInput: true };
  }
  return {};
};

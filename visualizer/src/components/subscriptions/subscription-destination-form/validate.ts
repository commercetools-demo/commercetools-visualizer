export const validateInput = (key: string) => {
  const hasKeyValue = Boolean(key);
  if (!hasKeyValue) {
    return JSON.stringify({ missing: true });
  }
  return undefined;
};

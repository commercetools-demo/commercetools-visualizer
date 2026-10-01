// Reordering the field definitions of a Type. The new order is staged in the type form like a
// removal and only sent on Save, as `changeFieldDefinitionOrder` (see
// `calculateFieldDefinitionOrderActions` in use-types-connector).

export type Direction = 'up' | 'down';

// Moves the field called `name` one position; a no-op at the ends or for an unknown name.
export const moveFieldDefinition = <T extends { name: string }>(
  fieldDefinitions: ReadonlyArray<T>,
  name: string,
  direction: Direction
): Array<T> => {
  const index = fieldDefinitions.findIndex((field) => field.name === name);
  const target = direction === 'up' ? index - 1 : index + 1;
  if (index === -1 || target < 0 || target >= fieldDefinitions.length) {
    return [...fieldDefinitions];
  }
  const next = [...fieldDefinitions];
  [next[index], next[target]] = [next[target], next[index]];
  return next;
};

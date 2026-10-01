import { calculateFieldDefinitionUpdateActions } from './types-connector';
import type { PickedFieldDefinition } from './conversion';

const plain = (keys: string[]): PickedFieldDefinition => ({
  name: 'color',
  type: {
    name: 'Enum',
    values: keys.map((key) => ({ key, label: key.toUpperCase() })),
  } as PickedFieldDefinition['type'],
});

const localized = (keys: string[]): PickedFieldDefinition => ({
  name: 'color',
  type: {
    name: 'LocalizedEnum',
    values: keys.map((key) => ({
      key,
      labelAllLocales: [{ locale: 'en', value: key.toUpperCase() }],
    })),
  } as PickedFieldDefinition['type'],
});

// Removing a value that is not the last one must not make the values after it
// look newly added.
describe('removing enum values from the middle of the list', () => {
  it.each([
    ['Enum', plain, 'removeEnumValues'],
    ['LocalizedEnum', localized, 'removeLocalizedEnumValues'],
  ] as const)(
    '%s: removing the first value only emits the removal',
    (_n, make, action) => {
      expect(
        calculateFieldDefinitionUpdateActions(
          make(['red', 'green', 'blue']),
          make(['green', 'blue'])
        )
      ).toEqual([{ [action]: { fieldName: 'color', keys: ['red'] } }]);
    }
  );

  it.each([
    ['Enum', plain, 'removeEnumValues'],
    ['LocalizedEnum', localized, 'removeLocalizedEnumValues'],
  ] as const)(
    '%s: removing a middle value only emits the removal',
    (_n, make, action) => {
      expect(
        calculateFieldDefinitionUpdateActions(
          make(['red', 'green', 'blue']),
          make(['red', 'blue'])
        )
      ).toEqual([{ [action]: { fieldName: 'color', keys: ['green'] } }]);
    }
  );

  it.each([
    ['Enum', plain, 'removeEnumValues'],
    ['LocalizedEnum', localized, 'removeLocalizedEnumValues'],
  ] as const)(
    '%s: removing several values emits one removal',
    (_n, make, action) => {
      expect(
        calculateFieldDefinitionUpdateActions(
          make(['a', 'b', 'c', 'd']),
          make(['b', 'd'])
        )
      ).toEqual([{ [action]: { fieldName: 'color', keys: ['a', 'c'] } }]);
    }
  );

  it('still reports a genuinely new value alongside a removal', () => {
    const actions = calculateFieldDefinitionUpdateActions(
      plain(['red', 'green']),
      plain(['green', 'blue'])
    );
    expect(actions[0]).toEqual({
      removeEnumValues: { fieldName: 'color', keys: ['red'] },
    });
    expect(actions).toContainEqual({
      addEnumValue: {
        fieldName: 'color',
        value: { key: 'blue', label: 'BLUE' },
      },
    });
    expect(actions.filter((a) => 'addEnumValue' in a)).toHaveLength(1);
  });
});

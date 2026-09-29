import {
  calculateFieldDefinitionRemovals,
  calculateFieldDefinitionUpdateActions,
  calculateTypeDefinitionUpdateActions,
} from './types-connector';
import { PickedFieldDefinition, PickedTypeDefinition } from './conversion';
import { TFieldDefinition } from '../../types/generated/ctp';

const enumField = (
  values: Array<{ key: string; label: string }>
): PickedFieldDefinition => ({
  name: 'myEnumField',
  type: { name: 'Enum', values } as PickedFieldDefinition['type'],
});

const localizedEnumField = (
  values: Array<{
    key: string;
    labelAllLocales: Array<{ locale: string; value: string }>;
  }>
): PickedFieldDefinition => ({
  name: 'myLocalizedEnumField',
  type: { name: 'LocalizedEnum', values } as PickedFieldDefinition['type'],
});

describe('calculateFieldDefinitionRemovals', () => {
  it('returns a removeFieldDefinition action per field missing from nextFieldDefinitions', () => {
    const original = [{ name: 'a' }, { name: 'b' }] as Array<TFieldDefinition>;
    const next = [{ name: 'a' }] as Array<TFieldDefinition>;

    expect(calculateFieldDefinitionRemovals(original, next)).toEqual([
      { removeFieldDefinition: { fieldName: 'b' } },
    ]);
  });

  it('returns no actions when nothing was removed', () => {
    const original = [{ name: 'a' }] as Array<TFieldDefinition>;
    const next = [{ name: 'a' }] as Array<TFieldDefinition>;

    expect(calculateFieldDefinitionRemovals(original, next)).toEqual([]);
  });

  it('returns no actions for an empty original list', () => {
    expect(calculateFieldDefinitionRemovals([], [])).toEqual([]);
  });
});

describe('calculateFieldDefinitionUpdateActions', () => {
  it('detects a removed Enum value as removeEnumValues, since sync-actions drops it', () => {
    const original = enumField([
      { key: 'a', label: 'A' },
      { key: 'b', label: 'B' },
    ]);
    const next = enumField([{ key: 'a', label: 'A' }]);

    const actions = calculateFieldDefinitionUpdateActions(original, next);
    expect(actions).toContainEqual({
      removeEnumValues: { fieldName: 'myEnumField', keys: ['b'] },
    });
  });

  it('detects a removed LocalizedEnum value as removeLocalizedEnumValues', () => {
    const original = localizedEnumField([
      { key: 'a', labelAllLocales: [{ locale: 'en', value: 'A' }] },
      { key: 'b', labelAllLocales: [{ locale: 'en', value: 'B' }] },
    ]);
    const next = localizedEnumField([
      { key: 'a', labelAllLocales: [{ locale: 'en', value: 'A' }] },
    ]);

    const actions = calculateFieldDefinitionUpdateActions(original, next);
    expect(actions).toContainEqual({
      removeLocalizedEnumValues: {
        fieldName: 'myLocalizedEnumField',
        keys: ['b'],
      },
    });
  });

  it('places the removal action before any sync-actions-produced actions', () => {
    const original = enumField([
      { key: 'a', label: 'A' },
      { key: 'b', label: 'B' },
    ]);
    // Removing "b" while also reordering "a" forces both a removal and a
    // changeEnumValueOrder action; the removal must come first (see the
    // comment above calculateEnumValueRemovals in types-connector.ts).
    const next = enumField([{ key: 'a', label: 'A changed' }]);

    const actions = calculateFieldDefinitionUpdateActions(original, next);
    expect(actions[0]).toEqual({
      removeEnumValues: { fieldName: 'myEnumField', keys: ['b'] },
    });
  });

  it('produces no removal action when no enum values were removed', () => {
    const original = enumField([{ key: 'a', label: 'A' }]);
    const next = enumField([{ key: 'a', label: 'A' }]);

    expect(calculateFieldDefinitionUpdateActions(original, next)).toEqual([]);
  });

  it('produces no removal action for non-enum field types', () => {
    const original: PickedFieldDefinition = {
      name: 'myStringField',
      type: { name: 'String' },
    };
    const next: PickedFieldDefinition = {
      name: 'myStringField',
      type: { name: 'String' },
    };

    expect(calculateFieldDefinitionUpdateActions(original, next)).toEqual([]);
  });

  it('produces no removal action when the field name is missing', () => {
    const original: PickedFieldDefinition = enumField([
      { key: 'a', label: 'A' },
    ]);
    delete (original as { name?: string }).name;
    const next = enumField([]);

    const actions = calculateFieldDefinitionUpdateActions(original, next);
    expect(actions).not.toContainEqual(
      expect.objectContaining({ removeEnumValues: expect.anything() })
    );
  });
});

describe('calculateTypeDefinitionUpdateActions', () => {
  it('produces a changeName action from a localized-field name diff', () => {
    const original: PickedTypeDefinition = {
      key: 'my-type',
      nameAllLocales: [{ locale: 'en', value: 'Old name' }],
      descriptionAllLocales: [{ locale: 'en', value: 'Description' }],
    };
    const next: PickedTypeDefinition = {
      ...original,
      nameAllLocales: [{ locale: 'en', value: 'New name' }],
    };

    const actions = calculateTypeDefinitionUpdateActions(original, next);
    expect(actions).toContainEqual({
      changeName: { name: [{ locale: 'en', value: 'New name' }] },
    });
  });

  it('produces a setDescription action from a localized-field description diff', () => {
    const original: PickedTypeDefinition = {
      key: 'my-type',
      nameAllLocales: [{ locale: 'en', value: 'Name' }],
      descriptionAllLocales: [{ locale: 'en', value: 'Old description' }],
    };
    const next: PickedTypeDefinition = {
      ...original,
      descriptionAllLocales: [{ locale: 'en', value: 'New description' }],
    };

    const actions = calculateTypeDefinitionUpdateActions(original, next);
    expect(actions).toContainEqual({
      setDescription: {
        description: [{ locale: 'en', value: 'New description' }],
      },
    });
  });

  it('ignores fieldDefinitions entirely, even when they differ', () => {
    const original: PickedTypeDefinition = {
      key: 'my-type',
      nameAllLocales: [{ locale: 'en', value: 'Name' }],
      descriptionAllLocales: [{ locale: 'en', value: 'Description' }],
      fieldDefinitions: [{ name: 'a', type: { name: 'String' } }],
    };
    const next: PickedTypeDefinition = {
      ...original,
      fieldDefinitions: [],
    };

    expect(calculateTypeDefinitionUpdateActions(original, next)).toEqual([]);
  });

  it('produces no actions when nothing changed', () => {
    const draft: PickedTypeDefinition = {
      key: 'my-type',
      nameAllLocales: [{ locale: 'en', value: 'Name' }],
      descriptionAllLocales: [{ locale: 'en', value: 'Description' }],
    };

    expect(calculateTypeDefinitionUpdateActions(draft, { ...draft })).toEqual(
      []
    );
  });
});

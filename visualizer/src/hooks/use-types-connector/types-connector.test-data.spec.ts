import type {
  TFieldDefinition,
  TTypeDefinition,
} from '../../types/generated/ctp';
import {
  buildFieldDefinition,
  buildTypeDefinition,
  enumFieldType,
  localizedEnumFieldType,
  referenceFieldType,
  setFieldType,
  simpleFieldType,
} from '../../test-utils/models/types';
import {
  calculateFieldDefinitionRemovals,
  calculateFieldDefinitionUpdateActions,
  calculateTypeDefinitionUpdateActions,
} from './types-connector';
import { convertToActionData } from './conversion';

const clone = <T>(value: T): T => JSON.parse(JSON.stringify(value));
const field = (
  name: string,
  type: Parameters<typeof buildFieldDefinition>[1],
  options?: Parameters<typeof buildFieldDefinition>[2]
) => buildFieldDefinition(name, type, options).buildGraphql<TFieldDefinition>();

const setLabel = (
  def: { labelAllLocales: Array<{ locale: string; value: string }> },
  locale: string,
  value: string
) => {
  const existing = def.labelAllLocales.find((l) => l.locale === locale);
  if (existing) existing.value = value;
  else def.labelAllLocales.push({ locale, value });
};

describe('convertToActionData (test-data types)', () => {
  const type = buildTypeDefinition({
    key: 'my-type',
    name: 'My type',
    description: 'My description',
    fieldDefinitions: [
      buildFieldDefinition('str', simpleFieldType('String')),
      buildFieldDefinition('loc', simpleFieldType('LocalizedString')),
      buildFieldDefinition('bool', simpleFieldType('Boolean')),
      buildFieldDefinition('ref', referenceFieldType('product')),
      buildFieldDefinition('set', setFieldType(simpleFieldType('Number'))),
      buildFieldDefinition(
        'enum',
        enumFieldType([
          { key: 'a', label: 'A' },
          { key: 'b', label: 'B' },
        ])
      ),
      buildFieldDefinition(
        'lenum',
        localizedEnumFieldType([{ key: 'a', label: 'A', de: 'Ä' }])
      ),
    ],
  });

  it('turns localized fields into locale->string records', () => {
    const result = convertToActionData(type);
    expect(result.key).toBe('my-type');
    expect(result.name?.en).toBe('My type');
    expect(result.description).toEqual(expect.any(Object));
    // Every locale of the built type survives the conversion.
    expect(Object.keys(result.name ?? {}).sort()).toEqual(
      type.nameAllLocales.map((l) => l.locale).sort()
    );
  });

  it('converts every field definition in order, keeping its name', () => {
    expect(
      convertToActionData(type).fieldDefinitions?.map((f) => f.name)
    ).toEqual(['str', 'loc', 'bool', 'ref', 'set', 'enum', 'lenum']);
  });

  it('only gives enum-like fields a `type`', () => {
    const byName = Object.fromEntries(
      (convertToActionData(type).fieldDefinitions ?? []).map((f) => [
        f.name,
        f.type,
      ])
    );
    expect(byName.str).toBeUndefined();
    expect(byName.ref).toBeUndefined();
    expect(byName.set).toBeUndefined();
    expect(byName.enum).toEqual({
      name: 'Enum',
      values: [
        { key: 'a', label: 'A' },
        { key: 'b', label: 'B' },
      ],
    });
    expect(byName.lenum).toMatchObject({
      name: 'LocalizedEnum',
      values: [
        { key: 'a', label: expect.objectContaining({ en: 'A', de: 'Ä' }) },
      ],
    });
  });

  it('omits fieldDefinitions when asked to ignore them', () => {
    expect(convertToActionData(type, true).fieldDefinitions).toBeUndefined();
  });
});

describe('calculateTypeDefinitionUpdateActions (test-data types)', () => {
  const original = buildTypeDefinition({
    key: 'my-type',
    name: 'Name',
    description: 'Description',
    resourceTypeIds: ['customer', 'order'],
    fieldDefinitions: [buildFieldDefinition('a', simpleFieldType('String'))],
  });

  it('produces nothing for an identical clone', () => {
    expect(
      calculateTypeDefinitionUpdateActions(original, clone(original))
    ).toEqual([]);
  });

  it('produces changeName with the full new localized name', () => {
    const next = clone(original);
    next.nameAllLocales.find((l) => l.locale === 'en')!.value = 'Renamed';
    const actions = calculateTypeDefinitionUpdateActions(original, next);
    expect(actions).toHaveLength(1);
    expect(actions[0]).toMatchObject({
      changeName: {
        name: expect.arrayContaining([{ locale: 'en', value: 'Renamed' }]),
      },
    });
  });

  it('produces changeName when a translation is added', () => {
    const next = clone(original);
    next.nameAllLocales.push({ locale: 'es', value: 'Nombre' } as never);
    const actions = calculateTypeDefinitionUpdateActions(original, next);
    expect(actions).toHaveLength(1);
    expect(actions[0]).toMatchObject({
      changeName: {
        name: expect.arrayContaining([{ locale: 'es', value: 'Nombre' }]),
      },
    });
  });

  it('produces setDescription when the description changes', () => {
    const next = clone(original);
    next.descriptionAllLocales!.find((l) => l.locale === 'en')!.value = 'New';
    const actions = calculateTypeDefinitionUpdateActions(original, next);
    expect(actions).toHaveLength(1);
    expect(actions[0]).toHaveProperty('setDescription');
  });

  it('produces both actions when name and description change', () => {
    const next = clone(original);
    next.nameAllLocales.find((l) => l.locale === 'en')!.value = 'Renamed';
    next.descriptionAllLocales!.find((l) => l.locale === 'en')!.value = 'New';
    const kinds = calculateTypeDefinitionUpdateActions(original, next).map(
      (a) => Object.keys(a)[0]
    );
    expect(kinds.sort()).toEqual(['changeName', 'setDescription']);
  });

  it('ignores field definition changes (handled by dedicated flows)', () => {
    const next = clone(original);
    next.fieldDefinitions = [];
    expect(calculateTypeDefinitionUpdateActions(original, next)).toEqual([]);
  });

  it('never emits actions for the immutable key or resourceTypeIds', () => {
    const next = clone(original);
    next.resourceTypeIds = ['product'] as never;
    expect(calculateTypeDefinitionUpdateActions(original, next)).toEqual([]);
  });
});

describe('calculateFieldDefinitionRemovals (test-data types)', () => {
  const type: TTypeDefinition = buildTypeDefinition({
    fieldDefinitions: ['a', 'b', 'c'].map((n) =>
      buildFieldDefinition(n, simpleFieldType('String'))
    ),
  });

  it('removes only the fields that disappeared, in original order', () => {
    const next = type.fieldDefinitions.filter((f) => f.name === 'b');
    expect(
      calculateFieldDefinitionRemovals(type.fieldDefinitions, next)
    ).toEqual([
      { removeFieldDefinition: { fieldName: 'a' } },
      { removeFieldDefinition: { fieldName: 'c' } },
    ]);
  });

  it('removes everything when the list is emptied', () => {
    expect(
      calculateFieldDefinitionRemovals(type.fieldDefinitions, [])
    ).toHaveLength(3);
  });

  it('does not treat added fields as removals', () => {
    const next = [
      ...type.fieldDefinitions,
      field('d', simpleFieldType('Number')),
    ];
    expect(
      calculateFieldDefinitionRemovals(type.fieldDefinitions, next)
    ).toEqual([]);
  });
});

describe('calculateFieldDefinitionUpdateActions (test-data fields)', () => {
  it('produces nothing for an identical clone, for every field type', () => {
    const fields = [
      field('f', simpleFieldType('String')),
      field('f', simpleFieldType('LocalizedString')),
      field('f', simpleFieldType('Boolean')),
      field('f', referenceFieldType('category')),
      field('f', setFieldType(simpleFieldType('Money'))),
      field('f', enumFieldType([{ key: 'a', label: 'A' }])),
      field('f', localizedEnumFieldType([{ key: 'a', label: 'A', de: 'Ä' }])),
    ];
    fields.forEach((f) =>
      expect(calculateFieldDefinitionUpdateActions(f, clone(f))).toEqual([])
    );
  });

  it('produces changeLabel when the label changes', () => {
    const original = field('f', simpleFieldType('String'));
    const next = clone(original);
    setLabel(next, 'en', 'A new label');
    const actions = calculateFieldDefinitionUpdateActions(original, next);
    expect(actions).toHaveLength(1);
    expect(actions[0]).toMatchObject({
      changeLabel: {
        fieldName: 'f',
        label: expect.arrayContaining([{ locale: 'en', value: 'A new label' }]),
      },
    });
  });

  it('produces addEnumValue for a new Enum value', () => {
    const original = field('f', enumFieldType([{ key: 'a', label: 'A' }]));
    const next = clone(original);
    (next.type as never as { values: unknown[] }).values.push({
      key: 'b',
      label: 'B',
    });
    expect(
      calculateFieldDefinitionUpdateActions(original, next)
    ).toContainEqual({
      addEnumValue: { fieldName: 'f', value: { key: 'b', label: 'B' } },
    });
  });

  it('produces changeEnumValueLabel when an Enum value label changes', () => {
    const original = field('f', enumFieldType([{ key: 'a', label: 'A' }]));
    const next = clone(original);
    (
      next.type as never as { values: Array<{ label: string }> }
    ).values[0].label = 'Renamed';
    const actions = calculateFieldDefinitionUpdateActions(original, next);
    expect(actions.map((a) => Object.keys(a)[0])).toContain(
      'changeEnumValueLabel'
    );
  });

  it('produces removeEnumValues first, then the order change, for Enum', () => {
    const original = field(
      'f',
      enumFieldType([
        { key: 'a', label: 'A' },
        { key: 'b', label: 'B' },
        { key: 'c', label: 'C' },
      ])
    );
    const next = clone(original);
    const values = (next.type as never as { values: Array<{ key: string }> })
      .values;
    values.splice(1, 1); // drop "b"
    values.reverse(); // c, a
    const kinds = calculateFieldDefinitionUpdateActions(original, next).map(
      (a) => Object.keys(a)[0]
    );
    expect(kinds[0]).toBe('removeEnumValues');
    expect(kinds).toContain('changeEnumValueOrder');
    expect(kinds.indexOf('removeEnumValues')).toBeLessThan(
      kinds.indexOf('changeEnumValueOrder')
    );
  });

  it('produces removeLocalizedEnumValues for LocalizedEnum', () => {
    const original = field(
      'f',
      localizedEnumFieldType([
        { key: 'a', label: 'A' },
        { key: 'b', label: 'B' },
      ])
    );
    const next = clone(original);
    (next.type as never as { values: unknown[] }).values.pop();
    expect(
      calculateFieldDefinitionUpdateActions(original, next)
    ).toContainEqual({
      removeLocalizedEnumValues: { fieldName: 'f', keys: ['b'] },
    });
  });

  it('produces addLocalizedEnumValue for a new LocalizedEnum value', () => {
    const original = field(
      'f',
      localizedEnumFieldType([{ key: 'a', label: 'A' }])
    );
    const next = clone(original);
    (next.type as never as { values: unknown[] }).values.push({
      key: 'b',
      labelAllLocales: [{ locale: 'en', value: 'B' }],
    });
    const actions = calculateFieldDefinitionUpdateActions(original, next);
    expect(actions.map((a) => Object.keys(a)[0])).toContain(
      'addLocalizedEnumValue'
    );
  });
});

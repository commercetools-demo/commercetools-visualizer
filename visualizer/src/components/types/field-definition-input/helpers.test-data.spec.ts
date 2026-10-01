import type { TFieldDefinition } from '../../../types/generated/ctp';
import {
  buildFieldDefinition,
  enumFieldType,
  localizedEnumFieldType,
  referenceFieldType,
  setFieldType,
  simpleFieldType,
} from '../../../test-utils/models/types';
import {
  fromFormValuesToTFieldDefinitionInput,
  initialValuesFromFieldDefinition,
  toPickedFieldDefinition,
} from './helpers';

const LANGS = ['en', 'de'];

// Field definitions built with `@commercetools-test-data/type`, one per
// supported field type (and Set-of variant).
const field = (type: Parameters<typeof buildFieldDefinition>[1]) =>
  buildFieldDefinition('f', type).buildGraphql<TFieldDefinition>();

const definitions: Array<[string, TFieldDefinition]> = [
  ['Boolean', field(simpleFieldType('Boolean'))],
  ['Date', field(simpleFieldType('Date'))],
  ['DateTime', field(simpleFieldType('DateTime'))],
  ['Time', field(simpleFieldType('Time'))],
  ['Money', field(simpleFieldType('Money'))],
  ['Number', field(simpleFieldType('Number'))],
  ['String', field(simpleFieldType('String'))],
  ['LocalizedString', field(simpleFieldType('LocalizedString'))],
  ['Reference', field(referenceFieldType('category'))],
  [
    'Enum',
    field(
      enumFieldType([
        { key: 'a', label: 'A' },
        { key: 'b', label: 'B' },
      ])
    ),
  ],
  [
    'LocalizedEnum',
    field(
      localizedEnumFieldType([
        { key: 'a', label: 'A', de: 'Ä' },
        { key: 'b', label: 'B', de: 'Bee' },
      ])
    ),
  ],
  ['Set<String>', field(setFieldType(simpleFieldType('String')))],
  ['Set<Reference>', field(setFieldType(referenceFieldType('product')))],
  ['Set<Enum>', field(setFieldType(enumFieldType([{ key: 'x', label: 'X' }])))],
  [
    'Set<LocalizedEnum>',
    field(
      setFieldType(localizedEnumFieldType([{ key: 'x', label: 'X', de: 'Y' }]))
    ),
  ],
];

describe('initialValuesFromFieldDefinition (test-data field definitions)', () => {
  it.each(definitions)(
    'maps %s to form values without losing the name',
    (_l, def) => {
      const values = initialValuesFromFieldDefinition(def, LANGS);
      expect(values.name).toBe('f');
      expect(values.isSet).toBe(def.type.name === 'Set');
    }
  );

  it.each([
    ['Date', 'Date', 'date'],
    ['DateTime', 'Date', 'datetime'],
    ['Time', 'Date', 'time'],
  ])('maps %s to typeName %s with format %s', (name, typeName, format) => {
    const def = definitions.find(([l]) => l === name)![1];
    const values = initialValuesFromFieldDefinition(def, LANGS);
    expect(values.typeName).toBe(typeName);
    expect(values.format).toBe(format);
  });

  it('sets isLocalized only for LocalizedString and LocalizedEnum', () => {
    const localized = definitions
      .filter(([, d]) => initialValuesFromFieldDefinition(d, LANGS).isLocalized)
      .map(([l]) => l);
    expect(localized).toEqual([
      'LocalizedString',
      'LocalizedEnum',
      'Set<LocalizedEnum>',
    ]);
  });

  it('carries the reference type id, also through a Set', () => {
    expect(
      initialValuesFromFieldDefinition(
        definitions.find(([l]) => l === 'Reference')![1],
        LANGS
      ).referenceTypeId
    ).toBe('category');
    expect(
      initialValuesFromFieldDefinition(
        definitions.find(([l]) => l === 'Set<Reference>')![1],
        LANGS
      ).referenceTypeId
    ).toBe('product');
  });

  it('returns the enum values for Enum and for Set<Enum>', () => {
    const plain = initialValuesFromFieldDefinition(
      definitions.find(([l]) => l === 'Enum')![1],
      LANGS
    );
    expect(plain.enumValues?.map((v) => [v.key, v.label])).toEqual([
      ['a', 'A'],
      ['b', 'B'],
    ]);
    const set = initialValuesFromFieldDefinition(
      definitions.find(([l]) => l === 'Set<Enum>')![1],
      LANGS
    );
    expect(set.enumValues?.map((v) => v.key)).toEqual(['x']);
  });

  it('is deterministic, so Formik enableReinitialize does not reset the form', () => {
    const def = definitions.find(([l]) => l === 'LocalizedEnum')![1];
    expect(initialValuesFromFieldDefinition(def, LANGS)).toEqual(
      initialValuesFromFieldDefinition(def, LANGS)
    );
  });

  it('makes every project language available in the label, even when untranslated', () => {
    const def = buildFieldDefinition('f', simpleFieldType('String'), {
      label: 'Only English',
    }).buildGraphql<TFieldDefinition>();
    const values = initialValuesFromFieldDefinition(def, ['en', 'de', 'es']);
    expect(Object.keys(values.label)).toEqual(
      expect.arrayContaining(['en', 'de', 'es'])
    );
    expect(values.label.en).toBe('Only English');
    expect(values.label.es).toBe('');
  });

  it('maps required/inputHint', () => {
    const def = buildFieldDefinition('f', simpleFieldType('String'), {
      required: true,
      inputHint: 'MultiLine',
    }).buildGraphql<TFieldDefinition>();
    const values = initialValuesFromFieldDefinition(def, LANGS);
    expect(values.isMultiLine).toBe(true);
  });
});

describe('form values <-> field definition input round trip (test-data)', () => {
  it.each(definitions)('round-trips %s to an equivalent input', (_l, def) => {
    const values = initialValuesFromFieldDefinition(def, LANGS);
    const input = fromFormValuesToTFieldDefinitionInput({
      ...values,
      required: def.required,
    });

    expect(input.name).toBe(def.name);
    expect(input.required).toBe(def.required);
    expect(input.inputHint).toBe(def.inputHint);

    // The one-of input key matches the (possibly Set-wrapped) API type name.
    const [inputTypeName] = Object.keys(input.type);
    expect(inputTypeName).toBe(def.type.name);
  });

  it('maps the label back to locale/value pairs, dropping empty locales', () => {
    const def = buildFieldDefinition('f', simpleFieldType('String'), {
      label: 'Hello',
    }).buildGraphql<TFieldDefinition>();
    const values = initialValuesFromFieldDefinition(def, ['en', 'de', 'es']);
    const input = fromFormValuesToTFieldDefinitionInput(values);
    const locales = input.label?.map((l) => l.locale) ?? [];
    expect(locales).toContain('en');
    expect(locales).not.toContain('es');
    expect(locales).not.toContain('de');
  });

  it('preserves enum values and their order through the round trip', () => {
    const def = definitions.find(([l]) => l === 'Enum')![1];
    const input = fromFormValuesToTFieldDefinitionInput(
      initialValuesFromFieldDefinition(def, LANGS)
    );
    expect(input.type.Enum?.values).toEqual([
      { key: 'a', label: 'A' },
      { key: 'b', label: 'B' },
    ]);
  });

  it('preserves localized enum translations through the round trip', () => {
    const def = definitions.find(([l]) => l === 'LocalizedEnum')![1];
    const input = fromFormValuesToTFieldDefinitionInput(
      initialValuesFromFieldDefinition(def, LANGS)
    );
    const a = input.type.LocalizedEnum?.values.find((v) => v.key === 'a');
    expect(a?.label).toEqual(
      expect.arrayContaining([
        { locale: 'en', value: 'A' },
        { locale: 'de', value: 'Ä' },
      ])
    );
  });
});

describe('toPickedFieldDefinition (test-data)', () => {
  it.each(definitions.filter(([l]) => !l.startsWith('Set')))(
    'reports the type name for %s',
    (_l, def) => {
      const input = fromFormValuesToTFieldDefinitionInput(
        initialValuesFromFieldDefinition(def, LANGS)
      );
      expect(toPickedFieldDefinition(input).type.name).toBe(def.type.name);
      expect(toPickedFieldDefinition(input).name).toBe('f');
    }
  );
});

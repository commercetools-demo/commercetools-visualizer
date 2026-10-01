import {
  fromFormValuesToTFieldDefinitionInput,
  initialValuesFromFieldDefinition,
  toPickedFieldDefinition,
  TFormValues,
} from './helpers';
import {
  TFieldDefinition,
  TFieldDefinitionInput,
} from '../../../types/generated/ctp';

const baseFormValues: TFormValues = {
  label: { en: 'My field' },
  name: 'myField',
  required: false,
  isMultiLine: false,
  isLocalized: false,
  isSet: false,
  typeName: 'String',
  referenceTypeId: '',
  format: 'date',
  enumValues: undefined,
};

describe('fromFormValuesToTFieldDefinitionInput', () => {
  it('maps a plain String field, omitting empty label translations', () => {
    const result = fromFormValuesToTFieldDefinitionInput({
      ...baseFormValues,
      label: { en: 'My field', de: '' },
    });
    expect(result).toEqual({
      name: 'myField',
      required: false,
      inputHint: 'SingleLine',
      type: { String: {} },
      label: [{ locale: 'en', value: 'My field' }],
    });
  });

  it('maps a localized String field to LocalizedString', () => {
    const result = fromFormValuesToTFieldDefinitionInput({
      ...baseFormValues,
      isLocalized: true,
    });
    expect(result.type).toEqual({ LocalizedString: {} });
  });

  it('maps a Boolean field', () => {
    const result = fromFormValuesToTFieldDefinitionInput({
      ...baseFormValues,
      typeName: 'Boolean',
    });
    expect(result.type).toEqual({ Boolean: {} });
  });

  it.each([
    ['date', { Date: {} }],
    ['datetime', { DateTime: {} }],
    ['time', { Time: {} }],
  ] as const)('maps a Date field with format %s', (format, expected) => {
    const result = fromFormValuesToTFieldDefinitionInput({
      ...baseFormValues,
      typeName: 'Date',
      format,
    });
    expect(result.type).toEqual(expected);
  });

  it('maps Money, Number, and Reference fields', () => {
    expect(
      fromFormValuesToTFieldDefinitionInput({
        ...baseFormValues,
        typeName: 'Money',
      }).type
    ).toEqual({ Money: {} });
    expect(
      fromFormValuesToTFieldDefinitionInput({
        ...baseFormValues,
        typeName: 'Number',
      }).type
    ).toEqual({ Number: {} });
    expect(
      fromFormValuesToTFieldDefinitionInput({
        ...baseFormValues,
        typeName: 'Reference',
        referenceTypeId: 'product',
      }).type
    ).toEqual({ Reference: { referenceTypeId: 'product' } });
  });

  it('maps a non-localized Enum field, dropping values with a blank key or missing label', () => {
    const result = fromFormValuesToTFieldDefinitionInput({
      ...baseFormValues,
      typeName: 'Enum',
      enumValues: [
        { _uid: '1', key: 'a', label: 'A' },
        { _uid: '2', key: '  ', label: 'Blank key' },
        { _uid: '3', key: 'c', label: undefined },
      ],
    });
    expect(result.type).toEqual({
      Enum: { values: [{ key: 'a', label: 'A' }] },
    });
  });

  it('maps a localized Enum field, converting per-value labels and dropping blank keys', () => {
    const result = fromFormValuesToTFieldDefinitionInput({
      ...baseFormValues,
      typeName: 'Enum',
      isLocalized: true,
      enumValues: [
        { _uid: '1', key: 'a', label: { en: 'A', de: '' } },
        { _uid: '2', key: '', label: { en: 'Skipped' } },
      ],
    });
    expect(result.type).toEqual({
      LocalizedEnum: {
        values: [{ key: 'a', label: [{ locale: 'en', value: 'A' }] }],
      },
    });
  });

  it('wraps the resolved type in Set when isSet is true', () => {
    const result = fromFormValuesToTFieldDefinitionInput({
      ...baseFormValues,
      typeName: 'Number',
      isSet: true,
    });
    expect(result.type).toEqual({ Set: { elementType: { Number: {} } } });
  });

  it('defaults required to false and maps isMultiLine to inputHint', () => {
    const result = fromFormValuesToTFieldDefinitionInput({
      ...baseFormValues,
      required: undefined,
      isMultiLine: true,
    });
    expect(result.required).toBe(false);
    expect(result.inputHint).toEqual('MultiLine');
  });
});

describe('toPickedFieldDefinition', () => {
  it('reconstructs an Enum field from its input shape', () => {
    const input: TFieldDefinitionInput = {
      name: 'myField',
      required: false,
      inputHint: 'SingleLine' as TFieldDefinitionInput['inputHint'],
      type: { Enum: { values: [{ key: 'a', label: 'A' }] } },
      label: [{ locale: 'en', value: 'My field' }],
    };
    expect(toPickedFieldDefinition(input)).toEqual({
      name: 'myField',
      labelAllLocales: [{ locale: 'en', value: 'My field' }],
      inputHint: 'SingleLine',
      type: { name: 'Enum', values: [{ key: 'a', label: 'A' }] },
    });
  });

  it('reconstructs a LocalizedEnum field, renaming label to labelAllLocales per value', () => {
    const input: TFieldDefinitionInput = {
      name: 'myField',
      required: false,
      inputHint: 'SingleLine' as TFieldDefinitionInput['inputHint'],
      type: {
        LocalizedEnum: {
          values: [{ key: 'a', label: [{ locale: 'en', value: 'A' }] }],
        },
      },
      label: [],
    };
    expect(toPickedFieldDefinition(input).type).toEqual({
      name: 'LocalizedEnum',
      values: [{ key: 'a', labelAllLocales: [{ locale: 'en', value: 'A' }] }],
    });
  });

  it('reconstructs a non-enum field with only the type name, since it is immutable after create', () => {
    const input: TFieldDefinitionInput = {
      name: 'myField',
      required: false,
      inputHint: 'SingleLine' as TFieldDefinitionInput['inputHint'],
      type: { String: {} },
      label: [],
    };
    expect(toPickedFieldDefinition(input).type).toEqual({ name: 'String' });
  });
});

describe('initialValuesFromFieldDefinition', () => {
  it('returns sensible defaults for an undefined field definition', () => {
    const values = initialValuesFromFieldDefinition(undefined, ['en']);
    expect(values.name).toEqual('');
    expect(values.isMultiLine).toBe(false);
    expect(values.isLocalized).toBe(false);
    expect(values.isSet).toBe(false);
    expect(values.enumValues).toEqual([]);
    expect(values.referenceTypeId).toEqual('');
  });

  it.each([
    ['DateTime', 'datetime'],
    ['Time', 'time'],
    ['Date', 'date'],
  ] as const)('maps a %s field to format %s', (typeName, format) => {
    const fieldDefinition = {
      name: 'myField',
      inputHint: 'SingleLine',
      labelAllLocales: [],
      required: false,
      type: { name: typeName },
    } as unknown as TFieldDefinition;

    const values = initialValuesFromFieldDefinition(fieldDefinition, ['en']);
    expect(values.typeName).toEqual('Date');
    expect(values.format).toEqual(format);
  });

  it('unwraps a Set field, deriving typeName from the element type', () => {
    const fieldDefinition = {
      name: 'myField',
      inputHint: 'SingleLine',
      labelAllLocales: [],
      required: false,
      type: {
        name: 'Set',
        elementType: { name: 'Number' },
      },
    } as unknown as TFieldDefinition;

    const values = initialValuesFromFieldDefinition(fieldDefinition, ['en']);
    expect(values.isSet).toBe(true);
    expect(values.typeName).toEqual('Number');
  });

  it('maps a LocalizedEnum field to typeName Enum with isLocalized true, using the key as a stable _uid', () => {
    const fieldDefinition = {
      name: 'myField',
      inputHint: 'SingleLine',
      labelAllLocales: [],
      required: false,
      type: {
        name: 'LocalizedEnum',
        values: [
          {
            key: 'a',
            labelAllLocales: [{ locale: 'en', value: 'A' }],
          },
        ],
      },
    } as unknown as TFieldDefinition;

    const values = initialValuesFromFieldDefinition(fieldDefinition, ['en']);
    expect(values.typeName).toEqual('Enum');
    expect(values.isLocalized).toBe(true);
    expect(values.enumValues).toEqual([
      { _uid: 'a', key: 'a', label: { en: 'A' } },
    ]);
  });

  it('maps a plain Enum field, keeping the plain-string label', () => {
    const fieldDefinition = {
      name: 'myField',
      inputHint: 'SingleLine',
      labelAllLocales: [],
      required: false,
      type: {
        name: 'Enum',
        values: [{ key: 'a', label: 'A' }],
      },
    } as unknown as TFieldDefinition;

    const values = initialValuesFromFieldDefinition(fieldDefinition, ['en']);
    expect(values.typeName).toEqual('Enum');
    expect(values.isLocalized).toBe(false);
    expect(values.enumValues).toEqual([{ _uid: 'a', key: 'a', label: 'A' }]);
  });

  it('maps a LocalizedString field to typeName String with isLocalized true', () => {
    const fieldDefinition = {
      name: 'myField',
      inputHint: 'SingleLine',
      labelAllLocales: [],
      required: false,
      type: { name: 'LocalizedString' },
    } as unknown as TFieldDefinition;

    const values = initialValuesFromFieldDefinition(fieldDefinition, ['en']);
    expect(values.typeName).toEqual('String');
    expect(values.isLocalized).toBe(true);
  });

  it('maps a Reference field, carrying over the referenceTypeId', () => {
    const fieldDefinition = {
      name: 'myField',
      inputHint: 'SingleLine',
      labelAllLocales: [],
      required: false,
      type: { name: 'Reference', referenceTypeId: 'product' },
    } as unknown as TFieldDefinition;

    const values = initialValuesFromFieldDefinition(fieldDefinition, ['en']);
    expect(values.typeName).toEqual('Reference');
    expect(values.referenceTypeId).toEqual('product');
  });

  it('maps isMultiLine from the inputHint', () => {
    const fieldDefinition = {
      name: 'myField',
      inputHint: 'MultiLine',
      labelAllLocales: [],
      required: false,
      type: { name: 'String' },
    } as unknown as TFieldDefinition;

    const values = initialValuesFromFieldDefinition(fieldDefinition, ['en']);
    expect(values.isMultiLine).toBe(true);
  });
});

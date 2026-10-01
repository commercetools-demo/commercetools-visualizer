import {
  FieldTypeShape,
  TypeWithFieldTypes,
  fieldTypeSignature,
  findFieldNameConflict,
  signatureFromFormValues,
} from './name-conflicts';

const string: FieldTypeShape = { name: 'String' };
const number: FieldTypeShape = { name: 'Number' };

describe('fieldTypeSignature', () => {
  it.each([
    [{ name: 'Boolean' }, 'Boolean'],
    [{ name: 'LocalizedEnum' }, 'LocalizedEnum'],
    [{ name: 'Reference', referenceTypeId: 'product' }, 'Reference(product)'],
    [{ name: 'Set', elementType: string }, 'Set<String>'],
    [
      {
        name: 'Set',
        elementType: { name: 'Reference', referenceTypeId: 'category' },
      },
      'Set<Reference(category)>',
    ],
  ])('describes %j as %s', (type, expected) => {
    expect(fieldTypeSignature(type)).toBe(expected);
  });
});

describe('signatureFromFormValues', () => {
  const values = (
    overrides: Partial<Parameters<typeof signatureFromFormValues>[0]>
  ) => ({
    typeName: 'String',
    isSet: false,
    isLocalized: false,
    format: 'date' as const,
    referenceTypeId: '',
    ...overrides,
  });

  it.each([
    [{ typeName: 'Boolean' }, 'Boolean'],
    [{ typeName: 'Number' }, 'Number'],
    [{ typeName: 'Money' }, 'Money'],
    [{ typeName: 'String' }, 'String'],
    [{ typeName: 'String', isLocalized: true }, 'LocalizedString'],
    [{ typeName: 'Enum' }, 'Enum'],
    [{ typeName: 'Enum', isLocalized: true }, 'LocalizedEnum'],
    [{ typeName: 'Date', format: 'date' as const }, 'Date'],
    [{ typeName: 'Date', format: 'datetime' as const }, 'DateTime'],
    [{ typeName: 'Date', format: 'time' as const }, 'Time'],
    [
      { typeName: 'Reference', referenceTypeId: 'product' },
      'Reference(product)',
    ],
    [{ typeName: 'String', isSet: true }, 'Set<String>'],
    [
      { typeName: 'Reference', referenceTypeId: 'order', isSet: true },
      'Set<Reference(order)>',
    ],
    [
      { typeName: 'Enum', isLocalized: true, isSet: true },
      'Set<LocalizedEnum>',
    ],
  ])('maps %j to %s', (overrides, expected) => {
    expect(signatureFromFormValues(values(overrides))).toBe(expected);
  });

  it('has nothing to compare before a type is chosen, or a reference target picked', () => {
    expect(signatureFromFormValues(values({ typeName: '' }))).toBe('');
    expect(
      signatureFromFormValues(
        values({ typeName: 'Reference', referenceTypeId: '' })
      )
    ).toBe('');
  });
});

describe('findFieldNameConflict', () => {
  const type = (
    id: string,
    resourceTypeIds: string[],
    fields: Record<string, FieldTypeShape> = {}
  ): TypeWithFieldTypes => ({
    id,
    key: `key-${id}`,
    resourceTypeIds,
    fieldDefinitions: Object.entries(fields).map(([name, t]) => ({
      name,
      type: t,
    })),
  });
  const types = [
    type('current', ['customer']),
    type('other', ['customer', 'order'], { color: string, size: number }),
    type('elsewhere', ['product'], { weight: number }),
  ];
  const find = (fieldName: string, signature: string, list = types) =>
    findFieldNameConflict({
      typeId: 'current',
      fieldName,
      signature,
      types: list,
    });

  it('finds a field of the same name with a different type on a Type for a shared resource type', () => {
    expect(find('color', 'Number')).toEqual({
      typeKey: 'key-other',
      existingType: 'String',
    });
  });

  it('finds nothing when the type is the same', () => {
    expect(find('color', 'String')).toBeUndefined();
  });

  it('ignores Types for other resource types', () => {
    expect(find('weight', 'String')).toBeUndefined();
  });

  it('ignores a field of another name', () => {
    expect(find('colour', 'Number')).toBeUndefined();
  });

  it('is case sensitive, like the API', () => {
    expect(find('Color', 'Number')).toBeUndefined();
  });

  it('ignores the Type the field is added to', () => {
    const own = [
      type('current', ['customer'], { color: string }),
      ...types.slice(1),
    ];
    expect(find('color', 'String', own)).toBeUndefined();
  });

  it('falls back to the id for a Type without a key', () => {
    const noKey = [
      type('current', ['customer']),
      { ...type('other', ['customer'], { color: string }), key: null },
    ];
    expect(find('color', 'Number', noKey)?.typeKey).toBe('other');
  });

  it('finds nothing without a name, a signature, or when the current Type is unknown', () => {
    expect(find('', 'Number')).toBeUndefined();
    expect(find('color', '')).toBeUndefined();
    expect(
      findFieldNameConflict({
        typeId: 'unknown',
        fieldName: 'color',
        signature: 'Number',
        types,
      })
    ).toBeUndefined();
  });

  it('checks every shared Type, not just the first', () => {
    const several = [
      type('current', ['customer']),
      type('a', ['customer'], { color: number }),
      type('b', ['customer'], { color: string }),
    ];
    // matches `a`'s Number, conflicts with `b`'s String
    expect(find('color', 'Number', several)?.typeKey).toBe('key-b');
  });
});

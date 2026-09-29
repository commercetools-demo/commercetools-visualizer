import {
  convertToActionData,
  PickedFieldDefinition,
  PickedTypeDefinition,
} from './conversion';
import { TEnumType, TLocalizedEnumType } from '../../types/generated/ctp';

describe('convertToActionData', () => {
  it('converts localized-field name/description/key into the REST-shaped draft', () => {
    const draft: PickedTypeDefinition = {
      key: 'my-type',
      nameAllLocales: [{ locale: 'en', value: 'Name' }],
      descriptionAllLocales: [{ locale: 'en', value: 'Description' }],
    };

    expect(convertToActionData(draft)).toEqual({
      key: 'my-type',
      name: { en: 'Name' },
      description: { en: 'Description' },
      fieldDefinitions: undefined,
    });
  });

  it('omits fieldDefinitions when ignoreFieldDefinitions is true, even if present', () => {
    const draft: PickedTypeDefinition = {
      key: 'my-type',
      nameAllLocales: [],
      descriptionAllLocales: [],
      fieldDefinitions: [{ name: 'a', type: { name: 'String' } }],
    };

    expect(convertToActionData(draft, true).fieldDefinitions).toBeUndefined();
  });

  it('maps an Enum field definition, converting values to the REST shape', () => {
    const enumField: PickedFieldDefinition = {
      name: 'myEnumField',
      type: {
        name: 'Enum',
        values: [{ key: 'a', label: 'A' }],
      } as TEnumType,
    };
    const draft: PickedTypeDefinition = {
      key: 'my-type',
      fieldDefinitions: [enumField],
    };

    expect(convertToActionData(draft).fieldDefinitions).toEqual([
      {
        name: 'myEnumField',
        label: {},
        type: { name: 'Enum', values: [{ key: 'a', label: 'A' }] },
      },
    ]);
  });

  it('maps a LocalizedEnum field definition, converting value labels to locale records', () => {
    const localizedEnumField: PickedFieldDefinition = {
      name: 'myLocalizedEnumField',
      labelAllLocales: [{ locale: 'en', value: 'My field' }],
      type: {
        name: 'LocalizedEnum',
        values: [
          {
            key: 'a',
            labelAllLocales: [{ locale: 'en', value: 'A' }],
          },
        ],
      } as TLocalizedEnumType,
    };
    const draft: PickedTypeDefinition = {
      fieldDefinitions: [localizedEnumField],
    };

    expect(convertToActionData(draft).fieldDefinitions).toEqual([
      {
        name: 'myLocalizedEnumField',
        label: { en: 'My field' },
        type: {
          name: 'LocalizedEnum',
          values: [{ key: 'a', label: { en: 'A' } }],
        },
      },
    ]);
  });

  it('maps a non-enum field definition without a type-specific shape', () => {
    const draft: PickedTypeDefinition = {
      fieldDefinitions: [
        {
          name: 'myStringField',
          labelAllLocales: [{ locale: 'en', value: 'My field' }],
          type: { name: 'String' },
        },
      ],
    };

    expect(convertToActionData(draft).fieldDefinitions).toEqual([
      { name: 'myStringField', label: { en: 'My field' } },
    ]);
  });
});

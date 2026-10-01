import { buildTypeDefinition } from '../../test-utils/models/types';
import {
  formValuesToDoc,
  omitEmptyTranslations,
} from './type-definition-connectors';
import type { TFormValues } from './types-form/types-form';

const formValues = (overrides: Partial<TFormValues> = {}): TFormValues => ({
  id: 'type-1',
  key: 'my-type',
  name: { en: 'Name', de: '' },
  description: { en: '', de: '' },
  resourceTypeIds: ['customer'],
  fieldDefinitions: [],
  ...overrides,
});

describe('omitEmptyTranslations', () => {
  it('drops empty-string translations', () => {
    expect(omitEmptyTranslations({ en: 'Hello', de: '', fr: '' })).toEqual({
      en: 'Hello',
    });
  });

  it('drops undefined translations', () => {
    expect(omitEmptyTranslations({ en: 'Hello', de: undefined })).toEqual({
      en: 'Hello',
    });
  });

  it('returns an empty object when every translation is empty', () => {
    expect(omitEmptyTranslations({ en: '', de: '' })).toEqual({});
  });

  it('keeps every non-empty translation', () => {
    expect(omitEmptyTranslations({ en: 'A', de: 'B' })).toEqual({
      en: 'A',
      de: 'B',
    });
  });
});

describe('formValuesToDoc', () => {
  it('maps name/description to *AllLocales arrays without empty translations', () => {
    const doc = formValuesToDoc(
      formValues({
        name: { en: 'Name', de: '' },
        description: { en: 'Desc', de: 'Beschr' },
      })
    );

    expect(doc.nameAllLocales).toEqual([{ locale: 'en', value: 'Name' }]);
    expect(doc.descriptionAllLocales).toHaveLength(2);
    expect(doc.descriptionAllLocales).toEqual(
      expect.arrayContaining([
        { locale: 'en', value: 'Desc' },
        { locale: 'de', value: 'Beschr' },
      ])
    );
  });

  it('yields empty arrays for fully empty localized values', () => {
    const doc = formValuesToDoc(
      formValues({ name: { en: '' }, description: { en: '' } })
    );
    expect(doc.nameAllLocales).toEqual([]);
    expect(doc.descriptionAllLocales).toEqual([]);
  });

  it.each([['' as string | null | undefined], [null], [undefined]])(
    'maps a blank key (%p) to undefined',
    (key) => {
      expect(formValuesToDoc(formValues({ key })).key).toBeUndefined();
    }
  );

  it('keeps a non-blank key', () => {
    expect(formValuesToDoc(formValues({ key: 'abc' })).key).toBe('abc');
  });

  it('does not carry resourceTypeIds or fieldDefinitions into the diff doc', () => {
    const doc = formValuesToDoc(formValues({ resourceTypeIds: ['order'] }));
    expect(Object.keys(doc).sort()).toEqual([
      'descriptionAllLocales',
      'key',
      'nameAllLocales',
    ]);
  });

  it('round-trips the localized fields of a test-data type definition', () => {
    const type = buildTypeDefinition({
      key: 'round-trip',
      name: 'Round trip',
      description: 'A description',
    });
    const doc = formValuesToDoc(
      formValues({
        key: type.key,
        name: Object.fromEntries(
          (type.nameAllLocales ?? []).map((l) => [l.locale, l.value])
        ),
        description: Object.fromEntries(
          (type.descriptionAllLocales ?? []).map((l) => [l.locale, l.value])
        ),
      })
    );

    const strip = (list: Array<{ locale: string; value: string }>) =>
      list.map(({ locale, value }) => ({ locale, value }));
    expect(doc.key).toBe('round-trip');
    expect(doc.nameAllLocales).toEqual(
      expect.arrayContaining(strip(type.nameAllLocales ?? []))
    );
    expect(doc.nameAllLocales).toHaveLength(type.nameAllLocales?.length ?? 0);
    expect(doc.descriptionAllLocales).toHaveLength(
      type.descriptionAllLocales?.length ?? 0
    );
  });
});

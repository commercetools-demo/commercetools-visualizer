import type { TState } from '../../../types/generated/ctp';
import {
  formValuesToState,
  formValuesToStatePartial,
  stateToFormValues,
} from './conversion';
import type { TFormValues } from './states-form';

const languages = ['en', 'de'];

const formValues = (overrides: Partial<TFormValues> = {}): TFormValues => ({
  id: 'state-1',
  initial: true,
  stateType: 'LineItemState',
  key: 'my-state',
  name: { en: 'Name', de: '' },
  description: { en: '', de: '' },
  transitions: ['t1', 't2'],
  ...overrides,
});

describe('stateToFormValues', () => {
  it('returns create-mode defaults with every project language present', () => {
    const values = stateToFormValues(languages);

    expect(values).toEqual({
      id: undefined,
      initial: false,
      stateType: 'LineItemState',
      key: '',
      name: { en: '', de: '' },
      description: { en: '', de: '' },
      transitions: [],
    });
  });

  it('maps an existing state, flattening locales and transition ids', () => {
    const state: Partial<TState> = {
      id: 'abc',
      key: 'k1',
      type: 'PaymentState' as TState['type'],
      initial: true,
      nameAllLocales: [
        { locale: 'en', value: 'Hello' },
      ] as TState['nameAllLocales'],
      descriptionAllLocales: [
        { locale: 'de', value: 'Beschreibung' },
      ] as TState['descriptionAllLocales'],
      transitions: [{ id: 'x' }, { id: 'y' }] as TState['transitions'],
    };

    expect(stateToFormValues(languages, state)).toEqual({
      id: 'abc',
      initial: true,
      stateType: 'PaymentState',
      key: 'k1',
      name: { en: 'Hello', de: '' },
      description: { en: '', de: 'Beschreibung' },
      transitions: ['x', 'y'],
    });
  });

  it('keeps translations for locales that are not project languages', () => {
    const state: Partial<TState> = {
      nameAllLocales: [
        { locale: 'fr', value: 'Bonjour' },
      ] as TState['nameAllLocales'],
    };
    expect(stateToFormValues(languages, state).name).toMatchObject({
      fr: 'Bonjour',
      en: '',
      de: '',
    });
  });
});

describe('formValuesToState', () => {
  it('omits empty translations and builds typed transitions', () => {
    const draft = formValuesToState(formValues());

    expect(draft.key).toBe('my-state');
    expect(draft.type).toBe('LineItemState');
    expect(draft.initial).toBe(true);
    expect(draft.name).toEqual([{ locale: 'en', value: 'Name' }]);
    expect(draft.description).toEqual([]);
    expect(draft.transitions).toEqual([
      { typeId: 'LineItemState', id: 't1' },
      { typeId: 'LineItemState', id: 't2' },
    ]);
  });

  it('defaults a blank key to an empty string', () => {
    expect(formValuesToState(formValues({ key: undefined })).key).toBe('');
  });

  it('handles no transitions', () => {
    expect(
      formValuesToState(formValues({ transitions: [] })).transitions
    ).toEqual([]);
  });
});

describe('formValuesToStatePartial', () => {
  it('maps name/description to the *AllLocales shape used for diffing', () => {
    const partial = formValuesToStatePartial(
      formValues({ description: { en: 'Desc', de: 'Beschr' } })
    );

    expect(partial.nameAllLocales).toEqual([{ locale: 'en', value: 'Name' }]);
    expect(partial.descriptionAllLocales).toEqual(
      expect.arrayContaining([
        { locale: 'en', value: 'Desc' },
        { locale: 'de', value: 'Beschr' },
      ])
    );
    expect(partial.descriptionAllLocales).toHaveLength(2);
  });

  it('maps a blank key to undefined (unlike formValuesToState)', () => {
    expect(
      formValuesToStatePartial(formValues({ key: '' })).key
    ).toBeUndefined();
  });

  it('maps transitions to id-only objects', () => {
    expect(formValuesToStatePartial(formValues()).transitions).toEqual([
      { id: 't1' },
      { id: 't2' },
    ]);
  });

  it('carries type and initial through', () => {
    const partial = formValuesToStatePartial(
      formValues({ stateType: 'ReviewState', initial: false })
    );
    expect(partial.type).toBe('ReviewState');
    expect(partial.initial).toBe(false);
  });
});

import { TState, TStateType } from '../../../types/generated/ctp';
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
  stateType: TStateType.LineItemState,
  key: 'my-state',
  name: { en: 'Name', de: '' },
  description: { en: '', de: '' },
  restrictTransitions: true,
  transitions: ['t1', 't2'],
  roles: [],
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
      restrictTransitions: false,
      transitions: [],
      roles: [],
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
      restrictTransitions: true,
      transitions: ['x', 'y'],
      roles: [],
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
      formValues({ stateType: TStateType.ReviewState, initial: false })
    );
    expect(partial.type).toBe('ReviewState');
    expect(partial.initial).toBe(false);
  });
});

describe('transitions: unset (any) vs empty (final) vs listed', () => {
  const stateWith = (transitions: unknown): Partial<TState> =>
    ({
      id: 's1',
      key: 'k',
      type: 'OrderState',
      transitions,
    } as Partial<TState>);

  it.each([
    ['unset (null)', null, false],
    ['unset (undefined)', undefined, false],
    ['empty list = a final state', [], true],
    ['a list', [{ id: 'x' }], true],
  ])('shows %s as restrictTransitions=%p', (_name, transitions, restricted) => {
    expect(
      stateToFormValues(languages, stateWith(transitions)).restrictTransitions
    ).toBe(restricted);
  });

  it('a new state does not restrict transitions by default', () => {
    expect(stateToFormValues(languages).restrictTransitions).toBe(false);
  });

  describe('when not restricted', () => {
    const unrestricted = formValues({
      restrictTransitions: false,
      transitions: ['stale'],
    });

    it('leaves transitions out of the create draft, ignoring a stale selection', () => {
      expect(formValuesToState(unrestricted).transitions).toBeUndefined();
    });

    it('leaves transitions out of the diffed shape', () => {
      expect(
        formValuesToStatePartial(unrestricted).transitions
      ).toBeUndefined();
    });
  });

  describe('when restricted', () => {
    it('sends an empty list for none selected (a final state)', () => {
      const restricted = formValues({
        restrictTransitions: true,
        transitions: [],
      });
      expect(formValuesToState(restricted).transitions).toEqual([]);
      expect(formValuesToStatePartial(restricted).transitions).toEqual([]);
    });

    it('sends the selected ones', () => {
      const restricted = formValues({
        restrictTransitions: true,
        transitions: ['t1'],
      });
      expect(formValuesToState(restricted).transitions).toEqual([
        { typeId: 'LineItemState', id: 't1' },
      ]);
      expect(formValuesToStatePartial(restricted).transitions).toEqual([
        { id: 't1' },
      ]);
    });
  });
});

describe('roles', () => {
  it('maps the fetched roles into the form, defaulting to none', () => {
    expect(
      stateToFormValues(languages, {
        roles: ['Return'],
      } as unknown as Partial<TState>).roles
    ).toEqual(['Return']);
    expect(stateToFormValues(languages, {}).roles).toEqual([]);
  });

  it('sends the roles in the create draft, and none when there are none', () => {
    expect(formValuesToState(formValues({ roles: ['Return'] })).roles).toEqual([
      'Return',
    ]);
    expect(formValuesToState(formValues({ roles: [] })).roles).toBeUndefined();
  });

  it('carries the roles into the diffed shape', () => {
    expect(
      formValuesToStatePartial(formValues({ roles: ['Return'] })).roles
    ).toEqual(['Return']);
  });
});

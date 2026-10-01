import { TStateType } from '../../types/generated/ctp';
import { calculateStateUpdateActions } from './states-connector';
import { PickedState } from './conversion';

const baseState: PickedState = {
  key: 'my-state',
  type: TStateType.LineItemState,
  nameAllLocales: [{ locale: 'en', value: 'My state' }],
  descriptionAllLocales: [{ locale: 'en', value: 'Description' }],
  initial: false,
  transitions: [],
};

describe('calculateStateUpdateActions', () => {
  it('produces no actions when nothing changed', () => {
    expect(calculateStateUpdateActions(baseState, { ...baseState })).toEqual(
      []
    );
  });

  it('produces a changeName action from a localized-field name diff', () => {
    const next: PickedState = {
      ...baseState,
      nameAllLocales: [{ locale: 'en', value: 'New name' }],
    };
    expect(calculateStateUpdateActions(baseState, next)).toContainEqual({
      setName: { name: [{ locale: 'en', value: 'New name' }] },
    });
  });

  it('produces a setDescription action from a localized-field description diff', () => {
    const next: PickedState = {
      ...baseState,
      descriptionAllLocales: [{ locale: 'en', value: 'New description' }],
    };
    expect(calculateStateUpdateActions(baseState, next)).toContainEqual({
      setDescription: {
        description: [{ locale: 'en', value: 'New description' }],
      },
    });
  });

  it('produces a changeInitial action when initial changes', () => {
    const next: PickedState = { ...baseState, initial: true };
    expect(calculateStateUpdateActions(baseState, next)).toContainEqual({
      changeInitial: { initial: true },
    });
  });
});

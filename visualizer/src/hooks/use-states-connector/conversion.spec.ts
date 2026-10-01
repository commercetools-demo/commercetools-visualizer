import { TState, TStateType } from '../../types/generated/ctp';
import { convertTStateToState, PickedState } from './conversion';

describe('convertTStateToState', () => {
  it('converts localized name/description and transitions to the REST shape', () => {
    const draft: PickedState = {
      key: 'my-state',
      type: TStateType.LineItemState,
      nameAllLocales: [{ locale: 'en', value: 'My state' }],
      descriptionAllLocales: [{ locale: 'en', value: 'Description' }],
      initial: true,
      transitions: [{ id: 'other-state-id' } as TState],
    };

    expect(convertTStateToState(draft)).toEqual({
      key: 'my-state',
      type: 'LineItemState',
      name: { en: 'My state' },
      description: { en: 'Description' },
      initial: true,
      transitions: [{ typeId: 'state', id: 'other-state-id' }],
      roles: [],
    });
  });

  it('maps a blank key to undefined', () => {
    expect(convertTStateToState({ key: '' }).key).toBeUndefined();
  });

  it('maps undefined transitions to undefined, not an empty array', () => {
    expect(
      convertTStateToState({ key: 'my-state' }).transitions
    ).toBeUndefined();
  });
});

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

describe('calculateStateUpdateActions — transitions and roles', () => {
  const state = (overrides: PickedState = {}): PickedState => ({
    ...baseState,
    ...overrides,
  });

  describe('transitions: unset means "any", empty means "final"', () => {
    it('does not touch unset transitions when something else changes', () => {
      // Regression: renaming such a state used to also send `setTransitions: []`,
      // turning it into a final state that allows no transition at all.
      const original = state({ transitions: undefined });
      const next = state({
        transitions: undefined,
        nameAllLocales: [{ locale: 'en', value: 'Renamed' }],
      });
      const kinds = calculateStateUpdateActions(original, next).map(
        (action) => Object.keys(action)[0]
      );
      expect(kinds).toEqual(['setName']);
    });

    it('treats null like unset', () => {
      expect(
        calculateStateUpdateActions(
          state({ transitions: null as unknown as PickedState['transitions'] }),
          state({ transitions: undefined })
        )
      ).toEqual([]);
    });

    it('sends an empty list when "any" becomes "final"', () => {
      expect(
        calculateStateUpdateActions(
          state({ transitions: undefined }),
          state({ transitions: [] })
        )
      ).toEqual([{ setTransitions: { transitions: [] } }]);
    });

    it('sends setTransitions without transitions when a restriction is removed', () => {
      const actions = calculateStateUpdateActions(
        state({ transitions: [{ id: 'a' }] as PickedState['transitions'] }),
        state({ transitions: undefined })
      );
      expect(actions).toHaveLength(1);
      expect(Object.keys(actions[0])).toEqual(['setTransitions']);
      expect(
        (actions[0] as { setTransitions: { transitions?: unknown } })
          .setTransitions.transitions
      ).toBeUndefined();
    });

    it('sends the listed transitions when they change', () => {
      expect(
        calculateStateUpdateActions(
          state({ transitions: [{ id: 'a' }] as PickedState['transitions'] }),
          state({
            transitions: [
              { id: 'a' },
              { id: 'b' },
            ] as PickedState['transitions'],
          })
        )
      ).toEqual([
        {
          setTransitions: {
            transitions: [
              { typeId: 'state', id: 'a' },
              { typeId: 'state', id: 'b' },
            ],
          },
        },
      ]);
    });
  });

  describe('roles', () => {
    it.each([
      ['both none', undefined, undefined],
      ['empty vs none', [], undefined],
      ['same roles', ['Return'], ['Return']],
    ])('produces no action when unchanged (%s)', (_name, a, b) => {
      expect(
        calculateStateUpdateActions(
          state({ roles: a as PickedState['roles'] }),
          state({ roles: b as PickedState['roles'] })
        )
      ).toEqual([]);
    });

    it('produces addRoles when a role is added', () => {
      expect(
        calculateStateUpdateActions(
          state({ roles: [] }),
          state({ roles: ['Return'] as PickedState['roles'] })
        )
      ).toEqual([{ addRoles: { roles: ['Return'] } }]);
    });

    it('produces removeRoles when a role is removed', () => {
      expect(
        calculateStateUpdateActions(
          state({
            roles: ['ReviewIncludedInStatistics'] as PickedState['roles'],
          }),
          state({ roles: [] })
        )
      ).toEqual([{ removeRoles: { roles: ['ReviewIncludedInStatistics'] } }]);
    });

    it('is not confused by a different order of the same roles', () => {
      expect(
        calculateStateUpdateActions(
          state({
            roles: [
              'Return',
              'ReviewIncludedInStatistics',
            ] as PickedState['roles'],
          }),
          state({
            roles: [
              'ReviewIncludedInStatistics',
              'Return',
            ] as PickedState['roles'],
          })
        )
      ).toEqual([]);
    });
  });
});

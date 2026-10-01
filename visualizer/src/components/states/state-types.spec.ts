import {
  STATE_ROLES,
  STATE_ROLES_BY_TYPE,
  STATE_TYPES,
  STATE_TYPE_LABELS,
  allowedRoles,
} from './state-types';
import { resourceTypes } from './states-form/states-form';
import listMessages from './states-list/messages';

// The `StateTypeEnum` and `StateRoleEnum` of the commercetools States API:
// https://docs.commercetools.com/api/projects/states#statetypeenum
// https://docs.commercetools.com/api/projects/states#stateroleenum
// If the API gains a value, add it here *and* in state-types.ts (plus a list tab label).
const OFFICIAL_STATE_TYPES = [
  'OrderState',
  'RecurringOrderState',
  'LineItemState',
  'ProductState',
  'ReviewState',
  'PaymentState',
  'QuoteRequestState',
  'StagedQuoteState',
  'QuoteState',
];
const OFFICIAL_STATE_ROLES = ['ReviewIncludedInStatistics', 'Return'];

describe('state types', () => {
  it('offers every StateTypeEnum value, and nothing else', () => {
    expect([...STATE_TYPES].sort()).toEqual([...OFFICIAL_STATE_TYPES].sort());
  });

  it('has no duplicates', () => {
    expect(new Set(STATE_TYPES).size).toBe(STATE_TYPES.length);
  });

  it('has a label for every type, which the type select offers', () => {
    expect(Object.keys(STATE_TYPE_LABELS).sort()).toEqual(
      [...OFFICIAL_STATE_TYPES].sort()
    );
    expect(resourceTypes.map((type) => type.value).sort()).toEqual(
      [...OFFICIAL_STATE_TYPES].sort()
    );
  });

  it('has a list tab label for every type', () => {
    STATE_TYPES.forEach((type) =>
      expect((listMessages as Record<string, unknown>)[type]).toBeDefined()
    );
  });
});

describe('state roles', () => {
  it('knows every StateRoleEnum value', () => {
    expect([...STATE_ROLES].sort()).toEqual([...OFFICIAL_STATE_ROLES].sort());
  });

  it('only offers a role for the state type it applies to', () => {
    expect(allowedRoles('LineItemState')).toEqual(['Return']);
    expect(allowedRoles('ReviewState')).toEqual(['ReviewIncludedInStatistics']);
  });

  it.each(
    OFFICIAL_STATE_TYPES.filter(
      (type) => !['LineItemState', 'ReviewState'].includes(type)
    )
  )('offers no role for %s', (type) => {
    expect(allowedRoles(type)).toEqual([]);
  });

  it('assigns every role to exactly one type', () => {
    const assigned = Object.values(STATE_ROLES_BY_TYPE).flat();
    expect([...assigned].sort()).toEqual([...OFFICIAL_STATE_ROLES].sort());
  });
});

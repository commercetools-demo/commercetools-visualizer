import { TActionType, TTriggerInput } from '../../../types/generated/ctp';
import {
  RESOURCE_TYPE_IDS,
  setCondition,
  toggleAction,
  triggerCount,
} from './extensions-triggers-form';
import messages from './messages';

// The `ExtensionResourceTypeId` enum from the commercetools API Extensions API:
// https://docs.commercetools.com/api/projects/api-extensions#extensionresourcetypeid
// If the API gains a value, add it here *and* in extensions-triggers-form.tsx (plus an
// `ExtensionsTriggersForm.<id>` message).
const OFFICIAL_EXTENSION_RESOURCE_TYPE_IDS = [
  'cart',
  'order',
  'payment',
  'payment-method',
  'customer',
  'customer-group',
  'quote-request',
  'staged-quote',
  'quote',
  'business-unit',
  'shopping-list',
  'product',
];

describe('extension trigger resource types', () => {
  it('offers every ExtensionResourceTypeId the API allows, and nothing else', () => {
    expect([...RESOURCE_TYPE_IDS].sort()).toEqual(
      [...OFFICIAL_EXTENSION_RESOURCE_TYPE_IDS].sort()
    );
  });

  it('has no duplicates', () => {
    expect(new Set(RESOURCE_TYPE_IDS).size).toBe(RESOURCE_TYPE_IDS.length);
  });

  it('has a label message for every resource type', () => {
    RESOURCE_TYPE_IDS.forEach((id) =>
      expect((messages as Record<string, unknown>)[id]).toBeDefined()
    );
  });
});

describe('toggleAction', () => {
  const cart: TTriggerInput = {
    resourceTypeId: 'cart',
    actions: [TActionType.Create],
    condition: 'customerId is defined',
  };
  const order: TTriggerInput = {
    resourceTypeId: 'order',
    actions: [TActionType.Update],
  };

  it('adds a trigger for a resource that has none, at the end', () => {
    expect(toggleAction([cart], 'product', TActionType.Create, true)).toEqual([
      cart,
      { resourceTypeId: 'product', actions: ['Create'] },
    ]);
  });

  it('works from an empty or missing list', () => {
    expect(toggleAction(undefined, 'cart', TActionType.Update, true)).toEqual([
      { resourceTypeId: 'cart', actions: ['Update'] },
    ]);
  });

  it('keeps the condition of an existing trigger when an action is added', () => {
    expect(toggleAction([cart], 'cart', TActionType.Update, true)).toEqual([
      { ...cart, actions: ['Create', 'Update'] },
    ]);
  });

  it('keeps the condition when an action is removed but another remains', () => {
    expect(
      toggleAction(
        [{ ...cart, actions: [TActionType.Create, TActionType.Update] }],
        'cart',
        TActionType.Create,
        false
      )
    ).toEqual([{ ...cart, actions: ['Update'] }]);
  });

  it('keeps the position of the trigger, so toggling back and forth is not a change', () => {
    const toggledOn = toggleAction(
      [cart, order],
      'cart',
      TActionType.Update,
      true
    );
    expect(toggledOn.map((t) => t.resourceTypeId)).toEqual(['cart', 'order']);
    expect(toggleAction(toggledOn, 'cart', TActionType.Update, false)).toEqual([
      cart,
      order,
    ]);
  });

  it('removes the trigger when its last action is removed', () => {
    expect(
      toggleAction([cart, order], 'cart', TActionType.Create, false)
    ).toEqual([order]);
  });

  it('does not touch other resources', () => {
    expect(
      toggleAction([cart, order], 'order', TActionType.Create, true)
    ).toEqual([cart, { ...order, actions: ['Update', 'Create'] }]);
  });
});

describe('triggerCount', () => {
  it('counts the triggers of one resource type', () => {
    const triggers: Array<TTriggerInput> = [
      { resourceTypeId: 'cart', actions: [TActionType.Create] },
      { resourceTypeId: 'cart', actions: [TActionType.Update] },
      { resourceTypeId: 'order', actions: [TActionType.Create] },
    ];
    expect(triggerCount(triggers, 'cart')).toBe(2);
    expect(triggerCount(triggers, 'order')).toBe(1);
    expect(triggerCount(triggers, 'product')).toBe(0);
    expect(triggerCount(undefined, 'cart')).toBe(0);
  });
});

describe('several triggers for one resource type', () => {
  // The API allows these (each with its own condition); the matrix can't represent them,
  // so editing must leave them alone.
  const triggers: Array<TTriggerInput> = [
    {
      resourceTypeId: 'cart',
      actions: [TActionType.Create],
      condition: 'customerId is defined',
    },
    {
      resourceTypeId: 'cart',
      actions: [TActionType.Update],
      condition: 'totalPrice.centAmount > 1000',
    },
    { resourceTypeId: 'order', actions: [TActionType.Create] },
  ];

  it('toggleAction leaves them untouched (neither merges nor drops)', () => {
    expect(toggleAction(triggers, 'cart', TActionType.Update, false)).toBe(
      triggers
    );
    expect(toggleAction(triggers, 'cart', TActionType.Create, true)).toBe(
      triggers
    );
  });

  it('setCondition leaves them untouched', () => {
    expect(setCondition(triggers, 'cart', 'x is defined')).toBe(triggers);
  });

  it('still edits other resources', () => {
    expect(toggleAction(triggers, 'order', TActionType.Update, true)).toEqual([
      triggers[0],
      triggers[1],
      { resourceTypeId: 'order', actions: ['Create', 'Update'] },
    ]);
  });
});

describe('setCondition', () => {
  const cart: TTriggerInput = {
    resourceTypeId: 'cart',
    actions: [TActionType.Create],
  };
  const order: TTriggerInput = {
    resourceTypeId: 'order',
    actions: [TActionType.Update],
    condition: 'old',
  };

  it('sets a condition on the trigger, in place', () => {
    expect(
      setCondition([cart, order], 'cart', 'customerId is defined')
    ).toEqual([{ ...cart, condition: 'customerId is defined' }, order]);
  });

  it('replaces an existing condition', () => {
    expect(setCondition([order], 'order', 'new')).toEqual([
      { ...order, condition: 'new' },
    ]);
  });

  it.each(['', '   '])(
    'removes the condition for the blank value %p',
    (blank) => {
      const result = setCondition([order], 'order', blank);
      expect(result).toEqual([
        { resourceTypeId: 'order', actions: [TActionType.Update] },
      ]);
      expect(result[0]).not.toHaveProperty('condition');
    }
  );

  it('does nothing for a resource type without a trigger', () => {
    expect(setCondition([cart], 'order', 'x')).toEqual([cart]);
    expect(setCondition(undefined, 'order', 'x')).toEqual([]);
  });

  it('keeps the actions', () => {
    expect(
      setCondition(
        [
          {
            resourceTypeId: 'cart',
            actions: [TActionType.Create, TActionType.Update],
          },
        ],
        'cart',
        'x is defined'
      )[0].actions
    ).toEqual(['Create', 'Update']);
  });
});

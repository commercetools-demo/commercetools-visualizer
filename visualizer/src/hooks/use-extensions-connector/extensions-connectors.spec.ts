import { calculateExtensionsUpdateActions } from './extensions-connectors';
import {
  TActionType,
  TExtension,
  TExtensionDraft,
} from '../../types/generated/ctp';

const baseExtension: TExtension = {
  __typename: 'Extension',
  id: 'ext-id',
  version: 1,
  key: 'my-extension',
  destination: {
    __typename: 'HttpDestination',
    type: 'HTTP',
    url: 'https://example.com',
  },
  triggers: [
    {
      __typename: 'ExtensionTrigger',
      resourceTypeId: 'cart',
      actions: [TActionType.Create],
      condition: undefined,
    },
  ],
  timeoutInMs: undefined,
} as unknown as TExtension;

const baseDraft: TExtensionDraft = {
  key: 'my-extension',
  destination: { HTTP: { url: 'https://example.com' } },
  triggers: [{ resourceTypeId: 'cart', actions: [TActionType.Create] }],
};

describe('calculateExtensionsUpdateActions', () => {
  it('produces no actions when nothing changed', () => {
    expect(
      calculateExtensionsUpdateActions(baseExtension, { ...baseDraft })
    ).toEqual([]);
  });

  it('produces a changeDestination action, converting the HTTP AuthorizationHeader auth', () => {
    const next: TExtensionDraft = {
      ...baseDraft,
      destination: {
        HTTP: {
          url: 'https://example.com',
          authentication: {
            AuthorizationHeader: { headerValue: 'Bearer token' },
          },
        },
      },
    };

    expect(
      calculateExtensionsUpdateActions(baseExtension, next)
    ).toContainEqual({
      changeDestination: {
        destination: {
          HTTP: {
            url: 'https://example.com',
            authentication: {
              AuthorizationHeader: { headerValue: 'Bearer token' },
            },
          },
        },
      },
    });
  });

  it('produces a changeTriggers action when the triggers list changes', () => {
    const next: TExtensionDraft = {
      ...baseDraft,
      triggers: [
        {
          resourceTypeId: 'cart',
          actions: [TActionType.Create, TActionType.Update],
        },
      ],
    };

    const actions = calculateExtensionsUpdateActions(baseExtension, next);
    expect(actions.length).toBeGreaterThan(0);
  });
});

describe('calculateExtensionsUpdateActions — destinations and timeout', () => {
  const lambdaExtension = (overrides: object = {}): TExtension =>
    ({
      ...baseExtension,
      destination: {
        __typename: 'AWSLambdaDestination',
        type: 'AWSLambda',
        arn: 'arn:aws:lambda:eu-west-1:123456789012:function:old',
        accessKey: 'AKIAXXXX',
        accessSecret: 'secret',
        ...overrides,
      },
    } as unknown as TExtension);
  const lambdaDraft = (overrides: object = {}): TExtensionDraft => ({
    ...baseDraft,
    destination: {
      AWSLambda: {
        arn: 'arn:aws:lambda:eu-west-1:123456789012:function:old',
        accessKey: 'AKIAXXXX',
        accessSecret: 'secret',
        ...overrides,
      },
    },
  });

  it('produces no actions for an unchanged AWS Lambda destination', () => {
    expect(
      calculateExtensionsUpdateActions(lambdaExtension(), lambdaDraft())
    ).toEqual([]);
  });

  it.each([
    ['arn', 'arn:aws:lambda:eu-west-1:123456789012:function:new'],
    ['accessKey', 'AKIANEW'],
    ['accessSecret', 'new-secret'],
  ])(
    'produces changeDestination when the AWS Lambda %s changes',
    (field, value) => {
      expect(
        calculateExtensionsUpdateActions(
          lambdaExtension(),
          lambdaDraft({ [field]: value })
        )
      ).toEqual([
        {
          changeDestination: {
            destination: {
              AWSLambda: expect.objectContaining({ [field]: value }),
            },
          },
        },
      ]);
    }
  );

  it('sends the complete AWS Lambda destination, not just the changed field', () => {
    const [action] = calculateExtensionsUpdateActions(
      lambdaExtension(),
      lambdaDraft({ arn: 'arn:new' })
    ) as Array<{
      changeDestination: { destination: { AWSLambda: object } };
    }>;
    expect(action.changeDestination.destination.AWSLambda).toEqual({
      arn: 'arn:new',
      accessKey: 'AKIAXXXX',
      accessSecret: 'secret',
    });
  });

  it('produces a complete changeDestination when switching from HTTP to AWS Lambda', () => {
    expect(
      calculateExtensionsUpdateActions(baseExtension, lambdaDraft())
    ).toEqual([
      {
        changeDestination: {
          destination: {
            AWSLambda: {
              arn: 'arn:aws:lambda:eu-west-1:123456789012:function:old',
              accessKey: 'AKIAXXXX',
              accessSecret: 'secret',
            },
          },
        },
      },
    ]);
  });

  describe('Google Cloud Function', () => {
    const gcfExtension = (url: string): TExtension =>
      ({
        ...baseExtension,
        destination: {
          __typename: 'GoogleCloudFunctionDestination',
          type: 'GoogleCloudFunction',
          url,
        },
      } as unknown as TExtension);
    const gcfDraft = (url: string): TExtensionDraft => ({
      ...baseDraft,
      destination: { GoogleCloudFunction: { url } },
    });

    it('produces no actions when unchanged', () => {
      expect(
        calculateExtensionsUpdateActions(
          gcfExtension('https://fn.example.com'),
          gcfDraft('https://fn.example.com')
        )
      ).toEqual([]);
    });

    it('produces changeDestination when the URL changes', () => {
      expect(
        calculateExtensionsUpdateActions(
          gcfExtension('https://fn.example.com'),
          gcfDraft('https://other.example.com')
        )
      ).toEqual([
        {
          changeDestination: {
            destination: {
              GoogleCloudFunction: { url: 'https://other.example.com' },
            },
          },
        },
      ]);
    });
  });

  describe('timeoutInMs', () => {
    const withTimeout = (timeoutInMs: number | null | undefined) =>
      ({ ...baseExtension, timeoutInMs } as unknown as TExtension);

    it.each([
      ['both unset', undefined, undefined],
      ['null vs unset', null, undefined],
      ['unchanged', 2000, 2000],
    ])('produces no actions when the timeout is unchanged (%s)', (_n, a, b) => {
      expect(
        calculateExtensionsUpdateActions(withTimeout(a), {
          ...baseDraft,
          timeoutInMs: b,
        })
      ).toEqual([]);
    });

    it('produces setTimeoutInMs when a timeout is set', () => {
      expect(
        calculateExtensionsUpdateActions(withTimeout(undefined), {
          ...baseDraft,
          timeoutInMs: 5000,
        })
      ).toEqual([{ setTimeoutInMs: { timeoutInMs: 5000 } }]);
    });

    it('produces setTimeoutInMs when the timeout changes', () => {
      expect(
        calculateExtensionsUpdateActions(withTimeout(2000), {
          ...baseDraft,
          timeoutInMs: 3000,
        })
      ).toEqual([{ setTimeoutInMs: { timeoutInMs: 3000 } }]);
    });

    it('produces setTimeoutInMs without a value when the timeout is removed (back to the default)', () => {
      const actions = calculateExtensionsUpdateActions(withTimeout(2000), {
        ...baseDraft,
        timeoutInMs: undefined,
      });
      expect(actions).toHaveLength(1);
      expect(Object.keys(actions[0])).toEqual(['setTimeoutInMs']);
      expect(
        (actions[0] as { setTimeoutInMs: { timeoutInMs?: number } })
          .setTimeoutInMs.timeoutInMs
      ).toBeUndefined();
    });
  });
});

describe('calculateExtensionsUpdateActions — dependencies, expansion paths, additional context', () => {
  const extension = (overrides: object = {}): TExtension =>
    ({ ...baseExtension, ...overrides } as unknown as TExtension);
  const ref = (id: string) => ({
    __typename: 'Reference',
    typeId: 'extension',
    id,
  });

  describe('dependencies', () => {
    it.each([
      ['both empty', undefined, undefined],
      ['empty vs none', [], undefined],
      [
        'same dependencies in a different order',
        [ref('a'), ref('b')],
        [
          { typeId: 'extension', id: 'b' },
          { typeId: 'extension', id: 'a' },
        ],
      ],
    ])('produces no action when unchanged (%s)', (_name, original, next) => {
      expect(
        calculateExtensionsUpdateActions(
          extension({ dependenciesRef: original }),
          { ...baseDraft, dependencies: next }
        )
      ).toEqual([]);
    });

    it('produces setDependencies when a dependency is added', () => {
      expect(
        calculateExtensionsUpdateActions(extension({ dependenciesRef: [] }), {
          ...baseDraft,
          dependencies: [{ typeId: 'extension', id: 'a' }],
        })
      ).toEqual([
        {
          setDependencies: { dependencies: [{ typeId: 'extension', id: 'a' }] },
        },
      ]);
    });

    it('produces setDependencies with the full new list when one is swapped', () => {
      expect(
        calculateExtensionsUpdateActions(
          extension({ dependenciesRef: [ref('a'), ref('b')] }),
          {
            ...baseDraft,
            dependencies: [
              { typeId: 'extension', id: 'a' },
              { typeId: 'extension', id: 'c' },
            ],
          }
        )
      ).toEqual([
        {
          setDependencies: {
            dependencies: [
              { typeId: 'extension', id: 'a' },
              { typeId: 'extension', id: 'c' },
            ],
          },
        },
      ]);
    });

    it('produces setDependencies with an empty list when all are removed', () => {
      expect(
        calculateExtensionsUpdateActions(
          extension({ dependenciesRef: [ref('a')] }),
          { ...baseDraft, dependencies: undefined }
        )
      ).toEqual([{ setDependencies: { dependencies: [] } }]);
    });
  });

  describe('expansion paths', () => {
    it.each([
      ['both empty', undefined, undefined],
      ['empty vs none', [], undefined],
      ['same paths', ['a', 'b'], ['b', 'a']],
    ])('produces no action when unchanged (%s)', (_name, original, next) => {
      expect(
        calculateExtensionsUpdateActions(
          extension({ expansionPaths: original }),
          { ...baseDraft, expansionPaths: next }
        )
      ).toEqual([]);
    });

    it('produces setExpansionPaths when a path is added or changed', () => {
      expect(
        calculateExtensionsUpdateActions(extension({ expansionPaths: ['a'] }), {
          ...baseDraft,
          expansionPaths: ['a', 'lineItems[*].variant'],
        })
      ).toEqual([
        {
          setExpansionPaths: { expansionPaths: ['a', 'lineItems[*].variant'] },
        },
      ]);
    });

    it('produces setExpansionPaths with an empty list when all are removed', () => {
      expect(
        calculateExtensionsUpdateActions(extension({ expansionPaths: ['a'] }), {
          ...baseDraft,
          expansionPaths: undefined,
        })
      ).toEqual([{ setExpansionPaths: { expansionPaths: [] } }]);
    });
  });

  describe('additional context (includeOldResource)', () => {
    it.each([
      ['unset on both sides', null, undefined],
      ['false vs unset', { includeOldResource: false }, undefined],
      [
        'true on both',
        { includeOldResource: true },
        { includeOldResource: true },
      ],
    ])('produces no action when unchanged (%s)', (_name, original, next) => {
      expect(
        calculateExtensionsUpdateActions(
          extension({ additionalContext: original }),
          { ...baseDraft, additionalContext: next }
        )
      ).toEqual([]);
    });

    it('produces setAdditionalContext when it is switched on', () => {
      expect(
        calculateExtensionsUpdateActions(
          extension({ additionalContext: { includeOldResource: false } }),
          { ...baseDraft, additionalContext: { includeOldResource: true } }
        )
      ).toEqual([
        {
          setAdditionalContext: {
            additionalContext: { includeOldResource: true },
          },
        },
      ]);
    });

    it('produces setAdditionalContext with false when it is switched off (the draft then omits it)', () => {
      expect(
        calculateExtensionsUpdateActions(
          extension({ additionalContext: { includeOldResource: true } }),
          { ...baseDraft, additionalContext: undefined }
        )
      ).toEqual([
        {
          setAdditionalContext: {
            additionalContext: { includeOldResource: false },
          },
        },
      ]);
    });
  });

  it('combines the new actions with the others', () => {
    const actions = calculateExtensionsUpdateActions(
      extension({ timeoutInMs: 1000 }),
      {
        ...baseDraft,
        timeoutInMs: 2000,
        expansionPaths: ['a'],
        dependencies: [{ typeId: 'extension', id: 'x' }],
        additionalContext: { includeOldResource: true },
      }
    );
    expect(actions.map((a) => Object.keys(a)[0]).sort()).toEqual([
      'setAdditionalContext',
      'setDependencies',
      'setExpansionPaths',
      'setTimeoutInMs',
    ]);
  });
});

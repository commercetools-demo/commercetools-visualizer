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

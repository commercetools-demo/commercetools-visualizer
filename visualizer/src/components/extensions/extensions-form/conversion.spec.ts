import {
  TActionType,
  type TExtension,
  type TTriggerInput,
} from '../../../types/generated/ctp';
import { tExtensionToFormValues, formValuesToTExtension } from './conversion';
import type { TFormValues } from './extensions-form';

const baseExtension = {
  key: 'my-extension',
  triggers: [
    {
      resourceTypeId: 'cart',
      actions: ['Create', 'Update'],
      condition: 'customerId is defined',
    },
  ],
} as const;

describe('tExtensionToFormValues', () => {
  it('returns HTTP defaults with no triggers when there is no extension', () => {
    expect(tExtensionToFormValues()).toEqual({
      key: '',
      triggers: [],
      destinationName: 'HTTP',
      destinationHttpUrl: undefined,
      destinationHttpAuthenticationName: '',
      destinationHttpAuthenticationAuthorizationHeaderValue: undefined,
      destinationHttpAuthenticationAuthorizationKey: undefined,
      destinationAwsAccessKey: undefined,
      destinationAwsAccessSecret: undefined,
      destinationAwsArn: undefined,
    });
  });

  it('maps an HTTP destination without authentication', () => {
    const extension = {
      ...baseExtension,
      destination: { type: 'HTTP', url: 'https://example.com/hook' },
    } as unknown as TExtension;

    const values = tExtensionToFormValues(extension);

    expect(values.destinationName).toBe('HTTP');
    expect(values.destinationHttpUrl).toBe('https://example.com/hook');
    expect(values.destinationHttpAuthenticationName).toBe('');
    expect(values.key).toBe('my-extension');
  });

  it('maps an HTTP destination with AuthorizationHeader authentication', () => {
    const extension = {
      ...baseExtension,
      destination: {
        type: 'HTTP',
        url: 'https://example.com/hook',
        authentication: {
          type: 'AuthorizationHeader',
          headerValue: 'Basic abc',
        },
      },
    } as unknown as TExtension;

    const values = tExtensionToFormValues(extension);

    expect(values.destinationHttpAuthenticationName).toBe(
      'AuthorizationHeader'
    );
    expect(values.destinationHttpAuthenticationAuthorizationHeaderValue).toBe(
      'Basic abc'
    );
    expect(
      values.destinationHttpAuthenticationAuthorizationKey
    ).toBeUndefined();
  });

  it('maps an HTTP destination with AzureFunctions authentication', () => {
    const extension = {
      ...baseExtension,
      destination: {
        type: 'HTTP',
        url: 'https://example.azurewebsites.net/api',
        authentication: {
          type: 'AzureFunctionsAuthentication',
          key: 'azure-key',
        },
      },
    } as unknown as TExtension;

    const values = tExtensionToFormValues(extension);

    expect(values.destinationHttpAuthenticationName).toBe('AzureFunctions');
    expect(values.destinationHttpAuthenticationAuthorizationKey).toBe(
      'azure-key'
    );
    expect(
      values.destinationHttpAuthenticationAuthorizationHeaderValue
    ).toBeUndefined();
  });

  it('maps an AWS Lambda destination', () => {
    const extension = {
      ...baseExtension,
      destination: {
        type: 'AWSLambda',
        accessKey: 'AKIA123',
        accessSecret: 'secret',
        arn: 'arn:aws:lambda:eu-west-1:123:function:fn',
      },
    } as unknown as TExtension;

    const values = tExtensionToFormValues(extension);

    expect(values.destinationName).toBe('AWSLambda');
    expect(values.destinationAwsAccessKey).toBe('AKIA123');
    expect(values.destinationAwsAccessSecret).toBe('secret');
    expect(values.destinationAwsArn).toBe(
      'arn:aws:lambda:eu-west-1:123:function:fn'
    );
    expect(values.destinationHttpUrl).toBeUndefined();
  });

  it('copies triggers (resource type, condition, actions) into a new array', () => {
    const extension = {
      ...baseExtension,
      destination: { type: 'HTTP', url: 'https://example.com' },
    } as unknown as TExtension;

    const values = tExtensionToFormValues(extension);

    expect(values.triggers).toEqual([
      {
        resourceTypeId: 'cart',
        condition: 'customerId is defined',
        actions: ['Create', 'Update'],
      },
    ]);
    expect(values.triggers[0].actions).not.toBe(extension.triggers[0].actions);
  });

  it('strips extra trigger fields such as __typename', () => {
    const extension = {
      key: 'k1',
      destination: { type: 'HTTP', url: 'https://example.com' },
      triggers: [
        {
          __typename: 'Trigger',
          resourceTypeId: 'order',
          actions: ['Create'],
          condition: null,
        },
      ],
    } as unknown as TExtension;

    expect(tExtensionToFormValues(extension).triggers).toEqual([
      { resourceTypeId: 'order', actions: ['Create'], condition: null },
    ]);
  });
});

describe('formValuesToTExtension', () => {
  const triggers: Array<TTriggerInput> = [
    { resourceTypeId: 'cart', actions: [TActionType.Create] },
  ];

  it('builds an HTTP destination without authentication', () => {
    const values: TFormValues = {
      key: 'my-extension',
      destinationName: 'HTTP',
      destinationHttpUrl: 'https://example.com/hook',
      destinationHttpAuthenticationName: '',
      triggers,
    };

    expect(formValuesToTExtension(values)).toEqual({
      key: 'my-extension',
      destination: {
        HTTP: { url: 'https://example.com/hook', authentication: undefined },
      },
      triggers,
    });
  });

  it('builds an HTTP destination with AuthorizationHeader authentication', () => {
    const draft = formValuesToTExtension({
      key: 'k1',
      destinationName: 'HTTP',
      destinationHttpUrl: 'https://example.com',
      destinationHttpAuthenticationName: 'AuthorizationHeader',
      destinationHttpAuthenticationAuthorizationHeaderValue: 'Bearer xyz',
      triggers,
    });

    expect(draft.destination.HTTP?.authentication).toEqual({
      AuthorizationHeader: { headerValue: 'Bearer xyz' },
    });
  });

  it('builds an HTTP destination with AzureFunctions authentication', () => {
    const draft = formValuesToTExtension({
      key: 'k1',
      destinationName: 'HTTP',
      destinationHttpUrl: 'https://example.com',
      destinationHttpAuthenticationName: 'AzureFunctions',
      destinationHttpAuthenticationAuthorizationKey: 'az-key',
      triggers,
    });

    expect(draft.destination.HTTP?.authentication).toEqual({
      AzureFunctions: { key: 'az-key' },
    });
  });

  it('defaults missing URL and credentials to empty strings', () => {
    const draft = formValuesToTExtension({
      key: 'k1',
      destinationName: 'HTTP',
      destinationHttpAuthenticationName: 'AuthorizationHeader',
      triggers,
    });

    expect(draft.destination.HTTP?.url).toBe('');
    expect(draft.destination.HTTP?.authentication).toEqual({
      AuthorizationHeader: { headerValue: '' },
    });
  });

  it('builds an AWS Lambda destination and no HTTP destination', () => {
    const draft = formValuesToTExtension({
      key: 'k1',
      destinationName: 'AWSLambda',
      destinationAwsAccessKey: 'AKIA',
      destinationAwsAccessSecret: 'secret',
      destinationAwsArn: 'arn:aws:lambda:x',
      triggers,
    });

    expect(draft.destination).toEqual({
      AWSLambda: {
        accessKey: 'AKIA',
        accessSecret: 'secret',
        arn: 'arn:aws:lambda:x',
      },
    });
  });

  it('defaults missing AWS fields to empty strings', () => {
    const draft = formValuesToTExtension({
      key: 'k1',
      destinationName: 'AWSLambda',
      triggers,
    });
    expect(draft.destination.AWSLambda).toEqual({
      accessKey: '',
      accessSecret: '',
      arn: '',
    });
  });

  it('round-trips an HTTP extension with header authentication', () => {
    const extension = {
      ...baseExtension,
      destination: {
        type: 'HTTP',
        url: 'https://example.com',
        authentication: { type: 'AuthorizationHeader', headerValue: 'Basic 1' },
      },
    } as unknown as TExtension;

    const draft = formValuesToTExtension(tExtensionToFormValues(extension));

    expect(draft.key).toBe('my-extension');
    expect(draft.destination.HTTP).toEqual({
      url: 'https://example.com',
      authentication: { AuthorizationHeader: { headerValue: 'Basic 1' } },
    });
  });
});

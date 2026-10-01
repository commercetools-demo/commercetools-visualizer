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
      includeOldResource: false,
      expansionPaths: [],
      dependencies: [],
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

describe('Google Cloud Function destination', () => {
  it('maps a fetched Google Cloud Function destination to form values', () => {
    const extension = {
      ...baseExtension,
      destination: {
        type: 'GoogleCloudFunction',
        url: 'https://europe-west1-proj.cloudfunctions.net/fn',
      },
    } as unknown as TExtension;

    const values = tExtensionToFormValues(extension);

    expect(values.destinationName).toBe('GoogleCloudFunction');
    expect(values.destinationGcfUrl).toBe(
      'https://europe-west1-proj.cloudfunctions.net/fn'
    );
    expect(values.destinationHttpUrl).toBeUndefined();
  });

  it('builds a Google Cloud Function destination and no other destination', () => {
    const draft = formValuesToTExtension({
      key: 'k1',
      destinationName: 'GoogleCloudFunction',
      destinationGcfUrl: 'https://fn.example.com',
      triggers: [],
    });
    expect(draft.destination).toEqual({
      GoogleCloudFunction: { url: 'https://fn.example.com' },
    });
  });

  it('defaults a missing URL to an empty string', () => {
    expect(
      formValuesToTExtension({
        key: 'k1',
        destinationName: 'GoogleCloudFunction',
        triggers: [],
      }).destination.GoogleCloudFunction
    ).toEqual({ url: '' });
  });
});

describe('timeoutInMs', () => {
  const http = {
    ...baseExtension,
    destination: { type: 'HTTP', url: 'https://example.com' },
  };

  it('shows a fetched timeout as text in the form', () => {
    expect(
      tExtensionToFormValues({
        ...http,
        timeoutInMs: 2500,
      } as unknown as TExtension).timeoutInMs
    ).toBe('2500');
  });

  it('leaves the field empty when the extension has no timeout', () => {
    expect(
      tExtensionToFormValues({
        ...http,
        timeoutInMs: null,
      } as unknown as TExtension).timeoutInMs
    ).toBeUndefined();
    expect(tExtensionToFormValues().timeoutInMs).toBeUndefined();
  });

  it.each([
    ['5000', 5000],
    [' 750 ', 750],
    ['', undefined],
    ['   ', undefined],
    [undefined, undefined],
  ])('converts the text %p to %p on save', (text, expected) => {
    expect(
      formValuesToTExtension({
        key: 'k1',
        destinationName: 'HTTP',
        destinationHttpUrl: 'https://example.com',
        timeoutInMs: text,
        triggers: [],
      }).timeoutInMs
    ).toBe(expected);
  });
});

describe('expansion paths, dependencies and additional context', () => {
  const http = {
    ...baseExtension,
    destination: { type: 'HTTP', url: 'https://example.com' },
  };

  it('maps the fetched values into the form', () => {
    const values = tExtensionToFormValues({
      ...http,
      expansionPaths: ['lineItems[*].variant', 'customerGroup'],
      additionalContext: { includeOldResource: true },
      dependenciesRef: [
        { typeId: 'extension', id: 'ext-1' },
        { typeId: 'extension', id: 'ext-2' },
      ],
    } as unknown as TExtension);

    expect(values.expansionPaths).toEqual([
      'lineItems[*].variant',
      'customerGroup',
    ]);
    expect(values.includeOldResource).toBe(true);
    expect(values.dependencies).toEqual(['ext-1', 'ext-2']);
  });

  it('treats missing/null values as empty', () => {
    const values = tExtensionToFormValues({
      ...http,
      expansionPaths: undefined,
      additionalContext: null,
      dependenciesRef: undefined,
    } as unknown as TExtension);

    expect(values.expansionPaths).toEqual([]);
    expect(values.includeOldResource).toBe(false);
    expect(values.dependencies).toEqual([]);
  });

  const formValues = (extra: Partial<TFormValues>): TFormValues => ({
    key: 'k1',
    destinationName: 'HTTP',
    destinationHttpUrl: 'https://example.com',
    triggers: [],
    ...extra,
  });

  it('builds the draft fields from the form', () => {
    const draft = formValuesToTExtension(
      formValues({
        expansionPaths: ['a', 'b'],
        includeOldResource: true,
        dependencies: ['ext-1'],
      })
    );

    expect(draft.expansionPaths).toEqual(['a', 'b']);
    expect(draft.additionalContext).toEqual({ includeOldResource: true });
    expect(draft.dependencies).toEqual([{ typeId: 'extension', id: 'ext-1' }]);
  });

  it('leaves empty/false values out of the draft', () => {
    const draft = formValuesToTExtension(
      formValues({
        expansionPaths: [],
        includeOldResource: false,
        dependencies: [],
      })
    );

    expect(draft.expansionPaths).toBeUndefined();
    expect(draft.additionalContext).toBeUndefined();
    expect(draft.dependencies).toBeUndefined();
  });

  it('trims expansion paths and drops blank rows on save', () => {
    expect(
      formValuesToTExtension(
        formValues({ expansionPaths: ['  lineItems[*].variant ', '', '   '] })
      ).expansionPaths
    ).toEqual(['lineItems[*].variant']);
  });
});

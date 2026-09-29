import { ApolloError } from '@apollo/client';
import {
  createGraphQlUpdateActions,
  extractErrorFromGraphQlResponse,
  getErrorMessage,
  transformLocalizedFieldToLocalizedString,
} from './graphql-helpers';
import { TAwsAuthenticationMode } from '../../types/generated/ctp';

describe('getErrorMessage', () => {
  it('joins all graphQLErrors messages', () => {
    const error = new ApolloError({
      graphQLErrors: [{ message: 'first' }, { message: 'second' }],
    });
    expect(getErrorMessage(error)).toEqual('first\nsecond');
  });

  it('falls back to the top-level message when there are no graphQLErrors', () => {
    const error = new ApolloError({ errorMessage: 'network down' });
    expect(getErrorMessage(error)).toEqual('network down');
  });
});

describe('extractErrorFromGraphQlResponse', () => {
  it('returns the networkError result errors when present', () => {
    const networkErrors = [{ message: 'server exploded' }];
    const error = new ApolloError({
      errorMessage: 'network error',
      networkError: {
        name: 'ServerError',
        message: 'network error',
        response: {} as Response,
        statusCode: 500,
        result: { errors: networkErrors },
      },
    });
    expect(extractErrorFromGraphQlResponse(error)).toEqual(networkErrors);
  });

  it('returns graphQLErrors when there is no server networkError', () => {
    const error = new ApolloError({
      graphQLErrors: [{ message: 'boom' }],
    });
    expect(extractErrorFromGraphQlResponse(error)).toEqual(error.graphQLErrors);
  });

  it('returns the value unchanged when it is not an ApolloError', () => {
    const notAnError = { some: 'random object' };
    expect(extractErrorFromGraphQlResponse(notAnError)).toBe(notAnError);
  });
});

describe('transformLocalizedFieldToLocalizedString', () => {
  it('converts a LocalizedField array into a locale->value record', () => {
    expect(
      transformLocalizedFieldToLocalizedString([
        { locale: 'en', value: 'Hello' },
        { locale: 'de', value: 'Hallo' },
      ])
    ).toEqual({ en: 'Hello', de: 'Hallo' });
  });

  it('returns an empty object for undefined/null input', () => {
    expect(transformLocalizedFieldToLocalizedString(undefined)).toEqual({});
    expect(transformLocalizedFieldToLocalizedString(null)).toEqual({});
  });
});

describe('createGraphQlUpdateActions', () => {
  it('converts setName/changeName localized payloads into the GraphQL localized-field shape', () => {
    const [setNameAction, changeNameAction] = createGraphQlUpdateActions([
      { action: 'setName', name: { en: 'New name' } },
      { action: 'changeName', name: { en: 'Changed name' } },
    ]);
    expect(setNameAction).toEqual({
      setName: { name: [{ locale: 'en', value: 'New name' }] },
    });
    expect(changeNameAction).toEqual({
      changeName: { name: [{ locale: 'en', value: 'Changed name' }] },
    });
  });

  it('converts a setDescription localized payload', () => {
    const [action] = createGraphQlUpdateActions([
      { action: 'setDescription', description: { en: 'New description' } },
    ]);
    expect(action).toEqual({
      setDescription: {
        description: [{ locale: 'en', value: 'New description' }],
      },
    });
  });

  it('converts a changeLabel localized payload, keeping fieldName untouched', () => {
    const [action] = createGraphQlUpdateActions([
      {
        action: 'changeLabel',
        fieldName: 'myField',
        label: { en: 'New label' },
      },
    ]);
    expect(action).toEqual({
      changeLabel: {
        fieldName: 'myField',
        label: [{ locale: 'en', value: 'New label' }],
      },
    });
  });

  it.each(['changeLocalizedEnumValueLabel', 'addLocalizedEnumValue'] as const)(
    'converts a %s payload, localizing the enum value label',
    (action) => {
      const [result] = createGraphQlUpdateActions([
        {
          action,
          fieldName: 'myField',
          value: { key: 'foo', label: { en: 'Foo' } },
        },
      ]);
      expect(result).toEqual({
        [action]: {
          fieldName: 'myField',
          value: { key: 'foo', label: [{ locale: 'en', value: 'Foo' }] },
        },
      });
    }
  );

  it('leaves actions it does not special-case untouched aside from stripping `action`', () => {
    const [action] = createGraphQlUpdateActions([
      { action: 'removeFieldDefinition', fieldName: 'myField' },
    ]);
    expect(action).toEqual({
      removeFieldDefinition: { fieldName: 'myField' },
    });
  });

  describe('changeDestination', () => {
    it('converts an HTTP destination with AuthorizationHeader authentication', () => {
      const [action] = createGraphQlUpdateActions([
        {
          action: 'changeDestination',
          destination: {
            type: 'HTTP',
            url: 'https://example.com',
            authentication: {
              type: 'AuthorizationHeader',
              headerValue: 'Bearer token',
            },
          },
        },
      ]);
      expect(action).toEqual({
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

    it('converts an HTTP destination with AzureFunctions authentication', () => {
      const [action] = createGraphQlUpdateActions([
        {
          action: 'changeDestination',
          destination: {
            type: 'HTTP',
            url: 'https://example.com',
            authentication: { type: 'AzureFunctions', key: 'azure-key' },
          },
        },
      ]);
      expect(action).toEqual({
        changeDestination: {
          destination: {
            HTTP: {
              url: 'https://example.com',
              authentication: { AzureFunctions: { key: 'azure-key' } },
            },
          },
        },
      });
    });

    it('converts an HTTP destination without authentication', () => {
      const [action] = createGraphQlUpdateActions([
        {
          action: 'changeDestination',
          destination: { type: 'HTTP', url: 'https://example.com' },
        },
      ]);
      expect(action).toEqual({
        changeDestination: {
          destination: { HTTP: { url: 'https://example.com' } },
        },
      });
    });

    it('converts an AWSLambda destination', () => {
      const [action] = createGraphQlUpdateActions([
        {
          action: 'changeDestination',
          destination: {
            type: 'AWSLambda',
            accessKey: 'accessKey',
            accessSecret: 'accessSecret',
            arn: 'arn:aws:lambda:...',
          },
        },
      ]);
      expect(action).toEqual({
        changeDestination: {
          destination: {
            AWSLambda: {
              accessKey: 'accessKey',
              accessSecret: 'accessSecret',
              arn: 'arn:aws:lambda:...',
            },
          },
        },
      });
    });

    it('converts a GoogleCloudFunction destination', () => {
      const [action] = createGraphQlUpdateActions([
        {
          action: 'changeDestination',
          destination: { type: 'GoogleCloudFunction', url: 'https://gcf' },
        },
      ]);
      expect(action).toEqual({
        changeDestination: {
          destination: { GoogleCloudFunction: { url: 'https://gcf' } },
        },
      });
    });

    it('converts a GoogleCloudPubSub destination', () => {
      const [action] = createGraphQlUpdateActions([
        {
          action: 'changeDestination',
          destination: {
            type: 'GoogleCloudPubSub',
            projectId: 'my-project',
            topic: 'my-topic',
          },
        },
      ]);
      expect(action).toEqual({
        changeDestination: {
          destination: {
            GoogleCloudPubSub: { projectId: 'my-project', topic: 'my-topic' },
          },
        },
      });
    });

    it('converts an SQS destination, mapping the authenticationMode to the GraphQL enum', () => {
      const [iamAction] = createGraphQlUpdateActions([
        {
          action: 'changeDestination',
          destination: {
            type: 'SQS',
            accessKey: 'accessKey',
            accessSecret: 'accessSecret',
            authenticationMode: 'IAM',
            queueUrl: 'https://sqs.example.com/queue',
            region: 'eu-west-1',
          },
        },
      ]);
      expect(iamAction).toEqual({
        changeDestination: {
          destination: {
            SQS: {
              accessKey: 'accessKey',
              accessSecret: 'accessSecret',
              authenticationMode: TAwsAuthenticationMode.Iam,
              queueUrl: 'https://sqs.example.com/queue',
              region: 'eu-west-1',
            },
          },
        },
      });

      const [credentialsAction] = createGraphQlUpdateActions([
        {
          action: 'changeDestination',
          destination: {
            type: 'SQS',
            accessKey: 'accessKey',
            accessSecret: 'accessSecret',
            authenticationMode: 'Credentials',
            queueUrl: 'https://sqs.example.com/queue',
            region: 'eu-west-1',
          },
        },
      ]);
      expect(
        (
          credentialsAction as unknown as {
            changeDestination: {
              destination: { SQS: { authenticationMode: string } };
            };
          }
        ).changeDestination.destination.SQS.authenticationMode
      ).toEqual(TAwsAuthenticationMode.Credentials);
    });

    it('converts a ConfluentCloud destination', () => {
      const [action] = createGraphQlUpdateActions([
        {
          action: 'changeDestination',
          destination: {
            type: 'ConfluentCloud',
            acks: 'all',
            apiKey: 'apiKey',
            apiSecret: 'apiSecret',
            bootstrapServer: 'broker:9092',
            topic: 'my-topic',
          },
        },
      ]);
      expect(action).toEqual({
        changeDestination: {
          destination: {
            ConfluentCloud: {
              acks: 'all',
              apiKey: 'apiKey',
              apiSecret: 'apiSecret',
              bootstrapServer: 'broker:9092',
              topic: 'my-topic',
            },
          },
        },
      });
    });

    it('converts an SNS destination, mapping the authenticationMode to the GraphQL enum', () => {
      const [action] = createGraphQlUpdateActions([
        {
          action: 'changeDestination',
          destination: {
            type: 'SNS',
            accessKey: 'accessKey',
            accessSecret: 'accessSecret',
            authenticationMode: 'IAM',
            topicArn: 'arn:aws:sns:eu-west-1:123456789012:my-topic',
          },
        },
      ]);
      expect(action).toEqual({
        changeDestination: {
          destination: {
            SNS: {
              accessKey: 'accessKey',
              accessSecret: 'accessSecret',
              authenticationMode: TAwsAuthenticationMode.Iam,
              topicArn: 'arn:aws:sns:eu-west-1:123456789012:my-topic',
            },
          },
        },
      });
    });

    it('converts an EventBridge destination', () => {
      const [action] = createGraphQlUpdateActions([
        {
          action: 'changeDestination',
          destination: {
            type: 'EventBridge',
            accountId: '123456789012',
            region: 'eu-west-1',
          },
        },
      ]);
      expect(action).toEqual({
        changeDestination: {
          destination: {
            EventBridge: { accountId: '123456789012', region: 'eu-west-1' },
          },
        },
      });
    });

    it('converts an AzureServiceBus destination', () => {
      const [action] = createGraphQlUpdateActions([
        {
          action: 'changeDestination',
          destination: {
            type: 'AzureServiceBus',
            connectionString: 'Endpoint=sb://example',
          },
        },
      ]);
      expect(action).toEqual({
        changeDestination: {
          destination: {
            AzureServiceBus: { connectionString: 'Endpoint=sb://example' },
          },
        },
      });
    });

    it('converts an EventGrid (Azure Event Grid) destination', () => {
      const [action] = createGraphQlUpdateActions([
        {
          action: 'changeDestination',
          destination: {
            type: 'EventGrid',
            uri: 'https://example.eventgrid.azure.net/api/events',
            accessKey: 'accessKey',
          },
        },
      ]);
      expect(action).toEqual({
        changeDestination: {
          destination: {
            EventGrid: {
              uri: 'https://example.eventgrid.azure.net/api/events',
              accessKey: 'accessKey',
            },
          },
        },
      });
    });
  });
});

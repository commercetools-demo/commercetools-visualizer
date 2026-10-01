import type { TFormValues } from '../subscription-details-form/subscription-details-form';
import {
  convertFormValuesToSubscription,
  convertSubscriptionDestinationToFormValue,
} from './convert';

const base: TFormValues = {
  id: 'sub-1',
  key: 'my-subscription',
  destinationType: 'SQS',
  destination: undefined,
};

describe('convertFormValuesToSubscription', () => {
  it('spreads the selected destination config and tags it with its type', () => {
    const result = convertFormValuesToSubscription({
      ...base,
      destinationType: 'SQS',
      destination: {
        SQS: {
          queueUrl: 'https://sqs.eu-west-1.amazonaws.com/1/q',
          region: 'eu-west-1',
          authenticationMode: 'IAM',
        },
      } as TFormValues['destination'],
    });

    expect(result.destination).toEqual({
      type: 'SQS',
      queueUrl: 'https://sqs.eu-west-1.amazonaws.com/1/q',
      region: 'eu-west-1',
      authenticationMode: 'IAM',
    });
  });

  it.each([
    'GoogleCloudPubSub',
    'SQS',
    'ConfluentCloud',
    'SNS',
    'EventBridge',
    'AzureServiceBus',
    'EventGrid',
  ])('supports the %s destination type', (destinationType) => {
    const result = convertFormValuesToSubscription({
      ...base,
      destinationType,
      destination: {
        [destinationType]: { marker: destinationType },
      } as unknown as TFormValues['destination'],
    });
    expect(result.destination).toEqual({
      type: destinationType,
      marker: destinationType,
    });
  });

  it('only uses the config of the selected type, ignoring stale sibling configs', () => {
    const result = convertFormValuesToSubscription({
      ...base,
      destinationType: 'SNS',
      destination: {
        SQS: { queueUrl: 'stale' },
        SNS: { topicArn: 'arn:aws:sns:x' },
      } as unknown as TFormValues['destination'],
    });

    expect(result.destination).toEqual({
      type: 'SNS',
      topicArn: 'arn:aws:sns:x',
    });
  });

  it('returns only the type for an unknown destination type', () => {
    const result = convertFormValuesToSubscription({
      ...base,
      destinationType: 'SomethingNew',
      destination: {
        SQS: { queueUrl: 'x' },
      } as unknown as TFormValues['destination'],
    });
    expect(result.destination).toEqual({ type: 'SomethingNew' });
  });

  it('returns only the type when the destination config is missing', () => {
    expect(convertFormValuesToSubscription(base).destination).toEqual({
      type: 'SQS',
    });
  });

  it('defaults missing changes and messages to empty arrays', () => {
    const result = convertFormValuesToSubscription(base);
    expect(result.changes).toEqual([]);
    expect(result.messages).toEqual([]);
  });

  it('defaults null changes and messages to empty arrays', () => {
    const result = convertFormValuesToSubscription({
      ...base,
      changes: null,
      messages: null,
    });
    expect(result.changes).toEqual([]);
    expect(result.messages).toEqual([]);
  });

  it('passes changes through', () => {
    const changes = [{ resourceTypeId: 'product' }];
    expect(
      convertFormValuesToSubscription({ ...base, changes }).changes
    ).toEqual(changes);
  });

  it('maps messages, defaulting missing types to [] and dropping extra fields', () => {
    const result = convertFormValuesToSubscription({
      ...base,
      messages: [
        {
          resourceTypeId: 'order',
          types: ['OrderCreated'],
          __typename: 'MessageSubscription',
        },
        { resourceTypeId: 'cart' },
      ] as unknown as TFormValues['messages'],
    });

    expect(result.messages).toEqual([
      { resourceTypeId: 'order', types: ['OrderCreated'] },
      { resourceTypeId: 'cart', types: [] },
    ]);
  });

  it('carries the key through', () => {
    expect(convertFormValuesToSubscription(base).key).toBe('my-subscription');
  });
});

describe('convertFormValuesToSubscription — Confluent Cloud record key', () => {
  const confluent = (key?: string): TFormValues => ({
    ...base,
    destinationType: 'ConfluentCloud',
    destination: {
      ConfluentCloud: {
        acks: '1',
        apiKey: 'k',
        apiSecret: 's',
        bootstrapServer: 'broker:9092',
        topic: 't',
        ...(key === undefined ? {} : { key }),
      },
    } as TFormValues['destination'],
  });

  it('keeps a record key that was entered', () => {
    expect(
      convertFormValuesToSubscription(confluent('my-record-key')).destination
    ).toMatchObject({ type: 'ConfluentCloud', key: 'my-record-key' });
  });

  it.each([undefined, ''])('omits the key when it is %p', (key) => {
    expect(
      convertFormValuesToSubscription(confluent(key)).destination
    ).not.toHaveProperty('key');
  });
});

describe('convertSubscriptionDestinationToFormValue', () => {
  const dest = (value: object) =>
    value as Parameters<typeof convertSubscriptionDestinationToFormValue>[0];

  it.each([
    ['GoogleCloudPubSub', { projectId: 'p', topic: 't' }],
    [
      'SQS',
      {
        queueUrl: 'https://sqs/q',
        region: 'eu-west-1',
        authenticationMode: 'IAM',
      },
    ],
    [
      'SNS',
      {
        topicArn: 'arn:aws:sns:eu-west-1:1:t',
        authenticationMode: 'Credentials',
        accessKey: 'ak',
        accessSecret: 'as',
      },
    ],
    [
      'EventBridge',
      {
        accountId: '123456789012',
        region: 'eu-west-1',
        source: 'aws.partner/x',
      },
    ],
    ['AzureServiceBus', { connectionString: 'Endpoint=sb://x' }],
    [
      'ConfluentCloud',
      {
        acks: 'all',
        apiKey: 'k',
        apiSecret: 's',
        bootstrapServer: 'b:9092',
        topic: 't',
        key: 'record-key',
      },
    ],
  ])(
    'nests the %s config under its type, without __typename/type',
    (type, config) => {
      expect(
        convertSubscriptionDestinationToFormValue(
          dest({ __typename: `${type}Destination`, type, ...config })
        )
      ).toEqual({ [type]: config });
    }
  );

  it('renames Event Grid’s eventGridAccessKey alias back to accessKey', () => {
    expect(
      convertSubscriptionDestinationToFormValue(
        dest({
          __typename: 'EventGridDestination',
          type: 'EventGrid',
          uri: 'https://x.eventgrid.azure.net/api/events',
          eventGridAccessKey: 'secret',
        })
      )
    ).toEqual({
      EventGrid: {
        uri: 'https://x.eventgrid.azure.net/api/events',
        accessKey: 'secret',
      },
    });
  });

  it('drops null fields (unset optionals such as an IAM SQS access key)', () => {
    expect(
      convertSubscriptionDestinationToFormValue(
        dest({
          type: 'SQS',
          queueUrl: 'q',
          region: 'r',
          authenticationMode: 'IAM',
          accessKey: null,
          accessSecret: null,
        })
      )
    ).toEqual({
      SQS: { queueUrl: 'q', region: 'r', authenticationMode: 'IAM' },
    });
  });

  it('returns undefined for a destination type the app has no form for', () => {
    expect(
      convertSubscriptionDestinationToFormValue(
        dest({ type: 'IronMQ', uri: 'https://mq' })
      )
    ).toBeUndefined();
  });

  it('round-trips with convertFormValuesToSubscription', () => {
    const fetched = dest({
      __typename: 'SNSDestination',
      type: 'SNS',
      topicArn: 'arn:aws:sns:eu-west-1:1:t',
      authenticationMode: 'IAM',
      accessKey: null,
      accessSecret: null,
    });
    const result = convertFormValuesToSubscription({
      ...base,
      destinationType: 'SNS',
      destination: convertSubscriptionDestinationToFormValue(fetched),
    });
    expect(result.destination).toEqual({
      type: 'SNS',
      topicArn: 'arn:aws:sns:eu-west-1:1:t',
      authenticationMode: 'IAM',
    });
  });
});

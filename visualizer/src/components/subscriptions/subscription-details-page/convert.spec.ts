import type { TFormValues } from '../subscription-details-form/subscription-details-form';
import { convertFormValuesToSubscription } from './convert';

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

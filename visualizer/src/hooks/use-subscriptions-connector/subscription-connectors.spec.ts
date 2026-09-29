import {
  calculateSubscriptionUpdateActions,
  InputType,
} from './subscription-connectors';

const baseSubscription: InputType = {
  key: 'my-subscription',
  destination: {
    __typename: 'GoogleCloudPubSubDestination',
    type: 'GoogleCloudPubSub',
    projectId: 'my-project',
    topic: 'my-topic',
  } as InputType['destination'],
  changes: [{ resourceTypeId: 'cart' }],
  messages: [{ resourceTypeId: 'order', types: ['OrderCreated'] }],
};

describe('calculateSubscriptionUpdateActions', () => {
  it('produces no actions when nothing changed', () => {
    expect(
      calculateSubscriptionUpdateActions(baseSubscription, {
        ...baseSubscription,
      })
    ).toEqual([]);
  });

  it('produces a changeDestination action, converting the GraphQL destination shape', () => {
    const next: InputType = {
      ...baseSubscription,
      destination: {
        __typename: 'GoogleCloudPubSubDestination',
        type: 'GoogleCloudPubSub',
        projectId: 'my-project',
        topic: 'a-different-topic',
      } as InputType['destination'],
    };

    expect(
      calculateSubscriptionUpdateActions(baseSubscription, next)
    ).toContainEqual({
      changeDestination: {
        destination: {
          GoogleCloudPubSub: {
            projectId: 'my-project',
            topic: 'a-different-topic',
          },
        },
      },
    });
  });

  it('produces a setMessages action when the messages list changes', () => {
    const next: InputType = {
      ...baseSubscription,
      messages: [{ resourceTypeId: 'order', types: ['OrderImported'] }],
    };

    const actions = calculateSubscriptionUpdateActions(baseSubscription, next);
    expect(actions.length).toBeGreaterThan(0);
  });

  it.each(['SNS', 'EventBridge', 'AzureServiceBus'] as const)(
    'produces no actions for an unchanged %s destination',
    (type) => {
      const destinationByType: Record<string, InputType['destination']> = {
        SNS: {
          __typename: 'SNSDestination',
          type: 'SNS',
          topicArn: 'arn:aws:sns:eu-west-1:123456789012:my-topic',
          authenticationMode: 'IAM',
        } as InputType['destination'],
        EventBridge: {
          __typename: 'EventBridgeDestination',
          type: 'EventBridge',
          accountId: '123456789012',
          region: 'eu-west-1',
        } as InputType['destination'],
        AzureServiceBus: {
          __typename: 'AzureServiceBusDestination',
          type: 'AzureServiceBus',
          connectionString: 'Endpoint=sb://example',
        } as InputType['destination'],
      };
      const subscription: InputType = {
        ...baseSubscription,
        destination: destinationByType[type],
      };

      expect(
        calculateSubscriptionUpdateActions(subscription, { ...subscription })
      ).toEqual([]);
    }
  );

  it('produces a changeDestination action for a changed SNS destination', () => {
    const original: InputType = {
      ...baseSubscription,
      destination: {
        __typename: 'SNSDestination',
        type: 'SNS',
        topicArn: 'arn:aws:sns:eu-west-1:123456789012:my-topic',
        authenticationMode: 'IAM',
      } as InputType['destination'],
    };
    const next: InputType = {
      ...original,
      destination: {
        __typename: 'SNSDestination',
        type: 'SNS',
        topicArn: 'arn:aws:sns:eu-west-1:123456789012:a-different-topic',
        authenticationMode: 'IAM',
      } as InputType['destination'],
    };

    expect(calculateSubscriptionUpdateActions(original, next)).toContainEqual({
      changeDestination: {
        destination: {
          SNS: {
            topicArn: 'arn:aws:sns:eu-west-1:123456789012:a-different-topic',
            authenticationMode: 'IAM',
          },
        },
      },
    });
  });

  it('renames the fetched eventGridAccessKey alias back to accessKey for an EventGrid destination', () => {
    const original: InputType = {
      ...baseSubscription,
      destination: {
        __typename: 'EventGridDestination',
        type: 'EventGrid',
        uri: 'https://example.eventgrid.azure.net/api/events',
        eventGridAccessKey: 'old-key',
      } as unknown as InputType['destination'],
    };
    const next: InputType = {
      ...original,
      destination: {
        __typename: 'EventGridDestination',
        type: 'EventGrid',
        uri: 'https://example.eventgrid.azure.net/api/events',
        eventGridAccessKey: 'new-key',
      } as unknown as InputType['destination'],
    };

    expect(calculateSubscriptionUpdateActions(original, next)).toContainEqual({
      changeDestination: {
        destination: {
          EventGrid: {
            uri: 'https://example.eventgrid.azure.net/api/events',
            accessKey: 'new-key',
          },
        },
      },
    });
  });
});

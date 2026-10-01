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

  it('sees no change for an EventGrid draft built from the form (accessKey) vs the fetched one (eventGridAccessKey)', () => {
    const fetched: InputType = {
      ...baseSubscription,
      destination: {
        __typename: 'EventGridDestination',
        type: 'EventGrid',
        uri: 'https://example.eventgrid.azure.net/api/events',
        eventGridAccessKey: 'my-key',
      } as unknown as InputType['destination'],
    };
    const fromForm: InputType = {
      ...baseSubscription,
      destination: {
        type: 'EventGrid',
        uri: 'https://example.eventgrid.azure.net/api/events',
        accessKey: 'my-key',
      } as unknown as InputType['destination'],
    };

    expect(calculateSubscriptionUpdateActions(fetched, fromForm)).toEqual([]);
  });

  describe('Confluent Cloud record key', () => {
    const confluent = (extra: object): InputType => ({
      ...baseSubscription,
      destination: {
        __typename: 'ConfluentCloudDestination',
        type: 'ConfluentCloud',
        acks: '1',
        apiKey: 'apiKey',
        apiSecret: 'apiSecret',
        bootstrapServer: 'broker:9092',
        topic: 'my-topic',
        ...extra,
      } as unknown as InputType['destination'],
    });

    it('treats a fetched null key and a form draft without a key as unchanged', () => {
      expect(
        calculateSubscriptionUpdateActions(
          confluent({ key: null }),
          confluent({})
        )
      ).toEqual([]);
    });

    it('produces changeDestination, including the key, when a key is added', () => {
      expect(
        calculateSubscriptionUpdateActions(
          confluent({ key: null }),
          confluent({ key: 'my-record-key' })
        )
      ).toContainEqual({
        changeDestination: {
          destination: {
            ConfluentCloud: expect.objectContaining({ key: 'my-record-key' }),
          },
        },
      });
    });
  });

  describe('events (not detected by sync-actions, so diffed here)', () => {
    const withEvents = (events: InputType['events']): InputType => ({
      ...baseSubscription,
      events,
    });
    const checkout = (types: Array<string>) => ({
      resourceTypeId: 'checkout',
      types,
    });

    it.each([
      ['both missing', undefined, undefined],
      ['null vs empty', null, []],
      [
        'identical',
        [checkout(['CheckoutPaymentCharged'])],
        [checkout(['CheckoutPaymentCharged'])],
      ],
      [
        'same events in a different order',
        [
          checkout(['CheckoutPaymentCharged', 'CheckoutPaymentRefunded']),
          { resourceTypeId: 'import-api', types: ['ImportUnresolved'] },
        ],
        [
          { resourceTypeId: 'import-api', types: ['ImportUnresolved'] },
          checkout(['CheckoutPaymentRefunded', 'CheckoutPaymentCharged']),
        ],
      ],
    ])('produces no action when events are unchanged (%s)', (_name, a, b) => {
      expect(
        calculateSubscriptionUpdateActions(withEvents(a), withEvents(b))
      ).toEqual([]);
    });

    it('produces setEvents when events are added', () => {
      expect(
        calculateSubscriptionUpdateActions(
          withEvents([]),
          withEvents([checkout(['CheckoutPaymentCharged'])])
        )
      ).toEqual([
        {
          setEvents: {
            events: [
              { resourceTypeId: 'checkout', types: ['CheckoutPaymentCharged'] },
            ],
          },
        },
      ]);
    });

    it('produces setEvents when an event type is added to a resource', () => {
      expect(
        calculateSubscriptionUpdateActions(
          withEvents([checkout(['CheckoutPaymentCharged'])]),
          withEvents([
            checkout(['CheckoutPaymentCharged', 'CheckoutPaymentRefunded']),
          ])
        )
      ).toContainEqual({
        setEvents: {
          events: [
            {
              resourceTypeId: 'checkout',
              types: ['CheckoutPaymentCharged', 'CheckoutPaymentRefunded'],
            },
          ],
        },
      });
    });

    it('treats "all events of a resource" (empty types) as different from specific types', () => {
      expect(
        calculateSubscriptionUpdateActions(
          withEvents([checkout(['CheckoutPaymentCharged'])]),
          withEvents([checkout([])])
        )
      ).toEqual([
        { setEvents: { events: [{ resourceTypeId: 'checkout', types: [] }] } },
      ]);
    });

    it('produces setEvents with an empty list when all events are removed', () => {
      expect(
        calculateSubscriptionUpdateActions(
          withEvents([checkout(['CheckoutPaymentCharged'])]),
          withEvents([])
        )
      ).toEqual([{ setEvents: { events: [] } }]);
    });

    it('combines setEvents with the other actions', () => {
      const actions = calculateSubscriptionUpdateActions(
        { ...baseSubscription, key: 'old', events: [] },
        { ...baseSubscription, key: 'new', events: [checkout([])] }
      );
      expect(actions.map((a) => Object.keys(a)[0]).sort()).toEqual([
        'setEvents',
        'setKey',
      ]);
    });
  });
});

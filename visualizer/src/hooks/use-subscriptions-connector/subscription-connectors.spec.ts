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
});

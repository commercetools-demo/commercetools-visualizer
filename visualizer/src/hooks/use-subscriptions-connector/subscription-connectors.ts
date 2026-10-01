import { ApolloError, OperationVariables } from '@apollo/client';
import {
  useMcMutation,
  useMcQuery,
} from '@commercetools-frontend/application-shell-connectors';
import {
  createSyncSubscriptions,
  Destination,
} from '@commercetools/sync-actions';
import { Subscription } from '@commercetools/platform-sdk';
import {
  TCommercetoolsSubscription,
  TGoogleCloudPubSubDestination,
  TMutation,
  TMutation_CreateSubscriptionArgs,
  TMutation_DeleteSubscriptionArgs,
  TMutation_UpdateSubscriptionArgs,
  TQuery,
  TQuery_SubscriptionArgs,
  TQuery_SubscriptionsArgs,
  TSubscriptionUpdateAction,
} from '../../types/generated/ctp';
import { mcApiContext } from '../shared/mc-api-context';
import {
  createGraphQlUpdateActions,
  extractErrorFromGraphQlResponse,
} from '../shared/graphql-helpers';
import FetchQuery from './fetch.graphql';
import FetchAllQuery from './fetch-all.graphql';
import CreateMutation from './create.graphql';
import DeleteMutation from './delete.graphql';
import UpdateMutation from './update.graphql';

const syncSubscriptions = createSyncSubscriptions();

export type QueryOptions = {
  skip?: boolean;
  onCompleted?: (data: TQuery) => void;
  onError?: (error: ApolloError) => void;
};

type PickedReturnType = Partial<
  Pick<Subscription, 'key' | 'destination' | 'messages' | 'changes' | 'events'>
>;

export type InputType = Pick<
  TCommercetoolsSubscription,
  'key' | 'destination' | 'changes' | 'messages' | 'events'
>;

const convertTSubscription = (subscription: InputType): PickedReturnType => {
  let destination: Destination | undefined = undefined;
  switch (subscription.destination.type) {
    case 'GoogleCloudPubSub':
    case 'SQS':
    case 'ConfluentCloud':
    case 'SNS':
    case 'EventBridge':
    case 'AzureServiceBus': {
      const adaptedDestination = {
        ...subscription.destination,
        type: subscription.destination.type,
      } as TGoogleCloudPubSubDestination;
      const { __typename, ...rest } = adaptedDestination;
      // The API returns `null` for unset optional fields (e.g. a Confluent Cloud
      // `key`, or SQS credentials under IAM); a draft built from the form leaves them
      // out, which must not register as a change.
      destination = Object.fromEntries(
        Object.entries(rest).filter(([, value]) => value !== null)
      ) as unknown as Destination;
      break;
    }
    case 'EventGrid': {
      // The fetched field is aliased `eventGridAccessKey` (see
      // SubscriptionFragment) to avoid a field-type conflict with SNS/SQS's
      // `accessKey` under the same `destination` selection — rename it back
      // to `accessKey` to match AzureEventGridDestination's REST shape.
      // A draft built from the form (rather than fetched) already carries `accessKey`.
      const adaptedDestination = subscription.destination as {
        __typename?: string;
        type: string;
        uri: string;
        eventGridAccessKey?: string;
        accessKey?: string;
      };
      destination = {
        type: 'EventGrid',
        uri: adaptedDestination.uri,
        accessKey:
          adaptedDestination.eventGridAccessKey ?? adaptedDestination.accessKey,
      } as Destination;
      break;
    }
  }
  return {
    key: subscription.key || undefined,
    destination: destination,
    changes: subscription.changes,
    messages: subscription.messages.map((message) => ({
      resourceTypeId: message.resourceTypeId,
      types: message.types,
    })),
  };
};

export const useSubscriptionsFetcher = (
  variables: TQuery_SubscriptionsArgs,
  options?: QueryOptions
) => {
  const { data, error, loading, refetch, fetchMore } = useMcQuery<
    TQuery,
    TQuery_SubscriptionsArgs & OperationVariables
  >(FetchAllQuery, {
    variables,
    context: mcApiContext,
    skip: options?.skip,
    onCompleted: options?.onCompleted,
    onError: options?.onError,
  });
  return {
    subscriptions: data?.subscriptions,
    error,
    loading,
    refetch,
    fetchMore,
  };
};

export const useSubscriptionFetcher = (
  variables: TQuery_SubscriptionArgs,
  options?: QueryOptions
) => {
  const { data, error, loading, refetch, fetchMore } = useMcQuery<
    TQuery,
    TQuery_SubscriptionArgs & OperationVariables
  >(FetchQuery, {
    variables,
    context: mcApiContext,
    skip: options?.skip,
    onCompleted: options?.onCompleted,
    onError: options?.onError,
  });
  return {
    subscription: data?.subscription,
    error,
    loading,
    refetch,
    fetchMore,
  };
};

export const useSubscriptionCreator = () => {
  const [createSubscription, { loading }] = useMcMutation<
    TMutation,
    TMutation_CreateSubscriptionArgs
  >(CreateMutation);

  const execute = async (variables: TMutation_CreateSubscriptionArgs) => {
    try {
      return await createSubscription({
        variables,
        context: mcApiContext,
      }).then(({ data, errors, extensions }) => ({
        createSubscription: data?.createSubscription,
        errors,
        extensions,
      }));
    } catch (graphQlResponse) {
      throw extractErrorFromGraphQlResponse(graphQlResponse);
    }
  };

  return { loading, execute };
};

export const useSubscriptionUpdater = () => {
  const [updateSubscription, { loading }] = useMcMutation<
    TMutation,
    TMutation_UpdateSubscriptionArgs
  >(UpdateMutation);

  const execute = async (variables: TMutation_UpdateSubscriptionArgs) => {
    try {
      return await updateSubscription({
        variables,
        context: mcApiContext,
      }).then(({ data, errors, extensions }) => ({
        updateSubscription: data?.updateSubscription,
        errors,
        extensions,
      }));
    } catch (graphQlResponse) {
      throw extractErrorFromGraphQlResponse(graphQlResponse);
    }
  };

  return { loading, execute };
};

export const useSubscriptionDeleter = () => {
  const [deleteSubscription, { loading }] = useMcMutation<
    TMutation,
    TMutation_DeleteSubscriptionArgs
  >(DeleteMutation);

  const execute = async (variables: TMutation_DeleteSubscriptionArgs) => {
    try {
      return await deleteSubscription({
        variables,
        context: mcApiContext,
      }).then(({ data, errors, extensions }) => ({
        deleteSubscription: data?.deleteSubscription,
        errors,
        extensions,
      }));
    } catch (graphQlResponse) {
      throw extractErrorFromGraphQlResponse(graphQlResponse);
    }
  };

  return { loading, execute };
};

type EventsList = InputType['events'];

// Order-insensitive, null-tolerant representation for comparing event subscriptions.
const normalizeEvents = (events: EventsList) =>
  JSON.stringify(
    (events ?? [])
      .map((event) => ({
        resourceTypeId: event.resourceTypeId,
        types: [...(event.types ?? [])].sort(),
      }))
      .sort((a, b) => a.resourceTypeId.localeCompare(b.resourceTypeId))
  );

// `@commercetools/sync-actions`' subscription sync (`baseActionsList` in its source) only
// knows setKey/setMessages/setChanges/changeDestination — it never emits `setEvents`, so a
// changed event subscription is silently dropped. Detect it ourselves.
const calculateEventsActions = (
  originalDraft: InputType,
  nextDraft: InputType
) =>
  normalizeEvents(originalDraft.events) === normalizeEvents(nextDraft.events)
    ? []
    : [
        {
          action: 'setEvents',
          events: (nextDraft.events ?? []).map((event) => ({
            resourceTypeId: event.resourceTypeId,
            types: event.types ?? [],
          })),
        },
      ];

export const calculateSubscriptionUpdateActions = (
  originalDraft: InputType,
  nextDraft: InputType
) => {
  const updateActions = syncSubscriptions.buildActions(
    convertTSubscription(nextDraft),
    convertTSubscription(originalDraft)
  );
  return createGraphQlUpdateActions([
    ...updateActions,
    // The platform SDK version we depend on has no SubscriptionSetEventsAction type.
    ...(calculateEventsActions(
      originalDraft,
      nextDraft
    ) as unknown as typeof updateActions),
  ]) as TSubscriptionUpdateAction[];
};

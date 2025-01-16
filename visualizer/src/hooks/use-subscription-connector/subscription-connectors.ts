import {
  useMcMutation,
  useMcQuery,
} from '@commercetools-frontend/application-shell';
import { GRAPHQL_TARGETS } from '@commercetools-frontend/constants';
import { useQuery } from '@apollo/client';
import {
  compareStringArrays,
  extractErrorFromGraphQlResponse,
} from '../../helpers';
import {
  TMutation,
  TMutation_UpdateSubscriptionArgs,
  TCommercetoolsSubscription,
  TSubscriptionUpdateAction,
  TQuery,
  TQuery_SubscriptionArgs,
  TMutation_DeleteSubscriptionArgs,
  TMutation_CreateSubscriptionArgs,
  TQuery_SubscriptionsArgs,
} from '../../types/generated/ctp';
import UpdateSubscriptionKeyMutation from './update-subscription-key.ctp.graphql';
import DeleteSubscriptionIdMutation from './delete-subscription-id.ctp.graphql';
import FetchQuery from './fetch-subscription.cpt.graphql';

import FetchSubscriptionsQuery from './fetch-subscriptions.cpt.graphql';
import CreateQuery from './create-subscription.ctp.graphql';
import { TFormValues } from '../../components/subscriptions/subscription-details-form/subscription-details-form';

export const useSubscriptionCreator = () => {
  const [createSubscription, { loading }] = useMcMutation<
    TMutation,
    TMutation_CreateSubscriptionArgs
  >(CreateQuery);

  const execute = async (variables: TMutation_CreateSubscriptionArgs) => {
    try {
      return await createSubscription({
        context: {
          target: GRAPHQL_TARGETS.COMMERCETOOLS_PLATFORM,
        },
        variables: variables,
      });
    } catch (graphQlResponse) {
      throw extractErrorFromGraphQlResponse(graphQlResponse);
    }
  };

  return {
    loading,
    execute,
  };
};

export const useSubscriptionKeyUpdater = () => {
  const [updateSubscriptionKey, { loading }] = useMcMutation<
    TMutation,
    TMutation_UpdateSubscriptionArgs
  >(UpdateSubscriptionKeyMutation);

  const execute = async ({
    originalDraft,
    nextDraft,
  }: {
    originalDraft: NonNullable<TCommercetoolsSubscription>;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    nextDraft: TFormValues;
  }) => {
    const actions: Array<TSubscriptionUpdateAction> = [];
    if (nextDraft.key && originalDraft.key !== nextDraft.key) {
      actions.push({ setKey: { key: nextDraft.key } });
    }
    if (nextDraft.changes) {
      if (
        !compareStringArrays(
          originalDraft.changes.map((value) => value.resourceTypeId),
          nextDraft.changes.map((value) => value.resourceTypeId)
        )
      ) {
        actions.push({ setChanges: { changes: nextDraft.changes } });
      }
    }
    if (nextDraft.messages) {
      const originalResourceTypes = originalDraft.messages.map(
        (value) => value.resourceTypeId
      );
      const nextResourceTypes = nextDraft.messages.map(
        (value) => value.resourceTypeId
      );
      const setMessagesAction = {
        setMessages: {
          messages: nextDraft.messages.map((message) => ({
            resourceTypeId: message.resourceTypeId,
            types: message.types,
          })),
        },
      };

      if (!compareStringArrays(originalResourceTypes, nextResourceTypes)) {
        actions.push(setMessagesAction);
      } else {
        for (const value of nextDraft.messages) {
          const nextResourceId = value.resourceTypeId;
          const nextTypes = value.types;

          const originalMessage = originalDraft.messages.find(
            (value) => value.resourceTypeId === nextResourceId
          );
          if (!compareStringArrays(nextTypes, originalMessage?.types)) {
            actions.push(setMessagesAction);
            break;
          }
        }
      }
    }
    if (actions.length === 0) {
      return;
    }
    try {
      return await updateSubscriptionKey({
        context: {
          target: GRAPHQL_TARGETS.COMMERCETOOLS_PLATFORM,
        },
        variables: {
          id: originalDraft.id,
          version: originalDraft.version,
          actions: actions,
        },
      });
    } catch (graphQlResponse) {
      throw extractErrorFromGraphQlResponse(graphQlResponse);
    }
  };

  return {
    loading,
    execute,
  };
};

export const useSubscriptionFetcher = (variables: TQuery_SubscriptionArgs) => {
  const { data, error, loading, refetch } = useMcQuery<
    TQuery,
    TQuery_SubscriptionArgs
  >(FetchQuery, {
    variables: variables,
    context: {
      target: GRAPHQL_TARGETS.COMMERCETOOLS_PLATFORM,
    },
  });
  return {
    subscription: data?.subscription,
    error,
    loading,
    refetch,
  };
};

export const useSubscriptionDeleter = () => {
  const [deleteSubscriptionById, { loading }] = useMcMutation<
    TMutation,
    TMutation_DeleteSubscriptionArgs
  >(DeleteSubscriptionIdMutation);

  const execute = async (variables: TMutation_DeleteSubscriptionArgs) => {
    try {
      return await deleteSubscriptionById({
        context: {
          target: GRAPHQL_TARGETS.COMMERCETOOLS_PLATFORM,
        },
        variables: variables,
      });
    } catch (graphQlResponse) {
      throw extractErrorFromGraphQlResponse(graphQlResponse);
    }
  };

  return {
    loading,
    execute,
  };
};

export const useSubscriptionsFetcher = (
  variables: TQuery_SubscriptionsArgs
) => {
  const { data, error, loading, refetch } = useQuery<
    TQuery,
    TQuery_SubscriptionsArgs
  >(FetchSubscriptionsQuery, {
    variables: variables,
    context: {
      target: GRAPHQL_TARGETS.COMMERCETOOLS_PLATFORM,
    },
  });
  return {
    subscriptions: data?.subscriptions,
    error,
    loading,
    refetch,
  };
};

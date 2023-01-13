import {
  useMcMutation,
  useMcQuery,
} from '@commercetools-frontend/application-shell';
import { GRAPHQL_TARGETS } from '@commercetools-frontend/constants';
import { ApolloError } from '@apollo/client';
import { extractErrorFromGraphQlResponse } from '../../helpers';
import {
  TMutation,
  TMutation_UpdateSubscriptionArgs,
  TCommercetoolsSubscription,
  TSubscriptionUpdateAction,
  TQuery,
  TQuery_SubscriptionArgs,
  Maybe,
  TMutation_DeleteSubscriptionArgs,
} from '../../types/generated/ctp';
import UpdateSubscriptionKeyMutation from './update-subscription-key.ctp.graphql';
import DeleteSubscriptionIdMutation from './delete-subscription-id.ctp.graphql';
import FetchQuery from './fetch-subscription.cpt.graphql';

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
    nextDraft: any;
  }) => {
    const actions: Array<TSubscriptionUpdateAction> = [
      { setKey: { key: nextDraft.key } },
    ];
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

type TUseSubscriptionFetcher = (props: { id: string }) => {
  subscription?: Maybe<TCommercetoolsSubscription>;
  error?: ApolloError;
  loading: boolean;
};

export const useSubscriptionFetcher: TUseSubscriptionFetcher = ({ id }) => {
  const { data, error, loading } = useMcQuery<TQuery, TQuery_SubscriptionArgs>(
    FetchQuery,
    {
      variables: {
        id: id,
      },
      context: {
        target: GRAPHQL_TARGETS.COMMERCETOOLS_PLATFORM,
      },
    }
  );
  return {
    subscription: data?.subscription,
    error,
    loading,
  };
};

export const useSubscriptionDeleter = () => {
  const [deleteSubscriptionById, { loading }] = useMcMutation<
    TMutation,
    TMutation_DeleteSubscriptionArgs
  >(DeleteSubscriptionIdMutation);

  const execute = async ({ id, version }: { id: string; version: number }) => {
    try {
      return await deleteSubscriptionById({
        context: {
          target: GRAPHQL_TARGETS.COMMERCETOOLS_PLATFORM,
        },
        variables: {
          id: id,
          version: version,
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

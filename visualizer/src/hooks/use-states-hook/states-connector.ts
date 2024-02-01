import {
  Maybe,
  TMutation,
  TMutation_UpdateStateArgs,
  TQuery,
  TQuery_StateArgs,
  TQuery_StatesArgs,
  TState,
  TStateDraft,
  TStateType,
} from '../../types/generated/ctp';
import { ApolloError, ApolloQueryResult, useQuery } from '@apollo/client';
import { GRAPHQL_TARGETS } from '@commercetools-frontend/constants';
import {
  useMcMutation,
  useMcQuery,
} from '@commercetools-frontend/application-shell';
import FetchAllQuery from './fetch-states.ctp.graphql';
import FetchQuery from './fetch-state.ctp.graphql';
import { createSyncStates } from '@commercetools/sync-actions';
import UpdateStateIdMutation from './update-state.ctp.graphql';
import {
  createGraphQlUpdateActions,
  extractErrorFromGraphQlResponse,
} from '../../helpers';
import { transformLocalizedFieldToLocalizedString } from '@commercetools-frontend/l10n';
import { StateDraft } from '@commercetools/platform-sdk';

const syncStates = createSyncStates();

type TUseStatesFetcher = (variables: TQuery_StatesArgs) => {
  states?: TQuery['states'];
  error?: ApolloError;
  loading: boolean;
  refetch(): Promise<ApolloQueryResult<TQuery>>;
};
export const useStatesFetcher: TUseStatesFetcher = (variables) => {
  const { data, error, loading, refetch } = useQuery<TQuery, TQuery_StatesArgs>(
    FetchAllQuery,
    {
      variables: variables,
      context: {
        target: GRAPHQL_TARGETS.COMMERCETOOLS_PLATFORM,
      },
    }
  );
  return {
    states: data?.states,
    error,
    loading,
    refetch,
  };
};

type TUseStateFetcher = (props: { id: string }) => {
  state?: Maybe<TState>;
  error?: ApolloError;
  loading: boolean;
  refetch: (
    variables?: Partial<TQuery_StateArgs> | undefined
  ) => Promise<ApolloQueryResult<TQuery>>;
};

export const useStateFetcher: TUseStateFetcher = ({ id }) => {
  const { data, error, loading, refetch } = useMcQuery<
    TQuery,
    TQuery_StateArgs
  >(FetchQuery, {
    variables: {
      id: id,
    },
    context: {
      target: GRAPHQL_TARGETS.COMMERCETOOLS_PLATFORM,
    },
  });
  return {
    state: data?.state,
    error,
    loading,
    refetch,
  };
};

//GraphQL --> Rest
export const convertTStateToStateDraft = (
  draft: Partial<TState>
): StateDraft => ({
  key: draft.key || '',
  type: draft.type || TStateType.LineItemState,
  name:
    transformLocalizedFieldToLocalizedString(draft.nameAllLocales || []) || {},
  description:
    transformLocalizedFieldToLocalizedString(
      draft.descriptionAllLocales || []
    ) || {},
});

//GraphQL --> Rest
export const convertTStateDraftToStateDraft = (
  draft: Partial<TStateDraft>
): StateDraft => ({
  key: draft.key || '',
  type: draft.type || TStateType.LineItemState,
  name: transformLocalizedFieldToLocalizedString(draft.name || []) || {},
  description:
    transformLocalizedFieldToLocalizedString(draft.description || []) || {},
});

export const useStateUpdater = () => {
  const [updateStateId, { loading }] = useMcMutation<
    TMutation,
    TMutation_UpdateStateArgs
  >(UpdateStateIdMutation);

  const execute = async ({
    originalDraft,
    nextDraft,
    id,
    version,
  }: {
    originalDraft: TState;
    nextDraft: TStateDraft;
    id: string;
    version: number;
  }) => {
    try {
      //This conversion is required since the sync action work on rest interfaces --> graphql to rest
      const originalConverted = convertTStateToStateDraft(originalDraft);
      const nextConverted = convertTStateDraftToStateDraft(nextDraft);
      //returns a list of rest based update actions
      const actions = syncStates.buildActions(nextConverted, originalConverted);
      console.log(actions);
      if (actions.length > 0) {
        await updateStateId({
          context: {
            target: GRAPHQL_TARGETS.COMMERCETOOLS_PLATFORM,
          },
          variables: {
            id: id,
            version: version || 1,
            //rest based update actions to graphql
            actions: createGraphQlUpdateActions(actions),
          },
        });
      }
    } catch (graphQlResponse) {
      console.log(graphQlResponse);
      throw extractErrorFromGraphQlResponse(graphQlResponse);
    }
  };

  return {
    loading,
    execute,
  };
};

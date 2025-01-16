import {
  TMutation,
  TMutation_CreateStateArgs,
  TMutation_DeleteStateArgs,
  TMutation_UpdateStateArgs,
  TQuery,
  TQuery_StateArgs,
  TQuery_StatesArgs,
  TState,
  TStateDraft,
  TStateType,
} from '../../types/generated/ctp';
import { useQuery } from '@apollo/client';
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
import {
  StateDraft,
  StateResourceIdentifier,
} from '@commercetools/platform-sdk';
import CreateStateMutation from './create-state.ctp.graphql';
import DeleteQuery from './delete-state.ctp.graphql';

const syncStates = createSyncStates();

export const useStateCreator = () => {
  const [createState, { loading }] = useMcMutation<
    TMutation,
    TMutation_CreateStateArgs
  >(CreateStateMutation);

  const execute = async (variables: TMutation_CreateStateArgs) => {
    try {
      return await createState({
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

export const useStatesFetcher = (variables: TQuery_StatesArgs) => {
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

export const useStateFetcher = (variables: TQuery_StateArgs) => {
  const { data, error, loading, refetch } = useMcQuery<
    TQuery,
    TQuery_StateArgs
  >(FetchQuery, {
    variables: variables,
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
  transitions: draft.transitions?.map(
    (transition): StateResourceIdentifier => ({
      typeId: 'state',
      id: transition.id,
    })
  ),
  initial: draft.initial,
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
  transitions: draft.transitions?.map(
    (transition): StateResourceIdentifier => ({
      typeId: 'state',
      id: transition.id,
    })
  ),
  initial: draft.initial === true || false,
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

export const useStateDeleter = () => {
  const [deleteStateById, { loading }] = useMcMutation<
    TMutation,
    TMutation_DeleteStateArgs
  >(DeleteQuery);

  const execute = async (variables: TMutation_DeleteStateArgs) => {
    try {
      return await deleteStateById({
        context: {
          target: GRAPHQL_TARGETS.COMMERCETOOLS_PLATFORM,
        },
        variables: variables,
      });
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

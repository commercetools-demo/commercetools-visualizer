import { ApolloError, OperationVariables } from '@apollo/client';
import {
  useMcMutation,
  useMcQuery,
} from '@commercetools-frontend/application-shell-connectors';
import { createSyncStates } from '@commercetools/sync-actions';
import {
  TMutation,
  TMutation_CreateStateArgs,
  TMutation_DeleteStateArgs,
  TMutation_UpdateStateArgs,
  TQuery,
  TQuery_StateArgs,
  TQuery_StatesArgs,
  TStateUpdateAction,
} from 'commercetools-demo-shared-helpers';
import { mcApiContext } from '../shared/mc-api-context';
import {
  createGraphQlUpdateActions,
  extractErrorFromGraphQlResponse,
} from '../shared/graphql-helpers';
import FetchAllQuery from './fetch-all.graphql';
import FetchQuery from './fetch.graphql';
import CreateMutation from './create.graphql';
import DeleteMutation from './delete.graphql';
import UpdateMutation from './update.graphql';
import { convertTStateToState, PickedState } from './conversion';

const syncStates = createSyncStates();

export type QueryOptions = {
  skip?: boolean;
  onCompleted?: (data: TQuery) => void;
  onError?: (error: ApolloError) => void;
};

export const useStatesFetcher = (
  variables: TQuery_StatesArgs,
  options?: QueryOptions
) => {
  const { data, error, loading, refetch, fetchMore } = useMcQuery<
    TQuery,
    TQuery_StatesArgs & OperationVariables
  >(FetchAllQuery, {
    variables,
    context: mcApiContext,
    skip: options?.skip,
    onCompleted: options?.onCompleted,
    onError: options?.onError,
  });
  return {
    states: data?.states,
    error,
    loading,
    refetch,
    fetchMore,
  };
};

export const useStateFetcher = (
  variables: TQuery_StateArgs,
  options?: QueryOptions
) => {
  const { data, error, loading, refetch, fetchMore } = useMcQuery<
    TQuery,
    TQuery_StateArgs & OperationVariables
  >(FetchQuery, {
    variables,
    context: mcApiContext,
    skip: options?.skip,
    onCompleted: options?.onCompleted,
    onError: options?.onError,
  });
  return {
    state: data?.state,
    error,
    loading,
    refetch,
    fetchMore,
  };
};

export const useStateCreator = () => {
  const [createState, { loading }] = useMcMutation<
    TMutation,
    TMutation_CreateStateArgs
  >(CreateMutation);

  const execute = async (variables: TMutation_CreateStateArgs) => {
    try {
      return await createState({ variables, context: mcApiContext }).then(
        ({ data, errors, extensions }) => ({
          createState: data?.createState,
          errors,
          extensions,
        })
      );
    } catch (graphQlResponse) {
      throw extractErrorFromGraphQlResponse(graphQlResponse);
    }
  };

  return { loading, execute };
};

export const useStateDeleter = () => {
  const [deleteState, { loading }] = useMcMutation<
    TMutation,
    TMutation_DeleteStateArgs
  >(DeleteMutation);

  const execute = async (variables: TMutation_DeleteStateArgs) => {
    try {
      return await deleteState({ variables, context: mcApiContext }).then(
        ({ data, errors, extensions }) => ({
          deleteState: data?.deleteState,
          errors,
          extensions,
        })
      );
    } catch (graphQlResponse) {
      throw extractErrorFromGraphQlResponse(graphQlResponse);
    }
  };

  return { loading, execute };
};

export const useStateUpdater = () => {
  const [updateState, { loading }] = useMcMutation<
    TMutation,
    TMutation_UpdateStateArgs
  >(UpdateMutation);

  const execute = async (variables: TMutation_UpdateStateArgs) => {
    try {
      return await updateState({ variables, context: mcApiContext }).then(
        ({ data, errors, extensions }) => ({
          updateState: data?.updateState,
          errors,
          extensions,
        })
      );
    } catch (graphQlResponse) {
      throw extractErrorFromGraphQlResponse(graphQlResponse);
    }
  };

  return { loading, execute };
};

export const calculateStateUpdateActions = (
  originalDraft: PickedState,
  nextDraft: PickedState
) => {
  // This conversion is required since the sync-actions library works on REST
  // interfaces --> GraphQL to REST
  const originalConverted = convertTStateToState(originalDraft);
  const nextConverted = convertTStateToState(nextDraft);
  // returns a list of REST-based update actions
  const actions = syncStates.buildActions(nextConverted, originalConverted);
  return createGraphQlUpdateActions(actions) as Array<TStateUpdateAction>;
};

import { ApolloError, OperationVariables } from '@apollo/client';
import {
  useMcMutation,
  useMcQuery,
} from '@commercetools-frontend/application-shell-connectors';
import {
  TMutation,
  TMutation_CreateOrUpdateCustomObjectArgs,
  TMutation_DeleteCustomObjectArgs,
  TQuery,
  TQuery_CustomObjectArgs,
  TQuery_CustomObjectsArgs,
} from 'commercetools-demo-shared-helpers';
import { mcApiContext } from '../shared/mc-api-context';
import { extractErrorFromGraphQlResponse } from '../shared/graphql-helpers';
import FetchAllQuery from './fetch-all.graphql';
import FetchQuery from './fetch.graphql';
import CreateOrUpdateMutation from './create-or-update.graphql';
import DeleteMutation from './delete.graphql';

export type QueryOptions = {
  skip?: boolean;
  onCompleted?: (data: TQuery) => void;
  onError?: (error: ApolloError) => void;
};

export const useCustomObjectsFetcher = (
  variables: TQuery_CustomObjectsArgs,
  options?: QueryOptions
) => {
  const { data, error, loading, refetch, fetchMore } = useMcQuery<
    TQuery,
    TQuery_CustomObjectsArgs & OperationVariables
  >(FetchAllQuery, {
    variables,
    context: mcApiContext,
    skip: options?.skip,
    onCompleted: options?.onCompleted,
    onError: options?.onError,
  });
  return {
    customObjects: data?.customObjects,
    error,
    loading,
    refetch,
    fetchMore,
  };
};

export const useCustomObjectFetcher = (
  variables: TQuery_CustomObjectArgs,
  options?: QueryOptions
) => {
  const { data, error, loading, refetch, fetchMore } = useMcQuery<
    TQuery,
    TQuery_CustomObjectArgs & OperationVariables
  >(FetchQuery, {
    variables,
    context: mcApiContext,
    skip: options?.skip,
    onCompleted: options?.onCompleted,
    onError: options?.onError,
  });
  return {
    customObject: data?.customObject,
    error,
    loading,
    refetch,
    fetchMore,
  };
};

export const useCustomObjectCreatorOrUpdater = () => {
  const [createOrUpdateCustomObject, { loading }] = useMcMutation<
    TMutation,
    TMutation_CreateOrUpdateCustomObjectArgs
  >(CreateOrUpdateMutation);

  const execute = async (
    variables: TMutation_CreateOrUpdateCustomObjectArgs
  ) => {
    try {
      return await createOrUpdateCustomObject({
        variables,
        context: mcApiContext,
      }).then(({ data, errors, extensions }) => ({
        createOrUpdateCustomObject: data?.createOrUpdateCustomObject,
        errors,
        extensions,
      }));
    } catch (graphQlResponse) {
      throw extractErrorFromGraphQlResponse(graphQlResponse);
    }
  };

  return { loading, execute };
};

export const useCustomObjectDeleter = () => {
  const [deleteCustomObject, { loading }] = useMcMutation<
    TMutation,
    TMutation_DeleteCustomObjectArgs
  >(DeleteMutation);

  const execute = async (variables: TMutation_DeleteCustomObjectArgs) => {
    try {
      return await deleteCustomObject({
        variables,
        context: mcApiContext,
      }).then(({ data, errors, extensions }) => ({
        deleteCustomObject: data?.deleteCustomObject,
        errors,
        extensions,
      }));
    } catch (graphQlResponse) {
      throw extractErrorFromGraphQlResponse(graphQlResponse);
    }
  };

  return { loading, execute };
};

import {
  useMcMutation,
  useMcQuery,
} from '@commercetools-frontend/application-shell';
import { GRAPHQL_TARGETS } from '@commercetools-frontend/constants';
import {
  TMutation,
  TMutation_CreateOrUpdateCustomObjectArgs,
  TMutation_DeleteCustomObjectArgs,
  TQuery,
  TQuery_CustomObjectArgs,
  TQuery_CustomObjectsArgs,
} from '../../types/generated/ctp';
import GetCustomObjects from './get-custom-objects.ctp.graphql';
import GetCustomObject from './get-custom-object.ctp.graphql';
import DeleteCustomObject from './delete-custom-object.ctp.graphql';
import UpdateCustomObject from './update-custom-object.ctp.graphql';
import { extractErrorFromGraphQlResponse } from '../../helpers';

export const useCustomObjectsFetcher = (
  variables: TQuery_CustomObjectsArgs
) => {
  const { data, loading, error, refetch } = useMcQuery<
    TQuery,
    TQuery_CustomObjectsArgs
  >(GetCustomObjects, {
    variables: variables,
    context: {
      target: GRAPHQL_TARGETS.COMMERCETOOLS_PLATFORM,
    },
  });

  return {
    customObjects: data?.customObjects,
    error,
    loading,
    refetch,
  };
};

export const useCustomObjectFetcher = (variables: TQuery_CustomObjectArgs) => {
  const { data, loading, error, refetch } = useMcQuery<
    TQuery,
    TQuery_CustomObjectArgs
  >(GetCustomObject, {
    variables: variables,
    context: {
      target: GRAPHQL_TARGETS.COMMERCETOOLS_PLATFORM,
    },
  });

  return {
    customObject: data?.customObject,
    error,
    loading,
    refetch,
  };
};

export const useCustomObjectUpdater = () => {
  const [updateCustomObject, { loading }] = useMcMutation<
    TMutation,
    TMutation_CreateOrUpdateCustomObjectArgs
  >(UpdateCustomObject);

  const execute = async (
    variables: TMutation_CreateOrUpdateCustomObjectArgs
  ) => {
    try {
      return await updateCustomObject({
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

export const useCustomObjectDeleter = () => {
  const [deleteCustomObject, { loading }] = useMcMutation<
    TMutation,
    TMutation_DeleteCustomObjectArgs
  >(DeleteCustomObject);

  const execute = async (variables: TMutation_DeleteCustomObjectArgs) => {
    try {
      return await deleteCustomObject({
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

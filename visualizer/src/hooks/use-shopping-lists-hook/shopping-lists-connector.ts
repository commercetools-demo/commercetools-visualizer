import {
  TMutation,
  TMutation_CreateShoppingListArgs,
  TMutation_DeleteShoppingListArgs,
  TMutation_UpdateShoppingListArgs,
  TQuery,
  TQuery_ShoppingListArgs,
  TQuery_ShoppingListsArgs,
} from '../../types/generated/ctp';
import { useQuery } from '@apollo/client';
import { GRAPHQL_TARGETS } from '@commercetools-frontend/constants';
import {
  useMcMutation,
  useMcQuery,
} from '@commercetools-frontend/application-shell';
import FetchAllQuery from './fetch-shopping-lists.ctp.graphql';
import FetchQuery from './fetch-shopping-list.ctp.graphql';
import UpdateShoppingListIdMutation from './update-shopping-list.ctp.graphql';
import { extractErrorFromGraphQlResponse } from '../../helpers';
import CreateShoppingListMutation from './create-shopping-list.ctp.graphql';
import DeleteQuery from './delete-shopping-list.ctp.graphql';

export const useShoppingListCreator = () => {
  const [createShoppingList, { loading }] = useMcMutation<
    TMutation,
    TMutation_CreateShoppingListArgs
  >(CreateShoppingListMutation);

  const execute = async (variables: TMutation_CreateShoppingListArgs) => {
    try {
      return await createShoppingList({
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

export const useShoppingListsFetcher = (
  variables: TQuery_ShoppingListsArgs
) => {
  const { data, error, loading, refetch } = useQuery<
    TQuery,
    TQuery_ShoppingListsArgs
  >(FetchAllQuery, {
    variables: variables,
    context: {
      target: GRAPHQL_TARGETS.COMMERCETOOLS_PLATFORM,
    },
  });
  return {
    shoppingLists: data?.shoppingLists,
    error,
    loading,
    refetch,
  };
};

export const useShoppingListFetcher = (variables: TQuery_ShoppingListArgs) => {
  const { data, error, loading, refetch } = useMcQuery<
    TQuery,
    TQuery_ShoppingListArgs
  >(FetchQuery, {
    variables: variables,
    context: {
      target: GRAPHQL_TARGETS.COMMERCETOOLS_PLATFORM,
    },
  });
  return {
    shoppingList: data?.shoppingList,
    error,
    loading,
    refetch,
  };
};

export const useShoppingListUpdater = () => {
  const [updateShoppingListId, { loading }] = useMcMutation<
    TMutation,
    TMutation_UpdateShoppingListArgs
  >(UpdateShoppingListIdMutation);

  const execute = async (variables: TMutation_UpdateShoppingListArgs) => {
    try {
      if (variables.actions.length > 0) {
        await updateShoppingListId({
          context: {
            target: GRAPHQL_TARGETS.COMMERCETOOLS_PLATFORM,
          },
          variables: variables,
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

export const useShoppingListDeleter = () => {
  const [deleteShoppingListById, { loading }] = useMcMutation<
    TMutation,
    TMutation_DeleteShoppingListArgs
  >(DeleteQuery);

  const execute = async (variables: TMutation_DeleteShoppingListArgs) => {
    try {
      return await deleteShoppingListById({
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

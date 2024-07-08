import {
  Maybe,
  TMutation,
  TMutation_CreateShoppingListArgs,
  TMutation_DeleteShoppingListArgs,
  TMutation_UpdateShoppingListArgs,
  TQuery,
  TQuery_ShoppingListArgs,
  TQuery_ShoppingListsArgs,
  TShoppingList,
  TShoppingListDraft,
  TShoppingListUpdateAction,
} from '../../types/generated/ctp';
import { ApolloError, ApolloQueryResult, useQuery } from '@apollo/client';
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

  const execute = async ({ draft }: { draft: TShoppingListDraft }) => {
    try {
      return await createShoppingList({
        context: {
          target: GRAPHQL_TARGETS.COMMERCETOOLS_PLATFORM,
        },
        variables: {
          draft: draft,
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

type TUseShoppingListsFetcher = (variables: TQuery_ShoppingListsArgs) => {
  shoppingLists?: TQuery['shoppingLists'];
  error?: ApolloError;
  loading: boolean;
  refetch(): Promise<ApolloQueryResult<TQuery>>;
};
export const useShoppingListsFetcher: TUseShoppingListsFetcher = (
  variables
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

type TUseShoppingListFetcher = (props: { id: string }) => {
  shoppingList?: Maybe<TShoppingList>;
  error?: ApolloError;
  loading: boolean;
  refetch: (
    variables?: Partial<TQuery_ShoppingListArgs> | undefined
  ) => Promise<ApolloQueryResult<TQuery>>;
};

export const useShoppingListFetcher: TUseShoppingListFetcher = ({ id }) => {
  const { data, error, loading, refetch } = useMcQuery<
    TQuery,
    TQuery_ShoppingListArgs
  >(FetchQuery, {
    variables: {
      id: id,
    },
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

  const execute = async ({
    actions,
    id,
    version,
  }: {
    actions: Array<TShoppingListUpdateAction>;
    id: string;
    version: number;
  }) => {
    try {
      if (actions.length > 0) {
        await updateShoppingListId({
          context: {
            target: GRAPHQL_TARGETS.COMMERCETOOLS_PLATFORM,
          },
          variables: {
            id: id,
            version: version || 1,
            actions: actions,
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

export const useShoppingListDeleter = () => {
  const [deleteShoppingListById, { loading }] = useMcMutation<
    TMutation,
    TMutation_DeleteShoppingListArgs
  >(DeleteQuery);

  const execute = async ({
    id,
    key,
    version,
  }: TMutation_DeleteShoppingListArgs) => {
    try {
      return await deleteShoppingListById({
        context: {
          target: GRAPHQL_TARGETS.COMMERCETOOLS_PLATFORM,
        },
        variables: {
          id: id,
          key: key,
          version: version,
        },
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

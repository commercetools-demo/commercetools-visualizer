import {
  Maybe,
  TCart,
  TCartDraft,
  TMutation,
  TMutation_CreateCartArgs,
  TMutation_DeleteCartArgs,
  TMutation_UpdateCartArgs,
  TQuery,
  TQuery_CartArgs,
  TQuery_CartsArgs,
} from '../../types/generated/ctp';
import { ApolloError, ApolloQueryResult, useQuery } from '@apollo/client';
import { GRAPHQL_TARGETS } from '@commercetools-frontend/constants';
import {
  useMcMutation,
  useMcQuery,
} from '@commercetools-frontend/application-shell';
import FetchAllQuery from './fetch-carts.ctp.graphql';
import FetchQuery from './fetch-cart.ctp.graphql';
import { extractErrorFromGraphQlResponse } from '../../helpers';
import DeleteQuery from './delete-cart.ctp.graphql';
import CreateQuery from './create-cart.ctp.graphql';
import UpdateQuery from './update-cart.ctp.graphql';

export const useCartsFetcher = (variables: TQuery_CartsArgs) => {
  const { data, error, loading, refetch } = useQuery<TQuery, TQuery_CartsArgs>(
    FetchAllQuery,
    {
      variables: variables,
      context: {
        target: GRAPHQL_TARGETS.COMMERCETOOLS_PLATFORM,
      },
    }
  );
  return {
    carts: data?.carts,
    error,
    loading,
    refetch,
  };
};

type TUseCartFetcher = (props: { id: string; locale: string }) => {
  cart?: Maybe<TCart>;
  error?: ApolloError;
  loading: boolean;
  refetch: (
    variables?: Partial<TQuery_CartArgs> | undefined
  ) => Promise<ApolloQueryResult<TQuery>>;
};

export const useCartFetcher: TUseCartFetcher = (
  variables: TQuery_CartArgs & { locale: string }
) => {
  const { data, error, loading, refetch } = useMcQuery<
    TQuery,
    TQuery_CartArgs & { locale: string }
  >(FetchQuery, {
    variables: variables,
    context: {
      target: GRAPHQL_TARGETS.COMMERCETOOLS_PLATFORM,
    },
  });
  return {
    cart: data?.cart,
    error,
    loading,
    refetch,
  };
};

export const useCartDeleter = () => {
  const [deleteCartById, { loading }] = useMcMutation<
    TMutation,
    TMutation_DeleteCartArgs
  >(DeleteQuery);

  const execute = async (variables: TMutation_DeleteCartArgs) => {
    try {
      return await deleteCartById({
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

export const useCartCreator = () => {
  const [createCart, { loading }] = useMcMutation<
    TMutation,
    TMutation_CreateCartArgs & { locale: string }
  >(CreateQuery);

  const execute = async ({
    draft,
    locale,
  }: {
    draft: TCartDraft;
    locale: string;
  }) => {
    try {
      return await createCart({
        context: {
          target: GRAPHQL_TARGETS.COMMERCETOOLS_PLATFORM,
        },
        variables: {
          draft: draft,
          locale: locale,
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

export const useCartUpdater = () => {
  const [updateCartId, { loading }] = useMcMutation<
    TMutation,
    TMutation_UpdateCartArgs & { locale: string }
  >(UpdateQuery);

  const execute = async (
    variables: TMutation_UpdateCartArgs & {
      locale: string;
    }
  ) => {
    try {
      if (variables.actions.length > 0) {
        return await updateCartId({
          context: {
            target: GRAPHQL_TARGETS.COMMERCETOOLS_PLATFORM,
          },
          variables: variables,
        });
      }
      return Promise.resolve(undefined);
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

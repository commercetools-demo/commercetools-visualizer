import {
  TQuery,
  TQuery_ShippingMethodsByCartArgs,
} from '../../types/generated/ctp';
import { ApolloError, ApolloQueryResult, useQuery } from '@apollo/client';
import FetchShippingMethodsByCartQuery from './fetch-shipping-methods-by-cart.ctp.graphql';
import { GRAPHQL_TARGETS } from '@commercetools-frontend/constants';

type TUseFetchShippingMethodsByCartFetcher = (
  variables: TQuery_ShippingMethodsByCartArgs & { locale: string }
) => {
  shippingMethodsByCart?: TQuery['shippingMethodsByCart'];
  error?: ApolloError;
  loading: boolean;
  refetch(): Promise<ApolloQueryResult<TQuery>>;
};
export const useFetchShippingMethodsByCartFetcher: TUseFetchShippingMethodsByCartFetcher =
  (variables) => {
    const { data, error, loading, refetch } = useQuery<
      TQuery,
      TQuery_ShippingMethodsByCartArgs
    >(FetchShippingMethodsByCartQuery, {
      variables: variables,
      context: {
        target: GRAPHQL_TARGETS.COMMERCETOOLS_PLATFORM,
      },
    });
    return {
      shippingMethodsByCart: data?.shippingMethodsByCart,
      error,
      loading,
      refetch,
    };
  };

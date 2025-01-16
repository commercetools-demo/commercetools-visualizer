import {
  TQuery,
  TQuery_ShippingMethodsByCartArgs,
} from '../../types/generated/ctp';
import { useQuery } from '@apollo/client';
import FetchShippingMethodsByCartQuery from './fetch-shipping-methods-by-cart.ctp.graphql';
import { GRAPHQL_TARGETS } from '@commercetools-frontend/constants';

export const useFetchShippingMethodsByCartFetcher = (
  variables: TQuery_ShippingMethodsByCartArgs & { locale: string }
) => {
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

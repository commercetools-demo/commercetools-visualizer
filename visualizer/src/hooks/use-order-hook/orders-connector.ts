import { TQuery, TQuery_OrdersArgs } from '../../types/generated/ctp';
import { useQuery } from '@apollo/client';
import { GRAPHQL_TARGETS } from '@commercetools-frontend/constants';
import FetchAllQuery from './fetch-orders.ctp.graphql';

export const useOrdersFetcher = (variables: TQuery_OrdersArgs) => {
  const { data, error, loading, refetch } = useQuery<TQuery, TQuery_OrdersArgs>(
    FetchAllQuery,
    {
      variables: variables,
      context: {
        target: GRAPHQL_TARGETS.COMMERCETOOLS_PLATFORM,
      },
    }
  );
  return {
    orders: data?.orders,
    error,
    loading,
    refetch,
  };
};

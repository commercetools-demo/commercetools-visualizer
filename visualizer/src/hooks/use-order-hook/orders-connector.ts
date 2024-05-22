import { TQuery, TQuery_OrdersArgs } from '../../types/generated/ctp';
import { ApolloError, ApolloQueryResult, useQuery } from '@apollo/client';
import { GRAPHQL_TARGETS } from '@commercetools-frontend/constants';
import FetchAllQuery from './fetch-orders.ctp.graphql';

type TUseOrdersFetcher = (variables: TQuery_OrdersArgs) => {
  orders?: TQuery['orders'];
  error?: ApolloError;
  loading: boolean;
  refetch(): Promise<ApolloQueryResult<TQuery>>;
};
export const useOrdersFetcher: TUseOrdersFetcher = (variables) => {
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

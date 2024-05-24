import { GRAPHQL_TARGETS } from '@commercetools-frontend/constants';
import FetchSearchPoweredCustomersQuery from './search-powered-customers-fetcher.ctp.graphql';
import { ApolloError, ApolloQueryResult, useQuery } from '@apollo/client';
import { TQuery, TQuery_CustomersArgs } from '../../types/generated/ctp';

type TUseCustomersFetcher = (variables: TQuery_CustomersArgs) => {
  customers?: TQuery['customers'];
  error?: ApolloError;
  loading: boolean;
  refetch(variables: TQuery_CustomersArgs): Promise<ApolloQueryResult<TQuery>>;
};

const useSearchPoweredCustomersFetcher: TUseCustomersFetcher = (variables) => {
  const { data, error, loading, refetch } = useQuery<
    TQuery,
    TQuery_CustomersArgs
  >(FetchSearchPoweredCustomersQuery, {
    variables: variables,
    context: {
      target: GRAPHQL_TARGETS.COMMERCETOOLS_PLATFORM,
    },
  });
  return {
    customers: data?.customers,
    error,
    loading,
    refetch,
  };
};

export default useSearchPoweredCustomersFetcher;

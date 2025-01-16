import { TQuery, TQuery_CustomerArgs } from '../../types/generated/ctp';
import { GRAPHQL_TARGETS } from '@commercetools-frontend/constants';
import { useMcQuery } from '@commercetools-frontend/application-shell';
import FetchQuery from './fetch-customer.cpt.graphql';

export const useCustomerFetcher = (variables: TQuery_CustomerArgs) => {
  const { data, error, loading, refetch } = useMcQuery<
    TQuery,
    TQuery_CustomerArgs
  >(FetchQuery, {
    variables: variables,
    context: {
      target: GRAPHQL_TARGETS.COMMERCETOOLS_PLATFORM,
    },
  });
  return {
    customer: data?.customer,
    error,
    loading,
    refetch,
  };
};

import {
  Maybe,
  TCustomer,
  TQuery,
  TQuery_CustomerArgs,
} from '../../types/generated/ctp';
import { ApolloError, ApolloQueryResult } from '@apollo/client';
import { GRAPHQL_TARGETS } from '@commercetools-frontend/constants';
import { useMcQuery } from '@commercetools-frontend/application-shell';
import FetchQuery from './fetch-customer.cpt.graphql';

type TUseCustomerFetcher = (props: { id?: string }) => {
  customer?: Maybe<TCustomer>;
  error?: ApolloError;
  loading: boolean;
  refetch: (
    variables?: Partial<TQuery_CustomerArgs> | undefined
  ) => Promise<ApolloQueryResult<TQuery>>;
};

export const useCustomerFetcher: TUseCustomerFetcher = ({ id }) => {
  const { data, error, loading, refetch } = useMcQuery<
    TQuery,
    TQuery_CustomerArgs
  >(FetchQuery, {
    variables: {
      id: id,
    },
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

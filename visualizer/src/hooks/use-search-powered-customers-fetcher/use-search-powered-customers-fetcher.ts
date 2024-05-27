import { useState } from 'react';
import { useLazyQuery } from '@apollo/client/react';
import { GRAPHQL_TARGETS } from '@commercetools-frontend/constants';
import { reportErrorToSentry } from '@commercetools-frontend/sentry';
import FetchSearchPoweredCustomersQuery from './search-powered-customers-fetcher.ctp.graphql';
import {
  TCustomerQueryResult,
  TQuery,
  TQuery_CustomersArgs,
} from '../../types/generated/ctp';

const useSearchPoweredCustomersFetcher = () => {
  const [getSearchResult, { loading, data }] = useLazyQuery<
    TQuery & { allCustomers: TCustomerQueryResult },
    TQuery_CustomersArgs
  >(FetchSearchPoweredCustomersQuery);
  const [customers, setCustomers] = useState<TCustomerQueryResult>();

  const handleSearch = (searchQuery: TQuery_CustomersArgs) => {
    getSearchResult({
      context: {
        target: GRAPHQL_TARGETS.COMMERCETOOLS_PLATFORM,
      },
      variables: searchQuery,
      onError: reportErrorToSentry,
    }).then((customerResults) => {
      const customers = customerResults.data?.customers;

      setCustomers(customers);
    });
  };

  return {
    handleSearch: handleSearch,
    isLoading: loading,
    customers,
    allCustomers: data?.allCustomers,
  };
};

export default useSearchPoweredCustomersFetcher;

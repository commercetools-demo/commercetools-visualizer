import { useCallback, useState } from 'react';
import { useApplicationContext } from '@commercetools-frontend/application-shell-connectors';
import useCustomerIdsSearchFetcher from '../use-customer-ids-search-fetcher';
import useSearchPoweredCustomersFetcher from '../use-search-powered-customers-fetcher';

export type SearchParams = {
  searchQuery: string;
  perPage: number;
  page: number;
};

const useCustomerSearchFetcher = (
  searchParams: SearchParams,
  handleError: Function
) => {
  const [idSearchTotal, setIdSearchTotal] = useState(0);
  const { projectKey } = useApplicationContext((context) => ({
    projectKey: context.project?.key ?? '',
  }));
  const searchPoweredCustomerFetcher = useSearchPoweredCustomersFetcher();

  const customerData = searchPoweredCustomerFetcher;

  const customerIdsSearchFetcher = useCustomerIdsSearchFetcher(
    searchParams,
    projectKey
  );

  const fetchCustomers = useCallback(() => {
    const customerIdsSearch = customerIdsSearchFetcher();
    customerIdsSearch
      .then((res) => {
        setIdSearchTotal(res.total);
        const customerIds = res.hits.map((hit) => hit.id);
        searchPoweredCustomerFetcher.handleSearch({
          limit: customerIds.length > 0 ? searchParams.perPage : 0,
          offset: (searchParams.page - 1) * searchParams.perPage,
          where:
            'id in (' +
            customerIds.map((requestedId) => `\"${requestedId}\"`) +
            ')',
        });
      })
      .catch((err) => {
        if (handleError) {
          handleError(err);
        }
      });
  }, [
    customerIdsSearchFetcher,
    searchPoweredCustomerFetcher,
    searchParams,
    handleError,
  ]);

  return {
    customerData: {
      ...customerData,
      customers: { ...customerData.customers, total: idSearchTotal },
    },
    fetchCustomers,
  };

  return { fetch };
};

export default useCustomerSearchFetcher;

import { useApplicationContext } from '@commercetools-frontend/application-shell-connectors';
import useCustomerIdsSearchFetcher from '../use-customer-ids-search-fetcher';
import useSearchPoweredCustomersFetcher from '../use-search-powered-customers-fetcher';
import { TCustomer } from '../../types/generated/ctp';

const useCustomerSearchFetcher = (
  searchQuery: string,
  handleError: (error: any) => void
) => {
  const { projectKey } = useApplicationContext((context) => ({
    projectKey: context.project?.key ?? '',
  }));
  const customerIdsSearchFetcher = useCustomerIdsSearchFetcher(
    searchQuery,
    projectKey
  );
  const { refetch } = useSearchPoweredCustomersFetcher({
    limit: 20,
    offset: 0,
    sort: [],
    where: '',
  });

  const fetch = (): Promise<Array<TCustomer>> => {
    return customerIdsSearchFetcher()
      .then((result) => {
        return refetch({
          limit: 100,
          offset: 0,
          where: `id in (${result.hits
            .map((hit) => hit.id)
            .map((requestedId) => `"${requestedId}"`)})`,
          sort: ['email asc'],
        }).then((response) => {
          return response.data.customers.results;
        });
      })
      .catch((err) => {
        if (handleError) {
          handleError(err);
        }
        return [];
      });
  };

  return { fetch };
};

export default useCustomerSearchFetcher;

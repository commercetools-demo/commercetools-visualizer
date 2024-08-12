import { useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { actions as sdkActions } from '@commercetools-frontend/sdk';
import type {
  TSdkActionPayloadBody,
  TSdkActionPayloadForUri,
} from '@commercetools-frontend/sdk';
import { SearchParams } from '../use-customer-search-fetcher/use-customer-search-fetcher';

const useCustomerIdsSearchFetcher = (projectKey: string) => {
  const dispatch = useDispatch<
    (payload: TSdkActionPayloadForUri & TSdkActionPayloadBody) => Promise<{
      results: Array<{ id: string; relevance: number }>;
      limit: number;
      offset: number;
      total: number;
    }>
  >();

  return useCallback(
    (searchParams: SearchParams) =>
      dispatch(
        // @ts-ignore
        sdkActions.post({
          // @ts-ignore
          mcApiProxyTarget: 'customer-search',
          uri: `/${projectKey}`,
          payload: {
            query: {
              prefix: {
                caseInsensitive: true,
                field: 'all',
                value: searchParams.searchQuery,
              },
            },
            limit: searchParams.perPage,
            offset: (searchParams.page - 1) * searchParams.perPage,
            sort: [],
          },
        })
      ),
    [dispatch, projectKey]
  );
};

export default useCustomerIdsSearchFetcher;

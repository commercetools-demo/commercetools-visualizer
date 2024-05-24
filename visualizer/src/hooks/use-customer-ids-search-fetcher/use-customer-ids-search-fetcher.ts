import { useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { actions as sdkActions } from '@commercetools-frontend/sdk';
import type {
  TSdkActionPayloadBody,
  TSdkActionPayloadForUri,
} from '@commercetools-frontend/sdk';

const useCustomerIdsSearchFetcher = (
  searchQuery: string,
  projectKey: string
) => {
  const dispatch = useDispatch<
    (payload: TSdkActionPayloadForUri & TSdkActionPayloadBody) => Promise<{
      hits: Array<{ id: string; relevance: number }>;
      limit: number;
      offset: number;
      total: number;
    }>
  >();

  return useCallback(
    () =>
      dispatch(
        // @ts-ignore
        sdkActions.post({
          // @ts-ignore
          mcApiProxyTarget: 'customer-search',
          uri: `/${projectKey}`,
          payload: {
            query: {
              field: 'all',
              value: searchQuery,
            },
          },
        })
      ),
    [dispatch, projectKey, searchQuery]
  );
};

export default useCustomerIdsSearchFetcher;

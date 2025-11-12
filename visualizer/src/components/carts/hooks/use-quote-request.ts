import { useCallback, useState } from 'react';
import { useAsyncDispatch } from '@commercetools-frontend/sdk';
import { actions as sdkActions } from '@commercetools-frontend/sdk';
import { MC_API_PROXY_TARGETS } from '@commercetools-frontend/constants';
import { useApplicationContext } from '@commercetools-frontend/application-shell-connectors';
import { TQuoteRequest } from '../../../types/generated/ctp';

interface CreateQuoteRequestParams {
  cartId: string;
  cartVersion: number;
  comment?: string;
  key?: string;
  purchaseOrderNumber?: string;
}

interface UseQuoteRequestResult {
  createQuoteRequest: (
    params: CreateQuoteRequestParams
  ) => Promise<TQuoteRequest>;
  loading: boolean;
  error: Error | null;
  quoteRequest: TQuoteRequest | null;
}

export const useQuoteRequest = (): UseQuoteRequestResult => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [quoteRequest, setQuoteRequest] = useState<TQuoteRequest | null>(null);
  const dispatch = useAsyncDispatch();
  const context = useApplicationContext((context) => context);

  const createQuoteRequest = useCallback(
    async (params: CreateQuoteRequestParams): Promise<TQuoteRequest> => {
      setLoading(true);
      setError(null);

      try {
        const payload: any = {
          cart: {
            typeId: 'cart',
            id: params.cartId,
          },
          cartVersion: params.cartVersion,
        };

        if (params.comment) {
          payload.comment = params.comment;
        }
        if (params.key) {
          payload.key = params.key;
        }
        if (params.purchaseOrderNumber) {
          payload.purchaseOrderNumber = params.purchaseOrderNumber;
        }

        const response = (await dispatch(
          sdkActions.post({
            mcApiProxyTarget: MC_API_PROXY_TARGETS.COMMERCETOOLS_PLATFORM,
            uri: `/${context?.project?.key}/quote-requests`,
            payload,
          })
        )) as TQuoteRequest;

        setQuoteRequest(response);
        return response;
      } catch (err) {
        const errorObj =
          err instanceof Error
            ? err
            : new Error('Failed to create quote request');
        setError(errorObj);
        console.error('Error creating quote request:', errorObj);
        throw errorObj;
      } finally {
        setLoading(false);
      }
    },
    [dispatch, context]
  );

  return {
    createQuoteRequest,
    loading,
    error,
    quoteRequest,
  };
};

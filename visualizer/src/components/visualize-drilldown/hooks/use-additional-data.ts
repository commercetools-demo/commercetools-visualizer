import { useApplicationContext } from '@commercetools-frontend/application-shell-connectors';
import { MC_API_PROXY_TARGETS } from '@commercetools-frontend/constants';
import {
  actions as sdkActions,
  useAsyncDispatch,
} from '@commercetools-frontend/sdk';
import { useCallback, useState } from 'react';

import { EntityType, TreemapNode } from '../types';
import { ENTITY_DATA_QUERIES } from '../utils/relationship-contstants';
import { useDrilldownFetcher } from './use-drilldown-fetcher';

interface UseAdditionalDataResult {
  nodeDataMap: Map<string, string>;
  loading: boolean;
  fetchAdditionalData: (nodes: TreemapNode[]) => Promise<void>;
  clearData: () => void;
}

export const useAdditionalData = (): UseAdditionalDataResult => {
  const dispatch = useAsyncDispatch();
  const { getEndpoint, hydrateExpansion } = useDrilldownFetcher();
  const { projectKey } = useApplicationContext((context) => ({
    projectKey: context.project?.key ?? '',
  }));

  const [nodeDataMap, setNodeDataMap] = useState<Map<string, string>>(
    new Map()
  );
  const [loading, setLoading] = useState(false);

  const fetchEntityData = useCallback(
    async (
      entityType: EntityType,
      endpoint: string,
      queryArgs: Record<string, any>
    ) => {
      const queryParams = hydrateExpansion(
        entityType,
        new URLSearchParams({
          limit: '1',
          offset: '0',
        })
      );
      if (queryArgs && Object.keys(queryArgs).length > 0) {
        for (const [key, value] of Object.entries(queryArgs)) {
          if (value) {
            queryParams.set(key, value);
          }
        }
      }

      const action = sdkActions.get({
        mcApiProxyTarget: MC_API_PROXY_TARGETS.COMMERCETOOLS_PLATFORM,
        uri: `/${projectKey}${endpoint}?${queryParams.toString()}`,
      });

      try {
        const response = await dispatch(action);
        return response;
      } catch (error) {
        console.warn(
          `Failed to fetch additional data for ${entityType}:`,
          error
        );
        return null;
      }
    },
    [dispatch, projectKey]
  );

  const fetchAdditionalData = useCallback(
    async (nodes: TreemapNode[]) => {
      if (!nodes.length) return;

      setLoading(true);
      const newDataMap = new Map<string, string>();

      // Process all nodes in parallel
      const promises = nodes.map(async (node) => {
        // Skip load-more nodes
        if (node.id.startsWith('load-more-')) {
          return;
        }

        const relatedEntityDataQueries = ENTITY_DATA_QUERIES[node.entityType];
        if (
          !relatedEntityDataQueries ||
          relatedEntityDataQueries.length === 0
        ) {
          return;
        }

        let additionalData = [];

        for await (const queryConfig of relatedEntityDataQueries) {
          try {
            const queryArgs =
              queryConfig.parentEntitySelectorToQueryArgs?.(node.entity) ?? {};

            const endpoint = getEndpoint(queryConfig.childEntity, queryArgs);

            const result = await fetchEntityData(
              node.entityType,
              endpoint,
              queryArgs
            );

            if (result) {
              additionalData.push(queryConfig.postTransform(result));
            }
          } catch (error) {
            console.warn(
              `Failed to fetch additional data for ${node.entityType} ${node.id}:`,
              error
            );
          }
        }

        newDataMap.set(node.id, additionalData.join('\n'));
      });

      await Promise.all(promises);

      setNodeDataMap(newDataMap);
      setLoading(false);
    },
    [fetchEntityData]
  );

  const clearData = useCallback(() => {
    setNodeDataMap(new Map());
  }, []);

  return {
    nodeDataMap,
    loading,
    fetchAdditionalData,
    clearData,
  };
};

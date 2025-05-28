import { useState, useCallback } from 'react';
import { useAsyncDispatch } from '@commercetools-frontend/sdk';
import { actions as sdkActions } from '@commercetools-frontend/sdk';
import { MC_API_PROXY_TARGETS } from '@commercetools-frontend/constants';
import { useApplicationContext } from '@commercetools-frontend/application-shell-connectors';
import {
  EntityType,
  BaseEntity,
  DrilldownData,
  PaginationInfo,
  QueryEntityType,
  SearchAndSortState,
  SortDirection,
} from '../types';
import { relationshipManager } from '../utils/relationship-utils';
import {
  ENDPOINTS_WITH_EXPAND,
  ENTITY_ENDPOINTS,
  ENTITY_NAME_FIELDS,
  QUERY_ENTITY_ENDPOINTS,
  QUERY_ENTITY_NAME_FIELDS,
  RELATIONSHIP_QUERIES,
} from '../utils/relationship-contstants';

interface UseDrilldownFetcherResult {
  drilldownData: DrilldownData[];
  loading: boolean;
  error: Error | null;
  ENTITY_SEARCH_MAPPINGS: Partial<
    Record<EntityType, (query: string) => string | any>
  >;
  getEndpoint: (
    entityType: EntityType | QueryEntityType,
    queryArgs?: Record<string, string | undefined> | null
  ) => string;
  hydrateExpansion: (
    entityType: EntityType | QueryEntityType,
    queryParams: URLSearchParams
  ) => URLSearchParams;
  fetchRootEntities: (
    entityType: EntityType,
    searchAndSortState?: SearchAndSortState
  ) => Promise<void>;
  fetchRelatedEntities: (
    parentEntity: BaseEntity,
    parentEntityType: EntityType,
    level: number
  ) => Promise<void>;
  loadMoreEntities: (
    level: number,
    entityType: EntityType | QueryEntityType,
    searchAndSortState?: SearchAndSortState
  ) => Promise<void>;
  clearData: () => void;
}

interface ApiResponse {
  results: any[];
  total?: number;
  count?: number;
  offset?: number;
  limit?: number;
}

export const useDrilldownFetcher = (): UseDrilldownFetcherResult => {
  const [drilldownData, setDrilldownData] = useState<DrilldownData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const dispatch = useAsyncDispatch();
  const context = useApplicationContext((context) => context);

  const ENTITY_SEARCH_MAPPINGS: Partial<
    Record<EntityType, (query: string) => string | any>
  > = {
    'business-unit': (query: string) => ({
      where: `name="${query}"`,
    }),
    store: (query: string) => ({
      where: `name(${context.dataLocale || 'en-US'}="${query}")`,
    }),
    channel: (query: string) => ({
      where: `name(${context.dataLocale || 'en-US'}="${query}")`,
    }),
    product: (query: string) => ({
      where: `masterData(current(masterVariant(sku="${query}"))) or masterData(current(masterVariant(key="${query}")))`,
    }),
    category: (query: string) => ({
      where: `name(${context.dataLocale || 'en-US'}="${query}")`,
    }),
    'product-selection': (query: string) => ({
      where: `key="${query}"`,
    }),
    'cart-discount': (query: string) => ({
      where: `name(${context.dataLocale || 'en-US'}="${query}")`,
    }),
    'customer-group': (query: string) => ({
      where: `name="${query}"`,
    }),
    customer: (query: string) => ({
      where: `email="${query}"`,
    }),
  };

  const getEndpoint = useCallback(
    (
      entityType: EntityType | QueryEntityType,
      queryArgs?: Record<string, string | undefined> | null
    ) => {
      if (entityType in ENTITY_ENDPOINTS) {
        return ENTITY_ENDPOINTS[entityType as EntityType];
      }
      let endpoint = QUERY_ENTITY_ENDPOINTS[entityType as QueryEntityType];
      if (!endpoint) {
        throw new Error(`Unknown entity type: ${entityType}`);
      }
      endpoint = endpoint.replace('{id}', queryArgs?.id || '');
      return endpoint;
    },
    []
  );

  const hydrateExpansion = useCallback(
    (
      entityType: EntityType | QueryEntityType,
      queryParams: URLSearchParams
    ) => {
      const expand = ENDPOINTS_WITH_EXPAND[entityType as QueryEntityType];
      if (expand) {
        queryParams.set(
          'expand',
          ENDPOINTS_WITH_EXPAND[entityType as QueryEntityType]!
        );
      }
      return queryParams;
    },
    []
  );

  const transformEntity = useCallback(
    (entity: any, entityType: EntityType | QueryEntityType): BaseEntity => {
      const expand = ENDPOINTS_WITH_EXPAND[entityType as QueryEntityType];
      let nameField = ENTITY_NAME_FIELDS[entityType as EntityType];
      if (expand && entity[expand]?.obj) {
        entity = entity[expand]?.obj;
        nameField = QUERY_ENTITY_NAME_FIELDS[entityType as QueryEntityType];
      }
      return {
        id: entity.id,
        name: entity[nameField] || entity.key || entity.id,
        key: entity.key,
        version: entity.version,
        createdAt: entity.createdAt,
        lastModifiedAt: entity.lastModifiedAt,
        ...entity,
      };
    },
    []
  );

  const fetchEntities = useCallback(
    async (
      entityType: EntityType | QueryEntityType,
      queryArgs?: Record<string, string | undefined> | null,
      offset: number = 0,
      searchAndSortState?: SearchAndSortState
    ): Promise<{ entities: BaseEntity[]; pagination: PaginationInfo }> => {
      const endpoint = getEndpoint(entityType, queryArgs);
      const limit = 20;
      const queryParams = hydrateExpansion(
        entityType,
        new URLSearchParams({
          limit: limit.toString(),
          offset: offset.toString(),
        })
      );

      // Handle search for root entities
      if (searchAndSortState?.searchQuery && offset === 0) {
        const searchField = ENTITY_SEARCH_MAPPINGS[entityType as EntityType];
        if (searchField) {
          const searchWhere = searchField(searchAndSortState.searchQuery);

          const existingWhere = queryArgs?.where;
          if (existingWhere && searchWhere?.where) {
            queryArgs = {
              ...queryArgs,
              where: `${existingWhere} and ${searchWhere.where}`,
            };
          } else {
            queryArgs = { ...queryArgs, where: searchWhere?.where };
          }
        }
      }

      // Handle sorting for root entities
      if (searchAndSortState?.sortStates) {
        const activeSorts = Object.entries(searchAndSortState.sortStates)
          .filter(([, direction]) => direction !== 'none')
          .map(([field, direction]) => `${field} ${direction}`);

        if (activeSorts.length > 0) {
          const sortQuery = activeSorts.join(', ');
          queryArgs = { ...queryArgs, sort: sortQuery };
        }
      }

      if (queryArgs && Object.keys(queryArgs).length > 0) {
        for (const [key, value] of Object.entries(queryArgs)) {
          if (value) {
            queryParams.set(key, value);
          }
        }
      }

      const response = (await dispatch(
        sdkActions.get({
          mcApiProxyTarget: MC_API_PROXY_TARGETS.COMMERCETOOLS_PLATFORM,
          uri: `/${context?.project?.key}${endpoint}?${queryParams.toString()}`,
        })
      )) as ApiResponse;

      const entities = (response.results || []).map((entity: any) =>
        transformEntity(entity, entityType)
      );

      const total = response.total || response.count || entities.length;
      const hasMore = offset + limit < total;

      const pagination: PaginationInfo = {
        offset,
        limit,
        total,
        hasMore,
      };

      return { entities, pagination };
    },
    [dispatch, context, transformEntity]
  );

  const fetchRootEntities = useCallback(
    async (entityType: EntityType, searchAndSortState?: SearchAndSortState) => {
      setLoading(true);
      setError(null);

      try {
        const { entities, pagination } = await fetchEntities(
          entityType,
          undefined,
          0,
          searchAndSortState
        );

        const rootData: DrilldownData = {
          level: 0,
          entityType,
          entities,
          pagination,
        };

        setDrilldownData([rootData]);
      } catch (err) {
        const error =
          err instanceof Error
            ? err
            : new Error('Failed to fetch root entities');
        setError(error);
        console.error(`Error fetching root ${entityType}:`, error);
      } finally {
        setLoading(false);
      }
    },
    [fetchEntities]
  );

  const fetchRelatedEntities = useCallback(
    async (
      parentEntity: BaseEntity,
      parentEntityType: EntityType,
      level: number
    ) => {
      setLoading(true);
      setError(null);

      try {
        const childEntityTypes =
          relationshipManager.getChildrenForEntityType(parentEntityType);
        const newDrilldownData: DrilldownData[] = [];

        console.log(
          `Fetching related entities for ${parentEntityType} (${parentEntity.id})`
        );
        console.log(`Child entity types:`, childEntityTypes);

        // Fetch entities for each child type
        for (const childEntityType of childEntityTypes) {
          const relationshipKey = `${parentEntityType}->${childEntityType}`;
          const { childEntity, parentEntitySelectorToQueryArgs } =
            RELATIONSHIP_QUERIES[relationshipKey];

          let entities: BaseEntity[] = [];
          let pagination: PaginationInfo = {
            offset: 0,
            limit: 20,
            total: 0,
            hasMore: false,
          };

          if (parentEntitySelectorToQueryArgs) {
            try {
              const queryArgs = parentEntitySelectorToQueryArgs(parentEntity);
              if (queryArgs) {
                console.log(`Parent entity IDs:`, queryArgs);
                const result = await fetchEntities(childEntity, queryArgs);
                entities = result.entities;
                pagination = result.pagination;
              }
            } catch (fetchError) {
              console.warn(
                `Failed to fetch ${childEntity} with where clause for ${parentEntityType} ${parentEntity.id}:`,
                fetchError
              );
            }
          }

          if (entities.length > 0) {
            newDrilldownData.push({
              level,
              entityType: childEntity,
              parentEntityId: parentEntity.id,
              parentEntityType,
              entities,
              pagination,
            });
          }
        }

        console.log(
          `Adding drill-down data for level ${level}:`,
          newDrilldownData
        );

        // Update drilldown data - keep previous levels and add new ones
        setDrilldownData((prev) => {
          // Remove any data from this level and beyond
          const filteredPrev = prev.filter((data) => data.level < level);
          const newData = [...filteredPrev, ...newDrilldownData];
          console.log(`Updated drill-down data:`, newData);
          return newData;
        });
      } catch (err) {
        const error =
          err instanceof Error
            ? err
            : new Error('Failed to fetch related entities');
        setError(error);
        console.error(
          `Error fetching related entities for ${parentEntityType} ${parentEntity.id}:`,
          error
        );
      } finally {
        setLoading(false);
      }
    },
    [fetchEntities, relationshipManager]
  );

  const loadMoreEntities = useCallback(
    async (
      level: number,
      entityType: EntityType | QueryEntityType,
      searchAndSortState?: SearchAndSortState
    ) => {
      setLoading(true);
      setError(null);

      try {
        // Find the current drilldown data for this level and entity type
        const currentData = drilldownData.find(
          (data) => data.level === level && data.entityType === entityType
        );

        if (!currentData) {
          throw new Error(
            `No data found for level ${level} and entity type ${entityType}`
          );
        }

        const nextOffset =
          currentData.pagination.offset + currentData.pagination.limit;

        let result: { entities: BaseEntity[]; pagination: PaginationInfo };

        if (level === 0) {
          // Root level - apply search and sort
          result = await fetchEntities(
            entityType,
            undefined,
            nextOffset,
            searchAndSortState
          );
        } else {
          // Related entities - need to reconstruct query args (no search/sort for children)
          const parentData = drilldownData.find(
            (data) => data.level === level - 1
          );

          if (
            !parentData ||
            !currentData.parentEntityId ||
            !currentData.parentEntityType
          ) {
            throw new Error('Missing parent data for related entities');
          }

          const parentEntity = parentData.entities.find(
            (entity) => entity.id === currentData.parentEntityId
          );

          if (!parentEntity) {
            throw new Error('Parent entity not found');
          }

          // Use the actual entity type from the drilldown data which might be QueryEntityType
          const actualEntityType = currentData.entityType;
          const relationshipKey = `${currentData.parentEntityType}->${actualEntityType}`;
          const relationshipConfig = RELATIONSHIP_QUERIES[relationshipKey];

          if (!relationshipConfig) {
            throw new Error(
              `No query selector found for relationship ${relationshipKey}`
            );
          }

          const { parentEntitySelectorToQueryArgs } = relationshipConfig;

          if (!parentEntitySelectorToQueryArgs) {
            throw new Error(
              `No query selector function found for relationship ${relationshipKey}`
            );
          }

          const queryArgs = parentEntitySelectorToQueryArgs(parentEntity);
          result = await fetchEntities(actualEntityType, queryArgs, nextOffset);
        }

        // Update the drilldown data by appending new entities and updating pagination
        setDrilldownData((prev) => {
          return prev.map((data) => {
            if (data.level === level && data.entityType === entityType) {
              return {
                ...data,
                entities: [...data.entities, ...result.entities],
                pagination: result.pagination,
              };
            }
            return data;
          });
        });
      } catch (err) {
        const error =
          err instanceof Error
            ? err
            : new Error('Failed to load more entities');
        setError(error);
        console.error(
          `Error loading more entities for level ${level}, type ${entityType}:`,
          error
        );
      } finally {
        setLoading(false);
      }
    },
    [drilldownData, fetchEntities]
  );

  const clearData = useCallback(() => {
    setDrilldownData([]);
    setError(null);
  }, []);

  return {
    drilldownData,
    loading,
    error,
    ENTITY_SEARCH_MAPPINGS,
    getEndpoint,
    hydrateExpansion,
    fetchRootEntities,
    fetchRelatedEntities,
    loadMoreEntities,
    clearData,
  };
};

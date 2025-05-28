import {
  PageContentWide,
  useModalState,
} from '@commercetools-frontend/application-components';
import LoadingSpinner from '@commercetools-uikit/loading-spinner';
import { ContentNotification } from '@commercetools-uikit/notifications';
import Spacings from '@commercetools-uikit/spacings';
import Text from '@commercetools-uikit/text';
import React, { useCallback, useEffect, useState } from 'react';
import { useIntl } from 'react-intl';

import { BreadcrumbNavigation } from './components/breadcrumb-navigation';
import { EntityInfoPanel } from './components/entity-info-panel';
import { EntitySelector } from './components/entity-selector';
import { MultiLevelTreemap } from './components/multi-level-treemap';
import { SearchAndSortControls } from './components/search-and-sort-controls';
import { useDrilldownFetcher } from './hooks/use-drilldown-fetcher';
import { useEntityFetcher } from './hooks/use-entity-fetcher';
import {
  BreadcrumbItem,
  DrilldownState,
  EntityInfo,
  EntityType,
  QueryEntityType,
  SearchAndSortState,
  SortDirection,
  TreemapNode,
  VisualizationConfig,
} from './types';
import {
  ALL_ENTITY_TYPES,
  DEFAULT_COLORS,
} from './utils/relationship-contstants';
import { relationshipManager } from './utils/relationship-utils';
import messages from './messages';

const DEFAULT_CONFIG: VisualizationConfig = {
  width: 800,
  height: 600,
  padding: 20,
  colors: DEFAULT_COLORS,
};

const VisualizeDrilldown: React.FC = () => {
  const intl = useIntl();
  const [selectedEntityType, setSelectedEntityType] =
    useState<EntityType | null>(null);
  const [selectedEntityInfo, setSelectedEntityInfo] =
    useState<EntityInfo | null>(null);
  const { isModalOpen, openModal, closeModal } = useModalState(false);
  const { extractName } = useEntityFetcher();
  const [drilldownState, setDrilldownState] = useState<DrilldownState>({
    currentLevel: 0,
    currentEntityType: 'business-unit',
    breadcrumbs: [],
    isAtRoot: true,
  });
  const [visibleEntityTypes, setVisibleEntityTypes] = useState<Set<EntityType>>(
    new Set(ALL_ENTITY_TYPES)
  );
  const [searchAndSortState, setSearchAndSortState] =
    useState<SearchAndSortState>({
      searchQuery: '',
      sortStates: {},
    });

  const {
    drilldownData,
    loading,
    error,
    fetchRootEntities,
    fetchRelatedEntities,
    loadMoreEntities,
    clearData,
  } = useDrilldownFetcher();

  // Fetch entities when entity type is selected or search/sort changes
  useEffect(() => {
    if (selectedEntityType && drilldownState.isAtRoot) {
      fetchRootEntities(selectedEntityType, searchAndSortState);
    }
  }, [
    selectedEntityType,
    searchAndSortState,
    fetchRootEntities,
    drilldownState.isAtRoot,
  ]);

  const handleEntityTypeSelect = useCallback(
    (entityType: EntityType) => {
      setSelectedEntityType(entityType);
      setSelectedEntityInfo(null);
      // Clear search and sort when changing entity type
      setSearchAndSortState({
        searchQuery: '',
        sortStates: {},
      });
      setDrilldownState({
        currentLevel: 0,
        currentEntityType: entityType,
        breadcrumbs: [],
        isAtRoot: true,
      });
      clearData();
    },
    [clearData]
  );

  const handleSearchChange = useCallback((searchQuery: string) => {
    setSearchAndSortState((prev) => ({
      ...prev,
      searchQuery,
    }));
  }, []);

  const handleSortChange = useCallback(
    (field: string, direction: SortDirection) => {
      setSearchAndSortState((prev) => ({
        ...prev,
        sortStates: {
          [field]: direction,
        },
      }));
    },
    []
  );

  const handleClearSearch = useCallback(() => {
    setSearchAndSortState((prev) => ({
      ...prev,
      searchQuery: '',
    }));
  }, []);

  const handleNodeClick = useCallback(
    (node: TreemapNode, currentLevel: number) => {
      console.log(`Node clicked:`, {
        node: node.name,
        entityType: node.entityType,
        currentLevel,
      });

      const name = extractName(node);
      // Set entity info for the info panel
      setSelectedEntityInfo({
        id: node.id,
        name,
        entityType: node.entityType,
        data: node.entity,
      });

      // Check if this entity type can have children
      const childrenTypes = relationshipManager.getChildrenForEntityType(
        node.entityType
      );
      console.log(`Children types for ${node.entityType}:`, childrenTypes);

      if (childrenTypes.length > 0) {
        // Clear search and sort when drilling down
        setSearchAndSortState({
          searchQuery: '',
          sortStates: {},
        });

        // Add to breadcrumbs
        const newBreadcrumb: BreadcrumbItem = {
          entityType: node.entityType,
          entityId: node.id,
          entityName: name,
          level: currentLevel + 1,
        };

        console.log(`Adding breadcrumb:`, newBreadcrumb);

        setDrilldownState((prev) => ({
          currentLevel: currentLevel + 1,
          currentEntityType: node.entityType,
          currentEntityId: node.id,
          breadcrumbs: [...prev.breadcrumbs, newBreadcrumb],
          isAtRoot: false,
        }));

        // Fetch related entities for the next level
        console.log(`Fetching related entities for level ${currentLevel + 1}`);
        fetchRelatedEntities(node.entity, node.entityType, currentLevel + 1);
      } else {
        console.log(
          `No children defined for ${node.entityType}, showing entity info only`
        );
      }
    },
    [fetchRelatedEntities, relationshipManager]
  );

  const handleNodeHover = useCallback((node: TreemapNode | null) => {
    // TODO: Implement hover effects if needed
    if (node) {
      console.log('Node hovered:', node.name);
    }
  }, []);

  const handleOpenEntityInfoPanel = useCallback(() => {
    openModal();
  }, []);

  const handleNavigateToLevel = useCallback(
    (targetLevel: number) => {
      if (targetLevel === 0) {
        // Navigate to root
        handleNavigateToRoot();
        return;
      }

      // Find the breadcrumb for the target level
      const targetBreadcrumb = drilldownState.breadcrumbs.find(
        (b) => b.level === targetLevel
      );
      if (!targetBreadcrumb) return;

      // Clear search and sort when navigating
      setSearchAndSortState({
        searchQuery: '',
        sortStates: {},
      });

      // Update state to target level
      setDrilldownState((prev) => ({
        currentLevel: targetLevel,
        currentEntityType: targetBreadcrumb.entityType,
        currentEntityId: targetBreadcrumb.entityId,
        breadcrumbs: prev.breadcrumbs.filter((b) => b.level <= targetLevel),
        isAtRoot: targetLevel === 0,
      }));

      // The data for this level should already exist in drilldownData
      // If not, we might need to refetch, but for now we'll assume it exists
      console.log(`Navigated to level ${targetLevel}`);
    },
    [drilldownState.breadcrumbs]
  );

  const handleNavigateToRoot = useCallback(() => {
    if (selectedEntityType) {
      // Clear search and sort when navigating to root
      setSearchAndSortState({
        searchQuery: '',
        sortStates: {},
      });

      setDrilldownState({
        currentLevel: 0,
        currentEntityType: selectedEntityType,
        breadcrumbs: [],
        isAtRoot: true,
      });
      setSelectedEntityInfo(null);
      // Don't fetch here, the useEffect will handle it
    }
  }, [selectedEntityType]);

  const handleLoadMore = useCallback(
    (level: number, entityType: EntityType | QueryEntityType) => {
      console.log(
        `Load more requested for level ${level}, entity type ${entityType}`
      );
      // Pass search and sort state only for root level (level 0)
      const searchAndSort = level === 0 ? searchAndSortState : undefined;
      loadMoreEntities(level, entityType, searchAndSort);
    },
    [loadMoreEntities, searchAndSortState]
  );

  const handleToggleEntityType = useCallback((entityType: EntityType) => {
    setVisibleEntityTypes((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(entityType)) {
        newSet.delete(entityType);
      } else {
        newSet.add(entityType);
      }
      return newSet;
    });
  }, []);

  const handleHideAll = useCallback(() => {
    setVisibleEntityTypes(new Set());
  }, []);

  const handleShowAll = useCallback(() => {
    setVisibleEntityTypes(new Set(ALL_ENTITY_TYPES));
  }, []);

  // Filter drilldown data to show only the current level
  const visibleDrilldownData = drilldownData.filter(
    (data) => data.level === drilldownState.currentLevel
  );

  // Debug log
  console.log(`Current drilldown state:`, drilldownState);
  console.log(`All drilldown data:`, drilldownData);
  console.log(
    `Visible drilldown data (current level only):`,
    visibleDrilldownData
  );

  return (
    <Spacings.Inset scale="l">
      <PageContentWide>
        <Spacings.Stack scale="xl">
          <Text.Headline as="h1">
            {intl.formatMessage(messages.title)}
          </Text.Headline>
          <Text.Body>{intl.formatMessage(messages.description)}</Text.Body>

          <EntitySelector
            selectedEntityType={selectedEntityType}
            onEntityTypeSelect={handleEntityTypeSelect}
            loading={loading}
          />

          {selectedEntityType && drilldownState.isAtRoot && (
            <SearchAndSortControls
              entityType={selectedEntityType}
              searchAndSortState={searchAndSortState}
              onSearchChange={handleSearchChange}
              onSortChange={handleSortChange}
              onClearSearch={handleClearSearch}
            />
          )}

          {!drilldownState.isAtRoot && (
            <BreadcrumbNavigation
              breadcrumbs={drilldownState.breadcrumbs}
              onNavigateToLevel={handleNavigateToLevel}
              onNavigateToRoot={handleNavigateToRoot}
            />
          )}

          {error && (
            <ContentNotification type="error">
              <Text.Body>
                {intl.formatMessage(messages.errorLoadingEntities, {
                  error: error.message,
                })}
              </Text.Body>
            </ContentNotification>
          )}

          {loading && (
            <Spacings.Stack alignItems="center">
              <LoadingSpinner />
              <Text.Body>
                {drilldownState.isAtRoot
                  ? intl.formatMessage(messages.loadingEntities, {
                      entityType: selectedEntityType,
                    })
                  : intl.formatMessage(messages.loadingRelatedEntities)}
              </Text.Body>
            </Spacings.Stack>
          )}

          {!loading && !error && visibleDrilldownData.length > 0 && (
            <Spacings.Stack scale="m">
              <MultiLevelTreemap
                drilldownData={visibleDrilldownData}
                config={DEFAULT_CONFIG}
                onNodeClick={handleNodeClick}
                onNodeHover={handleNodeHover}
                onLoadMore={handleLoadMore}
                visibleEntityTypes={visibleEntityTypes}
                onToggleEntityType={handleToggleEntityType}
                onShowAll={handleShowAll}
                onHideAll={handleHideAll}
                onOpenEntityInfoPanel={handleOpenEntityInfoPanel}
                isEntityInfoPanelOpen={isModalOpen}
                selectedEntityInfo={selectedEntityInfo}
              />
            </Spacings.Stack>
          )}

          {!loading &&
            !error &&
            selectedEntityType &&
            visibleDrilldownData.length === 0 && (
              <ContentNotification type="info">
                <Text.Body>
                  {intl.formatMessage(messages.noDataFound, {
                    entityType: selectedEntityType,
                  })}
                </Text.Body>
              </ContentNotification>
            )}
        </Spacings.Stack>
      </PageContentWide>

      <EntityInfoPanel
        isOpen={isModalOpen}
        entityInfo={selectedEntityInfo}
        onClose={closeModal}
      />
    </Spacings.Inset>
  );
};

VisualizeDrilldown.displayName = 'VisualizeDrilldown';

export default VisualizeDrilldown;

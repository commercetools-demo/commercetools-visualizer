import Card from '@commercetools-uikit/card';
import { AngleRightIcon } from '@commercetools-uikit/icons';
import SecondaryButton from '@commercetools-uikit/secondary-button';
import Spacings from '@commercetools-uikit/spacings';
import Text from '@commercetools-uikit/text';
import React, { useEffect, useRef } from 'react';
import { useIntl } from 'react-intl';
import {
  BaseEntity,
  DrilldownData,
  EntityInfo,
  EntityType,
  QueryEntityType,
  TreemapNode,
  VisualizationConfig,
} from '../types';
import {
  convertToEntityType,
  ENTITY_LABELS,
  QUERY_ENTITY_LABELS,
} from '../utils/relationship-contstants';
import { useAdditionalData } from '../hooks/use-additional-data';
import { InteractiveLegend } from './interactive-legend';
import { TreemapChart } from './treemap-chart';
import messages from '../messages';

interface MultiLevelTreemapProps {
  drilldownData: DrilldownData[];
  config: VisualizationConfig;
  onNodeClick: (node: TreemapNode, level: number) => void;
  onNodeHover?: (node: TreemapNode | null) => void;
  onLoadMore?: (
    level: number,
    entityType: EntityType | QueryEntityType
  ) => void;
  visibleEntityTypes: Set<EntityType>;
  onToggleEntityType: (entityType: EntityType) => void;
  onShowAll?: () => void;
  onHideAll?: () => void;
  onOpenEntityInfoPanel?: () => void;
  isEntityInfoPanelOpen?: boolean;
  selectedEntityInfo?: EntityInfo | null;
}

export const MultiLevelTreemap: React.FC<MultiLevelTreemapProps> = ({
  drilldownData,
  config,
  onNodeClick,
  onNodeHover,
  onLoadMore,
  visibleEntityTypes,
  onToggleEntityType,
  onShowAll,
  onHideAll,
  onOpenEntityInfoPanel,
  isEntityInfoPanelOpen,
  selectedEntityInfo,
}) => {
  const intl = useIntl();
  const {
    nodeDataMap,
    loading: additionalDataLoading,
    fetchAdditionalData,
    clearData,
  } = useAdditionalData();
  const prevLevelRef = useRef<number>(0);

  const transformToTreemapNodes = (
    entities: BaseEntity[],
    entityType: EntityType | QueryEntityType
  ): TreemapNode[] => {
    return entities.map((entity) => {
      const nodeId = entity.id;
      const convertedEntityType = convertToEntityType(
        entityType as QueryEntityType
      );

      return {
        id: nodeId,
        name: entity.name || entity.key || entity.id,
        value: 1, // Equal weight for now
        entityType: convertedEntityType,
        entity,
        additionalData: nodeDataMap.get(nodeId), // Include additional data if available
      };
    });
  };

  const createLoadMoreNode = (
    entityType: EntityType | QueryEntityType,
    level: number
  ): TreemapNode => ({
    id: `load-more-${entityType}-${level}`,
    name: intl.formatMessage(messages.loadMore),
    value: 0.5, // Smaller weight for load more nodes
    entityType: convertToEntityType(entityType as QueryEntityType),
    entity: {
      id: `load-more-${entityType}-${level}`,
      name: intl.formatMessage(messages.loadMore),
      version: 0,
      createdAt: '',
      lastModifiedAt: '',
    },
  });

  if (drilldownData.length === 0) {
    return null;
  }

  // Combine all entities from all drilldown data into one dataset
  const allTreemapNodes: TreemapNode[] = [];
  const entityTypeCounts: Record<string, number> = {};
  let currentLevel = 0;
  let parentInfo: { entityType?: EntityType; entityId?: string } = {};

  drilldownData.forEach((levelData) => {
    const nodes = transformToTreemapNodes(
      levelData.entities,
      levelData.entityType
    );
    allTreemapNodes.push(...nodes);
    entityTypeCounts[levelData.entityType] = levelData.entities.length;
    currentLevel = levelData.level;

    // Add load more node if there are more entities to load
    if (levelData.pagination.hasMore) {
      const loadMoreNode = createLoadMoreNode(
        levelData.entityType,
        levelData.level
      );
      allTreemapNodes.push(loadMoreNode);
    }

    if (levelData.parentEntityType && levelData.parentEntityId) {
      parentInfo = {
        entityType: levelData.parentEntityType,
        entityId: levelData.parentEntityId,
      };
    }
  });

  // Effect to fetch additional data for TreeMap nodes
  useEffect(() => {
    if (allTreemapNodes.length > 0) {
      // Only fetch for nodes that don't have additional data yet
      const nodesToFetch = allTreemapNodes.filter(
        (node) => !node.id.startsWith('load-more-') && !nodeDataMap.has(node.id)
      );

      if (nodesToFetch.length > 0) {
        fetchAdditionalData(nodesToFetch);
      }
    }
  }, [
    drilldownData.map((d) => d.entities.length).join(','),
    allTreemapNodes.length,
    fetchAdditionalData,
  ]);

  // Clear additional data when drilldown level changes
  useEffect(() => {
    const currentLevelKey =
      drilldownData.length > 0 ? drilldownData[0].level : 0;

    if (prevLevelRef.current !== currentLevelKey) {
      clearData();
      prevLevelRef.current = currentLevelKey;
    }
  }, [drilldownData.length > 0 ? drilldownData[0].level : 0, clearData]);

  // Filter treemap nodes based on visible entity types
  const filteredTreemapNodes = allTreemapNodes.filter((node) => {
    // Always show load more nodes for visible entity types
    if (node.id.startsWith('load-more-')) {
      return visibleEntityTypes.has(node.entityType);
    }
    return visibleEntityTypes.has(node.entityType);
  });

  if (allTreemapNodes.length === 0) {
    return null;
  }

  // Create legend information with pagination details
  const legend = Object.keys(entityTypeCounts).map((entityType) => {
    const levelData = drilldownData.find((d) => d.entityType === entityType);
    let labelField: string = ENTITY_LABELS[entityType as EntityType];
    if (!labelField && QUERY_ENTITY_LABELS[entityType as QueryEntityType]) {
      labelField = QUERY_ENTITY_LABELS[entityType as QueryEntityType];
    }
    return {
      entityType: entityType as EntityType,
      label: labelField,
      count: entityTypeCounts[entityType],
      total: levelData?.pagination.total,
      hasMore: levelData?.pagination.hasMore || false,
      color: config.colors[entityType as EntityType],
      visible: visibleEntityTypes.has(entityType as EntityType),
    };
  });

  const handleNodeClick = (node: TreemapNode, level: number) => {
    // Check if this is a load more node
    if (node.id.startsWith('load-more-') && onLoadMore) {
      // Extract the original entity type from the load more node ID
      const entityTypeFromId = node.id
        .replace(`load-more-`, '')
        .replace(`-${level}`, '');

      // Find the corresponding drilldown data to get the actual entity type
      const correspondingData = drilldownData.find(
        (data) => data.level === level && data.entityType === entityTypeFromId
      );

      if (correspondingData) {
        // Pass the actual entity type (which might be QueryEntityType)
        onLoadMore(level, correspondingData.entityType);
      } else {
        // Fallback to the node's entity type converted to EntityType
        onLoadMore(
          level,
          convertToEntityType(entityTypeFromId as QueryEntityType)
        );
      }
    } else {
      onNodeClick(node, level);
    }
  };

  return (
    <Card type="raised" insetScale="m" theme="light">
      <Spacings.Stack scale="m">
        <Spacings.Inline
          scale="m"
          alignItems="flex-start"
          justifyContent="space-between"
        >
          {legend.length > 0 ? (
            <InteractiveLegend
              legend={legend}
              visibleEntityTypes={visibleEntityTypes}
              onToggleEntityType={onToggleEntityType}
              onShowAll={onShowAll}
              onHideAll={onHideAll}
            />
          ) : (
            <div></div>
          )}
          {!!selectedEntityInfo && (
            <SecondaryButton
              onClick={onOpenEntityInfoPanel}
              label={
                isEntityInfoPanelOpen
                  ? intl.formatMessage(messages.close)
                  : intl.formatMessage(messages.entityDetails, {
                      entityType: ENTITY_LABELS[
                        selectedEntityInfo?.entityType as EntityType
                      ].slice(0, -1),
                    })
              }
              iconRight={<AngleRightIcon />}
              size="10"
            />
          )}
        </Spacings.Inline>

        <Spacings.Inline
          scale="m"
          alignItems="flex-start"
          justifyContent="center"
        >
          {filteredTreemapNodes.length > 0 ? (
            <Spacings.Stack scale="s">
              {additionalDataLoading && (
                <Text.Caption tone="secondary">
                  {intl.formatMessage(messages.loadingAdditionalNodeData)}
                </Text.Caption>
              )}
              <TreemapChart
                data={filteredTreemapNodes}
                config={{
                  ...config,
                  // Adjust size based on total number of items
                  width: Math.max(
                    600,
                    Math.min(1000, filteredTreemapNodes.length * 40)
                  ),
                  height: Math.max(
                    400,
                    Math.min(700, filteredTreemapNodes.length * 30)
                  ),
                }}
                onNodeClick={(node) => handleNodeClick(node, currentLevel)}
                onNodeHover={onNodeHover}
              />
            </Spacings.Stack>
          ) : (
            <Spacings.Stack scale="m">
              <Text.Headline as="h3" tone="secondary">
                {intl.formatMessage(messages.noEntitiesVisible)}
              </Text.Headline>
              <Text.Body tone="secondary">
                {intl.formatMessage(messages.allEntityTypesHidden)}
              </Text.Body>
            </Spacings.Stack>
          )}
        </Spacings.Inline>

        {currentLevel === 0 ? (
          <Text.Caption tone="secondary">
            {intl.formatMessage(messages.clickToExploreRoot)}
          </Text.Caption>
        ) : (
          <Text.Caption tone="secondary">
            {intl.formatMessage(messages.clickToExploreDrilldown)}
          </Text.Caption>
        )}
      </Spacings.Stack>
    </Card>
  );
};

import { defineMessages } from 'react-intl';

export default defineMessages({
  // Main page title and descriptions
  title: {
    id: 'VisualizeDrilldown.title',
    defaultMessage: 'Visualize Drilldown',
  },
  description: {
    id: 'VisualizeDrilldown.description',
    defaultMessage:
      'Explore your commercetools data through interactive treemap visualizations. Select an entity type to start exploring relationships between your data.',
  },

  // Entity Selector
  selectEntityTypeTitle: {
    id: 'VisualizeDrilldown.selectEntityTypeTitle',
    defaultMessage: 'Select Entity Type to Visualize',
  },
  selectEntityTypeDescription: {
    id: 'VisualizeDrilldown.selectEntityTypeDescription',
    defaultMessage:
      'Choose an entity type to start exploring your data relationships.',
  },

  // Search and Sort
  searchTitle: {
    id: 'VisualizeDrilldown.searchTitle',
    defaultMessage: 'Search',
  },
  sortByTitle: {
    id: 'VisualizeDrilldown.sortByTitle',
    defaultMessage: 'Sort By',
  },
  currentlySortingBy: {
    id: 'VisualizeDrilldown.currentlySortingBy',
    defaultMessage:
      'Currently sorting by {field}. Click another field to change sort criteria.',
  },

  // Breadcrumb Navigation
  navigationPath: {
    id: 'VisualizeDrilldown.navigationPath',
    defaultMessage: 'Navigation Path',
  },
  rootBreadcrumb: {
    id: 'VisualizeDrilldown.rootBreadcrumb',
    defaultMessage: 'Root',
  },

  // Entity Info Panel
  entityInfoTitle: {
    id: 'VisualizeDrilldown.entityInfoTitle',
    defaultMessage: 'Entity Info',
  },
  entityType: {
    id: 'VisualizeDrilldown.entityType',
    defaultMessage: 'Entity Type',
  },
  entityId: {
    id: 'VisualizeDrilldown.entityId',
    defaultMessage: 'ID',
  },
  entityKey: {
    id: 'VisualizeDrilldown.entityKey',
    defaultMessage: 'Key',
  },
  entityVersion: {
    id: 'VisualizeDrilldown.entityVersion',
    defaultMessage: 'Version',
  },
  entityCreatedAt: {
    id: 'VisualizeDrilldown.entityCreatedAt',
    defaultMessage: 'Created At',
  },
  entityLastModified: {
    id: 'VisualizeDrilldown.entityLastModified',
    defaultMessage: 'Last Modified',
  },
  rawData: {
    id: 'VisualizeDrilldown.rawData',
    defaultMessage: 'Raw Data',
  },

  // Interactive Legend
  legend: {
    id: 'VisualizeDrilldown.legend',
    defaultMessage: 'Legend:',
  },
  showAll: {
    id: 'VisualizeDrilldown.showAll',
    defaultMessage: 'Show All',
  },
  hideAll: {
    id: 'VisualizeDrilldown.hideAll',
    defaultMessage: 'Hide All',
  },

  // Loading and Error states
  loadingEntities: {
    id: 'VisualizeDrilldown.loadingEntities',
    defaultMessage: 'Loading {entityType} data...',
  },
  loadingRelatedEntities: {
    id: 'VisualizeDrilldown.loadingRelatedEntities',
    defaultMessage: 'Loading related entities...',
  },
  errorLoadingEntities: {
    id: 'VisualizeDrilldown.errorLoadingEntities',
    defaultMessage: 'Error loading entities: {error}',
  },
  noDataFound: {
    id: 'VisualizeDrilldown.noDataFound',
    defaultMessage: 'No {entityType} data found.',
  },

  // TreeMap and other components
  loadMore: {
    id: 'VisualizeDrilldown.loadMore',
    defaultMessage: 'Load More...',
  },
  showingEntities: {
    id: 'VisualizeDrilldown.showingEntities',
    defaultMessage: 'Showing: {entities}',
  },
  levelInfo: {
    id: 'VisualizeDrilldown.levelInfo',
    defaultMessage: 'Level {level}',
  },
  parentEntity: {
    id: 'VisualizeDrilldown.parentEntity',
    defaultMessage: 'Parent: {entityName} ({entityType})',
  },
  childrenTypes: {
    id: 'VisualizeDrilldown.childrenTypes',
    defaultMessage: 'Children: {types}',
  },
  clickToViewEntityInfo: {
    id: 'VisualizeDrilldown.clickToViewEntityInfo',
    defaultMessage: 'Click to view entity info',
  },
  viewEntityInfo: {
    id: 'VisualizeDrilldown.viewEntityInfo',
    defaultMessage: 'View Entity Info',
  },

  // Multi-level TreeMap specific messages
  loadingAdditionalNodeData: {
    id: 'VisualizeDrilldown.loadingAdditionalNodeData',
    defaultMessage: 'Loading additional node data...',
  },
  noEntitiesVisible: {
    id: 'VisualizeDrilldown.noEntitiesVisible',
    defaultMessage: 'No entities visible',
  },
  allEntityTypesHidden: {
    id: 'VisualizeDrilldown.allEntityTypesHidden',
    defaultMessage:
      'All entity types are currently hidden. Use the legend above to show specific entity types.',
  },
  clickToExploreRoot: {
    id: 'VisualizeDrilldown.clickToExploreRoot',
    defaultMessage:
      'Click on any item to explore its relationships and drill down further. Click "..." to load more items.',
  },
  clickToExploreDrilldown: {
    id: 'VisualizeDrilldown.clickToExploreDrilldown',
    defaultMessage:
      'Click on any item to drill down further, click "..." to load more items, or use breadcrumbs to navigate back to previous levels.',
  },
  close: {
    id: 'VisualizeDrilldown.close',
    defaultMessage: 'Close',
  },
  entityDetails: {
    id: 'VisualizeDrilldown.entityDetails',
    defaultMessage: '{entityType} details',
  },

  // TreeMap Chart specific messages
  loadMoreTooltip: {
    id: 'VisualizeDrilldown.loadMoreTooltip',
    defaultMessage: 'Load more {entityType}...',
  },
  entityTooltip: {
    id: 'VisualizeDrilldown.entityTooltip',
    defaultMessage: '{name} ({entityType})',
  },
  unknownEntityType: {
    id: 'VisualizeDrilldown.unknownEntityType',
    defaultMessage: 'Unknown',
  },
  items: {
    id: 'VisualizeDrilldown.items',
    defaultMessage: 'items',
  },
});

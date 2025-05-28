export type EntityType =
  | 'business-unit'
  | 'associate'
  | 'customer'
  | 'store'
  | 'channel'
  | 'product'
  | 'cart-discount'
  | 'product-selection'
  | 'standalone-price'
  | 'customer-group'
  | 'category';

export type QueryEntityType =
  | 'query-product-selections'
  | 'query-products-in-product-selection';
export interface EntityRelationship {
  root: EntityType;
  children: EntityType[];
}

export interface BaseEntity {
  id: string;
  name?: string;
  key?: string;
  version: number;
  createdAt: string;
  lastModifiedAt: string;
}

export interface TreemapNode {
  id: string;
  name: string;
  value: number;
  entityType: EntityType;
  entity: BaseEntity;
  children?: TreemapNode[];
  additionalData?: string;
}

export interface BreadcrumbItem {
  entityType: EntityType;
  entityId: string;
  entityName: string;
  level: number;
}

export interface DrilldownState {
  currentLevel: number;
  currentEntityType: EntityType;
  currentEntityId?: string;
  breadcrumbs: BreadcrumbItem[];
  isAtRoot: boolean;
}

export interface EntityInfo {
  id: string;
  name: string;
  entityType: EntityType;
  data: BaseEntity;
}

export interface VisualizationConfig {
  width: number;
  height: number;
  padding: number;
  colors: {
    [key in EntityType]: string;
  };
}

export interface PaginationInfo {
  offset: number;
  limit: number;
  total: number;
  hasMore: boolean;
}

export interface DrilldownData {
  level: number;
  entityType: EntityType | QueryEntityType;
  parentEntityId?: string;
  parentEntityType?: EntityType;
  entities: BaseEntity[];
  pagination: PaginationInfo;
}

export type SortDirection = 'asc' | 'desc' | 'none';

export interface SortState {
  field: string;
  direction: SortDirection;
}

export interface SearchAndSortState {
  searchQuery: string;
  sortStates: Record<string, SortDirection>; // field -> direction mapping
}

export interface RelationshipQuery {
  childEntity: EntityType | QueryEntityType;
  parentEntitySelectorToQueryArgs?: (
    parentEntity: BaseEntity
  ) => Record<string, string | undefined | any> | null;
}

import { EntityRelationship, EntityType } from '../types';
import { NON_ROOT_ENTITY_TYPES } from './relationship-contstants';
import relationshipsData from './relationships';

export class RelationshipManager {
  private relationships: EntityRelationship[];

  constructor() {
    this.relationships = relationshipsData as EntityRelationship[];
  }

  /**
   * Get all available root entity types
   */
  getRootEntityTypes(): EntityType[] {
    return this.relationships
      .map((rel) => rel.root)
      .filter((rel) => !NON_ROOT_ENTITY_TYPES.includes(rel));
  }

  /**
   * Get children entity types for a given root entity type
   */
  getChildrenForEntityType(entityType: EntityType): EntityType[] {
    const relationship = this.relationships.find(
      (rel) => rel.root === entityType
    );
    return relationship ? relationship.children : [];
  }

  /**
   * Check if an entity type can be a root
   */
  canBeRoot(entityType: EntityType): boolean {
    return this.relationships.some((rel) => rel.root === entityType);
  }

  /**
   * Get all entity types that can be children of a given entity type
   */
  getPossibleChildren(entityType: EntityType): EntityType[] {
    return this.getChildrenForEntityType(entityType);
  }

  /**
   * Get all relationships
   */
  getAllRelationships(): EntityRelationship[] {
    return [...this.relationships];
  }

  /**
   * Get entity types that have a specific entity as a child
   */
  getParentEntityTypes(childEntityType: EntityType): EntityType[] {
    return this.relationships
      .filter((rel) => rel.children.includes(childEntityType))
      .map((rel) => rel.root);
  }
}

// Singleton instance
export const relationshipManager = new RelationshipManager();

export interface PagedQueryResponse<T> {
  limit: number;
  offset: number;
  count: number;
  total?: number;
  results: T[];
}

export interface CustomObject<T> {
  id: string;
  key: string;
  value: T;
}

export interface SchemaAttribute {
  name: string;
  type: string;
  required: boolean;
  set: boolean;
  reference?: {
    by: string;
    type: string;
  };
  enum?: { label: string; value: string }[];
}

export interface ProductTypeAttribute {
  name: string;
  label: Record<string, string>;
  isRequired: boolean;
  type: {
    name: string;
    values?: { label: string | Record<string, string>; key: string }[];
    referenceTypeId?: string;
    elementType?: {
      name: string;
      values?: { label: string | Record<string, string>; key: string }[];
      referenceTypeId?: string;
    };
  };
}

export type SchemaTypeResponse = CustomObject<{
  attributes: SchemaAttribute[];
}>;

export interface LinkDataResponse extends CustomObject<LinkData[]> {}
export type LocationDataResponse = CustomObject<LocationData[]>;

export interface TypeAttribute {
  name: string;
  label: Record<string, string>;
  required: boolean;
  type: {
    name: string;
    values?: { label: string | Record<string, string>; key: string }[];
    referenceTypeId?: string;
    elementType?: {
      name: string;
      values?: { label: string | Record<string, string>; key: string }[];
      referenceTypeId?: string;
    };
  };
}

export interface ProductTypeResponse {
  id: string;
  name: string;
  key: string;
  attributes: ProductTypeAttribute[];
}

export interface TypeResponse {
  id: string;
  name: string;
  key: string;
  fieldDefinitions: TypeAttribute[];
  resourceTypeIds: string[];
}

export type NodeEntity = {
  key: string;
  loc?: string;
  items: {
    name: string;
    iskey: boolean;
    figure: string;
    color: string;
  }[];
  inheritedItems?: {
    name: string;
  }[];
};

export interface LinkData {
  key: string;
  from: string;
  to: string;
  text?: string;
  toText?: string;
}

export interface LocationData {
  key: string;
  loc: string;
}

export interface NodeData extends NodeEntity {
  position: { x: number; y: number };
}

export type ChangeEvent =
  | {
      type: 'nodePositionChanged';
      nodeKey: string;
      loc: string;
    }
  | {
      type: 'linkAdded';
      key: string;
      fromNode: string;
      toNode: string;
      text?: string;
      toText?: string;
    }
  | {
      type: 'linkModified';
      key: string;
      newFromNode: string;
      newToNode: string;
      text?: string;
      toText?: string;
    }
  | { type: 'linkRemoved'; key: string; fromNode?: string; toNode?: string }
  | {
      type: 'linkTextChanged';
      key: string;
      oldText: string;
      newText: string;
      isFromText: boolean;
    };

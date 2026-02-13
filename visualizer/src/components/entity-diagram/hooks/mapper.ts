import {
  PagedQueryResponse,
  SchemaTypeResponse,
  ProductTypeResponse,
  TypeResponse,
  NodeEntity,
  LocationData,
} from './types'; // Assuming types are defined in a separate file


const PRODUCT_INHERITED_ATTRIBUTES = [
  {
    name: 'id',
    iskey: true,
    figure: 'Diamond',
  },
  {
    name: 'name',
    iskey: false,
    figure: 'Rectangle',
  },
  {
    name: 'description',
    iskey: false,
    figure: 'Rectangle',
  },
];

// Helper function to create a GoEntity
const createGoEntity = (
  key: string,
  name: string,
  items: { name: string; iskey: boolean }[],
  type: 'CustomObject' | 'CustomType' | 'ProductType',
  location?: string
): NodeEntity => {
  return {
    key,
    ...(location && { loc: location }),
    // loc: `${100 * (index + 1)} ${10 * (index + 1)}`, // You may want to set a specific location or randomize it
    items: items.map((item) => ({
      name: item.name,
      iskey: item.iskey,
      figure: 'Rectangle',
      color:
        type === 'ProductType'
          ? 'blue'
          : type === 'CustomType'
          ? 'red'
          : 'green',
    })),
    ...(type === 'ProductType' && {
      inheritedItems: PRODUCT_INHERITED_ATTRIBUTES,
    }),
  };
};

// Method to map SchemaTypeResponse to GoEntity[]
export const mapSchemaTypeToGoEntities = (
  response: PagedQueryResponse<SchemaTypeResponse>,
  locationData?: LocationData[]
): NodeEntity[] => {
  return response.results.map((schema) => {
    const items = schema.value.attributes.map((attr) => ({
      name: attr.name,
      iskey: attr.name === 'id', // Assuming 'id' is always the key
    }));
    return createGoEntity(
      schema.key,
      schema.key,
      items,
      'CustomObject',
      locationData?.find((data) => data.key === schema.key)?.loc
    );
  });
};

// Method to map ProductTypeResponse to GoEntity[]
export const mapProductTypeToGoEntities = (
  response: PagedQueryResponse<ProductTypeResponse>,
  locationData?: LocationData[]
): NodeEntity[] => {
  return response.results.map((productType, index) => {
    const items = productType.attributes.map((attr) => ({
      name: attr.name,
      iskey: attr.name === 'id', // Assuming 'id' is always the key
    }));
    return createGoEntity(
      productType.name ?? productType.key,
      productType.key,
      items,
      'ProductType',
      locationData?.find(
        (data) => data.key === productType.name ?? productType.key
      )?.loc
    );
  });
};

// Method to map TypeResponse to GoEntity[]
export const mapTypeToGoEntities = (
  response: PagedQueryResponse<TypeResponse>,
  locationData?: LocationData[]
): NodeEntity[] => {
  return response.results.map((type, index) => {
    const items = type.fieldDefinitions.map((field) => ({
      name: field.name,
      iskey: field.name === 'id', // Assuming 'id' is always the key
    }));
    return createGoEntity(
      type.key,
      type.name,
      items,
      'CustomType',
      locationData?.find((data) => data.key === type.key)?.loc
    );
  });
};

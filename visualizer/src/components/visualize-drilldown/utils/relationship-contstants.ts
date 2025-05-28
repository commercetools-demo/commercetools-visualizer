import {
  Associate,
  BusinessUnit,
  Category,
  CategoryReference,
  Channel,
  ChannelReference,
  Customer,
  CustomerGroup,
  CustomerGroupAssignment,
  InheritedAssociate,
  Product,
  ProductSelectionSetting,
  StandalonePrice,
  Store,
} from '@commercetools/platform-sdk';
import {
  BaseEntity,
  EntityType,
  QueryEntityType,
  RelationshipQuery,
} from '../types';

export const NON_ROOT_ENTITY_TYPES: EntityType[] = [
  'standalone-price',
  'associate',
  'product',
];

export const ENDPOINTS_WITH_EXPAND: Record<
  QueryEntityType,
  string | undefined
> = {
  'query-product-selections': 'productSelection',
  'query-products-in-product-selection': 'product',
};

export const ALL_ENTITY_TYPES: EntityType[] = [
  'business-unit',
  'associate',
  'store',
  'channel',
  'product',
  'cart-discount',
  'product-selection',
  'standalone-price',
  'customer-group',
  'category',
];

export const DEFAULT_COLORS: Record<EntityType | QueryEntityType, string> = {
  'business-unit': '#4A90E2',
  associate: '#0d3d15',
  customer: '#7ED321',
  store: '#F5A623',
  channel: '#D0021B',
  product: '#9013FE',
  category: '#a7d350',
  'product-selection': '#50E3C2',
  'cart-discount': '#FF9F43',
  'standalone-price': '#B8E986',
  'customer-group': '#BD10E0',
  'query-product-selections': '#50E3C2',
  'query-products-in-product-selection': '#9013FE',
};

export const ENTITY_LABELS: Record<EntityType, string> = {
  'business-unit': 'Business Units',
  associate: 'Associates',
  customer: 'Customers',
  store: 'Stores',
  channel: 'Channels',
  product: 'Products',
  category: 'Categories',
  'product-selection': 'Product Selections',
  'cart-discount': 'Cart Discounts',
  'standalone-price': 'Standalone Prices',
  'customer-group': 'Customer Groups',
};

export const QUERY_ENTITY_LABELS: Record<QueryEntityType, string> = {
  'query-product-selections': 'Product Selections',
  'query-products-in-product-selection': 'Products',
};

// Entity name field mapping - different entities use different fields for display names
export const ENTITY_NAME_FIELDS: Record<EntityType, string> = {
  'business-unit': 'name',
  associate: 'email',
  customer: 'email',
  store: 'name',
  channel: 'name',
  product: 'name',
  category: 'name',
  'product-selection': 'name',
  'cart-discount': 'name',
  'standalone-price': 'value', // standalone prices typically use key
  'customer-group': 'name',
};

export const QUERY_ENTITY_NAME_FIELDS: Record<QueryEntityType, string> = {
  'query-product-selections': 'name',
  'query-products-in-product-selection': 'name',
};

// Entity endpoint mapping
export const ENTITY_ENDPOINTS: Record<EntityType, string> = {
  'business-unit': '/business-units',
  associate: '/customers',
  customer: '/customers',
  store: '/stores',
  channel: '/channels',
  product: '/products',
  category: '/categories',
  'product-selection': '/product-selections',
  'cart-discount': '/cart-discounts',
  'standalone-price': '/standalone-prices',
  'customer-group': '/customer-groups',
};

export const QUERY_ENTITY_ENDPOINTS: Record<QueryEntityType, string> = {
  'query-product-selections': '/products/{id}/product-selections',
  'query-products-in-product-selection': '/product-selections/{id}/products',
};

// Relationship field mappings - how to find related entities
export const RELATIONSHIP_QUERIES: Record<string, RelationshipQuery> = {
  // Business Unit relationships
  'business-unit->store': {
    childEntity: 'store',
    parentEntitySelectorToQueryArgs: (parentEntity) => {
      const stores = (parentEntity as BusinessUnit).stores;
      if (stores && stores.length) {
        return {
          where: `key in (${(parentEntity as BusinessUnit).stores
            ?.map((store: any) => `"${store.key}"`)
            .join(',')})`,
        };
      }
      return null;
    },
  },
  'business-unit->associate': {
    parentEntitySelectorToQueryArgs: (parentEntity) => {
      const inheritedAssociates =
        (parentEntity as BusinessUnit).inheritedAssociates?.map(
          (inheritedAssociate: InheritedAssociate) =>
            `"${inheritedAssociate.customer.id}"`
        ) || [];
      const associates =
        (parentEntity as BusinessUnit).associates?.map(
          (associate: Associate) => `"${associate.customer.id}"`
        ) || [];
      const allAssociates = [...inheritedAssociates, ...associates];
      if (allAssociates && allAssociates.length) {
        return {
          where: `id in (${allAssociates})`,
        };
      }
      return null;
    },
    childEntity: 'associate',
  },
  'business-unit->business-unit': {
    parentEntitySelectorToQueryArgs: (parentEntity) => ({
      where: `parentUnit(key="${(parentEntity as BusinessUnit).key}")`,
    }),
    childEntity: 'business-unit',
  },

  // Store relationships
  'store->business-unit': {
    parentEntitySelectorToQueryArgs: (store) => ({
      where: `stores(key="${(store as Store).key}")`,
    }),
    childEntity: 'business-unit',
  },
  'store->product-selection': {
    parentEntitySelectorToQueryArgs: (parentEntity) => {
      const productSelections = (parentEntity as Store).productSelections;
      if (productSelections && productSelections.length) {
        return {
          where: `id in (${(parentEntity as Store).productSelections
            ?.map(
              (productSelection: ProductSelectionSetting) =>
                `"${productSelection.productSelection.id}"`
            )
            .join(',')})`,
        };
      }
      return null;
    },
    childEntity: 'product-selection',
  },
  'store->channel': {
    parentEntitySelectorToQueryArgs: (parentEntity) => {
      const supplyChannels =
        (parentEntity as Store).supplyChannels?.map(
          (supplyChannel: ChannelReference) => `"${supplyChannel.id}"`
        ) || [];
      const distributionChannels =
        (parentEntity as Store).distributionChannels?.map(
          (distributionChannel: ChannelReference) =>
            `"${distributionChannel.id}"`
        ) || [];
      const allChannels = [...supplyChannels, ...distributionChannels];
      if (allChannels?.length) {
        return {
          where: `id in (${allChannels})`,
        };
      }
      return null;
    },
    childEntity: 'channel',
  },

  // Product Selection relationships - these are complex in commercetools
  'product-selection->product': {
    parentEntitySelectorToQueryArgs: (parentEntity) => ({
      id: parentEntity.id,
    }),
    childEntity: 'query-products-in-product-selection',
  },
  'product-selection->store': {
    parentEntitySelectorToQueryArgs: (productSelection) => ({
      where: `productSelections(productSelection(id="${productSelection.id}"))`,
    }),
    childEntity: 'store',
  },

  // Channel relationships
  'channel->store': {
    parentEntitySelectorToQueryArgs: (channel) => ({
      where: `supplyChannels(id="${
        (channel as Channel).id
      }") or distributionChannels(id="${(channel as Channel).id}")`,
    }),
    childEntity: 'store',
  },

  // Customer relationships
  'associate->business-unit': {
    parentEntitySelectorToQueryArgs: (customer) => ({
      where: `inheritedAssociates(customer(id="${
        (customer as Customer).id
      }")) or associates(customer(id="${(customer as Customer).id}"))`,
    }),
    childEntity: 'business-unit',
  },
  'associate->customer-group': {
    parentEntitySelectorToQueryArgs: (customer) => {
      const customerGroupID = (customer as Customer).customerGroup?.id;
      const customerGroupAssignmentIds =
        (customer as Customer).customerGroupAssignments?.map(
          (customerGroupAssignment: CustomerGroupAssignment) =>
            customerGroupAssignment.customerGroup?.id
        ) || [];
      const allCustomerGroupIds = [
        customerGroupID,
        ...customerGroupAssignmentIds,
      ]
        .filter((id) => id !== undefined)
        .map((id) => `"${id}"`)
        .join(',');
      if (allCustomerGroupIds?.length) {
        return {
          where: `id in (${allCustomerGroupIds})`,
        };
      }
      return null;
    },
    childEntity: 'customer-group',
  },

  // Product relationships
  'product->product-selection': {
    parentEntitySelectorToQueryArgs: (product) => ({
      id: (product as Product).id,
    }),
    childEntity: 'query-product-selections',
  },
  'product->standalone-price': {
    parentEntitySelectorToQueryArgs: (product) => {
      const skus = [
        (product as Product).masterData?.current?.masterVariant?.sku || '',
      ]
        .concat(
          (product as Product).masterData?.current?.variants?.map(
            (variant: any) => variant.sku || ''
          ) || []
        )
        .filter((sku) => sku !== '');
      if (skus?.length) {
        return {
          where: `sku in (${skus.map((sku: string) => `"${sku}"`).join(',')})`,
        };
      }
      return null;
    },
    childEntity: 'standalone-price',
  },

  // Standalone Price relationships
  'standalone-price->product': {
    parentEntitySelectorToQueryArgs: (standalonePrice) => ({
      where: `masterData(current(masterVariant(sku="${
        (standalonePrice as StandalonePrice).sku
      }"))) or masterData(current(variants(sku="${
        (standalonePrice as StandalonePrice).sku
      }")))`,
    }),
    childEntity: 'product',
  },
  'customer-group->customer': {
    parentEntitySelectorToQueryArgs: (customerGroup) => ({
      where: `customerGroup(id="${(customerGroup as CustomerGroup).id}")`,
    }),
    childEntity: 'customer',
  },
  'store->cart-discount': {
    parentEntitySelectorToQueryArgs: (store) => ({
      where: store?.key ? `stores(key="${(store as Store).key}")` : '',
    }),
    childEntity: 'cart-discount',
  },
  'store->customer': {
    parentEntitySelectorToQueryArgs: (store) => ({
      where: store?.key ? `stores(key="${(store as Store).key}")` : '',
    }),
    childEntity: 'customer',
  },
  'category->product': {
    parentEntitySelectorToQueryArgs: (category) => ({
      where: `masterData(current(categories(id="${category.id}")))`,
    }),
    childEntity: 'product',
  },
  'category->category': {
    parentEntitySelectorToQueryArgs: (category) => ({
      where: `parent(id="${category.id}")`,
    }),
    childEntity: 'category',
  },
  'product->category': {
    parentEntitySelectorToQueryArgs: (product) => {
      const categories = (product as Product).masterData?.current?.categories;
      if (categories && categories.length) {
        return {
          where: `id in (${categories
            .map((category: CategoryReference) => `"${category.id}"`)
            .join(',')})`,
        };
      }
      return null;
    },
    childEntity: 'category',
  },
  'customer->customer-group': {
    parentEntitySelectorToQueryArgs: (customer) => ({
      where: `customerGroupAssignments(customerGroup(id="${
        (customer as Customer).customerGroup?.id
      }")) or customerGroup(id="${(customer as Customer).customerGroup?.id}")`,
    }),
    childEntity: 'customer-group',
  },
};

export const convertToEntityType = (entity: QueryEntityType): EntityType => {
  switch (entity) {
    case 'query-product-selections':
      return 'product-selection';
    case 'query-products-in-product-selection':
      return 'product';
    default:
      return entity as EntityType;
  }
};

// Sortable fields mappings for root entities
export const ENTITY_SORTABLE_FIELDS: Record<EntityType, string[]> = {
  'business-unit': ['name', 'key', 'createdAt', 'lastModifiedAt'],
  associate: ['email', 'firstName', 'lastName', 'createdAt', 'lastModifiedAt'],
  customer: ['email', 'firstName', 'lastName', 'createdAt', 'lastModifiedAt'],
  store: ['key', 'createdAt', 'lastModifiedAt'],
  channel: ['key', 'createdAt', 'lastModifiedAt'],
  product: ['key', 'createdAt', 'lastModifiedAt'], // product name is in master data, complex to sort
  category: ['key', 'orderHint', 'createdAt', 'lastModifiedAt'],
  'product-selection': ['key', 'createdAt', 'lastModifiedAt'],
  'cart-discount': ['name', 'key', 'createdAt', 'lastModifiedAt'],
  'standalone-price': ['sku', 'key', 'createdAt', 'lastModifiedAt'],
  'customer-group': ['name', 'key', 'createdAt', 'lastModifiedAt'],
};

// Field display names for sorting UI
export const SORTABLE_FIELD_LABELS: Record<string, string> = {
  name: 'Name',
  key: 'Key',
  email: 'Email',
  firstName: 'First Name',
  lastName: 'Last Name',
  sku: 'SKU',
  orderHint: 'Order',
  createdAt: 'Created Date',
  lastModifiedAt: 'Modified Date',
};

export const SEARCH_FIELD_LABELS: Record<EntityType, string> = {
  'business-unit': 'Name',
  associate: 'Email',
  customer: 'Email',
  store: 'Name',
  channel: 'Name',
  product: 'SKU',
  category: 'Name',
  'product-selection': 'Key',
  'cart-discount': 'Name',
  'standalone-price': 'SKU',
  'customer-group': 'Name',
};

export type SortDirection = 'asc' | 'desc' | 'none';

export interface SortState {
  field: string;
  direction: SortDirection;
}

// Entity additional data queries - for displaying extra information on TreeMap nodes
export const ENTITY_DATA_QUERIES: Record<
  EntityType,
  (RelationshipQuery & {
    postTransform: (result: any) => string;
  })[]
> = {
  'customer-group': [
    {
      ...RELATIONSHIP_QUERIES['customer-group->customer'],
      postTransform: (result) => {
        const total = result?.total || 0;
        if (total > 0) {
          return `has ${total} customers`;
        }
        return '';
      },
    },
  ],
  'product-selection': [
    {
      ...RELATIONSHIP_QUERIES['product-selection->product'],
      postTransform: (result) => {
        const total = result?.total || 0;
        if (total > 0) {
          return `has ${result.results[0]?.productCount} products`;
        }
        return '';
      },
    },
    {
      ...RELATIONSHIP_QUERIES['product-selection->store'],
      postTransform: (result) => {
        const total = result?.total || 0;
        if (total > 0) {
          return `used in ${total} stores`;
        }
        return '';
      },
    },
  ],
  product: [
    {
      parentEntitySelectorToQueryArgs: (entity) => ({
        where: `id="${entity.id}"`,
      }),
      childEntity: 'product',
      postTransform: (result) => {
        if (result?.results?.[0]?.masterData?.current) {
          const variants = result.results[0].masterData.current.variants || [];
          const totalVariants = variants.length + 1; // +1 for master variant
          return `has ${totalVariants} variants`;
        }
        return '';
      },
    },
    {
      ...RELATIONSHIP_QUERIES['product->standalone-price'],
      postTransform: (result) => {
        const total = result?.total || 0;
        if (total > 0) {
          return `has ${total} standalone prices`;
        }
        return '';
      },
    },
    {
      ...RELATIONSHIP_QUERIES['product->category'],
      postTransform: (result) => {
        const total = result?.total || 0;
        if (total > 0) {
          return `has ${total} categories`;
        }
        return '';
      },
    },
  ],
  'business-unit': [
    {
      ...RELATIONSHIP_QUERIES['business-unit->associate'],
      postTransform: (result) => {
        if (result?.results?.[0]) {
          const businessUnit = result.results[0];
          const associateCount =
            (businessUnit.associates?.length || 0) +
            (businessUnit.inheritedAssociates?.length || 0);
          if (associateCount > 0) {
            return `has ${associateCount} associates`;
          }
          return '';
        }
        return '';
      },
    },
    {
      ...RELATIONSHIP_QUERIES['business-unit->store'],
      postTransform: (result) => {
        const total = result?.total || 0;
        if (total > 0) {
          return `used in ${total} stores`;
        }
        return '';
      },
    },
    {
      ...RELATIONSHIP_QUERIES['business-unit->business-unit'],
      postTransform: (result) => {
        const total = result?.total || 0;
        if (total > 0) {
          return `has ${total} divisions`;
        }
        return '';
      },
    },
  ],
  store: [
    {
      ...RELATIONSHIP_QUERIES['store->product-selection'],
      postTransform: (result) => {
        const total = result?.total || 0;
        if (total > 0 && result.results[0]?.productSelections) {
          return `${result.results[0]?.productSelections?.length} product selections`;
        }
        return '';
      },
    },
    {
      ...RELATIONSHIP_QUERIES['store->channel'],
      postTransform: (result) => {
        const total = result?.total || 0;
        if (total > 0) {
          return `used in ${total} channels`;
        }
        return '';
      },
    },
    {
      ...RELATIONSHIP_QUERIES['store->cart-discount'],
      postTransform: (result) => {
        const total = result?.total || 0;
        if (total > 0) {
          return `has ${total} cart discounts`;
        }
        return '';
      },
    },
    {
      ...RELATIONSHIP_QUERIES['store->customer'],
      postTransform: (result) => {
        const total = result?.total || 0;
        if (total > 0) {
          return `has ${total} customers`;
        }
        return '';
      },
    },
    {
      ...RELATIONSHIP_QUERIES['store->category'],
      postTransform: (result) => {
        const total = result?.total || 0;
        if (total > 0) {
          return `has ${total} categories`;
        }
        return '';
      },
    },
  ],
  channel: [
    {
      ...RELATIONSHIP_QUERIES['channel->store'],
      postTransform: (result) => {
        const total = result?.total || 0;
        if (total > 0) {
          return `used in ${total} stores`;
        }
        return '';
      },
    },
  ],
  category: [
    {
      ...RELATIONSHIP_QUERIES['category->product'],
      postTransform: (result) => {
        const total = result?.total || 0;
        if (total > 0) {
          return `has ${total} products`;
        }
        return '';
      },
    },
    {
      ...RELATIONSHIP_QUERIES['category->category'],
      postTransform: (result) => {
        const total = result?.total || 0;
        if (total > 0) {
          return `has ${total} subcategories`;
        }
        return '';
      },
    },
  ],
  'cart-discount': [
    {
      ...RELATIONSHIP_QUERIES['cart-discount->store'],
      postTransform: (result) => {
        if (result?.results?.[0]) {
          const cartDiscount = result.results[0];
          const storeCount = cartDiscount.stores?.length || 0;
          if (storeCount > 0) {
            return `${storeCount} stores`;
          }
          return '';
        }
        return '';
      },
    },
  ],
  associate: [
    {
      ...RELATIONSHIP_QUERIES['associate->business-unit'],
      postTransform: (result) => {
        const total = result?.total || 0;
        if (total > 0) {
          return `belongs to ${total} business units`;
        }
        return '';
      },
    },
  ],
  customer: [
    {
      ...RELATIONSHIP_QUERIES['customer->customer-group'],
      postTransform: (result) => {
        const total = result?.total || 0;
        if (total > 0) {
          return `belongs to ${total} customer groups`;
        }
        return '';
      },
    },
  ],
  'standalone-price': [
    {
      parentEntitySelectorToQueryArgs: (entity) => ({
        where: `id="${entity.id}"`,
      }),
      childEntity: 'standalone-price',
      postTransform: (result) => {
        if (result?.results?.[0]) {
          const standalonePrice = result.results[0];
          if (standalonePrice.discounted?.value) {
            return `discounted to ${
              standalonePrice.discounted.value.centAmount / 100
            }`;
          }
          return '';
        }
        return '';
      },
    },
  ],
};

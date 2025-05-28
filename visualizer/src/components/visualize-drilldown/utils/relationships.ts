import { EntityRelationship } from '../types';

export const relationships: EntityRelationship[] = [
  {
    root: 'business-unit',
    children: ['store', 'associate', 'business-unit'],
  },
  {
    root: 'store',
    children: [
      'business-unit',
      'product-selection',
      'channel',
      'cart-discount',
      'customer',
    ],
  },
  {
    root: 'customer-group',
    children: ['customer'],
  },
  {
    root: 'product-selection',
    children: ['product', 'store'],
  },
  {
    root: 'channel',
    children: ['store'],
  },
  {
    root: 'associate',
    children: ['business-unit'],
  },
  {
    root: 'product',
    children: ['product-selection', 'standalone-price', 'category'],
  },
  {
    root: 'standalone-price',
    children: ['product'],
  },
  {
    root: 'category',
    children: ['product', 'category'],
  },
];

export default relationships;

export type Fields =
  | 'Boolean'
  | 'Date'
  | 'Enum'
  | 'Money'
  | 'Number'
  | 'Reference'
  | 'Set'
  | 'String';

export const FIELD_TYPES: { [key in Fields]: string } = {
  Boolean: 'Boolean',
  Date: 'Date/Time',
  Enum: 'Enum',
  Money: 'Money',
  Number: 'Number',
  Reference: 'Reference',
  Set: 'Set',
  String: 'String',
};

export const REFERENCE_TYPES = [
  'approval-flow',
  'associate-role',
  'business-unit',
  'cart',
  'category',
  'channel',
  'customer',
  'key-value-document',
  'order',
  'product',
  'product-type',
  'review',
  'state',
  'shipping-method',
  'zone',
];

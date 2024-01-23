export const FIELD_TYPES: { [name: string]: string } = {
  Boolean: 'Boolean',
  Date: 'Date',
  DateTime: 'DateTime',
  Enum: 'Enum',
  LocalizedEnum: 'LocalizedEnum',
  LocalizedString: 'LocalizedString',
  Money: 'Money',
  Number: 'Number',
  Reference: 'Reference',
  Set: 'Set',
  String: 'String',
  Time: 'Time',
};

export const INPUT_HINTS = {
  SingleLine: 'SingleLine',
  MultiLine: 'MultiLine',
};
export const REFERENCE_BY = {
  Key: 'key',
  Id: 'id',
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

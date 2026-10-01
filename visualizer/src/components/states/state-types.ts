// `StateTypeEnum` — the resource types a State can be assigned to:
// https://docs.commercetools.com/api/projects/states#statetypeenum
export const STATE_TYPES = [
  'LineItemState',
  'OrderState',
  'PaymentState',
  'ProductState',
  'QuoteRequestState',
  'QuoteState',
  'RecurringOrderState',
  'ReviewState',
  'StagedQuoteState',
] as const;

export const STATE_TYPE_LABELS: Record<(typeof STATE_TYPES)[number], string> = {
  LineItemState: 'Line Item State',
  OrderState: 'Order State',
  PaymentState: 'Payment State',
  ProductState: 'Product State',
  QuoteRequestState: 'Quote Request State',
  QuoteState: 'Quote State',
  RecurringOrderState: 'Recurring Order State',
  ReviewState: 'Review State',
  StagedQuoteState: 'Staged Quote State',
};

// `StateRoleEnum`: https://docs.commercetools.com/api/projects/states#stateroleenum
// A role only applies to one state type:
// - `Return` is used by Orders' transitionLineItemState, for LineItemState
// - `ReviewIncludedInStatistics` counts a Review's rating, for ReviewState
export const STATE_ROLES = ['Return', 'ReviewIncludedInStatistics'] as const;

export const STATE_ROLES_BY_TYPE: Record<string, ReadonlyArray<string>> = {
  LineItemState: ['Return'],
  ReviewState: ['ReviewIncludedInStatistics'],
};

export const allowedRoles = (stateType: string): ReadonlyArray<string> =>
  STATE_ROLES_BY_TYPE[stateType] ?? [];

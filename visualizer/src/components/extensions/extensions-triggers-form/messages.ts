import { defineMessages } from 'react-intl';

export default defineMessages({
  messagesLabel: {
    id: 'ExtensionsTriggersForm.messagesLabel',
    description: 'messageLabel',
    defaultMessage: 'Choose Messages you want to listen to.',
  },
  columnCondition: {
    id: 'ExtensionsTriggersForm.columnCondition',
    description: 'columnCondition',
    defaultMessage: 'Condition',
  },
  conditionHint: {
    id: 'ExtensionsTriggersForm.conditionHint',
    description: 'Explains the optional trigger condition',
    defaultMessage:
      'Optional predicate that must be true for the extension to be called, for example "customerId is defined". Use "is defined" for optional fields: a condition that cannot be evaluated makes the whole API call fail.',
  },
  multipleTriggers: {
    id: 'ExtensionsTriggersForm.multipleTriggers',
    description: 'Shown for a resource type with several triggers',
    defaultMessage:
      '{count} triggers with their own conditions exist for this resource type. They are kept as they are and can only be changed through the API.',
  },
  columnResourceType: {
    id: 'ExtensionsTriggersForm.columnResourceType',
    description: 'columnResourceType',
    defaultMessage: 'Resource type',
  },
  cart: {
    id: 'ExtensionsTriggersForm.cart',
    description: 'cart',
    defaultMessage: 'Extension triggered for operations on Carts.',
  },

  order: {
    id: 'ExtensionsTriggersForm.order',
    description: 'order',
    defaultMessage: 'Extension triggered for operations on Orders.',
  },

  payment: {
    id: 'ExtensionsTriggersForm.payment',
    description: 'payment',
    defaultMessage: 'Extension triggered for operations on Payments.',
  },

  customer: {
    id: 'ExtensionsTriggersForm.customer',
    description: 'customer',
    defaultMessage: 'Extension triggered for operations on Customers.',
  },

  'quote-request': {
    id: 'ExtensionsTriggersForm.quote-request',
    description: 'quote-request',
    defaultMessage: 'Extension triggered for operations on QuoteRequests.',
  },

  'staged-quote': {
    id: 'ExtensionsTriggersForm.staged-quote',
    description: 'staged-quote',
    defaultMessage: 'Extension triggered for operations on StagedQuotes.',
  },

  quote: {
    id: 'ExtensionsTriggersForm.quote',
    description: 'quote',
    defaultMessage: 'Extension triggered for operations on Quotes.',
  },

  'business-unit': {
    id: 'ExtensionsTriggersForm.business-unit',
    description: 'business-unit',
    defaultMessage: 'Extension triggered for operations on BusinessUnits.',
  },
  triggerActionCreate: {
    id: 'triggerActionCreate',
    description: 'triggerActionCreate',
    defaultMessage: 'Create',
  },
  triggerActionUpdate: {
    id: 'triggerActionUpdate',
    description: 'triggerActionUpdate',
    defaultMessage: 'Update',
  },

  'payment-method': {
    id: 'ExtensionsTriggersForm.payment-method',
    description: 'payment-method',
    defaultMessage: 'Extension triggered for operations on PaymentMethods.',
  },

  'customer-group': {
    id: 'ExtensionsTriggersForm.customer-group',
    description: 'customer-group',
    defaultMessage: 'Extension triggered for operations on CustomerGroups.',
  },

  'shopping-list': {
    id: 'ExtensionsTriggersForm.shopping-list',
    description: 'shopping-list',
    defaultMessage: 'Extension triggered for operations on ShoppingLists.',
  },

  product: {
    id: 'ExtensionsTriggersForm.product',
    description: 'product',
    defaultMessage: 'Extension triggered for operations on Products.',
  },
});

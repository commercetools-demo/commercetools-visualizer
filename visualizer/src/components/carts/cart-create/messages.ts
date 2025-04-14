import { defineMessages } from 'react-intl';

export default defineMessages({
  title: {
    id: 'CreateCart.title',
    description: 'The page title of create cart',
    defaultMessage: 'Create a cart',
  },
  backButton: {
    id: 'CreateCart.button.back',
    description: 'Label for back button',
    defaultMessage: 'To cart list',
  },
  createSuccess: {
    id: 'CreateCart.form.message.success',
    description: 'Success message for create cart',
    defaultMessage: 'Your cart has been created.',
  },
  createError: {
    id: 'CreateCart.message.create.error',
    description: 'Error message for creating cart',
    defaultMessage: 'Something went wrong. The cart was not created. {message}',
  },
  stepCurrency: {
    id: 'CreateCart.message.create.step.currency',
    defaultMessage: 'Set currency',
  },
  stepCustomer: {
    id: 'CreateCart.message.create.step.customer',
    defaultMessage: 'Customer',
  },
  stepAddress: {
    id: 'CreateCart.message.create.step.address',
    defaultMessage: 'Address',
  },
  stepItems: {
    id: 'CreateCart.message.create.step.items',
    defaultMessage: 'Items',
  },
  stepShipping: {
    id: 'CreateCart.message.create.step.shipping',
    defaultMessage: 'Shipping',
  },
});

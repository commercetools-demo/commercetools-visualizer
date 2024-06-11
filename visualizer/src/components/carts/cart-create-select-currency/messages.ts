import { defineMessages } from 'react-intl';

export default defineMessages({
  currencyTitle: {
    id: 'cart.form.currency.title',
    description: 'Title for currency field',
    defaultMessage: 'Currency',
  },
  countryTitle: {
    id: 'cart.form.country.title',
    description: 'Title for country field',
    defaultMessage: 'Country',
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
});

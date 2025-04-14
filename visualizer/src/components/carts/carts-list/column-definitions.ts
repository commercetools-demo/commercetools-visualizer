import { TColumn } from '@commercetools-uikit/data-table';
import memoize from 'memoize-one';

export const createVisibleColumnDefinitions = memoize(
  (): Array<TColumn> => [
    { key: 'customerEmail', label: 'Customer Email' },
    { key: 'amountOfLineitems', label: 'Amount of Lineitems' },
    { key: 'cartState', label: 'Cart State' },
    {
      key: 'billingAddress',
      label: 'Billing address',
    },
    { key: 'totalPrice', label: 'Total price' },
  ]
);

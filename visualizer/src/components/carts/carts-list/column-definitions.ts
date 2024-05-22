import { TColumn } from '@commercetools-uikit/data-table';
import memoize from 'memoize-one';
import messages from './messages';

export const createVisibleColumnDefinitions = memoize(
  (): Array<TColumn> => [
    { key: 'customerEmail', label: 'customerEmail' },
    { key: 'anonymousId', label: 'anonymousId' },
    { key: 'amountOfLineitems', label: 'Amount of Lineitems' },
  ]
);

export const createHiddenColumnDefinitions = memoize(
  (formatMessage): Array<TColumn> => [
    { key: 'id', label: formatMessage(messages.columnId) },
    { key: 'customerId', label: 'customerId' },
    {
      key: 'key',
      label: formatMessage(messages.columnTypeKey),
      isSortable: true,
    },
    { key: 'version', label: 'Version' },
    {
      key: 'createdAt',
      label: formatMessage(messages.columnCreatedAt),
      isSortable: true,
    },
    {
      key: 'lastModifiedAt',
      label: formatMessage(messages.columnLastModifiedAt),
      isSortable: true,
    },
    {
      key: 'shippingMode',
      label: 'shippingMode',
      isSortable: true,
    },
  ]
);

import { TColumn } from '@commercetools-uikit/data-table';
import memoize from 'memoize-one';
import messages from './messages';

export default memoize(
  (formatMessage): Array<TColumn> => [
    {
      key: 'key',
      label: formatMessage(messages.columnTypeKey),
      isSortable: true,
    },
    {
      key: 'destination',
      label: formatMessage(messages.columnTypeDestination),
      isSortable: true,
    },
    {
      key: 'triggers',
      label: formatMessage(messages.columnTypeTriggers),
      isSortable: true,
    },
    {
      key: 'timeoutInMs',
      label: formatMessage(messages.columnTypeTimeoutInMs),
      isSortable: true,
    },
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
  ]
);

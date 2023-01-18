import { TColumn } from '@commercetools-uikit/data-table';
import memoize from 'memoize-one';
import messages from './messages';

export default memoize(
  (formatMessage): Array<TColumn> => [
    {
      key: 'name',
      label: formatMessage(messages.columnTypeName),
      isSortable: true,
    },
    {
      key: 'description',
      label: formatMessage(messages.columnTypeDescription),
      isSortable: true,
      width: 'minmax(150px, auto)',
    },
    {
      key: 'key',
      label: formatMessage(messages.columnTypeKey),
      isSortable: true,
    },
    {
      key: 'resourceTypeIds',
      label: formatMessage(messages.columnResourceTypeIds),
    },
    {
      key: 'fieldCount',
      label: formatMessage(messages.columnFieldCount),
      align: 'center',
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

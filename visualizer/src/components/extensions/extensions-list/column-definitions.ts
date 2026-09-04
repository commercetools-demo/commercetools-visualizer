import type { DataTableColumnItem } from '@commercetools/nimbus';
import type { IntlShape } from 'react-intl';
import { formatDateAndTime } from 'commercetools-demo-shared-helpers';
import { TExtension } from '../../../types/generated/ctp';
import messages from './messages';

const createColumnDefinitions = (
  intl: IntlShape
): Array<DataTableColumnItem<TExtension>> => [
  {
    id: 'key',
    header: intl.formatMessage(messages.columnTypeKey),
    isSortable: true,
    isRowHeader: true,
    accessor: (row) => row.key,
  },
  {
    id: 'destination',
    header: intl.formatMessage(messages.columnTypeDestination),
    isSortable: true,
    accessor: (row) => row.destination.type,
  },
  {
    id: 'triggers',
    header: intl.formatMessage(messages.columnTypeTriggers),
    isSortable: true,
    accessor: (row) =>
      row.triggers.map((value) => value.resourceTypeId).join(', '),
  },
  {
    id: 'timeoutInMs',
    header: intl.formatMessage(messages.columnTypeTimeoutInMs),
    isSortable: true,
    accessor: (row) => row.timeoutInMs,
  },
  {
    id: 'createdAt',
    header: intl.formatMessage(messages.columnCreatedAt),
    isSortable: true,
    accessor: (row) => formatDateAndTime(row.createdAt, intl),
  },
  {
    id: 'lastModifiedAt',
    header: intl.formatMessage(messages.columnLastModifiedAt),
    isSortable: true,
    accessor: (row) => formatDateAndTime(row.lastModifiedAt, intl),
  },
];

export default createColumnDefinitions;

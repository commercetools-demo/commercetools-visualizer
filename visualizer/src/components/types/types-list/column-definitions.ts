import type { DataTableColumnItem } from '@commercetools/nimbus';
import type { IntlShape } from 'react-intl';
import { formatLocalizedString } from '../../../utils/format-localized-string';
import { TTypeDefinition } from '../../../types/generated/ctp';
import messages from './messages';

type TCreateColumnDefinitions = {
  intl: IntlShape;
  dataLocale: string;
  projectLanguages: string[];
};

const createColumnDefinitions = ({
  intl,
  dataLocale,
  projectLanguages,
}: TCreateColumnDefinitions): Array<DataTableColumnItem<TTypeDefinition>> => [
  {
    id: 'name',
    header: intl.formatMessage(messages.columnTypeName),
    isSortable: true,
    accessor: (row) =>
      formatLocalizedString(row.nameAllLocales, dataLocale, projectLanguages),
  },
  {
    id: 'description',
    header: intl.formatMessage(messages.columnTypeDescription),
    isSortable: true,
    accessor: (row) =>
      formatLocalizedString(
        row.descriptionAllLocales,
        dataLocale,
        projectLanguages
      ),
  },
  {
    id: 'key',
    header: intl.formatMessage(messages.columnTypeKey),
    isSortable: true,
    isRowHeader: true,
    accessor: (row) => row.key,
  },
  {
    id: 'resourceTypeIds',
    header: intl.formatMessage(messages.columnResourceTypeIds),
    accessor: (row) => row.resourceTypeIds.join(', '),
  },
  {
    id: 'fieldCount',
    header: intl.formatMessage(messages.columnFieldCount),
    accessor: (row) => row.fieldDefinitions.length,
  },
  {
    id: 'createdAt',
    header: intl.formatMessage(messages.columnCreatedAt),
    isSortable: true,
    accessor: (row) =>
      `${intl.formatDate(row.createdAt)} ${intl.formatTime(row.createdAt)}`,
  },
  {
    id: 'lastModifiedAt',
    header: intl.formatMessage(messages.columnLastModifiedAt),
    isSortable: true,
    accessor: (row) =>
      `${intl.formatDate(row.lastModifiedAt)} ${intl.formatTime(
        row.lastModifiedAt
      )}`,
  },
];

export default createColumnDefinitions;

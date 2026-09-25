import type { DataTableColumnItem } from '@commercetools/nimbus';
import type { IntlShape } from 'react-intl';
import { TCommercetoolsSubscription } from '../../../types/generated/ctp';
import destinationMessages from '../subscription-destination-type-form/messages';
import messages from './messages';

type TCreateColumnDefinitions = {
  intl: IntlShape;
};

const createColumnDefinitions = ({
  intl,
}: TCreateColumnDefinitions): Array<
  DataTableColumnItem<TCommercetoolsSubscription>
> => [
  {
    id: 'key',
    header: intl.formatMessage(messages.columnKey),
    isSortable: true,
    isRowHeader: true,
    accessor: (row) => row.key,
  },
  {
    id: 'version',
    header: intl.formatMessage(messages.columnVersion),
    accessor: (row) => row.version,
  },
  {
    id: 'createdAt',
    header: intl.formatMessage(messages.columnCreatedAt),
    accessor: (row) =>
      `${intl.formatDate(row.createdAt)} ${intl.formatTime(row.createdAt)}`,
  },
  {
    id: 'destinationType',
    header: intl.formatMessage(messages.columnDestinationType),
    accessor: (row) => {
      try {
        return intl.formatMessage(
          destinationMessages[
            ('destination' +
              row.destination.type) as keyof typeof destinationMessages
          ]
        );
      } catch {
        return row.destination.type;
      }
    },
  },
];

export default createColumnDefinitions;

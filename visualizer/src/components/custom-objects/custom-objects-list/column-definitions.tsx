import { Box, type DataTableColumnItem } from '@commercetools/nimbus';
import { Check, Close } from '@commercetools/nimbus-icons';
import type { IntlShape } from 'react-intl';
import { TCustomObject } from '../../../types/generated/ctp';
import messages from './messages';

type TCreateColumnDefinitions = {
  intl: IntlShape;
};

const BooleanCell = ({ value }: { value: boolean }) =>
  value ? (
    <Box color="primary.9" aria-label="yes">
      <Check />
    </Box>
  ) : (
    <Box color="neutral.9" aria-label="no">
      <Close />
    </Box>
  );

const createColumnDefinitions = ({
  intl,
}: TCreateColumnDefinitions): Array<DataTableColumnItem<TCustomObject>> => [
  {
    id: 'container',
    header: intl.formatMessage(messages.columnContainer),
    isRowHeader: true,
    accessor: (row) => row.container,
  },
  {
    id: 'key',
    header: intl.formatMessage(messages.columnKey),
    isSortable: true,
    accessor: (row) => row.key,
  },
  {
    id: 'value',
    header: intl.formatMessage(messages.columnHasValue),
    accessor: (row) => <BooleanCell value={Boolean(row.value)} />,
  },
];

export default createColumnDefinitions;

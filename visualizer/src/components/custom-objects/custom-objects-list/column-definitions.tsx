import { Box, type DataTableColumnItem } from '@commercetools/nimbus';
import { Check, Close } from '@commercetools/nimbus-icons';
import type { IntlShape } from 'react-intl';
import { TCustomObject } from '../../../types/generated/ctp';
import messages from './messages';

type TCreateColumnDefinitions = {
  intl: IntlShape;
};

const BooleanCell = ({ value, intl }: { value: boolean; intl: IntlShape }) =>
  value ? (
    <Box color="primary.9" aria-label={intl.formatMessage(messages.booleanYes)}>
      <Check />
    </Box>
  ) : (
    <Box color="neutral.9" aria-label={intl.formatMessage(messages.booleanNo)}>
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
    accessor: (row) => <BooleanCell value={Boolean(row.value)} intl={intl} />,
  },
];

export default createColumnDefinitions;

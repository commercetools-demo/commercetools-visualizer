import memoize from 'memoize-one';
import messages from './messages';

export default memoize((formatMessage) => [
  {
    key: 'name',
    label: formatMessage(messages.columnFieldName),
    isSortable: false,
  },
  {
    key: 'label',
    label: formatMessage(messages.columnFieldLabel),
    isSortable: false,
    width: 'minmax(150px, auto)',
  },
  {
    key: 'required',
    label: formatMessage(messages.columnFieldRequired),
    flexGrow: 1,
    isSortable: false,
  },
  {
    key: 'type',
    label: formatMessage(messages.columnFieldType),
    flexGrow: 1,
    isSortable: false,
  },
  {
    key: 'set',
    label: formatMessage(messages.columnFieldSet),
    flexGrow: 1,
    isSortable: false,
  },
  {
    key: 'delete',
    label: '',
    flexGrow: 1,
    isSortable: false,
  },
]);

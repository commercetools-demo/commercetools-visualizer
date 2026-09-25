import { defineMessages } from 'react-intl';

export default defineMessages<string>({
  title: {
    id: 'CustomObjects.title',
    defaultMessage: 'Custom Objects',
  },
  customObjectUpdated: {
    id: 'CustomObjects.customObjectUpdated',
    defaultMessage: 'Custom Object {customObjectKey} updated',
  },
  customObjectAdd: {
    id: 'CustomObjects.customObjectAdd',
    defaultMessage: 'Add new Custom Object',
  },
  noResults: {
    id: 'CustomObjects.noResults',
    defaultMessage: 'There are no custom objects available for this container.',
  },
  containerFilterLabel: {
    id: 'CustomObjects.containerFilterLabel',
    defaultMessage: 'Container Name',
  },
  containerFilterPlaceholder: {
    id: 'CustomObjects.containerFilterPlaceholder',
    defaultMessage: 'Container Name',
  },
  columnContainer: {
    id: 'CustomObjects.ListView.column.container',
    description: 'Title of the table column (container)',
    defaultMessage: 'Container',
  },
  columnKey: {
    id: 'CustomObjects.ListView.column.key',
    description: 'Title of the table column (key)',
    defaultMessage: 'Key',
  },
  columnHasValue: {
    id: 'CustomObjects.ListView.column.hasValue',
    description: 'Title of the table column (has value)',
    defaultMessage: 'Has Value',
  },
  booleanYes: {
    id: 'CustomObjects.booleanYes',
    description: 'Accessible label for a true boolean cell',
    defaultMessage: 'yes',
  },
  booleanNo: {
    id: 'CustomObjects.booleanNo',
    description: 'Accessible label for a false boolean cell',
    defaultMessage: 'no',
  },
});

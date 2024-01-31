import { defineMessages } from 'react-intl';

export default defineMessages({
  title: {
    id: 'Extensions.title',
    defaultMessage: 'Extensions list',
  },
  noResults: {
    id: 'Extensions.noResults',
    defaultMessage: 'There are no extensions available in this project.',
  },
  addType: {
    id: 'Extensions.addType',
    description: 'add extension button label',
    defaultMessage: 'Add New Extension',
  },
  columnTypeDestination: {
    id: 'Extensions.ListView.column.destination',
    description: 'Title of the table column (destination)',
    defaultMessage: 'Destination',
  },
  columnTypeTriggers: {
    id: 'Extensions.ListView.column.triggers',
    description: 'Title of the table column (triggers)',
    defaultMessage: 'Triggers',
  },
  columnTypeTimeoutInMs: {
    id: 'Extensions.ListView.column.timeoutInMs',
    description: 'Title of the table column (timeoutInMs)',
    defaultMessage: 'Timeout in ms',
  },
  columnTypeKey: {
    id: 'Extensions.ListView.column.key',
    description: 'Title of the table column (key)',
    defaultMessage: 'Key',
  },
  columnCreatedAt: {
    id: 'Extensions.ListView.column.columnCreatedAt',
    description: 'Title of the table column (createdAt)',
    defaultMessage: 'Created on',
  },
  columnLastModifiedAt: {
    id: 'Extensions.ListView.column.columnLastModifiedAt',
    description: 'Title of the table column (lastModifiedAt)',
    defaultMessage: 'Modified on',
  },
});

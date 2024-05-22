import { defineMessages } from 'react-intl';

export default defineMessages<string>({
  noResults: {
    id: 'Cart.noResults',
    defaultMessage: 'There are no carts matching your search.',
  },
  title: {
    id: 'Cart.title',
    defaultMessage: 'Cart',
  },
  columnTypeKey: {
    id: 'Cart.ListView.column.key',
    description: 'Title of the table column (key)',
    defaultMessage: 'Key',
  },
  columnCreatedAt: {
    id: 'Cart.ListView.column.columnCreatedAt',
    description: 'Title of the table column (createdAt)',
    defaultMessage: 'Created on',
  },
  columnLastModifiedAt: {
    id: 'Cart.ListView.column.columnLastModifiedAt',
    description: 'Title of the table column (lastModifiedAt)',
    defaultMessage: 'Modified on',
  },
  columnId: {
    id: 'Cart.ListView.column.columnId',
    description: 'Title of the table column (ID)',
    defaultMessage: 'Id',
  },
  addCart: {
    id: 'Cart.addType',
    description: 'add cart button label',
    defaultMessage: 'Add New Cart',
  },
});

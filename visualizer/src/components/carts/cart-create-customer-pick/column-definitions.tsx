import { FormattedMessage } from 'react-intl';
import messages from './messages';
import { TColumn } from '@commercetools-uikit/data-table';

const defaultSortable = false;

export const columnDefinitions: Array<TColumn> = [
  {
    key: 'customerNumber',
    label: <FormattedMessage {...messages.columnCustomerNumber} />,
    isSortable: defaultSortable,
  },
  {
    key: 'externalId',
    label: <FormattedMessage {...messages.columnExternalId} />,
    isSortable: defaultSortable,
  },
  {
    key: 'firstName',
    label: <FormattedMessage {...messages.columnFirstName} />,
    isSortable: defaultSortable,
  },
  {
    key: 'lastName',
    label: <FormattedMessage {...messages.columnLastName} />,
    isSortable: defaultSortable,
  },
  {
    key: 'companyName',
    label: <FormattedMessage {...messages.columnCompanyName} />,
    isSortable: defaultSortable,
  },
  {
    key: 'email',
    label: <FormattedMessage {...messages.columnEmail} />,
    isSortable: defaultSortable,
  },
  {
    key: 'customerGroup',
    label: <FormattedMessage {...messages.columnCustomerGroup} />,
  },
];

export const hiddenColumnsDefinition: Array<TColumn> = [
  {
    key: 'middleName',
    label: <FormattedMessage {...messages.columnMiddleName} />,
    isSortable: defaultSortable,
  },
  {
    key: 'vatId',
    label: <FormattedMessage {...messages.columnVatId} />,
    isSortable: defaultSortable,
  },
  {
    key: 'dateOfBirth',
    label: <FormattedMessage {...messages.columnDateOfBirth} />,
  },
  {
    key: 'stores',
    label: <FormattedMessage {...messages.columnStores} />,
  },
  {
    key: 'createdAt',
    label: <FormattedMessage {...messages.columnCreatedAt} />,
    width: 'max-content',
    isSortable: defaultSortable,
  },
  {
    key: 'lastModifiedAt',
    label: <FormattedMessage {...messages.columnLastModifiedAt} />,
    width: 'max-content',
    isSortable: defaultSortable,
  },
];

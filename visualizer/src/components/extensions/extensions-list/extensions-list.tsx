import { useIntl } from 'react-intl';
import { Link, Switch, useHistory, useRouteMatch } from 'react-router-dom';
import {
  useDataTableSortingState,
  usePaginationState,
} from '@commercetools-uikit/hooks';
import { useState } from 'react';
import createColumnDefinitions from './column-definitions';
import { ContentNotification } from '@commercetools-uikit/notifications';
import Text from '@commercetools-uikit/text';
import { getErrorMessage } from '../../../helpers';
import Spacings from '@commercetools-uikit/spacings';
import LoadingSpinner from '@commercetools-uikit/loading-spinner';
import {
  InfoMainPage,
  PageNotFound,
} from '@commercetools-frontend/application-components';
import { useExtensionsFetcher } from '../../../hooks/use-extensions-connector';
import { TExtension, TQuery } from '../../../types/generated/ctp';
import DataTable, { TColumn } from '@commercetools-uikit/data-table';
import DataTableManager, {
  UPDATE_ACTIONS,
} from '@commercetools-uikit/data-table-manager';
import messages from './messages';
import SecondaryButton from '@commercetools-uikit/secondary-button';
import { PlusBoldIcon } from '@commercetools-uikit/icons';
import { Pagination } from '@commercetools-uikit/pagination';
import ExtensionsCreate from '../extensions-create/extensions-create';
import { SuspendedRoute } from '@commercetools-frontend/application-shell';
import ExtensionsEdit from '../extensions-edit/extensions-edit';

const ExtensionsList = () => {
  const intl = useIntl();
  const { push } = useHistory();
  const match = useRouteMatch();
  const { page, perPage } = usePaginationState();
  const tableSorting = useDataTableSortingState({ key: 'key', order: 'asc' });

  const { extensions, error, loading, refetch } = useExtensionsFetcher({
    limit: perPage.value,
    offset: (page.value - 1) * perPage.value,
    sort: [`${tableSorting.value.key} ${tableSorting.value.order}`],
  });

  const [tableData, setTableData] = useState({
    columns: createColumnDefinitions(intl.formatMessage),
    visibleColumns: createColumnDefinitions(intl.formatMessage),
    visibleColumnKeys: createColumnDefinitions(intl.formatMessage).map(
      (column) => column.key
    ),
  });

  const [isCondensed, setIsCondensed] = useState<boolean>(true);
  const [isWrappingText, setIsWrappingText] = useState<boolean>(false);

  if (error) {
    return (
      <ContentNotification type="error">
        <Text.Body>{getErrorMessage(error)}</Text.Body>
      </ContentNotification>
    );
  }

  if (loading) {
    return (
      <Spacings.Stack alignItems="center">
        <LoadingSpinner />
      </Spacings.Stack>
    );
  }

  if (!extensions || !extensions.results) {
    return <PageNotFound />;
  }

  const { results, total } = extensions;

  const itemRenderer = (item: TExtension, column: TColumn<TExtension>) => {
    switch (column.key) {
      case 'key':
        return item.key || '';
      case 'destination':
        return item.destination.type;
      case 'timeoutInMs':
        return item.timeoutInMs || 0;
      case 'triggers':
        return item.triggers.map((value) => value.resourceTypeId).join(', ');
      case 'createdAt':
        return `${intl.formatDate(item.createdAt)} ${intl.formatTime(
          item.createdAt
        )}`;
      case 'lastModifiedAt':
        return `${intl.formatDate(item.lastModifiedAt)} ${intl.formatTime(
          item.lastModifiedAt
        )}`;
      default:
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return (item as any)[column.key];
    }
  };

  const columnManager = {
    disableColumnManager: false,
    hideableColumns: tableData.columns,
    visibleColumnKeys: tableData.visibleColumnKeys,
  };
  const onSettingChange = (action: string, nextValue: boolean | string[]) => {
    const {
      COLUMNS_UPDATE,
      IS_TABLE_CONDENSED_UPDATE,
      IS_TABLE_WRAPPING_TEXT_UPDATE,
    } = UPDATE_ACTIONS;

    switch (action) {
      case IS_TABLE_CONDENSED_UPDATE: {
        setIsCondensed(nextValue as boolean);
        break;
      }
      case IS_TABLE_WRAPPING_TEXT_UPDATE: {
        setIsWrappingText(nextValue as boolean);
        break;
      }
      case COLUMNS_UPDATE: {
        if (Array.isArray(nextValue)) {
          Array.isArray(nextValue) &&
            setTableData({
              ...tableData,
              visibleColumns: tableData.columns.filter((column) =>
                nextValue.includes(column.key)
              ),
              visibleColumnKeys: nextValue,
            });
        }
        break;
      }
    }
  };
  return (
    <InfoMainPage
      customTitleRow={
        <Spacings.Inline justifyContent="space-between">
          <Text.Headline as="h2" intlMessage={messages.title} />
          <SecondaryButton
            as={Link}
            to={`${match.url}/new`}
            iconLeft={<PlusBoldIcon />}
            label={intl.formatMessage(messages.addType)}
          />
        </Spacings.Inline>
      }
    >
      {total === 0 && <div>{intl.formatMessage(messages.noResults)}</div>}

      {total > 0 ? (
        <Spacings.Stack scale="l">
          <DataTableManager
            columns={tableData.visibleColumns}
            columnManager={columnManager}
            onSettingsChange={onSettingChange}
            displaySettings={{
              isWrappingText,
              isCondensed,
              disableDisplaySettings: false,
            }}
          >
            <DataTable<NonNullable<TQuery['extensions']['results']>[0]>
              isCondensed
              columns={tableData.visibleColumns}
              rows={results}
              itemRenderer={itemRenderer}
              sortedBy={tableSorting.value.key}
              sortDirection={tableSorting.value.order}
              onSortChange={tableSorting.onChange}
              onRowClick={(row) => push(`${match.url}/${row.id}`)}
            />
          </DataTableManager>
          <Pagination
            page={page.value}
            onPageChange={page.onChange}
            perPage={perPage.value}
            onPerPageChange={perPage.onChange}
            totalItems={total}
          />
        </Spacings.Stack>
      ) : null}
      <Switch>
        <SuspendedRoute path={`${match.path}/new`}>
          <ExtensionsCreate
            onClose={() => {
              refetch();
              push(`${match.url}`);
            }}
          />
        </SuspendedRoute>
        <SuspendedRoute path={`${match.path}/:id`}>
          <ExtensionsEdit
            onClose={() => {
              refetch();
              push(`${match.url}`);
            }}
          />
        </SuspendedRoute>
      </Switch>
    </InfoMainPage>
  );
};

export default ExtensionsList;

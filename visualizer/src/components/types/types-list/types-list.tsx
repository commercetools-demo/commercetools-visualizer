import { FC, lazy, useState } from 'react';
import { useIntl } from 'react-intl';
import { Link, Switch, useHistory, useRouteMatch } from 'react-router-dom';
import { NO_VALUE_FALLBACK } from '@commercetools-frontend/constants';
import {
  usePaginationState,
  useDataTableSortingState,
} from '@commercetools-uikit/hooks';
import LoadingSpinner from '@commercetools-uikit/loading-spinner';
import DataTable, { TColumn } from '@commercetools-uikit/data-table';
import DataTableManager, {
  UPDATE_ACTIONS,
} from '@commercetools-uikit/data-table-manager';
import Spacings from '@commercetools-uikit/spacings';
import Text from '@commercetools-uikit/text';
import { ContentNotification } from '@commercetools-uikit/notifications';
import {
  InfoMainPage,
  PageNotFound,
} from '@commercetools-frontend/application-components';
import { Pagination } from '@commercetools-uikit/pagination';
import {
  formatLocalizedString,
  transformLocalizedFieldToLocalizedString,
} from '@commercetools-frontend/l10n';
import { useApplicationContext } from '@commercetools-frontend/application-shell-connectors';
import { PlusBoldIcon } from '@commercetools-uikit/icons';
import SecondaryButton from '@commercetools-uikit/secondary-button';
import { getErrorMessage } from '../../../helpers';
import { TQuery, TTypeDefinition } from '../../../types/generated/ctp';
import messages from './messages';
import createColumnDefinitions from './column-definitions';
import { useTypesFetcher } from '../../../hooks/use-types-connector';
import { SuspendedRoute } from '@commercetools-frontend/application-shell';
const TypesCreate = lazy(() => import('../types-create/types-create'));

const TypesEdit = lazy(() => import('../types-edit/types-edit'));

type Props = {};

const TypesList: FC<Props> = () => {
  const intl = useIntl();
  const { push } = useHistory();
  const match = useRouteMatch();
  const { page, perPage } = usePaginationState();
  const tableSorting = useDataTableSortingState({ key: 'key', order: 'asc' });
  const { dataLocale, projectLanguages } = useApplicationContext((context) => ({
    dataLocale: context.dataLocale,
    projectLanguages: context.project?.languages,
  }));
  const { typeDefinitions, error, loading, refetch } = useTypesFetcher({
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

  if (!typeDefinitions || !typeDefinitions.results) {
    return <PageNotFound />;
  }

  const { results, total } = typeDefinitions;

  const itemRenderer = (
    item: TTypeDefinition,
    column: TColumn<TTypeDefinition>
  ) => {
    switch (column.key) {
      case 'name':
        return formatLocalizedString(
          {
            name: transformLocalizedFieldToLocalizedString(
              item.nameAllLocales ?? []
            ),
          },
          {
            key: 'name',
            locale: dataLocale,
            fallbackOrder: projectLanguages,
            fallback: NO_VALUE_FALLBACK,
          }
        );
      case 'description':
        return formatLocalizedString(
          {
            name: transformLocalizedFieldToLocalizedString(
              item.descriptionAllLocales ?? []
            ),
          },
          {
            key: 'name',
            locale: dataLocale,
            fallbackOrder: projectLanguages,
            fallback: NO_VALUE_FALLBACK,
          }
        );
      case 'resourceTypeIds':
        return item.resourceTypeIds.join(', ');
      case 'fieldCount':
        return item.fieldDefinitions.length;
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
          <Text.Headline as="h1" intlMessage={messages.title} />
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
            <DataTable<NonNullable<TQuery['typeDefinitions']['results']>[0]>
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
          <TypesCreate
            linkToHome={match.url}
            onClose={() => {
              refetch();
              push(`${match.url}`);
            }}
            onCreate={(id: string) => {
              refetch();
              push(`${match.url}/${id}`);
            }}
          />
        </SuspendedRoute>
        <SuspendedRoute path={`${match.path}/:id`}>
          <TypesEdit
            onClose={() => {
              refetch();
              push(`${match.url}`);
            }}
            linkToHome={match.url}
          />
        </SuspendedRoute>
      </Switch>
    </InfoMainPage>
  );
};
TypesList.displayName = 'Types';

export default TypesList;

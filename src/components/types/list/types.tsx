import { FC, useState } from 'react';
import { useIntl } from 'react-intl';
import { useHistory } from 'react-router-dom';
import { useMcQuery } from '@commercetools-frontend/application-shell';
import {
  GRAPHQL_TARGETS,
  NO_VALUE_FALLBACK,
} from '@commercetools-frontend/constants';
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
import { getErrorMessage } from '../../../helpers';
import {
  TQuery,
  TQuery_TypeDefinitionsArgs,
  TTypeDefinition,
} from '../../../types/generated/ctp';
import FetchTypesQuery from './fetch-types.ctp.graphql';
import messages from './messages';
import createColumnDefinitions from './column-definitions';

type Props = {
  linkToWelcome: string;
};

const Types: FC<Props> = ({ linkToWelcome }) => {
  const intl = useIntl();
  const { push } = useHistory();
  const { page, perPage } = usePaginationState();
  const tableSorting = useDataTableSortingState({ key: 'key', order: 'asc' });
  const { dataLocale, projectLanguages } = useApplicationContext((context) => ({
    dataLocale: context.dataLocale,
    projectLanguages: context.project?.languages,
  }));
  const { data, error, loading } = useMcQuery<
    TQuery,
    TQuery_TypeDefinitionsArgs
  >(FetchTypesQuery, {
    variables: {
      limit: perPage.value,
      offset: (page.value - 1) * perPage.value,
      sort: [`${tableSorting.value.key} ${tableSorting.value.order}`],
    },
    context: {
      target: GRAPHQL_TARGETS.COMMERCETOOLS_PLATFORM,
    },
  });

  const [tableData, setTableData] = useState({
    columns: createColumnDefinitions(intl.formatMessage),
    visibleColumns: createColumnDefinitions(intl.formatMessage),
    visibleColumnKeys: createColumnDefinitions(intl.formatMessage).map(
      (column) => column.key
    ),
  });

  const [isCondensed, setIsCondensed] = useState<boolean>(false);
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

  if (!data || !data.typeDefinitions || !data.typeDefinitions.results) {
    return <PageNotFound />;
  }

  const {
    typeDefinitions: { results, total },
  } = data;

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
          <Text.Headline as="h2" intlMessage={messages.title} />
          {/* <SecondaryButton
            onClick={() => {
              push(`/${linkToWelcome}/types/new`);
            }}
            iconLeft={<PlusBoldIcon />}
            label={intl.formatMessage(messages.addType)}
          /> */}
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
              onRowClick={(row) => push(`${linkToWelcome}/types/${row.id}`)}
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
    </InfoMainPage>
  );
};
Types.displayName = 'Types';

export default Types;

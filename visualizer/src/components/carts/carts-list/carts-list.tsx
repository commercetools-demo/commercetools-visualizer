import { useIntl } from 'react-intl';
import { Switch, useHistory, useRouteMatch } from 'react-router-dom';
import {
  useDataTableSortingState,
  usePaginationState,
} from '@commercetools-uikit/hooks';
import { debounce } from 'lodash';
import { ContentNotification } from '@commercetools-uikit/notifications';
import Text from '@commercetools-uikit/text';
import { getErrorMessage } from '../../../helpers';
import Spacings from '@commercetools-uikit/spacings';
import LoadingSpinner from '@commercetools-uikit/loading-spinner';
import {
  InfoMainPage,
  PageContentFull,
  PageNotFound,
} from '@commercetools-frontend/application-components';
import DataTable, { TColumn } from '@commercetools-uikit/data-table';
import { TCart } from '../../../types/generated/ctp';
import messages from './messages';
import { Pagination } from '@commercetools-uikit/pagination';
import { useCartsFetcher } from '../../../hooks/use-carts-hook';
import { useCallback, useState } from 'react';
import CartsSearchbar from './carts-searchbar/carts-searchbar';
import Constraints from '@commercetools-uikit/constraints';
import { ALL_FIELDS } from './constants';
import { TCustomEvent } from '@commercetools-uikit/selectable-search-input';
import DataTableManager, {
  UPDATE_ACTIONS,
} from '@commercetools-uikit/data-table-manager';
import {
  createHiddenColumnDefinitions,
  createVisibleColumnDefinitions,
} from './column-definitions';
import { SuspendedRoute } from '@commercetools-frontend/application-shell';
import CartDetails from '../cart-details/cart-details';

const CartsList = () => {
  const intl = useIntl();
  const match = useRouteMatch();
  const { push } = useHistory();
  console.log(match.url);

  const tableSorting = useDataTableSortingState({ key: 'key', order: 'asc' });
  const { page, perPage } = usePaginationState();

  const [searchOption, setSearchOption] = useState(ALL_FIELDS);
  const [searchText, setSearchText] = useState('');

  const debouncedSearch = useCallback(
    debounce((searchQuery) => setSearchText(searchQuery), 1000),
    []
  );

  const [tableData, setTableData] = useState({
    columns: [
      ...createVisibleColumnDefinitions(intl.formatMessage),
      ...createHiddenColumnDefinitions(intl.formatMessage),
    ],
    visibleColumns: createVisibleColumnDefinitions(intl.formatMessage),
    visibleColumnKeys: createVisibleColumnDefinitions(intl.formatMessage).map(
      (column) => column.key
    ),
  });

  const [isCondensed, setIsCondensed] = useState<boolean>(true);
  const [isWrappingText, setIsWrappingText] = useState<boolean>(false);

  const { carts, error, loading, refetch } = useCartsFetcher({
    limit: perPage.value,
    offset: (page.value - 1) * perPage.value,
    sort: [`${tableSorting.value.key} ${tableSorting.value.order}`],
    where:
      searchOption === ALL_FIELDS
        ? undefined
        : searchText
        ? `${searchOption}="${searchText}"`
        : undefined,
  });

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

  if (!carts || !carts.results) {
    return <PageNotFound />;
  }

  const { results } = carts;

  const itemRenderer = (item: TCart, column: TColumn<TCart>) => {
    switch (column.key) {
      case 'createdAt':
        return intl.formatDate(item.createdAt);
      case 'lastModifiedAt':
        return intl.formatDate(item.lastModifiedAt);
      case 'amountOfLineitems':
        return item.lineItems.length;
      default:
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return (item as any)[column.key] || '';
    }
  };

  const onReset = () => {
    setSearchOption(ALL_FIELDS);
    setSearchText('');
  };

  const onChange = (event: TCustomEvent) => {
    if (event.target?.id?.endsWith('dropdown')) {
      setSearchOption(event.target.value as string);
    } else {
      debouncedSearch(event.target.value);
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
    <InfoMainPage title={intl.formatMessage(messages.title)}>
      <Spacings.Stack scale="m">
        <CartsSearchbar
          text={searchText}
          option={searchOption}
          onChange={onChange}
          onReset={onReset}
        />
        {carts.total === 0 && (
          <div>{intl.formatMessage(messages.noResults)}</div>
        )}
        {carts.total > 0 && (
          <PageContentFull>
            <Spacings.Stack scale="m">
              <Constraints.Horizontal max="scale">
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
                  <DataTable
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
                  totalItems={carts.total}
                />
              </Constraints.Horizontal>
            </Spacings.Stack>
          </PageContentFull>
        )}
      </Spacings.Stack>
      <Switch>
        <SuspendedRoute path={`${match.path}/:id`}>
          <CartDetails
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

export default CartsList;

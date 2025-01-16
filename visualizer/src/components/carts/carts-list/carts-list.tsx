import { useIntl } from 'react-intl';
import { Link, Switch, useHistory, useRouteMatch } from 'react-router-dom';
import {
  useDataTableSortingState,
  usePaginationState,
} from '@commercetools-uikit/hooks';
import { debounce } from 'lodash';
import { ContentNotification } from '@commercetools-uikit/notifications';
import Text from '@commercetools-uikit/text';
import { formatMoney, getErrorMessage } from '../../../helpers';
import Spacings from '@commercetools-uikit/spacings';
import LoadingSpinner from '@commercetools-uikit/loading-spinner';
import {
  InfoMainPage,
  PageContentFull,
  PageNotFound,
} from '@commercetools-frontend/application-components';
import { TCart } from '../../../types/generated/ctp';
import messages from './messages';
import { useCartsFetcher } from '../../../hooks/use-carts-hook';
import { useCallback, useState } from 'react';
import CartsSearchbar from './carts-searchbar/carts-searchbar';
import { ALL_FIELDS } from './constants';
import { TCustomEvent } from '@commercetools-uikit/selectable-search-input';
import {
  createHiddenColumnDefinitions,
  createVisibleColumnDefinitions,
} from './column-definitions';
import { SuspendedRoute } from '@commercetools-frontend/application-shell';
import CartDetails from '../cart-details/cart-details';
import SecondaryButton from '@commercetools-uikit/secondary-button';
import { PlusBoldIcon } from '@commercetools-uikit/icons';
import Stamp, { TTone } from '@commercetools-uikit/stamp';
import { formatTitleAddress } from '../cart-create-customer-address-title/cart-create-customer-address-title';
import PaginatableDataTable from '../../paginatable-data-table/paginatable-data-table';
import { TDataTableProps } from '@commercetools-uikit/data-table/dist/declarations/src/data-table';
import {
  formatDateAndTime,
  renderDefault,
} from '../../paginatable-data-table/helpers';

const CartsList = () => {
  const intl = useIntl();
  const match = useRouteMatch();
  const { push } = useHistory();

  const tableSorting = useDataTableSortingState({
    key: 'createdAt',
    order: 'desc',
  });
  const paginationState = usePaginationState();

  const [searchOption, setSearchOption] = useState(ALL_FIELDS);
  const [searchText, setSearchText] = useState('');

  const debouncedSearch = useCallback(
    debounce((searchQuery) => setSearchText(searchQuery), 1000),
    []
  );

  const { carts, error, loading, refetch } = useCartsFetcher({
    limit: paginationState.perPage.value,
    offset: (paginationState.page.value - 1) * paginationState.perPage.value,
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

  const itemRenderer: TDataTableProps<TCart>['itemRenderer'] = (
    item,
    column
  ) => {
    switch (column.key) {
      case 'createdAt':
      case 'lastModifiedAt':
        return formatDateAndTime(item[column.key], intl);
      case 'amountOfLineitems':
        return item.lineItems.length;
      case 'cartState': {
        let tone: TTone = 'primary';
        switch (item.cartState) {
          case 'Active':
            tone = 'primary';
            break;
          case 'Merged':
            tone = 'secondary';
            break;
          case 'Ordered':
            tone = 'information';
            break;
          case 'Frozen':
            tone = 'warning';
            break;
        }
        return <Stamp tone={tone} label={item.cartState} isCondensed={true} />;
      }
      case 'shippingAddress':
        return formatTitleAddress(item.shippingAddress) || '';
      case 'billingAddress':
        return formatTitleAddress(item.billingAddress) || '';
      case 'totalPrice':
        return formatMoney(item.totalPrice, intl);
      default:
        return renderDefault(item[column.key as keyof TCart]);
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

  return (
    <InfoMainPage
      customTitleRow={
        <Spacings.Inline justifyContent="space-between">
          <Text.Headline as="h1" intlMessage={messages.title} />
          <SecondaryButton
            as={Link}
            to={`${match.url}/new`}
            iconLeft={<PlusBoldIcon />}
            label={intl.formatMessage(messages.addCart)}
          />
        </Spacings.Inline>
      }
    >
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
            <PaginatableDataTable<TCart>
              columns={[
                ...createVisibleColumnDefinitions(),
                ...createHiddenColumnDefinitions(intl.formatMessage),
              ]}
              visibleColumns={createVisibleColumnDefinitions()}
              rows={results}
              itemRenderer={itemRenderer}
              onRowClick={(row) => push(`${match.url}/${row.id}`)}
              sortedBy={tableSorting.value.key}
              sortDirection={tableSorting.value.order}
              onSortChange={tableSorting.onChange}
              paginationState={paginationState}
              totalItems={carts.total}
            />
          </PageContentFull>
        )}
      </Spacings.Stack>
      <Switch>
        {/*<SuspendedRoute path={`${match.path}/new`}>*/}
        {/*  <CartCreate*/}
        {/*    onClose={() => {*/}
        {/*      refetch();*/}
        {/*      push(`${match.url}`);*/}
        {/*    }}*/}
        {/*    onCreate={(id: string) => {*/}
        {/*      refetch();*/}
        {/*      push(`${match.url}/${id}`);*/}
        {/*    }}*/}
        {/*  />*/}
        {/*</SuspendedRoute>*/}
        <SuspendedRoute path={`${match.path}/:id`}>
          <CartDetails
            onClose={async () => {
              await refetch();
              push(`${match.url}`);
            }}
            linkToHome={match.url}
          />
        </SuspendedRoute>
      </Switch>
    </InfoMainPage>
  );
};

export default CartsList;

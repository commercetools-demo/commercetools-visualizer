import { useIntl } from 'react-intl';
import { Link, Switch, useHistory, useRouteMatch } from 'react-router-dom';
import {
  useDataTableSortingState,
  usePaginationState,
} from '@commercetools-uikit/hooks';
import { debounce } from 'lodash';
import { ContentNotification } from '@commercetools-uikit/notifications';
import Text from '@commercetools-uikit/text';
import Spacings from '@commercetools-uikit/spacings';
import LoadingSpinner from '@commercetools-uikit/loading-spinner';
import {
  InfoMainPage,
  PageContentFull,
  PageNotFound,
} from '@commercetools-frontend/application-components';
import { TCart } from '../../../types/generated/ctp';
import messages from './messages';
import {
  getErrorMessage,
  useCartsFetcher,
} from 'commercetools-demo-shared-data-fetching-hooks';
import { useCallback, useState } from 'react';
import CartsSearchbar from './carts-searchbar/carts-searchbar';
import { ALL_FIELDS } from './constants';
import { TCustomEvent } from '@commercetools-uikit/selectable-search-input';
import { createVisibleColumnDefinitions } from './column-definitions';
import { SuspendedRoute } from '@commercetools-frontend/application-shell';
import CartDetails from '../cart-details/cart-details';
import SecondaryButton from '@commercetools-uikit/secondary-button';
import { PlusBoldIcon } from '@commercetools-uikit/icons';
import { PaginatableDataTable } from 'commercetools-demo-shared-paginatable-data-table';
import { useIsAuthorized } from '@commercetools-frontend/permissions';
import { PERMISSIONS } from '../../../constants';
import { useApplicationContext } from '@commercetools-frontend/application-shell-connectors';

import {
  defaultCartsColumnsDefinition,
  defaultCartsItemRenderer,
} from 'commercetools-demo-shared-cart-handling';

const CartsList = () => {
  const { dataLocale } = useApplicationContext((context) => ({
    dataLocale: context.dataLocale ?? '',
  }));
  const intl = useIntl();
  const match = useRouteMatch();
  const { push } = useHistory();

  const canManage = useIsAuthorized({
    demandedPermissions: [PERMISSIONS.Manage],
  });

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
    locale: dataLocale,
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
            isDisabled={!canManage}
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
              columns={defaultCartsColumnsDefinition({ intl })}
              visibleColumns={createVisibleColumnDefinitions()}
              rows={results}
              itemRenderer={defaultCartsItemRenderer(intl)}
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

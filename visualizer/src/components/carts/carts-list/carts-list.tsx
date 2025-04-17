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
import { useCallback, useMemo, useState } from 'react';
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
import { Tag, TagList } from '@commercetools-uikit/tag';

import {
  defaultCartsColumnsDefinition,
  defaultCartsItemRenderer,
} from 'commercetools-demo-shared-cart-handling';
import Grid from '@commercetools-uikit/grid';
import { css } from '@emotion/react';
import SidebarLayout from './carts-sidebar-layout';

export type FilterValue = string | Record<string, string>;

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

  const [filters, setFilters] = useState<Record<string, FilterValue>>({});

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const debouncedSearch = useCallback(
    debounce((searchQuery) => setSearchText(searchQuery), 1000),
    []
  );

  const query = useMemo(() => {
    let query = Object.entries(filters).map(([key, value]) => {
      switch (key) {
        case 'createdAt': {
          if (typeof value === 'object') {
            const result: Array<string> = [];
            if ('from' in value) {
              result.push(`${key} >= "${value.from}"`);
            }
            if ('to' in value) {
              result.push(`${key} <= "${value.to}"`);
            }
            return result;
          }
        }
      }
      return `${key}="${value}"`;
    });
    if (searchText && searchOption !== ALL_FIELDS) {
      query.push(`${searchOption}="${searchText}"`);
    }
    return query.flat().length > 0 ? query.flat().join(' AND ') : undefined;
  }, [filters, searchOption, searchText]);

  const { carts, error, loading, refetch } = useCartsFetcher({
    limit: paginationState.perPage.value,
    offset: (paginationState.page.value - 1) * paginationState.perPage.value,
    sort: [`${tableSorting.value.key} ${tableSorting.value.order}`],
    locale: dataLocale,
    where: query,
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

  const onFilterChange = (filter: string, value: FilterValue) => {
    if (filters[filter]) {
      if (filters[filter] === value) {
        //remove
        const cloned = { ...filters };
        delete cloned[filter];
        setFilters(cloned);
      } else {
        //change
        const cloned = { ...filters };
        cloned[filter] = value;
        setFilters(cloned);
      }
    } else {
      //new
      const cloned = { ...filters };
      cloned[filter] = value;
      setFilters(cloned);
    }
  };

  return (
    <div>
      <Grid
        // This is a flex item within a flex container from the app-kit,
        // with a column layout. If the item is not set to grow, its
        // height will not be equal to the height of all available space.
        // TODO: max-height should not be hardcoded and this need to be fixed in UI-kit
        // @ts-ignore
        css={css`
          flex-grow: 1;
          max-height: 96vh;
        `}
        gridTemplateColumns={
          isSidebarOpen ? 'minmax(10px, 1fr) auto' : 'minmax(10px, 1fr)'
        }
        gridTemplateRows="minmax(10px, 1fr)"
        gridTemplateAreas={'"main sidebar"'}
      >
        <Grid.Item gridArea="main">
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
            <PageContentFull>
              <Spacings.Stack scale="m">
                <CartsSearchbar
                  text={searchText}
                  option={searchOption}
                  onChange={onChange}
                  onReset={onReset}
                  isSidebarOpen={isSidebarOpen}
                  showSidebar={() => setIsSidebarOpen(true)}
                  hideSidebar={() => setIsSidebarOpen(false)}
                />
                {filters && (
                  <TagList>
                    {Object.entries(filters).map(([key, value]) => {
                      if (typeof value === 'object') {
                        return Object.entries(value).map(([valueKey]) => {
                          return (
                            <Tag
                              key={valueKey}
                              onRemove={() => onFilterChange(key, value)}
                            >{`${key}: ${valueKey}`}</Tag>
                          );
                        });
                      }
                      return (
                        <Tag
                          key={key}
                          onRemove={() => onFilterChange(key, value)}
                        >{`${key}: ${value}`}</Tag>
                      );
                    })}
                  </TagList>
                )}

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
            </PageContentFull>
          </InfoMainPage>
        </Grid.Item>
        <Grid.Item gridArea="sidebar">
          <SidebarLayout
            isOpen={isSidebarOpen}
            onClose={() => setIsSidebarOpen(false)}
            isInEditMode={false}
            selectedFilters={filters}
            onChange={onFilterChange}
          />
        </Grid.Item>
      </Grid>
    </div>
  );
};

export default CartsList;

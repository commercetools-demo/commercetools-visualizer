import { useShoppingListsFetcher } from '../../../hooks/use-shopping-lists-hook';
import { ContentNotification } from '@commercetools-uikit/notifications';
import Text from '@commercetools-uikit/text';
import { getErrorMessage } from '../../../helpers';
import Spacings from '@commercetools-uikit/spacings';
import LoadingSpinner from '@commercetools-uikit/loading-spinner';
import {
  InfoMainPage,
  PageNotFound,
} from '@commercetools-frontend/application-components';
import { TColumn } from '@commercetools-uikit/data-table';
import { TShoppingList } from '../../../types/generated/ctp';
import {
  formatLocalizedString,
  transformLocalizedFieldToLocalizedString,
} from '@commercetools-frontend/l10n';
import { NO_VALUE_FALLBACK } from '@commercetools-frontend/constants';
import { useApplicationContext } from '@commercetools-frontend/application-shell-connectors';
import { usePaginationState } from '@commercetools-uikit/hooks';
import { useState } from 'react';
import CheckboxInput from '@commercetools-uikit/checkbox-input';
import { Link, Switch, useHistory, useRouteMatch } from 'react-router-dom';
import { SuspendedRoute } from '@commercetools-frontend/application-shell';
import ShoppingListsEdit from '../shopping-lists-edit/shopping-lists-edit';
import SecondaryButton from '@commercetools-uikit/secondary-button';
import { PlusBoldIcon } from '@commercetools-uikit/icons';
import ShoppingListsCreate from '../shopping-lists-create/shopping-lists-create';
import CustomerSearch from '../../customer-search/customer-search';
import PaginatableDataTable from '../../paginatable-data-table/paginatable-data-table';

export const ShoppingListsList = () => {
  const paginationState = usePaginationState();
  const { push } = useHistory();
  const match = useRouteMatch();
  const [userId, setUserId] = useState<
    { value: string; label: string } | undefined
  >(undefined);
  const [onlyItemsWithCustomer, setOnlyItemsWithCustomer] =
    useState<boolean>(false);
  const { shoppingLists, loading, error, refetch } = useShoppingListsFetcher({
    limit: paginationState.perPage.value,
    offset: (paginationState.page.value - 1) * paginationState.perPage.value,
    where: userId
      ? `customer(id="${userId.value}")`
      : onlyItemsWithCustomer
      ? 'customer is defined'
      : undefined,
  });
  const { dataLocale, projectLanguages } = useApplicationContext((context) => ({
    dataLocale: context.dataLocale ?? '',
    projectLanguages: context.project?.languages ?? [],
  }));
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
  if (!shoppingLists) {
    return <PageNotFound />;
  }
  const columns: Array<TColumn<TShoppingList>> = [
    { key: 'id', label: 'ID' },
    { key: 'name', label: 'Name' },
    { key: 'amountLineitems', label: 'Amount Lineitems' },
    { key: 'customer', label: 'Customer' },
  ];
  const itemRenderer = (
    item: TShoppingList,
    column: TColumn<TShoppingList>
  ) => {
    switch (column.key) {
      case 'amountLineitems': {
        return item.lineItems.length;
      }
      case 'customer': {
        return item.customer ? item.customer.email : '';
      }
      case 'name': {
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
      }
      default:
        return item[column.key as keyof TShoppingList];
    }
  };
  return (
    <InfoMainPage
      customTitleRow={
        <Spacings.Inline justifyContent="space-between">
          <Text.Headline as="h2">Shopping Lists</Text.Headline>

          <SecondaryButton
            iconLeft={<PlusBoldIcon />}
            as={Link}
            to={`${match.url}/new`}
            label={'New Shopping List'}
          />
        </Spacings.Inline>
      }
    >
      <Spacings.Stack scale={'l'}>
        <Spacings.Inline scale={'s'} alignItems={'center'}>
          <CustomerSearch
            title={'Customer'}
            name={'customer'}
            value={userId}
            onChange={(event) => {
              // @ts-ignore
              setUserId(event.target.value);
            }}
            horizontalConstraint={10}
          />
          <CheckboxInput
            onChange={() => setOnlyItemsWithCustomer(!onlyItemsWithCustomer)}
            isChecked={onlyItemsWithCustomer}
          >
            Only display items with customers
          </CheckboxInput>
        </Spacings.Inline>
        <PaginatableDataTable
          rows={shoppingLists.results}
          columns={columns}
          visibleColumns={columns}
          itemRenderer={itemRenderer}
          onRowClick={(row) => {
            push(`${match.url}/${row.id}`);
          }}
          paginationState={paginationState}
          totalItems={shoppingLists.total}
        />
      </Spacings.Stack>
      <Switch>
        <SuspendedRoute path={`${match.path}/new`}>
          <ShoppingListsCreate
            onClose={() => {
              push(match.url);
            }}
            onCreate={async (id: string) => {
              await refetch();
              push(`${match.url}/${id}`);
            }}
          />
        </SuspendedRoute>
        <SuspendedRoute path={`${match.path}/:id`}>
          <ShoppingListsEdit
            onClose={async () => {
              await refetch();
              push(match.url);
            }}
          />
        </SuspendedRoute>
      </Switch>
    </InfoMainPage>
  );
};

export default ShoppingListsList;

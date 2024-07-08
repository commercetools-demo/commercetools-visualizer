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
import DataTable, { TColumn } from '@commercetools-uikit/data-table';
import { TShoppingList } from '../../../types/generated/ctp';
import {
  formatLocalizedString,
  transformLocalizedFieldToLocalizedString,
} from '@commercetools-frontend/l10n';
import { NO_VALUE_FALLBACK } from '@commercetools-frontend/constants';
import { useApplicationContext } from '@commercetools-frontend/application-shell-connectors';
import { usePaginationState } from '@commercetools-uikit/hooks';
import { Pagination } from '@commercetools-uikit/pagination';
import { useState } from 'react';
import CheckboxInput from '@commercetools-uikit/checkbox-input';
import { Switch, useHistory, useRouteMatch } from 'react-router-dom';
import { SuspendedRoute } from '@commercetools-frontend/application-shell';
import ShoppingListsEdit from '../shopping-lists-edit/shopping-lists-edit';
import useCustomerSearchFetcher from '../../../hooks/use-customer-search-fetcher';
import formatCustomerName from '../../../utils/format-customer-name';
import AsyncSelectField from '@commercetools-uikit/async-select-field';

export const ShoppingListsList = () => {
  const { page, perPage } = usePaginationState();
  const { push } = useHistory();
  const match = useRouteMatch();
  const [userId, setUserId] = useState<
    { value: string; label: string } | undefined
  >(undefined);
  const [onlyItemsWithCustomer, setOnlyItemsWithCustomer] =
    useState<boolean>(false);
  const { fetchCustomers, customerData } = useCustomerSearchFetcher(() => {});
  const { shoppingLists, loading, error, refetch } = useShoppingListsFetcher({
    limit: perPage.value,
    offset: (page.value - 1) * perPage.value,
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
    <InfoMainPage title={'Shopping Lists'}>
      <Spacings.Stack scale={'l'}>
        <Spacings.Inline scale={'s'} alignItems={'center'}>
          <AsyncSelectField
            title={'Customer'}
            value={userId}
            isClearable
            isSearchable
            loadOptions={async (text) => {
              fetchCustomers({
                searchQuery: text,
                perPage: 20,
                page: 1,
              });
              return (
                customerData.customers.results?.map((customer) => {
                  return {
                    value: customer.id,
                    label: formatCustomerName(customer),
                  };
                }) || []
              );
            }}
            onChange={(event) => {
              // @ts-ignore
              setUserId(event.target.value);
            }}
            horizontalConstraint={8}
          />
          <CheckboxInput
            onChange={() => setOnlyItemsWithCustomer(!onlyItemsWithCustomer)}
            isChecked={onlyItemsWithCustomer}
          >
            Only display items with customers
          </CheckboxInput>
        </Spacings.Inline>
        <DataTable
          rows={shoppingLists.results}
          columns={columns}
          itemRenderer={itemRenderer}
          onRowClick={(row) => {
            push(`${match.url}/${row.id}`);
          }}
        />
        <Pagination
          page={page.value}
          onPageChange={page.onChange}
          perPage={perPage.value}
          onPerPageChange={perPage.onChange}
          totalItems={shoppingLists.total}
        />
      </Spacings.Stack>
      <Switch>
        <SuspendedRoute path={`${match.path}/:id`}>
          <ShoppingListsEdit
            onClose={() => {
              refetch();
              push(match.url);
            }}
          />
        </SuspendedRoute>
      </Switch>
    </InfoMainPage>
  );
};

export default ShoppingListsList;

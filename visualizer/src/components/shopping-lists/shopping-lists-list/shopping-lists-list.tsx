import {
  getErrorMessage,
  useShoppingListsFetcher,
} from 'commercetools-demo-shared-data-fetching-hooks';
import { ContentNotification } from '@commercetools-uikit/notifications';
import Text from '@commercetools-uikit/text';
import Spacings from '@commercetools-uikit/spacings';
import LoadingSpinner from '@commercetools-uikit/loading-spinner';
import {
  InfoMainPage,
  PageNotFound,
} from '@commercetools-frontend/application-components';
import { TColumn } from '@commercetools-uikit/data-table';
import { TShoppingList } from '../../../types/generated/ctp';
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
import { PaginatableDataTable } from 'commercetools-demo-shared-paginatable-data-table';
import { useIsAuthorized } from '@commercetools-frontend/permissions';
import { PERMISSIONS } from '../../../constants';
import {
  defaultShoppingListsColumnsDefinition,
  defaultShoppingListsItemRenderer,
} from 'commercetools-demo-shared-cart-handling';
import { useIntl } from 'react-intl';

export const ShoppingListsList = () => {
  const intl = useIntl();
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

  const canManage = useIsAuthorized({
    demandedPermissions: [PERMISSIONS.Manage],
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
    { key: 'name', label: 'Name' },
    { key: 'count', label: 'Line Item count' },
    { key: 'customer', label: 'Customer' },
  ];

  return (
    <InfoMainPage
      customTitleRow={
        <Spacings.Inline justifyContent="space-between">
          <Text.Headline as="h1">Shopping Lists</Text.Headline>

          <SecondaryButton
            iconLeft={<PlusBoldIcon />}
            as={Link}
            to={`${match.url}/new`}
            label={'New Shopping List'}
            isDisabled={!canManage}
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
          visibleColumns={columns}
          columns={defaultShoppingListsColumnsDefinition({ intl })}
          itemRenderer={defaultShoppingListsItemRenderer(
            dataLocale,
            projectLanguages
          )}
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

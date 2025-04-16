import { FC, useEffect, useState } from 'react';
import {
  CustomFormModalPage,
  PageNotFound,
} from '@commercetools-frontend/application-components';
import { useParams } from 'react-router-dom';
import { useIsAuthorized } from '@commercetools-frontend/permissions';
import { PERMISSIONS } from '../../../constants';
import {
  getErrorMessage,
  graphQLErrorHandler,
  useShoppingListDeleter,
  useShoppingListFetcher,
  useShoppingListUpdater,
} from 'commercetools-demo-shared-data-fetching-hooks';
import { ContentNotification } from '@commercetools-uikit/notifications';
import Text from '@commercetools-uikit/text';
import Spacings from '@commercetools-uikit/spacings';
import LoadingSpinner from '@commercetools-uikit/loading-spinner';
import { TShoppingListUpdateAction } from '../../../types/generated/ctp';
import { DOMAINS } from '@commercetools-frontend/constants';
import { useApplicationContext } from '@commercetools-frontend/application-shell-connectors';
import { useShowNotification } from '@commercetools-frontend/actions-global';
import Constraints from '@commercetools-uikit/constraints';
import CollapsiblePanel from '@commercetools-uikit/collapsible-panel';
import {
  CategorySelector,
  VariantValue,
} from 'commercetools-demo-shared-entity-selectors';
import {
  defaultShoppingListColumnsDefinition,
  defaultShoppingListItemRenderer,
} from 'commercetools-demo-shared-cart-handling';
import { PaginatableDataTable } from 'commercetools-demo-shared-paginatable-data-table';
import { useIntl } from 'react-intl';

type Props = {
  onClose: () => void;
};

export const ShoppingListsEdit: FC<Props> = ({ onClose }) => {
  const intl = useIntl();
  const { id } = useParams<{ id: string }>();
  const showNotification = useShowNotification();
  const { dataLocale, projectLanguages } = useApplicationContext((context) => ({
    dataLocale: context.dataLocale ?? '',
    projectLanguages: context.project?.languages ?? [],
  }));
  const shoppingListUpdater = useShoppingListUpdater();
  const shoppingListDeleter = useShoppingListDeleter();
  const canManage = useIsAuthorized({
    demandedPermissions: [PERMISSIONS.Manage],
  });
  const [shoppingListPanelClosed, setShoppingListPanelClosed] = useState(false);

  const { shoppingList, error, loading } = useShoppingListFetcher({
    id: id,
  });
  useEffect(() => {
    if (!shoppingList?.lineItems || shoppingList?.lineItems.length === 0) {
      setShoppingListPanelClosed(true);
    } else {
      setShoppingListPanelClosed(false);
    }
  }, [shoppingList?.lineItems]);
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
  if (!shoppingList) {
    return <PageNotFound />;
  }

  const handleDelete = async () => {
    await shoppingListDeleter.execute({
      id: shoppingList.id,
      version: shoppingList.version,
    });
    showNotification({
      kind: 'success',
      domain: DOMAINS.SIDE,
      text: 'The Shopping list has been deleted.',
    });
    onClose();
  };

  const handleRemoveLineItem = async (id: string) => {
    const action: TShoppingListUpdateAction = {
      removeLineItem: { lineItemId: id },
    };
    await shoppingListUpdater.execute({
      actions: [action],
      id: shoppingList.id,
      version: shoppingList.version,
    });
    showNotification({
      kind: 'success',
      domain: DOMAINS.SIDE,
      text: 'The Shopping List has been updated.',
    });
  };

  const handleChangeQuantity = async (lineItemId: string, quantity: number) => {
    const action: TShoppingListUpdateAction = {
      changeLineItemQuantity: { lineItemId: lineItemId, quantity },
    };
    await shoppingListUpdater.execute({
      actions: [action],
      id: shoppingList.id,
      version: shoppingList.version,
    });
    showNotification({
      kind: 'success',
      domain: DOMAINS.SIDE,
      text: 'The Shopping List has been updated.',
    });
  };
  const handleAddVariantToCart = async (variant: VariantValue) => {
    await shoppingListUpdater
      .execute({
        actions: [{ addLineItem: { sku: variant.sku, quantity: 1 } }],
        id: shoppingList.id,
        version: shoppingList.version,
      })
      .then(() => {
        showNotification({
          kind: 'success',
          domain: DOMAINS.SIDE,
          text: 'Added item',
        });
      })
      .catch(graphQLErrorHandler(showNotification));
  };

  return (
    <CustomFormModalPage
      isOpen
      title={'Edit Shopping List'}
      onClose={onClose}
      formControls={
        <>
          <CustomFormModalPage.FormDeleteButton
            onClick={() => handleDelete()}
            isDisabled={!canManage}
          />
        </>
      }
    >
      <Spacings.Stack scale="xxl">
        <Spacings.Stack scale="s">
          <Spacings.Inline justifyContent="space-between" scale="l">
            <Constraints.Horizontal max={11}>
              <Spacings.Stack scale="m">
                <Text.Headline as="h2">Add Item</Text.Headline>
                <Text.Subheadline as="h5">
                  Add items to your shopping cart.
                </Text.Subheadline>
              </Spacings.Stack>
            </Constraints.Horizontal>
          </Spacings.Inline>
          <Constraints.Horizontal max={13}>
            <CategorySelector
              name={'variantSearch'}
              onChange={async (event) => {
                await handleAddVariantToCart(
                  event.target.value as VariantValue
                );
              }}
              isReadOnly={!canManage}
            />
          </Constraints.Horizontal>
        </Spacings.Stack>
        <CollapsiblePanel
          header={
            <CollapsiblePanel.Header>
              {!shoppingList.lineItems || shoppingList.lineItems.length === 0
                ? 'Shopping List (empty)'
                : 'Shopping List'}
            </CollapsiblePanel.Header>
          }
          isClosed={shoppingListPanelClosed}
          onToggle={() => setShoppingListPanelClosed(!shoppingListPanelClosed)}
        >
          {shoppingList.lineItems && (
            <PaginatableDataTable
              visibleColumns={defaultShoppingListColumnsDefinition({ intl })}
              rows={shoppingList.lineItems}
              columns={defaultShoppingListColumnsDefinition({ intl })}
              itemRenderer={defaultShoppingListItemRenderer(
                dataLocale,
                projectLanguages,
                canManage,
                handleRemoveLineItem,
                handleChangeQuantity
              )}
            />
          )}
        </CollapsiblePanel>
      </Spacings.Stack>
    </CustomFormModalPage>
  );
};

export default ShoppingListsEdit;

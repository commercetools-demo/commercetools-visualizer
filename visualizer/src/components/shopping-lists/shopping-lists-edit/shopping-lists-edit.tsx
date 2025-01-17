import { FC, useEffect, useState } from 'react';
import {
  CustomFormModalPage,
  PageNotFound,
} from '@commercetools-frontend/application-components';
import { useParams } from 'react-router-dom';
import { useIsAuthorized } from '@commercetools-frontend/permissions';
import { PERMISSIONS } from '../../../constants';
import {
  useShoppingListDeleter,
  useShoppingListFetcher,
  useShoppingListUpdater,
} from '../../../hooks/use-shopping-lists-hook';
import { ContentNotification } from '@commercetools-uikit/notifications';
import Text from '@commercetools-uikit/text';
import { getErrorMessage } from '../../../helpers';
import Spacings from '@commercetools-uikit/spacings';
import LoadingSpinner from '@commercetools-uikit/loading-spinner';
import DataTable, { TColumn } from '@commercetools-uikit/data-table';
import {
  TShoppingListLineItem,
  TShoppingListUpdateAction,
} from '../../../types/generated/ctp';
import {
  formatLocalizedString,
  transformLocalizedFieldToLocalizedString,
} from '@commercetools-frontend/l10n';
import { DOMAINS, NO_VALUE_FALLBACK } from '@commercetools-frontend/constants';
import { useApplicationContext } from '@commercetools-frontend/application-shell-connectors';
import IconButton from '@commercetools-uikit/icon-button';
import { BinFilledIcon } from '@commercetools-uikit/icons';
import { useShowNotification } from '@commercetools-frontend/actions-global';
import NumberInput from '@commercetools-uikit/number-input';
import { ProductSearchInput } from '../../carts/cart-create-variant-search';
import { ProductValue } from '../../carts/cart-create-variant-search/product-search-input';
import Constraints from '@commercetools-uikit/constraints';
import CollapsiblePanel from '@commercetools-uikit/collapsible-panel';
import ImageContainer from '../../image-container';
import { graphQLErrorHandler } from '../../../utils/error-handling';

type Props = {
  onClose: () => void;
};

export const ShoppingListsEdit: FC<Props> = ({ onClose }) => {
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
  const handleAddVariantToCart = async (variant: ProductValue) => {
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
  const itemRenderer = (
    item: TShoppingListLineItem,
    column: TColumn<TShoppingListLineItem>
  ) => {
    const itemName = formatLocalizedString(
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
    switch (column.key) {
      case 'name': {
        return (
          <Spacings.Inline alignItems="center">
            <ImageContainer
              label={itemName}
              url={item.variant?.images[0]?.url}
            />
            <div>
              <span>{itemName}</span>
              {item.variant?.sku && (
                <Text.Detail tone="secondary">
                  {`SKU: ${item.variant?.sku}`}
                </Text.Detail>
              )}
              {item.variant?.key && (
                <Text.Detail tone="secondary">{`Key: ${item.variant?.key}`}</Text.Detail>
              )}
            </div>
          </Spacings.Inline>
        );
      }
      case 'actions':
        return (
          <IconButton
            icon={<BinFilledIcon />}
            label={'Delete'}
            onClick={async () => {
              await handleRemoveLineItem(item.id);
            }}
            size="medium"
            isDisabled={!canManage}
          />
        );
      case 'quantity':
        return (
          <NumberInput
            onChange={async (event) => {
              await handleChangeQuantity(
                item.id,
                parseFloat(event.target.value)
              );
            }}
            value={item.quantity}
            isReadOnly={!canManage}
          />
        );
      default:
        return item[column.key as keyof TShoppingListLineItem];
    }
  };
  const columns: Array<TColumn<TShoppingListLineItem>> = [
    { key: 'name', label: 'Name' },
    { key: 'quantity', label: 'Quantity' },
    {
      key: 'actions',
      label: '',
    },
  ];
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
            <ProductSearchInput
              name={'variantSearch'}
              onChange={async (event) => {
                const product = event.target.value as ProductValue;
                await handleAddVariantToCart(product);
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
            <DataTable
              rows={shoppingList.lineItems}
              columns={columns}
              itemRenderer={itemRenderer}
            />
          )}
        </CollapsiblePanel>
      </Spacings.Stack>
    </CustomFormModalPage>
  );
};

export default ShoppingListsEdit;

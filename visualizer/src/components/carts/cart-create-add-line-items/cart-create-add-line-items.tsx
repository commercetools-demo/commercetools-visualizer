import { FC, PropsWithChildren, useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import messages from './messages';
import CollapsiblePanel from '@commercetools-uikit/collapsible-panel';
import Spacings from '@commercetools-uikit/spacings';
import Text from '@commercetools-uikit/text';
import Constraints from '@commercetools-uikit/constraints';
import {
  useShowApiErrorNotification,
  useShowNotification,
} from '@commercetools-frontend/actions-global';
import { ProductSearchInput } from '../cart-create-variant-search';
import { ProductValue } from '../cart-create-variant-search/product-search-input';
import CartCreateItemsTable from '../cart-create-items-table';
import { useCartUpdater } from '../../../hooks/use-carts-hook';
import { TCart, TCartUpdateAction } from '../../../types/generated/ctp';
import { useApplicationContext } from '@commercetools-frontend/application-shell-connectors';
import { DOMAINS } from '@commercetools-frontend/constants';
import CartAppliedDiscountsPanel from '../cart-applied-discounts-panel';
import transformErrors from './transform-errors';

interface Props
  extends PropsWithChildren<{
    cart: TCart;
  }> {}

const CartCreateAddLineItems: FC<Props> = ({ children, cart }) => {
  const showNotification = useShowNotification();
  const showApiErrorNotification = useShowApiErrorNotification();
  const intl = useIntl();
  const cartUpdater = useCartUpdater();
  const { dataLocale } = useApplicationContext((context) => ({
    dataLocale: context.dataLocale ?? '',
  }));
  const allLineItems = [
    ...(cart.lineItems || []),
    ...(cart.customLineItems || []),
  ];

  const [shoppingCartPanelClosed, setShoppingCartPanelClosed] = useState(false);

  const handleUpdateCart = (actions: Array<TCartUpdateAction>) =>
    cartUpdater
      .execute({
        actions: actions,
        id: cart.id,
        version: cart.version,
        locale: dataLocale,
      })
      .then(
        () => {
          showNotification({
            kind: 'success',
            domain: DOMAINS.SIDE,
            text: intl.formatMessage(messages.cartUpdated),
          });
          return true;
        },
        (graphQLErrors) => {
          const transformedErrors = transformErrors(graphQLErrors);
          if (transformedErrors.unmappedErrors.length > 0) {
            showApiErrorNotification({
              errors: transformedErrors.unmappedErrors,
            });
          }
          // setState((prevState) => {
          //   const mappedErrors = transformedErrors?.formErrors || [];
          //   return {
          //     errors: [...prevState.errors, ...mappedErrors],
          //   };
          // });
          // used by subchild component to prevent the text field from clearing if errors returned from server
          return false;
        }
      );
  //
  // const handleErrorsReset = () => {
  //   // setState(() => ({
  //   //   errors: [],
  //   // }));
  // };
  //
  const handleApplyDiscountCode = (code: string) =>
    handleUpdateCart([
      {
        addDiscountCode: { code: code },
      },
    ]);

  const handleRemoveDiscountCode = (id: string) => {
    handleUpdateCart([
      {
        removeDiscountCode: {
          discountCode: {
            typeId: 'discount-code',
            id,
          },
        },
      },
    ]);
  };
  const handleAddVariantToCart = async (variant: ProductValue) => {
    await cartUpdater
      .execute({
        actions: [{ addLineItem: { sku: variant.sku, quantity: 1 } }],
        id: cart.id,
        version: cart.version,
        locale: dataLocale,
      })
      .then((result) => {
        if (!result) {
          return;
        }
        showNotification({
          kind: 'success',
          domain: DOMAINS.SIDE,
          text: intl.formatMessage(messages.addVariantSuccess, {
            sku: variant.sku,
          }),
        });
      })
      .catch((e) => {
        const transformedErrors = transformErrors(e);
        if (transformedErrors.unmappedErrors.length > 0) {
          showApiErrorNotification({
            errors: transformedErrors.unmappedErrors,
          });
        }
      });
  };

  const handleRemoveLineItem = async (
    id: string,
    isCustomLineItem: boolean
  ) => {
    const action: TCartUpdateAction = isCustomLineItem
      ? { removeCustomLineItem: { customLineItemId: id } }
      : { removeLineItem: { lineItemId: id } };
    await cartUpdater.execute({
      actions: [action],
      id: cart.id,
      version: cart.version,
      locale: dataLocale,
    });
    showNotification({
      kind: 'success',
      domain: DOMAINS.SIDE,
      text: intl.formatMessage(messages.cartUpdated),
    });
  };

  const handleChangeQuantity = async ({
    quantity,
    id,
    isCustomLineItem,
  }: {
    quantity: number;
    id: string;
    isCustomLineItem: boolean;
  }) => {
    const action: TCartUpdateAction = isCustomLineItem
      ? {
          changeCustomLineItemQuantity: {
            customLineItemId: id,
            quantity,
          },
        }
      : { changeLineItemQuantity: { lineItemId: id, quantity } };
    await cartUpdater.execute({
      actions: [action],
      id: cart.id,
      version: cart.version,
      locale: dataLocale,
    });
    showNotification({
      kind: 'success',
      domain: DOMAINS.SIDE,
      text: intl.formatMessage(messages.cartUpdated),
    });
  };

  const hasLineItems = allLineItems.length > 0;
  return (
    <Spacings.Stack scale="xxl">
      <Spacings.Stack scale="s">
        <Spacings.Inline justifyContent="space-between" scale="l">
          <Constraints.Horizontal max={11}>
            <Spacings.Stack scale="m">
              <Text.Headline as="h2" intlMessage={messages.title} />
              <Text.Subheadline as="h5" intlMessage={messages.subTitle} />
            </Spacings.Stack>
          </Constraints.Horizontal>
          {/*<SecondaryButton*/}
          {/*  iconLeft={<PlusBoldIcon />}*/}
          {/*  label={intl.formatMessage(messages.addCustomLineItemLabel)}*/}
          {/*  onClick={goToCustomLineItemAddition}*/}
          {/*/>*/}
        </Spacings.Inline>
        <Constraints.Horizontal max={13}>
          <ProductSearchInput
            name={'variantSearch'}
            onChange={async (event) => {
              const product = event.target.value as ProductValue;
              await handleAddVariantToCart(product);
            }}
          />
        </Constraints.Horizontal>
      </Spacings.Stack>
      <CollapsiblePanel
        header={
          <CollapsiblePanel.Header>
            <FormattedMessage
              {...(!hasLineItems
                ? messages.emptyShoppingCartLabel
                : messages.shoppingCartLabel)}
            />
          </CollapsiblePanel.Header>
        }
        isClosed={shoppingCartPanelClosed}
        onToggle={() => setShoppingCartPanelClosed(!shoppingCartPanelClosed)}
      >
        {hasLineItems ? (
          <Constraints.Horizontal>
            <Spacings.Stack scale="xl">
              <CartCreateItemsTable
                isEditable={true}
                onChangeQuantity={handleChangeQuantity}
                onRemoveItem={handleRemoveLineItem}
                cart={cart}
              />
              <CartAppliedDiscountsPanel
                cart={cart}
                //errors={state.errors}
                onApplyDiscountCode={handleApplyDiscountCode}
                onRemoveDiscountCode={handleRemoveDiscountCode}
                //resetErrors={handleErrorsReset}
              />
            </Spacings.Stack>
          </Constraints.Horizontal>
        ) : (
          <Text.Body>
            <FormattedMessage {...messages.emptyCart} />
          </Text.Body>
        )}
      </CollapsiblePanel>
      {children}
    </Spacings.Stack>
  );
};

export default CartCreateAddLineItems;

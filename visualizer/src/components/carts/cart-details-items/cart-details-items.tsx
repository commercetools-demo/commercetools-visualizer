import {
  TCart,
  TCustomLineItem,
  TLineItem,
} from '../../../types/generated/ctp';
import { FC } from 'react';
import createSelectedColumnsDefinition from './column-definitions';
import { CartItemTableProductCell } from './cart-item-table-product-cell/cart-item-table-product-cell';
import { Link } from 'react-router-dom';
import Spacings from '@commercetools-uikit/spacings';
import Text from '@commercetools-uikit/text';
import { FormattedMessage, useIntl } from 'react-intl';
import { formatMoney } from '../../../helpers';
import { SHIPPING_MODES } from '../addresses-panel/addresses-panel';
import {
  determineIfTaxIncludedInPrice,
  determinteIfTaxRateSameInMultiMode,
  getGrossPriceWithoutShipping,
  getGrossPriceWithoutShippingMulti,
} from '../cart-summary-pricing-breakdown/order-prices';
import messages from './messages';
import CartItemTableInventoryCell from './cart-item-table-inventory-cell';
import {
  getSymbolFromCurrency,
  useCurrencies,
} from '@commercetools-frontend/l10n';
import { useApplicationContext } from '@commercetools-frontend/application-shell-connectors';
import CartItemTableUnitNetPriceCell from './cart-item-table-unit-net-price-cell';
import CartItemTableUnitGrossPriceCell from './cart-item-table-unit-gross-price-cell';
import CartItemTableUnitPriceCell from './cart-item-table-unit-price-cell';
import CartItemTableTaxRateCell from './cart-item-table-tax-rate-cell';
import CartItemTableSubtotalPriceCell from './cart-item-table-subtotal-price-cell';
import CartItemTableTotalPriceCell from './cart-item-table-total-price-cell';
import PaginatableDataTable from '../../paginatable-data-table/paginatable-data-table';
import { TDataTableProps } from '@commercetools-uikit/data-table/dist/declarations/src/data-table';
import { renderDefault } from '../../paginatable-data-table/helpers';

type Props = { cart: TCart };

const CartDetailsItems: FC<Props> = ({ cart }) => {
  const intl = useIntl();

  const { dataLocale } = useApplicationContext((context) => ({
    dataLocale: context.dataLocale ?? '',
  }));

  const { data } = useCurrencies(dataLocale);

  const currencySymbol = getSymbolFromCurrency(
    cart.totalPrice.currencyCode,
    data
  );

  const getUrlToLineItemDetails = (lineItem: TLineItem | TCustomLineItem) => {
    if ('money' in lineItem) {
      return cart.id + '/customlineitem/' + lineItem.id;
    } else {
      return cart.id + '/lineitem/' + lineItem.id;
    }
  };

  const itemRenderer: TDataTableProps<
    TLineItem | TCustomLineItem
  >['itemRenderer'] = (item, column) => {
    switch (column.key) {
      case 'name': {
        const to = getUrlToLineItemDetails(item);
        return (
          <Link to={to}>
            <CartItemTableProductCell lineItem={item} />
          </Link>
        );
      }
      case 'inventory': {
        return (
          <CartItemTableInventoryCell
            lineItem={item}
            inventoryMode={cart.inventoryMode}
            storeId={cart.store?.id}
          />
        );
      }
      case 'price':
        // unit price, only visible when tax is NOT included in price
        return <CartItemTableUnitPriceCell lineItem={item} />;
      case 'grossPrice':
        // original unit price, only visible when tax is included in price
        return <CartItemTableUnitGrossPriceCell lineItem={item} />;
      case 'netPrice':
        // unit price, only visible when tax is included in price
        return <CartItemTableUnitNetPriceCell lineItem={item} />;
      case 'quantity':
        return item.quantity;
      case 'taxRate':
        return (
          <CartItemTableTaxRateCell
            currencySymbol={currencySymbol}
            lineItem={item}
            shipping={cart.shipping}
          />
        );
      case 'subtotalPrice':
        return (
          <CartItemTableSubtotalPriceCell
            directDiscounts={cart.directDiscounts}
            lineItem={item}
          />
        );
      case 'totalPrice':
        return (
          <CartItemTableTotalPriceCell
            directDiscounts={cart.directDiscounts}
            lineItem={item}
          />
        );
      default:
        return renderDefault(
          item[column.key as keyof (TLineItem | TCustomLineItem)]
        );
    }
  };

  return (
    <PaginatableDataTable<TLineItem | TCustomLineItem>
      columns={[
        ...createSelectedColumnsDefinition({
          intl: intl,
          currencySymbol: currencySymbol,
          isTaxIncludedInPrice: determineIfTaxIncludedInPrice(cart),
          inventoryMode: cart.inventoryMode,
          isTaxRateSameInMultiMode: determinteIfTaxRateSameInMultiMode(cart),
        }),
      ]}
      visibleColumns={createSelectedColumnsDefinition({
        intl: intl,
        inventoryMode: cart.inventoryMode,
      })}
      rows={cart.lineItems}
      itemRenderer={itemRenderer}
      footer={
        <Spacings.Stack
          alignItems="flexEnd"
          data-testid="order-totals-last-row"
        >
          <Text.Body fontWeight={'bold'}>
            <Spacings.Inline>
              <span>
                <FormattedMessage {...messages.totalLabel} />
              </span>
              <span>
                {formatMoney(
                  cart.shippingMode === SHIPPING_MODES.MULTIPLE
                    ? getGrossPriceWithoutShippingMulti(cart)
                    : getGrossPriceWithoutShipping(cart),
                  intl
                )}
              </span>
            </Spacings.Inline>
          </Text.Body>
        </Spacings.Stack>
      }
    />
  );
};

export default CartDetailsItems;

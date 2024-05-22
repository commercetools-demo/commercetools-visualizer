import { NO_VALUE_FALLBACK } from '@commercetools-frontend/constants';

import messages from '../cart-item-table-product-discount/messages';
import { FC } from 'react';
import {
  TCustomLineItem,
  TDirectDiscount,
  TLineItem,
} from '../../../../types/generated/ctp';
import { getNetUnitPrice } from '../../../../prices';
import {
  getTotalCartDiscount,
  isTaxIncludedInPrice,
  isTaxRateSameInMultiMode,
} from '../../cart-summary-pricing-breakdown/order-prices';
import { formatMoney, isCustomLineItem, isLineItem } from '../../../../helpers';
import Text from '@commercetools-uikit/text';
import { useIntl } from 'react-intl';
import CartItemTableCartDiscount from '../cart-item-table-cart-discount';

interface Props {
  lineItem: TLineItem | TCustomLineItem;
  directDiscounts?: Array<TDirectDiscount>;
}

export const CartItemTableSubtotalPriceCell: FC<Props> = ({
  lineItem,
  directDiscounts,
}) => {
  const intl = useIntl();
  if (isLineItem(lineItem) && lineItem.lineItemMode === 'GiftLineItem') {
    return <Text.Body intlMessage={messages.freeGift} />;
  }

  if (isCustomLineItem(lineItem)) {
    const totalLineItemDiscount = getTotalCartDiscount([lineItem]);
    const netTotal = lineItem.taxedPrice
      ? lineItem.taxedPrice.totalNet
      : lineItem.totalPrice;

    const unitPriceCentAmount = netTotal.centAmount / lineItem.quantity;

    const totalPriceCentAmount = netTotal.centAmount - totalLineItemDiscount;

    if (lineItem?.perMethodTaxRate?.length > 0) {
      if (isTaxRateSameInMultiMode(lineItem)) {
        return isTaxIncludedInPrice(lineItem) ? (
          <>{formatMoney(netTotal, intl)}</>
        ) : (
          <CartItemTableCartDiscount
            directDiscounts={directDiscounts}
            lineItem={lineItem}
            totalPrice={{
              ...netTotal,
              centAmount: totalPriceCentAmount,
            }}
            unitPrice={{
              ...netTotal,
              centAmount: unitPriceCentAmount,
            }}
          />
        );
      } else {
        return <>{NO_VALUE_FALLBACK}</>;
      }
    }

    // if tax IS NOT included in price, show cart discounts in the
    // subtotal column, if included, show total net without discounts
    return isTaxIncludedInPrice(lineItem) ? (
      <>{formatMoney(netTotal, intl)}</>
    ) : (
      <CartItemTableCartDiscount
        directDiscounts={directDiscounts}
        lineItem={lineItem}
        totalPrice={{
          ...netTotal,
          centAmount: totalPriceCentAmount,
        }}
        unitPrice={{
          ...netTotal,
          centAmount: unitPriceCentAmount,
        }}
      />
    );
  }

  const selectedNetPrice = getNetUnitPrice({
    lineItem: lineItem,
    shouldRoundAmount: false,
  });

  // get the total net without discounts
  const netTotal = {
    ...lineItem.price.value,
    centAmount:
      selectedNetPrice.centAmount &&
      Math.round(selectedNetPrice.centAmount * lineItem.quantity),
    // items of type "highPrecision" may not have a centAmount but a preciseAmount instead
    preciseAmount:
      selectedNetPrice.preciseAmount &&
      Math.round(selectedNetPrice.preciseAmount * lineItem.quantity),
  };

  // if tax IS NOT included in price, show cart discounts in the
  // subtotal column, if included, show total net without discounts

  // when shipping is multi mode
  if (lineItem?.perMethodTaxRate?.length > 0) {
    if (isTaxRateSameInMultiMode(lineItem)) {
      return isTaxIncludedInPrice(lineItem) ? (
        <>{formatMoney(netTotal, intl)}</>
      ) : (
        <CartItemTableCartDiscount
          data-testid="line-item-subtotal-price"
          directDiscounts={directDiscounts}
          lineItem={lineItem}
          totalPrice={
            lineItem.taxedPrice
              ? lineItem.taxedPrice.totalNet
              : lineItem.totalPrice
          }
          unitPrice={selectedNetPrice}
        />
      );
    } else {
      return <>{NO_VALUE_FALLBACK}</>;
    }
  }

  // when shipping is single mode
  return isTaxIncludedInPrice(lineItem) ? (
    <>{formatMoney(netTotal, intl)}</>
  ) : (
    <CartItemTableCartDiscount
      data-testid="line-item-subtotal-price"
      directDiscounts={directDiscounts}
      lineItem={lineItem}
      totalPrice={
        lineItem.taxedPrice ? lineItem.taxedPrice.totalNet : lineItem.totalPrice
      }
      unitPrice={selectedNetPrice}
    />
  );
};
export default CartItemTableSubtotalPriceCell;

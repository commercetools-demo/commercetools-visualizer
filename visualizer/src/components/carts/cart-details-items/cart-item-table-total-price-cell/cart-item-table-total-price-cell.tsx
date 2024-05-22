import { useIntl } from 'react-intl';

import CartItemTableCartDiscount from '../cart-item-table-cart-discount';
import messages from '../cart-item-table-product-discount/messages';
import Text from '@commercetools-uikit/text';
import { FC } from 'react';
import {
  getTotalCartDiscount,
  isTaxIncludedInPrice,
} from '../../cart-summary-pricing-breakdown/order-prices';
import { formatMoney, isCustomLineItem, isLineItem } from '../../../../helpers';
import { getSelectedPrice } from '../../../../prices';
import {
  TCustomLineItem,
  TDirectDiscount,
  TLineItem,
} from '../../../../types/generated/ctp';
import { DISCOUNT_VALUE_TYPES } from '../../../../constants';

interface Props {
  lineItem: TLineItem | TCustomLineItem;
  directDiscounts?: Array<TDirectDiscount>;
}

export const CartItemTableTotalPriceCell: FC<Props> = ({
  lineItem,
  directDiscounts,
}) => {
  const intl = useIntl();
  if (isLineItem(lineItem) && lineItem.lineItemMode === 'GiftLineItem') {
    return <Text.Body intlMessage={messages.freeGift} />;
  }
  // if tax IS included in price, show cart discounts in the
  // gross total column, if NOT included show gross total
  const grossTotal = lineItem.taxedPrice
    ? lineItem.taxedPrice.totalGross
    : lineItem.totalPrice;
  if (isCustomLineItem(lineItem)) {
    const doesItemHaveDirectDiscount = (lineItem: TCustomLineItem) =>
      lineItem.discountedPricePerQuantity?.some((discounted) =>
        discounted.discountedPrice?.includedDiscounts?.some(
          (includedDiscount) =>
            includedDiscount.discountRef?.typeId === DISCOUNT_VALUE_TYPES.DIRECT
        )
      );

    const totalDiscount = doesItemHaveDirectDiscount(lineItem)
      ? 0 // the quoteDiscount is already calculated inside the taxed and totalPrice so we don't need to subtract it again
      : getTotalCartDiscount([lineItem]);
    return isTaxIncludedInPrice(lineItem) ? (
      <CartItemTableCartDiscount
        directDiscounts={directDiscounts}
        lineItem={lineItem}
        totalPrice={{
          ...grossTotal,
          currencyCode: grossTotal?.currencyCode || 'EUR',
          fractionDigits: grossTotal?.fractionDigits || 2,
          type: grossTotal?.type || '',
          centAmount: (grossTotal?.centAmount || 0) - totalDiscount,
        }}
        unitPrice={lineItem.money}
      />
    ) : (
      <>{formatMoney(grossTotal, intl)}</>
    );
  }

  return isTaxIncludedInPrice(lineItem) ? (
    <CartItemTableCartDiscount
      directDiscounts={directDiscounts}
      lineItem={lineItem}
      totalPrice={grossTotal}
      unitPrice={getSelectedPrice(lineItem.price).value}
    />
  ) : (
    <>{formatMoney(grossTotal, intl)}</>
  );
};

export default CartItemTableTotalPriceCell;

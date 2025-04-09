import { NO_VALUE_FALLBACK } from '@commercetools-frontend/constants';
import { FC } from 'react';
import { isTaxRateSameInMultiMode } from 'commercetools-demo-shared-cart-summary-pricing-breakdown';
import { formatMoney } from '../../../../helpers';
import Text from '@commercetools-uikit/text';
import messages from '../cart-item-table-product-discount/messages';
import { TCustomLineItem, TLineItem } from '../../../../types/generated/ctp';
import { useIntl } from 'react-intl';
import { getNetUnitPrice } from '../../../../prices';

interface Props {
  lineItem: TLineItem | TCustomLineItem;
}

export const CartItemTableUnitNetPriceCell: FC<Props> = ({ lineItem }) => {
  const intl = useIntl();
  if ('lineItemMode' in lineItem && lineItem.lineItemMode === 'GiftLineItem') {
    return <Text.Body intlMessage={messages.freeGift} />;
  }

  if ('money' in lineItem) {
    // The net unit price is the total net divided by the quantity
    const netPrice = lineItem.taxedPrice
      ? lineItem.taxedPrice.totalNet.centAmount
      : lineItem.totalPrice.centAmount;

    if (lineItem?.perMethodTaxRate?.length > 0) {
      return (
        <div data-testid="line-item-net-price">
          {isTaxRateSameInMultiMode(lineItem)
            ? formatMoney(
                {
                  ...lineItem.money,
                  centAmount: netPrice / lineItem.quantity,
                },
                intl
              )
            : NO_VALUE_FALLBACK}
        </div>
      );
    }

    return (
      <div data-testid="line-item-net-price">
        {formatMoney(
          {
            ...lineItem.money,
            centAmount: netPrice / lineItem.quantity,
          },
          intl
        )}
      </div>
    );
  }

  // When shipping is multi mode
  if (lineItem?.perMethodTaxRate?.length > 0) {
    return (
      <div data-testid="line-item-net-price">
        {isTaxRateSameInMultiMode(lineItem)
          ? formatMoney(
              getNetUnitPrice({
                lineItem: lineItem,
                shouldRoundAmount: true,
              }),
              intl
            )
          : NO_VALUE_FALLBACK}
      </div>
    );
  }

  // when shipping is single mode
  return (
    <div data-testid="line-item-net-price">
      {formatMoney(
        getNetUnitPrice({
          lineItem: lineItem,
          shouldRoundAmount: true,
        }),
        intl
      )}
    </div>
  );
};

export default CartItemTableUnitNetPriceCell;

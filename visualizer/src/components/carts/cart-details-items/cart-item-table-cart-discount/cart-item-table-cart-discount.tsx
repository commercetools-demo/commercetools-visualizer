import { FormattedMessage, useIntl } from 'react-intl';
import messages from './messages';
import styles from './cart-item-table-cart-discount.module.css';
import { getTotalCartDiscount } from '../../cart-summary-pricing-breakdown/order-prices';
import { formatMoney } from '../../../../helpers';
import Spacings from '@commercetools-uikit/spacings';
import { FC } from 'react';
import {
  TBaseMoney,
  TCustomLineItem,
  TDirectDiscount,
  TLineItem,
} from '../../../../types/generated/ctp';

interface Props {
  lineItem: TLineItem | TCustomLineItem;
  unitPrice: {
    currencyCode: string;
    centAmount?: number;
    fractionDigits?: number;
    preciseAmount?: number;
  };
  totalPrice?: TBaseMoney | null;
  hasQuoteDirectDiscount?: boolean;
  isItemLevelDiscount?: boolean;
  directDiscounts?: Array<TDirectDiscount>;
}

export const CartItemTableCartDiscount: FC<Props> = (props) => {
  const intl = useIntl();
  const totalDiscount = getTotalCartDiscount([props.lineItem]);
  const price = formatMoney(
    {
      currencyCode: 'EUR',
      fractionDigits: 2,
      type: '',
      ...props.lineItem.totalPrice,
      centAmount: Math.round(
        ((props.unitPrice.centAmount || props.unitPrice.preciseAmount || 0) /
          10 ** (props.unitPrice.fractionDigits || 1)) *
          props.lineItem.quantity *
          10 ** (props.lineItem.totalPrice?.fractionDigits || 1)
      ),
    },
    intl
  );

  const getMessageKey = () => {
    if (!props.directDiscounts?.length) return 'cartDiscount';

    return 'lineItemDiscount';
  };

  return props.lineItem.discountedPricePerQuantity.length > 0 ? (
    <Spacings.Stack scale="xs">
      <span className={styles['regular-price-block']}>
        <FormattedMessage {...messages.wasPrice} values={{ price }} />
      </span>
      <span className={styles['discounted-price']}>
        {formatMoney(props.totalPrice, intl)}
      </span>
      <div className={styles['cart-discount-text']}>
        <FormattedMessage
          {...messages[getMessageKey()]}
          values={{
            discount: formatMoney(
              {
                currencyCode: 'EUR',
                fractionDigits: 2,
                type: '',
                ...props.lineItem.totalPrice,
                centAmount: totalDiscount,
              },
              intl
            ),
          }}
        />
      </div>
    </Spacings.Stack>
  ) : (
    <>{formatMoney(props.totalPrice, intl)}</>
  );
};

CartItemTableCartDiscount.displayName = 'OrderItemTableCartDiscount';

export default CartItemTableCartDiscount;

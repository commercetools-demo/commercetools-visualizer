import { FC } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';

import messages from './messages';
import styles from './cart-item-table-product-discount.module.css';
import Spacings from '@commercetools-uikit/spacings';
import { getDiscountValue, getSelectedPrice } from '../../../../prices';
import { TLineItem } from '../../../../types/generated/ctp';
import { formatMoney } from '../../../../helpers';

interface Props {
  lineItem: TLineItem;
}

const CartItemTableProductDiscount: FC<Props> = (props) => {
  const intl = useIntl();
  const { price } = props.lineItem;
  const selectedPrice = getSelectedPrice(price);

  return price.discounted ? (
    <Spacings.Stack scale="xs">
      {/*{...filterDataAttributes(props)}>*/}
      <span className={styles['regular-price-block']}>
        <FormattedMessage
          {...messages.wasPrice}
          values={{
            price: formatMoney(price.value, intl),
          }}
        />
      </span>
      <span className={styles['discounted-price']}>
        {formatMoney(selectedPrice.value, intl)}
      </span>
      <div className={styles['discount-text']}>
        <FormattedMessage
          {...messages.productDiscount}
          values={{
            discount: formatMoney(getDiscountValue(price), intl),
          }}
        />
      </div>
    </Spacings.Stack>
  ) : (
    <>{formatMoney(selectedPrice.value, intl)}</>
  );
};

export default CartItemTableProductDiscount;

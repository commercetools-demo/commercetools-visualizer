import { FC } from 'react';
import { isTaxIncludedInPrice } from 'commercetools-demo-shared-cart-summary-pricing-breakdown';
import { formatMoney } from '../../../../helpers';
import Text from '@commercetools-uikit/text';
import messages from '../cart-item-table-product-discount/messages';
import CartItemTableProductDiscount from '../cart-item-table-product-discount';
import { TCustomLineItem, TLineItem } from '../../../../types/generated/ctp';
import { useIntl } from 'react-intl';

interface Props {
  lineItem: TLineItem | TCustomLineItem;
}

export const CartItemTableUnitGrossPriceCell: FC<Props> = ({ lineItem }) => {
  const intl = useIntl();
  if ('lineItemMode' in lineItem && lineItem.lineItemMode === 'GiftLineItem') {
    return <Text.Body intlMessage={messages.freeGift} />;
  }

  if ('money' in lineItem) {
    return <>{formatMoney(lineItem.money, intl)}</>;
  }
  return isTaxIncludedInPrice(lineItem) ? (
    <CartItemTableProductDiscount lineItem={lineItem} />
  ) : (
    <> NO_VALUE_FALLBACK</>
  );
};

export default CartItemTableUnitGrossPriceCell;

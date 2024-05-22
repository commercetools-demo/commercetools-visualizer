import { useIntl } from 'react-intl';

import CartItemTableProductDiscount from '../cart-item-table-product-discount';
import messages from '../cart-item-table-product-discount/messages';
import { formatMoney } from '../../../../helpers';
import Spacings from '@commercetools-uikit/spacings';
import Text from '@commercetools-uikit/text';
import { FC } from 'react';
import { TCustomLineItem, TLineItem } from '../../../../types/generated/ctp';
import { formatLocalizedString } from '@commercetools-frontend/l10n';
import { useApplicationContext } from '@commercetools-frontend/application-shell-connectors';

interface Props {
  lineItem: TLineItem | TCustomLineItem;
}

export const CartItemTableUnitPriceCell: FC<Props> = ({ lineItem }) => {
  const { dataLocale, projectLanguages } = useApplicationContext((context) => ({
    dataLocale: context.dataLocale ?? '',
    projectLanguages: context.project?.languages ?? [],
  }));
  const intl = useIntl();
  if ('lineItemMode' in lineItem && lineItem.lineItemMode === 'GiftLineItem') {
    return <Text.Body intlMessage={messages.freeGift} />;
  }

  return 'money' in lineItem ? (
    <>{formatMoney(lineItem.money, intl)}</>
  ) : (
    <Spacings.Stack scale="xs">
      <span>
        <CartItemTableProductDiscount
          data-testid="line-item-price"
          lineItem={lineItem}
        />
      </span>
      {lineItem.distributionChannel && (
        <Text.Detail tone={'secondary'}>
          {formatLocalizedString(lineItem.distributionChannel, {
            key: 'name',
            locale: dataLocale,
            fallback: lineItem.distributionChannel.key,
            fallbackOrder: projectLanguages,
          })}
        </Text.Detail>
      )}
    </Spacings.Stack>
  );
};

CartItemTableUnitPriceCell.displayName = 'OrderItemTableUnitPriceCell';

export default CartItemTableUnitPriceCell;

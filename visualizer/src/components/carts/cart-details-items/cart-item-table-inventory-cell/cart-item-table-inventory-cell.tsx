import messages from './messages';
import { FC } from 'react';
import Text from '@commercetools-uikit/text';
import { TCustomLineItem, TLineItem } from '../../../../types/generated/ctp';

interface CartItemTableInventoryCellProps {
  lineItem: TLineItem | TCustomLineItem;
  inventoryMode?: string;
  storeId?: string;
}

const CartItemTableInventoryCell: FC<CartItemTableInventoryCellProps> = ({
  lineItem,
}) => {
  if ('money' in lineItem)
    return (
      <Text.Body
        intlMessage={messages.inventoryCantBeDefined}
        tone="secondary"
      />
    );

  if (!lineItem.supplyChannel)
    return <Text.Body intlMessage={messages.inventoryWithNoChannel} />;

  return <Text.Body>{lineItem.supplyChannel.key}</Text.Body>;
};

export default CartItemTableInventoryCell;

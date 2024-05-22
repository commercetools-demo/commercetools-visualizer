import {
  TCart,
  TCustomLineItem,
  TLineItem,
} from '../../../types/generated/ctp';
import { FC, useState } from 'react';
import DataTable, { TColumn } from '@commercetools-uikit/data-table';
import DataTableManager, {
  UPDATE_ACTIONS,
} from '@commercetools-uikit/data-table-manager';
import createSelectedColumnsDefinition from './column-definitions';
import { CartItemTableProductCell } from './cart-item-table-product-cell/cart-item-table-product-cell';
import { Link } from 'react-router-dom';
import Spacings from '@commercetools-uikit/spacings';
import Text from '@commercetools-uikit/text';
import { FormattedMessage, useIntl } from 'react-intl';
import { formatMoney } from '../../../helpers';
import { SHIPPING_MODES } from '../addresses-panel/addresses-panel';
import {
  getGrossPriceWithoutShipping,
  getGrossPriceWithoutShippingMulti,
} from '../cart-summary-pricing-breakdown/order-prices';
import messages from './messages';

type Props = { cart: TCart };

const CartDetailsItems: FC<Props> = ({ cart }) => {
  const intl = useIntl();
  const [isCondensed, setIsCondensed] = useState<boolean>(true);
  const [isWrappingText, setIsWrappingText] = useState<boolean>(false);
  const [tableData, setTableData] = useState({
    columns: [...createSelectedColumnsDefinition()],
    visibleColumns: createSelectedColumnsDefinition(),
    visibleColumnKeys: createSelectedColumnsDefinition().map(
      (column) => column.key
    ),
  });

  const getUrlToLineItemDetails = (lineItem: TLineItem | TCustomLineItem) => {
    if ('money' in lineItem) {
      return cart.id + '/customlineitem/' + lineItem.id;
    } else {
      return cart.id + '/lineitem/' + lineItem.id;
    }
  };

  const itemRenderer = (
    lineItem: TLineItem | TCustomLineItem,
    column: TColumn<TLineItem | TCustomLineItem>
  ) => {
    switch (column.key) {
      case 'name': {
        const to = getUrlToLineItemDetails(lineItem);
        return (
          <Link to={to}>
            <CartItemTableProductCell lineItem={lineItem} />
          </Link>
        );
      }
      default:
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return (lineItem as any)[column.key] || '';
    }
  };

  const columnManager = {
    disableColumnManager: false,
    hideableColumns: tableData.columns,
    visibleColumnKeys: tableData.visibleColumnKeys,
  };

  const onSettingChange = (action: string, nextValue: boolean | string[]) => {
    const {
      COLUMNS_UPDATE,
      IS_TABLE_CONDENSED_UPDATE,
      IS_TABLE_WRAPPING_TEXT_UPDATE,
    } = UPDATE_ACTIONS;

    switch (action) {
      case IS_TABLE_CONDENSED_UPDATE: {
        setIsCondensed(nextValue as boolean);
        break;
      }
      case IS_TABLE_WRAPPING_TEXT_UPDATE: {
        setIsWrappingText(nextValue as boolean);
        break;
      }
      case COLUMNS_UPDATE: {
        if (Array.isArray(nextValue)) {
          Array.isArray(nextValue) &&
            setTableData({
              ...tableData,
              visibleColumns: tableData.columns.filter((column) =>
                nextValue.includes(column.key)
              ),
              visibleColumnKeys: nextValue,
            });
        }
        break;
      }
    }
  };

  return (
    <>
      <DataTableManager
        columns={tableData.visibleColumns}
        columnManager={columnManager}
        onSettingsChange={onSettingChange}
        displaySettings={{
          isWrappingText,
          isCondensed,
          disableDisplaySettings: false,
        }}
      >
        <DataTable
          isCondensed
          columns={tableData.visibleColumns}
          rows={cart.lineItems}
          itemRenderer={itemRenderer}
          footer={
            <Spacings.Stack
              alignItems="flexEnd"
              data-testid="order-totals-last-row"
            >
              <Text.Body isBold>
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
      </DataTableManager>
    </>
  );
};

export default CartDetailsItems;

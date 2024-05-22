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

type Props = { cart: TCart };

const CartDetailsItems: FC<Props> = ({ cart }) => {
  const [isCondensed, setIsCondensed] = useState<boolean>(true);
  const [isWrappingText, setIsWrappingText] = useState<boolean>(false);
  const [tableData, setTableData] = useState({
    columns: [...createSelectedColumnsDefinition()],
    visibleColumns: createSelectedColumnsDefinition(),
    visibleColumnKeys: createSelectedColumnsDefinition().map(
      (column) => column.key
    ),
  });

  const itemRenderer = (
    item: TLineItem | TCustomLineItem,
    column: TColumn<TLineItem | TCustomLineItem>
  ) => {
    switch (column.key) {
      case 'name':
        return <CartItemTableProductCell lineItem={item} />;
      default:
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return (item as any)[column.key] || '';
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
        />
      </DataTableManager>
    </>
  );
};

export default CartDetailsItems;

import DataTable, { TRow } from '@commercetools-uikit/data-table';
import Spacings from '@commercetools-uikit/spacings';
import {
  TColumn,
  TDataTableProps,
} from '@commercetools-uikit/data-table/dist/declarations/src/data-table';
import { TPaginationState } from '@commercetools-uikit/hooks';
import { Pagination } from '@commercetools-uikit/pagination';
import { useState } from 'react';
import DataTableManager, {
  UPDATE_ACTIONS,
} from '@commercetools-uikit/data-table-manager';
import {
  TColumnManagerProps,
  TDataTableManagerProps,
} from '@commercetools-uikit/data-table-manager/dist/declarations/src/types';

type Props<Row extends TRow = TRow> = {
  paginationState?: TPaginationState;
  totalItems?: number;
  visibleColumns: Array<TColumn<Row>>;
  disableColumnManager?: TColumnManagerProps['disableColumnManager'];
} & TDataTableProps<Row>;

export const PaginatableDataTable = <Row extends TRow = TRow>({
  paginationState,
  totalItems,
  visibleColumns,
  disableColumnManager,
  columns,
  ...props
}: Props<Row>) => {
  const [tableData, setTableData] = useState({
    columns: columns,
    visibleColumns: visibleColumns,
    visibleColumnKeys: visibleColumns.map((column) => column.key),
  });
  const [isCondensed, setIsCondensed] = useState<boolean>(true);
  const [isWrappingText, setIsWrappingText] = useState<boolean>(false);

  const columnManager: TColumnManagerProps = {
    disableColumnManager: disableColumnManager,
    hideableColumns: tableData.columns,
    visibleColumnKeys: tableData.visibleColumnKeys,
  };
  const onSettingChange: TDataTableManagerProps['onSettingsChange'] = (
    action,
    nextValue
  ) => {
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
    <Spacings.Stack scale="l">
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
        <DataTable<Row> {...props} columns={tableData.visibleColumns} />
      </DataTableManager>
      {paginationState && totalItems && (
        <Pagination
          page={paginationState.page.value}
          onPageChange={paginationState.page.onChange}
          perPage={paginationState.perPage.value}
          onPerPageChange={paginationState.perPage.onChange}
          totalItems={totalItems}
        />
      )}
    </Spacings.Stack>
  );
};

export default PaginatableDataTable;

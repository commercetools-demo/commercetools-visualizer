import memoize from 'memoize-one';
import messages from './messages';
import { FormattedMessage } from 'react-intl';
import { TColumn } from '@commercetools-uikit/data-table';

export const INVENTORY_MODES = {
  NONE: 'None',
};

const createSelectedColumnsDefinition = memoize(
  ({
    intl,
    currencySymbol,
    isTaxIncludedInPrice,
    inventoryMode,
    isTaxRateSameInMultiMode,
  }): Array<TColumn> => {
    const result: Array<TColumn> = [
      {
        key: 'name',
        label: <FormattedMessage {...messages.columnProduct} />,
      },
    ];
    if (inventoryMode !== INVENTORY_MODES.NONE) {
      result.push({
        key: 'inventory',
        label: intl?.formatMessage(messages.columnInventory),
      });
    }
    if (isTaxIncludedInPrice) {
      result.push({
        key: 'grossPrice',
        label: intl?.formatMessage(messages.columnGrossUnitPrice, {
          currencySymbol,
        }),
        align: 'right',
      });
    }
    if (isTaxIncludedInPrice && isTaxRateSameInMultiMode) {
      result.push({
        key: 'grossPrice',
        label: intl?.formatMessage(messages.columnGrossUnitPrice, {
          currencySymbol,
        }),
        align: 'right',
      });
    }

    if (!isTaxIncludedInPrice) {
      result.push({
        key: 'price',
        label: intl?.formatMessage(messages.columnNetUnitPrice, {
          currencySymbol,
        }),
        align: 'right',
      });
    }
    result.push({
      key: 'quantity',
      label: intl?.formatMessage(messages.columnQuantity),
      align: 'right',
    });
    result.push({
      key: 'state',
      label: intl?.formatMessage(messages.columnState),
    });

    if (isTaxRateSameInMultiMode) {
      result.push({
        key: 'subtotalPrice',
        label: intl?.formatMessage(messages.columnSubtotalPrice, {
          currencySymbol,
        }),
        align: 'right',
      });
    }
    result.push(
      {
        key: 'taxRate',
        label: intl?.formatMessage(messages.columnTax),
        align: 'right',
      },
      {
        key: 'totalPrice',
        label: intl?.formatMessage(messages.columnTotalPrice, {
          currencySymbol,
        }),
        align: 'right',
      }
    );
    return result;
  }
);

export default createSelectedColumnsDefinition;

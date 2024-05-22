import memoize from 'memoize-one';
import messages from './messages';
import { FormattedMessage } from 'react-intl';

export const INVENTORY_MODES = {
  NONE: 'None',
};

const createSelectedColumnsDefinition = memoize(() => {
  return [
    {
      key: 'name',
      label: <FormattedMessage {...messages.columnProduct} />,
      flexGrow: 1,
    },
    // inventoryMode !== INVENTORY_MODES.NONE && {
    //   key: 'inventory',
    //   label: intl?.formatMessage(messages.columnInventory),
    // },
    // isTaxIncludedInPrice && {
    //   key: 'grossPrice',
    //   label: intl?.formatMessage(messages.columnGrossUnitPrice, {
    //     currencySymbol,
    //   }),
    //   align: 'right',
    // },
    // isTaxIncludedInPrice &&
    //   isTaxRateSameInMultiMode && {
    //     key: 'netPrice',
    //     label: intl?.formatMessage(messages.columnNetUnitPrice, {
    //       currencySymbol,
    //     }),
    //     align: 'right',
    //   },
    // !isTaxIncludedInPrice && {
    //   key: 'price',
    //   label: intl?.formatMessage(messages.columnNetUnitPrice, {
    //     currencySymbol,
    //   }),
    //   align: 'right',
    // },
    // {
    //   key: 'quantity',
    //   label: intl?.formatMessage(messages.columnQuantity),
    //   align: 'right',
    // },
    // {
    //   key: 'state',
    //   label: intl?.formatMessage(messages.columnState),
    // },
    // isTaxRateSameInMultiMode && {
    //   key: 'subtotalPrice',
    //   label: intl?.formatMessage(messages.columnSubtotalPrice, {
    //     currencySymbol,
    //   }),
    //   align: 'right',
    // },
    // {
    //   key: 'taxRate',
    //   label: intl?.formatMessage(messages.columnTax),
    //   align: 'right',
    // },
    // {
    //   key: 'totalPrice',
    //   label: intl?.formatMessage(messages.columnTotalPrice, {
    //     currencySymbol,
    //   }),
    //   align: 'right',
    // },
  ].filter(Boolean);
});

export default createSelectedColumnsDefinition;

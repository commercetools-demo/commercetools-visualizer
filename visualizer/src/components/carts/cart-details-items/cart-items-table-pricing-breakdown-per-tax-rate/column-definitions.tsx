import memoize from 'memoize-one';
import messages from '../messages';

const createSelectedColumnsDefinition = memoize(
  (intl, currencySymbol, isTaxIncludedInPrice) =>
    [
      {
        key: 'country',
        label: intl.formatMessage(messages.columnCountry),
        flexGrow: 1,
      },
      {
        key: 'state',
        label: intl.formatMessage(messages.columnCountryState),
        flexGrow: 1,
      },
      isTaxIncludedInPrice && {
        key: 'netPrice',
        label: intl.formatMessage(messages.columnNetUnitPrice, {
          currencySymbol,
        }),
      },
      !isTaxIncludedInPrice && {
        key: 'price',
        label: intl.formatMessage(messages.columnNetUnitPrice, {
          currencySymbol,
        }),
      },
      {
        key: 'quantity',
        label: intl.formatMessage(messages.columnQuantity),
      },
      {
        key: 'subtotalPrice',
        label: intl.formatMessage(messages.columnSubtotalPrice, {
          currencySymbol,
        }),
      },
      {
        key: 'taxRate',
        label: intl.formatMessage(messages.columnTax),
      },
      {
        key: 'totalPrice',
        label: intl.formatMessage(messages.columnTotalPrice, {
          currencySymbol,
        }),
      },
    ].filter(Boolean)
);

export default createSelectedColumnsDefinition;
